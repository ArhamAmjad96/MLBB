import { GameType, HeroDefinition, MatchLiveState, MatchLifecycleStatus, SpecialEventType } from '../../../shared/types';

const API_BASE = '/api';

export const api = {
  async getState(): Promise<MatchLiveState> {
    const res = await fetch(`${API_BASE}/state`);
    return res.json();
  },

  async switchGame(game: GameType, force: boolean = false): Promise<{ success: boolean; state?: MatchLiveState; error?: string }> {
    const res = await fetch(`${API_BASE}/game/switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game, force })
    });
    return res.json();
  },

  async setLifecycle(status: MatchLifecycleStatus): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`${API_BASE}/match/lifecycle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async setMatchTeams(blueTeamId: string, redTeamId: string): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`${API_BASE}/match/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blueTeamId, redTeamId })
    });
    return res.json();
  },

  async endGame(winner: 'blue' | 'red'): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/match/end-game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winner })
    });
    return res.json();
  },

  async prepareNextGame(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/match/next-game`, { method: 'POST' });
    return res.json();
  },

  async toggleClock(): Promise<{ success: boolean; isRunning: boolean }> {
    const res = await fetch(`${API_BASE}/clock/toggle`, { method: 'POST' });
    return res.json();
  },

  async setClock(seconds: number): Promise<{ success: boolean; clockSeconds: number }> {
    const res = await fetch(`${API_BASE}/clock/set`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seconds })
    });
    return res.json();
  },

  async setMatchLifecycle(status: MatchLifecycleStatus): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`${API_BASE}/match/lifecycle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async updateScoreboard(updates: {
    blueScore?: number;
    redScore?: number;
    blueKills?: number;
    redKills?: number;
    blueGold?: number;
    redGold?: number;
    blueTowers?: number;
    redTowers?: number;
  }): Promise<void> {
    await fetch(`${API_BASE}/scoreboard/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  },

  async registerKill(data: {
    team: 'blue' | 'red';
    killerHero?: HeroDefinition;
    victimHero?: HeroDefinition;
    multikill?: string;
  }): Promise<{ success: boolean; duplicate?: boolean }> {
    const res = await fetch(`${API_BASE}/events/kill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async registerSlotKill(data: {
    team: 'blue' | 'red';
    killerSlotIndex: number;
    victimSlotIndex?: number;
    multikill?: string;
  }): Promise<{ success: boolean; duplicate?: boolean }> {
    const res = await fetch(`${API_BASE}/events/slot-kill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async registerObjective(data: {
    team: 'blue' | 'red';
    objectiveId: string;
    objectiveName: string;
    objectiveIcon: string;
  }): Promise<{ success: boolean; duplicate?: boolean }> {
    const res = await fetch(`${API_BASE}/events/objective`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async registerTower(team: 'blue' | 'red'): Promise<{ success: boolean; duplicate?: boolean }> {
    const res = await fetch(`${API_BASE}/events/tower`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team })
    });
    return res.json();
  },

  async registerSpecialEvent(data: {
    team: 'blue' | 'red';
    specialType: SpecialEventType;
    killerHero?: HeroDefinition;
    victimHero?: HeroDefinition;
    isSteal?: boolean;
    headline?: string;
    subline?: string;
  }): Promise<{ success: boolean; duplicate?: boolean }> {
    const res = await fetch(`${API_BASE}/events/special`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async undoLastEvent(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/events/undo`, { method: 'POST' });
    return res.json();
  },

  async recordDraftPickBan(data: {
    hero: HeroDefinition;
    playerId?: string;
    playerName?: string;
    role?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`${API_BASE}/draft/pick-ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async undoDraft(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/draft/undo`, { method: 'POST' });
    return res.json();
  },

  async toggleDraftTimer(): Promise<{ success: boolean; isTimerRunning: boolean }> {
    const res = await fetch(`${API_BASE}/draft/timer/toggle`, { method: 'POST' });
    return res.json();
  },

  async setDraftPhase(phaseIndex: number): Promise<void> {
    await fetch(`${API_BASE}/draft/phase/set`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phaseIndex })
    });
  },

  async setPreviewOverlay(overlayId: string): Promise<void> {
    await fetch(`${API_BASE}/overlay/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overlayId })
    });
  },

  async takeOverlay(): Promise<void> {
    await fetch(`${API_BASE}/overlay/take`, { method: 'POST' });
  },

  async blackoutOverlays(): Promise<void> {
    await fetch(`${API_BASE}/overlay/blackout`, { method: 'POST' });
  },

  async updateOverlayControls(controls: Partial<MatchLiveState['overlayControls']>): Promise<void> {
    await fetch(`${API_BASE}/overlay/controls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(controls)
    });
  },

  async getHeroes(game: GameType): Promise<HeroDefinition[]> {
    const res = await fetch(`${API_BASE}/heroes/${game}`);
    return res.json();
  },

  async getObjectives(game: GameType): Promise<any[]> {
    const res = await fetch(`${API_BASE}/objectives/${game}`);
    return res.json();
  },

  async getTournaments(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/tournaments`);
    return res.json();
  },

  async getTeams(game?: GameType): Promise<any[]> {
    const url = game ? `${API_BASE}/teams?game=${game}` : `${API_BASE}/teams`;
    const res = await fetch(url);
    return res.json();
  }
};
