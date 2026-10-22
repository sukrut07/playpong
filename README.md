# PONG AI 🏓🤖
### 3D Gesture-Controlled Racket Arcade · Gemma 4 Intelligence · ITTF 2026 Rules · Graphify Architecture

A playable, browser-based 3D racket game combining webcam-based hand tracking, deterministic AI opponent simulation, Gemma 4-powered coaching, auditable analytics, a traceable rule engine, and an in-app Graphify codebase knowledge graph.

---

## 🌟 Key Capabilities

1. **Perception — Webcam Hand Tracking & Gesture Lab**:
   - Browser-side 21 3D joint hand landmarking via MediaPipe Tasks Vision at 60 FPS.
   - Frequency-adaptive **One Euro Filter** eliminating micro-tremors at rest with zero lag during rapid swings.
   - Guided 5-step reaching calibration with coordinate clamping and horizontal mirroring.
   - Dedicated **Gesture Lab** with real-time skeleton visualizer, filter parameter tuning, diagnostics (FPS, latency, dropped frames), and experimental stroke sequence classifier (`IDLE`, `READY`, `FOREHAND`, `BACKHAND`, `SMASH`).
   - Seamless keyboard fallback (`[WASD / Arrow Keys]` + `[Space]` to serve) with camera-disabled mode.

2. **Control & Simulation — Deterministic Physics Arena**:
   - Built with Three.js and custom continuous collision detection (CCD, 4 substeps/frame) preventing high-velocity tunneling.
   - Two selectable rule profiles:
     - `TABLE_TENNIS_TRAINING`: 11-point games, 2-point deuce lead, alternating serves every 2 points (or 1 at deuce), based on **ITTF Statutes 2026 Chapter 2: The Laws of Table Tennis**.
     - `ARCADE_PONG`: Fast-paced arcade collisions with lateral wall rebounds, first to 7 points.
   - Deterministic AI opponent with three calibrated tiers (*Easy*, *Medium*, *Hard*) adjusting reaction latency, paddle speed, and prediction noise.
   - Seeded PRNG for reproducible physics benchmarks.

3. **Reasoning — Gemma 4 as the Intelligence Layer**:
   - Replaceable inference provider architecture:
     - **Hosted Gemini API (Cloud)**: Google AI integration with official `gemma-4-26b-a4b-it` or `gemma-4-31b-it` model identifiers.
     - **Local Ollama Runtime (On-Device)**: Private local inference running `gemma4:e2b` via Apple Silicon / GPU acceleration.
   - Evidence-grounded coaching reports:
     - Structured JSON validated via strict Zod schemas (`summary`, `observations[]`, `evidence[]`, `weaknesses[]`, `recommendations[]`, `training_plan[]`, `rule_references[]`, `limitations[]`).
     - Distinguishes observed facts from hypotheses.
     - Maps performance deficiencies to official ITTF 2026 rule citations.
     - Graceful deterministic fallback ensures zero crash and honest telemetry when offline.
   - Interactive Natural Language Analytics Q&A: Players can query match evidence directly ("*Why did I lose my rallies?*", "*How was my reaction time?*").

4. **Analytics — Auditable Mathematical Metric Contracts**:
   - Strictly defined denominators with explicit zero-handling:
     - $\text{Return Success Rate} = \frac{\text{successful\_returns}}{\text{eligible\_return\_attempts}}$ (returns `null` / `Insufficient Data` if 0 attempts; never a misleading `0%`).
     - $\text{Miss Rate} = \frac{\text{missed\_returns}}{\text{eligible\_return\_attempts}}$ ($\text{Return Success Rate} + \text{Miss Rate} = 100\%$).
     - $\text{Average Rally Length} = \frac{\text{total\_counted\_contacts}}{\text{completed\_rallies}}$.
   - **Analytics Studio**: Recharts visual histograms, table zone distribution charts (Left, Center, Right, Deep, Short), and a 50-trial benchmark runner measuring baseline controller interception error and reaction delay.

5. **Explainability — Traceable Rule Registry & Graphify Architecture**:
   - **Rules Explorer**: Versioned rule registry with search, status filters (`IMPLEMENTED_AND_TESTED`, `PARTIALLY_SIMULATED`, `DOCUMENTED_ONLY`), limitations disclosure, and clickable ITTF 2026 citations.
   - **Architecture Explorer**: In-app knowledge graph explorer powered by real **Graphify** output (`graphify-out/graph.json` with 563 nodes, 1109 edges, 29 communities). Search nodes, inspect god nodes, trace dependencies, and view community clusters.

6. **Multiplayer — Server-Authoritative Socket.IO**:
   - Real-time online Player vs Player matches using 4-letter room codes.
   - 60Hz server tick with authoritative scoring and physics validation preventing client-side score spoofing.

