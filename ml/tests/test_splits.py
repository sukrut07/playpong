"""
Unit tests for Split Generator.
Verifies zero temporal leakage between train, val, and test partitions.
"""

from pong_ml.data.make_splits import split_by_session


def test_session_separated_splits_zero_leakage():
    records = []
    # 10 sessions, 5 frames each
    for s_idx in range(10):
        sid = f"session_{s_idx:02d}"
        for f in range(5):
            records.append({"session_id": sid, "frame": f, "label": "READY"})

    train, val, test = split_by_session(records, train_ratio=0.70, val_ratio=0.15, test_ratio=0.15, seed=42)

    train_sessions = set(r["session_id"] for r in train)
    val_sessions = set(r["session_id"] for r in val)
    test_sessions = set(r["session_id"] for r in test)

    # Intersection between any two sets MUST be empty
    assert len(train_sessions.intersection(val_sessions)) == 0, "Leakage between train and val!"
    assert len(train_sessions.intersection(test_sessions)) == 0, "Leakage between train and test!"
    assert len(val_sessions.intersection(test_sessions)) == 0, "Leakage between val and test!"

    # Total frames preserved
    assert len(train) + len(val) + len(test) == len(records)
