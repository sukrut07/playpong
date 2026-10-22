#!/usr/bin/env bash
# =====================================================================
# PONG AI — Python AI Orchestration Service Launcher
# =====================================================================

set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
else
    source .venv/bin/activate
fi

echo "🏓 Starting PONG AI Local AI Orchestrator on http://0.0.0.0:8000"
echo "🤖 Models: Gemma 4 E2B & E4B (Ollama localhost:11434)"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
