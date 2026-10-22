# PONG AI — Frontend & Repository Architecture Audit

**Date**: October 2026  
**Auditor**: Antigravity Assistant  
**Git Branch**: `main` (clean working tree, commit verified)

---

## 1. Executive Summary

This audit assesses the state of the PONG AI codebase before creating the dedicated `frontend/` application and modularizing `game-engine/`. The objective is to transition from the monolithic `client/` single-page prototype into a modular, testable, neo-brutalist arcade web application inspired by the reference designs (Athena Museum bento cards + SohanCK mint-green hero).

---

## 2. Repository Inventory & Package Manifests

### 2.1 Directory Structure
- **`package.json`**: Root orchestration scripts (`concurrently`, `npm run dev`, `test`, `graphify:extract`).
- **`client/`**: Existing React 19 + Vite 6 + Tailwind CSS + Three.js application.
- **`server/`**: Express + Socket.IO + AI Provider Manager (port 3001).
- **`services/ai-orchestrator/`**: Python FastAPI + LangChain + LangGraph dual-model service (port 8000).
- **`shared/`**: Pure TypeScript domain logic:
  - `types.ts`: Game difficulty, rule profiles, hand control state, missions, match events, telemetry contracts.
  - `rules.ts`: ITTF Statutes 2026 versioned rules registry (§2.1–§2.15).
  - `metrics.ts`: Audited calculation contracts (`calculateReturnSuccessRate`, `calculateMissRate`, etc.).
- **`graphify-out/`**: Graphify AST knowledge graph (`graph.json`, `graph.html`, `GRAPH_REPORT.md`).
- **`ml/` & `models/`**: Feature extraction pipelines, synthetic datasets, gesture classification baselines, and model manifests.

### 2.2 Package Manifest Analysis

| Package | Framework / Runtime | Key Dependencies | Test Harness | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Root** | Node.js | `concurrently ^9.1.2` | Delegates to subprojects | Working |
| **`client/`** | React 19, Vite 6, TS 5.7 | `@mediapipe/tasks-vision`, `@react-three/fiber`, `three`, `recharts`, `lucide-react`, `socket.io-client`, `tailwindcss` | `npx tsx --test` (12 passing tests) | Working |
| **`server/`** | Express, Node.js | `socket.io ^4.8.4`, `cors`, `dotenv` | `npx tsx --test` (8 passing tests) | Working |
| **`ai-orchestrator`** | Python 3.10+, FastAPI | `langchain`, `langgraph`, `pydantic`, `httpx` | `pytest tests/` (18 passing tests) | Working |

---

## 3. Component & Subsystem Capability Matrix

### 3.1 Game Engine & Physics
- **Location**: `client/src/game/physics/tableTennisEngine.ts`
- **Capabilities**:
  - Deterministic fixed-timestep sub-stepping (60–120Hz).
  - Continuous collision detection against paddle planar boundaries and table surface.
  - ITTF table dimensions: 2.74m length × 1.525m width, 15.25cm net height.
  - Authoritative rally event emission (`ball_hit_player`, `ball_bounce_table`, `point_won`).
- **Identified Gap**:
  - The physics engine is housed inside the frontend source tree rather than an independent `game-engine/` package.
  - While it has zero DOM dependencies, moving or referencing it as `game-engine/` achieves clean architectural boundaries and prevents duplicating simulation logic.

### 3.2 Vision & Hand Tracking Pipeline
- **Location**: `client/src/vision/`
- **Capabilities**:
  - `@mediapipe/tasks-vision` GPU delegate loading `hand_landmarker.task`.
  - 21 3D hand landmarks; uses wrist (0) and knuckle (9) midpoint as anchor.
  - Bounding calibration window mapping raw coordinates to normalized `[-1, 1]` game space.
  - `OneEuroFilter` (high smoothing at low velocity, zero lag on high velocity swings).
