# PONG AI — Implementation Plan & Phase Acceptance Criteria

- [x] **Phase 0: Architecture Audit & Baseline Verification**
  - [x] Audit existing repository structure, dependencies, and environment.
  - [x] Create `docs/INITIAL_AUDIT.md` and `docs/IMPLEMENTATION_PLAN.md`.
  - [x] Verify Git cleanliness and branch status.

- [x] **Phase 1: Neo-Brutalist Frontend & Interactive User Experience**
  - [x] Responsive neo-brutalist arcade design system with custom palettes, bold borders, and offset shadows.
  - [x] Main routes: Landing (`/`), Game Setup (`/play`), Play Arena (`/game/:id`), Multiplayer Lobby (`/multiplayer`), Analytics Dashboard (`/dashboard`), AI Coach (`/coach`), and AI Orchestrator (`/orchestrator`).
  - [x] Interactive AI Orchestrator view with live status cards, smoke testing, LangGraph 11-stage visualization, and empirical benchmarks.

- [x] **Phase 2: Deterministic 3D Game Engine & Physics**
  - [x] Fixed-timestep simulation with continuous collision detection against paddles and bounds.
  - [x] Mathematical trajectory prediction for computer opponent with reaction delay.
  - [x] Authoritative event stream (rallies, returns, bounces, misses, lets, points).
  - [x] Strict rule separation: `ARCADE_PONG` vs `TABLE_TENNIS_TRAINING`.

- [x] **Phase 3: MediaPipe Webcam Hand Tracking**
  - [x] In-browser `@mediapipe/tasks-vision` GPU delegate.
  - [x] 21-point hand landmarker tracking palm and wrist coordinates.
  - [x] Point2D EMA smoothing filter and bounding calibration.
  - [x] Graceful fallback to keyboard (Arrow keys / WASD) and touch controls.

- [x] **Phase 4: Node.js Multiplayer Backend Authority**
  - [x] Socket.IO room lifecycle, room codes, and player readiness states.
  - [x] Server-authoritative collision and score validation.
  - [x] AI Provider Adapter bridging Node.js to Python FastAPI orchestrator.
  - [x] Deterministic offline fallback engine when Python or Ollama is offline.

- [x] **Phase 5: ITTF Statutes 2026 Rules Knowledge Base**
  - [x] Ingest official ITTF Statutes 2026 clean version (§2.1 through §2.15).
  - [x] Create `data/rules/processed/ittf_rules.jsonl` with section, page, and exact statutory citations.
  - [x] Create `data/rules/processed/rule_conflicts.jsonl` mapping arcade physics to official regulations.
  - [x] Create `data/rules/processed/rule_qa_train.jsonl` and `rule_qa_eval.jsonl`.
  - [x] Build `RulesRetriever` in `services/ai-orchestrator/app/retrieval/rules_retriever.py` with uncertainty fallback.

- [x] **Phase 6: Python ML Training & Gesture Scaffolding (`ml/`)**
  - [x] Create `ml/` workspace with configs, data schemas, features, models, training, inference, and metrics.
  - [x] Implement wrist-origin normalization and 126-dim temporal sliding window feature extraction.
  - [x] Implement session-partitioned data splits to strictly prevent adjacent frame leakage.
  - [x] Train baseline `GestureClassifierModel` on synthetic sequence fixtures; export verified checkpoint and manifest.
  - [x] Achieve sub-millisecond CPU inference (<0.1ms p50 latency, >10,000 FPS throughput).
  - [x] Research scaffolding for Hugging Face VideoMAE and RacketVision action recognition.

- [x] **Phase 7: Python FastAPI AI Orchestration with LangChain & LangGraph**
  - [x] Standalone FastAPI service in `services/ai-orchestrator/`.
  - [x] LangChain `ChatOllama` adapter with dynamic model routing between `gemma4:e2b` and `gemma4:e4b`.
  - [x] 11-stage LangGraph StateGraph pipeline with typed state, retry loop, and fallback.
  - [x] Pydantic schemas supporting snake_case and camelCase serialization.
  - [x] Local memory checkpointer (`MemorySaver`) for ephemeral state replay without external cloud leakage.

- [x] **Phase 8: Model Lifecycle, Governance & Manifests**
  - [x] Four-tier distinction: Downloaded Weights, Ollama Modelfiles, Datasets, and Fine-Tuned Checkpoints.
  - [x] Formal manifests in `models/manifests/` for E2B (digest `45d11505b91d...`) and E4B (`eb2177adf764...`).
  - [x] Training guidelines in `models/training/README.md` forbidding fabricated fine-tune claims.

- [x] **Phase 9: Graphify Codebase Knowledge Graph Integration**
  - [x] Generated AST-based code graph: 811 nodes, 1546 edges, 53 communities.
  - [x] Exported `graphify-out/graph.json`, `graph.html`, and `GRAPH_REPORT.md`.
  - [x] Documentation in `docs/GRAPHIFY_SETUP.md`.

- [x] **Phase 10: Empirical Dual-Model Evaluation Benchmark**
  - [x] 12 stress-test scenarios in `models/datasets/evaluation_cases.json`.
  - [x] Executed live benchmark script `evaluate_models.py` against both local Gemma 4 models on Ollama.
  - [x] Generated empirical results in `models/evaluations/benchmark_results.json`:
    - E2B: 10/12 success, 100% schema valid, 83.3% grounded, 0 unsupported claims, 44.6s median latency.
    - E4B: 10/12 success, 100% schema valid, 83.3% grounded, 0 unsupported claims, 79.6s median latency.

- [x] **Phase 11: Testing, Security & Privacy Compliance**
  - [x] 18 Python tests passing in `services/ai-orchestrator`.
  - [x] 8 Python tests passing in `ml/tests`.
  - [x] 20 TypeScript tests passing across `client` and `server`.
  - [x] Zero webcam frames transmitted over network; external tracing disabled by default.
