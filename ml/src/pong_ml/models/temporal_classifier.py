"""
Temporal Sequence Classifier & Sliding Window Buffer.
Accumulates streaming per-frame landmarks, extracts sliding window features, and runs inference.
"""

from collections import deque
from typing import List, Dict, Any, Optional
import numpy as np
from pong_ml.features.temporal_features import extract_window_features
from pong_ml.models.gesture_classifier import GestureClassifierModel


class TemporalGestureInferenceEngine:
    def __init__(self, model: GestureClassifierModel, window_size: int = 15, confidence_threshold: float = 0.60):
        self.model = model
        self.window_size = window_size
        self.confidence_threshold = confidence_threshold
        self.buffer = deque(maxlen=window_size)

    def reset(self):
        self.buffer.clear()

    def process_frame(self, landmarks_3d: np.ndarray) -> Dict[str, Any]:
        """
        Receives 21 3D landmarks for the current frame.
        When window_size frames are buffered, extracts features and predicts gesture class.
        """
        self.buffer.append(landmarks_3d)

        if len(self.buffer) < self.window_size:
            return {
                "gesture": "READY",
                "confidence": 0.50,
                "buffered_frames": len(self.buffer),
                "ready": False,
            }

        features = extract_window_features(list(self.buffer))
        features_2d = features.reshape(1, -1)

        probs = self.model.predict_proba(features_2d)[0]
        best_idx = int(np.argmax(probs))
        confidence = float(probs[best_idx])
        gesture_name = self.model.classes[best_idx]

        if confidence < self.confidence_threshold:
            gesture_name = "READY"

        return {
            "gesture": gesture_name,
            "confidence": round(confidence, 3),
            "probabilities": {cls: round(float(p), 3) for cls, p in zip(self.model.classes, probs)},
            "buffered_frames": len(self.buffer),
            "ready": True,
        }