7. **Aesthetic — Neo-Brutalist Arcade UI**:
   - Warm cream background (`#FAF6EB`), near-black outlines (`#121212`), offset hard shadows (`4px 4px 0px #121212`), electric lime accents (`#CCFF00`), lavender panels (`#E4DCFF`), and peach highlights (`#FF7A59`).

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24.13.0)
- **Webcam**: Any built-in or USB camera (optional, keyboard fallback included)
- **Gemini API Key** (optional for cloud Gemma 4) OR **Ollama** (optional for local Gemma 4):
  - Cloud: Set `GEMINI_API_KEY` in `server/.env`
  - Local: Run `ollama run gemma4:e2b`

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/sukrut07/pong.git
cd pong

# Install dependencies across root, server, and client
npm install
npm install --prefix server
npm install --prefix client
```

### 3. Environment Configuration
Copy the example environment configuration:
```bash
cp .env.example server/.env
```
Edit `server/.env`:
```env
PORT=3001
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMMA_MODEL_ID=gemma-4-26b-a4b-it
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:e2b
```
*(Note: If no API key is provided, the application engages its deterministic rules-grounded fallback engine—it never crashes or invents fabricated metrics).*

### 4. Running Locally
Run both client and backend server concurrently:
```bash
npm run dev
```
- **Web Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API & Multiplayer**: [http://localhost:3001](http://localhost:3001)

---

## 🧪 Automated Testing & Verification

Run the full automated test suite (20 unit and integration tests):
```bash
npm test
```

Or run tests individually:
```bash
# Server tests (Gemma 4 adapter, schema validation, fallback logic, HTTP endpoints)
npm run test --prefix server

# Client tests (Physics CCD, OneEuroFilter, calibration, metric contracts, ITTF rules)
npm run test --prefix client
```

Build production bundles:
```bash
npm run build --prefix client
npm run build --prefix server
```

---

## 📊 Graphify Codebase Knowledge Graph

This repository utilizes **Graphify** for AST code analysis, dependency mapping, and god node detection.

```bash
# Update the knowledge graph after code changes
graphify update .

# Query the codebase architecture
graphify query "MediaPipe hand tracking to table tennis racket"
graphify path "VisionPipeline" "TableTennisEngine"

# View the full interactive D3 knowledge graph
open graphify-out/graph.html
```

Within the web application, click **Architecture** on the main menu to open the interactive in-app Graphify explorer.

---

## 🎬 Hackathon Demo Script (3-Minute Tour)

1. **Launch Screen**:
   - Observe the neo-brutalist arcade marquee.
   - Check the top-right AI status pill (displays active provider and model identifier).
   - Select **ITTF Statutes 2026** rule profile and **Medium** difficulty.
2. **Gesture Lab**:
   - Click **Gesture Lab**. Permit camera access.
   - Observe the 21-point hand landmark skeleton, OneEuroFilter jitter reduction, live latency (ms), and FPS counter.
   - Test stroke classification (`FOREHAND`, `BACKHAND`, `SMASH`).
3. **Gameplay**:
   - Start match with webcam or keyboard `[WASD]`. Press `[Space]` to serve.
   - Play a rally; observe the dynamic mission card, ball trajectory trails, and sound effects.
   - Complete the match (first to 11 in ITTF mode, or first to 7 in Arcade mode).
4. **Gemma 4 Coaching Debrief**:
   - Inspect the post-match debrief. Review observed facts, evidence benchmarks, identified weaknesses, and ITTF citations.
   - Type a question in the Natural Language Analytics Assistant (e.g. "*Why did I miss my returns?*") and receive an answer grounded in the actual match numbers.
5. **Rules & Architecture Explorers**:
   - Open **Rules Explorer** to inspect ITTF §2.1–§2.12 provisions and verification test badges.
   - Open **Architecture** to explore the 563-node Graphify knowledge graph.

---

## 📜 Documentation Index

- [Architecture Design](docs/ARCHITECTURE.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
- [Architectural Decisions (ADR)](docs/DECISIONS.md)
- [Analytics & Metric Contracts](docs/ANALYTICS_SPEC.md)
- [ITTF 2026 Rules Traceability](docs/RULES_TRACEABILITY.md)
- [Privacy & Data Minimization](docs/PRIVACY.md)
- [Testing & Quality Assurance](docs/TESTING.md)
- [Third-Party Software & Licenses](docs/THIRD_PARTY_NOTICES.md)

---

## ⚖️ License
This project is licensed under the Apache 2.0 License. See [docs/THIRD_PARTY_NOTICES.md](docs/THIRD_PARTY_NOTICES.md) for third-party libraries and model licenses.
