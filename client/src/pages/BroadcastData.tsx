import { useEffect, useState } from 'react';
import type { HeroDefinition, MatchLiveState } from '../../../shared/types';
import { api } from '../services/api';

export function BroadcastData({state}:{state:MatchLiveState}) {
  const [heroes,setHeroes]=useState<HeroDefinition[]>([]);
  const [status,setStatus]=useState('');
  useEffect(()=>{let active=true;api.getHeroes(state.game).then(data=>{if(active)setHeroes(data);}).catch(()=>{if(active)setStatus('Could not load heroes');});return()=>{active=false;};},[state.game]);
  async function save(form:HTMLFormElement) {
    const values=new FormData(form);
    const draftStats=Array.from({length:5},(_,i)=>{
      const hero=heroes.find(h=>h.id===values.get(`hero-${i}`));
      if(!hero)return null;
      const rate=String(values.get(`rate-${i}`)||'');
      return {heroName:hero.name,avatar:hero.avatar,picks:Number(values.get(`picks-${i}`)||0),...(rate===''?{}:{winRate:Number(rate)})};
    }).filter((row):row is NonNullable<typeof row>=>row!==null);
    const hudPlayers={blue:[],red:[]} as NonNullable<MatchLiveState['overlayControls']['hudPlayers']>;
    for(const side of ['blue','red'] as const)hudPlayers[side]=Array.from({length:5},(_,i)=>{
      const level=String(values.get(`${side}-level-${i}`)||'');
      const spells=[String(values.get(`${side}-spell1-${i}`)||''),String(values.get(`${side}-spell2-${i}`)||'')].filter(Boolean);
      return {kda:String(values.get(`${side}-kda-${i}`)||''),...(level?{level:Number(level)}:{}),spells};
    });
    try{await api.updateOverlayControls({draftStats,hudPlayers,draftStageLabel:String(values.get('stage')||'GROUP STAGE')});setStatus('Broadcast data saved');}catch(e){setStatus(String(e));}
  }
  return <details className="glass-panel p-5 rounded"><summary className="cursor-pointer font-bold">Hero statistics and HUD data</summary><form className="mt-5 space-y-5" onSubmit={e=>{e.preventDefault();void save(e.currentTarget);}}>
    <p className="text-sm text-slate-400">Enter tournament statistics and player data here. Empty fields stay unknown on air.</p>
    <label className="block">Draft stage<input className="bg-black p-2 ml-3" name="stage" defaultValue={state.overlayControls.draftStageLabel || 'GROUP STAGE'}/></label>
    <h3 className="font-bold">Most picked heroes</h3>
    {Array.from({length:5},(_,i)=>{const row=state.overlayControls.draftStats?.[i];return <div key={i} className="flex flex-wrap gap-3"><label>Hero {i+1}<select name={`hero-${i}`} className="block bg-black p-2 w-44" defaultValue={heroes.find(h=>h.name===row?.heroName)?.id || ''} key={heroes.length}><option value="">Hidden</option>{heroes.map(h=><option value={h.id} key={h.id}>{h.name}</option>)}</select></label><label>Picks<input className="block bg-black p-2 w-24" name={`picks-${i}`} type="number" min="0" step="1" defaultValue={row?.picks ?? 0}/></label><label>Win rate %<input className="block bg-black p-2 w-24" name={`rate-${i}`} type="number" min="0" max="100" step="0.1" defaultValue={row?.winRate ?? ''}/></label></div>;})}
    {(['blue','red'] as const).map(side=><div key={side}><h3 className="font-bold mt-5">{side==='blue'?state.teamBlue.name:state.teamRed.name} HUD</h3>{Array.from({length:5},(_,i)=>{const row=state.overlayControls.hudPlayers?.[side]?.[i];const pick=(side==='blue'?state.teamBlue:state.teamRed).picks[i];return <div key={i} className="flex flex-wrap gap-3 mt-3 items-end"><span className="w-28 text-sm">{pick?.playerName || `Player ${i+1}`}<small className="block text-slate-400">{pick?.heroName || 'No hero'}</small></span><label>K / D / A<input className="block bg-black p-2 w-28" name={`${side}-kda-${i}`} placeholder="— / — / —" defaultValue={row?.kda || ''}/></label><label>Level<input className="block bg-black p-2 w-20" type="number" min="1" max="15" name={`${side}-level-${i}`} defaultValue={row?.level ?? ''}/></label>{[1,2].map(n=><label key={n}>Spell {n} asset URL<input className="block bg-black p-2 w-44" name={`${side}-spell${n}-${i}`} defaultValue={row?.spells?.[n-1] || ''}/></label>)}</div>;})}</div>)}
    <button type="submit" className="border border-amber-800 px-4 py-2 rounded">Save broadcast data</button><span role="status" className="ml-4">{status}</span>
  </form></details>;
}
