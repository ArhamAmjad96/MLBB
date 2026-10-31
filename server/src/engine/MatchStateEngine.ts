import { WebSocketServer, WebSocket } from 'ws';
import { 
  GameType, 
  MatchLiveState, 
  MatchEvent, 
  TeamMatchState, 
  DraftSlot, 
  HeroDefinition, 
  Player,
  MatchLifecycleStatus 
} from '../../../shared/types.js';
import { MLBB_DRAFT_CONFIG, MLBB_HEROES } from '../config/mlbb.js';
import { HOK_DRAFT_CONFIG, HOK_HEROES } from '../config/hok.js';
import { db, saveActiveState, loadActiveState, clearActiveState } from '../db/index.js';

export class MatchStateEngine {
  private currentState: MatchLiveState;
  private wss: WebSocketServer | null = null;
  private clockInterval: NodeJS.Timeout | null = null;
  private draftInterval: NodeJS.Timeout | null = null;
  private recentActionSignatures = new Map<string, number>();

  constructor() {
    // Attempt crash recovery from SQLite active_state
    const savedState = loadActiveState();
    if (savedState && savedState.id && savedState.teamBlue && savedState.teamRed) {
      console.log(`[MARK47 Engine] Restored active match state from disk: ${savedState.id} (${savedState.game.toUpperCase()})`);
      this.currentState = savedState;
      // Safety: paused on restart so clock doesn't run unsupervised
      this.currentState.isClockRunning = false;
      if (this.currentState.draft) {
        this.currentState.draft.isTimerRunning = false;
      }
    } else {
      this.currentState = this.createDefaultState('mlbb');
      this.saveState();
    }

    this.startTimers();
  }

  public setWebSocketServer(wss: WebSocketServer) {
    this.wss = wss;
  }

  public getState(): MatchLiveState {
    return this.currentState;
  }

  private saveState() {
    saveActiveState(this.currentState);
  }

  private startTimers() {
    // Game Match Clock ticker (1s)
    this.clockInterval = setInterval(() => {
      if (this.currentState.status === 'live' && this.currentState.isClockRunning) {
        this.currentState.clockSeconds += 1;
        this.broadcast({ type: 'CLOCK_TICK', payload: { clockSeconds: this.currentState.clockSeconds } });
      }
    }, 1000);

    // Draft Timer ticker (1s)
    this.draftInterval = setInterval(() => {
      if (this.currentState.draft.isTimerRunning) {
        if (this.currentState.draft.timerRemaining > 0) {
          this.currentState.draft.timerRemaining -= 1;
          this.broadcast({ 
            type: 'CLOCK_TICK', 
            payload: { draftTimer: this.currentState.draft.timerRemaining } 
          });
        } else {
          this.currentState.draft.isTimerRunning = false;
          this.broadcastState();
        }
      }
    }, 1000);
  }

  /**
   * Prevents accidental double-clicks / repeated submissions within 500ms
   */
  private isDuplicateAction(signature: string): boolean {
    const now = Date.now();
    const lastTime = this.recentActionSignatures.get(signature);
    if (lastTime && now - lastTime < 500) {
      return true;
    }
    this.recentActionSignatures.set(signature, now);

    // Clean up old signatures
    if (this.recentActionSignatures.size > 100) {
      for (const [sig, time] of this.recentActionSignatures.entries()) {
        if (now - time > 5000) {
          this.recentActionSignatures.delete(sig);
        }
      }
    }
    return false;
  }

