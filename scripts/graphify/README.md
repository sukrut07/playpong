# Graphify Codebase Knowledge Graph Integration

This project utilizes [Graphify](https://github.com/Graphify-Labs/graphify) to extract, analyze, and query an AST-derived knowledge graph of the entire PONG AI repository.

---

## 1. Generated Artifacts

Graphify generates artifacts inside `graphify-out/`:

- `graphify-out/graph.json`: Machine-readable node and link graph conforming to Graphify Schema v1 (currently 1,441 nodes, 2,698 edges, 106 communities).
- `graphify-out/graph.html`: Standalone interactive browser visualization.
- `graphify-out/GRAPH_REPORT.md`: Architectural summary including god nodes, dependency bottlenecks, cluster communities, and structural analysis.
- `graphify-out/wiki/`: Wiki markdown documents detailing modules and clusters.

---

## 2. CLI Workflow & Scripts

The following scripts are registered in the root `package.json`:

```bash
# Perform an incremental AST re-extraction (fast, no LLM required)
npm run graphify:update
# or directly:
graphify update .

# Initial extraction from code files
npm run graphify:extract
# or directly:
graphify extract . --code-only

# Semantic graph query
npm run graphify:query "How does TableTennisEngine integrate with frontend?"
# or directly:
graphify query "TableTennisEngine"
```

---

## 3. Frontend Architecture Explorer Integration

The PONG AI frontend (`/architecture`) renders the actual Graphify knowledge graph in a neo-brutalist interface:

1. **API Delivery**: The Express server (`server/src/index.ts`) serves:
   - `GET /api/graph`: Returns `graphify-out/graph.json`
   - `GET /api/graph/report`: Returns `graphify-out/GRAPH_REPORT.md`
2. **Static Fallback**: If the backend server is stopped during development, `frontend/src/services/graphify-service.ts` seamlessly loads `frontend/public/graphify/graph.json`.
3. **Module Grouping**: Nodes are categorized by their real physical package boundaries:
   - **Frontend UI & Components** (`frontend/src/...`)
   - **Game Engine & Physics** (`game-engine/src/...`)
   - **Node.js Express & WebSocket Server** (`server/src/...`)
   - **Python AI Orchestrator & LangGraph** (`services/ai-orchestrator/...`)
   - **Shared Contracts & ITTF Rules** (`shared/...`)
