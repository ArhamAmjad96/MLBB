import { useEffect, useState } from 'react';
import { DRAFT_ART, HUD_ART } from './referenceAssets';

let loading: Promise<void> | undefined;
function prepareAssets() {
  if (!loading) {
    const images = [DRAFT_ART, HUD_ART].map(src => {
      const image = new Image();
      image.src = src;
      return image.decode();
    });
    loading = Promise.all([
      ...images,
      document.fonts.load('500 30px "Broadcast Teko"'),
      document.fonts.load('700 20px "Broadcast Barlow"'),
    ]).then(() => undefined).catch(() => undefined);
  }
  return loading;
}

/** Keep the browser source transparent until the local skin and display fonts are ready. */
export function useBroadcastReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    void prepareAssets().then(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);
  return ready;
}
