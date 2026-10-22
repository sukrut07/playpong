"""
Tests for model routing policies and task-based model selection.
"""

import pytest
from app.models.ollama_provider import OllamaProvider, TaskType
from app.config import ModelRoutingPolicy


@pytest.mark.asyncio
async def test_explicit_model_override():
    provider = OllamaProvider()
    tag, reason = await provider.select_model_for_task(
        task_type="MATCH_COACHING", model_override="custom:test-model"
    )
    assert tag == "custom:test-model"
    assert "Explicit model override" in reason


@pytest.mark.asyncio
async def test_e2b_only_policy(monkeypatch):
    provider = OllamaProvider()
    provider.policy = ModelRoutingPolicy.E2B_ONLY

    tag, reason = await provider.select_model_for_task(task_type="MATCH_COACHING")
    assert tag == provider.fast_model
    assert "E2B_ONLY" in reason


@pytest.mark.asyncio
async def test_auto_by_task_fast_summary():
    provider = OllamaProvider()
    provider.policy = ModelRoutingPolicy.AUTO_BY_TASK

    tag, reason = await provider.select_model_for_task(task_type=TaskType.FAST_SUMMARY.value)
    # E2B is preferred for fast summary
    assert tag == provider.fast_model
    assert "Fast task" in reason or "AUTO_BY_TASK" in reason
