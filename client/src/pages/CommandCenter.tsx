import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radio, 
  Tv, 
  Play, 
  Pause, 
  RotateCcw, 
  Undo2, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Trophy, 
  Swords, 
  ExternalLink, 
  Copy, 
  Eye, 
  EyeOff, 
  Power, 
  ArrowRight, 
  Clock, 
  Castle, 
  Coins, 
  Crosshair,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { 
  MatchLiveState, 
  GameType, 
  MatchLifecycleStatus, 
  HeroDefinition,
  MultikillType,
  MatchEvent
} from '../../../shared/types';
import { api } from '../services/api';
import { formatTime, formatGold } from '../utils/formatters';

interface CommandCenterProps {
  state: MatchLiveState | null;
  isConnected: boolean;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ state, isConnected }) => {
  const navigate = useNavigate();

  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [copiedOverlayId, setCopiedOverlayId] = useState<string | null>(null);
  const [selectedMultikill, setSelectedMultikill] = useState<MultikillType>('single');
  const [selectedMvpPlayer, setSelectedMvpPlayer] = useState<string>('');
  const [heroes, setHeroes] = useState<HeroDefinition[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [showGameSwitchModal, setShowGameSwitchModal] = useState(false);
  const [targetGameToSwitch, setTargetGameToSwitch] = useState<GameType | null>(null);

  useEffect(() => {
    if (state?.game) {
      api.getHeroes(state.game).then(setHeroes).catch(() => {});
      api.getObjectives(state.game).then(setObjectives).catch(() => {});
    }
  }, [state?.game]);

  const showFeedback = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-sm">Connecting to MARK47 Engine...</span>
      </div>
    );
  }

  const {
    tournamentName,
    matchName,
    currentGameNumber,
    format,
    game,
    status,
    teamBlue,
    teamRed,
    clockSeconds,
    isClockRunning,
    overlayControls,
    events
  } = state;

  const isMlbb = game === 'mlbb';

  // Overlays definition
  const overlayDefinitions = [
    {
      id: 'hud' as const,
      label: 'Scoreboard HUD',
      url: `${window.location.origin}/overlay/hud`,
      isOnAir: overlayControls.showHud,
      toggleKey: 'showHud' as const
    },
    {
      id: 'draft' as const,
      label: 'Draft Room Stage',
      url: `${window.location.origin}/overlay/draft`,
      isOnAir: overlayControls.showDraft,
      toggleKey: 'showDraft' as const
    },
    {
      id: 'feed' as const,
      label: 'Live Kill Feed',
      url: `${window.location.origin}/overlay/feed`,
      isOnAir: overlayControls.showFeed,
      toggleKey: 'showFeed' as const
    },
    {
      id: 'mvp' as const,
      label: 'MVP Spotlight Card',
      url: `${window.location.origin}/overlay/mvp`,
      isOnAir: overlayControls.showMvp,
      toggleKey: 'showMvp' as const
    }
  ];

  const currentPreviewId = overlayControls.previewOverlay || 'hud';
  const activeOnAirCount = overlayDefinitions.filter(o => o.isOnAir).length;

  // Pre-show checklist validation
  const checklist = [
    { label: 'Tournament & Match Metadata', valid: Boolean(tournamentName && matchName) },
    { label: 'Blue Team (Name, Code & Logo)', valid: Boolean(teamBlue.name && teamBlue.shortCode && teamBlue.logo) },
    { label: 'Red Team (Name, Code & Logo)', valid: Boolean(teamRed.name && teamRed.shortCode && teamRed.logo) },
    { label: 'Blue Roster (5 slots configured)', valid: teamBlue.picks.length >= 5 },
    { label: 'Red Roster (5 slots configured)', valid: teamRed.picks.length >= 5 },
    { label: 'Server & WebSocket Hub Synchronized', valid: isConnected },
  ];
  const allChecklistValid = checklist.every(c => c.valid);

  // Handlers
  const handleLifecycleChange = async (newStatus: MatchLifecycleStatus) => {
    if ((status === 'live' || status === 'drafting') && (newStatus === 'scheduled' || newStatus === 'archived')) {
      const confirmChange = window.confirm(`Match is currently ${status.toUpperCase()}. Are you sure you want to transition to ${newStatus.toUpperCase()}?`);
      if (!confirmChange) return;
    }
    const res = await api.setLifecycle(newStatus);
    if (!res.success) {
      showFeedback(res.error || 'Failed to update lifecycle', 'error');
    } else {
      showFeedback(`Lifecycle transition -> ${newStatus.toUpperCase()}`, 'success');
    }
  };

  const handleGameSwitchRequest = (target: GameType) => {
    if (target === game) return;
    if (status === 'live' || status === 'paused' || status === 'drafting') {
      setTargetGameToSwitch(target);
      setShowGameSwitchModal(true);
    } else {
      performGameSwitch(target, false);
    }
  };

  const performGameSwitch = async (target: GameType, force: boolean) => {
    const res = await api.switchGame(target, force);
    setShowGameSwitchModal(false);
    setTargetGameToSwitch(null);
    if (!res.success) {
      showFeedback(res.error || 'Failed to switch game', 'error');
    } else {
      showFeedback(`Switched game mode to ${target.toUpperCase()}`, 'success');
    }
  };

  const handlePreviewSelect = (overlayId: 'hud' | 'draft' | 'feed' | 'mvp') => {
    api.setPreviewOverlay(overlayId);
  };

  const handleTakeOverlay = async () => {
    await api.takeOverlay();
    showFeedback(`Pushed [${currentPreviewId.toUpperCase()}] to ON-AIR stream`, 'success');
  };

  const handleToggleOverlay = async (key: keyof MatchLiveState['overlayControls'], currentVal: boolean) => {
    await api.updateOverlayControls({ [key]: !currentVal });
  };

  const handleBlackout = async () => {
    if (window.confirm('EMERGENCY BLACKOUT: Are you sure you want to hide ALL broadcast overlays in OBS immediately?')) {
      await api.blackoutOverlays();
      showFeedback('Emergency Blackout executed: All overlays hidden', 'warning');
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedOverlayId(id);
    setTimeout(() => setCopiedOverlayId(null), 2000);
    showFeedback(`Copied ${id.toUpperCase()} overlay URL to clipboard`, 'success');
  };

  // Clock Actions
  const handleToggleClock = () => api.toggleClock();
  const handleAdjustClock = (delta: number) => api.setClock(Math.max(0, clockSeconds + delta));

  // Undo Action
  const handleUndo = async () => {
    const res = await api.undoLastEvent();
    if (res.success) {
      showFeedback('Last event reverted and purged from broadcast graphics', 'success');
    } else {
      showFeedback('No event available to undo', 'warning');
    }
  };

  // Slot Kill Quick Action
  const handleFastSlotKill = async (team: 'blue' | 'red', slotIndex: number) => {
    const res = await api.registerSlotKill({
      team,
      killerSlotIndex: slotIndex,
      multikill: selectedMultikill
    });
    if (res.duplicate) {
      showFeedback('Duplicate click suppressed by safety filter', 'warning');
    } else if (res.success) {
      const killerHero = (team === 'blue' ? teamBlue.picks[slotIndex] : teamRed.picks[slotIndex])?.heroName || `Slot ${slotIndex + 1}`;
      showFeedback(`Kill logged: [${team.toUpperCase()}] ${killerHero} (${selectedMultikill})`, 'success');
    }
  };

  // Tower Quick Action
  const handleFastTower = async (team: 'blue' | 'red') => {
    const res = await api.registerTower(team);
    if (res.duplicate) {
      showFeedback('Duplicate click suppressed', 'warning');
    } else if (res.success) {
      showFeedback(`Tower destroyed by ${team.toUpperCase()}`, 'success');
    }
  };

  // Objective Quick Action
  const handleFastObjective = async (team: 'blue' | 'red', obj: any) => {
    const res = await api.registerObjective({
      team,
      objectiveId: obj.id,
      objectiveName: obj.name,
      objectiveIcon: obj.icon
    });
    if (res.duplicate) {
      showFeedback('Duplicate click suppressed', 'warning');
    } else if (res.success) {
      showFeedback(`Objective secured: [${team.toUpperCase()}] ${obj.name}`, 'success');
    }
  };

  // End Game & Series Flow
  const handleEndGame = async (winner: 'blue' | 'red') => {
    const winningTeam = winner === 'blue' ? teamBlue.name : teamRed.name;
    const confirmEnd = window.confirm(`CONFIRM RESULT: Declare ${winningTeam} (${winner.toUpperCase()}) as the winner of Game ${currentGameNumber}?`);
    if (!confirmEnd) return;

    const res = await api.endGame(winner);
    if (res.success) {
      showFeedback(`Game ${currentGameNumber} ended. Result recorded for ${winningTeam}.`, 'success');
    }
  };

  const handlePrepareNextGame = async () => {
    const confirmNext = window.confirm(`Prepare Game ${currentGameNumber + 1}? This resets in-game kills, clock, and picks/bans while preserving the series score.`);
    if (!confirmNext) return;

    const res = await api.prepareNextGame();
    if (res.success) {
      showFeedback(`Game ${currentGameNumber + 1} initialized and ready for draft.`, 'success');
    }
  };

  return (
    <div className="max-w-[1720px] mx-auto p-4 space-y-5 text-slate-200">
      
      {/* ================= PERSISTENT BROADCAST HEADER ================= */}
      <header className="bg-[#121922] border border-[#273244] rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Left: Tournament & Match Series Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B0F14] border border-[#273244] flex items-center justify-center text-[#F5B942] font-black shadow-inner">
            <Trophy size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9FB0C5]">
                {tournamentName || 'BROADCAST PRODUCTION'}
              </span>
              <span className="text-[#273244]">•</span>
              <span className="text-[10px] font-mono font-bold text-[#F5B942]">
                GAME {currentGameNumber} OF {format}
              </span>
            </div>
            <h1 className="text-lg font-black text-[#F3F6FA] leading-tight">
              {matchName || 'Competitive Series'}
            </h1>
          </div>
        </div>

        {/* Center: Blue vs Red Badges */}
        <div className="flex items-center gap-3 bg-[#0B0F14] px-4 py-2 rounded-xl border border-[#273244] shadow-inner">
          <div className="flex items-center gap-2 text-[#2D8CFF] font-bold text-xs">
            <img src={teamBlue.logo} alt="" className="w-6 h-6 rounded bg-[#121922] object-contain p-0.5" />
            <span>{teamBlue.shortCode}</span>
            <span className="text-base font-black font-mono bg-[#2D8CFF]/20 px-2 py-0.5 rounded text-white border border-[#2D8CFF]/40">
              {teamBlue.seriesScore}
            </span>
          </div>

          <span className="text-[#9FB0C5] font-black text-xs font-mono">VS</span>

          <div className="flex items-center gap-2 text-[#FF4D67] font-bold text-xs">
            <span className="text-base font-black font-mono bg-[#FF4D67]/20 px-2 py-0.5 rounded text-white border border-[#FF4D67]/40">
              {teamRed.seriesScore}
            </span>
            <span>{teamRed.shortCode}</span>
            <img src={teamRed.logo} alt="" className="w-6 h-6 rounded bg-[#121922] object-contain p-0.5" />
          </div>
        </div>

        {/* Right: Lifecycle Transition & Game Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Game Mode Pill */}
          <div className="flex items-center bg-[#0B0F14] p-1 rounded-xl border border-[#273244]">
            <button
              onClick={() => handleGameSwitchRequest('mlbb')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                isMlbb ? 'bg-[#2D8CFF] text-white shadow-sm' : 'text-[#9FB0C5] hover:text-[#F3F6FA]'
              }`}
            >
              MLBB
            </button>
            <button
              onClick={() => handleGameSwitchRequest('hok')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                !isMlbb ? 'bg-[#F59E0B] text-black shadow-sm' : 'text-[#9FB0C5] hover:text-[#F3F6FA]'
              }`}
            >
              HOK
            </button>
          </div>

          {/* Lifecycle Status Pill & Quick Transition Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#0B0F14] px-3 py-1.5 rounded-xl border border-[#273244]">
            <span className={`w-2.5 h-2.5 rounded-full ${
              status === 'live' ? 'bg-[#22C55E] animate-pulse' :
              status === 'drafting' ? 'bg-[#F59E0B] animate-pulse' :
              status === 'paused' ? 'bg-[#F5B942]' :
              status === 'ended' ? 'bg-[#00D1C7]' : 'bg-[#9FB0C5]'
            }`} />
            <select
              value={status}
              onChange={(e) => handleLifecycleChange(e.target.value as MatchLifecycleStatus)}
              className="bg-transparent text-xs font-mono font-bold uppercase text-[#F3F6FA] focus:outline-none cursor-pointer"
            >
              <option value="scheduled" className="bg-[#121922] text-[#9FB0C5]">Scheduled</option>
              <option value="ready" className="bg-[#121922] text-[#2D8CFF]">Ready</option>
              <option value="drafting" className="bg-[#121922] text-[#F5B942]">Drafting</option>
              <option value="live" className="bg-[#121922] text-[#22C55E]">Live</option>
              <option value="paused" className="bg-[#121922] text-[#F59E0B]">Paused</option>
              <option value="ended" className="bg-[#121922] text-[#00D1C7]">Ended</option>
              <option value="archived" className="bg-[#121922] text-[#9FB0C5]">Archived</option>
            </select>
          </div>

          {/* Outputs Health Status */}
          <div className="flex items-center gap-2 bg-[#0B0F14] px-3 py-1.5 rounded-xl border border-[#273244] text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} />
            <span className="text-[#9FB0C5]">
              {activeOnAirCount} On-Air
            </span>
          </div>
        </div>
      </header>

      {/* ================= CALM WARNING / FEEDBACK BANNER ================= */}
      {feedbackMessage && (
        <div className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between shadow-lg transition-all ${
          feedbackMessage.type === 'error' 
            ? 'bg-red-950/80 border-red-500 text-red-200' 
            : feedbackMessage.type === 'warning'
              ? 'bg-amber-950/80 border-amber-500 text-amber-200'
              : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'error' ? <ShieldAlert size={16} /> :
             feedbackMessage.type === 'warning' ? <AlertTriangle size={16} /> :
             <CheckCircle2 size={16} />}
            <span>{feedbackMessage.text}</span>
          </div>
          <button 
            onClick={() => setFeedbackMessage(null)}
            className="text-xs opacity-75 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* ================= PRE-SHOW CHECKLIST (IF NOT LIVE) ================= */}
      {(status === 'scheduled' || status === 'ready') && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <ShieldCheck size={16} className="text-sky-400" />
              <span>Pre-Show Broadcast Checklist</span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              {checklist.filter(c => c.valid).length} / {checklist.length} Passed
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {checklist.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  item.valid 
                    ? 'bg-slate-950/80 border-slate-800 text-slate-300' 
                    : 'bg-red-950/40 border-red-800/60 text-red-300'
                }`}
              >
                {item.valid ? (
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                )}
                <span className="truncate font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            {status === 'scheduled' && (
              <button
                onClick={() => handleLifecycleChange('ready')}
                disabled={!allChecklistValid}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  allChecklistValid 
                    ? 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 size={14} />
                CONFIRM PRE-SHOW READY
              </button>
            )}

            <button
              onClick={() => handleLifecycleChange('drafting')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Swords size={14} />
              ADVANCE TO DRAFT ROOM
            </button>
          </div>
        </div>
      )}

      {/* ================= PREVIEW / ON-AIR (PROGRAM) AREA ================= */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Tv size={18} className="text-sky-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Broadcast Staging: Preview &amp; On-Air
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBlackout}
              className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Instantly clear all overlays from OBS stream"
            >
              <Power size={13} />
              EMERGENCY BLACKOUT
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* PREVIEW STAGE (Staged - Not visible until taken) */}
          <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  PREVIEW (STAGED • NOT ON BROADCAST)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Target: 1920×1080 Transparent
                </span>
              </div>

              {/* Preview Selector Tabs */}
              <div className="grid grid-cols-4 gap-1.5 mb-3 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {overlayDefinitions.map(ov => (
                  <button
                    key={ov.id}
                    onClick={() => handlePreviewSelect(ov.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all text-center ${
                      currentPreviewId === ov.id 
                        ? 'bg-amber-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {ov.id.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Graphic Staged Card Preview */}
              <div className="aspect-[16/9] max-h-[170px] bg-slate-900/90 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                <div className="text-3xl mb-1">
                  {currentPreviewId === 'hud' ? '📊' :
                   currentPreviewId === 'draft' ? '⚔️' :
                   currentPreviewId === 'feed' ? '🎯' : '⭐'}
                </div>
                <div className="text-xs font-bold text-white uppercase">
                  {overlayDefinitions.find(o => o.id === currentPreviewId)?.label}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1 max-w-[280px]">
                  {currentPreviewId === 'hud' && 'Live in-game scoreboard bar with series score, clock, and gold.'}
                  {currentPreviewId === 'draft' && 'Full-screen pick/ban room with active phase timers.'}
                  {currentPreviewId === 'feed' && 'Instant kill, multikill, and neutral objective banners.'}
                  {currentPreviewId === 'mvp' && 'Post-match MVP spotlight with player stats and portrait.'}
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500 text-center">
              Click <b>TAKE ON AIR</b> to push this graphic to OBS viewers.
            </div>
          </div>

          {/* MASTER TRANSITION CONTROLS (Center Column) */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center gap-3 py-2">
            <button
              onClick={handleTakeOverlay}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>TAKE ON AIR</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={handleUndo}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Undo last scoring/objective event and purge from overlays"
            >
              <Undo2 size={14} />
              <span>UNDO LAST</span>
            </button>
          </div>

          {/* ON-AIR (PROGRAM / OBS SOURCES) */}
          <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ON-AIR (ACTIVE IN OBS / BROADCAST)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {activeOnAirCount} OF 4 ACTIVE
                </span>
              </div>

              {/* Overlay List with Direct Toggles & URL Copy */}
              <div className="space-y-2">
                {overlayDefinitions.map(ov => (
                  <div 
                    key={ov.id}
                    className="flex items-center justify-between p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${ov.isOnAir ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <span className="font-bold text-white">{ov.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyUrl(ov.id, ov.url)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono flex items-center gap-1"
                        title="Copy Browser Source URL for OBS"
                      >
                        <Copy size={11} />
                        {copiedOverlayId === ov.id ? 'COPIED' : 'OBS URL'}
                      </button>

                      <button
                        onClick={() => handleToggleOverlay(ov.toggleKey, ov.isOnAir)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition-all ${
                          ov.isOnAir 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30' 
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {ov.isOnAir ? 'LIVE' : 'HIDDEN'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500 text-center">
              OBS browser sources refresh automatically over local WebSocket.
            </div>
          </div>

        </div>
      </section>

      {/* ================= COMPACT LIVE SCOREBOARD ================= */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
          
          {/* Blue Side Scoreboard */}
          <div className="lg:col-span-5 bg-gradient-to-r from-sky-950/70 to-slate-950 p-4 rounded-xl border border-sky-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={teamBlue.logo} alt="" className="w-12 h-12 rounded-lg bg-slate-900 p-1 border border-sky-400/40 object-contain" />
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase">BLUE TEAM</span>
                <h3 className="text-base font-black text-white leading-tight">{teamBlue.name}</h3>
                <span className="text-xs text-slate-400 font-mono">[{teamBlue.shortCode}]</span>
              </div>
            </div>

            {/* Scoreboard Metrics */}
            <div className="flex items-center gap-3">
              {/* Kills */}
              <div className="text-center">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Kills</span>
                <span className="text-2xl font-black font-mono text-sky-400">{teamBlue.kills}</span>
              </div>

              {/* Towers */}
              <div className="text-center">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Towers</span>
                <span className="text-2xl font-black font-mono text-amber-400">{teamBlue.towers}</span>
              </div>

              {/* Gold */}
              <div className="text-center">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Gold</span>
                <span className="text-xs font-mono font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded">
                  {formatGold(teamBlue.gold)}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Clock & Global Series Points */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">CLOCK</span>
            <span className="text-2xl font-mono font-black text-amber-400 my-0.5">
              {formatTime(clockSeconds)}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleClock}
                className={`p-1.5 rounded-lg text-white transition-all ${
                  isClockRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
                title={isClockRunning ? 'Pause Clock' : 'Start Clock'}
              >
                {isClockRunning ? <Pause size={13} /> : <Play size={13} />}
              </button>

              <button
                onClick={() => handleAdjustClock(30)}
                className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono font-bold"
                title="Add 30 seconds"
              >
                +30s
              </button>
            </div>
          </div>

          {/* Red Side Scoreboard */}
          <div className="lg:col-span-5 bg-gradient-to-l from-red-950/70 to-slate-950 p-4 rounded-xl border border-red-500/30 flex items-center justify-between">
            {/* Scoreboard Metrics */}
            <div className="flex items-center gap-3">
              {/* Gold */}
              <div className="text-center">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Gold</span>
                <span className="text-xs font-mono font-bold text-yellow-400 bg-slate-900 px-2 py-1 rounded">
                  {formatGold(teamRed.gold)}
                </span>
              </div>

              {/* Towers */}
              <div className="text-center">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Towers</span>
                <span className="text-2xl font-black font-mono text-amber-400">{teamRed.towers}</span>
              </div>

              {/* Kills */}
              <div className="text-center">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Kills</span>
                <span className="text-2xl font-black font-mono text-red-400">{teamRed.kills}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase">RED TEAM</span>
                <h3 className="text-base font-black text-white leading-tight">{teamRed.name}</h3>
                <span className="text-xs text-slate-400 font-mono">[{teamRed.shortCode}]</span>
              </div>
              <img src={teamRed.logo} alt="" className="w-12 h-12 rounded-lg bg-slate-900 p-1 border border-red-400/40 object-contain" />
            </div>
          </div>

        </div>
      </section>

      {/* ================= PHASE-AWARE ACTION CONTROLS & TIMELINE ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* Left/Center Action Panel (8 cols) */}
        <div className="xl:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          
          {/* Phase Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Crosshair size={18} className="text-amber-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                {status === 'drafting' ? 'Draft Room Actions' :
                 status === 'ended' ? 'Post-Game Resolution' :
                 'Live In-Game Action Desk'}
              </h3>
            </div>

            {/* Multikill modifier toggle */}
            {(status === 'live' || status === 'paused') && (
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-mono">
                <span className="text-slate-400 px-1 font-bold">TAG:</span>
                {(['single', 'double', 'triple', 'maniac', 'savage'] as MultikillType[]).map(mk => (
                  <button
                    key={mk}
                    onClick={() => setSelectedMultikill(mk)}
                    className={`px-2 py-0.5 rounded font-bold uppercase transition-all ${
                      selectedMultikill === mk 
                        ? 'bg-amber-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mk}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ============= LIVE PLAY ACTION PANELS ============= */}
          {(status === 'live' || status === 'paused' || status === 'ready' || status === 'scheduled') && (
            <div className="space-y-4">
              
              {/* 1-Click Fast Player Kill Selector */}
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  1-CLICK HERO KILL REGISTRATION (ACTIVE DRAFTED ROSTERS)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Blue 5 Drafted Players */}
                  <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-sky-500/20">
                    <span className="text-[10px] font-mono font-bold text-sky-400 uppercase block mb-1">
                      BLUE TEAM KILLER ({teamBlue.name})
                    </span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {teamBlue.picks.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleFastSlotKill('blue', idx)}
                          className="bg-slate-900 hover:bg-sky-900/50 border border-slate-800 hover:border-sky-500/50 p-2 rounded-xl text-center transition-all group flex flex-col items-center gap-1 active:scale-95"
                          title={`Log kill by ${p.heroName || `Slot ${idx+1}`}`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden border border-slate-700 flex items-center justify-center shadow">
                            {p.heroAvatar ? (
                              <img src={p.heroAvatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-mono font-bold text-slate-500">P{idx+1}</span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-white truncate max-w-full group-hover:text-sky-300">
                            {p.heroName ? p.heroName.split(' ')[0] : `P${idx+1}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Red 5 Drafted Players */}
                  <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-red-500/20">
                    <span className="text-[10px] font-mono font-bold text-red-400 uppercase block mb-1">
                      RED TEAM KILLER ({teamRed.name})
                    </span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {teamRed.picks.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleFastSlotKill('red', idx)}
                          className="bg-slate-900 hover:bg-red-900/50 border border-slate-800 hover:border-red-500/50 p-2 rounded-xl text-center transition-all group flex flex-col items-center gap-1 active:scale-95"
                          title={`Log kill by ${p.heroName || `Slot ${idx+1}`}`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden border border-slate-700 flex items-center justify-center shadow">
                            {p.heroAvatar ? (
                              <img src={p.heroAvatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-mono font-bold text-slate-500">P{idx+1}</span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-white truncate max-w-full group-hover:text-red-300">
                            {p.heroName ? p.heroName.split(' ')[0] : `P${idx+1}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast Tower & Objective Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Tower Destroy Controls */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <Castle size={13} />
                    TOWERS DESTROYED (+1 TOWER)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleFastTower('blue')}
                      className="py-2.5 px-3 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-500/40 text-sky-200 rounded-xl text-xs font-bold transition-all active:scale-95"
                    >
                      +1 BLUE TOWER
                    </button>
                    <button
                      onClick={() => handleFastTower('red')}
                      className="py-2.5 px-3 bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-200 rounded-xl text-xs font-bold transition-all active:scale-95"
                    >
                      +1 RED TOWER
                    </button>
                  </div>
                </div>

                {/* Neutral Objective Triggers */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <Flame size={13} />
                    NEUTRAL OBJECTIVES ({isMlbb ? 'TURTLE / LORD' : 'TYRANT / OVERLORD'})
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {objectives.slice(0, 2).map((obj) => (
                      <div key={obj.id} className="flex gap-1">
                        <button
                          onClick={() => handleFastObjective('blue', obj)}
                          className="flex-1 py-2 px-1 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-500/40 text-sky-200 rounded-lg text-[10px] font-bold truncate"
                          title={`Blue secured ${obj.name}`}
                        >
                          BLU {obj.name.toUpperCase()}
                        </button>
                        <button
                          onClick={() => handleFastObjective('red', obj)}
                          className="flex-1 py-2 px-1 bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-200 rounded-lg text-[10px] font-bold truncate"
                          title={`Red secured ${obj.name}`}
                        >
                          RED {obj.name.toUpperCase()}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* End Game Quick Trigger */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  Game concluded? Conclude result and lock stats:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEndGame('blue')}
                    className="px-3 py-1.5 bg-sky-950 hover:bg-sky-900 border border-sky-400 text-sky-300 rounded-xl font-bold cursor-pointer transition-all"
                  >
                    BLUE VICTORY
                  </button>
                  <button
                    onClick={() => handleEndGame('red')}
                    className="px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-400 text-red-300 rounded-xl font-bold cursor-pointer transition-all"
                  >
                    RED VICTORY
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ============= DRAFT ROOM FAST SUMMARY ============= */}
          {status === 'drafting' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                    ACTIVE DRAFT TURN
                  </span>
                  <h4 className="text-base font-black text-white">
                    {state.draft.phases[state.draft.activePhaseIndex]?.label || 'Draft Phase Complete'}
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    Phase {state.draft.activePhaseIndex + 1} of {state.draft.phases.length}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-3xl font-mono font-black text-amber-400">
                    {state.draft.timerRemaining}s
                  </span>

                  <button
                    onClick={() => navigate('/draft')}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <span>OPEN FULL DRAFT ROOM</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono text-slate-400">
                  Ready to launch live gameplay?
                </span>
                <button
                  onClick={() => handleLifecycleChange('live')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Play size={14} />
                  <span>START LIVE MATCH</span>
                </button>
              </div>
            </div>
          )}

          {/* ============= POST-GAME SERIES ADVANCE ============= */}
          {status === 'ended' && (
            <div className="space-y-4 p-4 bg-slate-950 rounded-xl border border-indigo-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold block">
                    MATCH RESULT RECORDED
                  </span>
                  <h4 className="text-lg font-black text-white">
                    Game {currentGameNumber} Complete
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    Series Score: {teamBlue.name} {teamBlue.seriesScore} - {teamRed.seriesScore} {teamRed.name}
                  </span>
                </div>

                <button
                  onClick={handlePrepareNextGame}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer transition-all"
                >
                  <span>INITIALIZE GAME {currentGameNumber + 1}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right: Recent Actions Audit Timeline (4 cols) */}
        <div className="xl:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-slate-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Audit Timeline (Recent Events)
                </h3>
              </div>

              <button
                onClick={handleUndo}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                title="Undo the most recent event"
              >
                <Undo2 size={12} />
                UNDO
              </button>
            </div>

            {/* Events List */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {events && events.length > 0 ? (
                events.slice(0, 8).map((ev: MatchEvent) => (
                  <div 
                    key={ev.id}
                    className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-start justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                          ev.team === 'blue' ? 'bg-sky-950 text-sky-400 border border-sky-500/30' : 'bg-red-950 text-red-400 border border-red-500/30'
                        }`}>
                          {ev.team}
                        </span>
                        <span className="font-bold text-white capitalize">{ev.type}</span>
                        {ev.multikill && ev.multikill !== 'single' && (
                          <span className="text-[9px] font-mono bg-amber-950 text-amber-300 px-1 rounded uppercase font-bold">
                            {ev.multikill}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">
                        {ev.message || (ev.killerHero ? `${ev.killerHero.name} secured kill` : `${ev.type} recorded for ${ev.team}`)}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">
                      {formatTime(ev.gameTimeSeconds || 0)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs font-mono text-slate-600">
                  No recorded events yet in this game.
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500 text-center">
            Every scoring event is synced to OBS with atomic undo protection.
          </div>
        </div>

      </div>

      {/* ================= GUARDED GAME SWITCH MODAL ================= */}
      {showGameSwitchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert size={24} />
              <h3 className="text-base font-black text-white">
                Live Match Protection Alert
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Match <b>{matchName}</b> is currently <b>{status.toUpperCase()}</b>. Switching to <b>{targetGameToSwitch?.toUpperCase()}</b> will reset active draft, clock, and scoreboard data for this match.
            </p>

            <div className="p-3 bg-red-950/40 rounded-xl border border-red-800/60 text-[11px] font-mono text-red-300">
              ⚠️ Please confirm you intend to overwrite the current live broadcast session.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => { setShowGameSwitchModal(false); setTargetGameToSwitch(null); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                CANCEL
              </button>
              <button
                onClick={() => targetGameToSwitch && performGameSwitch(targetGameToSwitch, true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                CONFIRM &amp; SWITCH
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
