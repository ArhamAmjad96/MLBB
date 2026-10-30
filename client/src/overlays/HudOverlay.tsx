import React from 'react';
import { useMatchState } from '../hooks/useMatchState';
import { formatTime } from '../utils/formatters';

export const HudOverlay: React.FC = () => {
  const { state } = useMatchState();
  const searchParams = new URLSearchParams(window.location.search);
  const strictControl = searchParams.get('strict') === 'true';

  if (!state || (strictControl && !state.overlayControls.showHud)) {
    return <div className="overlay-canvas bg-transparent" />;
  }

  const { teamBlue, teamRed, clockSeconds, tournamentName, currentGameNumber, format, game } = state;
  const isMlbb = game === 'mlbb';

  return (
    <div className="overlay-canvas bg-transparent select-none">
      
      {/* Centered Top Scoreboard HUD (1920x1080 Viewport) */}
      <div className="w-full flex items-start justify-center pt-3 px-8">
        <div className="flex items-stretch h-[68px] rounded-xl overflow-hidden glass-top-hud shadow-[0_16px_40px_rgba(0,0,0,0.85)] border border-[#273244]">
          
          {/* ================= BLUE TEAM WING ================= */}
          <div className="flex items-center gap-3.5 pl-4 pr-3 py-1.5 bg-gradient-to-r from-[#2D8CFF]/15 via-transparent to-transparent">
            
            {/* Team Edge Accent Bar */}
            <div className="w-1.5 h-10 rounded-full bg-[#2D8CFF] shadow-[0_0_10px_#2D8CFF]" />

            {/* Team Logo */}
            <div className="w-11 h-11 rounded-lg bg-[#0B0F14]/90 p-1 border border-[#2D8CFF]/40 shadow-inner flex items-center justify-center shrink-0">
              <img 
                src={teamBlue.logo} 
                alt="" 
                className="w-full h-full object-contain filter drop-shadow" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/identicon/svg?seed=Blue';
                }}
              />
            </div>

            {/* Team Names */}
            <div className="text-left min-w-[90px] max-w-[150px]">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#2D8CFF] uppercase block leading-none mb-0.5">
                {teamBlue.shortCode || 'BLUE'}
              </span>
              <h2 className="text-sm font-black text-[#F3F6FA] uppercase tracking-wide truncate leading-tight">
                {teamBlue.name}
              </h2>
            </div>

            {/* Series Score Badge */}
            <div className="flex items-center gap-1 px-2 py-1 bg-[#121922]/90 rounded-md border border-[#273244]">
              <span className="text-[9px] font-mono font-bold text-[#9FB0C5]">SERIES</span>
              <span className="text-sm font-mono font-black text-[#2D8CFF]">{teamBlue.seriesScore}</span>
            </div>

            {/* Compact Secondary Indicators (Towers & Bosses) */}
            <div className="flex items-center gap-2 px-2.5 py-1 bg-[#0B0F14]/80 rounded-md border border-[#273244]/80 text-[11px] font-mono font-bold">
              {/* Towers */}
              <div className="flex items-center gap-1 text-[#F3F6FA]" title="Turrets Destroyed">
                <span className="text-xs">🏰</span>
                <span className="text-[#9FB0C5]">{teamBlue.towers}</span>
              </div>

              <div className="w-[1px] h-3 bg-[#273244]" />

              {/* Objectives */}
              {isMlbb ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5" title="Turtle Secured">
                    <span className="text-xs">🐢</span>
                    <span className="text-[#00D1C7]">{teamBlue.objectives['turtle'] || 0}</span>
                  </div>
                  <div className="flex items-center gap-0.5" title="Lord Secured">
                    <span className="text-xs">👑</span>
                    <span className="text-[#F5B942]">{teamBlue.objectives['lord'] || 0}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5" title="Tyrant Secured">
                    <span className="text-xs">🐉</span>
                    <span className="text-[#00D1C7]">{teamBlue.objectives['primal_tyrant'] || 0}</span>
                  </div>
                  <div className="flex items-center gap-0.5" title="Overlord Secured">
                    <span className="text-xs">🐲</span>
                    <span className="text-[#F5B942]">{teamBlue.objectives['shadow_overlord'] || 0}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Kills Counter (Hero Metric) */}
            <div className="px-3.5 py-1 bg-gradient-to-b from-[#2D8CFF] to-[#1a5bc9] text-white rounded-lg shadow-[0_0_15px_rgba(45,140,255,0.4)] border border-[#2D8CFF]/60 flex flex-col items-center justify-center min-w-[50px]">
              <span className="text-[8px] uppercase tracking-wider font-extrabold text-blue-100 leading-none">KILLS</span>
              <span className="text-2xl font-black font-mono leading-none tracking-tight text-white">{teamBlue.kills}</span>
            </div>

          </div>

          {/* ================= CENTER MATCH CLOCK & TOURNAMENT HUB ================= */}
          <div className="px-5 py-1.5 bg-[#0B0F14]/95 flex flex-col items-center justify-center min-w-[150px] border-x border-[#273244] shadow-inner">
            
            {/* Game Number & Format Pill */}
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D1C7] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00D1C7]">
                GAME {currentGameNumber} • {format}
              </span>
            </div>

            {/* Match Clock */}
            <div className="text-2xl font-mono font-black text-[#F5B942] tracking-wider leading-none drop-shadow-[0_2px_8px_rgba(245,185,66,0.4)]">
              {formatTime(clockSeconds)}
            </div>

            {/* Tournament Label */}
            <span className="text-[8px] font-mono font-bold text-[#9FB0C5] uppercase tracking-widest truncate max-w-[130px] mt-0.5">
              {tournamentName || 'MARK47 PRO LEAGUE'}
            </span>
          </div>

          {/* ================= RED TEAM WING ================= */}
          <div className="flex items-center gap-3.5 pl-3 pr-4 py-1.5 bg-gradient-to-l from-[#FF4D67]/15 via-transparent to-transparent">
            
            {/* Kills Counter (Hero Metric) */}
            <div className="px-3.5 py-1 bg-gradient-to-b from-[#FF4D67] to-[#c72740] text-white rounded-lg shadow-[0_0_15px_rgba(255,77,103,0.4)] border border-[#FF4D67]/60 flex flex-col items-center justify-center min-w-[50px]">
              <span className="text-[8px] uppercase tracking-wider font-extrabold text-red-100 leading-none">KILLS</span>
              <span className="text-2xl font-black font-mono leading-none tracking-tight text-white">{teamRed.kills}</span>
            </div>

            {/* Compact Secondary Indicators (Objectives & Towers) */}
            <div className="flex items-center gap-2 px-2.5 py-1 bg-[#0B0F14]/80 rounded-md border border-[#273244]/80 text-[11px] font-mono font-bold">
              {/* Objectives */}
              {isMlbb ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5" title="Lord Secured">
                    <span className="text-[#F5B942]">{teamRed.objectives['lord'] || 0}</span>
                    <span className="text-xs">👑</span>
                  </div>
                  <div className="flex items-center gap-0.5" title="Turtle Secured">
                    <span className="text-[#00D1C7]">{teamRed.objectives['turtle'] || 0}</span>
                    <span className="text-xs">🐢</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5" title="Overlord Secured">
                    <span className="text-[#F5B942]">{teamRed.objectives['shadow_overlord'] || 0}</span>
                    <span className="text-xs">🐲</span>
                  </div>
                  <div className="flex items-center gap-0.5" title="Tyrant Secured">
                    <span className="text-[#00D1C7]">{teamRed.objectives['primal_tyrant'] || 0}</span>
                    <span className="text-xs">🐉</span>
                  </div>
                </div>
              )}

              <div className="w-[1px] h-3 bg-[#273244]" />

              {/* Towers */}
              <div className="flex items-center gap-1 text-[#F3F6FA]" title="Turrets Destroyed">
                <span className="text-[#9FB0C5]">{teamRed.towers}</span>
                <span className="text-xs">🏰</span>
              </div>
            </div>

            {/* Series Score Badge */}
            <div className="flex items-center gap-1 px-2 py-1 bg-[#121922]/90 rounded-md border border-[#273244]">
              <span className="text-sm font-mono font-black text-[#FF4D67]">{teamRed.seriesScore}</span>
              <span className="text-[9px] font-mono font-bold text-[#9FB0C5]">SERIES</span>
            </div>

            {/* Team Names */}
            <div className="text-right min-w-[90px] max-w-[150px]">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#FF4D67] uppercase block leading-none mb-0.5">
                {teamRed.shortCode || 'RED'}
              </span>
              <h2 className="text-sm font-black text-[#F3F6FA] uppercase tracking-wide truncate leading-tight">
                {teamRed.name}
              </h2>
            </div>

            {/* Team Logo */}
            <div className="w-11 h-11 rounded-lg bg-[#0B0F14]/90 p-1 border border-[#FF4D67]/40 shadow-inner flex items-center justify-center shrink-0">
              <img 
                src={teamRed.logo} 
                alt="" 
                className="w-full h-full object-contain filter drop-shadow" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/identicon/svg?seed=Red';
                }}
              />
            </div>

            {/* Team Edge Accent Bar */}
            <div className="w-1.5 h-10 rounded-full bg-[#FF4D67] shadow-[0_0_10px_#FF4D67]" />

          </div>

        </div>
      </div>

    </div>
  );
};
