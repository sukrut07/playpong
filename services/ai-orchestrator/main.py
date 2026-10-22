"""
PONG AI — AI Orchestrator Vercel Entrypoint
Re-exports the FastAPI app instance from app.main for standard framework discovery.
"""

from app.main import app

__all__ = ["app"]
