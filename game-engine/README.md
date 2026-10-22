# PONG AI Game Engine (`game-engine/`)

Deterministic 3D Table Tennis Physics & ITTF Statutes 2026 Rule Engine.

## Features
- **Deterministic Sub-Stepped Simulation**: Continuous collision detection (CCD) at 120Hz for fast ball/paddle/net dynamics.
- **ITTF Statutes 2026 Compliance**:
  - Regulation table geometry: 2.74m length × 1.525m width × 0.76m height (§2.1.1).
  - 15.25cm net barrier (§2.2.4).
  - 40mm ball diameter with 0.88 coefficient of restitution (§2.1.3).
  - Deuce scoring rule (§2.11) and alternating serve rules (§2.13).
- **Pure Domain Engine**:
  - Zero DOM or browser Web Audio coupling.
  - Pluggable `SoundDelegate` for audio triggers.
  - Event stream listener (`addEventListener`) for game events (`ball_hit_player`, `ball_bounce_table`, `point_won`, etc.).
- **Audited Metrics**: Mathematical contracts for return success rate, miss rate, average reaction time, and rally statistics.
