import { useState } from 'react';
import type { MatchLiveState } from '../../../shared/types';
import { api } from '../services/api';
export function MvpControls({ state }: {
    state: MatchLiveState;
}) {
    const [side, setSide] = useState<'blue' | 'red'>('blue');
    const [slot, setSlot] = useState(0);
    const [kda, setKda] = useState('');
    const [gold, setGold] = useState('');
    const [damage, setDamage] = useState('');
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState('');
    const team = side === 'blue' ? state.teamBlue : state.teamRed;
    const pick = team.picks[slot];
    async function publish() { if (!pick?.heroId || !pick.heroAvatar || !pick.playerName || !kda.trim())
        return; try {
        await api.updateOverlayControls({ showMvp: true, mvpPresentation: {nonce:crypto.randomUUID(),requestedAt:Date.now()}, mvpData: { team, player: { id: pick.playerId || String(slot), teamId: team.teamId, name: pick.playerName, inGameName: pick.playerName, role: pick.role || '' }, hero: { id: pick.heroId, name: pick.heroName || '', avatar: pick.heroAvatar, game: state.game, primaryRole: pick.role || '' }, kda, goldShare: gold || '—', damageShare: damage || '—', notes } });
        setMessage('MVP is on air');
    }
    catch (e) {
        setMessage(String(e));
    } }
    return <section className="glass-panel p-5 rounded space-y-3"><h2 className="text-xl">Match MVP</h2><div className="flex flex-wrap gap-4"><label>Team<select className="block bg-black p-2" value={side} onChange={e => setSide(e.target.value as 'blue' | 'red')}><option value="blue">{state.teamBlue.name}</option><option value="red">{state.teamRed.name}</option></select></label><label>Player<select className="block bg-black p-2" value={slot} onChange={e => setSlot(Number(e.target.value))}>{team.picks.map((p, i) => <option value={i} key={i}>{p.playerName || `Slot ${i + 1}`} · {p.heroName || 'No hero'}</option>)}</select></label>{[{ label: 'K / D / A', value: kda, set: setKda }, { label: 'Gold share', value: gold, set: setGold }, { label: 'Damage share', value: damage, set: setDamage }, { label: 'Notes', value: notes, set: setNotes }].map(f => <label key={f.label}>{f.label}<input className="block bg-black p-2" value={f.value} onChange={e => f.set(e.target.value)}/></label>)}</div><button className="border px-4 py-2 rounded disabled:opacity-40" disabled={!pick?.heroId || !pick.playerName || !kda.trim()} onClick={publish}>Take MVP on air</button><span role="status" className="ml-4">{message}</span></section>;
}
