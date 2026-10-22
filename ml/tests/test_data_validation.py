"""
Unit tests for Dataset Validation.
"""

from pong_ml.data.validate_dataset import validate_frame, validate_dataset


def test_validate_frame_valid():
    landmarks = [{"id": i, "x": 0.5, "y": 0.5, "z": 0.0} for i in range(21)]
    frame = {
        "session_id": "s01",
        "label": "FOREHAND",
        "landmarks": landmarks,
    }
    ok, errs = validate_frame(frame)
    assert ok is True
    assert len(errs) == 0


def test_validate_frame_invalid_class_and_missing_landmarks():
    frame = {
        "session_id": "s01",
        "label": "FLYING_KICK",  # Invalid
        "landmarks": [{"id": 0, "x": 0.5, "y": 0.5}],  # Only 1 landmark instead of 21
    }
    ok, errs = validate_frame(frame)
    assert ok is False
    assert any("Invalid label" in e for e in errs)
    assert any("Expected 21 landmarks" in e for e in errs)


def test_validate_dataset_aggregate():
    landmarks = [{"id": i, "x": 0.5, "y": 0.5, "z": 0.0} for i in range(21)]
    frames = [
        {"session_id": "s01", "label": "READY", "landmarks": landmarks},
        {"session_id": "s02", "label": "SMASH", "landmarks": landmarks},
        {"session_id": "s01", "label": "INVALID", "landmarks": []},
    ]
    summary = validate_dataset(frames)
    assert summary["total_frames"] == 3
    assert summary["valid_frames"] == 2
    assert summary["unique_sessions"] == 2
    assert summary["issues_count"] == 1
