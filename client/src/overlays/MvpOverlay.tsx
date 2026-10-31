import React from 'react';
import { useMatchState } from '../hooks/useMatchState';

export const MvpOverlay: React.FC = () => {
  const { state } = useMatchState();

  if (!state || !state.overlayControls.showMvp) {
    return <div className="overlay-canvas bg-transparent" />;
  }

  // Default to MVP data or pick first hero from winning team
  const mvp = state.overlayControls.mvpData || {
    player: {
      id: 'p_default',
      name: 'Kairi Ygnacio',
      inGameName: 'Kairi',
      role: 'JUNGLE',
      teamId: state.teamBlue.teamId,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kairi'
    },
    team: state.teamBlue,
    hero: {
      id: 'mlbb_fanny',
      name: 'Fanny',
      game: state.game,
      primaryRole: 'JUNGLE',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Fanny'
    },
    kda: '9 / 1 / 11 (20.0)',
    goldShare: '28.4%',
    damageShare: '34.2%',
    notes: 'Flawless objective control and decisive teamfight initiation'
  };

  return (
    <div className="overlay-canvas bg-black/60 backdrop-blur-md flex items-center justify-center select-none p-12">
      
      {/* MVP Card */}
      <div className="relative w-[1100px] h-[600px] rounded-3xl overflow-hidden border-2 border-amber-400/60 bg-gradient-to-tr from-[#0b0e17] via-[#141b2d] to-[#1c1208] shadow-[0_0_80px_rgba(245,158,11,0.3)] flex">
        
        {/* Left Side: Massive Player & Hero Visuals */}
        <div className="w-[45%] relative overflow-hidden bg-gradient-to-b from-amber-500/10 to-transparent flex items-center justify-center p-8">
          <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
            <span className="px-3 py-1 bg-amber-500 text-black font-black font-mono text-xs rounded uppercase tracking-wider">
              MATCH MVP
            </span>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
              {state.matchName}
            </span>
          </div>

          <div className="relative flex flex-col items-center">
            <div className="w-64 h-64 rounded-full border-4 border-amber-400/80 overflow-hidden shadow-2xl bg-slate-900 mb-4">
              <img src={mvp.player.photo} alt={mvp.player.inGameName} className="w-full h-full object-cover" />
            </div>

            <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-1.5 rounded-xl border border-white/10">
              <img src={mvp.hero.avatar} alt={mvp.hero.name} className="w-7 h-7 rounded-lg" />
              <span className="font-bold text-sm text-slate-200">{mvp.hero.name}</span>
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">({mvp.hero.primaryRole})</span>
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Stats & Breakdown */}
        <div className="w-[55%] p-10 flex flex-col justify-between border-l border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img src={mvp.team.logo} alt="" className="w-9 h-9 rounded-lg bg-slate-900 p-1 border border-white/10" />
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                {mvp.team.name} [{mvp.team.shortCode}]
              </span>
            </div>

            <h1 className="text-5xl font-black text-white uppercase tracking-tight mb-1">
              {mvp.player.inGameName}
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              {mvp.player.name} • {mvp.player.role}
            </p>
          </div>

          {/* Core Stat Boxes */}
          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">K / D / A</span>
              <span className="text-2xl font-mono font-black text-amber-400">{mvp.kda}</span>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gold Share</span>
              <span className="text-2xl font-mono font-black text-yellow-400">{mvp.goldShare}</span>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Damage Share</span>
              <span className="text-2xl font-mono font-black text-rose-400">{mvp.damageShare}</span>
            </div>
          </div>

          {/* Performance Note */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
              HIGHLIGHT ANALYSIS
            </span>
            <p className="text-xs text-slate-300 font-medium italic">
              "{mvp.notes}"
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-white/10">
            <span>MARK47 ESPORTS BROADCAST ENGINE</span>
            <span>{state.game.toUpperCase()} PRODUCTION</span>
          </div>
        </div>

      </div>

    </div>
  );
};
