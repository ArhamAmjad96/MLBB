import React from 'react';
import { useMatchState } from '../hooks/useMatchState';

export const DraftOverlay: React.FC = () => {
  const { state } = useMatchState();
  const searchParams = new URLSearchParams(window.location.search);
  const strictControl = searchParams.get('strict') === 'true';

  if (!state || (strictControl && !state.overlayControls.showDraft)) {
    return <div className="overlay-canvas bg-transparent" />;
  }

  const { teamBlue, teamRed, draft, game, tournamentName, matchName } = state;
  const activePhase = draft.phases[draft.activePhaseIndex];

  return (
    <div className="overlay-canvas bg-[#070a12] text-white flex flex-col justify-between p-10 select-none overflow-hidden relative">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ================= HEADER ================= */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-5">
        
        {/* Blue Team Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 p-2 border-2 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
            <img src={teamBlue.logo} alt="" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">
              {teamBlue.shortCode} • BLUE SIDE
            </span>
            <h1 className="text-3xl font-black tracking-wide uppercase">{teamBlue.name}</h1>
          </div>
        </div>

        {/* Center Countdown & Match Title */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-slate-400 font-bold mb-1">
            {tournamentName} • {matchName}
          </span>

          <div className="relative flex items-center justify-center">
            <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center bg-slate-950/90 shadow-2xl transition-all ${
              activePhase?.team === 'blue' 
                ? 'border-sky-500 shadow-[0_0_25px_rgba(2,132,199,0.5)]' 
                : 'border-red-500 shadow-[0_0_25px_rgba(220,38,38,0.5)]'
            }`}>
              <span className={`font-mono text-4xl font-black ${
                draft.timerRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-white'
              }`}>
                {draft.timerRemaining}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                {activePhase ? activePhase.type : 'READY'}
              </span>
            </div>
          </div>

          <span className="text-xs font-bold text-amber-400 mt-2 uppercase tracking-wider">
            {activePhase ? `${activePhase.label}` : 'DRAFT PHASE COMPLETED'}
          </span>
        </div>

        {/* Red Team Header */}
        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest">
              RED SIDE • {teamRed.shortCode}
            </span>
            <h1 className="text-3xl font-black tracking-wide uppercase">{teamRed.name}</h1>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-slate-900 p-2 border-2 border-red-400 shadow-[0_0_20px_rgba(248,113,113,0.3)]">
            <img src={teamRed.logo} alt="" className="w-full h-full object-contain" />
          </div>
        </div>

      </div>

      {/* ================= 5v5 PICKS SHOWCASE ================= */}
      <div className="relative z-10 grid grid-cols-2 gap-12 flex-1 my-6 items-center">
        
        {/* Blue 5 Picks */}
        <div className="grid grid-cols-5 gap-3 h-[480px]">
          {teamBlue.picks.map((pick, i) => {
            const isCurrentPick = activePhase?.team === 'blue' && activePhase?.type === 'pick' && activePhase?.slotIndex === i;

            return (
              <div 
                key={i}
                className={`relative rounded-2xl overflow-hidden border-2 bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col justify-end p-3 transition-all ${
                  isCurrentPick 
                    ? 'border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.6)] scale-[1.03] ring-2 ring-sky-300' 
                    : 'border-white/10'
                }`}
              >
                {/* Hero Portrait */}
                {pick.heroAvatar ? (
                  <img 
                    src={pick.heroAvatar} 
                    alt={pick.heroName} 
                    className="absolute inset-0 w-full h-full object-cover object-top opacity-90 transition-transform duration-500" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-slate-700 text-3xl font-black">
                    P{i+1}
                  </div>
                )}

                {/* Dark Gradient Overlay for Typography */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Pick Text Info */}
                <div className="relative z-10">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold block">
                    {pick.role || `Slot ${i+1}`}
                  </span>
                  <h3 className="text-base font-black text-white uppercase leading-tight truncate">
                    {pick.heroName || 'PICKING...'}
                  </h3>
                  <span className="text-[11px] text-slate-300 font-medium truncate block">
                    {pick.playerName || `Player ${i+1}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Red 5 Picks */}
        <div className="grid grid-cols-5 gap-3 h-[480px]">
          {teamRed.picks.map((pick, i) => {
            const isCurrentPick = activePhase?.team === 'red' && activePhase?.type === 'pick' && activePhase?.slotIndex === i;

            return (
              <div 
                key={i}
                className={`relative rounded-2xl overflow-hidden border-2 bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col justify-end p-3 transition-all ${
                  isCurrentPick 
                    ? 'border-red-400 shadow-[0_0_30px_rgba(248,113,113,0.6)] scale-[1.03] ring-2 ring-red-300' 
                    : 'border-white/10'
                }`}
              >
                {/* Hero Portrait */}
                {pick.heroAvatar ? (
                  <img 
                    src={pick.heroAvatar} 
                    alt={pick.heroName} 
                    className="absolute inset-0 w-full h-full object-cover object-top opacity-90 transition-transform duration-500" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-slate-700 text-3xl font-black">
                    P{i+1}
                  </div>
                )}

                {/* Dark Gradient Overlay for Typography */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Pick Text Info */}
                <div className="relative z-10 text-right">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold block">
                    {pick.role || `Slot ${i+1}`}
                  </span>
                  <h3 className="text-base font-black text-white uppercase leading-tight truncate">
                    {pick.heroName || 'PICKING...'}
                  </h3>
                  <span className="text-[11px] text-slate-300 font-medium truncate block">
                    {pick.playerName || `Player ${i+1}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ================= BANS FOOTER ================= */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4">
        
        {/* Blue Bans */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold uppercase text-slate-400">BLUE BANS:</span>
          <div className="flex items-center gap-2">
            {teamBlue.bans.map((ban, i) => (
              <div 
                key={i}
                className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden relative flex items-center justify-center shadow-md"
              >
                {ban.heroAvatar ? (
                  <>
                    <img src={ban.heroAvatar} alt="" className="w-full h-full object-cover grayscale contrast-125" />
                    <div className="absolute inset-0 bg-red-950/60 flex items-center justify-center font-black text-red-400 text-lg">
                      ✕
                    </div>
                  </>
                ) : (
                  <span className="text-xs font-mono font-bold text-slate-600">B{i+1}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Game Mode Pill */}
        <div className="px-4 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
          {game === 'mlbb' ? 'MOBILE LEGENDS: BANG BANG' : 'HONOR OF KINGS'}
        </div>

        {/* Red Bans */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {teamRed.bans.map((ban, i) => (
              <div 
                key={i}
                className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden relative flex items-center justify-center shadow-md"
              >
                {ban.heroAvatar ? (
                  <>
                    <img src={ban.heroAvatar} alt="" className="w-full h-full object-cover grayscale contrast-125" />
                    <div className="absolute inset-0 bg-red-950/60 flex items-center justify-center font-black text-red-400 text-lg">
                      ✕
                    </div>
                  </>
                ) : (
                  <span className="text-xs font-mono font-bold text-slate-600">B{i+1}</span>
                )}
              </div>
            ))}
          </div>
          <span className="text-xs font-mono font-bold uppercase text-slate-400">:RED BANS</span>
        </div>

      </div>

    </div>
  );
};
