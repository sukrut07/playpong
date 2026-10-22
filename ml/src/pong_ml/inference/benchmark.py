"""
Benchmarking Script for Model Inference Throughput and Latency.
"""

from pathlib import Path
import numpy as np
from pong_ml.models.gesture_classifier import GestureClassifierModel
from pong_ml.metrics.latency_metrics import measure_inference_latencies


def run_benchmark(checkpoint_path: Path):
    print("=" * 60)
    print("PONG AI — Inference Benchmark Suite")
    print("=" * 60)
    print(f"Loading checkpoint: {checkpoint_path}")
    model = GestureClassifierModel.load(checkpoint_path)

    # Synthetic test input of shape (1, 126)
    dummy_input = np.random.randn(1, 126).astype(np.float32)

    stats = measure_inference_latencies(lambda: model.predict_proba(dummy_input), num_iterations=200, warmup=20)
    print(f"P50 Latency : {stats['p50_ms']} ms")
    print(f"P90 Latency : {stats['p90_ms']} ms")
    print(f"P95 Latency : {stats['p95_ms']} ms")
    print(f"P99 Latency : {stats['p99_ms']} ms")
    print(f"Throughput  : {stats['fps_throughput']} inferences/second")
    print("=" * 60)
    return stats


if __name__ == "__main__":
    ckpt = Path(__file__).resolve().parents[3] / "artifacts" / "checkpoints" / "gesture_mlp_v1.joblib"
    if ckpt.exists():
        run_benchmark(ckpt)
    else:
        print(f"Checkpoint {ckpt} not found. Train the model first.")
