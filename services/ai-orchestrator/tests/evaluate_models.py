"""
Empirical Model Evaluation & Benchmarking Harness.
Executes the fixed evaluation suite (models/datasets/evaluation_cases.json)
against Gemma 4 E2B and Gemma 4 E4B, measuring schema validity, evidence grounding,
unsupported claims, and actual inference latencies.
Results are saved to models/evaluations/benchmark_results.json.
"""

import os
import sys
import json
import time
import asyncio
from pathlib import Path
from typing import Dict, Any, List

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.models.ollama_provider import ollama_provider
from app.graph.workflow import pong_ai_workflow
from app.config import settings


DATASET_PATH = Path(__file__).parent.parent.parent.parent / "models" / "datasets" / "evaluation_cases.json"
OUTPUT_DIR = Path(__file__).parent.parent.parent.parent / "models" / "evaluations"


async def evaluate_model_on_suite(model_tag: str, test_cases: List[Dict[str, Any]]) -> Dict[str, Any]:
    print(f"\n=======================================================")
    print(f"Starting Evaluation on: {model_tag}")
    print(f"=======================================================")

    results = []
    latencies = []
    schema_valid_count = 0
    grounding_pass_count = 0
    unsupported_claims_count = 0

    for case in test_cases:
        case_id = case["id"]
        case_name = case["name"]
        task_type = case["task_type"]
        payload = case["payload"]

        print(f" -> Running [{case_id}] {case_name}...")
        t0 = time.time()

        initial_state = {
            "run_id": f"eval_{case_id}_{int(time.time())}",
            "match_id": payload.get("match_id", f"eval_{case_id}"),
            "request_type": task_type,
            "raw_stats": payload,
            "question": payload.get("question"),
            "model_override": model_tag,
            "retry_count": 0,
            "validation_errors": [],
        }

        config = {"configurable": {"thread_id": initial_state["run_id"]}}

        try:
            state = await pong_ai_workflow.ainvoke(initial_state, config=config)
            elapsed = round((time.time() - t0), 3)
            latencies.append(elapsed)

            status = state.get("status", "FAILED")
            evidence_status = state.get("evidence_status", "UNKNOWN")
            val_errors = state.get("validation_errors", [])
            final_report = state.get("final_report", {})

            # 1. Schema check
            is_schema_valid = bool(final_report and "summary" in final_report and "observations" in final_report)
            if is_schema_valid:
                schema_valid_count += 1

            # 2. Grounding check
            is_grounded = evidence_status in ("VERIFIED", "FALLBACK") and not any("hallucinated" in e.lower() for e in val_errors)
            if is_grounded:
                grounding_pass_count += 1
            else:
                unsupported_claims_count += len([e for e in val_errors if "hallucinated" in e.lower() or "non-existent" in e.lower()])

            results.append({
                "case_id": case_id,
                "case_name": case_name,
                "latency_sec": elapsed,
                "status": status,
                "evidence_status": evidence_status,
                "schema_valid": is_schema_valid,
                "grounded": is_grounded,
                "validation_errors": val_errors,
            })
            print(f"    Result: {status} | Latency: {elapsed}s | Grounded: {is_grounded}")
        except Exception as e:
            elapsed = round((time.time() - t0), 3)
            latencies.append(elapsed)
            results.append({
                "case_id": case_id,
                "case_name": case_name,
                "latency_sec": elapsed,
                "status": "EXCEPTION",
                "error": str(e),
                "schema_valid": False,
                "grounded": False,
            })
            print(f"    Exception: {str(e)}")

    total_cases = len(test_cases)
    sorted_latencies = sorted(latencies)
    median_latency = sorted_latencies[len(sorted_latencies) // 2] if sorted_latencies else 0.0
    p90_latency = sorted_latencies[int(len(sorted_latencies) * 0.9)] if sorted_latencies else 0.0

    return {
        "model_tag": model_tag,
        "evaluated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "total_test_cases": total_cases,
        "successful_responses": sum(1 for r in results if r["status"] in ("SUCCESS", "FALLBACK")),
        "schema_validity_rate": round((schema_valid_count / total_cases) * 100, 1),
        "evidence_grounding_rate": round((grounding_pass_count / total_cases) * 100, 1),
        "unsupported_claims_count": unsupported_claims_count,
        "median_latency_seconds": median_latency,
        "p90_latency_seconds": p90_latency,
        "cases": results,
    }


async def main():
    if not DATASET_PATH.exists():
        print(f"Dataset path {DATASET_PATH} not found.")
        return

    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        cases = json.load(f)

    st = await ollama_provider.get_runtime_status()
    installed = st.get("models_installed", {})

    models_to_test = []
    if installed.get(settings.fast_model):
        models_to_test.append(settings.fast_model)
    if installed.get(settings.coach_model):
        models_to_test.append(settings.coach_model)

    if not models_to_test:
        print("No configured Gemma 4 models installed locally.")
        return

    benchmark_summary = {
        "suite_name": "PONG AI Dual Gemma 4 Grounding & Reasoning Benchmark",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "dataset_version": "1.0.0",
        "models_evaluated": {},
    }

    for model in models_to_test:
        report = await evaluate_model_on_suite(model, cases)
        benchmark_summary["models_evaluated"][model] = report

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = OUTPUT_DIR / "benchmark_results.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(benchmark_summary, f, indent=2)

    print(f"\nBenchmark suite completed successfully. Results saved to:\n{out_file}")


if __name__ == "__main__":
    asyncio.run(main())
