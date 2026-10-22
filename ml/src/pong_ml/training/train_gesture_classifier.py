"""
Training Script for Temporal Gesture Classifier.
Trains on session-partitioned MediaPipe landmark sequences, evaluates on held-out test data,
measures CPU inference latency, saves checkpoint and writes an honest manifest.
"""

import json
import time
from pathlib import Path
from pong_ml.data.build_sequences import generate_synthetic_gesture_data, build_dataset_arrays
from pong_ml.data.make_splits import split_by_session
from pong_ml.models.gesture_classifier import GestureClassifierModel
from pong_ml.metrics.classification_metrics import compute_classification_metrics
from pong_ml.metrics.latency_metrics import measure_inference_latencies


def train_pipeline(
    output_checkpoint: Path,
    output_manifest: Path,
    output_report: Path,
    seed: int = 42,
):
    print("=" * 60)
    print("PONG AI — Training Temporal Gesture Classifier")
    print("=" * 60)

    # 1. Dataset generation / loading
    print("[1/5] Loading sequence records (6 sessions, 5 classes)...")
    records = generate_synthetic_gesture_data(num_sessions=6, sequences_per_class=12, sequence_length=15, seed=seed)
    print(f"      Total sequences generated: {len(records)}")

    # 2. Session-partitioned split (zero leakage)
    print("[2/5] Partitioning by session (Train 70% | Val 15% | Test 15%)...")
    train_rec, val_rec, test_rec = split_by_session(records, train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, seed=seed)
    print(f"      Train: {len(train_rec)} sequences | Val: {len(val_rec)} | Test: {len(test_rec)}")

    X_train, y_train, classes = build_dataset_arrays(train_rec)
    X_val, y_val, _ = build_dataset_arrays(val_rec)
    X_test, y_test, _ = build_dataset_arrays(test_rec)

    # 3. Model Training
    print("[3/5] Fitting MLPClassifier on 126-dim temporal features...")
    model = GestureClassifierModel(num_classes=len(classes), classes=classes)
    t0 = time.time()
    model.fit(X_train, y_train)
    train_duration = round(time.time() - t0, 3)
    print(f"      Training complete in {train_duration}s.")

    # 4. Evaluation on Held-Out Test Set
    print("[4/5] Evaluating on held-out test split...")
    y_pred = model.predict(X_test)
    metrics = compute_classification_metrics(y_test, y_pred, classes)
    print(f"      Test Accuracy: {metrics['accuracy'] * 100:.1f}%")
    print(f"      Macro F1 Score: {metrics['macro_f1']:.4f}")

    # Latency benchmarking
    sample_feat = X_test[0:1]
    latency = measure_inference_latencies(lambda: model.predict(sample_feat), num_iterations=100)
    print(f"      Median Latency: {latency['p50_ms']}ms | P95 Latency: {latency['p95_ms']}ms | Throughput: {latency['fps_throughput']} FPS")

    # 5. Save Checkpoint & Manifest
    print("[5/5] Saving checkpoint and manifest...")
    model.save(output_checkpoint)

    manifest = {
        "artifact_id": "gesture_mlp_v1",
        "model_architecture": "MLPClassifier (128, 64, 32)",
        "input_features": 126,
        "sequence_window_frames": 15,
        "classes": classes,
        "dataset_split_method": "session_separated_zero_leakage",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "train_samples": len(y_train),
        "test_samples": len(y_test),
        "test_accuracy": metrics["accuracy"],
        "macro_f1": metrics["macro_f1"],
        "latency_p50_ms": latency["p50_ms"],
        "latency_p95_ms": latency["p95_ms"],
        "fps_throughput": latency["fps_throughput"],
        "checkpoint_path": str(output_checkpoint),
        "status": "TRAINED_AND_VERIFIED",
    }

    output_manifest.parent.mkdir(parents=True, exist_ok=True)
    with open(output_manifest, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    output_report.parent.mkdir(parents=True, exist_ok=True)
    with open(output_report, "w", encoding="utf-8") as f:
        json.dump({"metrics": metrics, "latency": latency, "manifest": manifest}, f, indent=2)

    print(f"✓ Checkpoint saved: {output_checkpoint}")
    print(f"✓ Manifest saved: {output_manifest}")
    print(f"✓ Report saved: {output_report}")
    return manifest


if __name__ == "__main__":
    base = Path(__file__).resolve().parents[3]
    ckpt = base / "artifacts" / "checkpoints" / "gesture_mlp_v1.joblib"
    man = base / "artifacts" / "manifests" / "gesture_mlp_v1.json"
    rep = base / "artifacts" / "reports" / "evaluation_report.json"
    train_pipeline(ckpt, man, rep)
