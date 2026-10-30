import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Trophy, 
  Gamepad2, 
  Tv, 
  Users, 
  Swords, 
  Radio, 
  Play, 
  Pause 
} from 'lucide-react';
import { MatchLiveState, GameType } from '../../../shared/types';
import { api } from '../services/api';
import { formatTime } from '../utils/formatters';

interface NavigationProps {
  state: MatchLiveState | null;
  isConnected: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ state, isConnected }) => {
  const isMlbb = state?.game === 'mlbb';

  const handleGameSwitch = async (targetGame: GameType) => {
    if (state?.game === targetGame) return;
    await api.switchGame(targetGame);
  };

  const handleClockToggle = async () => {
    await api.toggleClock();
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F14]/95 backdrop-blur-md border-b border-[#273244] text-[#F3F6FA] px-4 py-2.5 shadow-lg select-none font-sans">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Game Mode Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00D1C7] via-[#2D8CFF] to-[#F5B942] flex items-center justify-center font-black tracking-wider text-xs text-black shadow-md">
              47
            </div>
            <div>
              <span className="font-black tracking-wider text-base text-[#F3F6FA] block leading-none">MARK47</span>
              <span className="text-[9px] block text-[#9FB0C5] font-mono font-bold tracking-widest mt-0.5">ESPORTS PRODUCTION</span>
            </div>
          </div>

          {/* Game Switcher Pill */}
          <div className="flex items-center bg-[#121922] p-1 rounded-lg border border-[#273244]">
            <button
              onClick={() => handleGameSwitch('mlbb')}
              className={`px-3 py-1 text-xs font-black rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                isMlbb 
                  ? 'bg-[#2D8CFF] text-white shadow-[0_0_12px_rgba(45,140,255,0.5)]' 
                  : 'text-[#9FB0C5] hover:text-[#F3F6FA]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-200"></span>
              MLBB
            </button>
            <button
              onClick={() => handleGameSwitch('hok')}
              className={`px-3 py-1 text-xs font-black rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                !isMlbb 
                  ? 'bg-[#F59E0B] text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]' 
                  : 'text-[#9FB0C5] hover:text-[#F3F6FA]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
              HOK
            </button>
          </div>
        </div>

        {/* Center: Live Match Status & Quick Clock */}
        {state && (
          <div className="hidden lg:flex items-center gap-4 bg-[#121922] px-4 py-1.5 rounded-xl border border-[#273244]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#9FB0C5]">{state.tournamentName}</span>
              <span className="text-[#273244]">•</span>
              <span className="text-xs font-black text-[#F3F6FA]">{state.matchName}</span>
            </div>

            <div className="h-4 w-[1px] bg-[#273244]"></div>

            {/* Quick Match Score */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-[#2D8CFF] font-black">{state.teamBlue.shortCode}</span>
              <span className="bg-[#0B0F14] px-2 py-0.5 rounded text-[#F3F6FA] font-mono border border-[#273244]">{state.teamBlue.seriesScore}</span>
              <span className="text-[#9FB0C5]">-</span>
              <span className="bg-[#0B0F14] px-2 py-0.5 rounded text-[#F3F6FA] font-mono border border-[#273244]">{state.teamRed.seriesScore}</span>
              <span className="text-[#FF4D67] font-black">{state.teamRed.shortCode}</span>
            </div>

            <div className="h-4 w-[1px] bg-[#273244]"></div>

            {/* Match Clock Indicator */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleClockToggle}
                className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                  state.isClockRunning ? 'bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/30' : 'bg-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/30'
                }`}
                title={state.isClockRunning ? 'Pause Clock' : 'Start Clock'}
              >
                {state.isClockRunning ? <Pause size={13} /> : <Play size={13} />}
              </button>
              <span className="font-mono text-sm font-black text-[#F5B942] min-w-[44px]">
                {formatTime(state.clockSeconds)}
              </span>
            </div>

            {/* Live Status Badge */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                state.status === 'live' ? 'bg-[#22C55E] animate-pulse' :
                state.status === 'drafting' ? 'bg-[#F59E0B] animate-pulse' :
                state.status === 'paused' ? 'bg-[#F5B942]' : 'bg-[#9FB0C5]'
              }`} />
              <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-[#9FB0C5]">
                {state.status}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isActive ? 'bg-[#182231] text-[#00D1C7] border border-[#273244]' : 'text-[#9FB0C5] hover:text-[#F3F6FA] hover:bg-[#121922]'
            }`}
          >
            <Gamepad2 size={15} />
            <span className="hidden sm:inline">Dashboard</span>
          </NavLink>

          <NavLink
            to="/live"
            className={({ isActive }) => `px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isActive ? 'bg-[#FF4D67]/20 text-[#FF4D67] border border-[#FF4D67]/40' : 'text-[#9FB0C5] hover:text-[#F3F6FA] hover:bg-[#121922]'
            }`}
          >
            <Radio size={15} className="text-[#FF4D67]" />
            <span>Live Match</span>
          </NavLink>

          <NavLink
            to="/draft"
            className={({ isActive }) => `px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isActive ? 'bg-[#F59E0B]/20 text-[#F5B942] border border-[#F59E0B]/40' : 'text-[#9FB0C5] hover:text-[#F3F6FA] hover:bg-[#121922]'
            }`}
          >
            <Swords size={15} className="text-[#F5B942]" />
            <span>Draft Room</span>
          </NavLink>

          <NavLink
            to="/overlays"
            className={({ isActive }) => `px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isActive ? 'bg-[#2D8CFF]/20 text-[#2D8CFF] border border-[#2D8CFF]/40' : 'text-[#9FB0C5] hover:text-[#F3F6FA] hover:bg-[#121922]'
            }`}
          >
            <Tv size={15} className="text-[#2D8CFF]" />
            <span className="hidden sm:inline">Overlays</span>
          </NavLink>

          <NavLink
            to="/teams"
            className={({ isActive }) => `px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isActive ? 'bg-[#182231] text-[#F3F6FA] border border-[#273244]' : 'text-[#9FB0C5] hover:text-[#F3F6FA] hover:bg-[#121922]'
            }`}
          >
            <Users size={15} />
            <span className="hidden md:inline">Teams</span>
          </NavLink>

          {/* Connection status badge */}
          <div className="ml-2 pl-2 border-l border-[#273244] flex items-center">
            <span 
              className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.7)]' : 'bg-[#EF4444] animate-pulse'}`}
              title={isConnected ? 'Server Connected (ws://localhost:3001)' : 'Connecting to Server...'}
            />
          </div>
        </div>

      </div>
    </header>
  );
};