- **Identified Gap**:
  - No synthetic dry-run test mode that operates without camera permissions or model downloads.
  - Lacks modular decoupling between the MediaPipe adapter, coordinate mapping, and controller state machine.

### 3.3 Backend & Multiplayer
- **Location**: `server/src/`
- **Capabilities**:
  - Socket.IO room management, room codes, ready states.
  - Serves Graphify artifacts (`/api/graph` and `/api/graph/report`).
  - AI Provider Manager routing requests to FastAPI or falling back to deterministic ITTF rule engine.
- **Identified Gap**:
  - Client code connects to `/api/*` assuming proxy or hardcoded origins; needs environment variable configuration (`VITE_API_BASE_URL`, `VITE_SOCKET_URL`, `VITE_AI_API_BASE_URL`).

### 3.4 AI Orchestrator & Rule Engine
- **Location**: `services/ai-orchestrator/` & `shared/rules.ts`
- **Capabilities**:
  - 11-stage LangGraph workflow supporting Gemma 4 models.
  - Deterministic fallback when Ollama is offline (instant rule citation and drills).
  - Tested with 100% schema validity across evaluation benchmark cases.

### 3.5 Graphify Knowledge Graph
- **Location**: `graphify-out/`
- **Capabilities**:
  - AST-extracted knowledge graph: 990 nodes, 1817 edges, 70 communities.
  - CLI commands: `graphify update .`, `graphify query`.
  - Served via server endpoint `/api/graph`.

---

## 4. UI / UX & Design Gap Analysis

### 4.1 Visual Aesthetic Deficits
The existing UI uses dark neo-brutalist styling with purple/cyan accents, but lacks:
1. **Mint Green Hero**: The bold `#62F5AD` hero panel from reference 2 (SohanCK) with oversized typography and arcade badges.
2. **Athena Museum Bento Layout**: Structured, high-contrast bento cards with warm cream `#FFFDF6` background, 2–3px black borders, and crisp offset shadows (`3px 3px 0 #111111`).
3. **Palette Adherence**: Specific design tokens:
   - Ink: `#111111`
   - Mint: `#62F5AD`
   - Lime: `#D9FF55`
   - Lavender: `#BDA5FF`
   - Cream: `#FFFDF6`
   - White: `#FFFFFF`
4. **Standalone Pages & Routing**: Existing app used internal state tab switching (`ScreenType`). It requires clean routing (`/`, `/play`, `/game/:matchId`, `/gesture-lab`, `/dashboard`, `/coach/:matchId`, `/architecture`).
5. **Real-time Dry-Run in Gesture Lab**: Users without a camera need interactive synthetic dry-run buttons (Center, Left, Right, Noise, Tracking Drop) with instant telemetry and exportable reports.

---

## 5. Architectural Recommendations

1. **Create `frontend/` as the dedicated standalone application**:
   - Complete Vite + React + TypeScript setup with tokens, reusable neo-brutalist UI primitives, and clean page routes.
   - Decoupled `features/gesture` architecture containing coordinate mapping, smoothing, calibration, and simulated landmark streams.
2. **Establish `game-engine/` as the authoritative physics module**:
   - Export `TableTennisEngine`, `rules`, and `metrics` from `game-engine/`.
   - Ensure the browser UI only consumes the engine through clean interfaces.
3. **Implement Full Gesture Synthetic Dry Run Suite**:
   - Unit tests covering coordinate mapping, OneEuroFilter smoothing, calibration, and controller state.
   - Interactive UI dry-run player with synthetic landmark feeds.
4. **Connect Graphify Explorer to Real Output**:
   - Direct consumption of `/api/graph` or fallback to static `graphify-out/graph.json`.
   - Node search, community filtering, and link to `GRAPH_REPORT.md`.
5. **Update Documentation**:
   - `docs/IMPLEMENTATION_PLAN.md`
   - `docs/GESTURE_TESTING.md`
   - `docs/DRY_RUN_REPORT.md`
   - `docs/FRONTEND.md`
   - `scripts/graphify/README.md`
