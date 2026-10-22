"""
PONG AI — Local AI Orchestration API Service (FastAPI + LangGraph + Ollama)
"""

import uuid
import time
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .schemas import (
    HealthResponse,
    MatchCoachRequest,
    AnalyticsQueryRequest,
    RuleExplainRequest,
    ControllerEvaluationRequest,
    CoachingReport,
)
from .models.ollama_provider import ollama_provider
from .graph.workflow import pong_ai_workflow
from .tools.rules_tool import RULE_REGISTRY, get_rule_by_id, search_rules


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup verification
    print("[AI Orchestrator] Verifying local Ollama connection...")
    st = await ollama_provider.get_runtime_status()
    print(f"[AI Orchestrator] Ollama Reachable: {st.get('reachable')}, Models: {st.get('models_installed')}")
    yield
    print("[AI Orchestrator] Shutting down.")


app = FastAPI(
    title="PONG AI — AI Orchestration Service",
    description="Local-first AI orchestration with Ollama, Gemma 4 (E2B & E4B), LangChain, and LangGraph",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def get_health():
    """
    Health check distinguishing API process, Ollama reachability, and installed model tags.
    """
    st = await ollama_provider.get_runtime_status()
    models_installed = st.get("models_installed", {})
    e2b_ok = models_installed.get(settings.fast_model, False)
    e4b_ok = models_installed.get(settings.coach_model, False)

    is_ok = st.get("reachable", False) and (e2b_ok or e4b_ok)

    return HealthResponse(
        status="ok" if is_ok else "degraded",
        process_running=True,
        ollama_reachable=st.get("reachable", False),
        models_installed=models_installed,
        active_model=settings.coach_model if e4b_ok else settings.fast_model,
        policy=settings.model_routing_policy.value,
        timestamp=time.time(),
    )


@app.get("/v1/models")
async def list_models():
    """
    Returns Ollama runtime metadata, installed tags, and current routing policy.
    """
    st = await ollama_provider.get_runtime_status()
    return {
        "status": "ok",
        "runtime": "Ollama Local Inference",
        "endpoint": settings.ollama_base_url,
        "policy": settings.model_routing_policy.value,
        "configured_models": {
            "fast_model": settings.fast_model,
            "coach_model": settings.coach_model,
        },
        "runtime_status": st,
    }


@app.get("/v1/ready")
async def check_readiness():
    """
    Returns 200 if Ollama is reachable and at least one Gemma 4 model is ready for inference.
    """
    st = await ollama_provider.get_runtime_status()
    if not st.get("reachable"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Ollama daemon is not reachable at configured endpoint.",
        )

    models_installed = st.get("models_installed", {})
    if not any(models_installed.values()):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Neither {settings.fast_model} nor {settings.coach_model} are installed locally.",
        )

    return {
        "ready": True,
        "reachable": True,
        "models_installed": models_installed,
    }


@app.post("/v1/coach/match", response_model=CoachingReport)
async def generate_match_coaching(request: MatchCoachRequest):
    """
    Primary LangGraph Coaching Workflow.
    Loads match summary, audits telemetry, routes request, retrieves rules, queries Gemma 4,
    validates evidence, and returns a verified coaching report.
    """
    run_id = f"run_{uuid.uuid4().hex[:12]}"
    match_id = request.stats.matchId

    initial_state = {
        "run_id": run_id,
        "match_id": match_id,
        "request_type": "MATCH_COACHING",
        "raw_stats": request.stats.model_dump(),
        "model_override": request.model_override,
        "retry_count": 0,
        "validation_errors": [],
    }

    config = {"configurable": {"thread_id": run_id}}
    final_state = await pong_ai_workflow.ainvoke(initial_state, config=config)

    report = final_state.get("final_report")
    if not report:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=final_state.get("error", "Workflow failed to produce a final report"),
        )

    return report


