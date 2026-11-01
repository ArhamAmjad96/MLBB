import { DraftBranding, SponsorBranding } from './OverlayBranding';
import { useBroadcastReady } from './useBroadcastReady';
import { useMatchState } from '../hooks/useMatchState';
import { formatTime } from '../utils/formatters';
import { ReferenceBackdrop, ArtSlice, DraftFrame } from './ReferenceArt';
import { isReferencePreview } from './referenceAssets';
import { referenceState } from './referencePreview';
import type { TeamMatchState } from '../../../shared/types';
import './broadcast.css';

function TeamLogo({ team, side, reference }: {team:TeamMatchState; side:number; reference:boolean}) {
  return reference
    ? <ArtSlice x={side ? 1172 : 422} y={15} width={74} height={82} />
    : team.logo ? <img src={team.logo} alt="" /> : <span>{team.shortCode.slice(0,1)}</span>;
}

export function DraftOverlay() {
  const ready=useBroadcastReady();
  const {state:liveState} = useMatchState();
  if (!liveState || !ready) return null;
  const reference = isReferencePreview();
  const state = reference ? referenceState(liveState,true) : liveState;
  const preview = new URLSearchParams(location.search).get('preview') === 'true';
  const phase = state.draft.completed ? undefined : state.draft.phases[state.draft.activePhaseIndex];

  return <div className="overlay-canvas broadcast draft-output">
    {(state.overlayControls.showDraft || preview) && <div className="reference-stage"><ReferenceBackdrop kind="draft"/>
      <DraftFrame customLogo={!!state.overlayControls.branding?.logo}/>
      <DraftBranding state={state}/><SponsorBranding state={state} variant="draft"/>
      <header className="draft-live-header">
        {[state.teamBlue,state.teamRed].map((team,side) => <div className={`draft-live-team side-${side}`} key={side}>
          <div className="draft-paper" />
          <div className="draft-team-logo"><TeamLogo team={team} side={side} reference={reference} /></div>
          <b>{team.shortCode || team.name}</b>
        </div>)}
        <div className="draft-scoreplate"/><ArtSlice x={781} y={51} width={112} height={36} className="draft-score-flourish"/><div className="draft-series"><b>{state.teamBlue.seriesScore}</b><i>{state.format}</i><b>{state.teamRed.seriesScore}</b></div>
        <div className="draft-timer-blank"/><div className="draft-countdown"><span>{state.draft.completed ? 'DRAFT COMPLETE' : 'DRAFTING PHASE'}</span><time>{formatTime(state.draft.timerRemaining)}</time></div>
        <div className="draft-match-name">{state.matchName}</div>
      </header>
      {!!state.overlayControls.draftStats?.length && <aside className="most-picked">
        <h2>MOST PICKED HEROES <span>♢</span></h2>
        {state.overlayControls.draftStats.slice(0,5).map((hero,i) => <div className="most-picked-row" key={`${hero.heroName}-${i}`}>
          {reference ? <ArtSlice x={34} y={205+i*56} width={66} height={48} /> : <img src={hero.avatar} alt="" />}
          <div><b>{hero.heroName}</b><small>{hero.winRate === undefined ? 'PICKS' : `${hero.winRate}% WINRATE`}</small></div>
          <strong>{hero.picks}</strong><span className="purple-fold" />
        </div>)}
      </aside>}
      {[state.teamBlue,state.teamRed].map((team,side) => <section className={`draft-roster roster-${side}`} key={side} aria-label={`${team.name} draft`}>
        <div className="draft-ban-row">
          {Array.from({length:5},(_,i) => { const ban=team.bans[i]; const active=!reference && phase?.type==='ban' && phase.team===(side?'red':'blue') && phase.slotIndex===i;
            return <div className={`draft-ban ${active?'active-slot':''}`} key={i} aria-label={ban?.heroName ? `Banned ${ban.heroName}` : `Ban slot ${i+1}`}>
              {ban?.heroAvatar && <div key={ban.heroId} className="ban-selection"><img src={ban.heroAvatar} alt={ban.heroName}/><span>╱</span></div>}
            </div>;
          })}
        </div>
        <div className="draft-coach"><small>COACH</small><b>{team.coachName || '—'}</b></div>
        <div className="draft-picks">
          {Array.from({length:5},(_,i) => {const pick=team.picks[i];const active=!reference && phase?.type==='pick' && phase.team===(side?'red':'blue') && phase.slotIndex===i;
            return <article className={`draft-pick ${active?'active-slot':''}`} key={i}>
              <div className="pick-art">
                {pick?.heroAvatar && <div className="pick-selection" key={pick.heroId}><img src={pick.heroAvatar} alt={pick.heroName}/></div>}
                {pick?.heroAvatar && <b className="pick-hero-name">{pick.heroName}</b>}
                {active && <span className="pick-active-label">{state.draft.isTimerRunning?'PICKING':'PAUSED'}</span>}
              </div>
              <div className="draft-player-name">{pick?.playerName || `PLAYER${String(i+1+side*5).padStart(2,'0')}`}</div>
            </article>;
          })}
        </div>
      </section>)}
      <div className="draft-stage-name">{state.overlayControls.draftStageLabel || 'GROUP STAGE'}</div>
      <div className="draft-versus-backdrop"/><div className="draft-versus"><b>{state.teamBlue.shortCode}</b><i>VS</i><b>{state.teamRed.shortCode}</b></div>
    </div>}
  </div>;
}
