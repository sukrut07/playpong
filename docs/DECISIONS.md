# PONG AI — Architecture Decision Records (ADRs)

## ADR 001: Separation of Real-Time Physics from LLM Inference Loop

- **Status**: Accepted
- **Context**: Real-time table tennis gameplay requires continuous collision detection (CCD) and physics integration at a deterministic 60–120 Hz update rate.
- **Decision**: The LLM (LangChain/LangGraph) is strictly isolated from the frame-by-frame physics loop. MediaPipe and the paddle controller execute purely in TypeScript/WebGL on client. The AI orchestrator operates out-of-band on match completion.
- **Consequences**: Zero gameplay lag; game remains playable even if Ollama is unresponsive.

---

## ADR 002: Dual Gemma 4 (E2B vs E4B) Task Routing with Fallback

- **Status**: Accepted
- **Context**: Ollama exposes both `gemma4:e2b` (7.5 GB) and `gemma4:e4b` (9.5 GB). E2B is fast and low-latency; E4B provides superior multi-metric reasoning but higher memory overhead.
- **Decision**: Implement `AUTO_BY_TASK` routing:
  - Lightweight intent classification, rules explanation, and short summaries route to **E2B**.
  - Deep post-match coaching, personalized training plans, and controller evaluations route to **E4B**.
  - If E4B is unavailable or loading, the system automatically falls back to E2B, and if both are offline, engages deterministic fallback.
- **Consequences**: Optimal balance of response latency (<2s for quick tasks) and reasoning depth without exceeding memory limits.

---

## ADR 003: Dedicated Python AI Orchestrator with Node.js Gateway

- **Status**: Accepted
- **Context**: The game client is React/Three.js, while the multiplayer server is Node.js/TypeScript. LangGraph and the official `langchain-ollama` ecosystem are native to Python.
- **Decision**: Create a modular Python service (`services/ai-orchestrator/`) using FastAPI. The Node.js server proxies coaching requests to `http://localhost:8000`, falling back seamlessly if the service is stopped.
- **Consequences**: Clean architectural boundaries; leverages Python's native AI/ML libraries while keeping game logic in TypeScript.

---

## ADR 004: In-Memory Checkpointer for Local Privacy

- **Status**: Accepted
- **Context**: LangGraph workflows support checkpointing and state replay. Cloud tracing services (e.g. LangSmith) can accidentally leak telemetry.
- **Decision**: Use `langgraph.checkpoint.memory.MemorySaver` for ephemeral run persistence in process RAM. Tracing is disabled by default in `.env`.
- **Consequences**: High-speed local state inspection without transmitting user match data over the internet.

---

## ADR 005: Deterministic Evidence Grounding & Zero-Denominator Invariants

- **Status**: Accepted
- **Context**: Language models are prone to hallucinating numbers, dividing by zero, or inventing statistics when sample sizes are small.
- **Decision**: An explicit Python validation node audits all telemetry before LLM prompt generation and cross-checks the LLM's response against the evidence. Zero return attempts result in `None` / `N/A`, and any claim of 100% or 0% return rate on zero attempts is caught and rejected.
- **Consequences**: Factually grounded, auditable coaching reports.
