# Graph Report - playpong  (2026-10-22)

## Corpus Check
- 202 files · ~89,153 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .jsonl 4, .example 3, .css 2)

## Summary
- 1441 nodes · 2698 edges · 106 communities (84 shown, 22 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 116 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d3cdb3d7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- coach.ts
- client/package.json
- providerManager.ts
- scripts
- main.py
- compilerOptions
- TableTennisEngine
- compilerOptions
- 1. Core Mathematical Metric Contracts
- SoundEngine
- src/App.tsx
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
- typing
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
- GestureLabPage.tsx
- Communities (70 total, 16 thin omitted)
- src/game/Scene.tsx
- physics/tableTennisEngine.ts
- frontend/package.json
- TableTennisEngine
- compilerOptions
- MatchStats
- DashboardPage.tsx
- shared/types.ts
- ref_react
- test_validation.py
- GamePage.tsx
- PONG AI — Frontend & Repository Architecture Audit
- socketClient
- GameRule
- app/App.tsx
- geminiAdapter.ts
- CoachApiClient
- RuleProfile
- dependencies
- ArchitecturePage.tsx
- rules_tool.py
- devDependencies
- apiClient
- game-engine/package.json
- evaluate_models.py
- Graph Report - playpong  (2026-10-22)
- GraphifyViewer.tsx
- SoundEngine
- test_graph.py
- get
- Roadmap & Milestones
- scripts
- frontend/src/vite-env.d.ts

## God Nodes (most connected - your core abstractions)
1. `Communities (70 total, 16 thin omitted)` - 55 edges
2. `MatchStats` - 43 edges
3. `TableTennisEngine` - 37 edges
4. `TableTennisEngine` - 35 edges
5. `App()` - 25 edges
6. `RuleProfile` - 22 edges
7. `CoachingReport` - 22 edges
8. `GraphState` - 21 edges
9. `Button()` - 19 edges
10. `compilerOptions` - 19 edges

## Surprising Connections (you probably didn't know these)
- `3. Existing Features Reused & Preserved` --references--> `aiProviderManager`  [INFERRED]
  docs/INITIAL_AUDIT.md → server/src/ai/providerManager.ts
- `Query 2: Shortest Path from Vision to Physics Engine` --references--> `VisionPipeline`  [INFERRED]
  docs/GRAPHIFY.md → client/src/vision/handLandmarker.ts
- `God Nodes (most connected - your core abstractions)` --references--> `VisionPipeline`  [INFERRED]
  frontend/public/graphify/GRAPH_REPORT.md → client/src/vision/handLandmarker.ts
- `Roadmap & Milestones` --references--> `Badge()`  [INFERRED]
  docs/IMPLEMENTATION_PLAN.md → frontend/src/components/ui/Badge.tsx
- `Roadmap & Milestones` --references--> `Button()`  [INFERRED]
  docs/IMPLEMENTATION_PLAN.md → frontend/src/components/ui/Button.tsx

## Import Cycles
- None detected.

## Communities (106 total, 22 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.06
Nodes (31): CONNECTIONS, WebcamOverlayProps, CalibrationModal(), CalibrationModalProps, CalibStep, GestureLabViewProps, DEFAULT_CALIBRATION, isValidCalibration() (+23 more)

### Community 1 - "coach.ts"
Cohesion: 0.19
Nodes (13): FALLBACK_MISSIONS, getFallbackMission(), buildMissionPrompt(), buildSummaryPrompt(), AdaptiveDifficultySchema, CoachSummaryDto, CoachSummarySchema, GameDifficultySchema (+5 more)

### Community 2 - "client/package.json"
Cohesion: 0.07
Nodes (26): autoprefixer, canvas-confetti, clsx, lucide-react, @mediapipe/tasks-vision, postcss, react, react-dom (+18 more)

### Community 3 - "providerManager.ts"
Cohesion: 0.15
Nodes (5): OllamaGemmaAdapter, OrchestratorAdapter, AICoachProvider, ProviderHealth, aiProviderManager

### Community 4 - "scripts"
Cohesion: 0.08
Nodes (25): description, devDependencies, concurrently, name, private, repository, type, url (+17 more)

### Community 5 - "main.py"
Cohesion: 0.11
Nodes (19): evaluate_controller(), generate_match_coaching(), get_health(), lifespan(), query_match_analytics(), smoke_test(), AnalyticsQueryRequest, CoachingEvidence (+11 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 7 - "TableTennisEngine"
Cohesion: 0.15
Nodes (3): PlayerAssistCueProps, TableTennisEngine, SceneProps

### Community 8 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir, resolveJsonModule (+5 more)

### Community 9 - "1. Core Mathematical Metric Contracts"
Cohesion: 0.14
Nodes (13): 1.1 Return Success Rate, 1.2 Miss Rate, 1.3 Average Rally Length, 1.4 Median Rally Length, 1.5 Interception Success Rate (AI Opponent), 1.6 Mean Reaction Time, 1. Core Mathematical Metric Contracts, 2.1 Tracking Availability Percentage (+5 more)

### Community 10 - "SoundEngine"
Cohesion: 0.17
Nodes (6): SoundEngine, 1. Asset Strategy, 2. Audio Subsystem (Web Audio API Synthesizer), 3. 3D Meshes & Materials, 4. UI Sprites & Icons, Asset Discovery, Licenses & Procedural Design — Gesture Pong AI

### Community 11 - "src/App.tsx"
Cohesion: 0.11
Nodes (26): App(), WebcamOverlay(), MissionCard(), Scoreboard(), LandingMenu(), MatchSummaryModal(), MultiplayerModal(), SettingsModal() (+18 more)

### Community 12 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, canvas-confetti, clsx, lucide-react, @mediapipe/tasks-vision, react, react-dom, @react-three/drei (+5 more)

### Community 13 - "server/package.json"
Cohesion: 0.13
Nodes (14): cors, dotenv, express, tsx, @types/cors, @types/express, @types/node, @types/socket.io (+6 more)

### Community 14 - "multiplayer.ts"
Cohesion: 0.23
Nodes (10): MultiplayerCallbacks, SocketStatus, socket.io, generateRoomCode(), rooms, RoomSession, setupMultiplayerHandlers(), startServerAuthoritativeSimulation() (+2 more)

### Community 15 - "rules_retriever.py"
Cohesion: 0.09
Nodes (12): RuleConflictRecord, RuleRecordSchema, RuleRetrievalResult, RulesRetriever, 11-Stage LangGraph Pipeline, Architecture, Endpoints, Overview (+4 more)

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
Cohesion: 0.12
Nodes (17): God Nodes (most connected - your core abstractions), compute_metrics_node(), finalise_report_node(), generate_analysis_node(), load_match_evidence_node(), retry_or_fallback_node(), route_request_node(), run_analytics_tool_node() (+9 more)

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
Cohesion: 0.18
Nodes (8): app, __dirname, __filename, httpServer, io, rootDir, server, coachRouter

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
Cohesion: 0.15
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
Cohesion: 0.15
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

### Community 70 - "GestureLabPage.tsx"
Cohesion: 0.07
Nodes (34): DryRunControls(), DryRunControlsProps, GestureVisualizer(), GestureVisualizerProps, isValidCalibration(), loadCalibration(), resetCalibration(), saveCalibration() (+26 more)

### Community 71 - "Communities (70 total, 16 thin omitted)"
Cohesion: 0.04
Nodes (55): Communities (70 total, 16 thin omitted), Community 0 - "types.ts", Community 10 - "SoundEngine", Community 11 - "App.tsx", Community 12 - "dependencies", Community 13 - "server/package.json", Community 14 - "multiplayer.ts", Community 15 - "rules_retriever.py" (+47 more)

### Community 72 - "src/game/Scene.tsx"
Cohesion: 0.13
Nodes (22): Arena(), Ball(), BallProps, Paddle(), PaddleProps, PlayerAssistCue(), Table(), BallState (+14 more)

### Community 73 - "physics/tableTennisEngine.ts"
Cohesion: 0.14
Nodes (15): GameEventListener, GameEventPayload, sound, 2.1 Directory Structure, GameEventListener, GameEventPayload, calculateAverageRallyLength(), calculateAverageReactionTime() (+7 more)

### Community 74 - "frontend/package.json"
Cohesion: 0.07
Nodes (27): description, autoprefixer, canvas-confetti, clsx, lucide-react, @mediapipe/tasks-vision, postcss, react (+19 more)

### Community 75 - "TableTennisEngine"
Cohesion: 0.13
Nodes (4): Features, PONG AI Game Engine (`game-engine/`), SoundDelegate, TableTennisEngine

### Community 76 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+14 more)

### Community 77 - "MatchStats"
Cohesion: 0.25
Nodes (5): MatchSummaryModalProps, modelService, CoachingReport, CoachSummaryResponse, MatchStats

### Community 78 - "DashboardPage.tsx"
Cohesion: 0.20
Nodes (12): RallyChart(), RallyChartProps, ZoneDistributionChart(), ZoneDistributionChartProps, DashboardPage(), DashboardPageProps, calculateSessionAggregates(), clearMatchHistory() (+4 more)

### Community 79 - "shared/types.ts"
Cohesion: 0.13
Nodes (14): AnalyticsDashboard(), AnalyticsDashboardProps, AnalyticsStudioViewProps, calculateSessionAggregates(), BenchmarkResult, BenchmarkScenario, CoachingEvidence, CoachingObservation (+6 more)

### Community 80 - "ref_react"
Cohesion: 0.15
Nodes (10): ArchitectureExplorerViewProps, GraphData, GraphLink, GraphNode, AppProviders(), RouterContext, RouterContextType, RouterProvider() (+2 more)

### Community 81 - "test_validation.py"
Cohesion: 0.24
Nodes (7): MatchStats, compare_match_to_history(), compute_verified_metrics(), test_compute_metrics_normal(), test_constraint_violation_detection(), test_history_comparison(), test_zero_denominator_handling()

### Community 82 - "GamePage.tsx"
Cohesion: 0.23
Nodes (10): Scoreboard(), ScoreboardProps, Button(), ButtonProps, Modal(), ModalProps, GamePage(), GamePageProps (+2 more)

### Community 83 - "PONG AI — Frontend & Repository Architecture Audit"
Cohesion: 0.13
Nodes (14): ScreenType, 1. Executive Summary, 2.2 Package Manifest Analysis, 2. Repository Inventory & Package Manifests, 3.1 Game Engine & Physics, 3.2 Vision & Hand Tracking Pipeline, 3.3 Backend & Multiplayer, 3.4 AI Orchestrator & Rule Engine (+6 more)

### Community 84 - "socketClient"
Cohesion: 0.18
Nodes (3): MultiplayerModalProps, socketClient, PlayerRole

### Community 85 - "GameRule"
Cohesion: 0.23
Nodes (6): RulesExplorerViewProps, getRuleById(), getRulesByProfile(), RULE_REGISTRY, GameRule, RuleImplementationStatus

### Community 86 - "app/App.tsx"
Cohesion: 0.25
Nodes (10): App(), useRouter(), Footer(), Navbar(), NavbarProps, StatusIndicator(), StatusIndicatorProps, CoachPage() (+2 more)

### Community 87 - "geminiAdapter.ts"
Cohesion: 0.26
Nodes (6): GeminiGemmaAdapter, buildAnalyticsQAPrompt(), buildGemma4CoachingPrompt(), CoachingReportSchema, formatMetricNumber(), formatMetricPercentage()

### Community 88 - "CoachApiClient"
Cohesion: 0.17
Nodes (3): MissionCardProps, CoachApiClient, Mission

### Community 89 - "RuleProfile"
Cohesion: 0.26
Nodes (5): ScoreboardProps, LandingMenuProps, GameDifficulty, RallyState, RuleProfile

### Community 90 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, canvas-confetti, clsx, lucide-react, @mediapipe/tasks-vision, react, react-dom, @react-three/drei (+5 more)

### Community 91 - "ArchitecturePage.tsx"
Cohesion: 0.28
Nodes (9): GraphifyViewer(), Badge(), BadgeProps, Card(), CardProps, ArchitecturePage(), ArchitecturePageProps, HomePage() (+1 more)

### Community 92 - "rules_tool.py"
Cohesion: 0.30
Nodes (7): retrieve_rules_node(), explain_rule(), get_rule_by_id(), get_rules_by_profile(), RuleRecord, search_rules(), test_rules_lookup()

### Community 93 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer, postcss, tailwindcss, @types/canvas-confetti, @types/react, @types/react-dom, @types/three (+3 more)

### Community 94 - "apiClient"
Cohesion: 0.24
Nodes (3): apiClient, ApiError, ApiRequestOptions

### Community 95 - "game-engine/package.json"
Cohesion: 0.20
Nodes (9): description, main, name, private, scripts, test, type, types (+1 more)

### Community 97 - "Graph Report - playpong  (2026-10-22)"
Cohesion: 0.22
Nodes (8): Community Hubs (Navigation), Corpus Check, Graph Freshness, Graph Report - playpong  (2026-10-22), Import Cycles, Knowledge Gaps, Suggested Questions, Summary

### Community 98 - "GraphifyViewer.tsx"
Cohesion: 0.31
Nodes (5): GraphifyViewerProps, GraphifyData, GraphifyLink, GraphifyNode, graphifyService

### Community 101 - "get"
Cohesion: 0.29
Nodes (3): check_readiness(), get_run(), list_models()

### Community 102 - "Roadmap & Milestones"
Cohesion: 0.33
Nodes (4): PONG AI — Frontend Rebuild & Clean Architecture Plan, Roadmap & Milestones, PageHeader(), PageHeaderProps

### Community 103 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, test

## Knowledge Gaps
- **52 isolated node(s):** `@mediapipe/tasks-vision`, `@react-three/drei`, `@react-three/fiber`, `canvas-confetti`, `clsx` (+47 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 711 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `God Nodes (most connected - your core abstractions)` connect `nodes.py` to `types.ts`, `Graph Report - playpong  (2026-10-22)`, `GestureClassifierModel`?**
  _High betweenness centrality (0.231) - this node is a cross-community bridge._
- **What connects `@mediapipe/tasks-vision`, `@react-three/drei`, `@react-three/fiber` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.060285563194077206 - nodes in this community are weakly interconnected._
- **Why does `VisionPipeline` connect `types.ts` to `src/App.tsx`, `nodes.py`?**
  _High betweenness centrality (0.217) - this node is a cross-community bridge._
- **Should `client/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Why does `GestureClassifierModel` connect `GestureClassifierModel` to `train_gesture_classifier.py`, `predict_gesture.py`, `nodes.py`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._