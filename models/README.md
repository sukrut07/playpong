# PONG AI — Model Artifact Registry & Lifecycle

This directory manages the lifecycle of local machine learning models, inference manifests, evaluation records, and training artifacts for **PONG AI**.

## Directory Layout

```
models/
├── README.md               # Overview of model lifecycle & governance
├── manifests/              # Versioned model manifests (source, quantization, license, specs)
│   ├── gemma4_e2b.json     # Fast local tasks: intent classification & quick summaries
│   └── gemma4_e4b.json     # Deep analysis: post-match performance coaching & metrics interpretation
├── datasets/               # Evaluation & training datasets (schema-validated)
│   └── evaluation_cases.json # Fixed evaluation suite for dual-model benchmarking
├── evaluations/            # Empirical benchmark logs and test outputs (E2B vs E4B)
├── adapters/               # Fine-tuned LoRA/PEFT adapters (only when real training occurs)
│   └── README.md
└── training/               # Fine-tuning configurations & reproducible pipelines
    └── README.md
```

## Core Governance Principles

1. **Pretrained Baseline Truthfulness**:
   - The primary models (`gemma4:e2b` and `gemma4:e4b`) are pretrained instruction-tuned weights pulled from Ollama.
   - We **never** label downloaded weights as custom-trained checkpoints or fine-tunes.
2. **Deterministic Precedence**:
   - Scoring, collision physics, ball trajectory, rule checking, and metric calculations are strictly deterministic (handled in TypeScript/C++ and deterministic Python tools).
   - Gemma models are reserved for natural language synthesis, coaching narrative, and hypothesis generation.
3. **No Synthetic Benchmarks**:
   - Evaluation reports in `models/evaluations/` reflect actual runs executed against local Ollama inference, recording real latencies, token counts, and schema validation rates.
4. **Local-First Privacy**:
   - Video frames, webcam data, and raw gameplay streams remain exclusively on the user's device and are never sent to external cloud APIs or third-party tracing endpoints.
