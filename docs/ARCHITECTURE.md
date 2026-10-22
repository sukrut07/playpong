# PONG AI — Architecture Specification

## 1. Executive Summary & Design Philosophy
PONG AI is a 3D browser-based table-tennis arcade application combining:
- **Perception**: MediaPipe Tasks Vision hand tracking with One Euro adaptive filtering and real-time calibration.
- **Physics & Simulation**: Deterministic 3D table-tennis physics with continuous collision detection (CCD) sub-stepping (up to 240 physics evaluations/sec).
- **Rule Engine**: Explicit dual-profile rule evaluator (`ARCADE_PONG` and `TABLE_TENNIS_TRAINING` grounded in official ITTF Statutes 2026).
- **Intelligence Layer**: Gemma 4 (official `gemma-4-26b-a4b-it` or `gemma-4-31b-it` via Gemini API; optional local Ollama adapter) acting as the intelligence engine for evidence-grounded performance coaching, natural language match analytics, and structured training plans.
- **Analytics & Benchmarking**: Auditable metric calculation engine with strict mathematical contracts, zero-denominator safeguards, and reproducible controller benchmarks.
- **Explainability**: In-app Graphify Codebase Architecture Explorer that parses the real knowledge graph (`graphify-out/graph.json`) to visualize real dependencies, module communities, and god nodes.
- **Multiplayer**: Socket.IO server-authoritative multiplayer with room codes, snapshot synchronization, and client input validation.

---

## 2. High-Level System Architecture & One-Way Data Flow

```mermaid
graph TD
    subgraph Client Perception & Input
        CAM[Webcam Device] -->|getUserMedia| VID[HTML Video Element]
        VID -->|detectForVideo| MP[MediaPipe Hand Landmarker]
        MP -->|21 3D Landmarks| CALIB[Calibration & Coordinate Mapper]
        CALIB -->|Normalized [-1, 1]| FILT[One Euro Filter & EMA]
        FILT -->|Smoothed Coordinates| CTRL[Human Controller]
        KB[Keyboard Fallback WASD / Space] -->|Key States| CTRL
    end

    subgraph Client Simulation & Rendering
        CTRL -->|x, y, swing| SIM[Deterministic Game Simulation]
        AI_OPP[Baseline AI Opponent] -->|Trajectory Intercept| SIM
        SIM -->|Substeps & Trajectories| R3F[Three.js / React Three Fiber]
        R3F -->|Visual Render| CANVAS[WebGL 3D Arena]
        SIM -->|Match Events & Telemetry| EVENT_BUS[Authoritative Event Stream]
    end

    subgraph Rules & Analytics Layer
        EVENT_BUS --> METRICS[Deterministic Metrics Engine]
        EVENT_BUS --> RULE_EVAL[Rule Evaluator ARCADE / ITTF]
        METRICS --> STORE[(Browser LocalStorage & Memory)]
        METRICS --> CHARTS[Recharts Analytics Studio]
    end

    subgraph Server & AI Intelligence
        EVENT_BUS -->|Summary & Telemetry| API_CLIENT[REST API Client]
        API_CLIENT -->|POST /api/coach/report| SERVER[Node/Express Backend]
        SERVER --> PROVIDER[Gemma 4 Provider Interface]
        PROVIDER -->|Hosted Gemini API| GEMMA_API[Google Gemini API / Gemma 4]
        PROVIDER -.->|Optional Local Fallback| OLLAMA[Local Ollama Daemon]
        GEMMA_API -->|Structured JSON Response| VALIDATOR[Zod Schema Validator]
        VALIDATOR -->|Validated Coaching Report| UI_COACH[AI Coach Dashboard]
    end

    subgraph Codebase Knowledge Graph
        GRAPHIFY[Graphify CLI] -->|Static AST Extraction| GRAPH_JSON[graphify-out/graph.json]
        GRAPH_JSON -->|Parsed Nodes & Edges| ARCH_UI[Architecture Explorer View]
    end
```

### Core Architecture Principle: One-Way Data Flow
```
User/Webcam Input → Controller → Deterministic Simulation → Authoritative Events → Metric Aggregation → Rule Evaluation → Gemma 4 Coaching & UI
```
**Constraint**: The AI Coach *never* controls real-time collisions, does not award points, and does not alter authoritative match state. The game engine and rule evaluator are the sole sources of truth.

---

## 3. Technology Stack & Boundaries

