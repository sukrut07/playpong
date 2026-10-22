"""
Tests for FastAPI application health and readiness endpoints.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["process_running"] is True
        assert "models_installed" in data
        assert "active_model" in data


@pytest.mark.asyncio
async def test_models_list_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/v1/models")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "configured_models" in data


@pytest.mark.asyncio
async def test_controller_evaluation_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "controller_a": {"name": "Gesture", "samples": 5, "success_rate": 80.0},
            "controller_b": {"name": "Bot", "samples": 250, "success_rate": 85.0},
        }
        response = await client.post("/v1/evaluate/controller", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["sample_size_imbalance"] is True
        assert "Sample size imbalance detected" in data["imbalance_note"]
