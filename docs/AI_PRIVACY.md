# PONG AI — Data Privacy & Local-First AI Architecture

## 1. Core Privacy Commitments

PONG AI is built upon an uncompromising **local-first privacy architecture**. All machine vision tracking, game simulation, and language model inference run locally on the user's personal workstation.

```
Camera Sensor (Client)
  │
  ▼
MediaPipe WebGL (In-Browser Memory)
  │
  ├─ Raw Frames: DISCARDED IMMEDIATELY after landmark extraction.
  │              Never saved to disk. Never sent across the network.
  ▼
Normalized Coordinates (x, y, confidence)
  │
  ▼
Physics Engine (TypeScript Local Memory)
  │
  ▼
Aggregated Telemetry (Score, return counts, zone counts)
  │
  ▼
AI Orchestrator (FastAPI on localhost:8000)
  │
  ▼
Local Ollama Runtime (localhost:11434)
  │
  └─ Weights: Run locally on Apple Silicon (MLX) / CUDA.
     Zero telemetry sent to external model providers or cloud servers.
```

---

## 2. Webcam Video Isolation

- **Client-Side Only**: Raw video frames from the player's webcam are captured by an HTML5 `<video>` element and processed in-memory by `@mediapipe/tasks-vision`.
- **No Video Exfiltration**: Neither video frames, canvas snapshots, nor face/hand textures are ever transmitted to the Node.js server, the Python AI Orchestrator, or Ollama.
- **Payload Boundary**: The only data passed to the AI Orchestrator is high-level numeric match telemetry (e.g., `playerScore: 11, returnSuccessRate: 75.0%`).

---

## 3. LangSmith & Cloud Observability Disablement

- **Default Off**: LangSmith tracing, LangChain telemetry, and cloud logging are explicitly disabled (`AI_ENABLE_TRACING=false`, `LANGCHAIN_TRACING_V2=false` in `.env`).
- **In-Memory Checkpointer**: Graph execution history is saved inside an in-memory checkpointer (`langgraph.checkpoint.memory.MemorySaver`) that exists solely in local process RAM and clears upon service restart.

---

## 4. Telemetry Hygiene

- Match records stored in local browser `localStorage` or SQLite/JSON do not contain user credentials, IP addresses, or geographic locations.
- Training datasets (`models/datasets/`) are rigorously sanitized of any timestamps or player identifiers before evaluation.
