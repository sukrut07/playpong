# Graph Report - playpong  (2026-10-22)

## Corpus Check
- 74 files · ~38,257 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .example 1, (none) 1, .css 1)

## Summary
- 565 nodes · 1079 edges · 34 communities (28 shown, 6 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `edb8ef7e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- coach.ts
- client/package.json
- MatchStats
- scripts
- Scene.tsx
- compilerOptions
- TableTennisEngine
- compilerOptions
- 2. Gesture & Computer Vision Metrics
- SoundEngine
- App.tsx
- dependencies
- server/package.json
- types.ts
- Stage Checklist
- PONG AI 🏓🤖
- Demonstration Script — Gesture Pong AI
- Setup & Running Guide — Gesture Pong AI
- 2. Test Suites & Coverage Targets
- PONG AI — Architecture Specification
- PONG AI — Architecture & Design Decisions (ADR)
- Graphify Integration & Repository Intelligence Workflow
- PONG AI — Privacy, Security & Data Handling Policy
- PONG AI — Rules & Regulatory Traceability
- README.md
- devDependencies
- 1. Core Mathematical Metric Contracts
- scripts
- LowPassFilter
- vite.config.ts

## God Nodes (most connected - your core abstractions)
1. `TableTennisEngine` - 40 edges
2. `MatchStats` - 30 edges
3. `App()` - 25 edges
4. `react` - 22 edges
5. `VisionPipeline` - 18 edges
6. `compilerOptions` - 17 edges
7. `lucide-react` - 15 edges
8. `RuleProfile` - 15 edges
9. `CoachingReport` - 15 edges
10. `CalibrationData` - 14 edges

## Surprising Connections (you probably didn't know these)
- `ADR 002: Dual Inference Deployment Strategy (Gemini API & Local Ollama)` --references--> `AICoachProvider`  [INFERRED]
  docs/DECISIONS.md → server/src/ai/provider.ts
- `Stage 6: Graphify Codebase Architecture Explorer` --references--> `App()`  [INFERRED]
  docs/IMPLEMENTATION_PLAN.md → client/src/App.tsx
- `Query 1: Tracing Hand Tracking to Paddle Movement` --references--> `Scene()`  [INFERRED]
  docs/GRAPHIFY.md → client/src/game/Scene.tsx
- `Query 1: Tracing Hand Tracking to Paddle Movement` --references--> `TableTennisEngine`  [INFERRED]
  docs/GRAPHIFY.md → client/src/game/physics/tableTennisEngine.ts
- `Query 2: Shortest Path from Vision to Physics Engine` --references--> `TableTennisEngine`  [INFERRED]
  docs/GRAPHIFY.md → client/src/game/physics/tableTennisEngine.ts

## Import Cycles
- None detected.

## Communities (34 total, 6 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.09
Nodes (24): CONNECTIONS, WebcamOverlayProps, CalibrationModal(), CalibrationModalProps, CalibStep, GestureLabView(), GestureLabViewProps, DEFAULT_CALIBRATION (+16 more)

### Community 1 - "coach.ts"
Cohesion: 0.08
Nodes (25): cors, FALLBACK_MISSIONS, getFallbackMission(), buildMissionPrompt(), buildSummaryPrompt(), AdaptiveDifficultySchema, CoachSummaryDto, CoachSummarySchema (+17 more)

### Community 2 - "client/package.json"
Cohesion: 0.11
Nodes (18): typescript, name, private, type, version, autoprefixer, canvas-confetti, clsx (+10 more)

### Community 3 - "MatchStats"
Cohesion: 0.10
Nodes (18): MatchSummaryModalProps, AnalyticsStudioViewProps, coachApi, CoachApiClient, GeminiGemmaAdapter, OllamaGemmaAdapter, buildAnalyticsQAPrompt(), buildGemma4CoachingPrompt() (+10 more)

### Community 4 - "scripts"
Cohesion: 0.12
Nodes (15): description, devDependencies, concurrently, name, private, scripts, build, dev (+7 more)

### Community 5 - "Scene.tsx"
Cohesion: 0.25
Nodes (14): Arena(), Ball(), BallProps, Paddle(), PaddleProps, PlayerAssistCue(), Table(), BallState (+6 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 7 - "TableTennisEngine"
Cohesion: 0.11
Nodes (8): ScoreboardProps, LandingMenuProps, PlayerAssistCueProps, TableTennisEngine, SceneProps, GameDifficulty, RallyState, RuleProfile

### Community 8 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir, resolveJsonModule (+5 more)

### Community 9 - "2. Gesture & Computer Vision Metrics"
Cohesion: 0.29
Nodes (6): 2.1 Tracking Availability Percentage, 2.2 Missing-Frame Rate, 2.3 Gesture Classification True Positive Rate (TPR / Sensitivity), 2. Gesture & Computer Vision Metrics, 3. Controller Benchmarking Protocol, PONG AI — Analytics Specification & Metric Contracts

### Community 10 - "SoundEngine"
Cohesion: 0.21
Nodes (6): SoundEngine, 1. Asset Strategy, 2. Audio Subsystem (Web Audio API Synthesizer), 3. 3D Meshes & Materials, 4. UI Sprites & Icons, Asset Discovery, Licenses & Procedural Design — Gesture Pong AI

### Community 11 - "App.tsx"
Cohesion: 0.07
Nodes (47): App(), ScreenType, WebcamOverlay(), MissionCard(), MissionCardProps, Scoreboard(), AnalyticsDashboard(), AnalyticsDashboardProps (+39 more)

### Community 12 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, canvas-confetti, clsx, lucide-react, @mediapipe/tasks-vision, react, react-dom, @react-three/drei (+5 more)

### Community 13 - "server/package.json"
Cohesion: 0.05
Nodes (38): dotenv, express, tsx, @types/cors, @types/express, @types/node, @types/socket.io, zod (+30 more)

### Community 14 - "types.ts"
Cohesion: 0.07
Nodes (27): MultiplayerModalProps, RulesExplorerViewProps, socket.io, socket.io-client, generateRoomCode(), rooms, RoomSession, setupMultiplayerHandlers() (+19 more)

### Community 15 - "Stage Checklist"
Cohesion: 0.17
Nodes (11): Overview, PONG AI — Implementation Plan & Stage Milestones, Stage 1: Working Foundation & Architecture Setup, Stage 2: Playable Game & Deterministic Simulation, Stage 3: Gesture Control & Gesture Lab, Stage 4: Gemma 4 Coaching Engine (Primary AI Layer), Stage 5: Analytics Engine, Metric Contracts & Rules Explorer, Stage 6: Graphify Codebase Architecture Explorer (+3 more)

### Community 18 - "PONG AI 🏓🤖"
Cohesion: 0.15
Nodes (13): 1. Prerequisites, 2. Installation, 3. Environment Configuration, 3D Gesture-Controlled Racket Arcade · Gemma 4 Intelligence · ITTF 2026 Rules · Graphify Architecture, 4. Running Locally, 🧪 Automated Testing & Verification, 📜 Documentation Index, 📊 Graphify Codebase Knowledge Graph (+5 more)

### Community 19 - "Demonstration Script — Gesture Pong AI"
Cohesion: 0.22
Nodes (8): Demonstration Script — Gesture Pong AI, Preparation (30 Seconds), Step 1: Landing Menu & System Health (1 Minute), Step 2: Camera Calibration & Live Hand Tracking (2 Minutes), Step 3: Playable 3D Match with Gemma 4 Coaching (3 Minutes), Step 4: Post-Match Tactical Debrief (2 Minutes), Step 5: Performance Analytics Studio (2 Minutes), Step 6: Graphify Developer Intelligence (1 Minute)

### Community 20 - "Setup & Running Guide — Gesture Pong AI"
Cohesion: 0.22
Nodes (8): 1. Verify Ollama & Gemma 4, 2. Installation, 3. Running the Application, 4. Testing, 5. Production Build, 6. Graphify Repository Intelligence, Prerequisites, Setup & Running Guide — Gesture Pong AI

### Community 21 - "2. Test Suites & Coverage Targets"
Cohesion: 0.22
Nodes (8): 1. Test Suite Architecture, 2.1 Deterministic Simulation & Collision Physics, 2.2 Rule Traceability Tests, 2.3 Metric Contract Safeguards, 2.4 AI Provider Resilience & Failure Paths, 2. Test Suites & Coverage Targets, 3. Running Test Suites, PONG AI — Testing Strategy & Verification Protocol

### Community 22 - "PONG AI — Architecture Specification"
Cohesion: 0.29
Nodes (7): 1. Executive Summary & Design Philosophy, 2. High-Level System Architecture & One-Way Data Flow, 3. Technology Stack & Boundaries, 4. Module Boundaries & Directory Structure, 5. Gemma 4 Provider Architecture, Core Architecture Principle: One-Way Data Flow, PONG AI — Architecture Specification

### Community 23 - "PONG AI — Architecture & Design Decisions (ADR)"
Cohesion: 0.29
Nodes (7): ADR 001: Gemma 4 as the Intelligence Layer (Not a Chatbot), ADR 002: Dual Inference Deployment Strategy (Gemini API & Local Ollama), ADR 003: Dual Rule Profiles (ARCADE_PONG vs TABLE_TENNIS_TRAINING), ADR 004: Neo-Brutalist Arcade Visual Design System, ADR 005: Deterministic Continuous Collision Physics Engine, ADR 006: Graphify Knowledge Graph Integration, PONG AI — Architecture & Design Decisions (ADR)

### Community 24 - "Graphify Integration & Repository Intelligence Workflow"
Cohesion: 0.40
Nodes (4): 1. Environment & Installation, 2. Graph Extraction & Clustered Reports, Generated Graph Artifacts, Graphify Integration & Repository Intelligence Workflow

### Community 25 - "PONG AI — Privacy, Security & Data Handling Policy"
Cohesion: 0.40
Nodes (4): 1. Computer Vision & Webcam Data, 2. AI Inference & Telemetry Disclosure, 3. Local Storage & Data Retention, PONG AI — Privacy, Security & Data Handling Policy

### Community 26 - "PONG AI — Rules & Regulatory Traceability"
Cohesion: 0.40
Nodes (4): 1. Overview & Regulatory Disclaimer, 2. ITTF Statutes 2026 Reference Mapping, 3. ARCADE_PONG Profile Rules, PONG AI — Rules & Regulatory Traceability

### Community 29 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer, postcss, tailwindcss, @types/canvas-confetti, @types/react, @types/react-dom, @types/three (+3 more)

### Community 30 - "1. Core Mathematical Metric Contracts"
Cohesion: 0.29
Nodes (7): 1.1 Return Success Rate, 1.2 Miss Rate, 1.3 Average Rally Length, 1.4 Median Rally Length, 1.5 Interception Success Rate (AI Opponent), 1.6 Mean Reaction Time, 1. Core Mathematical Metric Contracts

### Community 31 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, test

## Knowledge Gaps
- **19 isolated node(s):** `@react-three/drei`, `canvas-confetti`, `clsx`, `tailwind-merge`, `@types/canvas-confetti` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 258 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TableTennisEngine` connect `TableTennisEngine` to `types.ts`, `Scene.tsx`, `App.tsx`, `types.ts`, `Stage Checklist`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `TableTennisEngine` (e.g. with `Query 1: Tracing Hand Tracking to Paddle Movement` and `Query 2: Shortest Path from Vision to Physics Engine`) actually correct?**
  _`TableTennisEngine` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@react-three/drei`, `canvas-confetti`, `clsx` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08843537414965986 - nodes in this community are weakly interconnected._
- **Why does `Stage 6: Graphify Codebase Architecture Explorer` connect `Stage Checklist` to `types.ts`, `App.tsx`, `TableTennisEngine`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `App()` (e.g. with `loadCalibration()` and `Stage 6: Graphify Codebase Architecture Explorer`) actually correct?**
  _`App()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `coach.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08194905869324474 - nodes in this community are weakly interconnected._