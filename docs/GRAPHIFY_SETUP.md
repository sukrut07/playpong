# Graphify Setup & Codebase Knowledge Graph Integration

## Overview
Graphify provides a developer-facing code knowledge graph that extracts relationships directly from source-code Abstract Syntax Trees (ASTs) rather than hallucinating conceptual architecture.

In PONG AI, Graphify inspects the real relationships between:
- Client React components and Three.js game scenes
- Vision processing and MediaPipe hand landmarking
- Node.js authoritative multiplayer rooms
- Python FastAPI AI orchestration and LangGraph workflows
- ITTF Statutes 2026 rule registries and ML training modules

## Generated Graphify Artifacts
All Graphify outputs are saved under `graphify-out/`:
- `graphify-out/graph.json`: Machine-readable graph structure containing nodes, edges, labels, weights, and community clusters.
- `graphify-out/graph.html`: Interactive browser-based visual graph explorer.
- `graphify-out/GRAPH_REPORT.md`: Comprehensive architectural report identifying hubs, god nodes, and community clusters.

## Current Graph Metrics
- **Nodes**: 990
- **Edges**: 1817
- **Communities**: 70
- **Primary Hubs**: `client/src/App.tsx`, `client/src/vision/handLandmarker.ts`, `server/src/server.ts`, `services/ai-orchestrator/app/main.py`

## Commands & Workflows

### 1. Re-extract Code Graph (AST-only, no API cost)
```bash
graphify update .
```
Or use the npm script:
```bash
npm run graphify:extract
```

### 2. Query the Knowledge Graph via CLI
```bash
graphify query "how does mediapipe hand control connect to physics"
```

### 3. Query Shortest Paths between Modules
```bash
graphify path "VisionPipeline" "PhysicsEngine"
```

### 4. Interactive Browser Exploration
Open `graphify-out/graph.html` in any browser or launch the local static server:
```bash
open graphify-out/graph.html
```

## Maintenance Rule
As specified in `.agents/rules/graphify.md`, after modifying code files in any development session, run `graphify update .` to ensure the knowledge graph stays 100% current with git HEAD.
