"""
Landmark Normalization Module.
Translates MediaPipe landmarks to the wrist origin and scales by palm span.
"""

import math
from typing import List, Dict, Any, Union
import numpy as np


def normalize_landmarks_3d(landmarks: Union[List[Dict[str, float]], np.ndarray]) -> np.ndarray:
    """
    Normalizes 21 3D landmarks:
    1. Origin translation: wrist (index 0) becomes (0, 0, 0).
    2. Scale normalization: scaled by distance from wrist (0) to middle finger MCP (9).
    Returns a numpy array of shape (21, 3).
    """
    if isinstance(landmarks, list):
        pts = np.array([[lm["x"], lm["y"], lm.get("z", 0.0)] for lm in landmarks], dtype=np.float32)
    else:
        pts = np.array(landmarks, dtype=np.float32).copy()

    if pts.shape != (21, 3):
        raise ValueError(f"Expected landmarks array of shape (21, 3), got {pts.shape}")

    # 1. Translate wrist (0) to origin
    wrist = pts[0].copy()
    pts -= wrist

    # 2. Scale by palm dimension (wrist to middle MCP index 9)
    middle_mcp = pts[9]
    scale = float(np.linalg.norm(middle_mcp))
    if scale < 1e-4:
        scale = 1.0  # Avoid division by zero if hand is collapsed

    pts /= scale
    return pts
