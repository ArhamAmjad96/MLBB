import React, { useEffect, useState, useRef } from 'react';
import { useMatchState } from '../hooks/useMatchState';
import { MatchEvent } from '../../../shared/types';

// Event Priority Mapping (Lower number = Higher priority)
const getEventPriority = (evt: MatchEvent): number => {
  if (evt.isVictory || evt.specialType === 'victory') return 1;
  if (evt.isSteal || evt.specialType?.includes('steal')) return 2;
  if (evt.multikill === 'savage' || evt.specialType === 'savage') return 3;
  if (evt.multikill === 'maniac' || evt.specialType === 'maniac') return 4;
  if (evt.isFirstBlood || evt.specialType === 'first_blood' || evt.multikill === 'first_blood') return 5;
  if (evt.multikill === 'triple' || evt.specialType === 'triple_kill') return 6;
  if (evt.specialType?.includes('lord') || (evt.type === 'objective' && (evt.objective?.id === 'lord' || evt.objective?.id === 'shadow_overlord'))) return 7;
  if (evt.specialType?.includes('turtle') || (evt.type === 'objective' && (evt.objective?.id === 'turtle' || evt.objective?.id === 'primal_tyrant'))) return 8;
  if (evt.isShutdown || evt.specialType === 'shutdown') return 9;
  if (evt.multikill === 'double' || evt.specialType === 'double_kill') return 10;
  if (evt.specialType === 'wipeout') return 11;
  if (evt.type === 'tower' || evt.specialType === 'tower_destroyed') return 12;
  return 13;
};

// Vector SVG Crests for MPL Broadcasts
const CrossedBladesIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#F5B942]">
    <path d="M6.92 5H5L14 14l1.08-.92L6.92 5zm10.16 0h-1.92l-4.16 4.16.92.92L16 6.08V5h1.08zM19 17.08L14.92 13l-.92.92L17.08 17H16v1.08l1.92 1.92H19v-1.92l-1.08-1zM5 19h1.92L16 9.92l-.92-.92L6.08 18H5v1z" />
  </svg>
);

const CrownLaurelIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#F5B942]">
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
  </svg>
);

const LightningStealIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#F59E0B]">
    <path d="M7 2v11h3v9l7-12h-4l4-8z" />
  </svg>
);

export const KillFeedOverlay: React.FC = () => {
  const { state, lastUndoneEventId } = useMatchState();
  const searchParams = new URLSearchParams(window.location.search);
  const strictControl = searchParams.get('strict') === 'true';

  const [eventQueue, setEventQueue] = useState<MatchEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<MatchEvent | null>(null);
  const [compactFeed, setCompactFeed] = useState<MatchEvent[]>([]);
  const processedEventIds = useRef<Set<string>>(new Set());

  // Instant Undo Purge
  useEffect(() => {
    if (!lastUndoneEventId) return;

    setCurrentEvent(prev => (prev?.id === lastUndoneEventId ? null : prev));
    setEventQueue(prev => prev.filter(e => e.id !== lastUndoneEventId));
    setCompactFeed(prev => prev.filter(e => e.id !== lastUndoneEventId));
    processedEventIds.current.delete(lastUndoneEventId);
  }, [lastUndoneEventId]);

  // Ingest New Events from State into Priority Queue
  useEffect(() => {
    if (!state || state.events.length === 0) return;

    const latest = state.events[0];
    if (processedEventIds.current.has(latest.id)) return;

    const isRecent = Date.now() - latest.realTimestamp < 8000;
    if (!isRecent) return;

    processedEventIds.current.add(latest.id);

    if (latest.isVictory || latest.specialType === 'victory') {
      setCurrentEvent(latest);
      setEventQueue([]);
      return;
    }

    setCompactFeed(prev => [latest, ...prev.filter(e => e.id !== latest.id)].slice(0, 4));

    setEventQueue(prev => {
      const updated = [...prev, latest];
      return updated.sort((a, b) => getEventPriority(a) - getEventPriority(b));
    });
  }, [state?.events]);

  // Queue Consumer: Sequential Hold Duration
  useEffect(() => {
    if (currentEvent !== null) return;
    if (eventQueue.length === 0) return;

    const nextEvent = eventQueue[0];
    setEventQueue(prev => prev.slice(1));
    setCurrentEvent(nextEvent);

    const holdDuration = nextEvent.isVictory ? 5000 : (getEventPriority(nextEvent) <= 4 ? 3200 : 2700);

    const timer = setTimeout(() => {
      setCurrentEvent(null);
    }, holdDuration);

    return () => clearTimeout(timer);
  }, [currentEvent, eventQueue]);

  // Corner feed eviction
  useEffect(() => {
    if (compactFeed.length === 0) return;
    const timer = setTimeout(() => {
      setCompactFeed(prev => prev.slice(0, -1));
    }, 6000);
    return () => clearTimeout(timer);
  }, [compactFeed]);

  if (!state || (strictControl && !state.overlayControls.showFeed)) {
    return <div className="overlay-canvas bg-transparent" />;
  }

  return (
    <div className="overlay-canvas bg-transparent select-none pointer-events-none relative overflow-hidden">
      
      {/* ============================================================== */}
      {/* MPL-GRADE CENTER-STAGE TOURNAMENT ANNOUNCEMENT RIBBON          */}
      {/* ============================================================== */}
      {currentEvent && (
        <div className="absolute top-[135px] left-0 w-full flex justify-center z-50 animate-pop-in">
          <MplEventBanner event={currentEvent} state={state} />
        </div>
      )}

      {/* ============================================================== */}
      {/* SECONDARY CORNER KILL FEED (Top-Right)                         */}
      {/* ============================================================== */}
      <div className="absolute top-[90px] right-8 flex flex-col items-end gap-2.5 z-40">
        {compactFeed.map(evt => (
          <MplCompactFeedItem key={evt.id} evt={evt} state={state} />
        ))}
      </div>

    </div>
  );
};

