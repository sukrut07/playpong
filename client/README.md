# PONG AI — Web Client & 3D Game Frontend

## Technologies
- **Framework**: React 18 with Vite 5
- **3D Engine**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Computer Vision**: MediaPipe Tasks-Vision (`@mediapipe/tasks-vision`) WebAssembly / WebGL GPU delegate
- **Styling**: Neo-brutalist theme using Tailwind CSS
- **Icons**: Lucide React
- **Network**: Socket.IO client (`socket.io-client`) for real-time multiplayer

## Core Subsystems
1. **Vision Pipeline (`src/vision/`)**:
   - `handLandmarker.ts`: Initializes MediaPipe HandLandmarker with GPU delegate. Processes webcam feed at 60 FPS.
   - `calibration.ts`: 5-step reaching calibration mapping wrist/palm coordinates to arena boundaries with horizontal mirroring.
   - `smoothing.ts`: Frequency-adaptive exponential smoothing filter eliminating micro-jitter at rest while preserving rapid swing responsiveness.
   - `gestureDetector.ts`: Kinematic detector computing swing velocity and finger extension.
2. **Game Simulation (`src/game/`)**:
   - `PongScene.tsx`: 3D arena container, lighting, camera controls.
   - `Ball.tsx`: 3D ball mesh, shadow projection, and visual trail.
   - `Paddle.tsx`: Player and opponent rackets with custom materials.
3. **Views (`src/components/views/`)**:
   - `AIOrchestratorView.tsx`: Tabbed dashboard for local Ollama health, active routing mode, LangGraph 11-stage pipeline visualizer, and empirical benchmark viewer.
   - `DashboardView.tsx`: Recharts analytics, rally distributions, and zone dominance.
   - `GameView.tsx`: Fullscreen game HUD with scores, rally count, camera preview, and calibration overlay.

## Running Locally
```bash
npm run dev --prefix client
```
Runs on `http://localhost:5173`.
