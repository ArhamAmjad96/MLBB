import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Radio, 
  Tv, 
  Swords, 
  Play, 
  Pause, 
  RotateCcw, 
  Undo2, 
  Copy, 
  Check, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Trophy, 
  ShieldAlert, 
  Flame, 
  Coins, 
  Castle, 
  Clock, 
  ArrowRight,
  Sparkles,
  Zap,
  Settings,
  Users,
  ArrowLeftRight
} from 'lucide-react';
import { MatchLiveState, SpecialEventType, Team } from '../../../shared/types';
import { api } from '../services/api';
import { formatTime, formatGold } from '../utils/formatters';

interface DashboardProps {
  state: MatchLiveState | null;
  isConnected: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, isConnected }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);

  // Setup Form State
  const [setupTournament, setSetupTournament] = useState('');
  const [setupMatch, setSetupMatch] = useState('');
  const [setupFormat, setSetupFormat] = useState<'BO1' | 'BO3' | 'BO5' | 'BO7'>('BO3');
  const [setupGameNumber, setSetupGameNumber] = useState(1);

  const [blueName, setBlueName] = useState('');
  const [blueCode, setBlueCode] = useState('');
  const [blueLogo, setBlueLogo] = useState('');
  const [bluePlayers, setBluePlayers] = useState<{ inGameName: string; role: string; name?: string }[]>([]);

  const [redName, setRedName] = useState('');
  const [redCode, setRedCode] = useState('');
  const [redLogo, setRedLogo] = useState('');
  const [redPlayers, setRedPlayers] = useState<{ inGameName: string; role: string; name?: string }[]>([]);

  useEffect(() => {
    if (state?.game) {
      api.getTeams(state.game).then(setAvailableTeams).catch(() => {});
    }
  }, [state?.game]);

  const openSetupModal = () => {
    if (!state) return;
    setSetupTournament(state.tournamentName);
    setSetupMatch(state.matchName);
    setSetupFormat(state.format);
    setSetupGameNumber(state.currentGameNumber);

    setBlueName(state.teamBlue.name);
    setBlueCode(state.teamBlue.shortCode);
    setBlueLogo(state.teamBlue.logo);
    setBluePlayers(
      state.teamBlue.picks.map((p, i) => ({
        inGameName: p.playerName || `Player ${i + 1}`,
        role: p.role || (state.game === 'mlbb' ? ['EXP', 'MID', 'GOLD', 'ROAM', 'JUNGLE'][i] : ['CLASH', 'MID', 'FARM', 'ROAM', 'JUNGLE'][i]),
        name: ''
      }))
    );

    setRedName(state.teamRed.name);
    setRedCode(state.teamRed.shortCode);
    setRedLogo(state.teamRed.logo);
    setRedPlayers(
      state.teamRed.picks.map((p, i) => ({
        inGameName: p.playerName || `Player ${i + 1}`,
        role: p.role || (state.game === 'mlbb' ? ['EXP', 'MID', 'GOLD', 'ROAM', 'JUNGLE'][i] : ['CLASH', 'MID', 'FARM', 'ROAM', 'JUNGLE'][i]),
        name: ''
      }))
    );

    setIsSetupModalOpen(true);
  };

  const handleSelectPresetTeam = (teamId: string, side: 'blue' | 'red') => {
    const found = availableTeams.find(t => t.id === teamId);
    if (!found) return;

    const defaultRoles = state?.game === 'mlbb' 
      ? ['EXP', 'MID', 'GOLD', 'ROAM', 'JUNGLE'] 
      : ['CLASH', 'MID', 'FARM', 'ROAM', 'JUNGLE'];

    const formattedPlayers = (found.players && found.players.length > 0)
      ? found.players.slice(0, 5).map((p, i) => ({
          inGameName: p.inGameName,
          role: p.role || defaultRoles[i] || 'FLEX',
          name: p.name
        }))
      : defaultRoles.map((r, i) => ({ inGameName: `Player ${i + 1}`, role: r }));

    if (side === 'blue') {
      setBlueName(found.name);
      setBlueCode(found.shortCode);
      setBlueLogo(found.logo);
      setBluePlayers(formattedPlayers);
    } else {
      setRedName(found.name);
      setRedCode(found.shortCode);
      setRedLogo(found.logo);
      setRedPlayers(formattedPlayers);
    }
  };

  const handleSwapSides = () => {
    const tempName = blueName;
    const tempCode = blueCode;
    const tempLogo = blueLogo;
    const tempPlayers = [...bluePlayers];

    setBlueName(redName);
    setBlueCode(redCode);
    setBlueLogo(redLogo);
    setBluePlayers(redPlayers);

    setRedName(tempName);
    setRedCode(tempCode);
    setRedLogo(tempLogo);
    setRedPlayers(tempPlayers);
  };

  const handleSaveSetup = async () => {
    try {
      await api.updateMatchSetup({
        tournamentName: setupTournament,
        matchName: setupMatch,
        format: setupFormat,
        currentGameNumber: Number(setupGameNumber),
        teamBlue: {
          name: blueName,
          shortCode: blueCode,
          logo: blueLogo,
          players: bluePlayers
        },
        teamRed: {
          name: redName,
          shortCode: redCode,
          logo: redLogo,
          players: redPlayers
        }
      });
      setIsSetupModalOpen(false);
      showNotification('Pre-match setup & team names saved successfully!');
    } catch (err: any) {
      showNotification('Failed to update match setup');
    }
  };

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Connecting to MARK47 Engine...</span>
      </div>
    );
  }

  const { teamBlue, teamRed, game, status, clockSeconds, isClockRunning, overlayControls, events } = state;
  const isMlbb = game === 'mlbb';

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCopy = (id: string, path: string) => {
    const url = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showNotification(`Copied ${id.toUpperCase()} overlay URL for OBS!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleOverlay = async (key: keyof typeof overlayControls, val: boolean) => {
    await api.updateOverlayControls({ [key]: !val });
  };

  const handleTriggerSpecial = async (team: 'blue' | 'red', specialType: SpecialEventType) => {
    const teamName = team === 'blue' ? teamBlue.shortCode : teamRed.shortCode;
    showNotification(`${teamName} triggered ${specialType.replace(/_/g, ' ').toUpperCase()}`);
    await api.registerSpecialEvent({ team, specialType });
  };

  const handleUndo = async () => {
    await api.undoLastEvent();
    showNotification('Reverted last recorded match event');
  };

  const overlaysList = [
    {
      id: 'hud',
      title: 'Scoreboard HUD',
      subtitle: 'Top transparent broadcast banner with scores, kills & towers',
      path: '/overlay/hud',
      isActive: overlayControls.showHud,
      toggleKey: 'showHud' as const
    },
    {
      id: 'feed',
      title: 'In-Game Event Feed',
      subtitle: 'Animated popups for First Blood, Turtle, Lord, and Multi-kills',
      path: '/overlay/feed',
      isActive: overlayControls.showFeed,
      toggleKey: 'showFeed' as const
    },
    {
      id: 'draft',
      title: 'Draft Pick & Ban Stage',
      subtitle: '1080p full drafting layout with phase timer and hero spotlights',
      path: '/overlay/draft',
      isActive: overlayControls.showDraft,
      toggleKey: 'showDraft' as const
    },
    {
      id: 'mvp',
      title: 'Post-Match MVP Card',
      subtitle: 'Highlight graphic for Match MVP player, stats & KDA breakdown',
      path: '/overlay/mvp',
      isActive: overlayControls.showMvp,
      toggleKey: 'showMvp' as const
    }
  ];

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6 space-y-8">

      {/* Toast Feedback Notification */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-pop-in">
          <Sparkles size={16} className="text-indigo-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 1. Header Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {state.tournamentName || 'Tournament Production'}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {state.format.toUpperCase()} • Game {state.currentGameNumber}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {state.matchName} • Active Game Mode: <strong className="text-indigo-400">{isMlbb ? 'Mobile Legends: Bang Bang' : 'Honor of Kings'}</strong>
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={openSetupModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Settings size={16} />
            <span>Pre-Match Setup</span>
          </button>

          <NavLink
            to="/live"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
          >
            <Radio size={16} className="animate-pulse" />
            <span>Open Live Desk</span>
            <ArrowRight size={14} />
          </NavLink>

          <NavLink
            to="/draft"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-600/20 active:scale-95 transition-all"
          >
            <Swords size={16} />
            <span>Draft Room</span>
          </NavLink>
        </div>
      </div>

      {/* 2. Hero Matchup Card (Sleek, High Tactile Scoreboard) */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        {/* Subtle background ambient gradients */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center relative z-10">
          
          {/* Team Blue Card */}
          <div className="lg:col-span-4 bg-slate-950/70 border border-blue-500/20 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-4">
              <img 
                src={teamBlue.logo} 
                alt={teamBlue.name} 
                className="w-16 h-16 rounded-xl bg-slate-900 border border-blue-500/30 object-contain p-1.5 shadow-md"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold tracking-wider text-blue-400 block uppercase">BLUE SIDE</span>
                <h2 className="text-xl font-black text-white truncate">{teamBlue.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {teamBlue.shortCode}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Series: <strong className="text-white">{teamBlue.seriesScore}</strong></span>
                </div>
              </div>
            </div>

            {/* Blue Quick Tally */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">KILLS</span>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <button 
                    onClick={() => api.updateScoreboard({ blueKills: Math.max(0, teamBlue.kills - 1) })}
                    className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >-</button>
                  <span className="font-mono text-base font-extrabold text-blue-400">{teamBlue.kills}</span>
                  <button 
                    onClick={() => api.updateScoreboard({ blueKills: teamBlue.kills + 1 })}
                    className="w-5 h-5 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >+</button>
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">TOWERS</span>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <button 
                    onClick={() => api.updateScoreboard({ blueTowers: Math.max(0, teamBlue.towers - 1) })}
                    className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >-</button>
                  <span className="font-mono text-base font-extrabold text-white">{teamBlue.towers}</span>
                  <button 
                    onClick={() => api.updateScoreboard({ blueTowers: Math.min(9, teamBlue.towers + 1) })}
                    className="w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                  >+</button>
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">GOLD</span>
                <span className="font-mono text-base font-extrabold text-amber-400 block mt-0.5">
                  {formatGold(teamBlue.gold)}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Match Clock & Control */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center text-center space-y-4 px-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isClockRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {status === 'live' ? (isClockRunning ? 'MATCH IN PROGRESS' : 'MATCH PAUSED') : status.toUpperCase()}
              </span>
            </div>

            {/* Huge Monospace Timer */}
            <div className="font-mono text-4xl sm:text-5xl font-black text-amber-400 tracking-wider bg-slate-950/80 px-6 py-2.5 rounded-2xl border border-slate-800 shadow-inner">
              {formatTime(clockSeconds)}
            </div>

            {/* Clock Control Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => api.setClock(Math.max(0, clockSeconds - 30))}
                className="px-2.5 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                title="Subtract 30 seconds"
              >
                -30s
              </button>

              <button
                onClick={() => api.toggleClock()}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  isClockRunning 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                }`}
              >
                {isClockRunning ? <Pause size={14} /> : <Play size={14} />}
                <span>{isClockRunning ? 'Pause' : 'Resume'}</span>
              </button>

              <button
                onClick={() => api.setClock(clockSeconds + 30)}
                className="px-2.5 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                title="Add 30 seconds"
              >
                +30s
              </button>
            </div>
          </div>

          {/* Team Red Card */}
          <div className="lg:col-span-4 bg-slate-950/70 border border-rose-500/20 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0 text-right">
                <span className="text-[11px] font-bold tracking-wider text-rose-400 block uppercase">RED SIDE</span>
                <h2 className="text-xl font-black text-white truncate">{teamRed.name}</h2>
                <div className="flex items-center justify-end gap-2 mt-1">
                  <span className="text-xs text-slate-400 font-medium">Series: <strong className="text-white">{teamRed.seriesScore}</strong></span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    {teamRed.shortCode}
                  </span>
                </div>
              </div>
              <img 
                src={teamRed.logo} 
                alt={teamRed.name} 
                className="w-16 h-16 rounded-xl bg-slate-900 border border-rose-500/30 object-contain p-1.5 shadow-md"
              />
            </div>

            {/* Red Quick Tally */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">KILLS</span>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <button 
                    onClick={() => api.updateScoreboard({ redKills: Math.max(0, teamRed.kills - 1) })}
                    className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >-</button>
                  <span className="font-mono text-base font-extrabold text-rose-400">{teamRed.kills}</span>
                  <button 
                    onClick={() => api.updateScoreboard({ redKills: teamRed.kills + 1 })}
                    className="w-5 h-5 rounded bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >+</button>
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">TOWERS</span>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <button 
                    onClick={() => api.updateScoreboard({ redTowers: Math.max(0, teamRed.towers - 1) })}
                    className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >-</button>
                  <span className="font-mono text-base font-extrabold text-white">{teamRed.towers}</span>
                  <button 
                    onClick={() => api.updateScoreboard({ redTowers: Math.min(9, teamRed.towers + 1) })}
                    className="w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                  >+</button>
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">GOLD</span>
                <span className="font-mono text-base font-extrabold text-amber-400 block mt-0.5">
                  {formatGold(teamRed.gold)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. 1-Click Objective & Special Event Shortcuts */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">QUICK OBJECTIVE TRIGGERS</h3>
          </div>
          <button
            onClick={handleUndo}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <Undo2 size={13} />
            <span>Undo Last Action</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Blue Side Triggers */}
          <div className="bg-slate-950/60 border border-blue-500/20 p-3.5 rounded-xl space-y-2">
            <span className="text-xs font-bold text-blue-400 block">{teamBlue.shortCode} (Blue) Triggers</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleTriggerSpecial('blue', 'first_blood')}
                className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                + First Blood
              </button>
              <button
                onClick={() => handleTriggerSpecial('blue', isMlbb ? 'turtle_secured' : 'tyrant_secured')}
                className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                + {isMlbb ? 'Turtle' : 'Tyrant'}
              </button>
              <button
                onClick={() => handleTriggerSpecial('blue', isMlbb ? 'lord_secured' : 'overlord_secured')}
                className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                + {isMlbb ? 'Lord' : 'Overlord'}
              </button>
              <button
                onClick={() => handleTriggerSpecial('blue', 'wipeout')}
                className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                + Wipeout
              </button>
            </div>
          </div>

          {/* Red Side Triggers */}
          <div className="bg-slate-950/60 border border-rose-500/20 p-3.5 rounded-xl space-y-2">
            <span className="text-xs font-bold text-rose-400 block">{teamRed.shortCode} (Red) Triggers</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleTriggerSpecial('red', 'first_blood')}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                + First Blood
              </button>
              <button
                onClick={() => handleTriggerSpecial('red', isMlbb ? 'turtle_secured' : 'tyrant_secured')}
                className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                + {isMlbb ? 'Turtle' : 'Tyrant'}
              </button>
              <button
                onClick={() => handleTriggerSpecial('red', isMlbb ? 'lord_secured' : 'overlord_secured')}
                className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                + {isMlbb ? 'Lord' : 'Overlord'}
              </button>
              <button
                onClick={() => handleTriggerSpecial('red', 'wipeout')}
                className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                + Wipeout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. OBS Overlays Quick Hub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv size={18} className="text-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">OBS BROWSER SOURCE OVERLAYS</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Resolution: 1920 × 1080 @ 60 FPS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overlaysList.map(overlay => (
            <div 
              key={overlay.id}
              className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-slate-700 transition-all shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {overlay.title}
                  </span>
                  <button
                    onClick={() => handleToggleOverlay(overlay.toggleKey, overlay.isActive)}
                    className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                      overlay.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}
                    title={overlay.isActive ? 'Visible in broadcast' : 'Hidden'}
                  >
                    {overlay.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {overlay.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => handleCopy(overlay.id, overlay.path)}
                  className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedId === overlay.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedId === overlay.id ? 'Copied' : 'Copy Link'}</span>
                </button>

                <a
                  href={overlay.path}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                  title="Open in new browser tab"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Recent Activity Log */}
      {events && events.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Recent Match Events</span>
            <span className="text-[11px] text-slate-500 font-mono">{events.length} total events logged</span>
          </div>
          <div className="space-y-2">
            {events.slice(0, 4).map(evt => (
              <div 
                key={evt.id} 
                className="flex items-center justify-between bg-slate-950/60 border border-slate-800/60 px-3.5 py-2 rounded-xl text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${evt.team === 'blue' ? 'bg-blue-400' : 'bg-rose-400'}`} />
                  <span className="font-semibold text-slate-200">{evt.message || evt.headline || 'Match Action'}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">{formatTime(evt.gameTimeSeconds)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. PRE-MATCH SETUP MODAL (TEAM & PLAYER CONFIGURATION)        */}
      {/* ============================================================== */}
      {isSetupModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl p-6 shadow-2xl space-y-5 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Settings size={20} className="text-indigo-400" />
                <div>
                  <h2 className="text-base font-black text-white">PRE-MATCH SETUP & TEAMS</h2>
                  <p className="text-[11px] text-slate-400">Configure tournament details, match series, team names, and 5-player rosters</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSetupModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >✕</button>
            </div>

            {/* General Match Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Tournament Name</label>
                <input 
                  type="text"
                  value={setupTournament}
                  onChange={e => setSetupTournament(e.target.value)}
                  placeholder="e.g. MPL Season 14"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Match Title</label>
                <input 
                  type="text"
                  value={setupMatch}
                  onChange={e => setSetupMatch(e.target.value)}
                  placeholder="e.g. Grand Finals - Game 1"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Series Format</label>
                <select
                  value={setupFormat}
                  onChange={e => setSetupFormat(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="BO1">Best of 1 (BO1)</option>
                  <option value="BO3">Best of 3 (BO3)</option>
                  <option value="BO5">Best of 5 (BO5)</option>
                  <option value="BO7">Best of 7 (BO7)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Game Number</label>
                <input 
                  type="number"
                  min="1"
                  max="7"
                  value={setupGameNumber}
                  onChange={e => setSetupGameNumber(Number(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            {/* Swap Sides Center Pill */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleSwapSides}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
              >
                <ArrowLeftRight size={13} className="text-indigo-400" />
                <span>Swap Blue ⇄ Red Sides</span>
              </button>
            </div>

            {/* Dual Team Configuration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Blue Team Setup */}
              <div className="bg-slate-950/80 border border-blue-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">BLUE TEAM</span>
                  {availableTeams.length > 0 && (
                    <select
                      onChange={e => e.target.value && handleSelectPresetTeam(e.target.value, 'blue')}
                      defaultValue=""
                      className="text-[11px] bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
                    >
                      <option value="">Choose saved team...</option>
                      {availableTeams.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.shortCode})</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Team Name</label>
                    <input 
                      type="text"
                      value={blueName}
                      onChange={e => setBlueName(e.target.value)}
                      placeholder="e.g. Fnatic ONIC"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Short Code</label>
                    <input 
                      type="text"
                      value={blueCode}
                      onChange={e => setBlueCode(e.target.value.toUpperCase())}
                      placeholder="e.g. FNOC"
                      maxLength={6}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-blue-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* 5 Player In-Game Names */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">Starting 5 Players (IGN)</label>
                  <div className="space-y-1.5">
                    {bluePlayers.map((player, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-12 text-[10px] font-mono font-bold px-1.5 py-1 rounded bg-slate-900 text-blue-400 border border-slate-800 text-center">
                          {player.role || `P${idx+1}`}
                        </span>
                        <input 
                          type="text"
                          value={player.inGameName}
                          onChange={e => {
                            const updated = [...bluePlayers];
                            updated[idx].inGameName = e.target.value;
                            setBluePlayers(updated);
                          }}
                          placeholder={`Player ${idx + 1} IGN`}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Red Team Setup */}
              <div className="bg-slate-950/80 border border-rose-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">RED TEAM</span>
                  {availableTeams.length > 0 && (
                    <select
                      onChange={e => e.target.value && handleSelectPresetTeam(e.target.value, 'red')}
                      defaultValue=""
                      className="text-[11px] bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
                    >
                      <option value="">Choose saved team...</option>
                      {availableTeams.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.shortCode})</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Team Name</label>
                    <input 
                      type="text"
                      value={redName}
                      onChange={e => setRedName(e.target.value)}
                      placeholder="e.g. AP.Bren"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Short Code</label>
                    <input 
                      type="text"
                      value={redCode}
                      onChange={e => setRedCode(e.target.value.toUpperCase())}
                      placeholder="e.g. APBR"
                      maxLength={6}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 font-mono font-bold focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* 5 Player In-Game Names */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">Starting 5 Players (IGN)</label>
                  <div className="space-y-1.5">
                    {redPlayers.map((player, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-12 text-[10px] font-mono font-bold px-1.5 py-1 rounded bg-slate-900 text-rose-400 border border-slate-800 text-center">
                          {player.role || `P${idx+1}`}
                        </span>
                        <input 
                          type="text"
                          value={player.inGameName}
                          onChange={e => {
                            const updated = [...redPlayers];
                            updated[idx].inGameName = e.target.value;
                            setRedPlayers(updated);
                          }}
                          placeholder={`Player ${idx + 1} IGN`}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSetupModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSetup}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95 transition-all"
              >
                Apply to Broadcast
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
