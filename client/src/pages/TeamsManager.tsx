import React, { useState, useEffect } from 'react';
import { Users, Shield, User, Trophy, Search } from 'lucide-react';
import { Team, GameType, MatchLiveState } from '../../../shared/types';
import { api } from '../services/api';

interface TeamsManagerProps {
  state: MatchLiveState | null;
}

export const TeamsManager: React.FC<TeamsManagerProps> = ({ state }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameType>(state?.game || 'mlbb');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.getTeams(selectedGame).then(setTeams);
  }, [selectedGame]);

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1700px] mx-auto p-4 space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              TEAMS & ROSTER REGISTRY
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Manage esports teams, player in-game names, designated roles, and avatar photography.
            </p>
          </div>
        </div>

        {/* Filter by Game */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedGame('mlbb')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedGame === 'mlbb' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            MLBB Teams
          </button>
          <button
            onClick={() => setSelectedGame('hok')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedGame === 'hok' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            HOK Teams
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTeams.map(team => (
          <div 
            key={team.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <img 
                  src={team.logo} 
                  alt={team.name} 
                  className="w-14 h-14 rounded-xl bg-slate-950 p-1 border border-slate-700 object-contain shadow-md" 
                />
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    {team.game.toUpperCase()} FRANCHISE
                  </span>
                  <h2 className="text-2xl font-black text-white">{team.name}</h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    [{team.shortCode}]
                  </span>
                </div>
              </div>
            </div>

            {/* Roster list */}
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold block mb-3">
                Starting 5 Roster
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {team.players.map(player => (
                  <div 
                    key={player.id}
                    className="flex items-center gap-3 p-2 bg-slate-950/70 border border-slate-800/80 rounded-xl"
                  >
                    <img 
                      src={player.photo || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pro'} 
                      alt={player.inGameName} 
                      className="w-9 h-9 rounded-lg bg-slate-800 object-cover" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-sm text-white truncate">
                        {player.inGameName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {player.name} • <span className="text-amber-400 font-bold">{player.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