@app.post("/v1/analytics/query")
async def query_match_analytics(request: AnalyticsQueryRequest):
    """
    Natural Language Analytics Q&A.
    Extracts deterministic telemetry, compares with history, and synthesizes answers via Gemma 4.
    """
    run_id = f"run_{uuid.uuid4().hex[:12]}"
    match_id = request.currentMatch.matchId

    stats_dict = request.currentMatch.model_dump()
    if request.history:
        stats_dict["history"] = [h.model_dump() for h in request.history]

    initial_state = {
        "run_id": run_id,
        "match_id": match_id,
        "request_type": "ANALYTICS_QUERY",
        "question": request.question,
        "raw_stats": stats_dict,
        "model_override": request.model_override,
        "retry_count": 0,
        "validation_errors": [],
    }

    config = {"configurable": {"thread_id": run_id}}
    final_state = await pong_ai_workflow.ainvoke(initial_state, config=config)

    report = final_state.get("final_report", {})
    return {
        "status": "ok",
        "run_id": run_id,
        "question": request.question,
        "answer": report.get("summary", "Analysis completed."),
        "report": report,
    }


@app.post("/v1/rules/explain")
async def explain_rule(request: RuleExplainRequest):
    """
    Versioned ITTF 2026 & Arcade Rule Explanation.
    Directly retrieves approved registry records before generating an explanation.
    """
    rule_id = request.rule_id
    question = request.question or ""
    profile = request.rule_profile or "TABLE_TENNIS_TRAINING"

    rule_record = None
    if rule_id:
        rule_record = get_rule_by_id(rule_id)
    elif question:
        matches = search_rules(question, profile)
        if matches:
            rule_record = matches[0]

    if not rule_record:
        if rule_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Rule ID '{rule_id}' is not registered in the authoritative ITTF or Arcade specifications.",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must provide either rule_id or query question.",
            )

    run_id = f"run_{uuid.uuid4().hex[:12]}"
    mock_stats = {
        "matchId": f"rule_query_{rule_record.rule_id}",
        "ruleProfile": rule_record.rule_set,
        "rule_id": rule_record.rule_id,
    }

    initial_state = {
        "run_id": run_id,
        "match_id": mock_stats["matchId"],
        "request_type": "RULE_EXPLANATION",
        "question": question or f"Explain rule {rule_record.rule_id}: {rule_record.title}",
        "raw_stats": mock_stats,
        "model_override": request.model_override,
        "retry_count": 0,
        "validation_errors": [],
    }

    config = {"configurable": {"thread_id": run_id}}
    final_state = await pong_ai_workflow.ainvoke(initial_state, config=config)

    return {
        "status": "ok",
        "rule": rule_record.model_dump(),
        "explanation": final_state.get("final_report", {}).get("summary"),
        "full_report": final_state.get("final_report"),
    }


@app.post("/v1/evaluate/controller")
async def evaluate_controller(request: ControllerEvaluationRequest):
    """
    Controller Benchmark Interpretation.
    Grounded comparison between controllers (e.g. Gesture vs Predictive Opponent) flagging sample size disparities.
    """
    ctrl_a = request.controller_a
    ctrl_b = request.controller_b

    samples_a = ctrl_a.get("samples", 0)
    samples_b = ctrl_b.get("samples", 0)

    imbalance_flag = False
    imbalance_note = ""
    if samples_a > 0 and samples_b > 0:
        ratio = max(samples_a, samples_b) / min(samples_a, samples_b)
        if ratio > 5.0:
            imbalance_flag = True
            imbalance_note = f"Sample size imbalance detected ({samples_a} vs {samples_b}). Statistical claims of superiority are invalid."

    return {
        "status": "ok",
        "sample_size_imbalance": imbalance_flag,
        "imbalance_note": imbalance_note,
        "comparison": {
            "controller_a": ctrl_a,
            "controller_b": ctrl_b,
        },
        "verdict": (
            "Insufficient balanced data"
            if imbalance_flag
            else "Balanced comparison completed"
        ),
    }


@app.get("/v1/runs/{run_id}")
async def get_run(run_id: str):
    """
    Inspects stored execution state for a given run ID from the LangGraph memory checkpointer.
    """
    config = {"configurable": {"thread_id": run_id}}
    try:
        snapshot = pong_ai_workflow.get_state(config)
        if not snapshot or not snapshot.values:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Run '{run_id}' not found in checkpointer.",
            )
        return {
            "run_id": run_id,
            "stage": snapshot.values.get("current_stage"),
            "status": snapshot.values.get("status"),
            "state": snapshot.values,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run '{run_id}' not found: {str(e)}",
        )


@app.post("/v1/models/smoke-test")
async def smoke_test(model: str = Query(default="gemma4:e2b")):
    """
    Executes a short smoke test query on the specified model.
    """
    result = await ollama_provider.smoke_test_model(model)
    return result
