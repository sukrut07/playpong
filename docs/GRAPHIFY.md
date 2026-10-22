# Graphify Integration & Repository Intelligence Workflow

This document details the Graphify setup, verified CLI commands, generated knowledge graph artifacts, and a real-world dependency tracing example conducted during the development of Gesture Pong AI.

---

## 1. Environment & Installation

Graphify is installed locally using Python `uv`:
```bash
uv tool install graphifyy
graphify --version
# Output: graphify 0.9.93
```

Antigravity agent rules and workflow integration were configured with:
```bash
graphify antigravity install
```
This wrote:
- `.agents/rules/graphify.md`
- `.agents/workflows/graphify.md`
- Local skill registered at `~/.gemini/config/skills/graphify/`

---

## 2. Graph Extraction & Clustered Reports

The codebase graph was extracted using local AST parsing:
```bash
graphify extract . --code-only
graphify cluster-only .
graphify export html
```

### Generated Graph Artifacts
Located in `graphify-out/`:
- **`graph.json`**: 300 nodes, 555 edges across 18 modular communities.
- **`GRAPH_REPORT.md`**: Architectural breakdown of symbols, modules, and cross-boundary dependencies.
- **`graph.html`**: Standalone D3 interactive force-directed graph visualization.

---

## 3. Verified Graph Queries

### Query 1: Tracing Hand Tracking to Paddle Movement
```bash
graphify query "hand tracking racket movement"
```
**Result**: Surfaced the exact chain of AST symbols:
- `client/src/vision/handLandmarker.ts` (`VisionPipeline`, `HandControlCallback`)
- `client/src/vision/smoothing.ts` (`Point2DSmoother`, `OneEuroFilter`)
- `client/src/vision/calibration.ts` (`mapToGameCoordinates`, `CalibrationData`)
- `client/src/vision/gestureDetector.ts` (`GestureDetector`)
- `client/src/App.tsx` (`playerInputRef`)
- `client/src/game/physics/tableTennisEngine.ts` (`TableTennisEngine`)
- `client/src/game/Scene.tsx` (`Scene`)

---

### Query 2: Shortest Path from Vision to Physics Engine
```bash
graphify path "VisionPipeline" "TableTennisEngine" --undirected
```
**Output**:
```text
Shortest path (2 hops):
  VisionPipeline <--imports [EXTRACTED]-- App.tsx --imports [EXTRACTED]--> TableTennisEngine
```
**Insight**: Confirms that `VisionPipeline` and `TableTennisEngine` remain strictly decoupled. `App.tsx` bridges coordinates using a zero-overhead mutable reference (`playerInputRef`), avoiding React render thrashing.

---

### Query 3: Shortest Path from Physics Engine to Local Gemma 4 Service
```bash
graphify path "TableTennisEngine" "OllamaService" --undirected
```
**Output**:
```text
Shortest path (5 hops):
  TableTennisEngine <--imports [EXTRACTED]-- App.tsx --imports_from [EXTRACTED]--> api.ts --imports [EXTRACTED]--> HealthCheckResponse <--imports [EXTRACTED]-- ollama.ts --contains [EXTRACTED]--> OllamaService
```
**Insight**: Validates our architecture requirement: gameplay physics emits events asynchronously; match summaries flow through `api.ts` into `ollama.ts`, ensuring that LLM inference never blocks physics or rendering frames.
