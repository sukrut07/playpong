# PONG AI — Architecture & Design Decisions (ADR)

## ADR 001: Gemma 4 as the Intelligence Layer (Not a Chatbot)
- **Status**: Accepted
- **Context**: LLMs in games are often relegated to decorative conversational widgets that have no access to actual game mechanics or player telemetry.
- **Decision**: Gemma 4 is integrated as an evidence-grounded reasoning engine. It receives validated structured match telemetry (event counts, rally length distributions, hit/miss ratios, reaction times, gesture availability) and produces structured JSON coaching reports with explicit observations, empirical evidence, weakness diagnoses, actionable training exercises, and ITTF rule references.
- **Consequences**: Game outcomes and scoring remain 100% deterministic and authoritative. The AI interprets evidence rather than calculating physics.

---

## ADR 002: Dual Inference Deployment Strategy (Gemini API & Local Ollama)
- **Status**: Accepted
- **Context**: The hackathon specification mandates open-weight Gemma 4 through the official Gemini API (`gemma-4-26b-a4b-it` or `gemma-4-31b-it`), while also maintaining developer flexibility for offline/local execution through Ollama.
- **Decision**: Implement a replaceable `AICoachProvider` abstraction in the backend:
  1. `GeminiGemmaProvider`: Calls the official Gemini API with supported Gemma 4 model identifiers. The API key is securely held server-side (`GEMINI_API_KEY`).
  2. `OllamaGemmaProvider`: Calls local Ollama daemon (`http://localhost:11434`) running `gemma4:e2b`.
- **Consequences**: Clear separation between hosted API and local inference. The UI transparently communicates which provider is active and never claims hosted inference is offline.

---

## ADR 003: Dual Rule Profiles (ARCADE_PONG vs TABLE_TENNIS_TRAINING)
- **Status**: Accepted
- **Context**: Table tennis rules (ITTF Statutes 2026) are intricate and involve real-world physical constraints (e.g. ball tossed 16cm vertically from palm, unbroken visibility to receivers) that cannot be fully verified from a single 2D webcam and simplified 3D Pong geometry.
- **Decision**: Maintain two distinct rule profiles:
  1. `ARCADE_PONG`: Fast-paced arcade table tennis with simplified scoring, wall bounces, and instant serves.
  2. `TABLE_TENNIS_TRAINING`: Aligned with official ITTF Statutes 2026 (Chapter 2 Laws of Table Tennis). Rules that can be simulated (table dimensions, net height, alternating serve, edge balls, deuce scoring) are marked `IMPLEMENTED_AND_TESTED` or `PARTIALLY_SIMULATED`. Rules requiring human umpires or high-speed multi-camera setups (e.g. 16cm toss legality) are categorized as `DOCUMENTED_ONLY` with honest disclosures.
- **Consequences**: No misleading claims of official umpiring or certification. High academic and sporting credibility.

---

## ADR 004: Neo-Brutalist Arcade Visual Design System
- **Status**: Accepted
- **Context**: Standard AI demos often rely on generic dark-mode dashboards with excessive gradients, rounded cards, and visual clutter.
- **Decision**: Adopt a distinct Neo-Brutalist Arcade aesthetic:
  - Warm cream canvas background (`#FAF6EB`)
  - Thick, near-black solid outlines (`#121212`, 2.5px - 3px)
  - Offset hard shadows (`3px 3px 0px #121212`, `4px 4px 0px #121212`)
  - High-energy accent colors: Electric Lime (`#CCFF00`), Lavender (`#E4DCFF`), Peach (`#FF6B4A`), Violet (`#6D28D9`)
  - Monospace technical labels and bold display typography (`Outfit`, `JetBrains Mono`)
- **Consequences**: High visual contrast, memorable gaming feel, and clear accessibility.

---

## ADR 005: Deterministic Continuous Collision Physics Engine
- **Status**: Accepted
- **Context**: A 60 FPS update rate has ~16.6ms intervals. At ball speeds of 6-10 m/s, the ball moves 10-17 cm per frame, which can cause tunneling through thin paddles or the table surface.
- **Decision**: Custom deterministic simulation layer with 4 sub-steps per frame (up to 240 physics evaluations/sec). Ball trajectory is interpolated along micro-steps to guarantee precise continuous collision detection without requiring heavy external physics libraries like Cannon or Rapier.
- **Consequences**: Lightweight bundle, zero physics tunneling, deterministic replayability for benchmark testing.

---

## ADR 006: Graphify Knowledge Graph Integration
- **Status**: Accepted
- **Context**: Codebase architecture is often documented in stale static diagrams that diverge from reality.
- **Decision**: Use Graphify to extract the real AST knowledge graph (`graphify-out/graph.json`). Provide an interactive in-app Architecture Explorer that reads this live JSON file to visualize component hubs, god nodes, and cross-module relationships directly to the user and hackathon judges.
- **Consequences**: Automatic architectural transparency with verified freshness from git HEAD.
