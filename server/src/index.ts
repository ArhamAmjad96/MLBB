import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { initDatabase, db } from './db/index.js';
import { MatchStateEngine } from './engine/MatchStateEngine.js';
import { MLBB_HEROES, MLBB_OBJECTIVES } from './config/mlbb.js';
import { HOK_HEROES, HOK_OBJECTIVES } from './config/hok.js';
import { GameType } from '../../shared/types.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
initDatabase();

// Initialize Core Match Engine
const engine = new MatchStateEngine();

// Setup HTTP & WebSocket Servers
const server = createServer(app);
const wss = new WebSocketServer({ server });
engine.setWebSocketServer(wss);

wss.on('connection', (ws: WebSocket) => {
  // Send immediate full state to newly connected client / OBS browser source
  ws.send(JSON.stringify({
    type: 'STATE_UPDATE',
    payload: engine.getState()
  }));

  ws.on('message', (message: string) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.type === 'REQUEST_SYNC') {
        ws.send(JSON.stringify({
          type: 'STATE_UPDATE',
          payload: engine.getState()
        }));
      }
    } catch (e) {
      console.error('WS Error:', e);
    }
  });
});

// --- REST API ROUTES ---

// 1. Current State
app.get('/api/state', (req, res) => {
  res.json(engine.getState());
});

// 2. Switch Active Game (MLBB <-> HOK) with Safety Guard
app.post('/api/game/switch', (req, res) => {
  const { game, force } = req.body as { game: GameType; force?: boolean };
  if (game !== 'mlbb' && game !== 'hok') {
    return res.status(400).json({ error: 'Invalid game specified' });
  }
  const result = engine.switchGame(game, Boolean(force));
  if (!result.success) {
    return res.status(409).json({ error: result.error });
  }
  res.json({ success: true, state: engine.getState() });
});

// 2b. Match Lifecycle Transitions
app.post('/api/match/lifecycle', (req, res) => {
  const { status } = req.body;
  const result = engine.setMatchLifecycle(status);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, status: engine.getState().status, state: engine.getState() });
});

// 2c. Team Assignment to Active Match
app.post('/api/match/teams', (req, res) => {
  const { blueTeamId, redTeamId } = req.body;
  const result = engine.setMatchTeams(blueTeamId, redTeamId);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, state: engine.getState() });
});

// 2d. End Game & Next Game in Series
app.post('/api/match/end-game', (req, res) => {
  const { winner } = req.body as { winner: 'blue' | 'red' };
  if (winner !== 'blue' && winner !== 'red') {
    return res.status(400).json({ error: 'Winner must be "blue" or "red"' });
  }
  engine.endCurrentGame(winner);
  res.json({ success: true, state: engine.getState() });
});

app.post('/api/match/next-game', (req, res) => {
  engine.prepareNextGame();
  res.json({ success: true, state: engine.getState() });
});

// 3. Match Clock Controls
app.post('/api/clock/toggle', (req, res) => {
  const isRunning = engine.toggleMatchClock();
  res.json({ success: true, isRunning });
});

app.post('/api/clock/set', (req, res) => {
  const { seconds } = req.body;
  engine.setMatchClock(Number(seconds) || 0);
  res.json({ success: true, clockSeconds: engine.getState().clockSeconds });
});

app.post('/api/match/status', (req, res) => {
  const { status } = req.body;
  engine.setMatchStatus(status);
  res.json({ success: true, status: engine.getState().status });
});

// 4. Scoreboard & Economy
app.post('/api/scoreboard/update', (req, res) => {
  engine.updateScoreboard(req.body);
  res.json({ success: true, state: engine.getState() });
});

// 5. Match Events & Undo
app.post('/api/events/kill', (req, res) => {
  const { team, killerHero, victimHero, multikill } = req.body;
  const result = engine.registerKillEvent({ team, killerHero, victimHero, multikill });
  res.json(result);
});

// 5b. Fast Slot Kill from Drafted Heroes
app.post('/api/events/slot-kill', (req, res) => {
  const { team, killerSlotIndex, victimSlotIndex, multikill } = req.body;
  const result = engine.registerDraftSlotKill({ team, killerSlotIndex, victimSlotIndex, multikill });
  res.json(result);
});

