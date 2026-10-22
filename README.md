# Gesture Pong AI 🏓🤖
A 3D Webcam-Controlled Table Tennis Game with Gemma 4, Ollama, MediaPipe, and Graphify.

## Overview
Gesture Pong AI is a browser-based 3D table-tennis game where players control the paddle in real-time using hand tracking via MediaPipe Hand Landmarker, with AI coaching and dynamic missions powered locally by Google Gemma 4 via Ollama.

## Features
- **Computer Vision Hand Control**: Real-time hand landmark tracking with calibration, One Euro/EMA smoothing, and zero keyboard dependency for paddle movement (with keyboard fallbacks).
- **Playable 3D Physics**: Deterministic continuous collision table tennis physics in Three.js / React Three Fiber with realistic bounce, spin response, and rally mechanics.
- **Local Gemma 4 AI Coach**: Zero external API dependencies; calls Ollama on `localhost:11434` with structured Zod schema validation for mission generation, adaptive opponent difficulty, and post-match tactical analysis.
- **Match Analytics**: Event-driven tracking of returns, rally streaks, reaction time, zone distribution, and session history.
- **Graphify Developer Intelligence**: Automated dependency graph mapping and architectural intelligence.
