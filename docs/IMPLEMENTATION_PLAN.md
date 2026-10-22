# PONG AI — Frontend Rebuild & Clean Architecture Plan

**Version**: 2.0.0  
**Status**: IN PROGRESS  
**Target Architecture**: Standalone `frontend/` UI + `game-engine/` physics + `server/` multiplayer + `services/ai-orchestrator/` + Graphify visualization.

---

## Roadmap & Milestones

- [ ] **Phase 1: Architecture Modularization & Game Engine Isolation**
  - [ ] Create `game-engine/` with pure deterministic simulation (`TableTennisEngine`), ITTF 2026 rules, and telemetry calculation contracts.
  - [ ] Ensure zero DOM/React coupling in `game-engine/` so it remains independently testable.
  - [ ] Add `game-engine/package.json` and export index.

- [ ] **Phase 2: Dedicated `frontend/` Setup & Neo-Brutalist Design Tokens**
  - [ ] Initialize `frontend/` with Vite + React 19 + TypeScript + Tailwind CSS.
  - [ ] Create `frontend/src/styles/tokens.css` implementing the exact neo-brutalist token palette:
    - **Ink**: `#111111`
    - **Mint**: `#62F5AD`
    - **Lime**: `#D9FF55`
    - **Lavender**: `#BDA5FF`
    - **Cream**: `#FFFDF6`
    - **White**: `#FFFFFF`
    - Borders: 2–3px solid `#111111`, border-radius 12–16px, offset shadows (`3px 3px 0 #111111`).
  - [ ] Create reusable UI components: `Button`, `Card`, `Badge`, `Modal`, `PageHeader`, `StatusIndicator`.

- [ ] **Phase 3: Gesture Feature Pipeline & Synthetic Dry-Run Engine**
  - [ ] Implement `frontend/src/features/gesture/`:
    - `landmark-types.ts`: Normalized coordinates and landmark types.
    - `coordinate-mapper.ts`: Calibration mapping, mirroring, clamping to `[-1, 1]`.
    - `smoothing.ts`: OneEuroFilter and EMA filters.
    - `calibration.ts`: Bounds validation and persistence.
    - `gesture-controller.ts`: State machine bridging input sources (Webcam vs Synthetic vs Keyboard) to paddle position.
    - `mediapipe-adapter.ts`: MediaPipe HandLandmarker lifecycle management.
    - `simulated-landmarks.ts`: Offline generator producing center, left, right, high, low, noisy, and missing-frame streams.
  - [ ] Implement unit tests in `frontend/tests/unit/`:
    - `coordinate-mapper.test.ts`
    - `smoothing.test.ts`
    - `calibration.test.ts`
    - `gesture-controller.test.ts`

- [ ] **Phase 4: Standalone Application Routing & Neo-Brutalist Pages**
  - [ ] **Landing Page (`/`)**:
    - Large mint-green hero panel with playful badges and oversized title.
    - Primary CTA: "PLAY NOW ↗", Secondary: "TRY GESTURE CONTROL", "VIEW STATS".
    - Interactive 3D arena table tennis preview.
    - Athena Museum-inspired bento cards: Gesture Control, Adaptive Opponent, AI Coaching.
    - Real technology strip and responsive footer.
  - [ ] **Game Setup & Arena (`/play`, `/game/:matchId`)**:
    - Mode selection (PvC, PvP), controls (Hand-tracking, Keyboard, Touch), difficulty.
    - Three.js / R3F 3D arena: table, net, ball, paddles, scoreboard, pause/restart.
    - Connects directly to `TableTennisEngine` without duplicating physics.
    - Post-match modal with drill-down to AI Coach.
  - [ ] **Gesture Lab (`/gesture-lab`)**:
    - Dual mode: Real Webcam + Full Offline Synthetic Dry-Run.
    - Camera permissions, landmark visualizer, palm/wrist coordinate monitors.
    - Synthetic test scenarios: Center hold, left/right sweep, jitter noise, tracking loss.
    - Live virtual paddle tracking hand or synthetic stream.
    - Export test report feature.
  - [ ] **Match Dashboard (`/dashboard`)**:
    - Real match telemetry: rally length distributions, success/miss rates, zone heatmaps.
    - Empty state with optional demo telemetry loader clearly labeled.
  - [ ] **AI Coach (`/coach/:matchId`)**:
    - Evidence-backed observations, strengths, improvement drills, ITTF rule citations.
    - Graceful fallback when Python or Ollama is offline.
  - [ ] **Architecture Explorer (`/architecture`)**:
    - Live Graphify knowledge graph explorer consuming `graphify-out/graph.json`.
    - Module filtering (`frontend/`, `server/`, `game-engine/`, `services/`, `ml/`).
    - God node inspector and community cluster viewer.
    - Conceptual architecture overview alongside real AST-derived graph.

- [ ] **Phase 5: Backend & AI Service Integration**
  - [ ] Create `frontend/src/services/`:
    - `api-client.ts`: Typed client with timeout and error handling.
    - `socket-client.ts`: Socket.IO connection management.
    - `graphify-service.ts`: Graph data loader with local fallback.
  - [ ] Configure `.env.example` with standard environment variables:
    - `VITE_API_BASE_URL=http://localhost:3001`
    - `VITE_SOCKET_URL=http://localhost:3001`
    - `VITE_AI_API_BASE_URL=http://localhost:8000`

- [ ] **Phase 6: Verification, Dry Run Execution & Documentation**
  - [ ] Execute frontend unit tests (`npm test` in `frontend/`).
  - [ ] Verify production build (`npm run build` in `frontend/`).
  - [ ] Run `graphify update .` to index new frontend and game-engine modules.
  - [ ] Generate `docs/GESTURE_TESTING.md`.
  - [ ] Generate `docs/DRY_RUN_REPORT.md`.
  - [ ] Generate `docs/FRONTEND.md`.
  - [ ] Generate `scripts/graphify/README.md`.
