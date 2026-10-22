"""
Real-time Gesture Prediction Entrypoint.
Loads the trained checkpoint and runs low-latency inference on input landmark sequences.
"""

from pathlib import Path
from typing import Dict, Any, List
import numpy as np
from pong_ml.models.gesture_classifier import GestureClassifierModel
from pong_ml.models.temporal_classifier import TemporalGestureInferenceEngine


def load_inference_engine(checkpoint_path: Path) -> TemporalGestureInferenceEngine:
    model = GestureClassifierModel.load(checkpoint_path)
    return TemporalGestureInferenceEngine(model, window_size=15, confidence_threshold=0.60)


def predict_single_sequence(checkpoint_path: Path, sequence_landmarks: List[np.ndarray]) -> Dict[str, Any]:
    engine = load_inference_engine(checkpoint_path)
    res = {}
    for lm in sequence_landmarks:
        res = engine.process_frame(lm)
    return res
