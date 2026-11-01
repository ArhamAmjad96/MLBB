import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Undo2, 
  Trophy, 
  Crosshair, 
  Coins, 
  Castle, 
  History, 
  Zap, 
  Skull, 
  Flame, 
  Crown, 
  ShieldAlert, 
  Swords, 
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Radio
} from 'lucide-react';
import { MatchLiveState, HeroDefinition, MultikillType, SpecialEventType } from '../../../shared/types';
import { api } from '../services/api';
import { formatTime, formatGold } from '../utils/formatters';

interface LiveControlProps {
  state: MatchLiveState | null;
}

export const LiveControl: React.FC<LiveControlProps> = ({ state }) => {
  const [heroes, setHeroes] = useState<HeroDefinition[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [activeTabTeam, setActiveTabTeam] = useState<'blue' | 'red'>('blue');
  const [isKillModalOpen, setIsKillModalOpen] = useState(false);
  const [selectedKiller, setSelectedKiller] = useState<HeroDefinition | undefined>();
  const [selectedVictim, setSelectedVictim] = useState<HeroDefinition | undefined>();
  const [selectedMultikill, setSelectedMultikill] = useState<MultikillType>('single');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (state?.game) {
      api.getHeroes(state.game).then(setHeroes);
      api.getObjectives(state.game).then(setObjectives);
    }
  }, [state?.game]);

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading live match state...</span>
      </div>
    );
  }

  const isMlbb = state.game === 'mlbb';

  // Clock Actions
  const handleToggleClock = () => {
    api.toggleClock();
    showNotification(state.isClockRunning ? 'Match Clock Paused' : 'Match Clock Started');
  };
  const handleResetClock = () => {
    api.setClock(0);
    showNotification('Match Clock Reset to 00:00');
  };
  const handleAdjustClock = (deltaSeconds: number) => {
    api.setClock(Math.max(0, state.clockSeconds + deltaSeconds));
    showNotification(`Adjusted Clock ${deltaSeconds > 0 ? `+${deltaSeconds}s` : `${deltaSeconds}s`}`);
  };

  // Scoreboard Adjustments
  const adjustScore = (team: 'blue' | 'red', delta: number) => {
    const teamCode = team === 'blue' ? state.teamBlue.shortCode : state.teamRed.shortCode;
    if (team === 'blue') {
      const next = Math.max(0, state.teamBlue.seriesScore + delta);
      api.updateScoreboard({ blueScore: next });
      showNotification(`${teamCode} Series Score: ${next}`);
    } else {
      const next = Math.max(0, state.teamRed.seriesScore + delta);
      api.updateScoreboard({ redScore: next });
      showNotification(`${teamCode} Series Score: ${next}`);
    }
  };

  const adjustKills = (team: 'blue' | 'red', delta: number) => {
    if (team === 'blue') {
      api.updateScoreboard({ blueKills: Math.max(0, state.teamBlue.kills + delta) });
    } else {
      api.updateScoreboard({ redKills: Math.max(0, state.teamRed.kills + delta) });
    }
  };

  const adjustGold = (team: 'blue' | 'red', delta: number) => {
    if (team === 'blue') {
      api.updateScoreboard({ blueGold: Math.max(0, state.teamBlue.gold + delta) });
    } else {
      api.updateScoreboard({ redGold: Math.max(0, state.teamRed.gold + delta) });
    }
  };

  const adjustTowers = (team: 'blue' | 'red', delta: number) => {
    if (team === 'blue') {
      api.updateScoreboard({ blueTowers: Math.min(9, Math.max(0, state.teamBlue.towers + delta)) });
    } else {
      api.updateScoreboard({ redTowers: Math.min(9, Math.max(0, state.teamRed.towers + delta)) });
    }
  };

  // Fast Special Events
  const triggerSpecial = (team: 'blue' | 'red', specialType: SpecialEventType) => {
    const teamCode = team === 'blue' ? state.teamBlue.shortCode : state.teamRed.shortCode;
    showNotification(`${teamCode} triggered ${specialType.replace(/_/g, ' ').toUpperCase()}`);
    api.registerSpecialEvent({ team, specialType });
  };

  // Slot Kill (from drafted hero)
  const handleSlotKill = (team: 'blue' | 'red', slotIndex: number) => {
    const teamPicks = team === 'blue' ? state.teamBlue.picks : state.teamRed.picks;
    const heroName = teamPicks[slotIndex]?.heroName || `Hero ${slotIndex + 1}`;
    showNotification(`Kill recorded for ${heroName}`);
    api.registerSlotKill({
      team,
      killerSlotIndex: slotIndex,
      multikill: 'single'
    });
  };

  // Detailed Kill Modal Submission
  const handleRegisterDetailedKill = () => {
    api.registerKill({
      team: activeTabTeam,
      killerHero: selectedKiller,
      victimHero: selectedVictim,
      multikill: selectedMultikill
    });
    showNotification(`Kill registered: ${selectedKiller?.name || 'Player'} (${selectedMultikill.toUpperCase()})`);
    setIsKillModalOpen(false);
    setSelectedKiller(undefined);
    setSelectedVictim(undefined);
    setSelectedMultikill('single');
  };

  const handleUndo = () => {
    api.undoLastEvent();
    showNotification('Reverted last recorded event');
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6 select-none font-sans">
      
      {/* Toast Notification */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-pop-in">
          <Sparkles size={16} className="text-indigo-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 1. TOP CONTROL BAR */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Match Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white tracking-wide">
                LIVE MATCH CONTROL
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {state.game.toUpperCase()} • GAME {state.currentGameNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {state.tournamentName} • {state.matchName}
            </p>
          </div>
        </div>

        {/* Global Match Clock Center */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 shadow-inner">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">CLOCK</span>
          <span className="font-mono text-3xl font-black text-amber-400 tracking-wider min-w-[85px] text-center">
            {formatTime(state.clockSeconds)}
          </span>

          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={handleToggleClock}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                state.isClockRunning 
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              {state.isClockRunning ? <Pause size={14} /> : <Play size={14} />}
              <span>{state.isClockRunning ? 'PAUSE' : 'START'}</span>
            </button>

            <button
              onClick={() => handleAdjustClock(30)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold border border-slate-700 transition-colors"
              title="+30 Seconds"
            >
              +30s
            </button>
            <button
              onClick={() => handleAdjustClock(-30)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold border border-slate-700 transition-colors"
              title="-30 Seconds"
            >
              -30s
            </button>
            <button
              onClick={handleResetClock}
              className="p-1.5 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 rounded-lg text-xs transition-colors border border-slate-700"
              title="Reset Clock to 00:00"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Action Buttons: Custom Kill & Undo */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsKillModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Crosshair size={14} className="text-rose-400" />
            <span>CUSTOM KILL</span>
          </button>

          <button
            onClick={handleUndo}
            disabled={state.events.length === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
              state.events.length > 0
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 cursor-pointer active:scale-95'
                : 'bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-800'
            }`}
          >
            <Undo2 size={14} />
            <span>UNDO ({state.events.length})</span>
          </button>
        </div>
      </div>

      {/* 2. DUAL TEAM COLUMNS (BLUE VS RED) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ---------------- BLUE TEAM COLUMN ---------------- */}
        <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3.5">
              <img 
                src={state.teamBlue.logo} 
                alt="" 
                className="w-14 h-14 rounded-xl bg-slate-950 p-1.5 border border-blue-500/30 object-contain shadow-md" 
              />
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">BLUE SIDE</span>
                <h2 className="text-xl font-black text-white uppercase tracking-wide leading-tight">{state.teamBlue.name}</h2>
                <span className="text-xs font-mono font-bold text-slate-400">[{state.teamBlue.shortCode}]</span>
              </div>
            </div>

            {/* Series Points Stepper */}
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">SERIES SCORE</span>
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                <button 
                  onClick={() => adjustScore('blue', -1)} 
                  className="w-6 h-6 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
                >
                  -
                </button>
                <span className="font-mono text-lg font-black text-blue-400 px-2 min-w-[24px] text-center">
                  {state.teamBlue.seriesScore}
                </span>
                <button 
                  onClick={() => adjustScore('blue', 1)} 
                  className="w-6 h-6 rounded-md hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 flex items-center justify-center font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics: Kills, Towers, Gold */}
          <div className="grid grid-cols-3 gap-3">
            {/* Kills */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">KILLS</span>
              <div className="font-mono text-3xl font-black text-white mb-2">{state.teamBlue.kills}</div>
              <div className="flex items-center justify-center gap-1.5">
                <button 
                  onClick={() => adjustKills('blue', -1)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                >
                  -1
                </button>
                <button 
                  onClick={() => adjustKills('blue', 1)}
                  className="px-3.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm shadow-blue-600/30"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Towers */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">TOWERS</span>
              <div className="font-mono text-3xl font-black text-amber-400 mb-2">{state.teamBlue.towers}</div>
              <div className="flex items-center justify-center gap-1.5">
                <button 
                  onClick={() => adjustTowers('blue', -1)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                >
                  -1
                </button>
                <button 
                  onClick={() => adjustTowers('blue', 1)}
                  className="px-3.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black shadow-sm shadow-amber-500/30"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Gold */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">GOLD</span>
              <div className="font-mono text-2xl font-black text-amber-400 mb-2">{formatGold(state.teamBlue.gold)}</div>
              <div className="flex items-center justify-center gap-1">
                <button 
                  onClick={() => adjustGold('blue', -500)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[10px] font-mono font-bold"
                >
                  -500
                </button>
                <button 
                  onClick={() => adjustGold('blue', 500)}
                  className="px-2 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-md text-[10px] font-mono font-bold border border-amber-500/30"
                >
                  +500
                </button>
              </div>
            </div>
          </div>

          {/* 5 Drafted Heroes 1-Click Kill Bar */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              DRAFTED HEROES (1-CLICK KILL TRIGGER)
            </span>
            <div className="grid grid-cols-5 gap-2">
              {state.teamBlue.picks.map((slot, idx) => (
                <div key={idx} className="flex flex-col items-center p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-colors">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 mb-1.5 border border-slate-700">
                    {slot.heroAvatar ? (
                      <img src={slot.heroAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-slate-500">P{idx+1}</div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-white truncate max-w-[55px] text-center mb-1.5">
                    {slot.heroName || `Hero ${idx+1}`}
                  </span>
                  <button
                    onClick={() => handleSlotKill('blue', idx)}
                    className="w-full py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[9px] font-mono font-black active:scale-95 transition-all"
                  >
                    + KILL
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Objectives & Steal */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
              OBJECTIVES ({state.teamBlue.shortCode})
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => triggerSpecial('blue', isMlbb ? 'turtle_secured' : 'tyrant_secured')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{isMlbb ? '🐢' : '🐉'}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    x{state.teamBlue.objectives[isMlbb ? 'turtle' : 'primal_tyrant'] || 0}
                  </span>
                </div>
                <span className="text-xs font-bold text-white block truncate mt-1">
                  {isMlbb ? '+ Turtle' : '+ Tyrant'}
                </span>
              </button>

              <button
                onClick={() => triggerSpecial('blue', isMlbb ? 'lord_secured' : 'overlord_secured')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{isMlbb ? '👑' : '🐲'}</span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    x{state.teamBlue.objectives[isMlbb ? 'lord' : 'shadow_overlord'] || 0}
                  </span>
                </div>
                <span className="text-xs font-bold text-white block truncate mt-1">
                  {isMlbb ? '+ Lord' : '+ Overlord'}
                </span>
              </button>

              <button
                onClick={() => triggerSpecial('blue', isMlbb ? 'lord_steal' : 'overlord_steal')}
                className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-left transition-all active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">⚡</span>
                  <span className="text-[9px] font-mono font-black text-amber-400 uppercase">STEAL</span>
                </div>
                <span className="text-xs font-black text-amber-400 block truncate mt-1">
                  {isMlbb ? 'Lord Steal' : 'Overlord Steal'}
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* ---------------- RED TEAM COLUMN ---------------- */}
        <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3.5">
              <img 
                src={state.teamRed.logo} 
                alt="" 
                className="w-14 h-14 rounded-xl bg-slate-950 p-1.5 border border-rose-500/30 object-contain shadow-md" 
              />
              <div>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">RED SIDE</span>
                <h2 className="text-xl font-black text-white uppercase tracking-wide leading-tight">{state.teamRed.name}</h2>
                <span className="text-xs font-mono font-bold text-slate-400">[{state.teamRed.shortCode}]</span>
              </div>
            </div>

            {/* Series Points Stepper */}
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">SERIES SCORE</span>
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                <button 
                  onClick={() => adjustScore('red', -1)} 
                  className="w-6 h-6 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
                >
                  -
                </button>
                <span className="font-mono text-lg font-black text-rose-400 px-2 min-w-[24px] text-center">
                  {state.teamRed.seriesScore}
                </span>
                <button 
                  onClick={() => adjustScore('red', 1)} 
                  className="w-6 h-6 rounded-md hover:bg-rose-600/30 text-rose-400 hover:text-rose-300 flex items-center justify-center font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics: Kills, Towers, Gold */}
          <div className="grid grid-cols-3 gap-3">
            {/* Kills */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">KILLS</span>
              <div className="font-mono text-3xl font-black text-white mb-2">{state.teamRed.kills}</div>
              <div className="flex items-center justify-center gap-1.5">
                <button 
                  onClick={() => adjustKills('red', -1)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                >
                  -1
                </button>
                <button 
                  onClick={() => adjustKills('red', 1)}
                  className="px-3.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-sm shadow-rose-600/30"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Towers */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">TOWERS</span>
              <div className="font-mono text-3xl font-black text-amber-400 mb-2">{state.teamRed.towers}</div>
              <div className="flex items-center justify-center gap-1.5">
                <button 
                  onClick={() => adjustTowers('red', -1)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                >
                  -1
                </button>
                <button 
                  onClick={() => adjustTowers('red', 1)}
                  className="px-3.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black shadow-sm shadow-amber-500/30"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Gold */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">GOLD</span>
              <div className="font-mono text-2xl font-black text-amber-400 mb-2">{formatGold(state.teamRed.gold)}</div>
              <div className="flex items-center justify-center gap-1">
                <button 
                  onClick={() => adjustGold('red', -500)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[10px] font-mono font-bold"
                >
                  -500
                </button>
                <button 
                  onClick={() => adjustGold('red', 500)}
                  className="px-2 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-md text-[10px] font-mono font-bold border border-amber-500/30"
                >
                  +500
                </button>
              </div>
            </div>
          </div>

          {/* 5 Drafted Heroes 1-Click Kill Bar */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              DRAFTED HEROES (1-CLICK KILL TRIGGER)
            </span>
            <div className="grid grid-cols-5 gap-2">
              {state.teamRed.picks.map((slot, idx) => (
                <div key={idx} className="flex flex-col items-center p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition-colors">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 mb-1.5 border border-slate-700">
                    {slot.heroAvatar ? (
                      <img src={slot.heroAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-slate-500">P{idx+1}</div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-white truncate max-w-[55px] text-center mb-1.5">
                    {slot.heroName || `Hero ${idx+1}`}
                  </span>
                  <button
                    onClick={() => handleSlotKill('red', idx)}
                    className="w-full py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-[9px] font-mono font-black active:scale-95 transition-all"
                  >
                    + KILL
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Objectives & Steal */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
              OBJECTIVES ({state.teamRed.shortCode})
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => triggerSpecial('red', isMlbb ? 'turtle_secured' : 'tyrant_secured')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{isMlbb ? '🐢' : '🐉'}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    x{state.teamRed.objectives[isMlbb ? 'turtle' : 'primal_tyrant'] || 0}
                  </span>
                </div>
                <span className="text-xs font-bold text-white block truncate mt-1">
                  {isMlbb ? '+ Turtle' : '+ Tyrant'}
                </span>
              </button>

              <button
                onClick={() => triggerSpecial('red', isMlbb ? 'lord_secured' : 'overlord_secured')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{isMlbb ? '👑' : '🐲'}</span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    x{state.teamRed.objectives[isMlbb ? 'lord' : 'shadow_overlord'] || 0}
                  </span>
                </div>
                <span className="text-xs font-bold text-white block truncate mt-1">
                  {isMlbb ? '+ Lord' : '+ Overlord'}
                </span>
              </button>

              <button
                onClick={() => triggerSpecial('red', isMlbb ? 'lord_steal' : 'overlord_steal')}
                className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-left transition-all active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">⚡</span>
                  <span className="text-[9px] font-mono font-black text-amber-400 uppercase">STEAL</span>
                </div>
                <span className="text-xs font-black text-amber-400 block truncate mt-1">
                  {isMlbb ? 'Lord Steal' : 'Overlord Steal'}
                </span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 3. BROADCAST EVENT COMMAND PAD */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              BROADCAST EVENT COMMAND PAD
            </h3>
          </div>

          {/* Active Target Team Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 px-2 font-bold uppercase">TEAM:</span>
            <button
              onClick={() => setActiveTabTeam('blue')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTabTeam === 'blue'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {state.teamBlue.shortCode || 'BLUE'}
            </button>
            <button
              onClick={() => setActiveTabTeam('red')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTabTeam === 'red'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {state.teamRed.shortCode || 'RED'}
            </button>
          </div>
        </div>

        {/* Action Pad Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <button
            onClick={() => triggerSpecial(activeTabTeam, 'first_blood')}
            className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl flex flex-col items-center justify-center text-center transition-all group active:scale-95 shadow-sm"
          >
            <span className="text-2xl mb-1">🩸</span>
            <span className="text-xs font-bold text-amber-400 uppercase">FIRST BLOOD</span>
            <span className="text-[10px] text-slate-500 mt-0.5">High Impact</span>
          </button>

          <button
            onClick={() => triggerSpecial(activeTabTeam, 'double_kill')}
            className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl flex flex-col items-center justify-center text-center transition-all group active:scale-95 shadow-sm"
          >
            <span className="text-2xl mb-1">⚔️</span>
            <span className="text-xs font-bold text-white uppercase">DOUBLE KILL</span>
            <span className="text-[10px] text-slate-500 mt-0.5">+1 Kill</span>
          </button>

          <button
            onClick={() => triggerSpecial(activeTabTeam, 'triple_kill')}
            className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl flex flex-col items-center justify-center text-center transition-all group active:scale-95 shadow-sm"
          >
            <span className="text-2xl mb-1">⚡</span>
            <span className="text-xs font-bold text-indigo-400 uppercase">TRIPLE KILL</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Flare</span>
          </button>

          <button
            onClick={() => triggerSpecial(activeTabTeam, 'maniac')}
            className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl flex flex-col items-center justify-center text-center transition-all group active:scale-95 shadow-sm"
          >
            <span className="text-2xl mb-1">🔥</span>
            <span className="text-xs font-bold text-amber-400 uppercase">MANIAC</span>
            <span className="text-[10px] text-slate-500 mt-0.5">4x Streak</span>
          </button>

          <button
            onClick={() => triggerSpecial(activeTabTeam, 'savage')}
            className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-amber-500/40 rounded-xl flex flex-col items-center justify-center text-center transition-all group active:scale-95 shadow-md ring-1 ring-amber-500/20"
          >
            <Crown size={24} className="text-amber-400 mb-1 animate-bounce" />
            <span className="text-xs font-black text-amber-300 uppercase">
              {isMlbb ? 'SAVAGE' : 'PENTA KILL'}
            </span>
            <span className="text-[10px] text-amber-500 font-mono mt-0.5">Max Streak</span>
          </button>

          <button
            onClick={() => triggerSpecial(activeTabTeam, 'shutdown')}
            className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/50 rounded-xl flex flex-col items-center justify-center text-center transition-all group active:scale-95 shadow-sm"
          >
            <ShieldAlert size={22} className="text-rose-400 mb-1" />
            <span className="text-xs font-bold text-rose-400 uppercase">SHUTDOWN</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Bounty</span>
          </button>

          <button
            onClick={() => triggerSpecial(activeTabTeam, 'wipeout')}
            className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-xl flex flex-col items-center justify-center text-center transition-all group active:scale-95 shadow-sm"
          >
            <Skull size={22} className="text-slate-300 mb-1" />
            <span className="text-xs font-bold text-white uppercase">WIPEOUT</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Team Aced</span>
          </button>
        </div>

        {/* Victory End Match Bar */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" />
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">
              MATCH CONCLUSION:
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerSpecial('blue', 'victory')}
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
            >
              <Trophy size={14} />
              <span>DECLARE {state.teamBlue.shortCode || 'BLUE'} VICTORY</span>
            </button>

            <button
              onClick={() => triggerSpecial('red', 'victory')}
              className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
            >
              <Trophy size={14} />
              <span>DECLARE {state.teamRed.shortCode || 'RED'} VICTORY</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. REALTIME EVENT AUDIT LOG */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History size={16} className="text-slate-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              MATCH AUDIT LOG
            </h3>
            <span className="text-xs font-mono text-slate-500">({state.events.length} events recorded)</span>
          </div>

          <button
            onClick={handleUndo}
            disabled={state.events.length === 0}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
          >
            <Undo2 size={13} />
            <span>Undo Recent Action</span>
          </button>
        </div>

        {state.events.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 font-mono">
            No events logged yet. Match ready to begin.
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
            {state.events.slice(0, 15).map((evt) => (
              <div 
                key={evt.id}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs bg-slate-950/70 border border-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {formatTime(evt.gameTimeSeconds || 0)}
                  </span>
                  <span className={`font-bold uppercase tracking-wider ${evt.team === 'blue' ? 'text-blue-400' : 'text-rose-400'}`}>
                    {evt.team === 'blue' ? state.teamBlue.shortCode : state.teamRed.shortCode}
                  </span>
                  <span className="text-slate-200">
                    {evt.headline ? (
                      <span className="font-bold text-amber-400">{evt.headline}</span>
                    ) : evt.type === 'kill' ? (
                      <span>
                        Kill by {evt.killerHero?.name || 'Player'} 
                        {evt.victimHero && ` on ${evt.victimHero.name}`}
                      </span>
                    ) : evt.type === 'objective' ? (
                      <span>Secured {evt.objective?.name || 'Objective'}</span>
                    ) : evt.type === 'tower' ? (
                      <span>Turret Destroyed</span>
                    ) : (
                      <span>{evt.message || 'Event Logged'}</span>
                    )}
                  </span>
                </div>

                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(evt.realTimestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. CUSTOM KILL MODAL */}
      {isKillModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-wide">
                <Crosshair size={18} className="text-rose-400" />
                CUSTOM KILL REGISTRATION
              </h3>
              <button 
                onClick={() => setIsKillModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Target Team */}
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1.5">
                SCORING TEAM
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTabTeam('blue')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                    activeTabTeam === 'blue'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {state.teamBlue.name}
                </button>
                <button
                  onClick={() => setActiveTabTeam('red')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                    activeTabTeam === 'red'
                      ? 'bg-rose-600/20 border-rose-500 text-rose-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {state.teamRed.name}
                </button>
              </div>
            </div>

            {/* Killer Selection */}
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1.5">
                KILLER HERO ({activeTabTeam.toUpperCase()})
              </label>
              <div className="grid grid-cols-5 gap-2 max-h-44 overflow-y-auto p-1.5 bg-slate-950 rounded-xl border border-slate-800">
                {(activeTabTeam === 'blue' ? state.teamBlue.picks : state.teamRed.picks).map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (slot.heroId) {
                        const hero = heroes.find(h => h.id === slot.heroId) || {
                          id: slot.heroId,
                          name: slot.heroName || 'Hero',
                          game: state.game,
                          primaryRole: 'UNKNOWN',
                          avatar: slot.heroAvatar || ''
                        };
                        setSelectedKiller(hero);
                      }
                    }}
                    className={`p-1.5 rounded-lg border text-center flex flex-col items-center transition-all ${
                      selectedKiller?.id === slot.heroId && slot.heroId
                        ? 'border-indigo-500 bg-indigo-500/20'
                        : 'border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-black mb-1">
                      {slot.heroAvatar && <img src={slot.heroAvatar} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-[9px] font-bold text-white truncate max-w-[50px]">{slot.heroName || `Slot ${i+1}`}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Multikill Tier */}
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1.5">
                MULTIKILL TIER
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(['single', 'double', 'triple', 'maniac', 'savage', 'first_blood'] as MultikillType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedMultikill(type)}
                    className={`py-1.5 px-2 rounded-lg border text-[10px] font-mono font-bold uppercase transition-all ${
                      selectedMultikill === type
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsKillModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterDetailedKill}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Log Kill Event
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LiveControl;
