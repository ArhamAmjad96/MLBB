# MARK47 • Multi-Game Esports Production System
### Mobile Legends: Bang Bang (MLBB) + Honor of Kings (HOK) — Version 2.0

MARK47 is a local-first, broadcast-ready esports production platform for tournament operators and streamers running competitive **MLBB** and **HOK**. It provides real-time operator control, draft pick/ban management, event sourcing (kills, economy, neutral objectives), one-click undo rollback, and 1920×1080 transparent browser overlays for **OBS Studio** and **vMix**.

---

## ⚡ Quick Start

### 1. Launch Both Server & Client
From the project root:
```bash
npm run dev
```
- **Operator Control Desk**: [http://localhost:5173](http://localhost:5173)
- **Backend State Hub**: [http://localhost:3001](http://localhost:3001)
- **Real-Time WebSocket Stream**: `ws://localhost:3001`

---

## 🎮 Core System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │               MARK47 Operator Dashboard               │
                    │      (React + TypeScript + Tailwind CSS + Lucide)      │
                    └──────────────────────────┬─────────────────────────────┘
                                               │ REST API & WebSockets (<10ms)
                                               ▼
                    ┌────────────────────────────────────────────────────────┐
                    │             Node.js + Express State Hub                │
                    │   - Match State Engine (Event Sourcing / Timeline)     │
                    │   - Native node:sqlite Persistence (Local-First)       │
                    │   - MLBB (10-Ban Split) & HOK (KPL 4-Ban) Registries   │
                    │   - WebSocket Broadcaster for Overlays                 │
                    └──────────────────────────┬─────────────────────────────┘
                                               │ WebSockets (Real-time Broadcast)
                                               ▼
                    ┌────────────────────────────────────────────────────────┐
                    │           OBS Studio / vMix Browser Overlays           │
                    │           (1920x1080 Transparent Viewports)            │
                    │  - /overlay/hud     - /overlay/draft   - /overlay/feed │
                    │  - /overlay/mvp     - /overlay/intro                   │
                    └────────────────────────────────────────────────────────┘
```

---

## 📺 OBS Studio & vMix Browser Source URLs

Add each of these as a **Browser Source** in OBS Studio:
- **Canvas Dimensions**: Width = `1920`, Height = `1080`
- **FPS**: `60`
- **Shutdown source when not visible**: Unchecked (maintains instant sub-10ms WebSocket sync)

| Overlay Name | OBS URL | Description |
| :--- | :--- | :--- |
| **Scoreboard HUD** | `http://localhost:5173/overlay/hud` | Top bar displaying team names, logos, series points, kills, clock, gold, towers, and Lord/Turtle (MLBB) or Tyrant/Overlord (HOK). |
| **Draft Pick/Ban** | `http://localhost:5173/overlay/draft` | Full 1080p pick/ban broadcast view with live phase highlights, bans footer, center countdown clock, and hero artwork. |
| **Kill Feed** | `http://localhost:5173/overlay/feed` | Top-right transparent popup notifications for kills, multikills (Double, Triple, Savage, Wipeout), and objective steals. |
| **MVP Spotlight** | `http://localhost:5173/overlay/mvp` | Post-match analysis card showcasing the MVP player portrait, IGN, hero, KDA, gold share, and commentary. |

---

## 🎯 Game-Specific Configurations

### Mobile Legends: Bang Bang (MLBB)
- **Roles**: EXP, MID, GOLD, ROAM, JUNGLE
- **Draft Format**: Official 10-Ban Tournament Split (3 bans phase 1, 3 picks phase 1, 2 bans phase 2, 2 picks phase 2)
- **Neutral Objectives**: Turtle (Shield & Gold buff), Lord (Siege charge)

### Honor of Kings (HOK)
- **Roles**: CLASH, MID, FARM, ROAM, JUNGLE
- **Draft Format**: KPL Standard 4-Ban Tournament Split (2 bans phase 1, 3 picks phase 1, 2 bans phase 2, 2 picks phase 2)
- **Neutral Objectives**: Primal Tyrant (Damage boost), Shadow Overlord (Dragon vanguards), Tempest Dragon (Late-game shield aura)

---

## 🛡️ Production Safety Features
- **Atomic Event Sourcing**: Every kill, tower destruction, and neutral objective is logged as a timestamped event.
- **One-Click UNDO**: Misclicks during high-pressure live production can be reversed instantly with the `UNDO LAST EVENT` button.
- **Data Isolation**: Switching between MLBB and HOK reconfigures the asset libraries, draft phases, and metrics without cross-contaminating match state.
- **Zero API Dependency**: 100% manual operator control ensures flawless broadcast execution without relying on unstable or unauthorized game APIs.
