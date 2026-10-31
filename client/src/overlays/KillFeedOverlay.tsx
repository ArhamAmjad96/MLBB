import React, { useEffect, useState } from 'react';
import { useMatchState } from '../hooks/useMatchState';
import { MatchEvent } from '../../../shared/types';

export const KillFeedOverlay: React.FC = () => {
  const { state, lastUndoneEventId } = useMatchState();
  const [activeAnnouncements, setActiveAnnouncements] = useState<MatchEvent[]>([]);

  // When an event is undone via WebSocket, purge it immediately from the on-air graphic
  useEffect(() => {
    if (lastUndoneEventId) {
      setActiveAnnouncements(prev => prev.filter(e => e.id !== lastUndoneEventId));
    }
  }, [lastUndoneEventId]);

  useEffect(() => {
    if (!state || state.events.length === 0) return;
    const latestEvent = state.events[0];

    // Check if event is recent (within 7 seconds)
    const isRecent = Date.now() - latestEvent.realTimestamp < 7000;
    if (isRecent) {
      setActiveAnnouncements(prev => {
        if (prev.some(e => e.id === latestEvent.id)) return prev;
        return [latestEvent, ...prev].slice(0, 4);
      });

      const timer = setTimeout(() => {
        setActiveAnnouncements(prev => prev.filter(e => e.id !== latestEvent.id));
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [state?.events]);

  if (!state || !state.overlayControls.showFeed) {
    return <div className="overlay-canvas bg-transparent" />;
  }

  return (
    <div className="overlay-canvas bg-transparent select-none pointer-events-none p-8 flex flex-col items-end gap-3">
      {activeAnnouncements.map((evt) => {
        const isBlue = evt.team === 'blue';
        const teamName = isBlue ? state.teamBlue.shortCode : state.teamRed.shortCode;

        return (
          <div 
            key={evt.id}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border backdrop-blur-md transition-all animate-bounce-in ${
              isBlue 
                ? 'bg-[#0b1b33]/90 border-sky-400 text-sky-100' 
                : 'bg-[#330f14]/90 border-red-500 text-red-100'
            }`}
          >
            {/* Team Pill */}
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider ${
              isBlue ? 'bg-sky-500 text-black' : 'bg-red-500 text-white'
            }`}>
              {teamName}
            </span>

            {/* Killer */}
            {evt.killerHero && (
              <div className="flex items-center gap-2">
                <img 
                  src={evt.killerHero.avatar} 
                  alt="" 
                  className="w-8 h-8 rounded-full border border-white/30 object-cover" 
                />
                <span className="font-extrabold text-sm text-white">
                  {evt.killerHero.name}
                </span>
              </div>
            )}

            {/* Event Icon or Multikill Badge */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-black/50 rounded-lg">
              {evt.type === 'kill' && (
                <>
                  <span className="text-red-400 font-bold text-xs">⚔️</span>
                  {evt.multikill && evt.multikill !== 'single' && (
                    <span className="text-[11px] font-mono font-black text-amber-400 uppercase tracking-wider">
                      {evt.multikill.replace('_', ' ')}
                    </span>
                  )}
                </>
              )}
              {evt.type === 'objective' && (
                <span className="text-xs font-bold text-amber-300">
                  {evt.objective?.icon} SECURED {evt.objective?.name}
                </span>
              )}
              {evt.type === 'tower' && (
                <span className="text-xs font-bold text-yellow-300">
                  🏰 TURRET DESTROYED
                </span>
              )}
            </div>

            {/* Victim (if kill) */}
            {evt.victimHero && (
              <div className="flex items-center gap-2 opacity-80">
                <span className="font-medium text-xs text-slate-300">
                  {evt.victimHero.name}
                </span>
                <img 
                  src={evt.victimHero.avatar} 
                  alt="" 
                  className="w-7 h-7 rounded-full border border-white/20 object-cover grayscale" 
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
