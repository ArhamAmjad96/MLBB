import type { ReactNode } from 'react';
import type { MatchEvent, MatchLiveState, OverlayPlacement, SpectatorLayout, SpectatorOverlaySettings, TeamMatchState } from '../../../shared/types';
import { normalizeSpectatorSettings } from '../../../shared/overlayLayout';
import { EventBanner } from './Broadcast';
import { CustomPlayerRoster } from './LegacyHud';
import './spectator.css';

export function NativeSafeWindow({layout,children}:{layout:SpectatorLayout;children:ReactNode}) {
  const {left,right,top,bottom}=layout.safeZones;
  return <div className="native-safe-window" data-safe-window style={{left,top,width:1920-left-right,height:1080-top-bottom}}>
    <div className="spectator-world" style={{left:-left,top:-top}}>{children}</div>
  </div>;
}
export function PositionedGraphic({placement,kind,children}:{placement:OverlayPlacement;kind:'scoreboard'|'event';children:ReactNode}) {
  return <div data-graphic={kind} className={`spectator-${kind}-anchor`} style={{left:placement.x,top:placement.y,transform:`scale(${placement.scale})`}}>{children}</div>;
}
function TeamWing({team,side}:{team:TeamMatchState;side:number}) {
  return <div className={`spectator-team team-${side}`}>
    <div className="spectator-team-logo">{team.logo && <img src={team.logo} alt=""/>}</div>
    <b title={team.name}>{team.shortCode || team.name}</b>
    <div className="spectator-series"><small>SERIES</small><strong>{team.seriesScore}</strong></div>
  </div>;
}
export function SpectatorScoreboard({state,settings}:{state:MatchLiveState;settings:SpectatorOverlaySettings}) {
  const sponsors=(state.overlayControls.branding?.sponsors || []).filter(s=>s.name || s.logo).slice(0,2);
  const optional:string[]=[];
  if(settings.showKills)optional.push(`KILLS ${state.teamBlue.kills} — ${state.teamRed.kills}`);
  if(settings.showClock)optional.push(`TIME ${Math.floor(state.clockSeconds/60).toString().padStart(2,'0')}:${(state.clockSeconds%60).toString().padStart(2,'0')}`);
  if(settings.showObjectives){const key=state.game==='mlbb'?'turtle':'primal_tyrant',lord=state.game==='mlbb'?'lord':'shadow_overlord';optional.push(`TURTLE ${state.teamBlue.objectives[key]||0} — ${state.teamRed.objectives[key]||0}`,`LORD ${state.teamBlue.objectives[lord]||0} — ${state.teamRed.objectives[lord]||0}`,`TOWERS ${state.teamBlue.towers} — ${state.teamRed.towers}`);}
  if(settings.mode==='custom' && settings.manualGold)optional.push(`MANUAL GOLD ${(settings.manualGold.blue/1000).toFixed(1)}K — ${(settings.manualGold.red/1000).toFixed(1)}K`);
  return <div className={`spectator-scoreboard ${sponsors.length?'has-sponsors':''}`} data-mode={settings.mode} aria-label="MARK47 series scoreboard">
    <svg className="spectator-chassis" viewBox="0 0 880 108" aria-hidden="true">
      <defs><linearGradient id="spectator-ink" x2="1" y2="1"><stop stopColor="#222027"/><stop offset=".6" stopColor="#111216"/><stop offset="1" stopColor="#1a1720"/></linearGradient><linearGradient id="spectator-gold"><stop stopColor="#97794b"/><stop offset=".4" stopColor="#f1dfb2"/><stop offset=".7" stopColor="#d3b477"/><stop offset="1" stopColor="#8b7149"/></linearGradient></defs>
      <path d="M2 2H878L850 77H30Z" fill="url(#spectator-ink)" stroke="url(#spectator-gold)" strokeWidth="2"/>
      <path d="M327 3L350 77H530L553 3" fill="#1e1926" stroke="#8b734d"/>
      <path d="M275 13H325L341 64H275ZM605 13H555L539 64H605Z" fill="#eee4ce"/>
      <path d="M31 73H849" stroke="#c5a66a" strokeWidth=".7"/>
      <path d="M337 8L348 8L365 65H355ZM532 8H543L525 65H515Z" fill="#654878" opacity=".5"/>
      {(optional.length>0 || sponsors.length>0) && <path d="M30 78H850L836 105H44Z" fill="#111318" stroke="#b79a64"/>}
    </svg>
    <TeamWing team={state.teamBlue} side={0}/><TeamWing team={state.teamRed} side={1}/>
    <div className="spectator-match"><small>{state.overlayControls.branding?.title || state.tournamentName}</small><b>GAME {state.currentGameNumber} <i>◆</i> {state.format}</b>{settings.round && <span>{settings.round}</span>}</div>
    {sponsors.map((s,i)=><div key={i} className={`spectator-sponsor partner-${i}`} title={s.name}>{s.logo?<img src={s.logo} alt={s.name || 'Sponsor'}/>:<span>{s.name}</span>}</div>)}
    {optional.length>0 && <div className="spectator-verified-data" aria-label="Operator-tracked statistics">{optional.map(value=><span key={value}>{value}</span>)}</div>}
  </div>;
}
export function SpectatorHud({state,settings:input,forceVisible=false}:{state:MatchLiveState;settings?:SpectatorOverlaySettings;forceVisible?:boolean}) {
  const settings=normalizeSpectatorSettings(input || state.overlayControls.spectatorSettings), layout=settings.layouts[settings.mode];
  return <div className="overlay-canvas broadcast spectator-output" data-overlay-mode={settings.mode}>
    {(forceVisible || state.overlayControls.showHud) && <NativeSafeWindow layout={layout}>
      <PositionedGraphic placement={layout.scoreboard} kind="scoreboard"><SpectatorScoreboard state={state} settings={settings}/></PositionedGraphic>
      {settings.mode==='custom' && settings.showPlayerPanels && <div className="reference-stage custom-player-panels"><CustomPlayerRoster state={state} side={0} verifiedOnly/><CustomPlayerRoster state={state} side={1} verifiedOnly/></div>}
    </NativeSafeWindow>}
  </div>;
}
export function SpectatorEvent({state,event,entryKey,duration,settings:input}:{state:MatchLiveState;event:MatchEvent;entryKey:string;duration:number;settings?:SpectatorOverlaySettings}) {
  const settings=normalizeSpectatorSettings(input || state.overlayControls.spectatorSettings), layout=settings.layouts[settings.mode];
  return <NativeSafeWindow layout={layout}><PositionedGraphic placement={layout.event} kind="event"><EventBanner key={entryKey} event={event} duration={duration} teamName={event.team==='blue'?state.teamBlue.name:state.teamRed.name}/></PositionedGraphic></NativeSafeWindow>;
}
