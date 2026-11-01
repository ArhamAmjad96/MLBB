import { useEffect, useReducer, useRef } from 'react';
import { useBroadcastReady } from './useBroadcastReady';
import { useMatchState } from '../hooks/useMatchState';
import { eventQueueReducer, emptyEventQueue } from '../../../shared/eventQueue';
import { EventReferenceSheet } from './EventReferenceSheet';
import { isReferencePreview } from './referenceAssets';
import { SpectatorEvent } from './SpectatorScene';

export function KillFeedOverlay() {
  const ready=useBroadcastReady(); const {state}=useMatchState();
  const [queue,dispatch]=useReducer(eventQueueReducer,emptyEventQueue);
  const seen=useRef(new Set<string>()), match=useRef(''), replay=useRef('');
  const events=state?.events, replayRequest=state?.overlayControls.eventReplay;
  const visible=!!state?.overlayControls.showFeed, clear=state?.overlayControls.eventClearToken;
  const matchId=state?.id;
  useEffect(()=>{dispatch({type:'clear'});},[clear,visible,matchId]);
  useEffect(()=>{
    if(!events || !matchId)return;
    if(match.current!==matchId){
      match.current=matchId;seen.current=new Set(events.map(e=>e.id));replay.current=replayRequest?.nonce || '';dispatch({type:'clear'});return;
    }
    const fresh=events.filter(e=>!seen.current.has(e.id) && Date.now()-e.realTimestamp<8000 && e.type!=='gold_sync').reverse();
    events.forEach(e=>seen.current.add(e.id));
    if(seen.current.size>2000)seen.current=new Set(events.map(e=>e.id));
    if(visible && fresh.length)dispatch({type:'enqueue',entries:fresh.map(event=>({key:event.id,event}))});
    if(replayRequest && replayRequest.nonce!==replay.current){
      replay.current=replayRequest.nonce;
      if(visible && replayRequest.requestedAt && Date.now()-replayRequest.requestedAt<8000){
        dispatch({type:'clear'});dispatch({type:'enqueue',entries:[{key:replayRequest.nonce,event:replayRequest.event}]});
      }
    }
    dispatch({type:'retain',ids:new Set(events.map(e=>e.id))});
  },[events,matchId,replayRequest,visible]);
  const duration=Math.min(4,Math.max(2,state?.overlayControls.eventHoldSeconds || 3));
  const key=queue.active?.key;
  useEffect(()=>{if(!key)return;const timer=setTimeout(()=>dispatch({type:'finish',key}),duration*1000);return ()=>clearTimeout(timer);},[key,duration]);
  if(!ready)return null;
  if(isReferencePreview())return <EventReferenceSheet/>;
  return <div className="overlay-canvas broadcast">{visible && queue.active && state && <SpectatorEvent state={state} event={queue.active.event} entryKey={queue.active.key} duration={duration}/>}</div>;
}
