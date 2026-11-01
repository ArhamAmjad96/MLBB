import type { OverlayPlacement, SpectatorLayout, SpectatorMode, SpectatorOverlaySettings } from './types.js';

export const OUTPUT = { width: 1920, height: 1080 };
export const SCOREBOARD = { width: 880, height: 108 };
export const EVENT_BOUNDS = { width: 626, height: 240 };
const record = (value: unknown): Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const number = (value: unknown, fallback: number, min: number, max: number) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

export function defaultLayout(mode: SpectatorMode = 'hybrid'): SpectatorLayout {
  return { safeZones: { left: mode === 'hybrid' ? 320 : 0, right: mode === 'hybrid' ? 320 : 0, top: mode === 'hybrid' ? 140 : 0, bottom: 0 },
    scoreboard: { x: 520, y: mode === 'hybrid' ? 150 : 16, scale: 1 }, event: { x: 647, y: 280, scale: 1 } };
}

/** The same bounded 1080p geometry is used by the editor, server and browser sources. */
export function normalizeLayout(value: unknown, mode: SpectatorMode = 'hybrid'): SpectatorLayout {
  const raw = record(value), defaults = defaultLayout(mode), zones = record(raw.safeZones);
  const safeZones = { left: number(zones.left, defaults.safeZones.left, 0, 800), right: number(zones.right, defaults.safeZones.right, 0, 800), top: number(zones.top, defaults.safeZones.top, 0, 600), bottom: number(zones.bottom, 0, 0, 300) };
  const availableWidth = OUTPUT.width - safeZones.left - safeZones.right;
  const availableHeight = OUTPUT.height - safeZones.top - safeZones.bottom;
  function place(value: unknown, fallback: OverlayPlacement, bounds: {width:number;height:number}): OverlayPlacement {
    const input = record(value);
    const scale = Math.min(number(input.scale, fallback.scale, .35, 1.5), availableWidth / bounds.width, availableHeight / bounds.height);
    return { x: number(input.x, Math.max(safeZones.left, Math.min(fallback.x, OUTPUT.width-safeZones.right-bounds.width*scale)), safeZones.left, OUTPUT.width-safeZones.right-bounds.width*scale),
      y: number(input.y, Math.max(safeZones.top, Math.min(fallback.y, OUTPUT.height-safeZones.bottom-bounds.height*scale)), safeZones.top, OUTPUT.height-safeZones.bottom-bounds.height*scale), scale };
  }
  return { safeZones, scoreboard: place(raw.scoreboard, defaults.scoreboard, SCOREBOARD), event: place(raw.event, defaults.event, EVENT_BOUNDS) };
}

export function normalizeSpectatorSettings(value?: unknown): SpectatorOverlaySettings {
  const raw = record(value), layouts = record(raw.layouts), gold = record(raw.manualGold);
  const mode = raw.mode === 'custom' ? 'custom' : 'hybrid';
  const seen = new Set<string>();
  const presets = (Array.isArray(raw.presets) ? raw.presets : []).slice(0,12).flatMap(value => {
    const preset=record(value), id=typeof preset.id==='string'?preset.id.slice(0,64):'', name=typeof preset.name==='string'?preset.name.trim().slice(0,50):'';
    if(!id || !name || seen.has(id))return []; seen.add(id);
    const mode:SpectatorMode=preset.mode==='custom'?'custom':'hybrid';return [{id,name,mode,layout:normalizeLayout(preset.layout,mode)}];
  });
  return { mode, layouts:{hybrid:normalizeLayout(layouts.hybrid,'hybrid'),custom:normalizeLayout(layouts.custom,'custom')},
    round:typeof raw.round==='string'?raw.round.trim().slice(0,80):'', showKills:raw.showKills===true, showClock:raw.showClock===true, showObjectives:raw.showObjectives===true,
    showPlayerPanels:raw.showPlayerPanels!==false,
    ...(typeof gold.blue==='number' && gold.blue>0 && Number.isFinite(gold.blue) && typeof gold.red==='number' && gold.red>0 && Number.isFinite(gold.red)?{manualGold:{blue:Math.min(1000000,gold.blue),red:Math.min(1000000,gold.red)}}:{}), presets };
}