  public createDefaultState(game: GameType): MatchLiveState {
    const draftConfig = game === 'mlbb' ? MLBB_DRAFT_CONFIG : HOK_DRAFT_CONFIG;

    // Load first two teams for this game from db
    const teams = db.prepare('SELECT * FROM teams WHERE game = ? LIMIT 2').all(game) as any[];
    
    const team1Data = teams[0] || {
      id: 'team_blue',
      name: game === 'mlbb' ? 'Fnatic ONIC' : 'All Gamers',
      short_code: game === 'mlbb' ? 'FNOC' : 'AG',
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Blue',
      primary_color: '#0284c7'
    };

    const team2Data = teams[1] || {
      id: 'team_red',
      name: game === 'mlbb' ? 'AP.Bren' : 'Chongqing Wolves',
      short_code: game === 'mlbb' ? 'APBR' : 'WOLVES',
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Red',
      primary_color: '#dc2626'
    };

    const createEmptySlots = (count: number): DraftSlot[] => 
      Array.from({ length: count }, (_, i) => ({ slot: i }));

    const teamBlue: TeamMatchState = {
      teamId: team1Data.id,
      name: team1Data.name,
      shortCode: team1Data.short_code,
      logo: team1Data.logo,
      primaryColor: team1Data.primary_color,
      secondaryColor: team1Data.secondary_color,
      seriesScore: 0,
      kills: 0,
      gold: 0,
      towers: 0,
      objectives: {},
      picks: createEmptySlots(5),
      bans: createEmptySlots(draftConfig.totalBansPerTeam)
    };

    const teamRed: TeamMatchState = {
      teamId: team2Data.id,
      name: team2Data.name,
      shortCode: team2Data.short_code,
      logo: team2Data.logo,
      primaryColor: team2Data.primary_color,
      secondaryColor: team2Data.secondary_color,
      seriesScore: 0,
      kills: 0,
      gold: 0,
      towers: 0,
      objectives: {},
      picks: createEmptySlots(5),
      bans: createEmptySlots(draftConfig.totalBansPerTeam)
    };

    return {
      id: `match_${Date.now()}`,
      tournamentId: game === 'mlbb' ? 'mlbb-season-1' : 'hok-championship-1',
      tournamentName: game === 'mlbb' ? 'MARK47 MLBB Masters' : 'MARK47 HOK Invitational',
      game,
      matchName: 'Game 1 - Upper Bracket Final',
      format: 'BO3',
      currentGameNumber: 1,
      status: 'scheduled',
      clockSeconds: 0,
      isClockRunning: false,
      teamBlue,
      teamRed,
      draft: {
        activePhaseIndex: 0,
        timerRemaining: draftConfig.defaultTimerSeconds,
        isTimerRunning: false,
        phases: draftConfig.phases,
        completed: false
      },
      events: [],
      overlayControls: {
        activeOverlay: 'none',
        previewOverlay: 'hud',
        showHud: true,
        showDraft: false,
        showFeed: true,
        showMvp: false,
        showLowerThird: false
      },
      lastActionAudit: {
        action: 'MATCH_INITIALIZED',
        timestamp: Date.now(),
        success: true,
        details: `Initialized new ${game.toUpperCase()} match`
      }
    };
  }

  // --- Safe Game Switching with In-Progress Guard ---
  public switchGame(newGame: GameType, force: boolean = false): { success: boolean; error?: string } {
    if (this.currentState.game === newGame) {
      return { success: true };
    }

    const inProgress = ['drafting', 'live', 'paused'].includes(this.currentState.status);
    if (inProgress && !force) {
      return {
        success: false,
        error: `Cannot switch game while match is '${this.currentState.status}'. End or archive the match first, or confirm force switch.`
      };
    }

    this.currentState = this.createDefaultState(newGame);
    this.auditAction('GAME_SWITCHED', `Switched game mode to ${newGame.toUpperCase()}`);
    this.broadcastState();
    return { success: true };
  }

  // --- Lifecycle State Machine ---
  public setMatchLifecycle(newStatus: MatchLifecycleStatus): { success: boolean; error?: string } {
    const current = this.currentState.status;
    const allowedTransitions: Record<MatchLifecycleStatus, MatchLifecycleStatus[]> = {
      scheduled: ['ready', 'drafting'],
      ready: ['drafting', 'live', 'scheduled'],
      drafting: ['ready', 'live', 'scheduled'],
      live: ['paused', 'ended'],
      paused: ['live', 'ended'],
      ended: ['archived', 'live', 'ready'],
      archived: ['ready', 'scheduled']
    };

    if (current !== newStatus && !allowedTransitions[current]?.includes(newStatus)) {
      return {
        success: false,
        error: `Illegal lifecycle transition: '${current}' → '${newStatus}'.`
      };
    }

    this.currentState.status = newStatus;

    if (newStatus === 'live') {
      this.currentState.isClockRunning = true;
      this.currentState.overlayControls.showDraft = false;
      this.currentState.overlayControls.showHud = true;
    } else if (newStatus === 'paused' || newStatus === 'ended') {
      this.currentState.isClockRunning = false;
    } else if (newStatus === 'drafting') {
      this.currentState.overlayControls.showDraft = true;
      this.currentState.overlayControls.showHud = false;
    }

    this.auditAction('LIFECYCLE_TRANSITION', `Match status changed from ${current} to ${newStatus}`);
    this.broadcastState();
    return { success: true };
  }

