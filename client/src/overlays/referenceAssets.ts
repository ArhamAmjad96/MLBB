export const DRAFT_ART = '/broadcast/draft-approved.png';
export const HUD_ART = '/broadcast/hud-approved.png';

export function isReferencePreview() {
  const params = new URLSearchParams(window.location.search);
  return params.get('preview') === 'true' && params.get('reference') === 'true';
}

