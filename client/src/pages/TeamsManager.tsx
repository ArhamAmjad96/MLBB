import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Edit2, Trash2, Shield, User, Trophy, Sparkles } from 'lucide-react';
import { Team, GameType, MatchLiveState } from '../../../shared/types';
import { api } from '../services/api';

interface TeamsManagerProps {
  state: MatchLiveState | null;
}

export const TeamsManager: React.FC<TeamsManagerProps> = ({ state }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameType>(state?.game || 'mlbb');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formShortCode, setFormShortCode] = useState('');
  const [formGame, setFormGame] = useState<GameType>('mlbb');
  const [formLogo, setFormLogo] = useState('');
  const [formPlayers, setFormPlayers] = useState<{ inGameName: string; name: string; role: string }[]>([
    { inGameName: '', name: '', role: 'EXP' },
    { inGameName: '', name: '', role: 'JUNGLE' },
    { inGameName: '', name: '', role: 'MID' },
    { inGameName: '', name: '', role: 'GOLD' },
    { inGameName: '', role: 'ROAM', name: '' }
  ]);

  const loadTeams = () => {
    api.getTeams(selectedGame).then(setTeams);
  };

  useEffect(() => {
    loadTeams();
  }, [selectedGame]);

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingTeamId(null);
    setFormName('');
    setFormShortCode('');
    setFormGame(selectedGame);
    setFormLogo('');
    const defaultRoles = selectedGame === 'mlbb' 
      ? ['EXP', 'JUNGLE', 'MID', 'GOLD', 'ROAM']
      : ['CLASH', 'JUNGLE', 'MID', 'FARM', 'ROAM'];

    setFormPlayers(defaultRoles.map(r => ({ inGameName: '', name: '', role: r })));
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (team: Team) => {
    setEditingTeamId(team.id);
    setFormName(team.name);
    setFormShortCode(team.shortCode);
    setFormGame(team.game);
    setFormLogo(team.logo || '');
    
    const defaultRoles = team.game === 'mlbb' 
      ? ['EXP', 'JUNGLE', 'MID', 'GOLD', 'ROAM']
      : ['CLASH', 'JUNGLE', 'MID', 'FARM', 'ROAM'];

    if (team.players && team.players.length > 0) {
      setFormPlayers(team.players.slice(0, 5).map((p, i) => ({
        inGameName: p.inGameName,
        name: p.name || '',
        role: p.role || defaultRoles[i] || 'FLEX'
      })));
    } else {
      setFormPlayers(defaultRoles.map(r => ({ inGameName: '', name: '', role: r })));
    }
    setIsModalOpen(true);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formShortCode.trim()) {
      showNotification('Please fill in team name and short code');
      return;
    }

    try {
      await api.saveTeam({
        id: editingTeamId || undefined,
        name: formName.trim(),
        shortCode: formShortCode.trim().toUpperCase(),
        game: formGame,
        logo: formLogo.trim() || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(formShortCode.trim())}`,
        players: formPlayers.map((p, i) => ({
          inGameName: p.inGameName.trim() || `Player ${i + 1}`,
          name: p.name.trim() || '',
          role: p.role
        }))
      });

      showNotification(`Saved team ${formName} successfully!`);
      setIsModalOpen(false);
      loadTeams();
    } catch (err: any) {
      showNotification('Failed to save team');
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${teamName}?`)) return;
    try {
      await api.deleteTeam(teamId);
      showNotification(`Deleted ${teamName}`);
      loadTeams();
    } catch (err: any) {
      showNotification('Failed to delete team');
    }
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6 select-none font-sans">
      
      {/* Toast Notification */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-pop-in">
          <Sparkles size={16} className="text-indigo-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <Users size={26} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              TEAMS & ROSTER REGISTRY
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Create and manage esports teams, short codes, and 5-player in-game names for overlays.
            </p>
          </div>
        </div>

        {/* Right Actions: Filter & Add Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedGame('mlbb')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedGame === 'mlbb' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              MLBB Teams
            </button>
            <button
              onClick={() => setSelectedGame('hok')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedGame === 'hok' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              HOK Teams
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Add New Team</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text"
          placeholder="Filter teams by name or code..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500 font-medium"
        />
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTeams.map(team => (
          <div 
            key={team.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4 relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={team.logo} 
                    alt={team.name} 
                    className="w-14 h-14 rounded-xl bg-slate-950 p-1 border border-slate-800 object-contain shadow-md" 
                  />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      {team.game.toUpperCase()} FRANCHISE
                    </span>
                    <h2 className="text-xl font-black text-white">{team.name}</h2>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 mt-1 inline-block border border-slate-700">
                      [{team.shortCode}]
                    </span>
                  </div>
                </div>

                {/* Edit / Delete Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(team)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    title="Edit team & players"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id, team.name)}
                    className="p-2 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    title="Delete team"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Roster list */}
              <div className="mt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Starting 5 Roster ({team.players?.length || 0} players)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {team.players?.map(player => (
                    <div 
                      key={player.id}
                      className="flex items-center gap-3 p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl"
                    >
                      <img 
                        src={player.photo || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pro'} 
                        alt={player.inGameName} 
                        className="w-9 h-9 rounded-lg bg-slate-900 object-cover border border-slate-800" 
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-xs text-white truncate">
                          {player.inGameName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {player.name ? `${player.name} • ` : ''}<span className="text-amber-400 font-bold">{player.role}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================== */}
      {/* TEAM CREATION / EDITING MODAL                                  */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-5 my-8">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Users size={18} className="text-indigo-400" />
                <span>{editingTeamId ? 'EDIT TEAM & PLAYERS' : 'ADD NEW ESPORTS TEAM'}</span>
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >✕</button>
            </div>

            <form onSubmit={handleSaveTeam} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Team Name</label>
                  <input 
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Blacklist International"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Short Code</label>
                  <input 
                    type="text"
                    required
                    maxLength={6}
                    value={formShortCode}
                    onChange={e => setFormShortCode(e.target.value.toUpperCase())}
                    placeholder="e.g. BLCK"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Game</label>
                  <select
                    value={formGame}
                    onChange={e => setFormGame(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="mlbb">Mobile Legends: Bang Bang (MLBB)</option>
                    <option value="hok">Honor of Kings (HOK)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Logo URL (Optional)</label>
                  <input 
                    type="url"
                    value={formLogo}
                    onChange={e => setFormLogo(e.target.value)}
                    placeholder="Leave empty for auto-generated avatar"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 5 Starting Players */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                  Starting 5 Players (IGN & Role)
                </span>
                
                <div className="space-y-2">
                  {formPlayers.map((player, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">
                        <select
                          value={player.role}
                          onChange={e => {
                            const updated = [...formPlayers];
                            updated[idx].role = e.target.value;
                            setFormPlayers(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-amber-400 font-bold focus:outline-none"
                        >
                          {formGame === 'mlbb' ? (
                            <>
                              <option value="EXP">EXP Lane</option>
                              <option value="JUNGLE">Jungle</option>
                              <option value="MID">Mid Lane</option>
                              <option value="GOLD">Gold Lane</option>
                              <option value="ROAM">Roamer</option>
                            </>
                          ) : (
                            <>
                              <option value="CLASH">Clash Lane</option>
                              <option value="JUNGLE">Jungle</option>
                              <option value="MID">Mid Lane</option>
                              <option value="FARM">Farm Lane</option>
                              <option value="ROAM">Roamer</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="col-span-5">
                        <input 
                          type="text"
                          required
                          value={player.inGameName}
                          onChange={e => {
                            const updated = [...formPlayers];
                            updated[idx].inGameName = e.target.value;
                            setFormPlayers(updated);
                          }}
                          placeholder={`Player ${idx + 1} IGN (e.g. OhMyV33NUS)`}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="col-span-4">
                        <input 
                          type="text"
                          value={player.name}
                          onChange={e => {
                            const updated = [...formPlayers];
                            updated[idx].name = e.target.value;
                            setFormPlayers(updated);
                          }}
                          placeholder="Real Name (Optional)"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95 transition-all"
                >
                  Save Team & Players
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default TeamsManager;
