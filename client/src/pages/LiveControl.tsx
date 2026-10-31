import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Undo2, 
  Shield, 
  Plus, 
  Minus, 
  Radio, 
  Trophy, 
  Crosshair, 
  Coins, 
  Castle, 
  History 
} from 'lucide-react';
import { MatchLiveState, HeroDefinition, MultikillType } from '../../../shared/types';
import { api } from '../services/api';
import { formatTime } from '../utils/formatters';

interface LiveControlProps {
  state: MatchLiveState | null;
}

export const LiveControl: React.FC<LiveControlProps> = ({ state }) => {
  const [heroes, setHeroes] = useState<HeroDefinition[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [selectedKiller, setSelectedKiller] = useState<HeroDefinition | undefined>();
  const [selectedVictim, setSelectedVictim] = useState<HeroDefinition | undefined>();
  const [selectedTeam, setSelectedTeam] = useState<'blue' | 'red'>('blue');
  const [multikillType, setMultikillType] = useState<MultikillType>('single');
  const [isKillModalOpen, setIsKillModalOpen] = useState(false);

  useEffect(() => {
    if (state?.game) {
      api.getHeroes(state.game).then(setHeroes);
      api.getObjectives(state.game).then(setObjectives);
    }
  }, [state?.game]);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        Loading live state...
      </div>
    );
  }

  const isMlbb = state.game === 'mlbb';

  // Clock Actions
  const handleToggleClock = () => api.toggleClock();
  const handleResetClock = () => api.setClock(0);
  const handleAdjustClock = (deltaSeconds: number) => {
    api.setClock(state.clockSeconds + deltaSeconds);
  };

  // Scoreboard Adjustments
  const adjustScore = (team: 'blue' | 'red', delta: number) => {
    if (team === 'blue') {
      api.updateScoreboard({ blueScore: state.teamBlue.seriesScore + delta });
    } else {
      api.updateScoreboard({ redScore: state.teamRed.seriesScore + delta });
    }
  };

  const adjustKills = (team: 'blue' | 'red', delta: number) => {
    if (team === 'blue') {
      api.updateScoreboard({ blueKills: state.teamBlue.kills + delta });
    } else {
      api.updateScoreboard({ redKills: state.teamRed.kills + delta });
    }
  };

  const adjustGold = (team: 'blue' | 'red', delta: number) => {
    if (team === 'blue') {
      api.updateScoreboard({ blueGold: state.teamBlue.gold + delta });
    } else {
      api.updateScoreboard({ redGold: state.teamRed.gold + delta });
    }
  };

  const adjustTowers = (team: 'blue' | 'red', delta: number) => {
    if (team === 'blue') {
      api.updateScoreboard({ blueTowers: state.teamBlue.towers + delta });
    } else {
      api.updateScoreboard({ redTowers: state.teamRed.towers + delta });
    }
  };

  // Events
  const handleTriggerObjective = (team: 'blue' | 'red', obj: any) => {
    api.registerObjective({
      team,
      objectiveId: obj.id,
      objectiveName: obj.name,
      objectiveIcon: obj.icon
    });
  };

  const handleRegisterKill = () => {
    api.registerKill({
      team: selectedTeam,
      killerHero: selectedKiller,
      victimHero: selectedVictim,
      multikill: multikillType
    });
    setIsKillModalOpen(false);
    setSelectedKiller(undefined);
    setSelectedVictim(undefined);
    setMultikillType('single');
  };

  const handleUndo = () => {
    api.undoLastEvent();
  };

  return (
    <div className="max-w-[1700px] mx-auto p-4 space-y-6">
      
      {/* Top Banner: Control Center Header & Fast Undo */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg">
            <Radio size={24} className={state.isClockRunning ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              LIVE MATCH DESK
              <span className={`text-xs px-2 py-0.5 rounded uppercase font-mono font-bold ${
                isMlbb ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'
              }`}>
                {state.game.toUpperCase()} MODE
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Direct match state controller with real-time overlay synchronization.
            </p>
          </div>
        </div>

        {/* Global Match Clock Controls */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Match Clock</span>
          <span className="font-mono text-2xl font-black text-white tracking-widest min-w-[70px]">
            {formatTime(state.clockSeconds)}
          </span>

          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={handleToggleClock}
              className={`px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1 transition-all ${
                state.isClockRunning 
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_10px_rgba(217,119,6,0.5)]' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
              }`}
            >
              {state.isClockRunning ? <Pause size={14} /> : <Play size={14} />}
              {state.isClockRunning ? 'PAUSE' : 'START'}
            </button>

            <button
              onClick={() => handleAdjustClock(30)}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono font-bold"
              title="+30 Seconds"
            >
              +30s
            </button>
            <button
              onClick={() => handleAdjustClock(-30)}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono font-bold"
              title="-30 Seconds"
            >
              -30s
            </button>
            <button
              onClick={handleResetClock}
              className="p-1.5 bg-slate-800 hover:bg-red-900/50 hover:text-red-300 text-slate-400 rounded text-xs transition-colors"
              title="Reset Clock to 00:00"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Emergency Undo Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsKillModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-extrabold rounded-lg shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <Crosshair size={16} />
            REGISTER KILL EVENT
          </button>

          <button
            onClick={handleUndo}
            disabled={state.events.length === 0}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-2 transition-all ${
              state.events.length > 0
                ? 'bg-amber-600/20 border border-amber-500/50 text-amber-300 hover:bg-amber-600/30 cursor-pointer shadow-md'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Undo2 size={16} />
            UNDO LAST EVENT ({state.events.length})
          </button>
        </div>
      </div>

      {/* Main Grid: Blue Team Control vs Red Team Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* BLUE TEAM CARD */}
        <div className="bg-slate-900/80 border-2 border-sky-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Team Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <img 
                src={state.teamBlue.logo} 
                alt={state.teamBlue.name} 
                className="w-12 h-12 rounded-xl bg-slate-800 p-1 border border-sky-500/40 object-contain shadow-md"
              />
              <div>
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">BLUE CORNER</span>
                <h2 className="text-xl font-black text-white">{state.teamBlue.name}</h2>
                <span className="text-xs font-bold text-slate-400 font-mono">[{state.teamBlue.shortCode}]</span>
              </div>
            </div>

            {/* Series Score Stepper */}
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Series Points</span>
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <button 
                  onClick={() => adjustScore('blue', -1)} 
                  className="p-1 hover:bg-slate-800 text-slate-400 rounded"
                >
                  <Minus size={14} />
                </button>
                <span className="font-mono text-xl font-black text-sky-400 px-2 min-w-[24px] text-center">
                  {state.teamBlue.seriesScore}
                </span>
                <button 
                  onClick={() => adjustScore('blue', 1)} 
                  className="p-1 hover:bg-slate-800 text-sky-400 rounded"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Core Match Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {/* Kills */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1 mb-1">
                <Crosshair size={12} className="text-red-400" /> Kills
              </span>
              <div className="font-mono text-3xl font-black text-white mb-2">{state.teamBlue.kills}</div>
              <div className="flex items-center justify-center gap-1">
                <button 
                  onClick={() => adjustKills('blue', -1)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold"
                >
                  -1
                </button>
                <button 
                  onClick={() => adjustKills('blue', 1)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Towers */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1 mb-1">
                <Castle size={12} className="text-amber-400" /> Towers
              </span>
              <div className="font-mono text-3xl font-black text-amber-400 mb-2">{state.teamBlue.towers}</div>
              <div className="flex items-center justify-center gap-1">
                <button 
                  onClick={() => adjustTowers('blue', -1)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold"
                >
                  -1
                </button>
                <button 
                  onClick={() => adjustTowers('blue', 1)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Gold */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1 mb-1">
                <Coins size={12} className="text-yellow-400" /> Total Gold
              </span>
              <div className="font-mono text-2xl font-black text-yellow-400 mb-2">
                {state.teamBlue.gold.toLocaleString()}
              </div>
              <div className="flex items-center justify-center gap-1">
                <button 
                  onClick={() => adjustGold('blue', -500)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-bold font-mono"
                >
                  -500
                </button>
                <button 
                  onClick={() => adjustGold('blue', 500)}
                  className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-[11px] font-bold font-mono"
                >
                  +500
                </button>
              </div>
            </div>
          </div>

          {/* Objectives Quick Triggers */}
          <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
              {isMlbb ? 'MLBB Objectives (Blue)' : 'HOK Objectives (Blue)'}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {objectives.map(obj => {
                const count = state.teamBlue.objectives[obj.id] || 0;
                return (
                  <button
                    key={obj.id}
                    onClick={() => handleTriggerObjective('blue', obj)}
                    className="p-2.5 bg-slate-900 hover:bg-sky-950/40 border border-slate-700 hover:border-sky-500/50 rounded-lg text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xl">{obj.icon}</span>
                      <span className="font-mono font-black text-sky-400 text-sm bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/30">
                        x{count}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-200 block truncate group-hover:text-sky-300">
                      +1 {obj.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RED TEAM CARD */}
        <div className="bg-slate-900/80 border-2 border-red-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Team Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <img 
                src={state.teamRed.logo} 
                alt={state.teamRed.name} 
                className="w-12 h-12 rounded-xl bg-slate-800 p-1 border border-red-500/40 object-contain shadow-md"
              />
              <div>
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">RED CORNER</span>
                <h2 className="text-xl font-black text-white">{state.teamRed.name}</h2>
                <span className="text-xs font-bold text-slate-400 font-mono">[{state.teamRed.shortCode}]</span>
              </div>
            </div>

            {/* Series Score Stepper */}
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Series Points</span>
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <button 
                  onClick={() => adjustScore('red', -1)} 
                  className="p-1 hover:bg-slate-800 text-slate-400 rounded"
                >
                  <Minus size={14} />
                </button>
                <span className="font-mono text-xl font-black text-red-400 px-2 min-w-[24px] text-center">
                  {state.teamRed.seriesScore}
                </span>
                <button 
                  onClick={() => adjustScore('red', 1)} 
                  className="p-1 hover:bg-slate-800 text-red-400 rounded"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Core Match Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {/* Kills */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1 mb-1">
                <Crosshair size={12} className="text-red-400" /> Kills
              </span>
              <div className="font-mono text-3xl font-black text-white mb-2">{state.teamRed.kills}</div>
              <div className="flex items-center justify-center gap-1">
                <button 
                  onClick={() => adjustKills('red', -1)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold"
                >
                  -1
                </button>
                <button 
                  onClick={() => adjustKills('red', 1)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Towers */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1 mb-1">
                <Castle size={12} className="text-amber-400" /> Towers
              </span>
              <div className="font-mono text-3xl font-black text-amber-400 mb-2">{state.teamRed.towers}</div>
              <div className="flex items-center justify-center gap-1">
                <button 
                  onClick={() => adjustTowers('red', -1)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold"
                >
                  -1
                </button>
                <button 
                  onClick={() => adjustTowers('red', 1)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Gold */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1 mb-1">
                <Coins size={12} className="text-yellow-400" /> Total Gold
              </span>
              <div className="font-mono text-2xl font-black text-yellow-400 mb-2">
                {state.teamRed.gold.toLocaleString()}
              </div>
              <div className="flex items-center justify-center gap-1">
                <button 
                  onClick={() => adjustGold('red', -500)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-bold font-mono"
                >
                  -500
                </button>
                <button 
                  onClick={() => adjustGold('red', 500)}
                  className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-[11px] font-bold font-mono"
                >
                  +500
                </button>
              </div>
            </div>
          </div>

          {/* Objectives Quick Triggers */}
          <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
              {isMlbb ? 'MLBB Objectives (Red)' : 'HOK Objectives (Red)'}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {objectives.map(obj => {
                const count = state.teamRed.objectives[obj.id] || 0;
                return (
                  <button
                    key={obj.id}
                    onClick={() => handleTriggerObjective('red', obj)}
                    className="p-2.5 bg-slate-900 hover:bg-red-950/40 border border-slate-700 hover:border-red-500/50 rounded-lg text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xl">{obj.icon}</span>
                      <span className="font-mono font-black text-red-400 text-sm bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30">
                        x{count}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-200 block truncate group-hover:text-red-300">
                      +1 {obj.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Realtime Event History Timeline */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <History size={18} className="text-slate-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Match Event History</h3>
            <span className="text-xs font-mono text-slate-400">({state.events.length} events logged)</span>
          </div>

          <button
            onClick={handleUndo}
            disabled={state.events.length === 0}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 disabled:opacity-40"
          >
            <Undo2 size={13} />
            Undo Recent
          </button>
        </div>

        {state.events.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 font-mono">
            No events registered yet. Match is ready.
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
            {state.events.slice(0, 10).map((evt) => (
              <div 
                key={evt.id}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono border ${
                  evt.team === 'blue' 
                    ? 'bg-sky-950/30 border-sky-500/30 text-sky-200' 
                    : 'bg-red-950/30 border-red-500/30 text-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                    {formatTime(evt.gameTimeSeconds)}
                  </span>
                  <span className="font-bold uppercase tracking-wider">
                    {evt.team === 'blue' ? state.teamBlue.shortCode : state.teamRed.shortCode}
                  </span>
                  <span>
                    {evt.type === 'kill' && (
                      <span className="flex items-center gap-1">
                        <Crosshair size={13} className="text-red-400" />
                        Kill by {evt.killerHero?.name || 'Unknown'} 
                        {evt.victimHero && ` on ${evt.victimHero.name}`}
                        {evt.multikill && evt.multikill !== 'single' && (
                          <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-black font-extrabold rounded text-[10px] uppercase">
                            {evt.multikill}
                          </span>
                        )}
                      </span>
                    )}
                    {evt.type === 'objective' && (
                      <span>Secured {evt.objective?.icon} {evt.objective?.name}</span>
                    )}
                    {evt.type === 'tower' && (
                      <span>Destroyed enemy turret</span>
                    )}
                  </span>
                </div>

                <span className="text-[10px] text-slate-400">
                  {new Date(evt.realTimestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KILL REGISTRATION MODAL */}
      {isKillModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Crosshair size={20} className="text-red-500" />
                REGISTER KILL EVENT
              </h3>
              <button 
                onClick={() => setIsKillModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Select Scoring Team */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-2">Scoring Team</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedTeam('blue')}
                  className={`p-3 rounded-xl border text-center font-bold text-sm transition-all ${
                    selectedTeam === 'blue'
                      ? 'bg-sky-600/30 border-sky-400 text-sky-200 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  🔵 {state.teamBlue.name}
                </button>
                <button
                  onClick={() => setSelectedTeam('red')}
                  className={`p-3 rounded-xl border text-center font-bold text-sm transition-all ${
                    selectedTeam === 'red'
                      ? 'bg-red-600/30 border-red-400 text-red-200 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  🔴 {state.teamRed.name}
                </button>
              </div>
            </div>

            {/* Step 2: Killer Hero */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-2">Killer Hero (Optional)</label>
              <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                {heroes.map(hero => (
                  <button
                    key={hero.id}
                    onClick={() => setSelectedKiller(hero)}
                    className={`p-2 rounded-lg text-left text-xs font-medium border flex items-center gap-2 transition-all ${
                      selectedKiller?.id === hero.id
                        ? 'bg-sky-600/40 border-sky-400 text-white'
                        : 'border-slate-800 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <img src={hero.avatar} alt="" className="w-5 h-5 rounded-full" />
                    <span className="truncate">{hero.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Multikill Banner Tier */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-2">Multikill Announcement</label>
              <div className="grid grid-cols-4 gap-2">
                {(['single', 'first_blood', 'double', 'triple', 'maniac', 'savage', 'wipeout'] as MultikillType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setMultikillType(type)}
                    className={`py-1.5 px-2 rounded text-[11px] font-bold uppercase transition-all ${
                      multikillType === type
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsKillModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterKill}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold rounded-lg shadow-lg flex items-center gap-2"
              >
                Confirm Kill
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
