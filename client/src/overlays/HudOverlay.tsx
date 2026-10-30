import React from 'react';
import { useMatchState } from '../hooks/useMatchState';
import { formatTime } from '../utils/formatters';

// Clean SVG Vector Icons for Broadcast (No amateur emojis)
const TurretIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-slate-300">
    <path d="M4 21h16v-2H4v2zm2-4h12v-2H6v2zm1-4h10V9H7v4zm-1-6h2V4H6v3zm4 0h4V4h-4v3zm6 0h2V4h-2v3zM5 2h14a1 1 0 011 1v19a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z" />
  </svg>
);

const TurtleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#00D1C7]">
    <path d="M12 2a4 4 0 00-4 4c0 .7.18 1.35.5 1.93A7.96 7.96 0 004 15c0 3.87 3.13 7 7 7s7-3.13 7-7a7.96 7.96 0 00-4.5-7.07c.32-.58.5-1.23.5-1.93a4 4 0 00-4-4zm0 2a2 2 0 110 4 2 2 0 010-4zm0 6c2.76 0 5 2.24 5 5 0 2.22-1.46 4.1-3.5 4.74V15.5a1.5 1.5 0 00-3 0v4.24A5.002 5.002 0 017 15c0-2.76 2.24-5 5-5z" />
  </svg>
);

const LordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#F5B942]">
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
  </svg>
);

