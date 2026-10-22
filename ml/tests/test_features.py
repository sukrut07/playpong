"""
Unit tests for Landmark Normalization and Feature Extraction.
"""

import numpy as np
import pytest
from pong_ml.features.normalize_landmarks import normalize_landmarks_3d
from pong_ml.features.temporal_features import extract_window_features


def test_normalize_landmarks_origin_and_scale():
    pts = np.zeros((21, 3), dtype=np.float32)
    pts[0] = [10.0, 20.0, 5.0]  # wrist
    pts[9] = [10.0, 25.0, 5.0]  # middle MCP (distance = 5.0)

    norm = normalize_landmarks_3d(pts)
    # Wrist must be at origin
    assert np.allclose(norm[0], [0.0, 0.0, 0.0])
    # Distance to landmark 9 must be normalized to 1.0
    assert pytest.approx(np.linalg.norm(norm[9]), 0.001) == 1.0


def test_extract_window_features_dimensions():
    pts1 = np.random.randn(21, 3).astype(np.float32)
    pts2 = pts1 + np.array([0.1, 0.0, 0.0])
    pts3 = pts2 + np.array([0.1, 0.0, 0.0])

    features = extract_window_features([pts1, pts2, pts3], fps=60.0)
    assert features.shape == (126,)  # 63 pose + 63 velocity
