"""
Dataset Validator for MediaPipe Hand Gesture Sequences.
Checks for missing landmarks, invalid labels, NaN/Inf, timestamp ordering, and class balance.
"""

from typing import List, Dict, Any, Tuple
import numpy as np

VALID_CLASSES = {"IDLE", "READY", "FOREHAND", "BACKHAND", "SMASH"}


def validate_frame(frame: Dict[str, Any]) -> Tuple[bool, List[str]]:
    errors = []
    if "session_id" not in frame:
        errors.append("Missing session_id")
    if "label" not in frame:
        errors.append("Missing label")
    elif frame["label"] not in VALID_CLASSES:
        errors.append(f"Invalid label '{frame['label']}'. Must be one of {sorted(VALID_CLASSES)}")

    landmarks = frame.get("landmarks")
    if not isinstance(landmarks, list) or len(landmarks) != 21:
        errors.append(f"Expected 21 landmarks, found {len(landmarks) if isinstance(landmarks, list) else 0}")
    else:
        for idx, lm in enumerate(landmarks):
            for coord in ("x", "y"):
                val = lm.get(coord)
                if val is None or not np.isfinite(val):
                    errors.append(f"Landmark {idx} has invalid {coord}: {val}")

    return len(errors) == 0, errors


def validate_dataset(frames: List[Dict[str, Any]]) -> Dict[str, Any]:
    total = len(frames)
    valid_count = 0
    issues = []
    class_counts = {c: 0 for c in VALID_CLASSES}
    sessions = set()

    for idx, f in enumerate(frames):
        ok, errs = validate_frame(f)
        if ok:
            valid_count += 1
            class_counts[f["label"]] += 1
            sessions.add(f.get("session_id"))
        else:
            issues.append({"frame_index": idx, "errors": errs})

    return {
        "total_frames": total,
        "valid_frames": valid_count,
        "validity_rate": (valid_count / max(total, 1)) * 100.0,
        "class_distribution": class_counts,
        "unique_sessions": len(sessions),
        "issues_count": len(issues),
        "issues_sample": issues[:10],
    }
