import type { MatchLiveState } from '../../../shared/types';
import { ArtSlice } from './ReferenceArt';

type Props = {state:MatchLiveState};
export function DraftBranding({state}:Props) {
  const branding=state.overlayControls.branding;
  const title=branding?.title?.trim() || state.tournamentName || 'MARK47';
  const subtitle=branding?.subtitle ?? (state.game==='mlbb'?'MLBB INVITATIONAL':'HONOR OF KINGS');
  return <>
    <div className="event-brand-top" aria-label="Event branding">
      {branding?.logo ? <img className="event-brand-logo" src={branding.logo} alt="Event logo"/> : <ArtSlice x={32} y={12} width={109} height={123} className="event-brand-default"/>}
      <div className="event-brand-top-copy"><b style={{fontSize:title.length>26?17:title.length>14?20:25}}>{title}</b><small>{subtitle}</small></div>
    </div>
    {branding?.logo && <><svg className="custom-center-diamond" viewBox="0 0 210 190" aria-hidden="true"><path d="M105 2L207 102L105 188L3 102Z" fill="#16131b" stroke="#d9bb80" strokeWidth="3"/><path d="M105 7L202 102L105 183L8 102Z" fill="none" stroke="#6c573c"/></svg><img className="event-brand-center-logo" src={branding.logo} alt=""/></>}
    <div className="event-brand-center-copy"><b style={{fontSize:title.length>28?14:title.length>18?17:22}}>{title}</b><small>{subtitle}</small></div>
  </>;
}

export function SponsorBranding({state,variant}:{state:MatchLiveState;variant:'draft'|'hud'}) {
  const sponsors=state.overlayControls.branding?.sponsors?.slice(0,2) || [];
  return <div className={`editable-sponsors editable-sponsors-${variant}`} aria-label="Sponsors">
    {sponsors.map((s,i)=><div className="sponsor-slot" key={i}>
      {s.logo ? <img src={s.logo} alt={s.name || 'Sponsor'}/> : <b>{s.name}</b>}
      {s.subtitle && <small>{s.subtitle}</small>}
    </div>)}
  </div>;
}
