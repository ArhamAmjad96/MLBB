import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Trophy, 
  LayoutDashboard, 
  Radio, 
  Swords, 
  Tv, 
  Users, 
  Play, 
  Pause,
  Layers,
  Sparkles
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
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 text-slate-100 px-4 lg:px-6 py-2.5 shadow-xl select-none">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand & Game Switcher */}
        <div className="flex items-center gap-3 sm:gap-5">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-amber-500 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center font-black text-xs text-white tracking-wider">
                47
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-wider text-base text-white">MARK47</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">PRO</span>
              </div>
              <span className="text-[9px] block text-slate-400 font-medium tracking-wider">ESPORTS STUDIO</span>
            </div>
          </NavLink>

          {/* Clean Segmented Game Switcher */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => handleGameSwitch('mlbb')}
              className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                isMlbb 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isMlbb ? 'bg-white' : 'bg-slate-500'}`} />
              MLBB
            </button>
            <button
              onClick={() => handleGameSwitch('hok')}
              className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                !isMlbb 
                  ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${!isMlbb ? 'bg-slate-950' : 'bg-slate-500'}`} />
              HOK
            </button>
          </div>
        </div>

        {/* Center: Live Match Quick Pill (Visible on md+ screens) */}
        {state && (
          <div className="hidden lg:flex items-center gap-3 bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800/90 px-4 py-1.5 rounded-2xl shadow-sm transition-all">
            {/* Status indicator */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                state.status === 'live' ? 'bg-emerald-400 animate-pulse ring-2 ring-emerald-400/20' :
                state.status === 'drafting' ? 'bg-amber-400 animate-pulse ring-2 ring-amber-400/20' :
                state.status === 'paused' ? 'bg-amber-500' : 'bg-slate-500'
              }`} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                {state.status}
              </span>
            </div>

            <div className="h-3.5 w-px bg-slate-800" />

            {/* Match summary */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium truncate max-w-[120px]">{state.matchName}</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-blue-400 font-extrabold">{state.teamBlue.shortCode}</span>
                <span className="bg-slate-950 px-2 py-0.5 rounded-md text-white font-mono text-xs border border-slate-800">
                  {state.teamBlue.seriesScore} - {state.teamRed.seriesScore}
                </span>
                <span className="text-rose-400 font-extrabold">{state.teamRed.shortCode}</span>
              </div>
            </div>

            <div className="h-3.5 w-px bg-slate-800" />

            {/* Quick Clock Toggle */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClockToggle}
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  state.isClockRunning 
                    ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 ring-1 ring-rose-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 ring-1 ring-emerald-500/30'
                }`}
                title={state.isClockRunning ? 'Pause Clock' : 'Start Clock'}
              >
                {state.isClockRunning ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <span className="font-mono text-xs font-bold text-amber-400 tracking-wider min-w-[40px]">
                {formatTime(state.clockSeconds)}
              </span>
            </div>
          </div>
        )}

        {/* Right: Modern Segmented Navigation Links */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              isActive 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard size={15} />
            <span className="hidden sm:inline">Overview</span>
          </NavLink>

          <NavLink
            to="/live"
            className={({ isActive }) => `px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              isActive 
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
            }`}
          >
            <Radio size={15} className="animate-pulse" />
            <span>Live Match</span>
          </NavLink>

          <NavLink
            to="/draft"
            className={({ isActive }) => `px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              isActive 
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
            }`}
          >
            <Swords size={15} />
            <span className="hidden sm:inline">Draft Room</span>
          </NavLink>

          <NavLink
            to="/overlays"
            className={({ isActive }) => `px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              isActive 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
            }`}
          >
            <Tv size={15} />
            <span>Overlays</span>
          </NavLink>

          <NavLink
            to="/teams"
            className={({ isActive }) => `px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              isActive 
                ? 'bg-slate-800 text-white border border-slate-700' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
            }`}
          >
            <Users size={15} />
            <span className="hidden md:inline">Teams</span>
          </NavLink>

          {/* Connection Status Pill */}
          <div className="ml-1 pl-2 border-l border-slate-800 flex items-center">
            <span 
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                isConnected 
                  ? 'bg-emerald-400 ring-4 ring-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.5)]' 
                  : 'bg-rose-500 animate-pulse ring-4 ring-rose-500/20'
              }`}
              title={isConnected ? 'Server Connected (Port 3001)' : 'Connecting to Server...'}
            />
          </div>
        </div>

      </div>
    </header>
  );
};
