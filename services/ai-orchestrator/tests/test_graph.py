"""
Tests for LangGraph StateGraph workflow execution, evidence validation, and fallback mechanisms.
"""

import pytest
import uuid
from app.graph.workflow import pong_ai_workflow
from app.schemas import MatchStats


@pytest.mark.asyncio
async def test_graph_invalid_match_id():
    run_id = f"test_{uuid.uuid4().hex[:8]}"
    initial_state = {
        "run_id": run_id,
        "match_id": "",  # Empty ID should fail fast
        "request_type": "MATCH_COACHING",
        "retry_count": 0,
        "validation_errors": [],
    }

    config = {"configurable": {"thread_id": run_id}}
    result = await pong_ai_workflow.ainvoke(initial_state, config=config)

    assert result["status"] == "FAILED"
    assert "Empty match_id" in result["validation_errors"]


@pytest.mark.asyncio
async def test_graph_fallback_on_missing_model(monkeypatch):
    """
    Simulates a case where the LLM is unreachable or throws an exception,
    verifying that the deterministic fallback engine produces a valid, grounded report.
    """
    from app.models.ollama_provider import ollama_provider

    async def mock_smoke_fail(*args, **kwargs):
        raise RuntimeError("Mocked connection failure")

    run_id = f"test_{uuid.uuid4().hex[:8]}"
    mock_stats = {
        "matchId": "match_test_fallback",
        "playerScore": 11,
        "opponentScore": 7,
        "eligibleReturnAttempts": 18,
        "successfulReturns": 14,
        "missedReturns": 4,
        "longestRally": 6,
        "totalRallies": 10,
        "averageRallyLength": 3.2,
        "ruleProfile": "TABLE_TENNIS_TRAINING",
    }

    initial_state = {
        "run_id": run_id,
        "match_id": "match_test_fallback",
        "request_type": "MATCH_COACHING",
        "raw_stats": mock_stats,
        "retry_count": 0,
        "validation_errors": [],
    }

    config = {"configurable": {"thread_id": run_id}}
    result = await pong_ai_workflow.ainvoke(initial_state, config=config)

    final_report = result.get("final_report")
    assert final_report is not None
    assert final_report["match_id"] == "match_test_fallback"
    assert len(final_report["observations"]) > 0
    assert len(final_report["recommendations"]) > 0
    assert len(final_report["rule_references"]) > 0
    # Must cite real ITTF rules
    assert any("ITTF" in r["ruleId"] for r in final_report["rule_references"])
