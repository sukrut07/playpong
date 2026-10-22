"""
Classification Metrics Computation Module.
Computes accuracy, macro precision, recall, macro F1, and per-class metrics.
"""

from typing import List, Dict, Any
import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix


def compute_classification_metrics(y_true: np.ndarray, y_pred: np.ndarray, classes: List[str]) -> Dict[str, Any]:
    acc = float(accuracy_score(y_true, y_pred))
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_true, y_pred, average="macro", zero_division=0)
    p_per, r_per, f1_per, support = precision_recall_fscore_support(y_true, y_pred, average=None, zero_division=0)

    cm = confusion_matrix(y_true, y_pred, labels=list(range(len(classes))))

    per_class = {}
    for idx, c in enumerate(classes):
        per_class[c] = {
            "precision": round(float(p_per[idx]), 3),
            "recall": round(float(r_per[idx]), 3),
            "f1": round(float(f1_per[idx]), 3),
            "support": int(support[idx]),
        }

    return {
        "accuracy": round(acc, 4),
        "macro_precision": round(float(p_macro), 4),
        "macro_recall": round(float(r_macro), 4),
        "macro_f1": round(float(f1_macro), 4),
        "per_class": per_class,
        "confusion_matrix": cm.tolist(),
        "total_samples": len(y_true),
    }
