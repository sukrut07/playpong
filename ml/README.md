# PONG AI — Machine Learning & Gesture Training Workspace (`ml/`)

This directory provides the local ML pipeline for temporal hand landmark classification, action recognition research, dataset validation, session-level leakage prevention, and model evaluation.

## Workspace Architecture
```
ml/
├── configs/
│   ├── gesture_classifier.yaml    # 15-frame sliding window MLP configuration
│   ├── video_classifier.yaml      # VideoMAE / RacketVision research parameters
│   └── training.yaml              # Hyperparameters, metrics, and thresholds
├── data/
│   ├── README.md                  # Dataset schemas & leakage prevention protocol
│   ├── raw/                       # Consented raw MediaPipe session recordings
│   ├── interim/                   # Wrist-centered, palm-scaled normalized frames
│   ├── processed/                 # 126-dim sliding window feature arrays
│   └── splits/                    # Session-partitioned train / val / test sets
├── src/pong_ml/
│   ├── data/                      # Validation, sequence building, and split generation
│   ├── features/                  # 3D landmark normalization & temporal features
│   ├── models/                    # GestureClassifierModel & TemporalInferenceEngine
│   ├── training/                  # train_gesture_classifier.py & train_video_classifier.py
│   ├── inference/                 # predict_gesture.py & benchmark.py profiler
│   └── metrics/                   # Multi-class accuracy, F1, confusion matrix, latencies
├── tests/                         # Pytest unit test suite (8 tests)
└── artifacts/
    ├── checkpoints/               # Trained joblib checkpoints (e.g. gesture_mlp_v1.joblib)
    ├── manifests/                 # Provenance manifests with verified metrics
    └── reports/                   # Detailed evaluation reports with confusion matrices
```

## Quickstart Commands

### 1. Run Unit Tests
```bash
PYTHONPATH=ml/src services/ai-orchestrator/.venv/bin/pytest ml/tests
```

### 2. Train Gesture Classifier
```bash
PYTHONPATH=ml/src services/ai-orchestrator/.venv/bin/python ml/src/pong_ml/training/train_gesture_classifier.py
```

### 3. Run Latency Benchmark
```bash
PYTHONPATH=ml/src services/ai-orchestrator/.venv/bin/python ml/src/pong_ml/inference/benchmark.py
```

## Temporal Gesture Classification Design
- **Input**: 15 frames sliding window (~250ms at 60 FPS).
- **Features (126 dims)**:
  - 63 dimensions: Current hand pose (21 landmarks x 3D coords, translated to wrist origin at (0,0,0) and scaled by palm span).
  - 63 dimensions: Mean velocity delta vector over the window (`(pts_t - pts_0) / dt`).
- **Classes**: `IDLE`, `READY`, `FOREHAND`, `BACKHAND`, `SMASH`.
- **Latency**: P50 latency **<0.1 ms**, throughput **>10,000 inferences/sec** on CPU.
- **Leakage Prevention**: All splits are partitioned strictly by `session_id`. Consecutive frames from the same session never cross partition boundaries.

## Video Action Recognition Research (VideoMAE & RacketVision)
See `configs/video_classifier.yaml` and `src/pong_ml/training/train_video_classifier.py` for architecture specifications, hardware sizing (minimum 16GB VRAM for 16-frame 224x224 batches), and dataset citations ([RacketVision](https://huggingface.co/datasets/Corgiluu/RacketVision) & [VideoMAE](https://huggingface.co/MCG-NJU/videomae-base)).
