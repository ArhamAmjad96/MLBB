export type GameType = 'mlbb' | 'hok';

export type RoleMLBB = 'EXP' | 'MID' | 'GOLD' | 'ROAM' | 'JUNGLE';
export type RoleHOK = 'CLASH' | 'MID' | 'FARM' | 'ROAM' | 'JUNGLE';

export interface HeroDefinition {
  id: string;
  name: string;
  game: GameType;
  primaryRole: string;
  avatar: string;
  fallbackAvatar?: string;
}

export interface ObjectiveDefinition {
  id: string;
  name: string;
  game: GameType;
  icon: string;
  tier?: string;
  description?: string;
}

export interface DraftPhase {
  id: string;
  phaseNumber: number;
  type: 'ban' | 'pick';
  team: 'blue' | 'red';
  timeSeconds: number;
  slotIndex: number; // 0 to 4 for picks, 0 to 4 for bans
  label: string;
}

export interface DraftRuleConfig {
  game: GameType;
  name: string;
  totalBansPerTeam: number;
  totalPicksPerTeam: number;
  defaultTimerSeconds: number;
  phases: DraftPhase[];
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  inGameName: string;
  role: string;
  photo?: string;
}

export interface Team {
  id: string;
  name: string;
  shortCode: string;
  game: GameType;
  logo: string;
  primaryColor: string;
  secondaryColor?: string;
  players: Player[];
}

export interface Tournament {
  id: string;
  name: string;
  game: GameType;
  season?: string;
  defaultFormat: 'BO1' | 'BO3' | 'BO5' | 'BO7';
  status: 'upcoming' | 'live' | 'completed';
  createdAt: number;
}

export interface DraftSlot {
  slot: number;
  heroId?: string;
  heroName?: string;
  heroAvatar?: string;
  playerId?: string;
  playerName?: string;
  role?: string;
}

export interface TeamMatchState {
  teamId: string;
  name: string;
  shortCode: string;
  logo: string;
  primaryColor: string;
  secondaryColor?: string;
  seriesScore: number;
  kills: number;
  gold: number;
  towers: number;
  objectives: Record<string, number>; // e.g. { lord: 2, turtle: 1 } or { tyrant: 1, overlord: 2 }
  picks: DraftSlot[];
  bans: DraftSlot[];
}

export type MultikillType = 'single' | 'double' | 'triple' | 'maniac' | 'savage' | 'penta' | 'first_blood' | 'wipeout';

export interface MatchEvent {
  id: string;
  matchId: string;
  gameTimeSeconds: number;
  realTimestamp: number;
  type: 'kill' | 'tower' | 'objective' | 'gold_sync' | 'announcement';
  game: GameType;
  team: 'blue' | 'red';
  killerHero?: { id: string; name: string; avatar: string; playerName?: string };
  victimHero?: { id: string; name: string; avatar: string; playerName?: string };
  assists?: { id: string; name: string; avatar: string; playerName?: string }[];
  objective?: { id: string; name: string; icon: string };
  multikill?: MultikillType;
  message?: string;
}

export type MatchLifecycleStatus = 'scheduled' | 'ready' | 'drafting' | 'live' | 'paused' | 'ended' | 'archived';

export interface MatchLiveState {
  id: string;
  tournamentId: string;
  tournamentName: string;
  game: GameType;
  matchName: string; // e.g. "Grand Finals - Game 1"
  format: 'BO1' | 'BO3' | 'BO5' | 'BO7';
  currentGameNumber: number;
  status: MatchLifecycleStatus;
  clockSeconds: number;
  isClockRunning: boolean;
  teamBlue: TeamMatchState;
  teamRed: TeamMatchState;
  draft: {
    activePhaseIndex: number;
    timerRemaining: number;
    isTimerRunning: boolean;
    phases: DraftPhase[];
    completed: boolean;
  };
  events: MatchEvent[];
  overlayControls: {
    activeOverlay: 'none' | 'draft' | 'hud' | 'intro' | 'mvp' | 'results' | 'feed';
    previewOverlay: 'hud' | 'draft' | 'feed' | 'mvp' | 'none';
    showHud: boolean;
    showDraft: boolean;
    showFeed: boolean;
    showMvp: boolean;
    showLowerThird: boolean;
    activeLowerThirdPlayer?: Player;
    mvpData?: {
      player: Player;
      team: TeamMatchState;
      hero: HeroDefinition;
      kda: string;
      goldShare: string;
      damageShare: string;
      notes: string;
    };
    announcementText?: string;
  };
  lastActionAudit?: {
    action: string;
    timestamp: number;
    success: boolean;
    details?: string;
  };
}

export interface WsMessage {
  type: 'STATE_UPDATE' | 'EVENT_ADDED' | 'EVENT_UNDONE' | 'CLOCK_TICK' | 'RESET_STATE' | 'REQUEST_SYNC';
  payload?: any;
}
