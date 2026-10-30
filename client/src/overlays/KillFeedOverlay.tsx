import React, { useEffect, useState, useRef } from 'react';
import { useMatchState } from '../hooks/useMatchState';
import { MatchEvent } from '../../../shared/types';

// Event Priority Mapping (Lower number = Higher priority)
const getEventPriority = (evt: MatchEvent): number => {
  if (evt.isVictory || evt.specialType === 'victory') return 1;
  if (evt.isSteal || evt.specialType === 'lord_steal' || evt.specialType === 'tyrant_steal' || evt.specialType === 'overlord_steal') return 2;
  if (evt.multikill === 'savage' || evt.specialType === 'savage') return 3;
  if (evt.multikill === 'maniac' || evt.specialType === 'maniac') return 4;
  if (evt.isFirstBlood || evt.specialType === 'first_blood' || evt.multikill === 'first_blood') return 5;
  if (evt.multikill === 'triple' || evt.specialType === 'triple_kill') return 6;
  if (evt.specialType === 'lord_secured' || (evt.type === 'objective' && (evt.objective?.id === 'lord' || evt.objective?.id === 'shadow_overlord'))) return 7;
  if (evt.specialType === 'turtle_secured' || (evt.type === 'objective' && (evt.objective?.id === 'turtle' || evt.objective?.id === 'primal_tyrant'))) return 8;
  if (evt.isShutdown || evt.specialType === 'shutdown') return 9;
  if (evt.multikill === 'double' || evt.specialType === 'double_kill') return 10;
  if (evt.specialType === 'wipeout') return 11;
  if (evt.type === 'tower' || evt.specialType === 'tower_destroyed') return 12;
  return 13;
};

export const KillFeedOverlay: React.FC = () => {
  const { state, lastUndoneEventId } = useMatchState();
  const searchParams = new URLSearchParams(window.location.search);
  const strictControl = searchParams.get('strict') === 'true';

  // Queue of events awaiting center-stage broadcast
  const [eventQueue, setEventQueue] = useState<MatchEvent[]>([]);
  // Currently displayed center-stage event
  const [currentEvent, setCurrentEvent] = useState<MatchEvent | null>(null);
  // Persistent compact feed (recent 3 events in corner)
  const [compactFeed, setCompactFeed] = useState<MatchEvent[]>([]);
  
  // Track processed event IDs to avoid duplicate insertions
  const processedEventIds = useRef<Set<string>>(new Set());

  // 1. Instant Undo Purge
  useEffect(() => {
    if (!lastUndoneEventId) return;

    setCurrentEvent(prev => (prev?.id === lastUndoneEventId ? null : prev));
    setEventQueue(prev => prev.filter(e => e.id !== lastUndoneEventId));
    setCompactFeed(prev => prev.filter(e => e.id !== lastUndoneEventId));
    processedEventIds.current.delete(lastUndoneEventId);
  }, [lastUndoneEventId]);

  // 2. Ingest New Events from State into Priority Queue
  useEffect(() => {
    if (!state || state.events.length === 0) return;

    const latest = state.events[0];
    if (processedEventIds.current.has(latest.id)) return;

    // Check if event is recent (within 8 seconds of creation)
    const isRecent = Date.now() - latest.realTimestamp < 8000;
    if (!isRecent) return;

    processedEventIds.current.add(latest.id);

    // If Victory, immediately jump to top priority and clear lesser pending
    if (latest.isVictory || latest.specialType === 'victory') {
      setCurrentEvent(latest);
      setEventQueue([]);
      return;
    }

    // Add to secondary corner feed
    setCompactFeed(prev => [latest, ...prev.filter(e => e.id !== latest.id)].slice(0, 4));

    // Add to center-stage priority queue
    setEventQueue(prev => {
      const updated = [...prev, latest];
      return updated.sort((a, b) => getEventPriority(a) - getEventPriority(b));
    });
  }, [state?.events]);

  // 3. Queue Consumer: Show active event for ~3.0s, then cycle
  useEffect(() => {
    if (currentEvent !== null) return;
    if (eventQueue.length === 0) return;

    const nextEvent = eventQueue[0];
    setEventQueue(prev => prev.slice(1));
    setCurrentEvent(nextEvent);

    // Hold duration: 3.2s for victory, 3.0s for savage/lord, 2.7s for standard
    const holdDuration = nextEvent.isVictory ? 5000 : (getEventPriority(nextEvent) <= 4 ? 3200 : 2700);

    const timer = setTimeout(() => {
      setCurrentEvent(null);
    }, holdDuration);

    return () => clearTimeout(timer);
  }, [currentEvent, eventQueue]);

  // Secondary feed auto-eviction after 6 seconds
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
      {/* CENTER-STAGE BROADCAST ANNOUNCEMENT BANNER                     */}
      {/* ============================================================== */}
      {currentEvent && (
        <div className="absolute top-[120px] left-0 w-full flex justify-center z-50 animate-pop-in">
          <CenterStageEventCard event={currentEvent} state={state} />
        </div>
      )}

      {/* ============================================================== */}
      {/* SECONDARY COMPACT CORNER FEED (Top-Right)                      */}
      {/* ============================================================== */}
      <div className="absolute top-[90px] right-8 flex flex-col items-end gap-2.5 z-40">
        {compactFeed.map(evt => (
          <CompactFeedItem key={evt.id} evt={evt} state={state} />
        ))}
      </div>

    </div>
  );
};