// =====================================================================
// MPL CINEMATIC EVENT BANNER COMPONENT
// =====================================================================
interface MplEventBannerProps {
  event: MatchEvent;
  state: any;
}

const MplEventBanner: React.FC<MplEventBannerProps> = ({ event, state }) => {
  const isBlue = event.team === 'blue';
  const team = isBlue ? state.teamBlue : state.teamRed;
  const teamColor = isBlue ? '#2D8CFF' : '#FF4D67';

  // --- 1. VICTORY OVERLAY (CHAMPIONSHIP STAGE) ---
  if (event.isVictory || event.specialType === 'victory') {
    const winnerTeam = event.winnerTeam || team;
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#141a24]/95 via-[#0c1017]/95 to-[#07090d]/95 backdrop-blur-2xl border-2 border-[#F5B942] rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.95)] max-w-[850px] text-center glow-gold relative overflow-hidden">
        {/* Background Speedlines & Rays */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[600px] h-32 bg-gradient-to-b from-[#F5B942]/20 to-transparent blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 px-5 py-1 rounded-full bg-gradient-to-r from-transparent via-[#F5B942]/20 to-transparent border border-[#F5B942]/60 text-[#F5B942] font-rajdhani text-xs font-black tracking-widest uppercase mb-4">
          <CrownLaurelIcon />
          <span>MATCH DECIDED • SERIES CHAMPION</span>
          <CrownLaurelIcon />
        </div>

        {/* Team Crest Shield */}
        <div className="w-28 h-28 rounded-2xl bg-gradient-to-b from-[#1e2838] to-[#0a0f16] p-3 border-2 border-[#F5B942] shadow-[0_0_30px_rgba(245,185,66,0.6)] flex items-center justify-center mb-4">
          <img 
            src={winnerTeam.logo} 
            alt="" 
            className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/identicon/svg?seed=' + winnerTeam.shortCode;
            }}
          />
        </div>

        <h1 className="font-display text-7xl font-bold tracking-wider uppercase metallic-gold-text drop-shadow-[0_4px_20px_rgba(245,185,66,0.7)] leading-none mb-1 italic">
          VICTORY
        </h1>

        <p className="font-rajdhani text-2xl font-black text-white uppercase tracking-widest mt-1">
          {winnerTeam.name}
        </p>

        <span className="font-mono text-sm font-bold text-slate-300 tracking-wider uppercase mt-3 px-4 py-1 rounded bg-black/60 border border-white/10">
          FINAL SERIES SCORE: {state.teamBlue.seriesScore} - {state.teamRed.seriesScore}
        </span>
      </div>
    );
  }

  // --- 2. MULTIKILL FAMILY (SAVAGE, MANIAC, TRIPLE, DOUBLE) ---
  const isSavage = event.multikill === 'savage' || event.specialType === 'savage';
  const isManiac = event.multikill === 'maniac' || event.specialType === 'maniac';
  const isTriple = event.multikill === 'triple' || event.specialType === 'triple_kill';
  const isDouble = event.multikill === 'double' || event.specialType === 'double_kill';

  if (isSavage || isManiac || isTriple || isDouble) {
    let title = 'DOUBLE KILL';
    let cardStyle = 'border border-[#2D8CFF]/70 glow-blue';
    let gradient = 'from-[#0d1624] via-[#101b2d] to-[#080d16]';
    let titleStyle = 'metallic-blue-text';
    let subtitle = 'DUAL ELIMINATION';

    if (isSavage) {
      title = state.game === 'mlbb' ? 'SAVAGE' : 'PENTA KILL';
      cardStyle = 'border-2 border-[#F5B942] glow-gold';
      gradient = 'from-[#2e1d05] via-[#1f1504] to-[#0c0902]';
      titleStyle = 'metallic-gold-text drop-shadow-[0_4px_25px_rgba(245,185,66,0.8)]';
      subtitle = 'MAXIMUM STREAK • TEAM CLEARED';
    } else if (isManiac) {
      title = 'MANIAC';
      cardStyle = 'border-2 border-[#F59E0B] glow-gold';
      gradient = 'from-[#261304] via-[#1a0e03] to-[#0a0501]';
      titleStyle = 'metallic-gold-text drop-shadow-[0_2px_15px_rgba(245,158,11,0.6)]';
      subtitle = '4X HERO STREAK';
    } else if (isTriple) {
      title = 'TRIPLE KILL';
      cardStyle = 'border border-[#00D1C7] glow-teal';
      gradient = 'from-[#051c1f] via-[#08282c] to-[#031012]';
      titleStyle = 'metallic-cyan-text drop-shadow-[0_2px_12px_rgba(0,209,199,0.6)]';
      subtitle = 'TRIPLE ELIMINATION';
    }

    return (
      <div className={`flex items-stretch h-[80px] bg-gradient-to-r ${gradient} bg-opacity-95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] mpl-banner-angled pl-8 pr-10 relative overflow-hidden ${cardStyle}`}>
        {/* Neon Edge Blades */}
        <div className={`absolute top-0 left-0 w-2 h-full ${isBlue ? 'bg-[#2D8CFF]' : 'bg-[#FF4D67]'}`} />
        <div className={`absolute top-0 right-0 w-2 h-full ${isBlue ? 'bg-[#2D8CFF]' : 'bg-[#FF4D67]'}`} />

        <div className="flex items-center gap-5 relative z-10">
          
          {/* Killer Hero Portrait with Team Colored Ring */}
          {event.killerHero ? (
            <div className="relative">
              <div className={`w-14 h-14 rounded-full overflow-hidden border-2 shadow-lg ${isBlue ? 'border-[#2D8CFF] shadow-[0_0_12px_#2D8CFF]' : 'border-[#FF4D67] shadow-[0_0_12px_#FF4D67]'}`}>
                <img 
                  src={event.killerHero.avatar} 
                  alt="" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/identicon/svg?seed=' + event.killerHero?.name;
                  }}
                />
              </div>
              <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded text-[8px] font-rajdhani font-black text-black uppercase ${isBlue ? 'bg-[#2D8CFF]' : 'bg-[#FF4D67]'}`}>
                {team.shortCode}
              </span>
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-black/50 border border-white/20">
              <CrownLaurelIcon />
            </div>
          )}

          {/* Multikill Text Banner */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="font-rajdhani text-xs font-black uppercase tracking-widest text-[#9FB0C5]">
                {event.killerHero?.name || team.name}
              </span>
              <span className="text-white/20">•</span>
              <span className="font-rajdhani text-[10px] font-bold uppercase tracking-wider text-[#F5B942]">
                {subtitle}
              </span>
            </div>
            <h2 className={`font-display text-5xl font-bold uppercase tracking-wider leading-none italic ${titleStyle}`}>
              {title}
            </h2>
          </div>

          {/* Right Trophy Badge */}
          {isSavage && (
            <div className="ml-4 pl-4 border-l border-white/10 flex items-center justify-center">
              <CrownLaurelIcon />
            </div>
          )}

        </div>
      </div>
    );
  }

  // --- 3. FIRST BLOOD OVERLAY (MPL CINEMATIC ANGLED RIBBON) ---
  if (event.isFirstBlood || event.specialType === 'first_blood' || event.multikill === 'first_blood') {
    return (
      <div className="flex items-stretch h-[84px] bg-gradient-to-r from-[#1c1208]/95 via-[#241709]/95 to-[#120b04]/95 backdrop-blur-2xl border-2 border-[#F5B942] shadow-[0_20px_50px_rgba(0,0,0,0.95)] mpl-banner-angled pl-8 pr-8 glow-gold relative overflow-hidden">
        
        {/* Neon Team Accent Rails */}
        <div className="absolute top-0 left-0 w-2 h-full bg-[#2D8CFF] shadow-[0_0_10px_#2D8CFF]" />
        <div className="absolute top-0 right-0 w-2 h-full bg-[#FF4D67] shadow-[0_0_10px_#FF4D67]" />

        <div className="flex items-center gap-6 relative z-10">
          
          {/* Killer Hero Portrait (Left) */}
          {event.killerHero && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${isBlue ? 'border-[#2D8CFF] shadow-[0_0_14px_rgba(45,140,255,0.7)]' : 'border-[#FF4D67] shadow-[0_0_14px_rgba(255,77,103,0.7)]'}`}>
                  <img 
                    src={event.killerHero.avatar} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/identicon/svg?seed=' + event.killerHero?.name;
                    }}
                  />
                </div>
                <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded text-[8px] font-rajdhani font-black text-black uppercase ${isBlue ? 'bg-[#2D8CFF]' : 'bg-[#FF4D67]'}`}>
                  {team.shortCode}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-rajdhani text-[10px] font-black uppercase tracking-wider text-[#2D8CFF]">KILLER</span>
                <span className="font-display text-lg font-bold text-white uppercase tracking-wider leading-none">
                  {event.killerHero.name}
                </span>
              </div>
            </div>
          )}

          {/* Center Fiery First Blood Headline */}
          <div className="flex flex-col items-center px-4">
            <div className="flex items-center gap-1.5 font-rajdhani text-[10px] font-black text-[#F5B942] tracking-widest uppercase">
              <CrossedBladesIcon />
              <span>INITIAL BLOODSHED OF THE REALM</span>
              <CrossedBladesIcon />
            </div>
            <h2 className="font-display text-5xl font-bold uppercase tracking-wider metallic-gold-text leading-none italic drop-shadow-[0_2px_15px_rgba(245,185,66,0.8)]">
              FIRST BLOOD
            </h2>
          </div>

          {/* Victim Hero Portrait (Right - Grayscale with Blood Slash) */}
          {event.victimHero && (
            <div className="flex items-center gap-3 opacity-80">
              <div className="flex flex-col text-right">
                <span className="font-rajdhani text-[10px] font-black uppercase tracking-wider text-[#EF4444]">FALLEN</span>
                <span className="font-display text-lg font-bold text-slate-300 uppercase tracking-wider leading-none">
                  {event.victimHero.name}
                </span>
              </div>
              <div className="relative">
                <div className="w-13 h-13 rounded-full overflow-hidden border border-red-500/50 grayscale filter contrast-125">
                  <img 
                    src={event.victimHero.avatar} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/identicon/svg?seed=' + event.victimHero?.name;
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-red-600/30 rounded-full mix-blend-color-burn pointer-events-none" />
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // --- 4. OBJECTIVES & STEALS (TURTLE, LORD, TYRANT, OVERLORD) ---
  const isSteal = event.isSteal || event.specialType?.includes('steal');
  const isLord = event.specialType?.includes('lord') || event.objective?.id === 'lord' || event.objective?.id === 'shadow_overlord';
  const objName = event.objective?.name || (isLord ? 'LORD' : 'TURTLE');

  return (
    <div className={`flex items-stretch h-[76px] bg-gradient-to-r ${
      isSteal 
        ? 'from-[#2e1704] via-[#211002] to-[#0f0701] border-2 border-[#F59E0B] glow-gold' 
        : isLord 
          ? 'from-[#291c06] via-[#1a1204] to-[#0c0802] border-2 border-[#F5B942] glow-gold' 
          : 'from-[#051c20] via-[#072428] to-[#031113] border border-[#00D1C7] glow-teal'
    } bg-opacity-95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] mpl-banner-angled pl-8 pr-10 relative overflow-hidden`}>
      
      {/* Team colored edge indicator */}
      <div className={`absolute top-0 left-0 w-2 h-full ${isBlue ? 'bg-[#2D8CFF]' : 'bg-[#FF4D67]'}`} />

      <div className="flex items-center gap-5 relative z-10">
        
        {/* Objective Icon Emblem */}
        <div className="p-2.5 rounded-xl bg-black/60 border border-white/20 shadow-inner">
          {isSteal ? <LightningStealIcon /> : isLord ? <CrownLaurelIcon /> : <CrossedBladesIcon />}
        </div>

        {/* Text */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.2 rounded text-[9px] font-rajdhani font-black text-black uppercase ${isBlue ? 'bg-[#2D8CFF]' : 'bg-[#FF4D67]'}`}>
              {team.shortCode}
            </span>
            <span className="font-rajdhani text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              {isSteal ? 'CRITICAL OBJECTIVE HIJACKED' : 'EPIC OBJECTIVE SECURED'}
            </span>
          </div>

          <h2 className={`font-display text-4xl font-bold uppercase tracking-wider leading-none italic mt-0.5 ${
            isSteal ? 'metallic-gold-text drop-shadow-[0_2px_12px_rgba(245,158,11,0.8)]' : isLord ? 'metallic-gold-text' : 'metallic-cyan-text'
          }`}>
            {isSteal ? `${objName} STOLEN!` : `${objName} SECURED`}
          </h2>
        </div>

      </div>
    </div>
  );
};

