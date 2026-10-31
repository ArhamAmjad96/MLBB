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
  Pause, 
  RefreshCw 
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
    <header className="sticky top-0 z-50 bg-[#0d111a]/95 backdrop-blur-md border-b border-slate-800 text-white px-4 py-2.5 shadow-lg">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Game Mode Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-amber-500 flex items-center justify-center font-black tracking-wider text-sm shadow-md">
              47
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-base text-white">MARK47</span>
              <span className="text-[10px] block text-slate-400 font-mono -mt-1">ESPORTS PRODUCTION</span>
            </div>
          </div>

          {/* Game Switcher Pill */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => handleGameSwitch('mlbb')}
              className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
                isMlbb 
                  ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)]' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-300"></span>
              MLBB
            </button>
            <button
              onClick={() => handleGameSwitch('hok')}
              className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
                !isMlbb 
                  ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(217,119,6,0.6)]' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-300"></span>
              HOK
            </button>
          </div>
        </div>

        {/* Center: Live Match Status & Quick Clock */}
        {state && (
          <div className="hidden lg:flex items-center gap-4 bg-slate-900/80 px-4 py-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">{state.tournamentName}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-bold text-slate-200">{state.matchName}</span>
            </div>

            <div className="h-4 w-[1px] bg-slate-700"></div>

            {/* Quick Match Score */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span style={{ color: state.teamBlue.primaryColor }}>{state.teamBlue.shortCode}</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white">{state.teamBlue.seriesScore}</span>
              <span className="text-slate-500">-</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white">{state.teamRed.seriesScore}</span>
              <span style={{ color: state.teamRed.primaryColor }}>{state.teamRed.shortCode}</span>
            </div>

            <div className="h-4 w-[1px] bg-slate-700"></div>

            {/* Match Clock Indicator */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleClockToggle}
                className={`p-1 rounded text-xs transition-colors ${
                  state.isClockRunning ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                }`}
                title={state.isClockRunning ? 'Pause Clock' : 'Start Clock'}
              >
                {state.isClockRunning ? <Pause size={13} /> : <Play size={13} />}
              </button>
              <span className="font-mono text-sm font-bold text-slate-200 min-w-[44px]">
                {formatTime(state.clockSeconds)}
              </span>
            </div>

            {/* Live Status Badge */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                state.status === 'live' ? 'bg-emerald-400 animate-pulse' :
                state.status === 'drafting' ? 'bg-amber-400 animate-pulse' :
                state.status === 'paused' ? 'bg-yellow-400' : 'bg-slate-500'
              }`} />
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-300">
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
            className={({ isActive }) => `px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Gamepad2 size={15} />
            <span className="hidden sm:inline">Command Center</span>
          </NavLink>

          <NavLink
            to="/live"
            className={({ isActive }) => `px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isActive ? 'bg-red-900/40 text-red-300 font-semibold border border-red-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Radio size={15} className="text-red-400" />
            <span>Live Control</span>
          </NavLink>

          <NavLink
            to="/draft"
            className={({ isActive }) => `px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isActive ? 'bg-amber-900/40 text-amber-300 font-semibold border border-amber-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Swords size={15} className="text-amber-400" />
            <span>Draft Room</span>
          </NavLink>

          <NavLink
            to="/overlays"
            className={({ isActive }) => `px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isActive ? 'bg-blue-900/40 text-blue-300 font-semibold border border-blue-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Tv size={15} className="text-blue-400" />
            <span className="hidden sm:inline">OBS Overlays</span>
          </NavLink>

          <NavLink
            to="/teams"
            className={({ isActive }) => `px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isActive ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users size={15} />
            <span className="hidden md:inline">Teams</span>
          </NavLink>

          {/* Connection status badge */}
          <div className="ml-2 pl-2 border-l border-slate-800 flex items-center">
            <span 
              className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 'bg-red-500 animate-pulse'}`}
              title={isConnected ? 'Sync Connected (ws://localhost:3001)' : 'Connecting to Server...'}
            />
          </div>
        </div>

      </div>
    </header>
  );
};
