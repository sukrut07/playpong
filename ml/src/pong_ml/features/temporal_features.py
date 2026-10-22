"""
Temporal Feature Extraction Module.
Extracts position, velocity delta, and acceleration features over sliding windows.
"""

from typing import List
import numpy as np
from pong_ml.features.normalize_landmarks import normalize_landmarks_3d


def extract_window_features(sequence_landmarks: List[np.ndarray], fps: float = 60.0) -> np.ndarray:
    """
    Takes a temporal sequence of N landmark frames (each shape (21, 3)).
    Computes:
    - Current normalized pose (21 * 3 = 63 dims)
    - Mean velocity over window (21 * 3 = 63 dims)
    Returns a 1D vector of 126 features.
    """
    if len(sequence_landmarks) == 0:
        raise ValueError("Sequence must contain at least 1 frame")

    normalized = [normalize_landmarks_3d(lm) for lm in sequence_landmarks]

    current_pose = normalized[-1].flatten()  # 63 dims

    if len(normalized) > 1:
        dt = (len(normalized) - 1) / max(fps, 1.0)
        disp = (normalized[-1] - normalized[0]).flatten()
        velocity = disp / max(dt, 1e-4)  # 63 dims
    else:
        velocity = np.zeros_like(current_pose)

    return np.concatenate([current_pose, velocity], axis=0)  # 126 dims
