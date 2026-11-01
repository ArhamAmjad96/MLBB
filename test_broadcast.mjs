import assert from 'node:assert/strict';
import WebSocket from './server/node_modules/ws/index.js';
assert.equal(process.env.MARK47_BROADCAST_TEST, '1', 'Run only against the isolated test backend with MARK47_BROADCAST_TEST=1');
const base=process.env.MARK47_TEST_BASE_URL || 'http://127.0.0.1:3001';
async function get(){const r=await fetch(`${base}/api/state`);assert.ok(r.ok);return r.json();}
async function post(path,body={}){const r=await fetch(`${base}/api/${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});assert.ok(r.ok,`${path}: ${r.status}`);return r.json();}
const messages=[];const ws=new WebSocket(base.replace(/^http/,'ws'));ws.on('message',data=>messages.push(JSON.parse(data)));await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});
try {
const original=await get();
await post('match/setup',{teamBlue:{coachName:'Test Coach'}});assert.equal((await get()).teamBlue.coachName,'Test Coach');
await post('overlay/controls',{showFeed:true,eventHoldSeconds:2.5});
for(const specialType of ['first_blood','double_kill','triple_kill','maniac','savage','shutdown','turtle_secured','lord_secured','lord_steal','tower_destroyed']){
 const before=await get();const result=await post('events/special',{team:'blue',specialType});assert.equal(result.success,true);
 const after=await get();assert.equal(after.events[0].specialType,specialType);
 if(specialType==='tower_destroyed')assert.equal(after.teamBlue.towers,Math.min(9,before.teamBlue.towers+1));
 else if(specialType.includes('lord'))assert.equal(after.teamBlue.objectives.lord,(before.teamBlue.objectives.lord||0)+1);
 else if(specialType==='turtle_secured')assert.equal(after.teamBlue.objectives.turtle,(before.teamBlue.objectives.turtle||0)+1);
 else assert.equal(after.teamBlue.kills,before.teamBlue.kills+1);
 await post('events/undo'); const undone=await get();assert.equal(undone.teamBlue.kills,before.teamBlue.kills);for (const id of new Set([...Object.keys(undone.teamBlue.objectives),...Object.keys(before.teamBlue.objectives)])) assert.equal(undone.teamBlue.objectives[id]||0,before.teamBlue.objectives[id]||0);assert.equal(undone.teamBlue.towers,before.teamBlue.towers);
}
const beforeReplay=await get();const event=original.events[0] || {id:'preview',type:'special',team:'blue',specialType:'savage'};
await post('overlay/controls',{eventReplay:{nonce:'test-replay',event,requestedAt:Date.now()},eventClearToken:'test-clear'});
const afterReplay=await get();assert.equal(afterReplay.teamBlue.kills,beforeReplay.teamBlue.kills);assert.equal(afterReplay.events.length,beforeReplay.events.length);assert.equal(afterReplay.overlayControls.eventReplay.nonce,'test-replay');
await post('overlay/blackout');const black=await get();for(const key of ['showHud','showFeed','showDraft','showMvp'])assert.equal(black.overlayControls[key],false);
await new Promise(resolve=>setTimeout(resolve,100));assert.ok(messages.some(m=>m.type==='STATE_UPDATE'&&m.payload.overlayControls.eventClearToken==='test-clear'));assert.ok(messages.some(m=>m.type==='EVENT_UNDONE'));
const beforeVictory=await get();await post('events/special',{team:'red',specialType:'victory'});const victory=await get();assert.equal(victory.status,'ended');assert.equal(victory.teamRed.seriesScore,beforeVictory.teamRed.seriesScore+1);await post('events/undo');assert.equal((await get()).teamRed.seriesScore,beforeVictory.teamRed.seriesScore);
await post('match/next-game');await post('match/lifecycle',{status:'drafting'});
const heroes=await (await fetch(`${base}/api/heroes/mlbb`)).json();
let draft=await get();const phaseCount=draft.draft.phases.length;
for(let i=0;i<phaseCount;i++){await post('draft/pick-ban',{hero:heroes[i],playerName:`Test Player ${i+1}`});}
draft=await get();assert.equal(draft.draft.completed,true);assert.equal(draft.teamBlue.picks.filter(p=>p.heroId).length,5);assert.equal(draft.teamRed.picks.filter(p=>p.heroId).length,5);assert.equal(draft.teamBlue.bans.filter(p=>p.heroId).length,5);assert.equal(draft.teamRed.bans.filter(p=>p.heroId).length,5);
await post('draft/undo');assert.equal((await get()).draft.completed,false);await post('draft/pick-ban',{hero:heroes[phaseCount-1],playerName:'Test Player'});assert.equal((await get()).draft.completed,true);
await post('match/next-game');await post('draft/timer/toggle');assert.equal((await get()).draft.isTimerRunning,true);await post('draft/timer/toggle');assert.equal((await get()).draft.isTimerRunning,false);
console.log('PASS: 10 event variants, scoring + undo, coaches, replay without score mutation, clear synchronization, blackout, WebSocket updates, Victory scoring/undo, all 20 draft phases, draft undo/re-lock, timer pause/resume.');
}finally{ws.close();}