export const HudOverlay: React.FC = () => {
  const { state } = useMatchState();
  const searchParams = new URLSearchParams(window.location.search);
  const strictControl = searchParams.get('strict') === 'true';

  if (!state || (strictControl && !state.overlayControls.showHud)) {
    return <div className="overlay-canvas bg-transparent" />;
  }

  const { teamBlue, teamRed, clockSeconds, tournamentName, currentGameNumber, format, game } = state;
  const isMlbb = game === 'mlbb';

  // Total games needed to win series (e.g. BO3 -> 2 wins, BO5 -> 3 wins)
  const totalPips = format === 'BO1' ? 1 : format === 'BO5' ? 3 : format === 'BO7' ? 4 : 2;

  return (
    <div className="overlay-canvas bg-transparent select-none">
      
      {/* ============================================================== */}
      {/* MPL-GRADE ANGLED CHASSIS TOP SCOREBOARD                        */}
      {/* ============================================================== */}
      <div className="w-full flex items-start justify-center pt-3 px-8">
        <div className="flex items-stretch shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
          
          {/* ========================================================== */}
          {/* 1. BLUE TEAM WING (ANGLED MPL CHASSIS)                     */}
          {/* ========================================================== */}
          <div className="flex items-stretch h-[64px] bg-gradient-to-r from-[#0d141f] via-[#101826] to-[#121c2d] border-y border-l border-white/15 mpl-cut-left relative overflow-hidden pr-6 pl-4">
            
            {/* Team Primary Color Neon Underglow */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2D8CFF] to-transparent shadow-[0_0_12px_#2D8CFF]" />
            <div className="absolute bottom-0 left-0 w-1.5 h-full bg-[#2D8CFF]" />

            <div className="flex items-center gap-3.5 relative z-10">
              
              {/* Team Crest / Logo (Shield Bezel) */}
              <div className="w-11 h-11 rounded-lg bg-gradient-to-b from-[#1a2536] to-[#0a0f17] p-1.5 border border-[#2D8CFF]/50 shadow-[0_0_12px_rgba(45,140,255,0.3)] flex items-center justify-center shrink-0">
                <img 
                  src={teamBlue.logo} 
                  alt="" 
                  className="w-full h-full object-contain filter drop-shadow" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/identicon/svg?seed=Blue';
                  }}
                />
              </div>

              {/* Team Names in Esports Display Font */}
              <div className="flex flex-col justify-center min-w-[90px] max-w-[150px]">
                <span className="font-display text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-[#2D8CFF] uppercase leading-none">
                  {teamBlue.shortCode || 'BLUE'}
                </span>
                <h2 className="font-rajdhani text-xs font-bold text-slate-300 uppercase tracking-widest truncate leading-tight mt-0.5">
                  {teamBlue.name}
                </h2>
              </div>

              {/* Series Score Diamond Gems (MPL Bo3/Bo5 Pips) */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 rounded-md border border-white/10" title={`Series Score: ${teamBlue.seriesScore}`}>
                {Array.from({ length: totalPips }).map((_, i) => {
                  const isWon = i < teamBlue.seriesScore;
                  return (
                    <div 
                      key={i} 
                      className={`w-2.5 h-2.5 rotate-45 transition-all ${
                        isWon 
                          ? 'bg-[#2D8CFF] shadow-[0_0_8px_#2D8CFF] border border-white/60' 
                          : 'bg-slate-800 border border-slate-700'
                      }`} 
                    />
                  );
                })}
              </div>

              {/* Compact Secondary Objective Badges (Vector SVGs) */}
              <div className="flex items-center gap-2.5 px-3 py-1 bg-black/60 rounded-md border border-white/10 text-xs font-rajdhani font-bold">
                {/* Turrets */}
                <div className="flex items-center gap-1 text-slate-200" title="Turrets Destroyed">
                  <TurretIcon />
                  <span className="font-mono text-xs">{teamBlue.towers}</span>
                </div>

                <div className="w-[1px] h-3 bg-white/10" />

                {/* Turtle */}
                <div className="flex items-center gap-1" title={isMlbb ? "Turtles Secured" : "Tyrants Secured"}>
                  <TurtleIcon />
                  <span className="font-mono text-xs text-[#00D1C7]">
                    {teamBlue.objectives[isMlbb ? 'turtle' : 'primal_tyrant'] || 0}
                  </span>
                </div>

                {/* Lord */}
                <div className="flex items-center gap-1" title={isMlbb ? "Lords Secured" : "Overlords Secured"}>
                  <LordIcon />
                  <span className="font-mono text-xs text-[#F5B942]">
                    {teamBlue.objectives[isMlbb ? 'lord' : 'shadow_overlord'] || 0}
                  </span>
                </div>
              </div>

              {/* Kills Counter (Hero Metric Angled Pill) */}
              <div className="px-4 py-0.5 bg-gradient-to-b from-[#2D8CFF] to-[#1257c7] rounded-md border border-[#7bb3ff]/80 shadow-[0_0_18px_rgba(45,140,255,0.6)] flex flex-col items-center justify-center min-w-[56px] h-[50px]">
                <span className="text-[8px] font-rajdhani uppercase tracking-widest font-black text-blue-100 leading-none">KILLS</span>
                <span className="font-display text-3xl font-bold tracking-tight text-white leading-none mt-0.5">
                  {teamBlue.kills}
                </span>
              </div>

            </div>
          </div>

          {/* ========================================================== */}
          {/* 2. CENTER HEXAGONAL MATCH CLOCK & TOURNAMENT HUB           */}
          {/* ========================================================== */}
          <div className="flex flex-col items-center justify-center min-w-[150px] h-[64px] bg-gradient-to-b from-[#141a24] to-[#070b10] border-y border-white/20 mpl-hex-center px-6 relative z-20 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            
            {/* Top Game Stage Banner */}
            <div className="flex items-center gap-1.5 px-2 py-0.2 rounded bg-gradient-to-r from-transparent via-[#00D1C7]/20 to-transparent">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D1C7] animate-pulse" />
              <span className="font-rajdhani text-[10px] font-black uppercase tracking-widest text-[#00D1C7] leading-tight">
                GAME {currentGameNumber} • {format}
              </span>
            </div>

            {/* Central High-Contrast Match Clock */}
            <div className="font-mono text-2xl font-black text-[#F5B942] tracking-wider leading-none drop-shadow-[0_2px_10px_rgba(245,185,66,0.6)] mt-0.5">
              {formatTime(clockSeconds)}
            </div>

            {/* Tournament Subtitle */}
            <span className="font-rajdhani text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px] mt-0.5 leading-none">
              {tournamentName || 'MARK47 PRO LEAGUE'}
            </span>
          </div>

          {/* ========================================================== */}
          {/* 3. RED TEAM WING (ANGLED MPL CHASSIS)                      */}
          {/* ========================================================== */}
          <div className="flex items-stretch h-[64px] bg-gradient-to-l from-[#1f0d12] via-[#261016] to-[#2d121a] border-y border-r border-white/15 mpl-cut-right relative overflow-hidden pl-6 pr-4">
            
            {/* Team Primary Color Neon Underglow */}
            <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-[#FF4D67] to-transparent shadow-[0_0_12px_#FF4D67]" />
            <div className="absolute bottom-0 right-0 w-1.5 h-full bg-[#FF4D67]" />

            <div className="flex items-center gap-3.5 relative z-10">
              
              {/* Kills Counter (Hero Metric Angled Pill) */}
              <div className="px-4 py-0.5 bg-gradient-to-b from-[#FF4D67] to-[#ba1a34] rounded-md border border-[#ff8598]/80 shadow-[0_0_18px_rgba(255,77,103,0.6)] flex flex-col items-center justify-center min-w-[56px] h-[50px]">
                <span className="text-[8px] font-rajdhani uppercase tracking-widest font-black text-red-100 leading-none">KILLS</span>
                <span className="font-display text-3xl font-bold tracking-tight text-white leading-none mt-0.5">
                  {teamRed.kills}
                </span>
              </div>

              {/* Compact Secondary Objective Badges (Vector SVGs) */}
              <div className="flex items-center gap-2.5 px-3 py-1 bg-black/60 rounded-md border border-white/10 text-xs font-rajdhani font-bold">
                {/* Lord */}
                <div className="flex items-center gap-1" title={isMlbb ? "Lords Secured" : "Overlords Secured"}>
                  <span className="font-mono text-xs text-[#F5B942]">
                    {teamRed.objectives[isMlbb ? 'lord' : 'shadow_overlord'] || 0}
                  </span>
                  <LordIcon />
                </div>

                {/* Turtle */}
                <div className="flex items-center gap-1" title={isMlbb ? "Turtles Secured" : "Tyrants Secured"}>
                  <span className="font-mono text-xs text-[#00D1C7]">
                    {teamRed.objectives[isMlbb ? 'turtle' : 'primal_tyrant'] || 0}
                  </span>
                  <TurtleIcon />
                </div>

                <div className="w-[1px] h-3 bg-white/10" />

                {/* Turrets */}
                <div className="flex items-center gap-1 text-slate-200" title="Turrets Destroyed">
                  <span className="font-mono text-xs">{teamRed.towers}</span>
                  <TurretIcon />
                </div>
              </div>

              {/* Series Score Diamond Gems (MPL Bo3/Bo5 Pips) */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 rounded-md border border-white/10" title={`Series Score: ${teamRed.seriesScore}`}>
                {Array.from({ length: totalPips }).map((_, i) => {
                  const isWon = i < teamRed.seriesScore;
                  return (
                    <div 
                      key={i} 
                      className={`w-2.5 h-2.5 rotate-45 transition-all ${
                        isWon 
                          ? 'bg-[#FF4D67] shadow-[0_0_8px_#FF4D67] border border-white/60' 
                          : 'bg-slate-800 border border-slate-700'
                      }`} 
                    />
                  );
                })}
              </div>

              {/* Team Names in Esports Display Font */}
              <div className="flex flex-col justify-center text-right min-w-[90px] max-w-[150px]">
                <span className="font-display text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-l from-white to-[#FF4D67] uppercase leading-none">
                  {teamRed.shortCode || 'RED'}
                </span>
                <h2 className="font-rajdhani text-xs font-bold text-slate-300 uppercase tracking-widest truncate leading-tight mt-0.5">
                  {teamRed.name}
                </h2>
              </div>

              {/* Team Crest / Logo (Shield Bezel) */}
              <div className="w-11 h-11 rounded-lg bg-gradient-to-b from-[#361a20] to-[#170a0d] p-1.5 border border-[#FF4D67]/50 shadow-[0_0_12px_rgba(255,77,103,0.3)] flex items-center justify-center shrink-0">
                <img 
                  src={teamRed.logo} 
                  alt="" 
                  className="w-full h-full object-contain filter drop-shadow" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/identicon/svg?seed=Red';
                  }}
                />
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
