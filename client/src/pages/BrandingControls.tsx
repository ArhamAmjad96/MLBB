import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { MatchLiveState } from '../../../shared/types';
import { api } from '../services/api';

type Branding = NonNullable<MatchLiveState['overlayControls']['branding']>;
function LogoField({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}) {
  const [error,setError]=useState('');
  async function readFile(e:ChangeEvent<HTMLInputElement>) {
    const file=e.target.files?.[0];
    if(!file)return;
    if(!['image/png','image/jpeg','image/webp','image/svg+xml'].includes(file.type)){setError('Use a PNG, JPG, WebP or SVG image.');e.target.value='';return;}
    if(file.size>400*1024){setError('Use an image smaller than 400 KB.');e.target.value='';return;}
    const reader=new FileReader();
    reader.onload=()=>{onChange(String(reader.result));setError('');};
    reader.onerror=()=>setError('Could not read this image.');
    reader.readAsDataURL(file);e.target.value='';
  }
  return <div className="space-y-2"><label className="block">{label} URL<input className="block bg-black border border-stone-700 rounded p-2 w-full mt-1" value={value.startsWith('data:')?'':value} placeholder={value.startsWith('data:')?'Uploaded image selected':'/logo.png or https://…'} onChange={e=>onChange(e.target.value)}/></label><label className="block text-sm text-slate-400">Upload {label.toLowerCase()}<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="block mt-1 max-w-full" onChange={readFile}/></label>{value && <div className="flex gap-3 items-center"><img src={value} alt={`${label} preview`} className="w-20 h-14 object-contain bg-stone-950 p-1"/><button type="button" className="text-sm underline" onClick={()=>onChange('')}>Remove image</button></div>}{error && <p role="alert" className="text-red-300 text-sm">{error}</p>}</div>;
}

export function BrandingControls({state}:{state:MatchLiveState}) {
  const initial=state.overlayControls.branding;
  const [title,setTitle]=useState(initial?.title || '');
  const [subtitle,setSubtitle]=useState(initial?.subtitle ?? (state.game==='mlbb'?'MLBB INVITATIONAL':'HONOR OF KINGS'));
  const [logo,setLogo]=useState(initial?.logo || '');
  const [sponsors,setSponsors]=useState(Array.from({length:2},(_,i)=>({name:initial?.sponsors?.[i]?.name || '',subtitle:initial?.sponsors?.[i]?.subtitle || '',logo:initial?.sponsors?.[i]?.logo || ''})));
  const [message,setMessage]=useState(''); const [saving,setSaving]=useState(false);
  const changeSponsor=(index:number,key:'name'|'subtitle'|'logo',value:string)=>setSponsors(rows=>rows.map((row,i)=>i===index?{...row,[key]:value}:row));
  async function save(e:FormEvent) {
    e.preventDefault();setSaving(true);setMessage('');
    const branding:Branding={title:title.trim(),subtitle:subtitle.trim(),logo,sponsors:sponsors.map(s=>({...s,name:s.name.trim(),subtitle:s.subtitle.trim()})).filter(s=>s.name||s.logo||s.subtitle)};
    try{await api.updateOverlayControls({branding});setMessage('Branding saved — overlays updated.');}catch(error){setMessage(String(error));}finally{setSaving(false);}
  }
  return <section className="glass-panel p-5 rounded space-y-4"><div><h2 className="text-xl font-bold">Event branding & sponsors</h2><p className="text-sm text-slate-400">The event title updates both draft logos. Sponsors update the draft and in-game HUD. Leave the title empty to use the tournament name.</p></div><form onSubmit={save} className="space-y-5"><div className="grid md:grid-cols-3 gap-5"><div className="space-y-3"><label className="block">Event title<input maxLength={60} className="block bg-black border border-stone-700 rounded p-2 w-full mt-1" placeholder={state.tournamentName || 'MARK47'} value={title} onChange={e=>setTitle(e.target.value)}/></label><label className="block">Event subtitle<input maxLength={80} className="block bg-black border border-stone-700 rounded p-2 w-full mt-1" value={subtitle} onChange={e=>setSubtitle(e.target.value)}/></label><LogoField label="Event logo" value={logo} onChange={setLogo}/></div>{sponsors.map((s,i)=><fieldset className="border border-stone-700 rounded p-3 space-y-3" key={i}><legend className="px-2">Sponsor {i+1}</legend><label className="block">Sponsor {i+1} name<input maxLength={50} className="block bg-black border border-stone-700 rounded p-2 w-full mt-1" value={s.name} onChange={e=>changeSponsor(i,'name',e.target.value)}/></label><label className="block">Sponsor {i+1} subtitle<input maxLength={60} className="block bg-black border border-stone-700 rounded p-2 w-full mt-1" value={s.subtitle} onChange={e=>changeSponsor(i,'subtitle',e.target.value)}/></label><LogoField label={`Sponsor ${i+1} logo`} value={s.logo} onChange={value=>changeSponsor(i,'logo',value)}/></fieldset>)}</div><button disabled={saving} className="border border-amber-700 bg-amber-900/40 rounded px-5 py-2 disabled:opacity-50" type="submit">{saving?'Saving…':'Save branding'}</button><span className="ml-4 text-sm" role="status">{message}</span></form></section>;
}
