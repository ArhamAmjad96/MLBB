import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, PointerEvent as ReactPointerEvent } from 'react';
import type { MatchEvent, MatchLiveState, SpectatorLayout, SpectatorOverlaySettings, SpecialEventType } from '../../../shared/types';
import { defaultLayout, EVENT_BOUNDS, normalizeSpectatorSettings, SCOREBOARD } from '../../../shared/overlayLayout';
import { SpectatorEvent, SpectatorHud } from '../overlays/SpectatorScene';
import { api } from '../services/api';
import '../overlays/spectator.css';

const kinds:SpecialEventType[]=['first_blood','double_kill','triple_kill','maniac','savage','shutdown','turtle_secured','lord_secured','lord_steal','tower_destroyed','victory','mvp'];
function NumberControl({label,value,min=0,max,onChange,step=1}:{label:string;value:number;min?:number;max:number;step?:number;onChange:(value:number)=>void}) {
  return <label className="spectator-number-row"><span>{label}</span><input aria-label={label} type="number" min={min} max={max} step={step} value={Math.round(value*100)/100} onChange={e=>{if(e.target.value!=='')onChange(Number(e.target.value));}}/></label>;
}
export function OverlaySettings({state}:{state:MatchLiveState}) {
  const [draft,setDraft]=useState(()=>normalizeSpectatorSettings(state.overlayControls.spectatorSettings));
  const [dirty,setDirty]=useState(false), [message,setMessage]=useState(''), [saving,setSaving]=useState(false);
  const [image,setImage]=useState<string|null>(null), [imageError,setImageError]=useState('');
  const [guides,setGuides]=useState(true),[width,setWidth]=useState(960);
  const [kind,setKind]=useState<SpecialEventType>('first_blood'),[team,setTeam]=useState<'blue'|'red'>('blue');
  const [animation,setAnimation]=useState<'still'|'playing'|'hidden'>('still'),[nonce,setNonce]=useState(0);
  const [presetName,setPresetName]=useState(''),[selectedPreset,setSelectedPreset]=useState('');
  const [goldEnabled,setGoldEnabled]=useState(!!draft.manualGold),[blueGold,setBlueGold]=useState(String(draft.manualGold?.blue ?? '')),[redGold,setRedGold]=useState(String(draft.manualGold?.red ?? ''));
  const canvas=useRef<HTMLDivElement>(null);
  const drag=useRef<{graphic:'scoreboard'|'event';x:number;y:number;startX:number;startY:number}|null>(null);
  const incoming=JSON.stringify(state.overlayControls.spectatorSettings);
  useEffect(()=>{if(!dirty){const saved=normalizeSpectatorSettings(incoming ? JSON.parse(incoming) : undefined);setDraft(saved);setGoldEnabled(!!saved.manualGold);setBlueGold(String(saved.manualGold?.blue ?? ''));setRedGold(String(saved.manualGold?.red ?? ''));}},[incoming,dirty]);
  useEffect(()=>{const element=canvas.current;if(!element)return;const resize=new ResizeObserver(entries=>setWidth(entries[0].contentRect.width));resize.observe(element);return()=>resize.disconnect();},[]);
  useEffect(()=>()=>{if(image)URL.revokeObjectURL(image);},[image]);
  const duration=Math.min(4,Math.max(2,state.overlayControls.eventHoldSeconds || 3));
  useEffect(()=>{if(animation!=='playing')return;const timer=setTimeout(()=>setAnimation('hidden'),duration*1000);return()=>clearTimeout(timer);},[animation,nonce,duration]);
  const layout=draft.layouts[draft.mode], zones=layout.safeZones;
  function change(update:(current:SpectatorOverlaySettings)=>SpectatorOverlaySettings){setDraft(current=>normalizeSpectatorSettings(update(current)));setDirty(true);setMessage('Unsaved local preview — apply when ready.');}
  function editLayout(update:(current:SpectatorLayout)=>SpectatorLayout){change(current=>({...current,layouts:{...current.layouts,[current.mode]:update(current.layouts[current.mode])}}));}
  function placement(graphic:'scoreboard'|'event',property:'x'|'y'|'scale',value:number){editLayout(current=>({...current,[graphic]:{...current[graphic],[property]:value}}));}
  async function save(next:SpectatorOverlaySettings=draft){
    if(goldEnabled && next.mode==='custom' && (!(Number(blueGold)>0)||!(Number(redGold)>0))){setMessage('Enter positive, verified gold totals for both teams or disable manual gold.');return;}
    const saved=normalizeSpectatorSettings({...next,manualGold:goldEnabled?{blue:Number(blueGold),red:Number(redGold)}:undefined});
    setSaving(true);try{await api.updateOverlayControls({spectatorSettings:saved});setDraft(saved);setDirty(false);setMessage('Saved — all connected browser sources updated.');}catch(e){setMessage(String(e));}finally{setSaving(false);}
  }
  function upload(e:ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>15*1024*1024){setImageError('Use a PNG, JPEG or WebP spectator screenshot below 15 MB.');return;}setImageError('');setImage(URL.createObjectURL(file));e.target.value='';}
  function startDrag(e:ReactPointerEvent<HTMLDivElement>,graphic:'scoreboard'|'event'){const p=layout[graphic];drag.current={graphic,x:p.x,y:p.y,startX:e.clientX,startY:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);}
  function moveDrag(e:ReactPointerEvent<HTMLDivElement>){const moving=drag.current;if(!moving)return;const factor=width/1920;editLayout(current=>({...current,[moving.graphic]:{...current[moving.graphic],x:moving.x+(e.clientX-moving.startX)/factor,y:moving.y+(e.clientY-moving.startY)/factor}}));}
  async function savePreset(){const name=presetName.trim();if(!name)return;const id=selectedPreset || crypto.randomUUID();const entry={id,name,mode:draft.mode,layout};const next={...draft,presets:[...draft.presets.filter(p=>p.id!==id),entry]};setSelectedPreset(id);await save(next);}
  async function visibility(key:'showHud'|'showFeed'){try{await api.updateOverlayControls({[key]:!state.overlayControls[key]});}catch(e){setMessage(String(e));}}
  async function copy(route:'hud'|'feed'){try{await navigator.clipboard.writeText(`${location.origin}/overlay/${route}`);setMessage(`${route.toUpperCase()} browser URL copied.`);}catch(e){setMessage(String(e));}}
  const previewSettings=normalizeSpectatorSettings({...draft,manualGold:goldEnabled?{blue:Number(blueGold),red:Number(redGold)}:undefined});
  const sample:MatchEvent={id:'layout-preview',matchId:state.id,game:state.game,team,type:'announcement',specialType:kind,headline:kind.replaceAll('_',' '),gameTimeSeconds:state.clockSeconds,realTimestamp:0};
  return <section className="spectator-editor" aria-label="Overlay settings">
    <h2>Overlay Settings · MLBB Spectator</h2><p>Hybrid preserves the native player panels and gold display. Drag the graphic handles over your spectator screenshot, then apply. Layouts and presets are saved across matches and restarts.</p>
    <div className="spectator-toolbar"><label>Mode<select aria-label="Overlay mode" value={draft.mode} onChange={e=>change(current=>({...current,mode:e.target.value==='custom'?'custom':'hybrid'}))}><option value="hybrid">Hybrid MLBB — native statistics</option><option value="custom">Full Custom — operator statistics</option></select></label><label className="spectator-upload">Upload spectator screenshot<input aria-label="Spectator screenshot" type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} style={{display:'block',marginTop:5,maxWidth:250}}/></label>{image && <button onClick={()=>setImage(null)}>Remove screenshot</button>}<label><input type="checkbox" checked={guides} onChange={e=>setGuides(e.target.checked)}/>Safe-zone guides</label><button onClick={()=>void copy('hud')}>Copy HUD URL</button><button onClick={()=>void copy('feed')}>Copy events URL</button></div>
    {imageError && <p role="alert">{imageError}</p>}
    <div className="spectator-canvas" ref={canvas}>
      <div className="spectator-editor-world" style={{transform:`scale(${width/1920})`}}>
        {image && <img className="spectator-screenshot" src={image} alt="Uploaded spectator screenshot (local preview only)"/>}
        <SpectatorHud state={state} settings={previewSettings} forceVisible/>
        {animation!=='hidden' && <div className={animation==='still'?'editor-event-still':''}><SpectatorEvent state={state} settings={previewSettings} event={sample} entryKey={`preview-${nonce}`} duration={duration}/></div>}
        {guides && <>
          {zones.left>0 && <div className="native-guide side" style={{left:0,top:0,width:zones.left,height:1080}}><span>NATIVE LEFT UI</span></div>}
          {zones.right>0 && <div className="native-guide side" style={{right:0,top:0,width:zones.right,height:1080}}><span>NATIVE RIGHT UI</span></div>}
          {zones.top>0 && <div className="native-guide" style={{left:zones.left,right:zones.right,top:0,height:zones.top}}><span>NATIVE TOP SCOREBOARD</span></div>}
          {zones.bottom>0 && <div className="native-guide" style={{left:zones.left,right:zones.right,bottom:0,height:zones.bottom}}><span>NATIVE BOTTOM UI</span></div>}
          {(['scoreboard','event'] as const).map(graphic=>{const p=layout[graphic],bounds=graphic==='scoreboard'?SCOREBOARD:EVENT_BOUNDS;return <div key={graphic} aria-label={`Drag ${graphic}`} className={`graphic-drag-handle ${graphic==='event'?'event-handle':''}`} style={{left:p.x,top:p.y,width:bounds.width*p.scale,height:bounds.height*p.scale}} onPointerDown={e=>startDrag(e,graphic)} onPointerMove={moveDrag} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}><span>{graphic.toUpperCase()} · DRAG TO POSITION</span></div>;})}
        </>}
        <div className="spectator-preview-note">LOCAL ALIGNMENT PREVIEW · 1920 × 1080{!image && <><br/>Upload your native spectator screenshot to calibrate these boundaries.</>}</div>
      </div>
    </div>
    <div className="spectator-toolbar"><label>Event<select aria-label="Preview event type" value={kind} onChange={e=>{setKind(e.target.value as SpecialEventType);setAnimation('still');}}>{kinds.map(value=><option value={value} key={value}>{value.replaceAll('_',' ').toUpperCase()}</option>)}</select></label><label>Team<select aria-label="Preview event team" value={team} onChange={e=>setTeam(e.target.value as 'blue'|'red')}><option value="blue">{state.teamBlue.name}</option><option value="red">{state.teamRed.name}</option></select></label><button onClick={()=>{setNonce(n=>n+1);setAnimation('playing');}}>Replay local animation</button><button onClick={()=>setAnimation('hidden')}>Clear local animation</button><button onClick={()=>void visibility('showHud')}>Scoreboard: {state.overlayControls.showHud?'On air':'Hidden'}</button><button onClick={()=>void visibility('showFeed')}>Events: {state.overlayControls.showFeed?'On air':'Hidden'}</button></div>
    <div className="spectator-controls">
      {(['scoreboard','event'] as const).map(graphic=><fieldset key={graphic}><legend>{graphic==='scoreboard'?'Scoreboard position':'Event banner position'}</legend><NumberControl label={`${graphic} X`} value={layout[graphic].x} max={1920} onChange={value=>placement(graphic,'x',value)}/><NumberControl label={`${graphic} Y`} value={layout[graphic].y} max={1080} onChange={value=>placement(graphic,'y',value)}/><NumberControl label={`${graphic} scale`} value={layout[graphic].scale} min={.35} max={1.5} step={.05} onChange={value=>placement(graphic,'scale',value)}/></fieldset>)}
      <fieldset><legend>Native UI reserved margins (pixels)</legend>{(['left','right','top','bottom'] as const).map(edge=><NumberControl key={edge} label={`${edge} safe zone`} value={zones[edge]} max={edge==='top'?600:edge==='bottom'?300:800} onChange={value=>editLayout(current=>({...current,safeZones:{...current.safeZones,[edge]:value}}))}/>)}</fieldset>
    </div>
    <div className="spectator-toolbar"><label>Round (optional)<input aria-label="Tournament round" maxLength={80} placeholder="e.g. Upper bracket final" value={draft.round} onChange={e=>change(current=>({...current,round:e.target.value}))}/></label></div>
    <div className="spectator-flags">{([{key:'showKills',label:'Tracked kills'},{key:'showClock',label:'Operator clock'},{key:'showObjectives',label:'Tracked objectives'}] as const).map(flag=><label key={flag.key}><input type="checkbox" checked={draft[flag.key]} onChange={e=>change(current=>({...current,[flag.key]:e.target.checked}))}/>{flag.label} (optional)</label>)}{draft.mode==='custom' && <label><input type="checkbox" checked={draft.showPlayerPanels} onChange={e=>change(current=>({...current,showPlayerPanels:e.target.checked}))}/>Custom player panels (requires entered KDA)</label>}</div>
    {draft.mode==='custom' && <><label><input type="checkbox" checked={goldEnabled} onChange={e=>{setGoldEnabled(e.target.checked);setDirty(true);}}/> Show verified manual gold only</label>{goldEnabled && <div className="spectator-toolbar"><label>{state.teamBlue.shortCode} gold<input aria-label="Verified blue gold" type="number" min={1} value={blueGold} onChange={e=>{setBlueGold(e.target.value);change(current=>({...current,manualGold:{blue:Number(e.target.value),red:Number(redGold)}}));}}/></label><label>{state.teamRed.shortCode} gold<input aria-label="Verified red gold" type="number" min={1} value={redGold} onChange={e=>{setRedGold(e.target.value);change(current=>({...current,manualGold:{blue:Number(blueGold),red:Number(e.target.value)}}));}}/></label></div>}</>}
    <p>Graphics are constrained to the clear area. Gold is always omitted in Hybrid. Use a 16:9 screenshot cropped to the game feed. Screenshot files stay in this browser and are not uploaded or saved to the server. Draft graphics are unaffected.</p>
    <div className="spectator-toolbar"><button className="primary" disabled={saving} onClick={()=>void save()}>Apply overlay settings</button><button onClick={()=>editLayout(()=>defaultLayout(draft.mode))}>Reset layout to defaults</button><button onClick={()=>{setDirty(false);setDraft(normalizeSpectatorSettings(state.overlayControls.spectatorSettings));setMessage('Reloaded saved settings.');}}>Reload saved settings</button><select aria-label="Saved layout preset" value={selectedPreset} onChange={e=>{const preset=draft.presets.find(p=>p.id===e.target.value);setSelectedPreset(e.target.value);setPresetName(preset?.name || '');if(preset)change(current=>({...current,mode:preset.mode,layouts:{...current.layouts,[preset.mode]:preset.layout}}));}}><option value="">New preset</option>{draft.presets.map(p=><option value={p.id} key={p.id}>{p.name} · {p.mode}</option>)}</select><input aria-label="Preset name" maxLength={50} placeholder="Preset name" value={presetName} onChange={e=>setPresetName(e.target.value)}/><button disabled={saving || !presetName.trim() || (!selectedPreset && draft.presets.length>=12)} onClick={()=>void savePreset()}>Save preset & apply</button></div>
    <div className="spectator-editor-status" role="status">{message || (dirty?'Unsaved local preview.':'Saved layout loaded. Hybrid margins are a starting point; calibrate against your feed.')}</div>
  </section>;
}