  // --- Clock Controls ---
  public toggleMatchClock(): boolean {
    this.currentState.isClockRunning = !this.currentState.isClockRunning;
    if (this.currentState.isClockRunning && this.currentState.status !== 'live') {
      this.currentState.status = 'live';
    }
    this.auditAction('CLOCK_TOGGLED', `Clock is now ${this.currentState.isClockRunning ? 'RUNNING' : 'PAUSED'}`);
    this.broadcastState();
    return this.currentState.isClockRunning;
  }

  public setMatchClock(seconds: number) {
    this.currentState.clockSeconds = Math.max(0, seconds);
    this.auditAction('CLOCK_SET', `Clock set to ${seconds}s`);
    this.broadcastState();
  }

  public setMatchStatus(status: MatchLifecycleStatus) {
    this.setMatchLifecycle(status);
  }

  // --- Scoreboard Controls ---
  public updateScoreboard(updates: {
    blueScore?: number;
    redScore?: number;
    blueKills?: number;
    redKills?: number;
    blueGold?: number;
    redGold?: number;
    blueTowers?: number;
    redTowers?: number;
  }) {
    if (updates.blueScore !== undefined) this.currentState.teamBlue.seriesScore = Math.max(0, updates.blueScore);
    if (updates.redScore !== undefined) this.currentState.teamRed.seriesScore = Math.max(0, updates.redScore);
    if (updates.blueKills !== undefined) this.currentState.teamBlue.kills = Math.max(0, updates.blueKills);
    if (updates.redKills !== undefined) this.currentState.teamRed.kills = Math.max(0, updates.redKills);
    if (updates.blueGold !== undefined) this.currentState.teamBlue.gold = Math.max(0, updates.blueGold);
    if (updates.redGold !== undefined) this.currentState.teamRed.gold = Math.max(0, updates.redGold);
    if (updates.blueTowers !== undefined) this.currentState.teamBlue.towers = Math.max(0, Math.min(9, updates.blueTowers));
    if (updates.redTowers !== undefined) this.currentState.teamRed.towers = Math.max(0, Math.min(9, updates.redTowers));

    this.auditAction('SCOREBOARD_UPDATED', 'Manual scoreboard update applied');
    this.broadcastState();
  }

