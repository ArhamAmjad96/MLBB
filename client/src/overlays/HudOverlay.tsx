import { useMatchState } from '../hooks/useMatchState';
import { useBroadcastReady } from './useBroadcastReady';
import { isReferencePreview } from './referenceAssets';
import { LegacyHudOverlay } from './LegacyHud';
import { SpectatorHud } from './SpectatorScene';

export function HudOverlay() {
  const {state}=useMatchState();
  const ready=useBroadcastReady();
  if(!state || !ready)return null;
  if(state.game!=='mlbb' || isReferencePreview())return <LegacyHudOverlay/>;
  return <SpectatorHud state={state} forceVisible={new URLSearchParams(location.search).get('preview')==='true'}/>;
}
