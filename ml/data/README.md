# PONG AI — ML Data Pipeline & Provenance

## Dataset Organization
- `data/raw/`: Raw recorded MediaPipe landmark trajectories (.jsonl / .csv) with participant consent and session metadata.
- `data/interim/`: Normalized trajectories with wrist-origin centering and velocity deltas calculated.
- `data/processed/`: Fixed-length sliding window feature vectors (15 frames x 126 dims) ready for tensor ingestion.
- `data/splits/`: Session-partitioned `train.jsonl`, `val.jsonl`, and `test.jsonl` splits.

## Leakage Prevention Protocol
1. **Session-Level Splitting**: Consecutive frames in video and gesture tracking exhibit strong temporal autocorrelation. Random frame-level shuffling leaks adjacent frames across train and test partitions, inflating reported accuracy.
2. In PONG AI, all splits are strictly partitioned by `session_id` or `participant_id`. No session is ever split across partitions.
3. **Data Schema**:
   ```json
   {
     "session_id": "sess_20261022_01",
     "participant_id": "p01",
     "timestamp_ms": 1729600000120,
     "frame_index": 45,
     "handedness": "Right",
     "confidence": 0.94,
     "landmarks": [
       {"id": 0, "x": 0.52, "y": 0.78, "z": -0.02},
       ...
       {"id": 20, "x": 0.48, "y": 0.35, "z": -0.08}
     ],
     "label": "FOREHAND"
   }
   ```
