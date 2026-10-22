# Architecture & Technical Design — Gesture Pong AI

## 1. High-Level System Architecture

Gesture Pong AI is a local-first, low-latency 3D table-tennis arcade application combining computer vision, 3D graphics, deterministic physics, and local LLM orchestration.

```mermaid
graph TD
    subgraph Browser Frontend (React + Three.js + MediaPipe)
        CAM[Webcam Device] -->|getUserMedia| VID[HTML Video Element]
        VID -->|detectForVideo| MP[MediaPipe Hand Landmarker]
        MP -->|21 3D Landmarks| CALIB[Calibration & Coordinate Mapper]
        CALIB -->|Normalized [-1,1]| FILT[One Euro Filter & EMA]
        FILT -->|Smoothed Coordinates| GEST[Gesture & Velocity Detector]
        GEST -->|HandControlState| CTRL[Player Paddle Controller]
        KB[Keyboard/Mouse Fallback] -.->|WASD / Space| CTRL
        
        CTRL -->|x,y,swing| PHYS[Continuous Collision Physics Engine]
        PHYS -->|Trajectory & Substeps| SCENE[Three.js / R3F Canvas]
        SCENE -->|Render Loop| DISP[Display Viewport]
        
        PHYS -->|Match Events| ANALYTICS[Event-Driven Match Analytics]
        ANALYTICS -->|Local Storage| STORE[(Local Storage)]
        ANALYTICS -->|State Updates| HUD[React HUD & Scoreboard]
    end

    subgraph Local Backend (Express + TypeScript)
        API_CLIENT[Client API Client] -->|HTTP /api/coach| ROUTER[Express Coach Router]
        ROUTER -->|Stats & History| PROMPT[Prompt Builder]
        PROUTER[Schema Validator] -->|Zod Validation| ROUTER
        PROMPT -->|Prompt + JSON Schema| OLLAMA_SRV[Ollama Service]
    end

    subgraph Local AI Engine
        OLLAMA_SRV -->|HTTP localhost:11434| OLLAMA[Local Ollama Daemon]
        OLLAMA -->|MLX Metal Inference| GEMMA[Google Gemma 4:e2b]
        GEMMA -->|Structured JSON Output| OLLAMA_SRV
    end
```

## 2. Component Subsystems

### 2.1 Computer Vision Pipeline
- **MediaPipe Hand Landmarker**: Runs in `VIDEO` mode on client hardware via WebAssembly and GPU acceleration.
- **Anchor Point**: Uses the midpoint between wrist (landmark 0) and the middle MCP knuckle (landmark 9) to ensure stable, jitter-free paddle positioning.
- **Coordinate Calibration**: Maps the player's physical reaching boundary (`minX`, `maxX`, `minY`, `maxY`) to normalized 3D paddle bounds with automatic horizontal mirroring.
- **One Euro Filter**: Uses frequency-adaptive low-pass filtering. High smoothing at low velocity eliminates micro-tremors; low smoothing at high velocity guarantees zero-lag response during rapid swings.

### 2.2 3D Game Physics Engine
- **Deterministic Continuous Collision Detection (CCD)**: Sub-steps ball trajectory into 4 discrete micro-steps per frame (up to 240 physics evaluations/sec).
- **Table Dimensions**: Regulation 2.74m length × 1.525m width × 0.76m height.
- **Restitution & Spin**: Restitution factor of 0.88 for table surface; paddle contact velocity incorporates deflection angle and player swing velocity.
- **Rally State Machine**:
  `READY` ➔ `SERVE` ➔ `RALLY` ➔ `POINT_END` ➔ `MATCH_OVER`

### 2.3 Local Gemma 4 Coach via Ollama
- **Endpoint**: Local HTTP API at `http://localhost:11434`.
- **Model**: `gemma4:e2b` running natively on Apple Silicon with MLX runner.
- **Structured Output**: Strictly enforced with Zod schemas (`MissionSchema`, `CoachSummarySchema`).
- **Zero Hallucination Constraint**: Prompts explicitly forbid inventing unmeasured physical biometric stats.
- **Resilience**: 9-second timeout safety net with graceful fallback to deterministic curated missions and advice.

### 2.4 Performance Analytics
- **Event-Driven Log**: Records every `serve_started`, `ball_hit_player`, `ball_bounce_table`, `point_won`, and `match_completed`.
- **Metrics Computed**:
  - Return Accuracy (%)
  - Peak Rally Streak
  - Reaction Time (ms from opponent impact to player paddle strike)
  - Table Zone Placement Heatmap (Left, Center, Right, Deep, Short)
  - Career Win/Loss Records & Session Aggregates
