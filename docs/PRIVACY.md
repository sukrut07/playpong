# PONG AI — Privacy, Security & Data Handling Policy

## 1. Computer Vision & Webcam Data
- **Client-Side Execution**: All webcam video feeds are captured via `navigator.mediaDevices.getUserMedia` and processed strictly in-browser using `@mediapipe/tasks-vision` via WebAssembly.
- **Zero Video Uploads**: Video streams and individual raw frames are **never** transmitted over the network, recorded to disk, or sent to any server or AI provider.
- **Landmark Coordinates**: Only normalized 3D numeric landmark coordinates ($x, y, z$) are used by the paddle controller and calibration system.
- **Camera Disable Fallback**: Users can play the full game without granting camera permissions using keyboard controls (`[WASD]` or Arrow keys + `[Space]` serve).

---

## 2. AI Inference & Telemetry Disclosure
- **Aggregated Stats Only**: The Gemma 4 coach receives only structured telemetry summaries:
  - Numerical counts (points won, total returns, rally lengths, reaction times).
  - Categorical distribution (table zone placement, difficulty level).
  - Tracking availability percentage (e.g. 96.2%).
- **No Biometrics or Facial Data**: Hand landmarks or facial features are **never** sent to the AI endpoint.
- **Hosted vs. Local Disclosure**:
  - **Hosted Gemini API**: Match summaries are sent to Google's Gemini API with configured Gemma 4 model identifier. The active provider and model identifier are explicitly badged in the UI.
  - **Local Ollama Inference**: All telemetry stays on the user's localhost (`http://localhost:11434`).
- **No Third-Party Analytics Trackers**: No Google Analytics, Facebook Pixel, or telemetry trackers are loaded.

---

## 3. Local Storage & Data Retention
- Match history, calibration coordinates, and audio preferences are persisted exclusively in the browser's `window.localStorage`.
- A one-click "Reset All Local Data" button is provided in Settings to immediately purge all stored matches and calibration offsets.
