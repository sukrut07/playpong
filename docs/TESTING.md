# PONG AI — Testing Strategy & Verification Protocol

## 1. Test Suite Architecture

```
playpong/
├── client/tests/
│   ├── engine_vision.test.ts    # Deterministic physics, OneEuroFilter, calibration
│   ├── rules_evaluator.test.ts  # ARCADE vs ITTF rules, deuce, serve alternations
│   └── metrics_contracts.test.ts# Explicit denominators, zero-denominator safeguards
└── server/src/
    ├── coach/
    │   ├── coach.test.ts        # Zod schema validation, prompts, fallback logic
    │   └── integration.test.ts  # API endpoint health, mock & provider tests
    └── ai/
        └── provider.test.ts     # Gemini API Gemma 4 & Ollama adapter failure paths
```

---

## 2. Test Suites & Coverage Targets

### 2.1 Deterministic Simulation & Collision Physics
- Continuous collision sub-stepping (4 steps/frame) ensures no tunneling.
- Restitution and deflection angle calculations on paddle strikes.
- Net collisions and edge bounces.
- State machine transitions (`READY` ➔ `SERVE` ➔ `RALLY` ➔ `POINT_END` ➔ `MATCH_OVER`).

### 2.2 Rule Traceability Tests
- `ARCADE_PONG`: Fast serve, 11-point win condition, wall bounce dynamics.
- `TABLE_TENNIS_TRAINING`: Deuce scoring (lead by 2 points), 2-serve alternation, let detection.

### 2.3 Metric Contract Safeguards
- Zero-denominator protection: Returns `null` ("Insufficient Data"), never misleading `0%`.
- Invariant verification: $\text{return\_success\_rate} + \text{miss\_rate} = 1.0$.

### 2.4 AI Provider Resilience & Failure Paths
- Valid JSON response conforms to Zod schema.
- Malformed JSON recovery and schema repairs.
- Missing API key / unauthorized handling.
- Timeout (12s) fallback without server crash or hung promise.
- Rate-limit handling and honest UI error display.

---

## 3. Running Test Suites

```bash
# Run all tests across server and client
npm test

# Run client tests specifically
npm run test --prefix client

# Run server tests specifically
npm run test --prefix server
```