| Subsystem | Technology | License | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite | MIT | Component tree, reactive state, fast HMR |
| **3D Rendering** | Three.js, React Three Fiber, Drei | MIT | 3D Arena, table, paddles, ball, lighting, particle trails |
| **Hand Tracking** | `@mediapipe/tasks-vision` | Apache-2.0 | Browser-side 21-point hand landmarking via WebAssembly/GPU |
| **Design System** | Neo-Brutalist Arcade CSS, Lucide React, Tailwind utilities | MIT / ISC | High-contrast, playful, bold arcade aesthetic |
| **Data Visualization** | Recharts | MIT | Rally length histograms, reaction times, heatmaps |
| **Multiplayer Client** | `socket.io-client` | MIT | WebSocket communication for room-based PvP |
| **Backend Framework** | Node.js, Express, TypeScript | MIT | HTTP endpoints, static API, rate limiting |
| **Multiplayer Server** | Socket.IO | MIT | Room lifecycle, authoritative scoring ticks |
| **AI Orchestration** | Gemma 4 on Gemini API / Ollama adapter, Zod | MIT | Strict JSON schema validation, evidence grounding |
| **Codebase Mapping** | Graphify CLI (`graphify extract .`) | Open Source | Knowledge graph generation, community clustering |

---

## 4. Module Boundaries & Directory Structure

```
playpong/
├── client/                      # Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── camera/          # WebcamOverlay, LandmarkVisualizer
│   │   │   ├── common/          # Neo-brutalist buttons, badges, cards, modals
│   │   │   ├── hud/             # Scoreboard, MatchTimer, MissionCard, RallyPill
│   │   │   ├── menus/           # LandingMenu, GameSetup, MatchSummaryModal, SettingsModal
│   │   │   ├── views/           # GestureLabView, AnalyticsStudioView, RulesExplorerView, ArchitectureExplorerView
│   │   ├── game/
│   │   │   ├── entities/        # Arena, Table, Paddle, Ball 3D meshes
│   │   │   ├── physics/         # TableTennisEngine, Continuous Collision Detection
│   │   │   ├── controllers/     # HumanGestureController, KeyboardController, BaselineAIOpponent
│   │   ├── vision/              # MediaPipe HandLandmarker, OneEuroFilter, Calibration
│   │   ├── analytics/           # Metric calculators, benchmark runner, telemetry collector
│   │   ├── rules/               # Rule registry definitions, evaluator, ITTF statutes index
│   │   ├── services/            # API client, audio synthesizer, localStorage persistence, socket
│   │   ├── styles/              # Neo-brutalist CSS tokens, variables, typography
│   │   └── types/               # Client-specific interfaces and re-exports
│   └── tests/                   # Client unit and integration tests
├── server/                      # Backend Service
│   ├── src/
│   │   ├── ai/                  # AI Provider interface, Gemini Gemma 4 adapter, Ollama adapter
│   │   ├── coach/               # Prompts, Zod schemas, coaching report generation
│   │   ├── realtime/            # Socket.IO multiplayer rooms and tick loop
│   │   ├── routes/              # Express route handlers (/api/coach, /api/health, /api/graph)
│   │   └── services/            # Gemma service, benchmark runner
│   └── dist/
├── shared/                      # Shared Contracts & Domain Models
│   ├── types.ts                 # Authoritative match types, game events, rule contracts
│   ├── rules.ts                 # Full rule registry (ARCADE_PONG & TABLE_TENNIS_TRAINING)
│   └── metrics.ts               # Centralized, tested mathematical metric formulas
├── docs/                        # Complete Engineering Documentation
└── graphify-out/                # Graphify Knowledge Graph artifacts (graph.json, graph.html, report)
```

---

## 5. Gemma 4 Provider Architecture

To satisfy strict requirements for open-weight intelligence and hackathon compliance:
1. **Configurable Provider Interface**:
   ```typescript
   export interface AICoachProvider {
     name: 'gemini' | 'ollama';
     modelId: string;
     generateCoachingReport(matchData: ValidatedMatchTelemetry): Promise<CoachingReport>;
     askAnalyticsQuestion(question: string, context: ValidatedMatchTelemetry): Promise<string>;
   }
   ```
2. **Primary Hosted Provider (`gemini`)**:
   - Uses the official Google AI Gemini API for Gemma 4.
   - Configurable model IDs: `gemma-4-26b-a4b-it` (MoE) and `gemma-4-31b-it` (Dense).
   - Server-side execution only: the `GEMINI_API_KEY` is never transmitted to or bundled with the client.
3. **Secondary Local Provider (`ollama`)**:
   - Interfaces with local Ollama runtime (`http://localhost:11434`) running a compatible Gemma model tag (e.g. `gemma4:e2b`).
   - Clearly flags inference as "Local Ollama" in the UI without confusing it with hosted endpoints.
4. **Resilience & Graceful Degradation**:
   - Structured JSON output enforced via system instructions and validated with Zod.
   - 12-second timeout protection.
   - When keys are missing or models are unavailable, the UI displays clear actionable notices and preserves the raw analytics without fabricating AI text.
