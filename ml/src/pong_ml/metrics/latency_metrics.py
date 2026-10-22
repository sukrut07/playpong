"""
Latency Metrics & Real-time Benchmark Profiler.
Measures p50, p90, p95, p99 latency in milliseconds.
"""

import time
from typing import Callable, Any, Dict, List
import numpy as np


def measure_inference_latencies(inference_fn: Callable[[], Any], num_iterations: int = 100, warmup: int = 10) -> Dict[str, float]:
    for _ in range(warmup):
        inference_fn()

    durations_ms: List[float] = []
    for _ in range(num_iterations):
        t0 = time.perf_counter()
        inference_fn()
        t1 = time.perf_counter()
        durations_ms.append((t1 - t0) * 1000.0)

    arr = np.array(durations_ms)
    return {
        "p50_ms": round(float(np.percentile(arr, 50)), 3),
        "p90_ms": round(float(np.percentile(arr, 90)), 3),
        "p95_ms": round(float(np.percentile(arr, 95)), 3),
        "p99_ms": round(float(np.percentile(arr, 99)), 3),
        "mean_ms": round(float(np.mean(arr)), 3),
        "std_ms": round(float(np.std(arr)), 3),
        "fps_throughput": round(1000.0 / max(float(np.mean(arr)), 1e-3), 1),
    }
