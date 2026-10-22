# Graph Report - playpong  (2026-10-22)

## Corpus Check
- 139 files · ~59,942 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .jsonl 4, .example 2, (none) 1)

## Summary
- 990 nodes · 1817 edges · 70 communities (54 shown, 16 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 100 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `92a6633d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- coach.ts
- client/package.json
- MatchStats
- scripts
- main.py
- compilerOptions
- TableTennisEngine
- compilerOptions
- 1. Core Mathematical Metric Contracts
- SoundEngine
- App.tsx
- dependencies
- server/package.json
- multiplayer.ts
- rules_retriever.py
- PONG AI 🏓🤖
- Demonstration Script — Gesture Pong AI
- Setup & Running Guide — Gesture Pong AI
- 2. Test Suites & Coverage Targets
- PONG AI — Architecture Specification
- nodes.py
- ollama_provider.py
- PONG AI — Privacy, Security & Data Handling Policy
- PONG AI — Rules & Regulatory Traceability
- PONG AI — Architecture Decision Records (ADRs)
- devDependencies
- numpy
- scripts
- src/index.ts
- vite.config.ts
- ollamaService
- train_gesture_classifier.py
- PONG AI — Local AI Orchestration System
- run.sh
- PONG AI — Model Lifecycle & Artifact Management
- devDependencies
- PONG AI — Data Privacy & Local-First AI Architecture
- PONG AI — Model Evaluation Protocol & Benchmark Suite
- dependencies
- PONG AI — Complete System & AI Architecture
- PONG AI — Training Lifecycle & Dataset Validation
- scripts
- LoRA & PEFT Adapters Registry
- PONG AI — Model Artifact Registry & Lifecycle
- predict_gesture.py
- GestureClassifierModel
- Graphify Setup & Codebase Knowledge Graph Integration
- validate_frame
- split_by_session
- compute_classification_metrics
- PONG AI — Machine Learning & Gesture Training Workspace (`ml/`)
- ai/schemas.ts
- PONG AI — Initial Repository Audit & Architectural Baseline
- PONG AI — Web Client & 3D Game Frontend
- PONG AI — Node.js Multiplayer Server & Authority Backend
- ITTF Statutes 2026 Raw Ingestion Source
- PONG AI — ML Data Pipeline & Provenance
- THIRD_PARTY_NOTICES.md
- pong-ml

## God Nodes (most connected - your core abstractions)
1. `TableTennisEngine` - 39 edges
2. `MatchStats` - 34 edges
3. `App()` - 25 edges
4. `react` - 23 edges
5. `GraphState` - 20 edges
6. `build_pong_ai_graph()` - 18 edges
7. `CoachingReport` - 18 edges
8. `VisionPipeline` - 17 edges
9. `compilerOptions` - 17 edges
10. `GestureClassifierModel` - 17 edges

## Surprising Connections (you probably didn't know these)
- `3. Existing Features Reused & Preserved` --references--> `aiProviderManager`  [INFERRED]
  docs/INITIAL_AUDIT.md → server/src/ai/providerManager.ts
- `Query 1: Tracing Hand Tracking to Paddle Movement` --references--> `Scene()`  [INFERRED]
  docs/GRAPHIFY.md → client/src/game/Scene.tsx
- `Query 1: Tracing Hand Tracking to Paddle Movement` --references--> `TableTennisEngine`  [INFERRED]
  docs/GRAPHIFY.md → client/src/game/physics/tableTennisEngine.ts
- `Query 2: Shortest Path from Vision to Physics Engine` --references--> `TableTennisEngine`  [INFERRED]
  docs/GRAPHIFY.md → client/src/game/physics/tableTennisEngine.ts
- `Query 1: Tracing Hand Tracking to Paddle Movement` --references--> `HandControlCallback`  [INFERRED]
  docs/GRAPHIFY.md → client/src/vision/handLandmarker.ts

## Import Cycles
- None detected.

## Communities (70 total, 16 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.07
Nodes (30): CONNECTIONS, WebcamOverlayProps, CalibrationModal(), CalibrationModalProps, CalibStep, GestureLabView(), GestureLabViewProps, DEFAULT_CALIBRATION (+22 more)

### Community 1 - "coach.ts"
Cohesion: 0.16
Nodes (15): FALLBACK_MISSIONS, getFallbackMission(), buildMissionPrompt(), buildSummaryPrompt(), AdaptiveDifficultySchema, CoachSummaryDto, CoachSummarySchema, GameDifficultySchema (+7 more)

### Community 2 - "client/package.json"
Cohesion: 0.10
Nodes (19): typescript, name, private, type, version, autoprefixer, canvas-confetti, clsx (+11 more)

### Community 3 - "MatchStats"
Cohesion: 0.08
Nodes (22): MatchSummaryModal(), MatchSummaryModalProps, AnalyticsStudioViewProps, CoachApiClient, GeminiGemmaAdapter, OllamaGemmaAdapter, OrchestratorAdapter, buildAnalyticsQAPrompt() (+14 more)

### Community 4 - "scripts"
Cohesion: 0.09
Nodes (21): description, devDependencies, concurrently, name, private, repository, type, url (+13 more)

### Community 5 - "main.py"
Cohesion: 0.07
Nodes (24): check_readiness(), evaluate_controller(), explain_rule(), generate_match_coaching(), get_health(), get_run(), lifespan(), list_models() (+16 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 7 - "TableTennisEngine"
Cohesion: 0.09
Nodes (16): Arena(), Ball(), BallProps, Paddle(), PaddleProps, PlayerAssistCue(), PlayerAssistCueProps, Table() (+8 more)

### Community 8 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir, resolveJsonModule (+5 more)

### Community 9 - "1. Core Mathematical Metric Contracts"
Cohesion: 0.14
Nodes (13): 1.1 Return Success Rate, 1.2 Miss Rate, 1.3 Average Rally Length, 1.4 Median Rally Length, 1.5 Interception Success Rate (AI Opponent), 1.6 Mean Reaction Time, 1. Core Mathematical Metric Contracts, 2.1 Tracking Availability Percentage (+5 more)

### Community 10 - "SoundEngine"
Cohesion: 0.21
Nodes (6): SoundEngine, 1. Asset Strategy, 2. Audio Subsystem (Web Audio API Synthesizer), 3. 3D Meshes & Materials, 4. UI Sprites & Icons, Asset Discovery, Licenses & Procedural Design — Gesture Pong AI

### Community 11 - "App.tsx"
Cohesion: 0.05
Nodes (70): App(), ScreenType, WebcamOverlay(), MissionCard(), MissionCardProps, Scoreboard(), ScoreboardProps, AnalyticsDashboard() (+62 more)

### Community 12 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, canvas-confetti, clsx, lucide-react, @mediapipe/tasks-vision, react, react-dom, @react-three/drei (+5 more)

### Community 13 - "server/package.json"
Cohesion: 0.15
Nodes (12): dotenv, tsx, @types/cors, @types/express, @types/node, @types/socket.io, description, typescript (+4 more)

### Community 14 - "multiplayer.ts"
Cohesion: 0.31
Nodes (8): socket.io, generateRoomCode(), rooms, RoomSession, setupMultiplayerHandlers(), startServerAuthoritativeSimulation(), MultiplayerRoomState, PaddleUpdatePayload

### Community 15 - "rules_retriever.py"
Cohesion: 0.08
Nodes (13): PONG AI — Implementation Plan & Phase Acceptance Criteria, RuleConflictRecord, RuleRecordSchema, RuleRetrievalResult, RulesRetriever, 11-Stage LangGraph Pipeline, Architecture, Endpoints (+5 more)

### Community 18 - "PONG AI 🏓🤖"
Cohesion: 0.10
Nodes (19): 1. Prerequisites, 2. Pull Gemma 4 Models, 3. Install Dependencies, 3D Gesture-Controlled Racket Arcade · Dual Gemma 4 Orchestration (LangGraph + Ollama) · ITTF 2026 Statutes RAG · Graphify Knowledge Graph, 4. Run the Full Stack, 🌟 Architecture Overview, 🧪 Automated Test Suites, Datasets Created (`data/rules/processed/`) (+11 more)

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
Cohesion: 0.25
Nodes (7): 1. Executive Summary & Design Philosophy, 2. High-Level System Architecture & One-Way Data Flow, 3. Technology Stack & Boundaries, 4. Module Boundaries & Directory Structure, 5. Gemma 4 Provider Architecture, Core Architecture Principle: One-Way Data Flow, PONG AI — Architecture Specification

### Community 23 - "nodes.py"
Cohesion: 0.07
Nodes (31): get_videomae_research_specification(), compute_metrics_node(), finalise_report_node(), generate_analysis_node(), load_match_evidence_node(), retrieve_rules_node(), retry_or_fallback_node(), route_request_node() (+23 more)

### Community 24 - "ollama_provider.py"
Cohesion: 0.08
Nodes (10): ModelRoutingPolicy, Settings, OllamaProvider, TaskType, test_controller_evaluation_endpoint(), test_health_endpoint(), test_models_list_endpoint(), test_auto_by_task_fast_summary() (+2 more)

### Community 25 - "PONG AI — Privacy, Security & Data Handling Policy"
Cohesion: 0.40
Nodes (4): 1. Computer Vision & Webcam Data, 2. AI Inference & Telemetry Disclosure, 3. Local Storage & Data Retention, PONG AI — Privacy, Security & Data Handling Policy

### Community 26 - "PONG AI — Rules & Regulatory Traceability"
Cohesion: 0.40
Nodes (4): 1. Overview & Regulatory Disclaimer, 2. ITTF Statutes 2026 Reference Mapping, 3. ARCADE_PONG Profile Rules, PONG AI — Rules & Regulatory Traceability

### Community 27 - "PONG AI — Architecture Decision Records (ADRs)"
Cohesion: 0.29
Nodes (6): ADR 001: Separation of Real-Time Physics from LLM Inference Loop, ADR 002: Dual Gemma 4 (E2B vs E4B) Task Routing with Fallback, ADR 003: Dedicated Python AI Orchestrator with Node.js Gateway, ADR 004: In-Memory Checkpointer for Local Privacy, ADR 005: Deterministic Evidence Grounding & Zero-Denominator Invariants, PONG AI — Architecture Decision Records (ADRs)

### Community 29 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer, postcss, tailwindcss, @types/canvas-confetti, @types/react, @types/react-dom, @types/three (+3 more)

### Community 30 - "numpy"
Cohesion: 0.13
Nodes (6): build_dataset_arrays(), generate_synthetic_gesture_data(), normalize_landmarks_3d(), extract_window_features(), test_extract_window_features_dimensions(), test_normalize_landmarks_origin_and_scale()

### Community 31 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, test

### Community 32 - "src/index.ts"
Cohesion: 0.15
Nodes (8): cors, express, __dirname, __filename, httpServer, io, rootDir, coachRouter

### Community 35 - "train_gesture_classifier.py"
Cohesion: 0.17
Nodes (3): measure_inference_latencies(), evaluate_model_on_suite(), main()

### Community 36 - "PONG AI — Local AI Orchestration System"
Cohesion: 0.25
Nodes (7): 1. Overview, 2. Dual Gemma 4 Strategy & Model Routing, 3. LangGraph Workflow Pipeline, 4. Run State & Persistence, Configurable Model Routing Policies, Detailed Node Specifications, PONG AI — Local AI Orchestration System

### Community 38 - "PONG AI — Model Lifecycle & Artifact Management"
Cohesion: 0.29
Nodes (6): 1. Distinction: Downloaded Weights vs. Trained Files, 2. Model Manifests, 3. Storage & Version Control Rules, 4. Empirical Fine-Tuning Justification Protocol, Example Manifest (`models/manifests/gemma4_e2b.json`):, PONG AI — Model Lifecycle & Artifact Management

### Community 39 - "devDependencies"
Cohesion: 0.29
Nodes (7): devDependencies, tsx, @types/cors, @types/express, @types/node, @types/socket.io, typescript

### Community 40 - "PONG AI — Data Privacy & Local-First AI Architecture"
Cohesion: 0.33
Nodes (5): 1. Core Privacy Commitments, 2. Webcam Video Isolation, 3. LangSmith & Cloud Observability Disablement, 4. Telemetry Hygiene, PONG AI — Data Privacy & Local-First AI Architecture

### Community 41 - "PONG AI — Model Evaluation Protocol & Benchmark Suite"
Cohesion: 0.33
Nodes (5): 1. Objectives, 2. Evaluation Criteria & Metrics, 3. The 12 Standard Benchmark Scenarios, 4. Execution Command, PONG AI — Model Evaluation Protocol & Benchmark Suite

### Community 42 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, cors, dotenv, express, socket.io, zod

### Community 43 - "PONG AI — Complete System & AI Architecture"
Cohesion: 0.40
Nodes (4): 1. Executive Summary, 2. Component Responsibility Matrix, 3. Separation of Concerns & Safety Invariants, PONG AI — Complete System & AI Architecture

### Community 44 - "PONG AI — Training Lifecycle & Dataset Validation"
Cohesion: 0.40
Nodes (4): Current Status, Fine-Tuning Prerequisites Checklist, PONG AI — Training Lifecycle & Dataset Validation, Training Dataset Schema

### Community 45 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, start, test

### Community 46 - "LoRA & PEFT Adapters Registry"
Cohesion: 0.50
Nodes (3): Future Adapter Format, LoRA & PEFT Adapters Registry, Status: No Fine-Tuned Checkpoints (Pretrained Baseline Phase)

### Community 47 - "PONG AI — Model Artifact Registry & Lifecycle"
Cohesion: 0.50
Nodes (3): Core Governance Principles, Directory Layout, PONG AI — Model Artifact Registry & Lifecycle

### Community 53 - "predict_gesture.py"
Cohesion: 0.18
Nodes (3): load_inference_engine(), predict_single_sequence(), TemporalGestureInferenceEngine

### Community 54 - "GestureClassifierModel"
Cohesion: 0.24
Nodes (3): run_benchmark(), GestureClassifierModel, train_pipeline()

### Community 56 - "Graphify Setup & Codebase Knowledge Graph Integration"
Cohesion: 0.18
Nodes (10): 1. Re-extract Code Graph (AST-only, no API cost), 2. Query the Knowledge Graph via CLI, 3. Query Shortest Paths between Modules, 4. Interactive Browser Exploration, Commands & Workflows, Current Graph Metrics, Generated Graphify Artifacts, Graphify Setup & Codebase Knowledge Graph Integration (+2 more)

### Community 57 - "validate_frame"
Cohesion: 0.25
Nodes (5): validate_dataset(), validate_frame(), test_validate_dataset_aggregate(), test_validate_frame_invalid_class_and_missing_landmarks(), test_validate_frame_valid()

### Community 59 - "compute_classification_metrics"
Cohesion: 0.20
Nodes (3): compute_classification_metrics(), test_compute_classification_metrics(), test_measure_inference_latencies()

### Community 60 - "PONG AI — Machine Learning & Gesture Training Workspace (`ml/`)"
Cohesion: 0.22
Nodes (8): 1. Run Unit Tests, 2. Train Gesture Classifier, 3. Run Latency Benchmark, PONG AI — Machine Learning & Gesture Training Workspace (`ml/`), Quickstart Commands, Temporal Gesture Classification Design, Video Action Recognition Research (VideoMAE & RacketVision), Workspace Architecture

### Community 61 - "ai/schemas.ts"
Cohesion: 0.25
Nodes (7): zod, CoachingEvidenceSchema, CoachingObservationSchema, CoachingWeaknessSchema, RuleReferenceLinkSchema, TrainingPlanDrillSchema, ValidatedCoachingReport

### Community 62 - "PONG AI — Initial Repository Audit & Architectural Baseline"
Cohesion: 0.33
Nodes (5): 1. Executive Summary, 2. Current Architecture & Technology Stack, 3. Existing Features Reused & Preserved, 4. Risks & Mitigations, PONG AI — Initial Repository Audit & Architectural Baseline

### Community 63 - "PONG AI — Web Client & 3D Game Frontend"
Cohesion: 0.40
Nodes (4): Core Subsystems, PONG AI — Web Client & 3D Game Frontend, Running Locally, Technologies

### Community 64 - "PONG AI — Node.js Multiplayer Server & Authority Backend"
Cohesion: 0.40
Nodes (4): Core Modules, PONG AI — Node.js Multiplayer Server & Authority Backend, Running Locally, Technologies

### Community 65 - "ITTF Statutes 2026 Raw Ingestion Source"
Cohesion: 0.50
Nodes (3): Ingestion & Provenance Protocol, ITTF Statutes 2026 Raw Ingestion Source, Primary Source

### Community 66 - "PONG AI — ML Data Pipeline & Provenance"
Cohesion: 0.50
Nodes (3): Dataset Organization, Leakage Prevention Protocol, PONG AI — ML Data Pipeline & Provenance

## Knowledge Gaps
- **20 isolated node(s):** `@react-three/drei`, `canvas-confetti`, `clsx`, `tailwind-merge`, `@types/canvas-confetti` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 486 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TableTennisEngine` connect `TableTennisEngine` to `types.ts`, `App.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `TableTennisEngine` (e.g. with `Query 1: Tracing Hand Tracking to Paddle Movement` and `Query 2: Shortest Path from Vision to Physics Engine`) actually correct?**
  _`TableTennisEngine` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@react-three/drei`, `canvas-confetti`, `clsx` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0655367231638418 - nodes in this community are weakly interconnected._
- **Why does `MatchStats` connect `MatchStats` to `App.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Should `client/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Why does `react` connect `App.tsx` to `types.ts`, `client/package.json`, `MatchStats`, `TableTennisEngine`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._