// =====================================================================
// CENTER-STAGE COMPONENT: Escapes & Animates Major Broadcast Milestones
// =====================================================================
interface CenterStageProps {
  event: MatchEvent;
  state: any;
}

const CenterStageEventCard: React.FC<CenterStageProps> = ({ event, state }) => {
  const isBlue = event.team === 'blue';
  const team = isBlue ? state.teamBlue : state.teamRed;
  const teamColor = isBlue ? '#2D8CFF' : '#FF4D67';

  // --- 1. VICTORY OVERLAY ---
  if (event.isVictory || event.specialType === 'victory') {
    const winnerTeam = event.winnerTeam || team;
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-[#F5B942] bg-[#0B0F14]/95 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-w-[800px] text-center glow-gold">
        <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-[#F5B942]/20 border border-[#F5B942]/50 text-[#F5B942] text-xs font-mono font-black tracking-widest uppercase mb-3">
          <span>🏆</span>
          <span>MATCH DECIDED</span>
        </div>

        <div className="w-24 h-24 rounded-2xl bg-[#121922] p-3 border-2 border-[#F5B942]/70 shadow-2xl flex items-center justify-center mb-3">
          <img 
            src={winnerTeam.logo} 
            alt="" 
            className="w-full h-full object-contain filter drop-shadow" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/identicon/svg?seed=' + winnerTeam.shortCode;
            }}
          />
        </div>

        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D0] to-[#F5B942] tracking-wider uppercase drop-shadow-[0_4px_16px_rgba(245,185,66,0.6)] leading-none mb-1">
          VICTORY
        </h1>

        <p className="text-xl font-black text-[#F3F6FA] uppercase tracking-widest mt-1">
          {winnerTeam.name}
        </p>

        <span className="text-xs font-mono text-[#9FB0C5] tracking-wider uppercase mt-2">
          SERIES SCORE: {state.teamBlue.seriesScore} - {state.teamRed.seriesScore}
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
    let cardStyle = 'border-[#2D8CFF]/60 glow-blue';
    let gradient = 'from-[#1e293b] via-[#121922] to-[#0B0F14]';
    let titleColor = 'text-[#F3F6FA]';
    let icon = '⚔️';

    if (isSavage) {
      title = state.game === 'mlbb' ? 'SAVAGE' : 'PENTA KILL';
      cardStyle = 'border-2 border-[#F5B942] glow-gold';
      gradient = 'from-[#38260b] via-[#182231] to-[#0B0F14]';
      titleColor = 'text-transparent bg-clip-text bg-gradient-to-b from-[#FFF] to-[#F5B942] drop-shadow-[0_2px_12px_rgba(245,185,66,0.7)]';
      icon = '👑';
    } else if (isManiac) {
      title = 'MANIAC';
      cardStyle = 'border-2 border-[#F59E0B] glow-gold';
      gradient = 'from-[#2b1c09] via-[#121922] to-[#0B0F14]';
      titleColor = 'text-[#F5B942] drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]';
      icon = '🔥';
    } else if (isTriple) {
      title = 'TRIPLE KILL';
      cardStyle = 'border border-[#00D1C7] glow-teal';
      gradient = 'from-[#072428] via-[#121922] to-[#0B0F14]';
      titleColor = 'text-[#00D1C7] drop-shadow-[0_2px_8px_rgba(0,209,199,0.5)]';
      icon = '⚡';
    }

    return (
      <div className={`flex items-center gap-5 px-6 py-3.5 rounded-xl bg-gradient-to-r ${gradient} bg-opacity-95 backdrop-blur-xl shadow-2xl ${cardStyle}`}>
        {/* Killer Hero Avatar */}
        {event.killerHero ? (
          <div className="relative">
            <div className={`w-14 h-14 rounded-xl overflow-hidden border-2 shadow-lg ${isBlue ? 'border-[#2D8CFF]' : 'border-[#FF4D67]'}`}>
              <img 
                src={event.killerHero.avatar} 
                alt="" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/identicon/svg?seed=' + event.killerHero?.name;
                }}
              />
            </div>
            <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-black text-black ${isBlue ? 'bg-[#2D8CFF]' : 'bg-[#FF4D67]'}`}>
              {team.shortCode}
            </span>
          </div>
        ) : (
          <span className="text-3xl">{icon}</span>
        )}

        {/* Multikill Text Banner */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm">{icon}</span>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#9FB0C5] uppercase">
              {event.killerHero?.name || team.name}
            </span>
          </div>
          <h2 className={`text-3xl font-black uppercase tracking-wider leading-none ${titleColor}`}>
            {title}
          </h2>
        </div>
      </div>
    );
  }

  // --- 3. FIRST BLOOD OVERLAY ---
  if (event.isFirstBlood || event.specialType === 'first_blood' || event.multikill === 'first_blood') {
    return (
      <div className="flex items-center gap-6 px-8 py-3.5 rounded-xl border-2 border-[#F5B942] bg-gradient-to-r from-[#2a1d0d]/95 via-[#121922]/95 to-[#0B0F14]/95 backdrop-blur-xl shadow-2xl glow-gold">
        {/* Killer Avatar */}
        {event.killerHero && (
          <div className="relative">
            <div className={`w-14 h-14 rounded-xl overflow-hidden border-2 ${isBlue ? 'border-[#2D8CFF]' : 'border-[#FF4D67]'}`}>
              <img 
                src={event.killerHero.avatar} 
                alt="" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/identicon/svg?seed=' + event.killerHero?.name;
                }}
              />
            </div>
            <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-black text-black ${isBlue ? 'bg-[#2D8CFF]' : 'bg-[#FF4D67]'}`}>
              {team.shortCode}
            </span>
          </div>
        )}

        {/* Center Title */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#F5B942] tracking-widest uppercase">
            <span>🩸</span>
            <span>INITIAL BLOODSHED</span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#FFF] to-[#F5B942] leading-none drop-shadow-[0_2px_8px_rgba(245,185,66,0.6)]">
            FIRST BLOOD
          </h2>
        </div>

        {/* Victim Avatar (Grayscale) */}
        {event.victimHero && (
          <div className="relative opacity-70">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#273244] grayscale">
              <img 
                src={event.victimHero.avatar} 
                alt="" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/identicon/svg?seed=' + event.victimHero?.name;
                }}
              />
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-[#EF4444] text-white">
              FALLEN
            </span>
          </div>
        )}
      </div>
    );
  }

  // --- 4. OBJECTIVES & STEALS (TURTLE, LORD, TYRANT, OVERLORD) ---
  const isSteal = event.isSteal || event.specialType?.includes('steal');
  const isLordOrOverlord = event.specialType?.includes('lord') || event.objective?.id === 'lord' || event.objective?.id === 'shadow_overlord';

  if (event.type === 'objective' || event.specialType?.includes('secured') || isSteal) {
    const objName = event.objective?.name || (isLordOrOverlord ? 'LORD' : 'TURTLE');
    const objIcon = event.objective?.icon || (isLordOrOverlord ? '👑' : '🐢');

    return (
      <div className={`flex items-center gap-5 px-6 py-3.5 rounded-xl backdrop-blur-xl shadow-2xl ${
        isSteal 
          ? 'border-2 border-[#F59E0B] bg-gradient-to-r from-[#381a07]/95 via-[#182231]/95 to-[#0B0F14]/95 glow-gold' 
          : isLordOrOverlord
            ? `border border-[#F5B942]/80 bg-[#121922]/95 glow-gold`
            : `border border-[#00D1C7]/70 bg-[#121922]/95 glow-teal`
      }`}>
        <div className="text-3xl p-2 rounded-lg bg-[#0B0F14]/80 border border-[#273244]">
          {objIcon}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black text-black ${isBlue ? 'bg-[#2D8CFF]' : 'bg-[#FF4D67]'}`}>
              {team.shortCode}
            </span>
            <span className="text-[10px] font-mono font-bold text-[#9FB0C5] uppercase tracking-widest">
              {isSteal ? 'OBJECTIVE HIJACKED' : 'EPIC OBJECTIVE'}
            </span>
          </div>

          <h2 className={`text-2xl font-black uppercase tracking-wider leading-none mt-0.5 ${
            isSteal ? 'text-[#F59E0B]' : isLordOrOverlord ? 'text-[#F5B942]' : 'text-[#00D1C7]'
          }`}>
            {isSteal ? `${objName} STOLEN!` : `${objName} SECURED`}
          </h2>
        </div>
      </div>
    );
  }

  // --- 5. TOWER DESTROYED ---
  if (event.type === 'tower' || event.specialType === 'tower_destroyed') {
    return (
      <div className="flex items-center gap-4 px-5 py-2.5 rounded-xl border border-[#273244] bg-[#121922]/95 backdrop-blur-xl shadow-lg">
        <span className="text-2xl">🏰</span>
        <div>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black text-black mr-2 ${isBlue ? 'bg-[#2D8CFF]' : 'bg-[#FF4D67]'}`}>
            {team.shortCode}
          </span>
          <span className="text-sm font-black text-[#F3F6FA] uppercase tracking-wider">
            TURRET DESTROYED
          </span>
        </div>
      </div>
    );
  }

  // --- 6. SHUTDOWN OVERLAY ---
  if (event.isShutdown || event.specialType === 'shutdown') {
    return (
      <div className="flex items-center gap-4 px-6 py-3 rounded-xl border border-[#EF4444] bg-gradient-to-r from-[#2b0c10]/95 via-[#121922]/95 to-[#0B0F14]/95 backdrop-blur-xl shadow-xl">
        <span className="text-2xl">🛑</span>
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black text-black ${isBlue ? 'bg-[#2D8CFF]' : 'bg-[#FF4D67]'}`}>
              {team.shortCode}
            </span>
            <span className="text-[10px] font-mono font-bold text-[#9FB0C5] uppercase">BOUNTY SECURED</span>
          </div>
          <h2 className="text-xl font-black text-[#FF4D67] uppercase tracking-wider leading-none mt-0.5">
            SHUTDOWN!
          </h2>
        </div>
      </div>
    );
  }

  // --- 7. TEAM WIPEOUT ---
  if (event.specialType === 'wipeout') {
    return (
      <div className="flex items-center gap-4 px-6 py-3 rounded-xl border border-[#F59E0B] bg-[#121922]/95 backdrop-blur-xl shadow-xl glow-gold">
        <span className="text-2xl">💀</span>
        <div>
          <span className="text-[10px] font-mono font-bold text-[#F59E0B] uppercase tracking-widest block">ALL HEROES DEFEATED</span>
          <h2 className="text-2xl font-black text-[#F3F6FA] uppercase tracking-wider leading-none">
            WIPEOUT!
          </h2>
        </div>
      </div>
    );
  }

  // Default Standard Kill Banner
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl border border-[#273244] bg-[#121922]/95 backdrop-blur-xl shadow-lg">
      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black text-black ${isBlue ? 'bg-[#2D8CFF]' : 'bg-[#FF4D67]'}`}>
        {team.shortCode}
      </span>
      <span className="text-sm font-bold text-[#F3F6FA]">
        {event.headline || 'ELIMINATION'}
      </span>
    </div>
  );
};

// =====================================================================
// COMPACT CORNER FEED ITEM (Clean 1920x1080 Secondary Corner Stack)
// =====================================================================
const CompactFeedItem: React.FC<{ evt: MatchEvent; state: any }> = ({ evt, state }) => {
  const isBlue = evt.team === 'blue';
  const team = isBlue ? state.teamBlue : state.teamRed;

  return (
    <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border backdrop-blur-md shadow-md animate-slide-down ${
      isBlue 
        ? 'bg-[#121922]/90 border-[#2D8CFF]/50 text-[#F3F6FA]' 
        : 'bg-[#121922]/90 border-[#FF4D67]/50 text-[#F3F6FA]'
    }`}>
      {/* Team Badge */}
      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-black text-black uppercase ${
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
          <span className="text-xs font-bold text-white max-w-[80px] truncate">
            {evt.killerHero.name}
          </span>
        </div>
      )}

      {/* Event Icon / Action */}
      <div className="text-[11px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-black/40">
        {evt.type === 'kill' && (
          <span className="text-red-400">⚔️ {evt.multikill && evt.multikill !== 'single' ? evt.multikill.toUpperCase() : ''}</span>
        )}
        {evt.type === 'objective' && (
          <span className="text-[#F5B942]">{evt.objective?.icon || '👑'} {evt.isSteal ? 'STOLEN' : 'SECURED'}</span>
        )}
        {evt.type === 'tower' && (
          <span className="text-[#9FB0C5]">🏰 TURRET</span>
        )}
        {evt.isVictory && (
          <span className="text-[#F5B942]">🏆 VICTORY</span>
        )}
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
