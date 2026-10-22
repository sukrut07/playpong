# PONG AI — Initial Repository Audit & Architectural Baseline

## 1. Executive Summary
This audit inspects the complete codebase of PONG AI to establish a verified baseline across the 3D game engine, browser computer-vision pipeline, multiplayer authority backend, Python local AI orchestration service, and machine learning training scaffolding.

## 2. Current Architecture & Technology Stack

| Layer | Technology | Status | Key Modules & Files |
|---|---|---|---|
| **Frontend Web** | React 18, Vite 5, Tailwind CSS, Lucide React | Operational | `client/src/App.tsx`, `client/src/components/` |
| **3D Rendering** | Three.js, React Three Fiber, Drei | Operational | `client/src/game/PongScene.tsx`, `client/src/game/Ball.tsx`, `client/src/game/Paddle.tsx` |
| **Gesture Vision** | MediaPipe Tasks-Vision (`@mediapipe/tasks-vision`) | Operational | `client/src/vision/handLandmarker.ts`, `calibration.ts`, `smoothing.ts` |
| **Game Physics & State**| TypeScript deterministic timestep engine | Operational | `client/src/game/physics.ts`, `engine.ts`, `scoring.ts`, `controllers/` |
| **Multiplayer Authority**| Node.js, Express, Socket.IO | Operational | `server/src/server.ts`, `server/src/rooms/`, `server/src/ai/` |
| **AI Orchestration** | Python 3.14, FastAPI, LangGraph, LangChain, Ollama | Operational | `services/ai-orchestrator/app/` (`main.py`, `graph/`, `tools/`, `retrieval/`) |
| **Local LLM Runtime** | Ollama (`gemma4:e2b`, `gemma4:e4b`) | Operational | Tested via Ollama HTTP API (`localhost:11434`) |
| **Rules Knowledge Base**| ITTF Statutes 2026 clean records & conflict dataset | Operational | `data/rules/processed/ittf_rules.jsonl`, `rule_conflicts.jsonl` |
| **ML Training Pipeline**| Python, NumPy, Scikit-learn, PyTorch-ready configs | Operational | `ml/src/pong_ml/`, `ml/artifacts/checkpoints/gesture_mlp_v1.joblib` |
| **Code Knowledge Graph**| Graphify (AST extraction) | Operational | `graphify-out/graph.json`, `graph.html`, `GRAPH_REPORT.md` |

## 3. Existing Features Reused & Preserved
1. **Game Engine**: Fixed-timestep collision detection, paddle deflection physics, rally counting, and score tracking preserved without regression.
2. **Predictive Opponent**: Mathematical trajectory prediction computing ball intercept point with reaction latency delay.
3. **Webcam Vision**: In-browser GPU-accelerated MediaPipe Hand Landmarker with Exponential Moving Average (EMA) smoothing and calibration.
4. **Multiplayer Backend**: Socket.IO room lifecycle, authoritative ball snapshots, and disconnect/reconnect handling.
5. **AI Provider Abstraction**: `AIProviderManager` in Node.js server seamlessly delegates to the local Python FastAPI orchestrator with fallback to direct Ollama and deterministic rule rules.

## 4. Risks & Mitigations
- **Risk 1: LLM Latency Blocking Real-Time Physics**
  - *Mitigation*: The 60/120 Hz game loop runs 100% on the client CPU/GPU. LangGraph post-match analysis executes asynchronously out-of-band via FastAPI.
- **Risk 2: Dual Model RAM Footprint**
  - *Mitigation*: Both `gemma4:e2b` (7.5GB) and `gemma4:e4b` (9.5GB) are installed. A configurable routing policy (`AUTO_BY_TASK`, `E2B_ONLY`, `E4B_ONLY`, `ON_DEMAND`) manages model loading.
- **Risk 3: Model Hallucinations on Edge-Case Telemetry**
  - *Mitigation*: Deterministic Python validation nodes audit all telemetry before prompt creation. Zero return attempts (`eligibleReturnAttempts == 0`) are set to `None`/`N/A`.
- **Risk 4: Temporal Data Leakage in Gesture ML**
  - *Mitigation*: `make_splits.py` partitions training data strictly by `session_id`, guaranteeing no frame overlap between train and test sets.
- **Risk 5: Webcam Privacy**
  - *Mitigation*: MediaPipe processing is strictly client-side. Zero video frames are transmitted to the server or Ollama.
