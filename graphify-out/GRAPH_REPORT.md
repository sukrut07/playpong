# Graph Report - playpong  (2026-10-22)

## Corpus Check
- 216 files · ~103,061 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: .jsonl 4, .example 3, .css 2)

## Summary
- 1561 nodes · 2909 edges · 112 communities (92 shown, 20 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 131 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7641d866`
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
- CoachPage.tsx
- components/game/Scene.tsx
- PONG AI — Web Client & 3D Game Frontend
- PONG AI — Node.js Multiplayer Server & Authority Backend
- ITTF Statutes 2026 Raw Ingestion Source
- PONG AI — ML Data Pipeline & Provenance
- THIRD_PARTY_NOTICES.md
- pong-ml
- GestureLabPage.tsx
- Communities (70 total, 16 thin omitted)
- src/game/Scene.tsx
- shared/metrics.ts
- frontend/package.json
- TableTennisEngine
- compilerOptions
- PONG AI — Gesture Control Testing & Dry Run Guide
- DashboardPage.tsx
- shared/types.ts
- aiProviderManager
- test_validation.py
- ref_react
- PONG AI — Frontend & Repository Architecture Audit
- socketClient
- services
- app/App.tsx
- 3. Application Routes
- Graphify Codebase Knowledge Graph Integration
- RuleProfile
- dependencies
- Button
- rules_tool.py
- devDependencies
- apiClient
- game-engine/package.json
- evaluate_models.py
- providerManager.ts
- model-service.ts
- SoundEngine
- test_graph.py
- CoachApiClient
- ArchitectureExplorerView.tsx
- scripts
- frontend/src/vite-env.d.ts
- frontend/src/main.tsx
- Graph Report - playpong  (2026-10-22)
- get_health
- Roadmap & Milestones
- PONG AI — Initial Repository Audit & Architectural Baseline
- AnalyticsDashboard.tsx

## God Nodes (most connected - your core abstractions)
1. `Communities (108 total, 23 thin omitted)` - 86 edges
2. `MatchStats` - 48 edges
3. `TableTennisEngine` - 37 edges
4. `TableTennisEngine` - 35 edges
5. `Button()` - 26 edges
6. `App()` - 25 edges
7. `RuleProfile` - 24 edges
8. `Card()` - 23 edges
9. `GraphState` - 22 edges
10. `CoachingReport` - 22 edges

## Surprising Connections (you probably didn't know these)
- `3. Existing Features Reused & Preserved` --references--> `aiProviderManager`  [INFERRED]
  docs/INITIAL_AUDIT.md → server/src/ai/providerManager.ts
- `Surprising Connections (you probably didn't know these)` --references--> `HandControlCallback`  [INFERRED]
  frontend/public/graphify/GRAPH_REPORT.md → client/src/vision/handLandmarker.ts
- `Query 2: Shortest Path from Vision to Physics Engine` --references--> `VisionPipeline`  [INFERRED]
  docs/GRAPHIFY.md → client/src/vision/handLandmarker.ts
- `Surprising Connections (you probably didn't know these)` --references--> `VisionPipeline`  [INFERRED]
  frontend/public/graphify/GRAPH_REPORT.md → client/src/vision/handLandmarker.ts
- `Roadmap & Milestones` --references--> `Badge()`  [INFERRED]
  docs/IMPLEMENTATION_PLAN.md → frontend/src/components/ui/Badge.tsx

## Import Cycles
- None detected.

## Communities (112 total, 20 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.06
Nodes (30): CONNECTIONS, WebcamOverlayProps, CalibrationModal(), CalibrationModalProps, CalibStep, GestureLabViewProps, DEFAULT_CALIBRATION, isValidCalibration() (+22 more)

### Community 1 - "coach.ts"
Cohesion: 0.10
Nodes (21): zod, CoachingEvidenceSchema, CoachingObservationSchema, CoachingWeaknessSchema, RuleReferenceLinkSchema, TrainingPlanDrillSchema, ValidatedCoachingReport, FALLBACK_MISSIONS (+13 more)

### Community 2 - "client/package.json"
Cohesion: 0.07
Nodes (26): autoprefixer, canvas-confetti, clsx, lucide-react, @mediapipe/tasks-vision, postcss, react, react-dom (+18 more)

### Community 3 - "MatchStats"
Cohesion: 0.20
Nodes (6): MatchSummaryModalProps, CoachChatPanelProps, modelService, CoachingReport, CoachSummaryResponse, MatchStats

### Community 4 - "scripts"
Cohesion: 0.08
Nodes (25): description, devDependencies, concurrently, name, private, repository, type, url (+17 more)

### Community 5 - "main.py"
Cohesion: 0.11
Nodes (18): evaluate_controller(), generate_match_coaching(), lifespan(), query_match_analytics(), smoke_test(), AnalyticsQueryRequest, CoachingEvidence, CoachingObservation (+10 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 7 - "TableTennisEngine"
Cohesion: 0.13
Nodes (5): PlayerAssistCueProps, TableTennisEngine, SceneProps, ZoneDistributionChartProps, TableZoneDistribution

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
Nodes (27): App(), WebcamOverlay(), MissionCard(), Scoreboard(), LandingMenu(), MatchSummaryModal(), MultiplayerModal(), SettingsModal() (+19 more)

### Community 12 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, canvas-confetti, clsx, lucide-react, @mediapipe/tasks-vision, react, react-dom, @react-three/drei (+5 more)

### Community 13 - "server/package.json"
Cohesion: 0.17
Nodes (11): tsx, @types/cors, @types/express, @types/node, @types/socket.io, description, typescript, main (+3 more)

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
Nodes (16): compute_metrics_node(), finalise_report_node(), generate_analysis_node(), load_match_evidence_node(), retry_or_fallback_node(), route_request_node(), run_analytics_tool_node(), select_model_node() (+8 more)

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
Cohesion: 0.14
Nodes (4): normalize_landmarks_3d(), extract_window_features(), test_extract_window_features_dimensions(), test_normalize_landmarks_origin_and_scale()

### Community 31 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, test

### Community 32 - "src/index.ts"
Cohesion: 0.17
Nodes (8): cors, dotenv, express, __dirname, __filename, httpServer, io, coachRouter

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

### Community 58 - "split_by_session"
Cohesion: 0.14
Nodes (4): build_dataset_arrays(), generate_synthetic_gesture_data(), split_by_session(), test_session_separated_splits_zero_leakage()

### Community 59 - "compute_classification_metrics"
Cohesion: 0.15
Nodes (3): compute_classification_metrics(), test_compute_classification_metrics(), test_measure_inference_latencies()

### Community 60 - "PONG AI — Machine Learning & Gesture Training Workspace (`ml/`)"
Cohesion: 0.22
Nodes (8): 1. Run Unit Tests, 2. Train Gesture Classifier, 3. Run Latency Benchmark, PONG AI — Machine Learning & Gesture Training Workspace (`ml/`), Quickstart Commands, Temporal Gesture Classification Design, Video Action Recognition Research (VideoMAE & RacketVision), Workspace Architecture

### Community 61 - "CoachPage.tsx"
Cohesion: 0.26
Nodes (13): God Nodes (most connected - your core abstractions), Surprising Connections (you probably didn't know these), ChatMessage, CoachChatPanel(), SUGGESTED_PROMPTS, ModelUsagePanel(), ModelUsagePanelProps, Button() (+5 more)

### Community 62 - "components/game/Scene.tsx"
Cohesion: 0.23
Nodes (11): Arena(), Ball(), BallProps, Paddle(), PaddleProps, GameLoop(), Scene(), SceneProps (+3 more)

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
Cohesion: 0.06
Nodes (40): 1. Test Summary, 2. Coordinate Remapping & Edge Case Verification, 3. Smoothing & Jitter Reduction (1€ Filter), 4. Real Webcam Hardware Test Status, PONG AI — Gesture Controller Dry-Run Report, CameraMiniPreviewProps, DryRunControls(), DryRunControlsProps (+32 more)

### Community 71 - "Communities (70 total, 16 thin omitted)"
Cohesion: 0.02
Nodes (86): Communities (108 total, 23 thin omitted), Community 0 - "types.ts", Community 100 - "test_graph.py", Community 102 - "ArchitectureExplorerView.tsx", Community 103 - "scripts", Community 107 - "ai/schemas.ts", Community 10 - "SoundEngine", Community 11 - "src/App.tsx" (+78 more)

### Community 72 - "src/game/Scene.tsx"
Cohesion: 0.21
Nodes (13): Arena(), Ball(), BallProps, Paddle(), PaddleProps, PlayerAssistCue(), Table(), BallState (+5 more)

### Community 73 - "shared/metrics.ts"
Cohesion: 0.15
Nodes (14): 2.1 Directory Structure, 2.2 Package Manifest Analysis, 2. Repository Inventory & Package Manifests, GameEventListener, GameEventPayload, calculateAverageRallyLength(), calculateAverageReactionTime(), calculateMedianRallyLength() (+6 more)

### Community 74 - "frontend/package.json"
Cohesion: 0.07
Nodes (27): description, autoprefixer, canvas-confetti, clsx, lucide-react, @mediapipe/tasks-vision, postcss, react (+19 more)

### Community 75 - "TableTennisEngine"
Cohesion: 0.13
Nodes (4): Features, PONG AI Game Engine (`game-engine/`), SoundDelegate, TableTennisEngine

### Community 76 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+14 more)

### Community 77 - "PONG AI — Gesture Control Testing & Dry Run Guide"
Cohesion: 0.22
Nodes (8): 1. Architecture Overview, 2. Automated Synthetic Dry-Run (No Camera Required), 3. Gesture Lab Interactive Dry-Run (Browser UI), 4. Physical Webcam Verification Checklist, 5. Failure Modes & Fallbacks, PONG AI — Gesture Control Testing & Dry Run Guide, Running Automated Unit Tests, Test Suite Coverage

### Community 78 - "DashboardPage.tsx"
Cohesion: 0.12
Nodes (20): RallyBucketChart(), RallyBucketChartProps, RallyBucketData, RallyChartProps, ReturnSuccessPoint, ReturnSuccessRollingChart(), ReturnSuccessRollingChartProps, RuleComplianceTable() (+12 more)

### Community 79 - "shared/types.ts"
Cohesion: 0.14
Nodes (13): AnalyticsStudioViewProps, RulesExplorerViewProps, BenchmarkResult, BenchmarkScenario, CoachingEvidence, CoachingObservation, CoachingWeakness, MatchEvent (+5 more)

### Community 80 - "aiProviderManager"
Cohesion: 0.11
Nodes (6): GeminiGemmaAdapter, OllamaGemmaAdapter, OrchestratorAdapter, AICoachProvider, ProviderHealth, aiProviderManager

### Community 81 - "test_validation.py"
Cohesion: 0.24
Nodes (7): MatchStats, compare_match_to_history(), compute_verified_metrics(), test_compute_metrics_normal(), test_constraint_violation_detection(), test_history_comparison(), test_zero_denominator_handling()

### Community 82 - "ref_react"
Cohesion: 0.16
Nodes (11): ITTF_RULE_CHECKS, RuleCheckItem, Scoreboard(), ScoreboardProps, BadgeProps, ButtonProps, Modal(), ModalProps (+3 more)

### Community 83 - "PONG AI — Frontend & Repository Architecture Audit"
Cohesion: 0.15
Nodes (12): ScreenType, 1. Executive Summary, 3.1 Game Engine & Physics, 3.2 Vision & Hand Tracking Pipeline, 3.3 Backend & Multiplayer, 3.4 AI Orchestrator & Rule Engine, 3.5 Graphify Knowledge Graph, 3. Component & Subsystem Capability Matrix (+4 more)

### Community 84 - "socketClient"
Cohesion: 0.18
Nodes (3): MultiplayerModalProps, socketClient, PlayerRole

### Community 85 - "services"
Cohesion: 0.12
Nodes (16): framework, root, framework, root, framework, root, rewrites, $schema (+8 more)

### Community 86 - "app/App.tsx"
Cohesion: 0.23
Nodes (11): 3. Application Routes, App(), useRouter(), CameraMiniPreview(), Footer(), Navbar(), NavbarProps, StatusIndicator() (+3 more)

### Community 87 - "3. Application Routes"
Cohesion: 0.29
Nodes (6): 1. Design System & Tokens, 2. Component Hierarchy, 4. Backend & AI Integration, Color Palette, Neo-Brutalist Geometry & Shadows, PONG AI — Frontend Architecture & Design System

### Community 88 - "Graphify Codebase Knowledge Graph Integration"
Cohesion: 0.40
Nodes (4): 1. Generated Artifacts, 2. CLI Workflow & Scripts, 3. Frontend Architecture Explorer Integration, Graphify Codebase Knowledge Graph Integration

### Community 89 - "RuleProfile"
Cohesion: 0.26
Nodes (5): ScoreboardProps, LandingMenuProps, GameDifficulty, RallyState, RuleProfile

### Community 90 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, canvas-confetti, clsx, lucide-react, @mediapipe/tasks-vision, react, react-dom, @react-three/drei (+5 more)

### Community 91 - "Button"
Cohesion: 0.14
Nodes (17): GraphifyViewer(), GraphifyViewerProps, computeDefaultPositions(), LAYER_COLORS, ModularSystemGraph(), SYSTEM_EDGES, SYSTEM_NODES, SystemEdge (+9 more)

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

### Community 96 - "evaluate_models.py"
Cohesion: 0.21
Nodes (3): measure_inference_latencies(), evaluate_model_on_suite(), main()

### Community 97 - "providerManager.ts"
Cohesion: 0.47
Nodes (6): buildAnalyticsQAPrompt(), buildGemma4CoachingPrompt(), CoachingReportSchema, formatMetricNumber(), formatMetricPercentage(), GameRule

### Community 98 - "model-service.ts"
Cohesion: 0.24
Nodes (5): ModelHealthStatus, telemetry, getRuleById(), getRulesByProfile(), RULE_REGISTRY

### Community 101 - "CoachApiClient"
Cohesion: 0.15
Nodes (3): MissionCardProps, CoachApiClient, Mission

### Community 102 - "ArchitectureExplorerView.tsx"
Cohesion: 0.40
Nodes (4): ArchitectureExplorerViewProps, GraphData, GraphLink, GraphNode

### Community 103 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, test

### Community 106 - "frontend/src/main.tsx"
Cohesion: 0.24
Nodes (6): AppProviders(), RouterContext, RouterContextType, RouterProvider(), RouterProviderProps, rootElement

### Community 107 - "Graph Report - playpong  (2026-10-22)"
Cohesion: 0.22
Nodes (8): Community Hubs (Navigation), Corpus Check, Graph Freshness, Graph Report - playpong  (2026-10-22), Import Cycles, Knowledge Gaps, Suggested Questions, Summary

### Community 108 - "get_health"
Cohesion: 0.22
Nodes (4): check_readiness(), get_health(), get_run(), list_models()

### Community 109 - "Roadmap & Milestones"
Cohesion: 0.33
Nodes (4): PONG AI — Frontend Rebuild & Clean Architecture Plan, Roadmap & Milestones, PageHeader(), PageHeaderProps

### Community 110 - "PONG AI — Initial Repository Audit & Architectural Baseline"
Cohesion: 0.33
Nodes (5): 1. Executive Summary, 2. Current Architecture & Technology Stack, 3. Existing Features Reused & Preserved, 4. Risks & Mitigations, PONG AI — Initial Repository Audit & Architectural Baseline

### Community 111 - "AnalyticsDashboard.tsx"
Cohesion: 0.67
Nodes (3): AnalyticsDashboard(), AnalyticsDashboardProps, calculateSessionAggregates()

## Knowledge Gaps
- **52 isolated node(s):** `@mediapipe/tasks-vision`, `@react-three/drei`, `@react-three/fiber`, `canvas-confetti`, `clsx` (+47 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 789 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GraphState` connect `nodes.py` to `Graph Report - playpong  (2026-10-22)`, `rules_tool.py`, `CoachPage.tsx`?**
  _High betweenness centrality (0.199) - this node is a cross-community bridge._
- **What connects `@mediapipe/tasks-vision`, `@react-three/drei`, `@react-three/fiber` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06327683615819209 - nodes in this community are weakly interconnected._
- **Why does `RuleProfile` connect `RuleProfile` to `TableTennisEngine`, `src/game/Scene.tsx`, `shared/metrics.ts`, `src/App.tsx`, `Graph Report - playpong  (2026-10-22)`, `TableTennisEngine`, `multiplayer.ts`, `shared/types.ts`, `ref_react`, `socketClient`, `CoachPage.tsx`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **Should `coach.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10114942528735632 - nodes in this community are weakly interconnected._
- **Why does `God Nodes (most connected - your core abstractions)` connect `CoachPage.tsx` to `RuleProfile`, `Graph Report - playpong  (2026-10-22)`, `nodes.py`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Should `client/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._