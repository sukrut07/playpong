# PONG AI — Node.js Multiplayer Server & Authority Backend

## Technologies
- **Runtime**: Node.js v18+ with TypeScript
- **Server Framework**: Express.js with HTTP server
- **Real-Time Network**: Socket.IO with 60 Hz tick loop
- **AI Integration**: HTTP client bridging to Python FastAPI Orchestration Service (`http://localhost:8000`) with fallback to local Ollama and deterministic rule engine

## Core Modules
1. **Multiplayer Authority (`src/rooms/`)**:
   - `RoomManager.ts`: Manages 4-letter alphanumeric room codes, player pairing, readiness checks, and session cleanup.
   - Authoritative ball physics and scoring prevent client-side score tampering.
2. **AI Provider Manager (`src/ai/`)**:
   - `orchestratorAdapter.ts`: Bridges client coaching requests to the local Python FastAPI orchestrator (`POST /v1/coach/match`).
   - `ollamaAdapter.ts`: Direct fallback client to Ollama (`http://localhost:11434`) if the Python orchestrator is offline.
   - `geminiAdapter.ts`: Hosted cloud fallback option if configured.
   - `providerManager.ts`: Health monitoring and automatic degradation to deterministic rule-grounded coaching.
3. **REST Endpoints (`src/routes/`)**:
   - `GET /health`: Overall server and provider health.
   - `POST /api/coach/summary`: Generates structured coaching report.
   - `POST /api/coach/ask`: Natural language telemetry Q&A.
   - `GET /api/coach/orchestrator/status`: Live proxy of Python orchestrator and Ollama model status.

## Running Locally
```bash
npm run dev --prefix server
```
Runs on `http://localhost:3001`.
