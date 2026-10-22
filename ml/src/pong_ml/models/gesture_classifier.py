"""
Gesture Classifier Architecture & Wrapper.
Wraps an MLP / ensemble classifier trained on normalized temporal landmark features.
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
import joblib
import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler


class GestureClassifierModel:
    def __init__(self, num_classes: int = 5, classes: Optional[List[str]] = None):
        self.num_classes = num_classes
        self.classes = classes or ["IDLE", "READY", "FOREHAND", "BACKHAND", "SMASH"]
        self.scaler = StandardScaler()
        self.classifier = MLPClassifier(
            hidden_layer_sizes=(128, 64, 32),
            activation="relu",
            solver="adam",
            max_iter=200,
            random_state=42,
            early_stopping=True,
            n_iter_no_change=10,
        )
        self.is_fitted = False

    def fit(self, X: np.ndarray, y: np.ndarray) -> "GestureClassifierModel":
        X_scaled = self.scaler.fit_transform(X)
        self.classifier.fit(X_scaled, y)
        self.is_fitted = True
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted yet.")
        X_scaled = self.scaler.transform(X)
        return self.classifier.predict(X_scaled)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("Model is not fitted yet.")
        X_scaled = self.scaler.transform(X)
        return self.classifier.predict_proba(X_scaled)

    def save(self, filepath: Path):
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump({
            "classes": self.classes,
            "scaler": self.scaler,
            "classifier": self.classifier,
            "is_fitted": self.is_fitted,
        }, filepath)

    @classmethod
    def load(cls, filepath: Path) -> "GestureClassifierModel":
        data = joblib.load(filepath)
        model = cls(num_classes=len(data["classes"]), classes=data["classes"])
        model.scaler = data["scaler"]
        model.classifier = data["classifier"]
        model.is_fitted = data["is_fitted"]
        return model
