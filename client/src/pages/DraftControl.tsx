import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Undo2, 
  Search, 
  Check, 
  Swords,
  Sparkles
} from 'lucide-react';
import { MatchLiveState, HeroDefinition, DraftPhase } from '../../../shared/types';
import { api } from '../services/api';

interface DraftControlProps {
  state: MatchLiveState | null;
}

export const DraftControl: React.FC<DraftControlProps> = ({ state }) => {
  const [heroes, setHeroes] = useState<HeroDefinition[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedHero, setSelectedHero] = useState<HeroDefinition | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (state?.game) {
      api.getHeroes(state.game).then(setHeroes);
    }
  }, [state?.game]);

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading draft state...</span>
      </div>
    );
  }

  const { draft, teamBlue, teamRed, game } = state;
  const activePhase: DraftPhase | undefined = draft.phases[draft.activePhaseIndex];
  const isMlbb = game === 'mlbb';

  // Compute heroes already locked or banned across both teams
  const bluePickedHeroIds = new Set(teamBlue.picks.map(p => p.heroId).filter(Boolean));
  const redPickedHeroIds = new Set(teamRed.picks.map(p => p.heroId).filter(Boolean));
  const blueBannedHeroIds = new Set(teamBlue.bans.map(b => b.heroId).filter(Boolean));
  const redBannedHeroIds = new Set(teamRed.bans.map(b => b.heroId).filter(Boolean));

  const getHeroStatus = (heroId: string) => {
    if (bluePickedHeroIds.has(heroId)) return { type: 'picked', team: 'blue', label: 'PICKED' };
    if (redPickedHeroIds.has(heroId)) return { type: 'picked', team: 'red', label: 'PICKED' };
    if (blueBannedHeroIds.has(heroId)) return { type: 'banned', team: 'blue', label: 'BANNED' };
    if (redBannedHeroIds.has(heroId)) return { type: 'banned', team: 'red', label: 'BANNED' };
    return null;
  };

  const roles = isMlbb 
    ? ['ALL', 'EXP', 'MID', 'GOLD', 'ROAM', 'JUNGLE'] 
    : ['ALL', 'CLASH', 'MID', 'FARM', 'ROAM', 'JUNGLE'];

  const filteredHeroes = heroes.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || h.primaryRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleTimer = () => api.toggleDraftTimer();
  const handleUndoDraft = () => {
    setErrorMessage(null);
    api.undoDraft();
  };

  const handleConfirmPickBan = async () => {
    if (!selectedHero || !activePhase) return;
    setErrorMessage(null);
    try {
      await api.recordDraftPickBan({
        hero: selectedHero,
        role: selectedHero.primaryRole
      });
      setSelectedHero(null);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.error || err?.message || 'Failed to lock in hero');
    }
  };

  const handleJumpToPhase = (index: number) => {
    api.setDraftPhase(index);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6 select-none font-sans">
      
      {/* 1. Header Banner & Countdown Timer */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <Swords size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-wide">
                DRAFT PICK & BAN ROOM
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {game.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Phase {draft.activePhaseIndex + 1} of {draft.phases.length} • {activePhase ? activePhase.label : 'Draft Completed'}
            </p>
          </div>
        </div>

        {/* Center Countdown Clock */}
        <div className="flex items-center gap-4 bg-slate-950 px-5 py-2 rounded-2xl border border-slate-800 shadow-inner">
          <span className="text-[10px] uppercase font-bold text-slate-400">PHASE TIMER</span>
          <span className={`font-mono text-3xl font-black min-w-[55px] text-center ${
            draft.timerRemaining <= 10 ? 'text-rose-500 animate-pulse' : 'text-amber-400'
          }`}>
            {draft.timerRemaining}s
          </span>

          <button
            onClick={handleToggleTimer}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              draft.isTimerRunning 
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {draft.isTimerRunning ? <Pause size={13} /> : <Play size={13} />}
            <span>{draft.isTimerRunning ? 'PAUSE' : 'START'}</span>
          </button>

          <button
            onClick={handleUndoDraft}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer active:scale-95 transition-all"
          >
            <Undo2 size={13} />
            <span>UNDO</span>
          </button>
        </div>

        {/* Active Phase Pill */}
        {activePhase && (
          <div className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase flex items-center gap-2 shadow-sm ${
            activePhase.team === 'blue' 
              ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' 
              : 'bg-rose-600/10 border-rose-500/30 text-rose-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${activePhase.team === 'blue' ? 'bg-blue-400' : 'bg-rose-400'} animate-pulse`} />
            <span>Turn: {activePhase.team === 'blue' ? teamBlue.name : teamRed.name}</span>
            <span className="bg-slate-950 px-2 py-0.5 rounded font-mono border border-slate-800">
              {activePhase.type.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* 2. Visual Phase Timeline Bar */}
      <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {draft.phases.map((ph, idx) => {
            const isCurrent = idx === draft.activePhaseIndex;
            const isPast = idx < draft.activePhaseIndex;
            const isBlue = ph.team === 'blue';

            return (
              <button
                key={ph.id}
                onClick={() => handleJumpToPhase(idx)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all border cursor-pointer ${
                  isCurrent 
                    ? isBlue 
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30 scale-105' 
                      : 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30 scale-105'
                    : isPast 
                      ? 'bg-slate-950 text-slate-400 border-slate-800' 
                      : 'bg-slate-900/50 text-slate-600 border-slate-800/40'
                }`}
              >
                <span className="block text-[8px] uppercase tracking-wider">{ph.type}</span>
                {ph.team === 'blue' ? 'B' : 'R'}{ph.slotIndex + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Draft Stage: Blue Picks/Bans, Hero Selector, Red Picks/Bans */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Blue Team Board (3 cols) */}
        <div className="xl:col-span-3 bg-slate-900/80 border border-blue-500/30 rounded-2xl p-5 space-y-4 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <img src={teamBlue.logo} alt="" className="w-10 h-10 rounded-xl bg-slate-950 p-1 border border-blue-500/20 object-contain shadow-sm" />
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">BLUE SIDE</span>
              <h3 className="font-extrabold text-white text-base truncate">{teamBlue.name}</h3>
            </div>
          </div>

          {/* Blue Bans */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Bans ({teamBlue.bans.filter(b => b.heroId).length}/{teamBlue.bans.length})
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {teamBlue.bans.map((ban, i) => (
                <div 
                  key={i} 
                  className="aspect-square bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden relative"
                >
                  {ban.heroAvatar ? (
                    <>
                      <img 
                        src={ban.heroAvatar} 
                        alt="" 
                        className="w-full h-full object-cover filter grayscale contrast-125"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${ban.heroName || 'ban'}`;
                        }}
                      />
                      <div className="absolute inset-0 bg-rose-950/60 flex items-center justify-center font-bold text-rose-400 text-xs">
                        ✕
                      </div>
                    </>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-600 font-bold">B{i+1}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Blue Picks */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Picks (5 Roster Slots)
            </span>
            {teamBlue.picks.map((pick, i) => (
              <div 
                key={i}
                className="flex items-center gap-3 p-2 bg-slate-950/80 border border-slate-800/80 rounded-xl"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-900 overflow-hidden border border-slate-700 flex-shrink-0 flex items-center justify-center">
                  {pick.heroAvatar ? (
                    <img 
                      src={pick.heroAvatar} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${pick.heroName || 'pick'}`;
                      }}
                    />
                  ) : (
                    <span className="text-xs font-mono font-bold text-slate-600">P{i+1}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-white truncate">
                    {pick.heroName || <span className="text-slate-500 italic">Undrafted</span>}
                  </div>
                  <div className="text-[10px] text-blue-400 font-mono">
                    {pick.role || `Slot ${i+1}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Hero Browser & Submission Desk (6 cols) */}
        <div className="xl:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* Search & Role Filter Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search heroes..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium placeholder-slate-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {roles.map(r => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      roleFilter === r ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message Toast */}
            {errorMessage && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-semibold flex items-center justify-between">
                <span>⚠️ {errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white text-xs font-bold">Dismiss</button>
              </div>
            )}

            {/* Hero Selection Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2.5 max-h-[380px] overflow-y-auto p-1.5 bg-slate-950/60 rounded-xl border border-slate-800">
              {filteredHeroes.map(hero => {
                const isSelected = selectedHero?.id === hero.id;
                const status = getHeroStatus(hero.id);
                const isTaken = status !== null;

                return (
                  <button
                    key={hero.id}
                    onClick={() => !isTaken && setSelectedHero(hero)}
                    disabled={isTaken}
                    className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center gap-1 group relative cursor-pointer ${
                      isTaken
                        ? 'bg-slate-950/40 border-slate-800/40 opacity-40 cursor-not-allowed filter grayscale'
                        : isSelected 
                          ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20 scale-105' 
                          : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <img 
                      src={hero.avatar} 
                      alt={hero.name} 
                      className="w-11 h-11 rounded-lg bg-slate-800 object-cover shadow-sm"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = (hero as any).fallbackAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${hero.name}`;
                      }}
                    />
                    <span className="text-[11px] font-bold text-white truncate max-w-full">
                      {hero.name}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">
                      {hero.primaryRole}
                    </span>

                    {isTaken && (
                      <div className={`absolute inset-x-1 bottom-1 text-[8px] font-mono font-black py-0.5 rounded uppercase tracking-wider ${
                        status.type === 'banned' ? 'bg-rose-950/90 text-rose-400 border border-rose-500/40' : 'bg-slate-900/90 text-amber-300 border border-amber-500/40'
                      }`}>
                        {status.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Submission Footer */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4 mt-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Selected Hero</span>
              <span className="text-base font-black text-amber-400">
                {selectedHero ? selectedHero.name : 'Choose a hero from the grid above'}
              </span>
            </div>

            <button
              onClick={handleConfirmPickBan}
              disabled={!selectedHero || !activePhase}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                selectedHero && activePhase
                  ? activePhase.type === 'ban' 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 cursor-pointer active:scale-95' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Check size={16} />
              <span>{activePhase ? `CONFIRM ${activePhase.type.toUpperCase()}` : 'DRAFT DONE'}</span>
            </button>
          </div>

        </div>

        {/* Red Team Board (3 cols) */}
        <div className="xl:col-span-3 bg-slate-900/80 border border-rose-500/30 rounded-2xl p-5 space-y-4 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <img src={teamRed.logo} alt="" className="w-10 h-10 rounded-xl bg-slate-950 p-1 border border-rose-500/20 object-contain shadow-sm" />
            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">RED SIDE</span>
              <h3 className="font-extrabold text-white text-base truncate">{teamRed.name}</h3>
            </div>
          </div>

          {/* Red Bans */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Bans ({teamRed.bans.filter(b => b.heroId).length}/{teamRed.bans.length})
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {teamRed.bans.map((ban, i) => (
                <div 
                  key={i} 
                  className="aspect-square bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden relative"
                >
                  {ban.heroAvatar ? (
                    <>
                      <img 
                        src={ban.heroAvatar} 
                        alt="" 
                        className="w-full h-full object-cover filter grayscale contrast-125"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${ban.heroName || 'ban'}`;
                        }}
                      />
                      <div className="absolute inset-0 bg-rose-950/60 flex items-center justify-center font-bold text-rose-400 text-xs">
                        ✕
                      </div>
                    </>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-600 font-bold">B{i+1}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Red Picks */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Picks (5 Roster Slots)
            </span>
            {teamRed.picks.map((pick, i) => (
              <div 
                key={i}
                className="flex items-center gap-3 p-2 bg-slate-950/80 border border-slate-800/80 rounded-xl"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-900 overflow-hidden border border-slate-700 flex-shrink-0 flex items-center justify-center">
                  {pick.heroAvatar ? (
                    <img 
                      src={pick.heroAvatar} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${pick.heroName || 'pick'}`;
                      }}
                    />
                  ) : (
                    <span className="text-xs font-mono font-bold text-slate-600">P{i+1}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-white truncate">
                    {pick.heroName || <span className="text-slate-500 italic">Undrafted</span>}
                  </div>
                  <div className="text-[10px] text-rose-400 font-mono">
                    {pick.role || `Slot ${i+1}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DraftControl;