  // --- Set Teams from Database ---
  public setMatchTeams(blueTeamId: string, redTeamId: string): { success: boolean; error?: string } {
    try {
      const blueRow = db.prepare('SELECT * FROM teams WHERE id = ?').get(blueTeamId) as any;
      const redRow = db.prepare('SELECT * FROM teams WHERE id = ?').get(redTeamId) as any;

      if (!blueRow || !redRow) {
        return { success: false, error: 'One or both selected teams could not be found in database.' };
      }

      const bluePlayers = db.prepare('SELECT * FROM players WHERE team_id = ?').all(blueTeamId) as any[];
      const redPlayers = db.prepare('SELECT * FROM players WHERE team_id = ?').all(redTeamId) as any[];

      this.currentState.teamBlue.teamId = blueRow.id;
      this.currentState.teamBlue.name = blueRow.name;
      this.currentState.teamBlue.shortCode = blueRow.short_code;
      this.currentState.teamBlue.logo = blueRow.logo;
      this.currentState.teamBlue.primaryColor = blueRow.primary_color;

      this.currentState.teamRed.teamId = redRow.id;
      this.currentState.teamRed.name = redRow.name;
      this.currentState.teamRed.shortCode = redRow.short_code;
      this.currentState.teamRed.logo = redRow.logo;
      this.currentState.teamRed.primaryColor = redRow.primary_color;

      // Assign players to draft slots if empty
      bluePlayers.slice(0, 5).forEach((p, idx) => {
        if (this.currentState.teamBlue.picks[idx]) {
          this.currentState.teamBlue.picks[idx].playerId = p.id;
          this.currentState.teamBlue.picks[idx].playerName = p.in_game_name;
          this.currentState.teamBlue.picks[idx].role = p.role;
        }
      });

      redPlayers.slice(0, 5).forEach((p, idx) => {
        if (this.currentState.teamRed.picks[idx]) {
          this.currentState.teamRed.picks[idx].playerId = p.id;
          this.currentState.teamRed.picks[idx].playerName = p.in_game_name;
          this.currentState.teamRed.picks[idx].role = p.role;
        }
      });

      this.auditAction('TEAMS_ASSIGNED', `Assigned ${blueRow.short_code} vs ${redRow.short_code}`);
      this.broadcastState();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // --- Fast Player Kill Logging from Draft Slots ---
  public registerDraftSlotKill(data: {
    team: 'blue' | 'red';
    killerSlotIndex: number;
    victimSlotIndex?: number;
    multikill?: MatchEvent['multikill'];
  }): { success: boolean; duplicate?: boolean } {
    const signature = `slot_kill:${data.team}:${data.killerSlotIndex}:${data.victimSlotIndex ?? 'none'}:${data.multikill || 'single'}`;
    if (this.isDuplicateAction(signature)) {
      return { success: false, duplicate: true };
    }

    const scoringTeam = data.team === 'blue' ? this.currentState.teamBlue : this.currentState.teamRed;
    const enemyTeam = data.team === 'blue' ? this.currentState.teamRed : this.currentState.teamBlue;

    const killerSlot = scoringTeam.picks[data.killerSlotIndex];
    const victimSlot = data.victimSlotIndex !== undefined ? enemyTeam.picks[data.victimSlotIndex] : undefined;

    const killerHero: HeroDefinition | undefined = killerSlot?.heroId ? {
      id: killerSlot.heroId,
      name: killerSlot.heroName || 'Champion',
      avatar: killerSlot.heroAvatar || '',
      game: this.currentState.game,
      primaryRole: killerSlot.role || 'CORE'
    } : undefined;

    const victimHero: HeroDefinition | undefined = victimSlot?.heroId ? {
      id: victimSlot.heroId,
      name: victimSlot.heroName || 'Champion',
      avatar: victimSlot.heroAvatar || '',
      game: this.currentState.game,
      primaryRole: victimSlot.role || 'CORE'
    } : undefined;

    return this.registerKillEvent({
      team: data.team,
      killerHero,
      victimHero,
      killerPlayerName: killerSlot?.playerName,
      victimPlayerName: victimSlot?.playerName,
      multikill: data.multikill
    });
  }

  // --- Atomic Match Event Logging (Kill, Tower, Objective) ---
  public registerKillEvent(eventData: {
    team: 'blue' | 'red';
    killerHero?: HeroDefinition;
    victimHero?: HeroDefinition;
    killerPlayerName?: string;
    victimPlayerName?: string;
    multikill?: MatchEvent['multikill'];
  }): { success: boolean; duplicate?: boolean } {
    const signature = `kill:${eventData.team}:${eventData.killerHero?.id || 'unknown'}:${eventData.victimHero?.id || 'unknown'}:${eventData.multikill || 'single'}`;
    if (this.isDuplicateAction(signature)) {
      return { success: false, duplicate: true };
    }

    const event: MatchEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      matchId: this.currentState.id,
      gameTimeSeconds: this.currentState.clockSeconds,
      realTimestamp: Date.now(),
      type: 'kill',
      game: this.currentState.game,
      team: eventData.team,
      killerHero: eventData.killerHero,
      victimHero: eventData.victimHero,
      multikill: eventData.multikill || 'single'
    };

    if (eventData.team === 'blue') {
      this.currentState.teamBlue.kills += 1;
    } else {
      this.currentState.teamRed.kills += 1;
    }

    this.currentState.events.unshift(event);
    this.auditAction('KILL_REGISTERED', `${eventData.team.toUpperCase()} kill by ${eventData.killerHero?.name || 'team'}`);
    this.broadcastState();
    return { success: true };
  }

  public registerObjectiveEvent(eventData: {
    team: 'blue' | 'red';
    objectiveId: string;
    objectiveName: string;
    objectiveIcon: string;
  }): { success: boolean; duplicate?: boolean } {
    const signature = `obj:${eventData.team}:${eventData.objectiveId}`;
    if (this.isDuplicateAction(signature)) {
      return { success: false, duplicate: true };
    }

    const event: MatchEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      matchId: this.currentState.id,
      gameTimeSeconds: this.currentState.clockSeconds,
      realTimestamp: Date.now(),
      type: 'objective',
      game: this.currentState.game,
      team: eventData.team,
      objective: {
        id: eventData.objectiveId,
        name: eventData.objectiveName,
        icon: eventData.objectiveIcon
      }
    };

    const targetTeam = eventData.team === 'blue' ? this.currentState.teamBlue : this.currentState.teamRed;
    targetTeam.objectives[eventData.objectiveId] = (targetTeam.objectives[eventData.objectiveId] || 0) + 1;

    this.currentState.events.unshift(event);
    this.auditAction('OBJECTIVE_SECURED', `${eventData.team.toUpperCase()} secured ${eventData.objectiveName}`);
    this.broadcastState();
    return { success: true };
  }

