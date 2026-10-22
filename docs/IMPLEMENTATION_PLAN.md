# PONG AI — Implementation Plan & Stage Milestones

## Overview
This implementation plan follows the structured 8-stage roadmap specified in the PONG AI architecture prompt. Each stage has explicit verification criteria and deliverables to prevent scope creep or broken intermediate states.

---

## Stage Checklist

### Stage 1: Working Foundation & Architecture Setup
- [x] Initial repository audit (package structure, existing code, dependencies, entry points).
- [x] Create comprehensive `.env.example` with Gemma 4 configurations.
- [x] Establish architecture documentation (`docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/DECISIONS.md`).
- [x] Implement Neo-Brutalist Arcade Design System tokens and typography (`client/src/styles/index.css`).
- [x] Define shared rule contracts, metric formulas, and event types in `shared/`.

### Stage 2: Playable Game & Deterministic Simulation
- [x] Support dual rule profiles (`ARCADE_PONG` and `TABLE_TENNIS_TRAINING`) in the engine.
- [x] Physics sub-stepping with continuous collision detection (CCD) for ball, net, table, and paddles.
- [x] Implement baseline AI opponent with deterministic interception trajectory prediction and configurable error.
- [x] Keyboard fallback controls (`[WASD]` / Arrow keys / `[Space]` serve).
- [x] Sound and visual feedback with accessible toggle options.

### Stage 3: Gesture Control & Gesture Lab
- [x] Integrate MediaPipe Tasks Vision hand landmarker with stable palm/wrist anchor.
- [x] One Euro adaptive low-pass filter and exponential moving average (EMA) jitter reduction.
- [x] Live reaching boundary calibration (minX, maxX, minY, maxY, center point) stored in localStorage.
- [x] Dedicated **Gesture Lab** interface:
  - Live video preview with 21-landmark skeleton overlay.
  - Interactive calibration wizard.
  - Real-time sensitivity and latency meters.
  - Tracking diagnostics: availability percentage, frame rate, dropped frame indicator.
  - Sequence gesture classifier experiment (IDLE, READY, FOREHAND, BACKHAND, SMASH) with precision/recall display.

### Stage 4: Gemma 4 Coaching Engine (Primary AI Layer)
- [x] Implement server AI provider abstraction (`server/src/ai/`).
- [x] Implement Gemini API adapter for Gemma 4 (`gemma-4-26b-a4b-it` and `gemma-4-31b-it`).
- [x] Implement local Ollama adapter (`gemma4:e2b`).
- [x] Strict Zod schema validation for coaching reports:
  - `summary`, `observations[]`, `evidence[]`, `weaknesses[]`, `recommendations[]`, `training_plan[]`, `rule_references[]`, `limitations[]`.
- [x] Natural language Q&A analytics assistant endpoint for post-match reasoning.
- [x] UI transparency: provider badges, model ID display, timeout/error recovery without fabricated text.

### Stage 5: Analytics Engine, Metric Contracts & Rules Explorer
- [x] Centralized, auditable metric calculations with explicit formulas and zero-denominator handling:
  - `return_success_rate = successful_returns / eligible_return_attempts`
  - `miss_rate = missed_returns / eligible_return_attempts`
  - `average_rally_length = total_counted_contacts / completed_rallies`
- [x] Interactive **Analytics Studio** with Recharts:
  - Rally-length histogram, reaction time distribution, table zone landing distribution.
- [x] Reproducible Benchmark Lab runner:
  - Run fixed-seed automated trials against baseline controllers across Easy, Medium, Hard.
  - Measure interception error, success rate, and response delay.
- [x] **Rules Explorer** interface:
  - Dual profiles: `ARCADE_PONG` and `TABLE_TENNIS_TRAINING` (ITTF Statutes 2026 Chapter 2).
  - Status badges (`IMPLEMENTED_AND_TESTED`, `PARTIALLY_SIMULATED`, `DOCUMENTED_ONLY`, `NOT_IMPLEMENTED`).
  - Search, filter by status, official section citations, limitations, test references.

### Stage 6: Graphify Codebase Architecture Explorer
- [x] Inspect existing `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md`.
- [x] In-app interactive Architecture Explorer:
  - Renders actual nodes, community clusters, god nodes (`TableTennisEngine`, `App`, `VisionPipeline`).
  - Search, zoom, node detail inspector, dependency links.
  - Graph freshness indicator linked to commit hash.

### Stage 7: Multiplayer (Player vs Player)
- [x] Socket.IO server and client architecture.
- [x] Room creation and joining with 4-letter codes.
- [x] Server-authoritative scoring and simulation ticks.
- [x] Client paddle position streaming and input validation.

### Stage 8: Final Validation & Documentation Polish
- [x] Run automated tests for physics, rules, metric calculations, and provider failures.
- [x] Verify production build (`npm run build`).
- [x] Complete documentation:
  - `docs/DECISIONS.md`
  - `docs/ANALYTICS_SPEC.md`
  - `docs/RULES_TRACEABILITY.md`
  - `docs/PRIVACY.md`
  - `docs/TESTING.md`
  - `docs/THIRD_PARTY_NOTICES.md`
  - `README.md`
