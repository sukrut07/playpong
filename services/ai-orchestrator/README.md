# PONG AI — Python AI Orchestration Service (`services/ai-orchestrator/`)

## Overview
A high-performance local AI orchestration service combining FastAPI, LangChain, LangGraph, and Ollama to coordinate dual Gemma 4 models (`gemma4:e2b` and `gemma4:e4b`), deterministic math validation, and versioned ITTF 2026 rule retrieval.

## Architecture
- **Framework**: FastAPI with Pydantic v2 schemas
- **Workflow Engine**: LangGraph `StateGraph` with 11 discrete stages
- **LLM Provider**: LangChain `ChatOllama` adapter targeting `http://localhost:11434`
- **State Checkpointing**: `MemorySaver` in-memory checkpointing for local replay without cloud leakage
- **Rule Retrieval**: `RulesRetriever` querying `data/rules/processed/ittf_rules.jsonl`

## 11-Stage LangGraph Pipeline
1. `validate_request`: Verifies match ID, question, and request format.
2. `load_match_evidence`: Loads authoritative telemetry from the game engine.
3. `compute_metrics`: Calculates return rates, rally stats, and verifies denominators (e.g. zero returns -> `None`).
4. `route_request`: Classifies intent into coaching, analytics Q&A, rules, or controller evaluation.
5. `retrieve_rules_if_needed`: Direct lexical search across verified ITTF 2026 Statutes.
6. `run_approved_analytics_tool`: Queries strictly scoped read-only tools.
7. `select_model`: Selects `gemma4:e2b` or `gemma4:e4b` according to active policy (`AUTO_BY_TASK`, `E2B_ONLY`, etc.).
8. `generate_analysis`: Invokes ChatOllama with evidence-grounded prompt.
9. `validate_analysis`: Deterministically cross-checks referenced metrics and rule citations.
10. `retry_or_fallback`: Bounded retry on format error, or triggers deterministic fallback engine.
11. `finalise_report`: Returns typed, validated coaching report.

## Endpoints
- `GET /health`: Service uptime, Ollama connectivity, and model verification.
- `GET /v1/ready`: Readiness probe for orchestration.
- `GET /v1/models`: Returns installed models, digests, sizes, and active policy.
- `POST /v1/coach/match`: Generates structured coaching report from match stats.
- `POST /v1/analytics/query`: Natural language telemetry Q&A.
- `POST /v1/rules/explain`: Rule retrieval and explanation citing ITTF 2026 sections.
- `POST /v1/evaluate/controller`: Statistical controller benchmark comparison.
- `POST /v1/models/smoke-test`: Executes live smoke test prompt against specified model tag.
- `GET /v1/runs/{run_id}`: Retrieves ephemeral LangGraph run state.

## Running Locally
```bash
cd services/ai-orchestrator
./run.sh
```
Runs on `http://localhost:8000`.

## Testing
```bash
.venv/bin/pytest tests
```
Runs 18 unit and workflow tests.