  public registerTowerEvent(team: 'blue' | 'red'): { success: boolean; duplicate?: boolean } {
    const signature = `tower:${team}`;
    if (this.isDuplicateAction(signature)) {
      return { success: false, duplicate: true };
    }

    const event: MatchEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      matchId: this.currentState.id,
      gameTimeSeconds: this.currentState.clockSeconds,
      realTimestamp: Date.now(),
      type: 'tower',
      game: this.currentState.game,
      team
    };

    if (team === 'blue') {
      this.currentState.teamBlue.towers = Math.min(9, this.currentState.teamBlue.towers + 1);
    } else {
      this.currentState.teamRed.towers = Math.min(9, this.currentState.teamRed.towers + 1);
    }

    this.currentState.events.unshift(event);
    this.auditAction('TOWER_DESTROYED', `${team.toUpperCase()} destroyed enemy turret`);
    this.broadcastState();
    return { success: true };
  }

  // --- Complete Synchronized Undo with WebSocket Notification ---
  public undoLastEvent(): { success: boolean; undoneEvent?: MatchEvent } {
    if (this.currentState.events.length === 0) {
      return { success: false };
    }

    const undone = this.currentState.events.shift()!;

    if (undone.type === 'kill') {
      if (undone.team === 'blue' && this.currentState.teamBlue.kills > 0) {
        this.currentState.teamBlue.kills -= 1;
      } else if (undone.team === 'red' && this.currentState.teamRed.kills > 0) {
        this.currentState.teamRed.kills -= 1;
      }
    } else if (undone.type === 'tower') {
      if (undone.team === 'blue' && this.currentState.teamBlue.towers > 0) {
        this.currentState.teamBlue.towers -= 1;
      } else if (undone.team === 'red' && this.currentState.teamRed.towers > 0) {
        this.currentState.teamRed.towers -= 1;
      }
    } else if (undone.type === 'objective' && undone.objective) {
      const targetTeam = undone.team === 'blue' ? this.currentState.teamBlue : this.currentState.teamRed;
      if (targetTeam.objectives[undone.objective.id] > 0) {
        targetTeam.objectives[undone.objective.id] -= 1;
      }
    }

    // Broadcast EVENT_UNDONE so KillFeed and other overlays evict on-air graphics immediately
    this.broadcast({
      type: 'EVENT_UNDONE',
      payload: {
        eventId: undone.id,
        undoneEvent: undone
      }
    });

    this.auditAction('EVENT_UNDONE', `Undid ${undone.type} (${undone.team.toUpperCase()})`);
    this.broadcastState();
    return { success: true, undoneEvent: undone };
  }

  // --- Draft Engine Controls with Duplicate Prevention ---
  public setDraftPhase(phaseIndex: number) {
    if (phaseIndex >= 0 && phaseIndex < this.currentState.draft.phases.length) {
      this.currentState.draft.activePhaseIndex = phaseIndex;
      const phase = this.currentState.draft.phases[phaseIndex];
      this.currentState.draft.timerRemaining = phase.timeSeconds;
      this.currentState.draft.isTimerRunning = true;
      this.currentState.status = 'drafting';
      this.auditAction('DRAFT_PHASE_CHANGED', `Jumped to draft phase ${phaseIndex + 1}: ${phase.label}`);
      this.broadcastState();
    }
  }

  public toggleDraftTimer(): boolean {
    this.currentState.draft.isTimerRunning = !this.currentState.draft.isTimerRunning;
    if (this.currentState.draft.isTimerRunning && (this.currentState.status === 'ready' || this.currentState.status === 'scheduled')) {
      this.currentState.status = 'drafting';
    }
    this.auditAction('DRAFT_TIMER_TOGGLED', `Draft timer is now ${this.currentState.draft.isTimerRunning ? 'RUNNING' : 'PAUSED'}`);
    this.broadcastState();
    return this.currentState.draft.isTimerRunning;
  }

  public resetDraftTimer(seconds: number = 40) {
    this.currentState.draft.timerRemaining = seconds;
    this.broadcastState();
  }

  public recordDraftPickOrBan(
    hero: HeroDefinition, 
    playerId?: string, 
    playerName?: string, 
    role?: string
  ): { success: boolean; error?: string } {
    const activePhase = this.currentState.draft.phases[this.currentState.draft.activePhaseIndex];
    if (!activePhase) {
      return { success: false, error: 'Draft is already completed.' };
    }

    // Check for duplicate pick or ban across all slots in both teams
    const allPickedOrBannedHeroIds = new Set<string>();
    [...this.currentState.teamBlue.bans, ...this.currentState.teamBlue.picks,
     ...this.currentState.teamRed.bans, ...this.currentState.teamRed.picks].forEach(slot => {
      if (slot.heroId) allPickedOrBannedHeroIds.add(slot.heroId);
    });

    if (allPickedOrBannedHeroIds.has(hero.id)) {
      return { 
        success: false, 
        error: `"${hero.name}" has already been selected or banned in this draft.` 
      };
    }

    const targetTeam = activePhase.team === 'blue' ? this.currentState.teamBlue : this.currentState.teamRed;
    const targetArray = activePhase.type === 'ban' ? targetTeam.bans : targetTeam.picks;

    targetArray[activePhase.slotIndex] = {
      slot: activePhase.slotIndex,
      heroId: hero.id,
      heroName: hero.name,
      heroAvatar: hero.avatar,
      playerId,
      playerName,
      role: role || hero.primaryRole
    };

    // Auto-advance phase and automatically start the countdown for the next team's turn (Official MLBB tournament standard)
    if (this.currentState.draft.activePhaseIndex < this.currentState.draft.phases.length - 1) {
      this.currentState.draft.activePhaseIndex += 1;
      const nextPhase = this.currentState.draft.phases[this.currentState.draft.activePhaseIndex];
      this.currentState.draft.timerRemaining = nextPhase.timeSeconds;
      this.currentState.draft.isTimerRunning = true;
      this.currentState.status = 'drafting';
    } else {
      this.currentState.draft.completed = true;
      this.currentState.draft.isTimerRunning = false;
      this.currentState.status = 'ready';
    }

    this.auditAction('DRAFT_LOCK_IN', `${activePhase.team.toUpperCase()} ${activePhase.type.toUpperCase()}: ${hero.name}`);
    this.broadcastState();
    return { success: true };
  }

  public undoLastDraftAction(): boolean {
    if (this.currentState.draft.activePhaseIndex > 0 || this.currentState.draft.completed) {
      if (this.currentState.draft.completed) {
        this.currentState.draft.completed = false;
      } else {
        this.currentState.draft.activePhaseIndex -= 1;
      }

      const activePhase = this.currentState.draft.phases[this.currentState.draft.activePhaseIndex];
      const targetTeam = activePhase.team === 'blue' ? this.currentState.teamBlue : this.currentState.teamRed;
      const targetArray = activePhase.type === 'ban' ? targetTeam.bans : targetTeam.picks;

      const removedHero = targetArray[activePhase.slotIndex]?.heroName;
      targetArray[activePhase.slotIndex] = { slot: activePhase.slotIndex };
      this.currentState.draft.timerRemaining = activePhase.timeSeconds;
      this.auditAction('DRAFT_UNDONE', `Undid ${activePhase.label} (${removedHero || 'slot'})`);
      this.broadcastState();
      return true;
    }
    return false;
  }

  // --- Preview / Take Switcher Controls ---
  public setPreviewOverlay(overlayId: 'hud' | 'draft' | 'feed' | 'mvp' | 'none') {
    this.currentState.overlayControls.previewOverlay = overlayId;
    this.broadcastState();
  }

  public takePreviewToProgram(): void {
    const preview = this.currentState.overlayControls.previewOverlay;
    if (!preview || preview === 'none') return;

    if (preview === 'hud') {
      this.currentState.overlayControls.showHud = true;
      this.currentState.overlayControls.showDraft = false;
      this.currentState.overlayControls.showMvp = false;
    } else if (preview === 'draft') {
      this.currentState.overlayControls.showDraft = true;
      this.currentState.overlayControls.showHud = false;
      this.currentState.overlayControls.showMvp = false;
    } else if (preview === 'mvp') {
      this.currentState.overlayControls.showMvp = true;
    } else if (preview === 'feed') {
      this.currentState.overlayControls.showFeed = true;
    }

    this.auditAction('TAKE_ON_AIR', `Took ${preview.toUpperCase()} to Program On-Air`);
    this.broadcastState();
  }

  public blackoutOverlays(): void {
    this.currentState.overlayControls.showHud = false;
    this.currentState.overlayControls.showDraft = false;
    this.currentState.overlayControls.showFeed = false;
    this.currentState.overlayControls.showMvp = false;
    this.currentState.overlayControls.showLowerThird = false;
    this.auditAction('BLACKOUT', 'Blacked out all on-air overlays');
    this.broadcastState();
  }

  public updateOverlayControls(controls: Partial<MatchLiveState['overlayControls']>) {
    this.currentState.overlayControls = {
      ...this.currentState.overlayControls,
      ...controls
    };
    this.broadcastState();
  }

  // --- End Match & Start Next Game Flow ---
  public endCurrentGame(winner: 'blue' | 'red'): { success: boolean } {
    if (winner === 'blue') {
      this.currentState.teamBlue.seriesScore += 1;
    } else {
      this.currentState.teamRed.seriesScore += 1;
    }

    this.currentState.status = 'ended';
    this.currentState.isClockRunning = false;
    this.auditAction('GAME_ENDED', `${winner.toUpperCase()} won Game ${this.currentState.currentGameNumber}`);
    this.broadcastState();
    return { success: true };
  }

  public prepareNextGame(): { success: boolean } {
    const nextGameNumber = this.currentState.currentGameNumber + 1;
    const blueScore = this.currentState.teamBlue.seriesScore;
    const redScore = this.currentState.teamRed.seriesScore;
    const draftConfig = this.currentState.game === 'mlbb' ? MLBB_DRAFT_CONFIG : HOK_DRAFT_CONFIG;

    const createEmptySlots = (count: number): DraftSlot[] => 
      Array.from({ length: count }, (_, i) => ({ slot: i }));

    // Retain team IDs, names, logos, and series points; reset in-game gold, towers, kills, and draft
    this.currentState.currentGameNumber = nextGameNumber;
    this.currentState.matchName = `Game ${nextGameNumber} - ${this.currentState.format}`;
    this.currentState.status = 'ready';
    this.currentState.clockSeconds = 0;
    this.currentState.isClockRunning = false;

    this.currentState.teamBlue.kills = 0;
    this.currentState.teamBlue.gold = 0;
    this.currentState.teamBlue.towers = 0;
    this.currentState.teamBlue.objectives = {};
    this.currentState.teamBlue.picks = createEmptySlots(5);
    this.currentState.teamBlue.bans = createEmptySlots(draftConfig.totalBansPerTeam);

    this.currentState.teamRed.kills = 0;
    this.currentState.teamRed.gold = 0;
    this.currentState.teamRed.towers = 0;
    this.currentState.teamRed.objectives = {};
    this.currentState.teamRed.picks = createEmptySlots(5);
    this.currentState.teamRed.bans = createEmptySlots(draftConfig.totalBansPerTeam);

    this.currentState.draft = {
      activePhaseIndex: 0,
      timerRemaining: draftConfig.defaultTimerSeconds,
      isTimerRunning: false,
      phases: draftConfig.phases,
      completed: false
    };

    this.currentState.events = [];
    this.auditAction('NEXT_GAME_PREPARED', `Prepared Game ${nextGameNumber} (Series: ${blueScore} - ${redScore})`);
    this.broadcastState();
    return { success: true };
  }

  private auditAction(action: string, details?: string) {
    this.currentState.lastActionAudit = {
      action,
      timestamp: Date.now(),
      success: true,
      details
    };
  }

  // --- Broadcast WebSocket updates ---
  public broadcast(message: any) {
    if (!this.wss) return;
    const payload = JSON.stringify(message);
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  public broadcastState() {
    this.saveState();
    this.broadcast({
      type: 'STATE_UPDATE',
      payload: this.currentState
    });
  }
}
