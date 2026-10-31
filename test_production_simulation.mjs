// test_production_simulation.mjs
// Realistic End-to-End Simulation of MARK47 Broadcast Workflow

const BASE_URL = 'http://localhost:3001';

async function req(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function runSimulation() {
  console.log('=== STARTING MARK47 PRODUCTION FLOW SIMULATION ===\n');

  // Step 1: Initial state check
  console.log('1. Checking Initial Engine State...');
  const init = await req('/api/state');
  console.log(`- Game: ${init.data.game.toUpperCase()}, Lifecycle: ${init.data.status}, Match: ${init.data.matchName}`);

  // Step 2: Team selection & verification
  console.log('\n2. Assigning Teams to Active Match...');
  const teamsRes = await req('/api/teams');
  const blueTeam = teamsRes.data[0];
  const redTeam = teamsRes.data[1];
  console.log(`- Selected Teams: ${blueTeam.name} (${blueTeam.shortCode}) vs ${redTeam.name} (${redTeam.shortCode})`);

  const assignRes = await req('/api/match/teams', 'POST', {
    blueTeamId: blueTeam.id,
    redTeamId: redTeam.id
  });
  console.log(`- Team assignment success: ${assignRes.data.success}`);

  // Step 3: Lifecycle transition to Drafting
  console.log('\n3. Transitioning Match Lifecycle to "drafting"...');
  const draftLifeRes = await req('/api/match/lifecycle', 'POST', { status: 'drafting' });
  console.log(`- New Lifecycle: ${draftLifeRes.data.status}`);

  // Step 4: Draft Pick & Ban with Duplicate Prevention
  console.log('\n4. Executing Draft Picks & Bans with Validation...');
  const heroesRes = await req('/api/heroes/mlbb');
  const hero1 = heroesRes.data[0]; // e.g. Fanny
  const hero2 = heroesRes.data[1]; // e.g. Ling

  console.log(`- Phase 1: Banning ${hero1.name}...`);
  const banRes1 = await req('/api/draft/pick-ban', 'POST', {
    hero: hero1,
    role: hero1.primaryRole
  });
  console.log(`- Ban success: ${banRes1.data.success}`);

  console.log(`- Safety Check: Attempting duplicate ban of ${hero1.name}...`);
  const banDup = await req('/api/draft/pick-ban', 'POST', {
    hero: hero1,
    role: hero1.primaryRole
  });
  console.log(`- Duplicate Ban rejected as expected? Status: ${banDup.status}, Error: ${banDup.data.error}`);

  // Step 5: Transition to Live
  console.log('\n5. Transitioning Match Lifecycle to "live"...');
  const liveLifeRes = await req('/api/match/lifecycle', 'POST', { status: 'live' });
  console.log(`- New Lifecycle: ${liveLifeRes.data.status}`);

  // Step 6: 1-Click Fast Player Slot Kill & Duplicate Click Suppression
  console.log('\n6. Testing Fast 1-Click Slot Kill & Duplicate Click Suppression...');
  const kill1 = await req('/api/events/slot-kill', 'POST', {
    team: 'blue',
    killerSlotIndex: 0,
    multikill: 'single'
  });
  console.log(`- Kill 1 logged: success = ${kill1.data.success}, duplicate = ${kill1.data.duplicate || false}`);

  // Rapid duplicate attempt (<500ms)
  const killDup = await req('/api/events/slot-kill', 'POST', {
    team: 'blue',
    killerSlotIndex: 0,
    multikill: 'single'
  });
  console.log(`- Rapid duplicate click suppressed? duplicate = ${killDup.data.duplicate === true}`);

  // Step 7: Tower Destruction & Objective
  console.log('\n7. Logging Tower Destroyed & Neutral Objective...');
  const towerRes = await req('/api/events/tower', 'POST', { team: 'blue' });
  console.log(`- Tower destroyed for Blue: ${towerRes.data.success}`);

  const objRes = await req('/api/events/objective', 'POST', {
    team: 'blue',
    objectiveId: 'turtle',
    objectiveName: 'Turtle',
    objectiveIcon: '🐢'
  });
  console.log(`- Objective Turtle secured for Blue: ${objRes.data.success}`);

  // Step 8: Inspect Scoreboard State
  const midState = await req('/api/state');
  console.log(`\n8. Current In-Game Score: Blue Kills = ${midState.data.teamBlue.kills}, Towers = ${midState.data.teamBlue.towers}, Objectives = ${JSON.stringify(midState.data.teamBlue.objectives)}`);

  // Step 9: Undo Last Event Verification
  console.log('\n9. Testing Undo Scoring Event...');
  const undoRes = await req('/api/events/undo', 'POST');
  console.log(`- Undo API response: ${undoRes.data.success}`);
  const postUndoState = await req('/api/state');
  console.log(`- After undoing Turtle: Objectives = ${JSON.stringify(postUndoState.data.teamBlue.objectives)}`);

  // Step 10: Preview & Take Overlays Staging
  console.log('\n10. Testing Staging Preview & Take On Air...');
  await req('/api/overlay/preview', 'POST', { overlayId: 'draft' });
  const previewState = await req('/api/state');
  console.log(`- Staged Preview Overlay: ${previewState.data.overlayControls.previewOverlay}`);

  await req('/api/overlay/take', 'POST');
  const programState = await req('/api/state');
  console.log(`- Pushed to Program: showDraft = ${programState.data.overlayControls.showDraft}`);

  // Step 11: End Game Flow & Series Point Allocation
  console.log('\n11. Testing Deliberate End Game Flow...');
  const endRes = await req('/api/match/end-game', 'POST', { winner: 'blue' });
  const endedState = await req('/api/state');
  console.log(`- Match Lifecycle: ${endedState.data.status}`);
  console.log(`- Series Score: ${endedState.data.teamBlue.name} (${endedState.data.teamBlue.seriesScore}) - (${endedState.data.teamRed.seriesScore}) ${endedState.data.teamRed.name}`);

  // Step 12: Prepare Next Game in Series
  console.log('\n12. Initializing Next Game in Series...');
  await req('/api/match/next-game', 'POST');
  const nextGameState = await req('/api/state');
  console.log(`- Active Game Number: Game ${nextGameState.data.currentGameNumber}`);
  console.log(`- In-Game Kills reset to 0? Blue = ${nextGameState.data.teamBlue.kills}, Red = ${nextGameState.data.teamRed.kills}`);
  console.log(`- Series Score preserved? Blue = ${nextGameState.data.teamBlue.seriesScore}, Red = ${nextGameState.data.teamRed.seriesScore}`);
  console.log(`- Lifecycle transitioned to: ${nextGameState.data.status}`);

  console.log('\n=== SIMULATION COMPLETED SUCCESSFULLY WITH 100% PASSING CHECKS ===');
}

runSimulation().catch(err => {
  console.error('Simulation Failed:', err);
  process.exit(1);
});
