# Gesture Pong AI 🏓🤖
### 3D Webcam-Controlled Table Tennis Game with Gemma 4, Ollama, MediaPipe, and Graphify

A playable 3D arcade table-tennis game where you control an in-game racket using real-time webcam hand gestures, coached dynamically by a locally hosted **Google Gemma 4** model through **Ollama**, featuring full performance analytics and repository intelligence powered by **Graphify**.

---

## 🌟 Key Capabilities

1. **Real-time Computer Vision Control**:
   - MediaPipe Hand Landmarker tracking 21 3D joints at 60 FPS in the browser.
   - Frequency-adaptive **One Euro Filter** for zero micro-jitter at rest and zero lag during fast swings.
   - 5-step guided calibration with boundary mapping and coordinate mirroring.
   - Zero keyboard dependency for normal racket movement (with full keyboard/mouse fallbacks: `[WASD / Arrow Keys]` + `[Space]` to serve).

2. **Playable 3D Physics & Esports Arena**:
   - Continuous collision detection (CCD) with 4-substep physics simulation preventing ball tunneling.
   - Authentic table tennis bounce restitution, paddle deflection angles, and net collision dynamics.
   - Deterministic AI opponent with adaptive difficulty tiers (*Easy*, *Medium*, *Hard*).
   - Stylized dark esports arena with dynamic Three.js lighting, shadows, and motion trajectory trails.

3. **Local Gemma 4 AI Coach via Ollama**:
   - Powered locally by `gemma4:e2b` running via Apple MLX metal acceleration on `localhost:11434`.
   - Dynamic real-time mission generation grounded strictly in measured player statistics.
   - Zod schema-validated responses with graceful fallback handling if offline or timed out.
   - Post-match tactical debrief with measured strengths, weaknesses, and training advice.

4. **Performance Analytics Dashboard**:
   - Event-driven tracking of rallies, return accuracy, measured reaction times (ms), and zone placement heatmaps (Left, Center, Right).
   - Session history stored locally with career win rates and personal records.

5. **Graphify Repository Intelligence**:
   - AST-extracted knowledge graph with 300 nodes, 555 edges, and 18 communities.
   - Verified dependency queries and path tracing between vision, physics, and AI modules.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on v24.13.0)
- **Ollama**: Running with `gemma4:e2b` installed (`ollama run gemma4:e2b`)
- **Webcam**: Standard built-in or USB webcam

### 2. Install & Start
```bash
# Install dependencies
npm install
npm install --prefix server
npm install --prefix client

# Start both backend and frontend concurrently
npm run dev
```

Visit **`http://localhost:5173`** in Google Chrome.

---

## 🧪 Testing & Verification

Run the entire automated unit and integration test suite:
```bash
npm run test
```
- **Backend tests**: Schema validation, fallback missions, prompt generation, Ollama HTTP integration.
- **Frontend tests**: Continuous collision sub-stepping, One Euro smoothing filter, boundary calibration mapping, gesture detection.

Build production bundles:
```bash
npm run build
```

---

## 📊 Graphify Developer Intelligence

Generate and query the repository graph:
```bash
# Extract graph
graphify extract . --code-only

# Query architecture
graphify query "hand tracking racket movement"
graphify path "VisionPipeline" "TableTennisEngine" --undirected

# View interactive D3 graph in browser
open graphify-out/graph.html
```

---

## 📁 Repository Structure

```text
gesture-pong-ai/
├── client/                     # Vite + React + Three.js + R3F Frontend
│   ├── src/
│   │   ├── components/         # HUD, Camera Overlay, Modals (Menu, Summary, Analytics)
│   │   ├── game/               # 3D Entities (Table, Ball, Paddle, Arena), Scene, Physics
│   │   ├── vision/             # MediaPipe Landmarker, Calibration, One Euro Smoothing
│   │   ├── services/           # Web Audio Synthesizer, Coach API Client, Storage
│   │   └── types/              # Game settings and client interfaces
│   └── tests/                  # Physics, Smoothing, Calibration unit tests
├── server/                     # Express + TypeScript + Ollama Backend
│   ├── src/
│   │   ├── coach/              # Zod schemas, prompts, fallback missions, tests
│   │   ├── routes/             # Coach and health endpoints
│   │   └── services/           # Ollama HTTP API client
│   └── dist/                   # Compiled backend output
├── shared/                     # Shared TypeScript types between client and server
├── docs/                       # ARCHITECTURE, SETUP, GRAPHIFY, ASSETS, DEMO_SCRIPT
├── graphify-out/               # Knowledge graph artifacts (graph.json, graph.html, report)
├── package.json                # Monorepo scripts (dev, test, build)
└── README.md
```

---

## 📜 Documentation Links
- [Architecture & Design Details](file:///Users/sukrutdusane/Documents/Projects%20/Sy/pong/docs/ARCHITECTURE.md)
- [Setup & Troubleshooting](file:///Users/sukrutdusane/Documents/Projects%20/Sy/pong/docs/SETUP.md)
- [Graphify Verification Report](file:///Users/sukrutdusane/Documents/Projects%20/Sy/pong/docs/GRAPHIFY.md)
- [Asset Discovery & Audio Synthesis](file:///Users/sukrutdusane/Documents/Projects%20/Sy/pong/docs/ASSETS.md)
- [Demonstration Script](file:///Users/sukrutdusane/Documents/Projects%20/Sy/pong/docs/DEMO_SCRIPT.md)

---

## ⚖️ License
MIT License. Procedural geometry and procedural Web Audio synthesizers built specifically for Gesture Pong AI.
