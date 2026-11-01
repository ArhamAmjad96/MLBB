# MARK47 Hybrid MLBB spectator overlay

The normal MLBB `/overlay/hud` now defaults to Hybrid. It preserves the existing black/gold/ivory/purple identity while removing the custom player-stat sidebars, minimap decoration and custom live gold. It displays team logos/codes, series score, game number, format and an optional round. Operator-tracked kills, clock and objectives are opt-in and off by default. No MLBB API, OCR or estimated gold is used.

## Operator workflow

1. Run `npm run dev` from `D:\MLBB`, then open http://localhost:5173/overlays.
2. Find **Overlay Settings · MLBB Spectator** below Event branding & sponsors.
3. Keep **Hybrid MLBB — native statistics** selected.
4. Upload an actual spectator screenshot. This image stays in the current browser; it is never sent to the backend or inserted into an on-air source.
5. Adjust the reserved left/right/top/bottom margins. Drag the scoreboard/event handles or use their X/Y/scale fields. Graphics are constrained and clipped to the remaining clear area.
6. Set the optional round. Only enable tracked statistics if you actually maintain them and the native feed does not already show them.
7. Click **Apply overlay settings**, or enter a name and use **Save preset & apply**. Saved layouts and up to twelve presets are stored in SQLite's `production_settings` table, survive restarts, and are retained across matches. Hybrid and Full Custom each retain a separate layout.
8. **Reset layout to defaults** changes the local preview; Apply to take that reset on air. **Reload saved settings** discards local layout edits. A saved preset loads into the local preview before Apply.
9. Preview animations locally using the event/team selector and Replay local animation. These controls do not log scoring events. The on-air show/hide buttons and copied URLs use existing broadcast controls.

Default Hybrid reserved margins are 320 px left/right and 140 px top. The compact 880 × 108 scoreboard starts at (520, 150); event bounds are 626 × 240 at (647, 280). These are configurable starting points. The actual native spectator screenshot mentioned in the request was not attached, so these defaults have not been calibrated against that exact feed.

## Full Custom

Choose Full Custom only for a feed where MARK47 should supply player panels. A custom row requires a drafted hero and an operator-entered numeric K/D/A. Unknown rows and levels are omitted. Optional manual gold requires positive totals for both teams; zero/unknown gold is omitted. It is labelled MANUAL GOLD and is never shown in Hybrid. Gold snapshots and player/MVP data reset between games; verified gold is not stored as a reusable global layout preference.

Existing **Hero statistics and HUD data** controls supply optional custom KDA, levels and spell assets. Branding/sponsor controls remain available. Sponsors, when configured, fit inside the compact scoreboard's lower strip. Draft graphics and draft phase order are unchanged.

## Events, corrections and MVP

The existing Live Match controls still record kills (with killer/victim), neutral objectives, towers, steals, multikills and the winner. The first regular kill is automatically First Blood. Duplicate-click suppression also covers the transition from zero to one kill and special-event buttons. Victory cannot end an already-ended game twice.

In Broadcast desk, **Announcement only (no score changes)** supports corrections when the kill/objective was already logged or a call was missed. Undoing an announcement does not alter scores. Regular scored events still support undo. Objective undo uses the event type even when killer metadata is attached.

Events play sequentially through a bounded queue, with Victory interrupting the backlog. Duration is 2–4 seconds. Undo and Clear remove active/queued graphics; refreshing a source does not replay old match-history events. Replay latest graphic uses an explicit request and never increments scores.

Take MVP on air after entering actual player/KDA information. In Hybrid, `/overlay/mvp` uses a small symbolic announcement in the configured event safe zone, without a large character portrait. Full Custom retains the existing detailed MVP card. MVP special announcements are rejected until MVP information exists.

## OBS / vMix / LAN

Existing URLs remain `/overlay/hud`, `/overlay/feed`, `/overlay/draft`, `/overlay/mvp`. Browser sources remain 1920 × 1080 with transparent html/body/root/canvas backgrounds. Do not use reference/sample query parameters on air. The uploaded calibration image and editor guides never appear in these sources.

API and WebSocket traffic use the frontend's same-origin proxy (`/api`, `/ws`). A LAN browser source uses the frontend machine's hostname or LAN address and port; no machine IP is hardcoded. The default backend remains port 3001. Direct existing backend WebSocket integrations remain supported. vMix was not available for native application verification.

## Verification performed

- Client production build, server TypeScript build and targeted lint.
- Geometry assertions across combinations of margins/scales, including clamping at every safe boundary.
- SQLite preferences/preset persistence, retained layouts across new games, and browser recovery after an isolated backend restart.
- Two connected WebSocket clients, including the frontend `/ws` proxy.
- First Blood detection, direct/special duplicate-click suppression, announcement corrections/undo, objective undo with killer metadata, and reset of stale game-specific values.
- FIFO event reducer, bounded backlog, undo retention, stale timeout rejection and Victory priority.
- Existing full broadcast regression: ten event variants, scoring/undo, all twenty draft phases, draft undo/re-lock and timer pause/resume.
- Browser: screenshot upload, drag controls, preset save, Hybrid with zero custom player rows/gold, Full Custom with one complete row, manual-gold opt-in, symbolic MVP, event placement, transparent 1920 × 1080 output and no stale banners on refresh.
- Native OBS: the existing MARK47 TEST scene rendered the new scoreboard over its gray Color source with transparent side/player areas. No existing source was changed and no stream/recording was started.

## Isolated regression commands

Never run scoring tests against a live match. Use separate PowerShell terminals:

```powershell
$env:MARK47_DATA_DIR='D:\MLBB\data\hybrid-test'
$env:MARK47_PORT='3101'
npm run dev --prefix server
```

```powershell
$env:MARK47_BACKEND_PORT='3101'
npm run dev --prefix client -- --port 5175
```

```powershell
$env:MARK47_TEST_BASE_URL='http://127.0.0.1:3101'
node server/node_modules/tsx/dist/cli.mjs test_hybrid_overlay.mts
$env:MARK47_BROADCAST_TEST='1'
node test_broadcast.mjs
```

The standard `npm run dev` uses ports 5173/3001 when these test variables are absent. Tests use their own ignored database directory. Build checks: `npm run build --prefix client` and `npm run build --prefix server`.
