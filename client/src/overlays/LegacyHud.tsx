import { SponsorBranding } from './OverlayBranding';
import { useBroadcastReady } from './useBroadcastReady';
import { useMatchState } from '../hooks/useMatchState';
import { formatTime } from '../utils/formatters';
import { ReferenceBackdrop, ArtSlice } from './ReferenceArt';
import { HUD_ART, isReferencePreview } from './referenceAssets';
import { referenceState } from './referencePreview';
import type { MatchLiveState, TeamMatchState } from '../../../shared/types';
import './broadcast.css';

function Objectives({team,game}:{team:TeamMatchState;game:string}) {
  const values=[team.objectives[game==='mlbb'?'turtle':'primal_tyrant']||0,team.objectives[game==='mlbb'?'lord':'shadow_overlord']||0,team.towers];
  return <div className="hud-objectives">{values.map((value,i)=><span key={i}><ArtSlice source={HUD_ART} x={[515,589,660][i]} y={84} width={20} height={23}/><b>{value}</b></span>)}</div>;
}
export function CustomPlayerRoster({state,side,reference=false,verifiedOnly=false}:{state:MatchLiveState;side:number;reference?:boolean;verifiedOnly?:boolean}) {
  const team=side?state.teamRed:state.teamBlue;
  const stats=state.overlayControls.hudPlayers?.[side?'red':'blue'];
  const sampleKda=side?['2/1/3','1/1/4','3/2/3','1/1/5','0/2/6']:['2/1/4','1/2/8','0/3/5','3/0/2','0/1/7'];
  return <aside className={`hud-roster hud-roster-${side}`} aria-label={`${team.name} heroes`}>
    {team.picks.map((pick,i)=> pick.heroId && (!verifiedOnly || /^\s*\d+\s*\/\s*\d+\s*\/\s*\d+\s*$/.test(stats?.[i]?.kda || '')) && <div className="hud-player-row" key={i}>
      <div className="hud-hero-portrait">{reference ? <ArtSlice source={HUD_ART} x={side?1597:9} y={257+i*62} width={65} height={57}/> : <img src={pick.heroAvatar} alt=""/>}</div>
      {(reference || stats?.[i]?.level!==undefined) && <span className="hero-level">{reference?15:stats?.[i]?.level}</span>}
      <div className="hud-player-copy"><b>{pick.heroName}</b><small>{reference?sampleKda[i]:(stats?.[i]?.kda || '— / — / —')}</small></div>
      <div className="hud-spells">{reference ? <ArtSlice source={HUD_ART} x={side?1426:181} y={278+i*62} width={65} height={31}/> : stats?.[i]?.spells?.map((url,n)=><img key={n} src={url} alt=""/>)}</div>
    </div>)}
  </aside>;
}
export function LegacyHudOverlay() {
  const ready=useBroadcastReady();
  const {state:liveState}=useMatchState();
  if(!liveState || !ready) return null;
  const reference=isReferencePreview();const state=reference?referenceState(liveState):liveState;
  const preview=new URLSearchParams(location.search).get('preview')==='true';
  const difference=state.teamBlue.gold-state.teamRed.gold;
  return <div className="overlay-canvas broadcast hud-output">{(state.overlayControls.showHud || preview) && <div className="reference-stage"><ReferenceBackdrop kind="hud"/>
    <svg className="approved-frame" viewBox="0 0 1672 941" aria-hidden="true"><defs><clipPath id="hud-approved-header"><path d="M250 9H1418L1381 86H1672L1655 112H1378L1390 88H1375L1366 112H1228L1216 111H898L874 124H796L774 111H426L410 112H299Z"/></clipPath></defs><image href={HUD_ART} width="1672" height="941" clipPath="url(#hud-approved-header)"/></svg>
    <svg className="minimap-frame" viewBox="0 0 230 230" aria-hidden="true"><path d="M1 45L45 1H229V187L187 229H1Z" fill="none" stroke="#d3b57a" strokeWidth="1.2"/><path d="M4 47L47 4H226V185L185 226H4Z" fill="none" stroke="#6d6558" strokeWidth=".7"/></svg>
    {[state.teamBlue,state.teamRed].map((team,side)=><div className={`hud-live-wing hud-wing-${side}`} key={side}>
      <div className="hud-goldplate"/><div className="hud-objective-plate"/><div className="hud-live-team"><div className="hud-logo">{reference?<ArtSlice source={HUD_ART} x={side?1311:295} y={16} width={66} height={60}/>:team.logo?<img src={team.logo} alt=""/>:<b>{team.shortCode.slice(0,1)}</b>}</div><strong>{team.shortCode || team.name}</strong></div>
      <div className="hud-series-score">{reference ? '0 - 0' : `${team.seriesScore} - ${side?state.teamBlue.seriesScore:state.teamRed.seriesScore}`}</div>
      <div className="hud-gold"><span className="gold-coin">$</span><b>{(team.gold/1000).toFixed(1)}K</b><small>{reference?'+10.2K':(side?difference<0:difference>0)?`+${(Math.abs(difference)/1000).toFixed(1)}K`:''}</small></div>
      <Objectives team={team} game={state.game}/>
    </div>)}
    <div className="hud-center-blank"/><ArtSlice source={HUD_ART} x={811} y={22} width={51} height={49} className="hud-sword-mark"/><div className="hud-kill-score score-left">{String(state.teamBlue.kills).padStart(2,'0')}</div><div className="hud-kill-score score-right">{String(state.teamRed.kills).padStart(2,'0')}</div>
    <time className="hud-time">{formatTime(state.clockSeconds)}</time>
    <SponsorBranding state={state} variant="hud"/>
    <div className="hud-match-name">{state.matchName}</div>
    <CustomPlayerRoster state={state} side={0} reference={reference}/><CustomPlayerRoster state={state} side={1} reference={reference}/>
  </div>}</div>;
}
