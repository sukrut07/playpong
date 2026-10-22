"""
Sequence Builder & Synthetic Gesture Fixture Generator.
Builds sliding window sequences from raw landmark frames.
Provides reproducible test fixtures for IDLE, READY, FOREHAND, BACKHAND, SMASH.
"""

import math
import random
from typing import List, Dict, Any, Tuple
import numpy as np
from pong_ml.features.temporal_features import extract_window_features


def generate_synthetic_gesture_data(
    num_sessions: int = 6,
    sequences_per_class: int = 10,
    sequence_length: int = 15,
    seed: int = 42,
) -> List[Dict[str, Any]]:
    """
    Generates deterministic synthetic landmark sequences for smoke-testing and pipeline verification.
    Classes:
    - IDLE: stationary open hand, low velocity
    - READY: centered upright hand, ready stance
    - FOREHAND: horizontal sweep from right to left with acceleration
    - BACKHAND: horizontal sweep from left to right with upward arc
    - SMASH: sharp downward velocity spike
    """
    np.random.seed(seed)
    random.seed(seed)

    records = []
    classes = ["IDLE", "READY", "FOREHAND", "BACKHAND", "SMASH"]

    for s_idx in range(num_sessions):
        session_id = f"sess_synth_{s_idx:02d}"

        for cls in classes:
            for seq_idx in range(sequences_per_class):
                seq_landmarks = []

                # Base 21 hand landmarks roughly in hand shape
                base_hand = np.zeros((21, 3), dtype=np.float32)
                # Wrist
                base_hand[0] = [0.5, 0.7, 0.0]
                # Thumb
                base_hand[1:5] = np.array([[0.45, 0.65, 0.0], [0.42, 0.60, 0.0], [0.40, 0.55, 0.0], [0.38, 0.50, 0.0]])
                # Index
                base_hand[5:9] = np.array([[0.48, 0.55, 0.0], [0.47, 0.48, 0.0], [0.46, 0.42, 0.0], [0.45, 0.35, 0.0]])
                # Middle
                base_hand[9:13] = np.array([[0.51, 0.54, 0.0], [0.51, 0.46, 0.0], [0.51, 0.40, 0.0], [0.51, 0.33, 0.0]])
                # Ring
                base_hand[13:17] = np.array([[0.54, 0.55, 0.0], [0.55, 0.48, 0.0], [0.56, 0.42, 0.0], [0.56, 0.36, 0.0]])
                # Pinky
                base_hand[17:21] = np.array([[0.57, 0.58, 0.0], [0.59, 0.52, 0.0], [0.60, 0.47, 0.0], [0.61, 0.42, 0.0]])

                for f_idx in range(sequence_length):
                    t = f_idx / max(sequence_length - 1, 1)
                    noise = np.random.normal(0, 0.005, (21, 3))
                    frame_lm = base_hand.copy() + noise

                    # Motion kinematics per class
                    if cls == "FOREHAND":
                        # Sweep from right (x+0.15) to left (x-0.20)
                        frame_lm[:, 0] += 0.15 - 0.35 * (t ** 1.5)
                        frame_lm[:, 1] += 0.05 * math.sin(t * math.pi)
                    elif cls == "BACKHAND":
                        # Sweep from left (x-0.15) to right (x+0.20)
                        frame_lm[:, 0] += -0.15 + 0.35 * (t ** 1.5)
                        frame_lm[:, 1] += -0.05 * math.sin(t * math.pi)
                    elif cls == "SMASH":
                        # Downward spike
                        frame_lm[:, 1] += 0.40 * (t ** 2.0)
                        frame_lm[:, 2] += -0.20 * t
                    elif cls == "READY":
                        # Micro vibration
                        frame_lm[:, 1] += 0.01 * math.sin(t * 4 * math.pi)
                    elif cls == "IDLE":
                        # Stationary
                        pass

                    seq_landmarks.append(frame_lm)

                records.append({
                    "session_id": session_id,
                    "sequence_id": f"{session_id}_{cls}_{seq_idx:03d}",
                    "label": cls,
                    "sequence_landmarks": seq_landmarks,
                })

    return records


def build_dataset_arrays(records: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    """
    Transforms sequence records into feature matrix X (N, 126) and labels array y (N).
    """
    classes = sorted(list(set(r["label"] for r in records)))
    label_to_idx = {c: i for i, c in enumerate(classes)}

    X_list = []
    y_list = []

    for r in records:
        features = extract_window_features(r["sequence_landmarks"])
        X_list.append(features)
        y_list.append(label_to_idx[r["label"]])

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list, dtype=np.int64)
    return X, y, classes