app.post('/api/events/objective', (req, res) => {
  const { team, objectiveId, objectiveName, objectiveIcon, isSteal } = req.body;
  const result = engine.registerObjectiveEvent({ team, objectiveId, objectiveName, objectiveIcon, isSteal });
  res.json(result);
});

app.post('/api/events/special', (req, res) => {
  const result = engine.registerSpecialEvent(req.body);
  res.json(result);
});

app.post('/api/events/tower', (req, res) => {
  const { team } = req.body;
  const result = engine.registerTowerEvent(team);
  res.json(result);
});

app.post('/api/events/undo', (req, res) => {
  const result = engine.undoLastEvent();
  res.json(result);
});

// 6. Draft Pick / Ban with Duplicate Prevention
app.post('/api/draft/pick-ban', (req, res) => {
  const { hero, playerId, playerName, role } = req.body;
  const result = engine.recordDraftPickOrBan(hero, playerId, playerName, role);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true });
});

app.post('/api/draft/undo', (req, res) => {
  const success = engine.undoLastDraftAction();
  res.json({ success });
});

app.post('/api/draft/timer/toggle', (req, res) => {
  const isRunning = engine.toggleDraftTimer();
  res.json({ success: true, isTimerRunning: isRunning });
});

app.post('/api/draft/phase/set', (req, res) => {
  const { phaseIndex } = req.body;
  engine.setDraftPhase(Number(phaseIndex) || 0);
  res.json({ success: true });
});

// 7. Overlay Controls & Preview / Take
app.post('/api/overlay/preview', (req, res) => {
  const { overlayId } = req.body;
  engine.setPreviewOverlay(overlayId);
  res.json({ success: true, previewOverlay: engine.getState().overlayControls.previewOverlay });
});

app.post('/api/overlay/take', (req, res) => {
  engine.takePreviewToProgram();
  res.json({ success: true, controls: engine.getState().overlayControls });
});

app.post('/api/overlay/blackout', (req, res) => {
  engine.blackoutOverlays();
  res.json({ success: true, controls: engine.getState().overlayControls });
});

app.post('/api/overlay/controls', (req, res) => {
  engine.updateOverlayControls(req.body);
  res.json({ success: true, controls: engine.getState().overlayControls });
});

// 8. Static & Reference Assets
app.get('/api/heroes/:game', (req, res) => {
  const game = req.params.game;
  if (game === 'mlbb') {
    res.json(MLBB_HEROES);
  } else if (game === 'hok') {
    res.json(HOK_HEROES);
  } else {
    res.status(404).json({ error: 'Unknown game' });
  }
});

app.get('/api/objectives/:game', (req, res) => {
  const game = req.params.game;
  if (game === 'mlbb') {
    res.json(MLBB_OBJECTIVES);
  } else if (game === 'hok') {
    res.json(HOK_OBJECTIVES);
  } else {
    res.status(404).json({ error: 'Unknown game' });
  }
});

// 9. Tournaments, Teams & Players Database Query
app.get('/api/tournaments', (req, res) => {
  const rows = db.prepare('SELECT * FROM tournaments ORDER BY created_at DESC').all();
  res.json(rows);
});

app.get('/api/teams', (req, res) => {
  const game = req.query.game as string | undefined;
  let teams: any[];
  if (game) {
    teams = db.prepare('SELECT * FROM teams WHERE game = ?').all(game);
  } else {
    teams = db.prepare('SELECT * FROM teams').all();
  }

  // Attach players
  const teamsWithPlayers = teams.map(team => {
    const players = db.prepare('SELECT * FROM players WHERE team_id = ?').all(team.id);
    return { ...team, players };
  });

  res.json(teamsWithPlayers);
});

server.listen(port, () => {
  console.log(`[MARK47 Backend Engine] Running on http://localhost:${port}`);
  console.log(`[MARK47 WebSocket Hub] Ready on ws://localhost:${port}`);
});
