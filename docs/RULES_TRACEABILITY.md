# PONG AI — Rules & Regulatory Traceability

## 1. Overview & Regulatory Disclaimer
PONG AI provides two explicit, segregated rule profiles:
1. **`ARCADE_PONG`**: Custom arcade table-tennis rules optimized for fast browser play.
2. **`TABLE_TENNIS_TRAINING`**: Grounded in the **ITTF Statutes 2026** (effective 1 January 2026, Chapter 2: Laws of Table Tennis).

> **Official Disclaimer**: PONG AI is a 3D browser simulation designed for training and educational analysis. It does NOT claim official certification, legal compliance, or equivalence to human ITTF umpires. Provisions requiring physical inspection, 16cm vertical toss elevation, or complex ball spin dynamics are clearly disclaimed.

---

## 2. ITTF Statutes 2026 Reference Mapping

| Rule ID | Profile | ITTF Section | Title | Implementation Status | Limitations & Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ITTF-2.1` | `TABLE_TENNIS_TRAINING` | §2.1.1, §2.1.3 | The Table | `IMPLEMENTED_AND_TESTED` | Exact dimensions: 2.74m length × 1.525m width × 0.76m height. 0.88 restitution bounce. |
| `ITTF-2.2` | `TABLE_TENNIS_TRAINING` | §2.2.1 | The Net Assembly | `IMPLEMENTED_AND_TESTED` | Net height: 15.25cm above table surface across center line. Continuous collision detection. |
| `ITTF-2.3` | `TABLE_TENNIS_TRAINING` | §2.3.1 | The Ball | `IMPLEMENTED_AND_TESTED` | 40mm diameter standard ping pong ball with mass and air resistance. |
| `ITTF-2.5` | `TABLE_TENNIS_TRAINING` | §2.5.1 - §2.5.3 | Definitions: Rally & Let | `IMPLEMENTED_AND_TESTED` | State machine manages `SERVE`, `RALLY`, `POINT_END`, and `MATCH_OVER`. |
| `ITTF-2.6` | `TABLE_TENNIS_TRAINING` | §2.6.1 - §2.6.4 | The Service | `PARTIALLY_SIMULATED` | Alternating serve simulated. Physical 16cm toss from stationary palm cannot be verified from 2D webcam. |
| `ITTF-2.7` | `TABLE_TENNIS_TRAINING` | §2.7.1 | The Return | `IMPLEMENTED_AND_TESTED` | Ball must pass over/around net and strike opponent's court. |
| `ITTF-2.9` | `TABLE_TENNIS_TRAINING` | §2.9.1.1 | A Let (Net on Service) | `PARTIALLY_SIMULATED` | Service touching net and landing in receiver court triggers re-serve. |
| `ITTF-2.10` | `TABLE_TENNIS_TRAINING` | §2.10.1 | A Point | `IMPLEMENTED_AND_TESTED` | Awarded on failure to make correct service, double bounce, or ball out of court. |
| `ITTF-2.11` | `TABLE_TENNIS_TRAINING` | §2.11.1 | A Game | `IMPLEMENTED_AND_TESTED` | First to 11 points wins; at 10-10 (deuce), a player must lead by 2 points. |
| `ITTF-2.12` | `TABLE_TENNIS_TRAINING` | §2.12.1 | A Match | `IMPLEMENTED_AND_TESTED` | Configurable best of 1, 3, or 5 games. |
| `ITTF-2.4` | `TABLE_TENNIS_TRAINING` | §2.4.1 - §2.4.6 | Racket Blade & Covering | `DOCUMENTED_ONLY` | Rubber thickness and flatness cannot be evaluated via browser software. |
| `ITTF-2.6.5` | `TABLE_TENNIS_TRAINING` | §2.6.5 | Visibility of Ball on Serve | `DOCUMENTED_ONLY` | Hidden service detection requires multiple multi-angle synchronized cameras. |

---

## 3. ARCADE_PONG Profile Rules

| Rule ID | Title | Description | Implementation Status |
| :--- | :--- | :--- | :--- |
| `ARCADE-01` | Instant Respawn Serve | Ball automatically tees up for player or opponent after point completion. | `IMPLEMENTED_AND_TESTED` |
| `ARCADE-02` | Lateral Boundary Bounds | Table boundaries define the valid play zone; balls passing player paddle plane count as miss. | `IMPLEMENTED_AND_TESTED` |
| `ARCADE-03` | First to Target Score | Match concludes when either player reaches target score (default: 7 or 11 points). | `IMPLEMENTED_AND_TESTED` |
| `ARCADE-04` | Speed Increment | Ball speed increases slightly with each successful return during a single rally. | `IMPLEMENTED_AND_TESTED` |
