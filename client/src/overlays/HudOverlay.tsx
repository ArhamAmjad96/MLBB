import React from 'react';
import { useMatchState } from '../hooks/useMatchState';
import { formatTime, formatGold } from '../utils/formatters';

export const HudOverlay: React.FC = () => {
  const { state } = useMatchState();

  if (!state || !state.overlayControls.showHud) {
    return <div className="overlay-canvas bg-transparent" />;
  }

  const { teamBlue, teamRed, clockSeconds, tournamentName, currentGameNumber, format, game } = state;
  const isMlbb = game === 'mlbb';

  return (
    <div className="overlay-canvas bg-transparent select-none">
      
      {/* Top HUD Banner (Centered 1920x1080 Viewport) */}
      <div className="w-full flex items-start justify-center pt-5 px-12">
        <div className="flex items-stretch shadow-[0_15px_35px_rgba(0,0,0,0.85)] rounded-2xl overflow-hidden border border-white/10 bg-[#0a0e17]/95 backdrop-blur-md">
          
          {/* ================= BLUE TEAM WING ================= */}
          <div className="flex items-center gap-4 pl-6 pr-4 py-2 bg-gradient-to-r from-sky-950/80 to-slate-900 border-r border-sky-500/30">
            {/* Logo */}
            <div className="w-12 h-12 rounded-xl bg-slate-900/90 p-1.5 border border-sky-400/40 shadow-md flex items-center justify-center">
              <img src={teamBlue.logo} alt="" className="w-full h-full object-contain" />
            </div>

            {/* Team Info */}
            <div className="text-left">
              <span className="text-[11px] font-mono font-bold tracking-widest text-sky-400 uppercase">
                {teamBlue.shortCode}
              </span>
              <h2 className="text-lg font-black text-white uppercase tracking-wide leading-tight">
                {teamBlue.name}
              </h2>
            </div>

            {/* Series Score Dots */}
            <div className="flex items-center gap-1.5 ml-2 px-2.5 py-1 bg-slate-950/80 rounded-lg border border-sky-500/30">
              <span className="text-[10px] font-mono text-slate-400 font-bold mr-1">PTS</span>
              <span className="text-xl font-mono font-black text-sky-400">{teamBlue.seriesScore}</span>
            </div>

            {/* Kills Counter (Hero Metric) */}
            <div className="px-4 py-1.5 bg-gradient-to-b from-sky-600 to-sky-800 text-white rounded-xl shadow-lg border border-sky-400/50 flex flex-col items-center justify-center min-w-[58px]">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-sky-200">KILLS</span>
              <span className="text-2xl font-black font-mono leading-none tracking-tight">{teamBlue.kills}</span>
            </div>

            {/* Secondary Stats (Gold, Towers, Objectives) */}
            <div className="flex items-center gap-3 text-xs font-mono font-bold px-3 py-1 bg-slate-950/60 rounded-xl border border-slate-800">
              {/* Gold */}
              <div className="flex items-center gap-1 text-yellow-400">
                <span>💰</span>
                <span>{formatGold(teamBlue.gold)}</span>
              </div>

              {/* Towers */}
              <div className="flex items-center gap-1 text-amber-400">
                <span>🏰</span>
                <span>{teamBlue.towers}</span>
              </div>

              {/* Objectives */}
              {isMlbb ? (
                <div className="flex items-center gap-2">
                  <span title="Turtle">🐢 {teamBlue.objectives['turtle'] || 0}</span>
                  <span title="Lord">👑 {teamBlue.objectives['lord'] || 0}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span title="Tyrant">🐉 {teamBlue.objectives['primal_tyrant'] || 0}</span>
                  <span title="Overlord">🐲 {teamBlue.objectives['shadow_overlord'] || 0}</span>
                </div>
              )}
            </div>
          </div>

          {/* ================= CENTER MATCH CLOCK & TOURNAMENT ================= */}
          <div className="px-6 py-2 bg-slate-950 flex flex-col items-center justify-center min-w-[170px] border-x border-slate-800">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
              GAME {currentGameNumber} • {format}
            </span>
            <div className="text-2xl font-mono font-black text-amber-400 tracking-widest leading-tight">
              {formatTime(clockSeconds)}
            </div>
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider truncate max-w-[140px]">
              {tournamentName}
            </span>
          </div>

          {/* ================= RED TEAM WING ================= */}
          <div className="flex items-center gap-4 pl-4 pr-6 py-2 bg-gradient-to-l from-red-950/80 to-slate-900 border-l border-red-500/30">
            {/* Secondary Stats (Objectives, Towers, Gold) */}
            <div className="flex items-center gap-3 text-xs font-mono font-bold px-3 py-1 bg-slate-950/60 rounded-xl border border-slate-800">
              {/* Objectives */}
              {isMlbb ? (
                <div className="flex items-center gap-2">
                  <span title="Lord">{teamRed.objectives['lord'] || 0} 👑</span>
                  <span title="Turtle">{teamRed.objectives['turtle'] || 0} 🐢</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span title="Overlord">{teamRed.objectives['shadow_overlord'] || 0} 🐲</span>
                  <span title="Tyrant">{teamRed.objectives['primal_tyrant'] || 0} 🐉</span>
                </div>
              )}

              {/* Towers */}
              <div className="flex items-center gap-1 text-amber-400">
                <span>{teamRed.towers}</span>
                <span>🏰</span>
              </div>

              {/* Gold */}
              <div className="flex items-center gap-1 text-yellow-400">
                <span>{formatGold(teamRed.gold)}</span>
                <span>💰</span>
              </div>
            </div>

            {/* Kills Counter (Hero Metric) */}
            <div className="px-4 py-1.5 bg-gradient-to-b from-red-600 to-red-800 text-white rounded-xl shadow-lg border border-red-400/50 flex flex-col items-center justify-center min-w-[58px]">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-red-200">KILLS</span>
              <span className="text-2xl font-black font-mono leading-none tracking-tight">{teamRed.kills}</span>
            </div>

            {/* Series Score Dots */}
            <div className="flex items-center gap-1.5 mr-2 px-2.5 py-1 bg-slate-950/80 rounded-lg border border-red-500/30">
              <span className="text-xl font-mono font-black text-red-400">{teamRed.seriesScore}</span>
              <span className="text-[10px] font-mono text-slate-400 font-bold ml-1">PTS</span>
            </div>

            {/* Team Info */}
            <div className="text-right">
              <span className="text-[11px] font-mono font-bold tracking-widest text-red-400 uppercase">
                {teamRed.shortCode}
              </span>
              <h2 className="text-lg font-black text-white uppercase tracking-wide leading-tight">
                {teamRed.name}
              </h2>
            </div>

            {/* Logo */}
            <div className="w-12 h-12 rounded-xl bg-slate-900/90 p-1.5 border border-red-400/40 shadow-md flex items-center justify-center">
              <img src={teamRed.logo} alt="" className="w-full h-full object-contain" />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
