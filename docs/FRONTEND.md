# PONG AI — Frontend Architecture & Design System

The `frontend/` directory is an independent, modular React/TypeScript application designed around a **minimal neo-brutalist arcade** aesthetic. It combines the structured bento card layout of modern architectural galleries with high-contrast, playful arcade energy.

---

## 1. Design System & Tokens

Defined in `frontend/src/styles/tokens.css` and `frontend/src/styles/globals.css`.

### Color Palette

| Token | Hex | Role | Usage |
| :--- | :--- | :--- | :--- |
| `--color-ink` | `#111111` | Primary Text & Borders | Structural borders (2-3px), titles, high-contrast badges |
| `--color-mint` | `#62F5AD` | Brand & Primary Action | Hero banners, primary CTA buttons ("PLAY NOW ↗"), positive indicators |
| `--color-lime` | `#D9FF55` | Accent & Energy | Highlight tags, fast difficulty badges, telemetry peaks |
| `--color-lavender` | `#BDA5FF` | Secondary Surface | Bento cards, secondary action buttons, coach drill badges |
| `--color-cream` | `#FFFDF6` | Background Tone | Warm canvas background, card interiors |
| `--color-white` | `#FFFFFF` | Neutral Pure Surface | High-contrast data panels, scoreboard overlays |

### Neo-Brutalist Geometry & Shadows

- **Borders**: Clean `2px` or `3px solid var(--color-ink)`.
- **Corner Radii**: Compact `0.25rem` to `0.75rem` (`rounded-lg` / `rounded-xl`).
- **Offset Shadows**: Hard, unblurred shadows:
  - Default: `box-shadow: 4px 4px 0px #111111;`
  - Large / Hero: `box-shadow: 8px 8px 0px #111111;`
  - Small / Button: `box-shadow: 2px 2px 0px #111111;`
  - Active / Pressed: `transform: translate(2px, 2px); box-shadow: 0px 0px 0px #111111;`

---

## 2. Component Hierarchy

```
frontend/src/
├── app/
│   ├── App.tsx          # Root container with routing and global layout
│   ├── router.tsx       # Route definitions for all 6 pages
│   └── providers.tsx    # Global providers
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx   # Neo-brutalist nav with live backend/AI indicator
│   │   └── Footer.tsx   # Minimal footer with architecture & ITTF links
│   ├── ui/
│   │   ├── Button.tsx   # Tactile neo-brutalist button with variants
│   │   ├── Card.tsx     # Bento card with solid border and offset shadow
│   │   ├── Badge.tsx    # High-contrast categorical tags
│   │   ├── Modal.tsx    # Accessible dialog with brutalist styling
│   │   ├── StatusIndicator.tsx # Live pulse indicator for health states
│   │   └── PageHeader.tsx      # Punchy oversized page header
│   ├── game/
│   │   ├── Scene.tsx    # Three.js Canvas container
│   │   ├── Table.tsx    # ITTF regulation 2.74m x 1.525m table & net
│   │   ├── Ball.tsx     # 40mm celluloid ball with trail effect
│   │   ├── Paddle.tsx   # Red/black rubber blade with tactile handle
│   │   ├── Arena.tsx    # Court floor, court boundary tape, lighting
│   │   └── Scoreboard.tsx # Clean scoreboard HUD
│   └── gesture/
│       └── GestureVisualizer.tsx # Landmark skeleton & calibration overlay
```

---

## 3. Application Routes

| Route | View Component | Description |
| :--- | :--- | :--- |
| `/` | `HomePage` | Mint-green hero, bento cards, 3D interactive table preview, technology strip |
| `/play` | `GamePage` (Setup) | Difficulty selector, controller selector (Hand Gesture vs Keyboard), match launcher |
| `/game` | `GamePage` (Arena) | Live 3D gameplay powered by `TableTennisEngine`, live scoreboard, pause/exit HUD |
| `/gesture-lab`| `GestureLabPage` | MediaPipe testing sandbox with **No-Camera Synthetic Dry-Run**, coordinate telemetry, and report export |
| `/dashboard` | `DashboardPage` | Match history, return success rates, reaction times, court placement zone heatmap, and telemetry exporter |
| `/coach` | `CoachPage` | Gemma 4 AI coaching analysis, observations, weaknesses hypothesis, and ITTF rule citations |
| `/architecture`| `ArchitecturePage`| Real **Graphify AST codebase visualizer** with module clusters, node inspection, and GRAPH_REPORT.md viewer |

---

## 4. Backend & AI Integration

The frontend reads configuration from `.env` or defaults safely to local services:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
VITE_AI_API_BASE_URL=http://localhost:8000
```

- **Resilience**: If the Node server, Ollama, or Python AI orchestrator are unreachable, the UI remains 100% interactive using deterministic fallback models and pre-seeded demo telemetry.
- **Authoritative Engine**: Game physics are managed by the standalone `game-engine` package at 120Hz sub-stepping, preventing React state jitter.
