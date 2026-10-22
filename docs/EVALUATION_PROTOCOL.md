# PONG AI — Model Evaluation Protocol & Benchmark Suite

## 1. Objectives

The PONG AI evaluation framework provides an empirical, reproducible methodology to evaluate local language models (**Gemma 4 E2B** and **Gemma 4 E4B**) against rigorous table-tennis coaching and analytics tasks.

The goal is to determine task routing based on measured evidence rather than assumptions.

---

## 2. Evaluation Criteria & Metrics

1. **Schema Validity Rate (%)**:
   - The percentage of runs that return valid JSON adhering strictly to the `CoachingReport` schema without requiring syntax repair.
2. **Evidence Grounding Rate (%)**:
   - The percentage of responses where 100% of factual observations, numbers, and rule citations map directly to the supplied match telemetry.
3. **Unsupported Claims Count**:
   - Total number of hallucinations detected by the validation engine (e.g. inventing a 100% return rate on 0 attempts, or citing non-existent rule IDs).
4. **Inference Latency (Median & P90)**:
   - Measured wall-clock time from request dispatch to final report delivery.
5. **Zero Denominator Handling**:
   - Verification that matches with 0 return attempts correctly emit `None` or `N/A` rather than divide-by-zero errors or fabricated percentages.

---

## 3. The 12 Standard Benchmark Scenarios

The suite is defined in `models/datasets/evaluation_cases.json`:

| Scenario ID | Name | Target Stress Test |
| :--- | :--- | :--- |
| `eval_01_short_summary` | Short Match Summary | Fast turnaround, 1-2 sentence core stats extraction. |
| `eval_02_complex_coaching` | Complex Coaching Question | Multi-metric synthesis, biomechanical drill planning. |
| `eval_03_zero_denominator` | Zero Eligible Return Attempts | Robust division-by-zero protection. |
| `eval_04_missing_gesture` | Missing Gesture Telemetry | Verifies model doesn't hallucinate hand tracking when in keyboard mode. |
| `eval_05_conflicting_metrics` | Conflicting Metrics | Flags impossible condition ($\text{successful} > \text{eligible}$). |
| `eval_06_invalid_match_id` | Invalid Match ID | Rejects empty ID fast with HTTP 400. |
| `eval_07_unknown_rule` | Unknown Rule Query | Refuses to invent text for unregistered rule ID `ITTF-99.99`. |
| `eval_08_unsupported_rule` | Unsupported Rule Claim | Cites official ITTF 2026 §2.6 on ball visibility during service. |
| `eval_09_unequal_samples` | Unequal Sample Sizes | Flags statistical invalidity when comparing $N=3$ vs $N=400$. |
| `eval_10_provider_timeout` | Provider Timeout | Engages deterministic fallback engine without crashing. |
| `eval_11_invalid_json` | Corrupted JSON Output | Bounded retry with error feedback or fallback. |
| `eval_12_empty_history` | Empty Match History | Handles first-time player sessions gracefully. |

---

## 4. Execution Command

To run the full evaluation suite against both models:
```bash
cd services/ai-orchestrator
source .venv/bin/activate
python tests/evaluate_models.py
```
Results are saved to `models/evaluations/benchmark_results.json`.
