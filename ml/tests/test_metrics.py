"""
Unit tests for Metrics Computation.
"""

import numpy as np
from pong_ml.metrics.classification_metrics import compute_classification_metrics
from pong_ml.metrics.latency_metrics import measure_inference_latencies


def test_compute_classification_metrics():
    y_true = np.array([0, 1, 2, 0, 1, 2])
    y_pred = np.array([0, 1, 2, 0, 2, 2])
    classes = ["IDLE", "READY", "SMASH"]

    metrics = compute_classification_metrics(y_true, y_pred, classes)
    assert 0.0 <= metrics["accuracy"] <= 1.0
    assert 0.0 <= metrics["macro_f1"] <= 1.0
    assert "per_class" in metrics
    assert len(metrics["confusion_matrix"]) == 3


def test_measure_inference_latencies():
    def mock_fn():
        _ = sum(i * i for i in range(100))

    lat = measure_inference_latencies(mock_fn, num_iterations=20, warmup=2)
    assert lat["p50_ms"] >= 0.0
    assert lat["fps_throughput"] > 0.0
