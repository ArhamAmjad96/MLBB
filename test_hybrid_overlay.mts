import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import WebSocket from './server/node_modules/ws/index.js';
import { normalizeLayout, normalizeSpectatorSettings, SCOREBOARD, EVENT_BOUNDS } from './shared/overlayLayout.ts';
import { eventQueueReducer, emptyEventQueue } from './shared/eventQueue.ts';
import type { MatchEvent } from './shared/types.ts';

const base=process.env.MARK47_TEST_BASE_URL;
assert.ok(base && new URL(base).port==='3101','This test requires the isolated backend on port 3101.');
async function request(path:string,body?:unknown){const response=await fetch(`${base}/api/${path}`,body===undefined?undefined:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});assert.ok(response.ok,`${path}: ${response.status}`);return response.json();}
const sockets:WebSocket[]=[];
async function socket(url:string){const ws=new WebSocket(url);sockets.push(ws);await new Promise<void>((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});return ws;}
try {
  const defaults=normalizeSpectatorSettings();assert.equal(defaults.mode,'hybrid');assert.equal(defaults.manualGold,undefined);assert.equal(defaults.showKills,false);assert.equal(defaults.showClock,false);
  for(let left=0;left<=800;left+=200)for(let right=0;right<=800;right+=200){
    const layout=normalizeLayout({safeZones:{left,right,top:600,bottom:300},scoreboard:{x:-200,y:-100,scale:1.5},event:{x:9999,y:9999,scale:1.5}});
    for(const [key,bounds] of [['scoreboard',SCOREBOARD],['event',EVENT_BOUNDS]] as const){const p=layout[key];assert.ok(p.x>=left && p.y>=600);assert.ok(p.x+bounds.width*p.scale<=1920-right+.0001);assert.ok(p.y+bounds.height*p.scale<=780+.0001);}
  }
  assert.equal(normalizeSpectatorSettings({manualGold:{blue:0,red:0}}).manualGold,undefined);
  const ws1=await socket(base!.replace('http','ws')), ws2=await socket('ws://127.0.0.1:5175/ws');const messages:any[]=[];
  ws1.on('message',data=>messages.push(JSON.parse(data.toString())));ws2.on('message',data=>messages.push(JSON.parse(data.toString())));
  const layout=normalizeLayout({safeZones:{left:360,right:340,top:150,bottom:0},scoreboard:{x:550,y:160,scale:.9},event:{x:700,y:300,scale:.85}});
  const settings=normalizeSpectatorSettings({mode:'hybrid',round:'UPPER BRACKET FINAL',layouts:{hybrid:layout},presets:[{id:'observer-a',name:'Observer A',mode:'hybrid',layout}]});
  await request('overlay/controls',{spectatorSettings:settings});assert.deepEqual((await request('state')).overlayControls.spectatorSettings,settings);
  const db=new DatabaseSync('D:/MLBB/data/hybrid-test/mark47.db',{readOnly:true});const row=db.prepare("SELECT data_json FROM production_settings WHERE key='spectator-overlay'").get() as any;assert.equal(JSON.parse(row.data_json).presets[0].name,'Observer A');db.close();
  await request('match/next-game',{});let state=await request('state');assert.equal(state.overlayControls.spectatorSettings.round,'UPPER BRACKET FINAL');
  const first=await request('events/kill',{team:'blue'});assert.equal(first.success,true);state=await request('state');assert.equal(state.events[0].isFirstBlood,true);assert.equal(state.teamBlue.kills,1);
  const duplicate=await request('events/kill',{team:'blue'});assert.equal(duplicate.duplicate,true);assert.equal((await request('state')).teamBlue.kills,1);
  await request('events/undo',{});assert.equal((await request('state')).teamBlue.kills,0);
  await request('events/kill',{team:'blue'});assert.equal((await request('state')).events[0].isFirstBlood,true);
  await request('events/special',{team:'red',specialType:'double_kill'});const duplicateSpecial=await request('events/special',{team:'red',specialType:'double_kill'});assert.equal(duplicateSpecial.duplicate,true);
  const before=await request('state');await request('events/special',{team:'blue',specialType:'first_blood',announcementOnly:true});assert.equal((await request('state')).teamBlue.kills,before.teamBlue.kills);await request('events/undo',{});assert.equal((await request('state')).teamBlue.kills,before.teamBlue.kills);
  for(const specialType of ['turtle_secured','lord_secured','lord_steal']){
    const prior=await request('state');await request('events/special',{team:'blue',specialType,killerHero:{id:'test',name:'Test',avatar:''}});const current=await request('state');const key=specialType.startsWith('turtle')?'turtle':'lord';assert.equal(current.teamBlue.objectives[key],(prior.teamBlue.objectives[key]||0)+1);await request('events/undo',{});const restored=await request('state');assert.equal(restored.teamBlue.objectives[key]||0,prior.teamBlue.objectives[key]||0);assert.equal(restored.teamBlue.kills,prior.teamBlue.kills);
  }
  await request('overlay/controls',{spectatorSettings:{...settings,mode:'custom',manualGold:{blue:32500,red:31000}}});await request('match/next-game',{});state=await request('state');assert.equal(state.overlayControls.spectatorSettings.manualGold,undefined);assert.equal(state.overlayControls.hudPlayers,undefined);
  await request('overlay/controls',{spectatorSettings:settings});
  const event=(id:string,specialType='double_kill')=>({id,matchId:'test',game:'mlbb',team:'blue',type:'special',specialType} as MatchEvent);
  let queue=eventQueueReducer(emptyEventQueue,{type:'enqueue',entries:['a','b','c'].map(id=>({key:id,event:event(id)}))});assert.equal(queue.active?.key,'a');assert.equal(queue.pending.length,2);
  queue=eventQueueReducer(queue,{type:'finish',key:'wrong'});assert.equal(queue.active?.key,'a');queue=eventQueueReducer(queue,{type:'finish',key:'a'});assert.equal(queue.active?.key,'b');queue=eventQueueReducer(queue,{type:'retain',ids:new Set(['c'])});assert.equal(queue.active?.key,'c');
  queue=eventQueueReducer(queue,{type:'enqueue',entries:[{key:'victory',event:event('victory','victory')}]});assert.equal(queue.active?.key,'victory');assert.equal(queue.pending.length,0);
  queue=eventQueueReducer(queue,{type:'clear'});assert.equal(queue.active,null);
  queue=eventQueueReducer(emptyEventQueue,{type:'enqueue',entries:Array.from({length:100},(_,i)=>({key:String(i),event:event(String(i))}))});assert.ok(queue.pending.length<=20);
  await new Promise(resolve=>setTimeout(resolve,150));assert.ok(messages.filter(m=>m.type==='STATE_UPDATE' && m.payload.overlayControls.spectatorSettings.round==='UPPER BRACKET FINAL').length>=2);
  console.log('PASS: safe-zone bounds, defaults/no gold, persistence/presets, two WebSocket clients including proxy, automatic First Blood, duplicate suppression, announcement corrections/undo, objectives with killer metadata/undo, game reset, FIFO queue, stale timers, Victory priority and bounded backlog.');
} finally { sockets.forEach(ws=>ws.close()); }
