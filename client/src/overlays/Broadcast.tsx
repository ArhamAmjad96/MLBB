import { Castle, Crown, Swords, Trophy, Zap } from 'lucide-react';
import type { MatchEvent } from '../../../shared/types';
import { ArtSlice } from './ReferenceArt';
import { HUD_ART } from './referenceAssets';
import { eventKind } from './eventKind';
import './broadcast.css';

const emblems: Record<string, [number, number, number, number]> = {
  first_blood: [32,594,110,117], double_kill:[382,594,110,117], triple_kill:[723,594,111,117],
  maniac:[1037,594,111,117], savage:[1350,594,111,117], turtle_secured:[37,755,112,117],
  lord_secured:[422,755,113,117], lord_steal:[422,755,113,117], shutdown:[813,755,112,117],
};
export function Crest({kind='first_blood'}:{kind?:string}) {
  const rect=emblems[kind];
  if(rect) return <ArtSlice source={HUD_ART} x={rect[0]} y={rect[1]} width={rect[2]} height={rect[3]} className="approved-emblem"/>;
  const Icon=kind.includes('tower') ? Castle : kind==='mvp' || kind==='victory' ? Trophy : kind.includes('lord') ? Crown : Swords;
  return <span className="crest"><Icon strokeWidth={1.3}/></span>;
}

function VictoryArt() {
  return <svg viewBox="0 0 455 142" className="victory-art" aria-hidden="true">
    <defs><mask id="victory-art-mask"><path fill="white" d="M8 29L45 48L26 30L114 45L184 43L190 25L199 37L198 10L210 24L224 1L233 23L249 10L246 38L258 24L251 43L340 31L450 28L429 67L450 57L445 136H8L15 103L0 65L39 84L20 51Z"/><rect x="121" y="64" width="218" height="50" fill="black"/></mask></defs>
    <image href={HUD_ART} x="-1193" y="-730" width="1672" height="941" mask="url(#victory-art-mask)"/>
  </svg>;
}

export function EventBanner({event,teamName,duration=4.4}:{event:MatchEvent;teamName:string;duration?:number}) {
  const kind=eventKind(event);
  const victory=kind==='victory';
  return <div className={`event-ribbon event-${kind}`} style={{animationDuration:`${duration}s`}} aria-label={`${event.headline || kind.replaceAll('_',' ')} — ${teamName}`}>
    {victory ? <div className="victory-composition"><div className="victory-fill"/><VictoryArt/><strong className="victory-title">VICTORY</strong><span className="event-winner">{teamName}</span></div>
    : <div className="event-composition">
      <div className="event-panel"><span className="event-watermark"><Crest kind={kind}/></span></div>
      <ArtSlice source={HUD_ART} x={264} y={618} width={92} height={83} className="event-ivory-tail"/>
      <div className="event-diamond"><Crest kind={kind}/>{kind.includes('steal') && <Zap className="steal-mark"/>}</div>
      <div className="event-copy"><strong>{event.headline || kind.replaceAll('_',' ')}</strong></div>
      {(event.killerHero?.playerName || event.killerHero?.name) && <span className="event-player">{event.killerHero.playerName || event.killerHero.name} · {teamName}</span>}
    </div>}
  </div>;
}
