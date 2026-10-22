# PONG AI — Gesture Control Testing & Dry Run Guide

This document describes the test methodology, automated unit testing, synthetic dry-run procedures, and manual real-webcam validation steps for the PONG AI gesture tracking controller.

---

## 1. Architecture Overview

The PONG AI vision pipeline operates completely **on-device in the browser**:

```
[Webcam Stream] OR [Synthetic Landmark Generator]
       │
       ▼
[MediaPipe HandLandmarker] (@mediapipe/tasks-vision 0.10.22)
       │
       ▼ (21 normalized 3D landmarks)
[Landmark Validator & Anchor Extraction] (extractPalmAnchor)
       │
       ▼ (Raw camera coords [0, 1])
[Calibration & Range Remapping] (CalibrationProfile)
       │
       ▼ (Mirrored game arena coords [-1, 1])
[Point2DSmoother] (Adaptive 1€ Filter + Exponential Moving Average)
       │
       ▼
[GestureController State Machine]
       │
       ▼
[Game Engine / Virtual Paddle] (TableTennisEngine)
```

**Privacy Guarantee**: No raw webcam frames, video pixels, or biometrics are ever uploaded to the server, Gemini API, or Python AI orchestrator. Landmark inference executes purely client-side via WebAssembly/WebGL.

---

## 2. Automated Synthetic Dry-Run (No Camera Required)

The gesture pipeline is completely decoupled from DOM and hardware webcam feeds using the `HandLandmarkerAdapter` and `SyntheticLandmarkGenerator`.

### Running Automated Unit Tests

```bash
cd frontend
npm test
```

Or from the workspace root:

```bash
npm run test:frontend
```

### Test Suite Coverage

| Test Suite | Spec File | Cases Verified | Status |
| :--- | :--- | :--- | :--- |
| **Coordinate Remapping** | `coordinate-mapper.test.ts` | Midpoint extraction, camera mirroring, clamping, defense against `NaN` / `Infinity` | **PASS (100%)** |
| **Smoothing & Jitter** | `smoothing.test.ts` | OneEuroFilter low-speed jitter damping, high-speed lag mitigation, reset state | **PASS (100%)** |
| **Calibration** | `calibration.test.ts` | Boundary sanity, collapsed span rejection, center-point validation | **PASS (100%)** |
| **Controller Lifecycle** | `gesture-controller.test.ts` | Coordinate sweep, left/right polarity, tracking-loss recovery, last-position hold | **PASS (100%)** |

---

## 3. Gesture Lab Interactive Dry-Run (Browser UI)

You can test the entire gesture pipeline inside the browser without granting camera permissions:

1. Start the frontend:
   ```bash
   npm run dev:frontend
   ```
2. Navigate to **http://localhost:5173/gesture-lab**.
3. In the control panel on the left, click **"Run Synthetic Dry-Run (No Camera)"**.
4. The system injects a deterministic synthetic hand trajectory moving through:
   - **Center** `(0.5, 0.5)`
   - **Far Left** `(0.15, 0.5)` → Maps to Virtual Paddle `X ≈ -0.85`
   - **Far Right** `(0.85, 0.5)` → Maps to Virtual Paddle `X ≈ +0.85`
   - **Upper Boundary** `(0.5, 0.2)`
   - **Lower Boundary** `(0.5, 0.8)`
   - **Noisy High-Frequency Jitter** → Smoothed via 1€ filter
   - **Tracking Drop Simulation (Empty frames)** → Paddle holds last valid coordinate without jumping
5. Inspect the live telemetry:
   - **Controller State**: `TRACKING` / `LOST` / `CALIBRATING`
   - **Coordinates**: Raw Camera vs Game Arena `[-1, 1]`
   - **Tracking Stability**: Percentage of jitter-free frames
   - **Effective FPS**: 60 FPS simulated feed
6. Export the report by clicking **"Export Test Report"** (downloads `gesture-lab-dryrun-report.json`).

---

## 4. Physical Webcam Verification Checklist

When physical camera hardware is available and permissions are granted:

- [ ] **Camera Permission Prompt**: Click **"Start Camera"**. Browser requests camera access.
- [ ] **Permission Denied Handling**: If permission is dismissed or denied, a clear notification is displayed with instructions to allow camera access.
- [ ] **MediaPipe Model Load**: The HandLandmarker loads `hand_landmarker.task` from Google CDN with WebAssembly acceleration.
- [ ] **Landmark Overlay**: Green skeletal lines and white joint points render on top of the mirrored video preview canvas.
- [ ] **Palm Anchor**: A vibrant yellow circle highlights the detected palm center.
- [ ] **Paddle Responsiveness**: Moving your hand left moves the virtual paddle to the left of the table; moving right moves the paddle right.
- [ ] **Tracking Loss**: Dropping your hand out of frame maintains the paddle's last position without snapping to center.
- [ ] **Camera Teardown**: Clicking **"Stop Camera"** stops all tracks (`stream.getTracks().forEach(t => t.stop())`) and releases the device indicator light immediately.

---

## 5. Failure Modes & Fallbacks

| Scenario | Symptom | Built-in Mitigation |
| :--- | :--- | :--- |
| **Camera Unavailable / Disconnected** | `NotFoundError` | Gracefully displays warning; UI defaults to Keyboard / Mouse controls. |
| **Permission Denied** | `NotAllowedError` | Displays clear instructional message to enable camera in browser settings. |
| **MediaPipe CDN Blocked / Offline** | Network failure loading `.task` file | Game arena automatically falls back to Keyboard (`A` / `D` or `Left` / `Right`) controls. |
| **Lighting / Rapid Motion Tracking Loss** | Detection confidence < 0.5 | Controller sets `trackingLost = true`, holds paddle position steadily for 15 frames, then softly glides to neutral table center. |
