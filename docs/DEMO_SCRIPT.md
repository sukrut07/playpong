# Demonstration Script — Gesture Pong AI

This script guides evaluators and judges through a step-by-step walkthrough of Gesture Pong AI.

---

## Preparation (30 Seconds)
1. Start Ollama and verify `gemma4:e2b`:
   ```bash
   ollama list
   ```
2. Start the Gesture Pong AI development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in Google Chrome.

---

## Step 1: Landing Menu & System Health (1 Minute)
- **Visuals**: Observe the 3D esports arena preview running behind the glassmorphism menu.
- **AI Indicator**: Note the green status pill: `Gemma 4 Coach: gemma4:e2b (Ready)`.
- **Options**: Point out the two launch modes:
  - *Play with Webcam Hands* (primary gesture mode)
  - *Play with Keyboard / Mouse Fallback* (debugging and accessibility)

---

## Step 2: Camera Calibration & Live Hand Tracking (2 Minutes)
1. Click **Play with Webcam Hands**.
2. Grant camera permission when prompted.
3. Observe the bottom-left **Vision Tracker** overlay:
   - Mirrored camera feed with 21 neon cyan hand landmarks and orange palm anchor.
   - Live status indicator: `Hand (READY)`.
4. Click **Calibrate** in the Vision Tracker or Settings:
   - Walk through the 5-step guided calibration (Center, Left limit, Right limit, Top limit, Bottom limit).
   - Save and apply the calibration.

---

## Step 3: Playable 3D Match with Gemma 4 Coaching (3 Minutes)
1. **Serve**: Move your hand forward briskly or tap `[Space]` to serve the ball.
2. **Rally**: Move your physical hand horizontally and vertically. Notice:
   - The paddle tracks your hand smoothly without micro-jitter (via One Euro filtering).
   - Table bounce sounds, net hits, and paddle pop audio dynamically trigger.
   - The top HUD tracks the current Rally Streak and Match Score (First to 7).
3. **Mission In Action**: Look at the top-right **Gemma 4 Mission Card**:
   - Title, description, live progress bar (`3 / 5 returns`), and tactical tip.
   - Complete the mission during a rally and observe the green glow and harmonic fanfare chime.

---

## Step 4: Post-Match Tactical Debrief (2 Minutes)
1. Play through until either player or opponent reaches 7 points.
2. If you win, confetti triggers across the screen!
3. The **Match Completed** modal appears:
   - Shows final score, return accuracy %, longest rally streak, and measured reaction time.
   - **Gemma 4 Tactical Debrief**: Displays locally generated strengths, improvement areas, tactical instructions, and recommended next mission.

---

## Step 5: Performance Analytics Studio (2 Minutes)
1. Click **Deep Analytics** (or the chart icon in-game).
2. Review:
   - All-time career win rate, return accuracy, longest rally, and average reaction time.
   - **Table Zone Placement Heatmap**: Shows hit distribution across Left Corner, Center Court, and Right Corner.
   - Match history table logging every completed session.

---

## Step 6: Graphify Developer Intelligence (1 Minute)
1. In the terminal, show the Graphify dependency analysis:
   ```bash
   graphify query "hand tracking racket movement"
   graphify path "VisionPipeline" "TableTennisEngine" --undirected
   ```
2. Open `graphify-out/graph.html` to showcase the interactive 3D knowledge graph of the repository.
