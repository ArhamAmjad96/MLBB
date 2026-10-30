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
  CheckCircle2 
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

  useEffect(() => {
    if (state?.game) {
      api.getHeroes(state.game).then(setHeroes);
      api.getObjectives(state.game).then(setObjectives);
    }
  }, [state?.game]);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-[#9FB0C5]">
        Loading live state...
      </div>
    );
  }

  const isMlbb = state.game === 'mlbb';

  // Clock Actions
  const handleToggleClock = () => api.toggleClock();
  const handleResetClock = () => api.setClock(0);
  const handleAdjustClock = (deltaSeconds: number) => {
    api.setClock(Math.max(0, state.clockSeconds + deltaSeconds));
  };

  // Scoreboard Adjustments
  const adjustScore = (team: 'blue' | 'red', delta: number) => {
    if (team === 'blue') {
      api.updateScoreboard({ blueScore: Math.max(0, state.teamBlue.seriesScore + delta) });
    } else {
      api.updateScoreboard({ redScore: Math.max(0, state.teamRed.seriesScore + delta) });
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

  // 1-Click Fast Special Events
  const triggerSpecial = (team: 'blue' | 'red', specialType: SpecialEventType) => {
    api.registerSpecialEvent({
      team,
      specialType
    });
  };

  // Slot Kill (from drafted hero)
  const handleSlotKill = (team: 'blue' | 'red', slotIndex: number) => {
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
    setIsKillModalOpen(false);
    setSelectedKiller(undefined);
    setSelectedVictim(undefined);
    setSelectedMultikill('single');
  };

  const handleUndo = () => {
    api.undoLastEvent();
  };

  return (
    <div className="max-w-[1700px] mx-auto p-4 space-y-6 select-none font-sans">
      
      {/* ============================================================== */}
      {/* 1. TOP CONTROL BAR: MATCH CLOCK & CRITICAL ACTIONS             */}
      {/* ============================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121922] border border-[#273244] p-4 rounded-xl shadow-xl">
        
        {/* Match Header Info */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#182231] border border-[#273244] rounded-lg">
            <Swords size={22} className="text-[#00D1C7]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-[#F3F6FA] uppercase tracking-wide">
                LIVE MATCH CONTROL
              </h1>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                isMlbb ? 'bg-[#2D8CFF]/20 text-[#2D8CFF] border border-[#2D8CFF]/40' : 'bg-[#F5B942]/20 text-[#F5B942] border border-[#F5B942]/40'
              }`}>
                {state.game.toUpperCase()}
              </span>
              <span className="text-xs font-mono font-bold text-[#9FB0C5]">
                GAME {state.currentGameNumber} • {state.format}
              </span>
            </div>
            <p className="text-xs text-[#9FB0C5] font-mono mt-0.5">
              Operator Console • Real-time overlay event dispatch
            </p>
          </div>
        </div>

        {/* Global Match Clock Controls */}
        <div className="flex items-center gap-3 bg-[#0B0F14] px-4 py-2 rounded-xl border border-[#273244]">
          <span className="text-[10px] uppercase tracking-wider text-[#9FB0C5] font-bold">MATCH CLOCK</span>
          <span className="font-mono text-2xl font-black text-[#F5B942] tracking-wider min-w-[70px]">
            {formatTime(state.clockSeconds)}
          </span>

          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={handleToggleClock}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                state.isClockRunning 
                  ? 'bg-[#F59E0B] hover:bg-amber-600 text-black' 
                  : 'bg-[#22C55E] hover:bg-green-600 text-black'
              }`}
            >
              {state.isClockRunning ? <Pause size={14} /> : <Play size={14} />}
              {state.isClockRunning ? 'PAUSE' : 'START'}
            </button>

            <button
              onClick={() => handleAdjustClock(30)}
              className="px-2.5 py-1.5 bg-[#182231] hover:bg-[#273244] text-[#F3F6FA] rounded-lg text-xs font-mono font-bold border border-[#273244]"
              title="+30 Seconds"
            >
              +30s
            </button>
            <button
              onClick={() => handleAdjustClock(-30)}
              className="px-2.5 py-1.5 bg-[#182231] hover:bg-[#273244] text-[#F3F6FA] rounded-lg text-xs font-mono font-bold border border-[#273244]"
              title="-30 Seconds"
            >
              -30s
            </button>
            <button
              onClick={handleResetClock}
              className="p-1.5 bg-[#182231] hover:bg-red-900/40 hover:text-red-300 text-[#9FB0C5] rounded-lg text-xs transition-colors border border-[#273244]"
              title="Reset Clock to 00:00"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Prominent Emergency Undo & Detailed Kill Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsKillModalOpen(true)}
            className="px-3.5 py-2 bg-[#182231] hover:bg-[#273244] border border-[#273244] text-[#F3F6FA] text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Crosshair size={14} className="text-[#FF4D67]" />
            CUSTOM KILL MODAL
          </button>

          <button
            onClick={handleUndo}
            disabled={state.events.length === 0}
            className={`px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 transition-all shadow-md ${
              state.events.length > 0
                ? 'bg-[#F59E0B]/20 border border-[#F59E0B]/60 text-[#F5B942] hover:bg-[#F59E0B]/30 cursor-pointer'
                : 'bg-[#182231] text-[#9FB0C5]/40 cursor-not-allowed border border-[#273244]'
            }`}
          >
            <Undo2 size={16} />
            UNDO LAST EVENT ({state.events.length})
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. DUAL TEAM COLUMNS: BLUE & RED ARENAS                        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ---------------- BLUE TEAM COLUMN ---------------- */}
        <div className="bg-[#121922] border-2 border-[#2D8CFF]/40 rounded-xl p-5 shadow-xl relative overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#273244] pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0B0F14] p-1.5 border border-[#2D8CFF]/50 shadow-md flex items-center justify-center">
                <img src={state.teamBlue.logo} alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#2D8CFF] uppercase tracking-wider block">BLUE SIDE</span>
                <h2 className="text-lg font-black text-[#F3F6FA] uppercase tracking-wide leading-tight">{state.teamBlue.name}</h2>
                <span className="text-xs font-mono font-bold text-[#9FB0C5]">[{state.teamBlue.shortCode}]</span>
              </div>
            </div>

            {/* Series Points Stepper */}
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-[#9FB0C5] block mb-1">SERIES SCORE</span>
              <div className="flex items-center gap-1.5 bg-[#0B0F14] px-2.5 py-1 rounded-lg border border-[#273244]">
                <button 
                  onClick={() => adjustScore('blue', -1)} 
                  className="p-1 hover:bg-[#182231] text-[#9FB0C5] rounded"
                >
                  -
                </button>
                <span className="font-mono text-lg font-black text-[#2D8CFF] px-2 min-w-[20px] text-center">
                  {state.teamBlue.seriesScore}
                </span>
                <button 
                  onClick={() => adjustScore('blue', 1)} 
                  className="p-1 hover:bg-[#182231] text-[#2D8CFF] rounded"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics: Kills, Towers, Gold */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {/* Kills */}
            <div className="bg-[#0B0F14] p-3 rounded-xl border border-[#273244] text-center">
              <span className="text-[10px] font-bold text-[#9FB0C5] uppercase block mb-1">KILLS</span>
              <div className="font-mono text-3xl font-black text-[#F3F6FA] mb-2">{state.teamBlue.kills}</div>
              <div className="flex items-center justify-center gap-1.5">
                <button 
                  onClick={() => adjustKills('blue', -1)}
                  className="px-2.5 py-1 bg-[#182231] hover:bg-[#273244] text-[#9FB0C5] rounded text-xs font-bold"
                >
                  -1
                </button>
                <button 
                  onClick={() => triggerSpecial('blue', 'first_blood')}
                  className="px-3 py-1 bg-[#2D8CFF] hover:bg-blue-600 text-white rounded text-xs font-bold"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Towers */}
            <div className="bg-[#0B0F14] p-3 rounded-xl border border-[#273244] text-center">
              <span className="text-[10px] font-bold text-[#9FB0C5] uppercase block mb-1">TOWERS</span>
              <div className="font-mono text-3xl font-black text-[#F5B942] mb-2">{state.teamBlue.towers}</div>
              <div className="flex items-center justify-center gap-1.5">
                <button 
                  onClick={() => adjustTowers('blue', -1)}
                  className="px-2.5 py-1 bg-[#182231] hover:bg-[#273244] text-[#9FB0C5] rounded text-xs font-bold"
                >
                  -1
                </button>
                <button 
                  onClick={() => triggerSpecial('blue', 'tower_destroyed')}
                  className="px-3 py-1 bg-[#F59E0B] hover:bg-amber-600 text-black rounded text-xs font-black"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Gold */}
            <div className="bg-[#0B0F14] p-3 rounded-xl border border-[#273244] text-center">
              <span className="text-[10px] font-bold text-[#9FB0C5] uppercase block mb-1">GOLD</span>
              <div className="font-mono text-2xl font-black text-[#F5B942] mb-2">{formatGold(state.teamBlue.gold)}</div>
              <div className="flex items-center justify-center gap-1">
                <button 
                  onClick={() => adjustGold('blue', -500)}
                  className="px-2 py-1 bg-[#182231] hover:bg-[#273244] text-[#9FB0C5] rounded text-[10px] font-mono font-bold"
                >
                  -500
                </button>
                <button 
                  onClick={() => adjustGold('blue', 500)}
                  className="px-2 py-1 bg-[#F5B942]/20 text-[#F5B942] hover:bg-[#F5B942]/30 rounded text-[10px] font-mono font-bold border border-[#F5B942]/40"
                >
                  +500
                </button>
              </div>
            </div>
          </div>

          {/* 5 Drafted Heroes 1-Click Kill Bar */}
          <div className="bg-[#0B0F14] p-3 rounded-xl border border-[#273244] mb-4">
            <span className="text-[10px] font-mono font-bold text-[#9FB0C5] uppercase tracking-wider block mb-2">
              DRAFTED HEROES (1-CLICK KILL TRIGGER)
            </span>
            <div className="grid grid-cols-5 gap-2">
              {state.teamBlue.picks.map((slot, idx) => (
                <div key={idx} className="flex flex-col items-center p-1.5 rounded-lg bg-[#182231] border border-[#273244]">
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-black/60 mb-1 border border-white/10">
                    {slot.heroAvatar ? (
                      <img src={slot.heroAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-slate-500">P{idx+1}</div>
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-[#F3F6FA] truncate max-w-[55px] text-center mb-1">
                    {slot.heroName || `Hero ${idx+1}`}
                  </span>
                  <button
                    onClick={() => handleSlotKill('blue', idx)}
                    className="w-full py-0.5 bg-[#2D8CFF] hover:bg-blue-600 text-white rounded text-[9px] font-mono font-black"
                  >
                    + KILL
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 1-Click Objective & Steal Buttons */}
          <div className="bg-[#0B0F14] p-3 rounded-xl border border-[#273244]">
            <span className="text-[10px] font-mono font-bold text-[#9FB0C5] uppercase tracking-wider block mb-2">
              OBJECTIVE TRIGGERS (BLUE)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => triggerSpecial('blue', isMlbb ? 'turtle_secured' : 'tyrant_secured')}
                className="p-2 bg-[#182231] hover:bg-[#273244] border border-[#273244] rounded-lg text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{isMlbb ? '🐢' : '🐉'}</span>
                  <span className="text-xs font-mono font-bold text-[#00D1C7]">
                    x{state.teamBlue.objectives[isMlbb ? 'turtle' : 'primal_tyrant'] || 0}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#F3F6FA] block truncate mt-1">
                  {isMlbb ? '+ Turtle' : '+ Tyrant'}
                </span>
              </button>

              <button
                onClick={() => triggerSpecial('blue', isMlbb ? 'lord_secured' : 'overlord_secured')}
                className="p-2 bg-[#182231] hover:bg-[#273244] border border-[#273244] rounded-lg text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{isMlbb ? '👑' : '🐲'}</span>
                  <span className="text-xs font-mono font-bold text-[#F5B942]">
                    x{state.teamBlue.objectives[isMlbb ? 'lord' : 'shadow_overlord'] || 0}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#F3F6FA] block truncate mt-1">
                  {isMlbb ? '+ Lord' : '+ Overlord'}
                </span>
              </button>

              <button
                onClick={() => triggerSpecial('blue', isMlbb ? 'lord_steal' : 'overlord_steal')}
                className="p-2 bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 border border-[#F59E0B]/50 rounded-lg text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">⚡</span>
                  <span className="text-[9px] font-mono font-black text-[#F5B942] uppercase">STEAL</span>
                </div>
                <span className="text-[11px] font-black text-[#F5B942] block truncate mt-1">
                  {isMlbb ? 'Lord Steal' : 'Overlord Steal'}
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* ---------------- RED TEAM COLUMN ---------------- */}
        <div className="bg-[#121922] border-2 border-[#FF4D67]/40 rounded-xl p-5 shadow-xl relative overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#273244] pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0B0F14] p-1.5 border border-[#FF4D67]/50 shadow-md flex items-center justify-center">
                <img src={state.teamRed.logo} alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#FF4D67] uppercase tracking-wider block">RED SIDE</span>
                <h2 className="text-lg font-black text-[#F3F6FA] uppercase tracking-wide leading-tight">{state.teamRed.name}</h2>
                <span className="text-xs font-mono font-bold text-[#9FB0C5]">[{state.teamRed.shortCode}]</span>
              </div>
            </div>

            {/* Series Points Stepper */}
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-[#9FB0C5] block mb-1">SERIES SCORE</span>
              <div className="flex items-center gap-1.5 bg-[#0B0F14] px-2.5 py-1 rounded-lg border border-[#273244]">
                <button 
                  onClick={() => adjustScore('red', -1)} 
                  className="p-1 hover:bg-[#182231] text-[#9FB0C5] rounded"
                >
                  -
                </button>
                <span className="font-mono text-lg font-black text-[#FF4D67] px-2 min-w-[20px] text-center">
                  {state.teamRed.seriesScore}
                </span>
                <button 
                  onClick={() => adjustScore('red', 1)} 
                  className="p-1 hover:bg-[#182231] text-[#FF4D67] rounded"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics: Kills, Towers, Gold */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {/* Kills */}
            <div className="bg-[#0B0F14] p-3 rounded-xl border border-[#273244] text-center">
              <span className="text-[10px] font-bold text-[#9FB0C5] uppercase block mb-1">KILLS</span>
              <div className="font-mono text-3xl font-black text-[#F3F6FA] mb-2">{state.teamRed.kills}</div>
              <div className="flex items-center justify-center gap-1.5">
                <button 
                  onClick={() => adjustKills('red', -1)}
                  className="px-2.5 py-1 bg-[#182231] hover:bg-[#273244] text-[#9FB0C5] rounded text-xs font-bold"
                >
                  -1
                </button>
                <button 
                  onClick={() => triggerSpecial('red', 'first_blood')}
                  className="px-3 py-1 bg-[#FF4D67] hover:bg-rose-600 text-white rounded text-xs font-bold"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Towers */}
            <div className="bg-[#0B0F14] p-3 rounded-xl border border-[#273244] text-center">
              <span className="text-[10px] font-bold text-[#9FB0C5] uppercase block mb-1">TOWERS</span>
              <div className="font-mono text-3xl font-black text-[#F5B942] mb-2">{state.teamRed.towers}</div>
              <div className="flex items-center justify-center gap-1.5">
                <button 
                  onClick={() => adjustTowers('red', -1)}
                  className="px-2.5 py-1 bg-[#182231] hover:bg-[#273244] text-[#9FB0C5] rounded text-xs font-bold"
                >
                  -1
                </button>
                <button 
                  onClick={() => triggerSpecial('red', 'tower_destroyed')}
                  className="px-3 py-1 bg-[#F59E0B] hover:bg-amber-600 text-black rounded text-xs font-black"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Gold */}
            <div className="bg-[#0B0F14] p-3 rounded-xl border border-[#273244] text-center">
              <span className="text-[10px] font-bold text-[#9FB0C5] uppercase block mb-1">GOLD</span>
              <div className="font-mono text-2xl font-black text-[#F5B942] mb-2">{formatGold(state.teamRed.gold)}</div>
              <div className="flex items-center justify-center gap-1">
                <button 
                  onClick={() => adjustGold('red', -500)}
                  className="px-2 py-1 bg-[#182231] hover:bg-[#273244] text-[#9FB0C5] rounded text-[10px] font-mono font-bold"
                >
                  -500
                </button>
                <button 
                  onClick={() => adjustGold('red', 500)}
                  className="px-2 py-1 bg-[#F5B942]/20 text-[#F5B942] hover:bg-[#F5B942]/30 rounded text-[10px] font-mono font-bold border border-[#F5B942]/40"
                >
                  +500
                </button>
              </div>
            </div>
          </div>

          {/* 5 Drafted Heroes 1-Click Kill Bar */}
          <div className="bg-[#0B0F14] p-3 rounded-xl border border-[#273244] mb-4">
            <span className="text-[10px] font-mono font-bold text-[#9FB0C5] uppercase tracking-wider block mb-2">
              DRAFTED HEROES (1-CLICK KILL TRIGGER)
            </span>
            <div className="grid grid-cols-5 gap-2">
              {state.teamRed.picks.map((slot, idx) => (
                <div key={idx} className="flex flex-col items-center p-1.5 rounded-lg bg-[#182231] border border-[#273244]">
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-black/60 mb-1 border border-white/10">
                    {slot.heroAvatar ? (
                      <img src={slot.heroAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-slate-500">P{idx+1}</div>
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-[#F3F6FA] truncate max-w-[55px] text-center mb-1">
                    {slot.heroName || `Hero ${idx+1}`}
                  </span>
                  <button
                    onClick={() => handleSlotKill('red', idx)}
                    className="w-full py-0.5 bg-[#FF4D67] hover:bg-rose-600 text-white rounded text-[9px] font-mono font-black"
                  >
                    + KILL
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 1-Click Objective & Steal Buttons */}
          <div className="bg-[#0B0F14] p-3 rounded-xl border border-[#273244]">
            <span className="text-[10px] font-mono font-bold text-[#9FB0C5] uppercase tracking-wider block mb-2">
              OBJECTIVE TRIGGERS (RED)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => triggerSpecial('red', isMlbb ? 'turtle_secured' : 'tyrant_secured')}
                className="p-2 bg-[#182231] hover:bg-[#273244] border border-[#273244] rounded-lg text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{isMlbb ? '🐢' : '🐉'}</span>
                  <span className="text-xs font-mono font-bold text-[#00D1C7]">
                    x{state.teamRed.objectives[isMlbb ? 'turtle' : 'primal_tyrant'] || 0}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#F3F6FA] block truncate mt-1">
                  {isMlbb ? '+ Turtle' : '+ Tyrant'}
                </span>
              </button>

              <button
                onClick={() => triggerSpecial('red', isMlbb ? 'lord_secured' : 'overlord_secured')}
                className="p-2 bg-[#182231] hover:bg-[#273244] border border-[#273244] rounded-lg text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{isMlbb ? '👑' : '🐲'}</span>
                  <span className="text-xs font-mono font-bold text-[#F5B942]">
                    x{state.teamRed.objectives[isMlbb ? 'lord' : 'shadow_overlord'] || 0}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#F3F6FA] block truncate mt-1">
                  {isMlbb ? '+ Lord' : '+ Overlord'}
                </span>
              </button>

              <button
                onClick={() => triggerSpecial('red', isMlbb ? 'lord_steal' : 'overlord_steal')}
                className="p-2 bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 border border-[#F59E0B]/50 rounded-lg text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">⚡</span>
                  <span className="text-[9px] font-mono font-black text-[#F5B942] uppercase">STEAL</span>
                </div>
                <span className="text-[11px] font-black text-[#F5B942] block truncate mt-1">
                  {isMlbb ? 'Lord Steal' : 'Overlord Steal'}
                </span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* 3. BROADCAST EVENT COMMAND PAD (1-CLICK OVERLAY TRIGGERS)      */}
      {/* ============================================================== */}
      <div className="bg-[#121922] border border-[#273244] rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#273244] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-[#F5B942]" />
            <h3 className="text-sm font-black text-[#F3F6FA] uppercase tracking-wider">
              1-CLICK BROADCAST EVENT COMMAND PAD
            </h3>
          </div>

          {/* Active Target Team Switcher */}
          <div className="flex items-center gap-2 bg-[#0B0F14] p-1 rounded-lg border border-[#273244]">
            <span className="text-[10px] font-mono text-[#9FB0C5] px-2 font-bold uppercase">TARGET TEAM:</span>
            <button
              onClick={() => setActiveTabTeam('blue')}
              className={`px-3 py-1 rounded text-xs font-black transition-all ${
                activeTabTeam === 'blue'
                  ? 'bg-[#2D8CFF] text-white shadow-md'
                  : 'text-[#9FB0C5] hover:text-white'
              }`}
            >
              {state.teamBlue.shortCode || 'BLUE'}
            </button>
            <button
              onClick={() => setActiveTabTeam('red')}
              className={`px-3 py-1 rounded text-xs font-black transition-all ${
                activeTabTeam === 'red'
                  ? 'bg-[#FF4D67] text-white shadow-md'
                  : 'text-[#9FB0C5] hover:text-white'
              }`}
            >
              {state.teamRed.shortCode || 'RED'}
            </button>
          </div>
        </div>

        {/* Action Pad Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* First Blood */}
          <button
            onClick={() => triggerSpecial(activeTabTeam, 'first_blood')}
            className="p-3 bg-gradient-to-b from-[#2a1d0d] to-[#182231] border border-[#F5B942]/60 hover:border-[#F5B942] rounded-xl flex flex-col items-center justify-center text-center transition-all group shadow-md"
          >
            <span className="text-xl mb-1">🩸</span>
            <span className="text-xs font-black text-[#F5B942] group-hover:scale-105 transition-transform uppercase">
              FIRST BLOOD
            </span>
            <span className="text-[9px] font-mono text-[#9FB0C5] mt-0.5">High Impact</span>
          </button>

          {/* Double Kill */}
          <button
            onClick={() => triggerSpecial(activeTabTeam, 'double_kill')}
            className="p-3 bg-[#182231] hover:bg-[#273244] border border-[#273244] hover:border-[#2D8CFF]/50 rounded-xl flex flex-col items-center justify-center text-center transition-all group shadow-md"
          >
            <span className="text-xl mb-1">⚔️</span>
            <span className="text-xs font-black text-[#F3F6FA] group-hover:text-[#2D8CFF] uppercase">
              DOUBLE KILL
            </span>
            <span className="text-[9px] font-mono text-[#9FB0C5] mt-0.5">+1 Kill</span>
          </button>

          {/* Triple Kill */}
          <button
            onClick={() => triggerSpecial(activeTabTeam, 'triple_kill')}
            className="p-3 bg-[#182231] hover:bg-[#273244] border border-[#273244] hover:border-[#00D1C7]/50 rounded-xl flex flex-col items-center justify-center text-center transition-all group shadow-md"
          >
            <span className="text-xl mb-1">⚡</span>
            <span className="text-xs font-black text-[#00D1C7] group-hover:scale-105 transition-transform uppercase">
              TRIPLE KILL
            </span>
            <span className="text-[9px] font-mono text-[#9FB0C5] mt-0.5">Electric Flare</span>
          </button>

          {/* Maniac */}
          <button
            onClick={() => triggerSpecial(activeTabTeam, 'maniac')}
            className="p-3 bg-gradient-to-b from-[#2e1905] to-[#182231] border border-[#F59E0B]/60 hover:border-[#F59E0B] rounded-xl flex flex-col items-center justify-center text-center transition-all group shadow-md"
          >
            <span className="text-xl mb-1">🔥</span>
            <span className="text-xs font-black text-[#F59E0B] group-hover:scale-105 transition-transform uppercase">
              MANIAC
            </span>
            <span className="text-[9px] font-mono text-[#9FB0C5] mt-0.5">4x Streak</span>
          </button>

          {/* Savage / Penta Kill */}
          <button
            onClick={() => triggerSpecial(activeTabTeam, 'savage')}
            className="p-3 bg-gradient-to-b from-[#3a2707] to-[#182231] border-2 border-[#F5B942] rounded-xl flex flex-col items-center justify-center text-center transition-all group shadow-lg glow-gold"
          >
            <Crown size={22} className="text-[#F5B942] mb-1 animate-bounce" />
            <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#F5B942] group-hover:scale-105 transition-transform uppercase">
              {isMlbb ? 'SAVAGE' : 'PENTA KILL'}
            </span>
            <span className="text-[9px] font-mono text-[#F5B942] mt-0.5">Max Intensity</span>
          </button>

          {/* Shutdown */}
          <button
            onClick={() => triggerSpecial(activeTabTeam, 'shutdown')}
            className="p-3 bg-[#182231] hover:bg-[#273244] border border-[#273244] hover:border-[#EF4444]/50 rounded-xl flex flex-col items-center justify-center text-center transition-all group shadow-md"
          >
            <ShieldAlert size={20} className="text-[#EF4444] mb-1" />
            <span className="text-xs font-black text-[#EF4444] uppercase">
              SHUTDOWN
            </span>
            <span className="text-[9px] font-mono text-[#9FB0C5] mt-0.5">Bounty Ended</span>
          </button>

          {/* Wipeout */}
          <button
            onClick={() => triggerSpecial(activeTabTeam, 'wipeout')}
            className="p-3 bg-[#182231] hover:bg-[#273244] border border-[#273244] hover:border-[#F59E0B]/50 rounded-xl flex flex-col items-center justify-center text-center transition-all group shadow-md"
          >
            <Skull size={20} className="text-[#9FB0C5] mb-1" />
            <span className="text-xs font-black text-[#F3F6FA] uppercase">
              WIPEOUT
            </span>
            <span className="text-[9px] font-mono text-[#9FB0C5] mt-0.5">Team Aced</span>
          </button>
        </div>

        {/* Victory End Match Bar */}
        <div className="mt-4 pt-4 border-t border-[#273244] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-[#F5B942]" />
            <span className="text-xs font-mono font-bold text-[#9FB0C5] uppercase">
              MATCH END CONTROLS:
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerSpecial('blue', 'victory')}
              className="px-4 py-2 bg-[#2D8CFF]/20 hover:bg-[#2D8CFF]/30 border border-[#2D8CFF]/60 text-[#2D8CFF] text-xs font-black rounded-lg transition-all flex items-center gap-1.5 shadow-md"
            >
              <Trophy size={14} />
              DECLARE {state.teamBlue.shortCode || 'BLUE'} VICTORY
            </button>

            <button
              onClick={() => triggerSpecial('red', 'victory')}
              className="px-4 py-2 bg-[#FF4D67]/20 hover:bg-[#FF4D67]/30 border border-[#FF4D67]/60 text-[#FF4D67] text-xs font-black rounded-lg transition-all flex items-center gap-1.5 shadow-md"
            >
              <Trophy size={14} />
              DECLARE {state.teamRed.shortCode || 'RED'} VICTORY
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. REALTIME EVENT HISTORY TIMELINE & UNDO                      */}
      {/* ============================================================== */}
      <div className="bg-[#121922] border border-[#273244] rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#273244] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <History size={16} className="text-[#9FB0C5]" />
            <h3 className="text-xs font-mono font-bold text-[#F3F6FA] uppercase tracking-wider">
              MATCH AUDIT LOG
            </h3>
            <span className="text-xs font-mono text-[#9FB0C5]">({state.events.length} recorded events)</span>
          </div>

          <button
            onClick={handleUndo}
            disabled={state.events.length === 0}
            className="text-xs font-mono font-bold text-[#F5B942] hover:text-amber-300 flex items-center gap-1.5 disabled:opacity-40"
          >
            <Undo2 size={13} />
            Undo Recent Action
          </button>
        </div>

        {state.events.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#9FB0C5] font-mono">
            No events logged yet. Match ready to begin.
          </div>
        ) : (
          <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
            {state.events.slice(0, 15).map((evt) => (
              <div 
                key={evt.id}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono border ${
                  evt.team === 'blue' 
                    ? 'bg-[#182231] border-[#2D8CFF]/30 text-[#F3F6FA]' 
                    : 'bg-[#182231] border-[#FF4D67]/30 text-[#F3F6FA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-[#9FB0C5] bg-[#0B0F14] px-1.5 py-0.5 rounded border border-[#273244]">
                    {formatTime(evt.gameTimeSeconds)}
                  </span>
                  <span className={`font-black uppercase tracking-wider ${evt.team === 'blue' ? 'text-[#2D8CFF]' : 'text-[#FF4D67]'}`}>
                    {evt.team === 'blue' ? state.teamBlue.shortCode : state.teamRed.shortCode}
                  </span>
                  <span>
                    {evt.headline ? (
                      <span className="font-bold text-[#F5B942]">{evt.headline}</span>
                    ) : evt.type === 'kill' ? (
                      <span>
                        Kill by {evt.killerHero?.name || 'Player'} 
                        {evt.victimHero && ` on ${evt.victimHero.name}`}
                      </span>
                    ) : evt.type === 'objective' ? (
                      <span>Secured {evt.objective?.icon} {evt.objective?.name}</span>
                    ) : evt.type === 'tower' ? (
                      <span>Turret Destroyed</span>
                    ) : (
                      <span>Event Logged</span>
                    )}
                  </span>
                </div>

                <span className="text-[10px] text-[#9FB0C5]">
                  {new Date(evt.realTimestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 5. CUSTOM KILL REGISTRATION MODAL                              */}
      {/* ============================================================== */}
      {isKillModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121922] border border-[#273244] w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#273244] pb-3">
              <h3 className="text-base font-black text-[#F3F6FA] flex items-center gap-2 uppercase tracking-wide">
                <Crosshair size={18} className="text-[#FF4D67]" />
                CUSTOM KILL REGISTRATION
              </h3>
              <button 
                onClick={() => setIsKillModalOpen(false)}
                className="text-[#9FB0C5] hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Target Team */}
            <div>
              <label className="text-[10px] font-mono font-bold text-[#9FB0C5] uppercase block mb-1.5">
                SCORING TEAM
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTabTeam('blue')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                    activeTabTeam === 'blue'
                      ? 'bg-[#2D8CFF]/20 border-[#2D8CFF] text-[#2D8CFF]'
                      : 'bg-[#0B0F14] border-[#273244] text-[#9FB0C5]'
                  }`}
                >
                  {state.teamBlue.name}
                </button>
                <button
                  onClick={() => setActiveTabTeam('red')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                    activeTabTeam === 'red'
                      ? 'bg-[#FF4D67]/20 border-[#FF4D67] text-[#FF4D67]'
                      : 'bg-[#0B0F14] border-[#273244] text-[#9FB0C5]'
                  }`}
                >
                  {state.teamRed.name}
                </button>
              </div>
            </div>

            {/* Killer Selection */}
            <div>
              <label className="text-[10px] font-mono font-bold text-[#9FB0C5] uppercase block mb-1.5">
                KILLER HERO ({activeTabTeam.toUpperCase()})
              </label>
              <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1 bg-[#0B0F14] rounded-xl border border-[#273244]">
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
                        ? 'border-[#00D1C7] bg-[#00D1C7]/15'
                        : 'border-[#273244] hover:bg-[#182231]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded overflow-hidden bg-black mb-1">
                      {slot.heroAvatar && <img src={slot.heroAvatar} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-[9px] font-bold text-[#F3F6FA] truncate max-w-[50px]">{slot.heroName || `Slot ${i+1}`}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Multikill Tier */}
            <div>
              <label className="text-[10px] font-mono font-bold text-[#9FB0C5] uppercase block mb-1.5">
                MULTIKILL TIER
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['single', 'double', 'triple', 'maniac', 'savage', 'first_blood'] as MultikillType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedMultikill(type)}
                    className={`py-1.5 px-2 rounded-lg border text-[10px] font-mono font-bold uppercase transition-all ${
                      selectedMultikill === type
                        ? 'bg-[#F5B942]/20 border-[#F5B942] text-[#F5B942]'
                        : 'bg-[#0B0F14] border-[#273244] text-[#9FB0C5] hover:text-white'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3 border-t border-[#273244] flex items-center justify-end gap-3">
              <button
                onClick={() => setIsKillModalOpen(false)}
                className="px-4 py-2 bg-[#182231] hover:bg-[#273244] text-[#9FB0C5] text-xs font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterDetailedKill}
                className="px-5 py-2 bg-[#00D1C7] hover:bg-teal-500 text-black text-xs font-black rounded-lg shadow-md"
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
