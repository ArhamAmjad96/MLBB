import type { MatchEvent } from './types.js';
export interface QueuedGraphic { key: string; event: MatchEvent }
export interface EventQueueState { active: QueuedGraphic | null; pending: QueuedGraphic[] }
export type EventQueueAction = {type:'clear'} | {type:'enqueue';entries:QueuedGraphic[]} | {type:'finish';key:string} | {type:'retain';ids:Set<string>};
export const emptyEventQueue:EventQueueState={active:null,pending:[]};
export function eventQueueReducer(state:EventQueueState,action:EventQueueAction):EventQueueState {
  if(action.type==='clear')return emptyEventQueue;
  if(action.type==='enqueue'){
    const known=new Set([state.active?.key,...state.pending.map(e=>e.key)]);
    const fresh=action.entries.filter(e=>{if(known.has(e.key))return false;known.add(e.key);return true;});
    const victory=[...fresh].reverse().find(e=>e.event.isVictory || e.event.specialType==='victory');
    if(victory)return {active:victory,pending:[]};
    const entries=[...state.pending,...fresh].slice(0,20);
    return state.active ? {active:state.active,pending:entries} : {active:entries[0] || null,pending:entries.slice(1)};
  }
  if(action.type==='finish'){
    if(state.active?.key!==action.key)return state;
    return {active:state.pending[0] || null,pending:state.pending.slice(1)};
  }
  const pending=state.pending.filter(e=>action.ids.has(e.event.id));
  return state.active && action.ids.has(state.active.event.id) ? {active:state.active,pending} : {active:pending[0] || null,pending:pending.slice(1)};
}
