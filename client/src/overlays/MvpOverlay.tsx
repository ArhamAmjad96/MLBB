import { useEffect, useState } from 'react';
import { useMatchState } from '../hooks/useMatchState';
import { normalizeSpectatorSettings } from '../../../shared/overlayLayout';
import { SpectatorEvent } from './SpectatorScene';
import { Crest } from './Broadcast';
import { useBroadcastReady } from './useBroadcastReady';
import type { MatchEvent } from '../../../shared/types';
export function MvpOverlay() {
  const {state}=useMatchState(), ready=useBroadcastReady();
  const [active,setActive]=useState<string|null>(null);
  const presentation=state?.overlayControls.mvpPresentation;
  const clear=state?.overlayControls.eventClearToken;
  const presentationNonce=presentation?.nonce, requestedAt=presentation?.requestedAt;
  const duration=Math.min(4,Math.max(2,state?.overlayControls.eventHoldSeconds || 3));
  useEffect(()=>{
    if(!presentationNonce || requestedAt===undefined || Date.now()-requestedAt>duration*1000)return;
    setActive(presentationNonce);
    const timer=setTimeout(()=>setActive(null),Math.max(0,duration*1000-(Date.now()-requestedAt)));
    return ()=>clearTimeout(timer);
  },[presentationNonce,requestedAt,duration]);
  useEffect(()=>setActive(null),[clear]);
  const mvp=state?.overlayControls.mvpData;
  if(!state || !ready || !mvp)return <div className="overlay-canvas broadcast"/>;
  const preview=new URLSearchParams(location.search).get('preview')==='true';
  if(!state.overlayControls.showMvp && !preview)return <div className="overlay-canvas broadcast"/>;
  const settings=normalizeSpectatorSettings(state.overlayControls.spectatorSettings);
  if(state.game==='mlbb' && settings.mode==='hybrid'){
    const event:MatchEvent={id:presentation?.nonce || 'mvp',matchId:state.id,game:state.game,team:mvp.team.teamId===state.teamBlue.teamId?'blue':'red',type:'announcement',specialType:'mvp',gameTimeSeconds:state.clockSeconds,realTimestamp:presentation?.requestedAt || 0,headline:'MVP',killerHero:{...mvp.hero,playerName:mvp.player.inGameName}};
    return <div className="overlay-canvas broadcast">{(active || preview) && <SpectatorEvent state={state} event={event} entryKey={active || 'mvp-preview'} duration={duration}/>}</div>;
  }
  return <div className="overlay-canvas broadcast"><div className="mvp-card"><Crest kind="mvp"/><h1>MATCH MVP</h1><img src={mvp.hero.avatar} alt={mvp.hero.name}/><h2>{mvp.player.inGameName}</h2><b>{mvp.team.name} · {mvp.hero.name}</b><p>K / D / A {mvp.kda}</p><p>Gold share {mvp.goldShare} · Damage share {mvp.damageShare}</p><small>{mvp.notes}</small></div></div>;
}
