> MLBB now defaults to Hybrid Spectator Mode. See [HYBRID_SPECTATOR.md](HYBRID_SPECTATOR.md) for current HUD, safe-zone editor, modes and tests. Draft/branding URLs remain unchanged.

# MARK47 broadcast overlays

Run `npm run dev` from D:\MLBB. Operator dashboard: http://localhost:5173. Broadcast desk: `/overlays`.

Existing browser-source URLs are preserved: `/overlay/hud`, `/overlay/feed`, `/overlay/draft`, `/overlay/mvp`. Set each OBS/vMix browser source to 1920 × 1080. All four pages have transparent html/body/root/canvas backgrounds. Keep gameplay/camera sources underneath. No gameplay background is embedded.

Copied URLs obey show/hide and emergency blackout. `?preview=true` bypasses show/hide for HUD, draft and MVP review only; never use preview URLs on air. Event previews are local to the broadcast desk and do not alter scores. Replay latest graphic also does not alter scores. Log event uses the existing engine, including kill increments, objective counters, duplicate suppression and undo. Victory ends the game and updates its series score. Use Live Match controls for individual kills and end-game operations.

Event controls support 2–4 second durations, replay, and immediate clear. Events queue with a bounded backlog; Victory interrupts the queue. Hidden event sources discard incoming announcements. Cleared and undone events are evicted. Old replay requests are ignored after reconnect. Animations use CSS transforms/opacity and run only while graphics are visible.

Draft: five picks and five bans per side, coach names (edit in Broadcast desk), operator-entered player names, selected hero avatars, series scores, current team/action, paused/running countdown and central tournament identity. Existing phase order, draft undo and timer engine remain intact. Genuine repository hero artwork is used through draft state. Most-picked/win-rate, player level, spell artwork, and KDA panels use the optional operator-entered data in Broadcast desk; empty values remain unknown. MVP requires selecting a drafted player and entering KDA; optional share fields remain blank/unknown until entered. No fallback professional player or invented stats are displayed.

On another broadcast computer, replace localhost with this machine’s LAN address. LAN browser sources reach frontend port 5173; the frontend proxies API and WebSocket traffic to the backend. Use HTTP on the trusted local network with the existing server configuration. Broadcast fonts are bundled locally (Teko and Barlow Condensed) with system fallbacks. Team logos use configured team assets. Event emblems use the supplied approved artwork; additional events use matching general SVG iconography.

## Verification

- Client production build and server TypeScript build.
- Existing production-flow simulation (draft validation, duplicate suppression, scoring, undo, lifecycle, preview/take, next game).
- `test_broadcast.mjs`: assertion-based event scoring/undo, coach names, replay without scoring, synchronized clear/blackout WebSocket delivery, Victory scoring/undo, all 20 draft phases, draft undo/re-lock, and timer pause/resume.
- Browser inspection at 1920 × 1080: canvas size, transparent backgrounds, ten picks and ten bans, local preview and staged CSS animation styles.
- Native OBS transparency was verified during the Hybrid upgrade; native vMix verification remains unavailable.

Tests mutate match state. Run against an isolated backend, never a live production match. In a separate PowerShell terminal:

```powershell
$env:MARK47_DATA_DIR='D:\MLBB\data\broadcast-test'
npm run dev --prefix server
```

Then, in another terminal:

```powershell
node test_production_simulation.mjs
$env:MARK47_BROADCAST_TEST='1'
node test_broadcast.mjs
```

Stop the test backend before starting the normal backend. The default data directory is unchanged; the environment variable selects a separate test database.

## Approved-artwork rebuild

The draft and HUD now reuse the supplied First Blood artwork as clipped, local skin layers. Crests, silhouettes, decorative gold borders, purple folds and Victory wings come from the approved references. Scores, team logos/names, player names, countdowns, ban/pick artwork, KDA and objective data are independent React layers. Ribbons split the icon, panel, ivory tail and text into separate animated parts. Fonts are bundled locally (Teko and Barlow Condensed, with their OFL licenses).

In Broadcast desk, expand **Hero statistics and HUD data** to enter most-picked counts/win rates, the draft stage label, player KDA/levels, and spell asset URLs. Unknown values are not manufactured. The most-picked panel is hidden until data is entered.

The **Review approved layout (sample data)** links open `?preview=true&reference=true&backdrop=reference`. These deliberately use the sample values from the supplied images and an illustrative reference feed, for visual review only. They never write those values to match state. The feed page shows the complete approved event sheet for comparison. On-air URLs must have none of these query parameters; they use the real match state and leave the feed/minimap regions transparent.

## Editable event identity and sponsors

Open `/overlays` → **Event branding & sponsors**. Set the event title/subtitle and optional logo, then the two sponsor names/subtitles/logos. Click **Save branding**. Leaving the event title empty uses the current tournament name. Leaving sponsors empty removes the reference sponsors. PNG, JPEG, WebP and SVG logo uploads up to 400 KB each are stored with the match overlay settings; image URLs are also supported. Changes synchronize to both draft branding positions and to the draft/HUD sponsor areas via the existing WebSocket state. Hero portraits use `object-fit: contain` inside the original 121 × 216 native-pixel cards, displaying the full square source image without resizing the cards.