// =====================================================================
// COMPACT CORNER FEED ITEM (Clean 1920x1080 Secondary Corner Stack)
// =====================================================================
const MplCompactFeedItem: React.FC<{ evt: MatchEvent; state: any }> = ({ evt, state }) => {
  const isBlue = evt.team === 'blue';
  const team = isBlue ? state.teamBlue : state.teamRed;

  return (
    <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md border backdrop-blur-md shadow-lg animate-slide-down ${
      isBlue 
        ? 'bg-[#0d1522]/95 border-[#2D8CFF]/60 text-white' 
        : 'bg-[#220d13]/95 border-[#FF4D67]/60 text-white'
    }`}>
      {/* Team Badge */}
      <span className={`px-1.5 py-0.2 rounded text-[9px] font-rajdhani font-black text-black uppercase ${
        isBlue ? 'bg-[#2D8CFF]' : 'bg-[#FF4D67]'
      }`}>
        {team.shortCode}
      </span>

      {/* Killer Avatar / Name */}
      {evt.killerHero && (
        <div className="flex items-center gap-1.5">
          <img 
            src={evt.killerHero.avatar} 
            alt="" 
            className="w-6 h-6 rounded-md object-cover border border-white/20"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/identicon/svg?seed=' + evt.killerHero?.name;
            }}
          />
          <span className="font-rajdhani text-xs font-bold text-white max-w-[80px] truncate">
            {evt.killerHero.name}
          </span>
        </div>
      )}

      {/* Event Icon / Action */}
      <div className="font-display text-sm font-bold tracking-wider px-2 py-0.5 rounded bg-black/50 text-[#F5B942]">
        {evt.headline || (evt.type === 'kill' ? 'KILL' : 'OBJECTIVE')}
      </div>

      {/* Victim Hero Avatar */}
      {evt.victimHero && (
        <div className="flex items-center gap-1 opacity-70">
          <img 
            src={evt.victimHero.avatar} 
            alt="" 
            className="w-5 h-5 rounded-md object-cover border border-white/10 grayscale"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/identicon/svg?seed=' + evt.victimHero?.name;
            }}
          />
        </div>
      )}
    </div>
  );
};
