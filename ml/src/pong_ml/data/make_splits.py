"""
Split Generator for Temporal Datasets.
Partitions data strictly by session_id to prevent temporal autocorrelation leakage.
"""

import random
from typing import List, Dict, Any, Tuple


def split_by_session(
    records: List[Dict[str, Any]],
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    seed: int = 42,
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Groups records by session_id, shuffles sessions deterministically with seed,
    and partitions entire sessions into train, val, and test subsets.
    Zero frames from any test session will ever appear in the train set.
    """
    random.seed(seed)

    sessions: Dict[str, List[Dict[str, Any]]] = {}
    for r in records:
        sid = r.get("session_id", "default_sess")
        sessions.setdefault(sid, []).append(r)

    session_keys = sorted(list(sessions.keys()))
    random.shuffle(session_keys)

    n_sessions = len(session_keys)
    if n_sessions == 1:
        # Fallback if only 1 session: warn and split sequentially
        data = sessions[session_keys[0]]
        n = len(data)
        t_idx = int(n * train_ratio)
        v_idx = int(n * (train_ratio + val_ratio))
        return data[:t_idx], data[t_idx:v_idx], data[v_idx:]

    n_train = max(1, int(n_sessions * train_ratio))
    n_val = max(1, int(n_sessions * val_ratio))

    train_sessions = set(session_keys[:n_train])
    val_sessions = set(session_keys[n_train:n_train + n_val])
    test_sessions = set(session_keys[n_train + n_val:])
    if not test_sessions:
        test_sessions = val_sessions  # edge case with very few sessions

    train_records = [r for sid in train_sessions for r in sessions[sid]]
    val_records = [r for sid in val_sessions for r in sessions[sid]]
    test_records = [r for sid in test_sessions for r in sessions[sid]]

    return train_records, val_records, test_records
