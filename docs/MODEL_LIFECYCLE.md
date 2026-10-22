# PONG AI — Model Lifecycle & Artifact Management

## 1. Distinction: Downloaded Weights vs. Trained Files

In modern AI engineering, transparency regarding model provenance is paramount. PONG AI establishes a strict distinction between four types of artifacts:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Downloaded Model Weights (Pretrained Baseline)                           │
│    - Pulled via Ollama: `gemma4:e2b` and `gemma4:e4b`                       │
│    - Foundation instruction-tuned checkpoints from Google DeepMind.         │
│    - NEVER described as custom fine-tunes or proprietary checkpoints.       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. Ollama Modelfile (Runtime Configuration)                                 │
│    - Declarative instructions specifying system prompts and sampling temps. │
│    - Configures persona and format; does NOT alter model weights.           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. Training Datasets (Versioned Telemetry & Expert Annotations)             │
│    - Real match records and expert coach feedback (`models/datasets/`).     │
│    - Strictly anonymized, consented, and deduplicated.                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. Fine-Tuned Checkpoints & Adapters (LoRA / PEFT)                          │
│    - Real artifacts created ONLY when an empirical training run finishes.   │
│    - Contains training hyper-parameters, loss curves, and benchmark deltas. │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Model Manifests

Every active model variant must be documented with an auditable JSON manifest under `models/manifests/`.

### Example Manifest (`models/manifests/gemma4_e2b.json`):
```json
{
  "model_family": "gemma4",
  "model_tag": "gemma4:e2b",
  "source": "https://ollama.com/library/gemma4",
  "license": "Gemma Terms of Use / Open Weights",
  "parameter_tier": "E2B (Effective 2B parameters)",
  "quantization": "nvfp4",
  "format": "safetensors",
  "size_bytes": 7476595162,
  "size_human": "7.5 GB",
  "context_window": 131072,
  "digest": "45d11505b91d888e353859f5deeeeff3ffc9b3aa42263c00904120c53851ef96",
  "runtime_requirements": {
    "recommended_ram_gb": 8,
    "hardware_acceleration": "Apple Silicon MLX / Metal / CUDA supported"
  },
  "intended_use": [
    "Fast intent classification",
    "Lightweight match summaries",
    "Natural language routing"
  ],
  "is_custom_checkpoint": false
}
```

---

## 3. Storage & Version Control Rules

1. **Large Weights Excluded**: Model weight binaries (`.bin`, `.gguf`, `.safetensors` > 50MB) are kept out of Git via `.gitignore`.
2. **Deterministic Reproducibility**: Only manifests, evaluation scripts, dataset schemas, and training pipelines are tracked in version control.
3. **Local-First Privacy**: Weights are downloaded directly through `ollama pull` on the host machine.

---

## 4. Empirical Fine-Tuning Justification Protocol

Fine-tuning is an optional optimization phase that should only be initiated when:
1. **Measured Deficiency**: Gemma 4 base models show statistically significant failures on `models/datasets/evaluation_cases.json` that cannot be resolved via prompt constraints or deterministic tool retrieval.
2. **Curated Dataset Available**: A dataset of $\ge 500$ verified, anonymized table tennis match summaries and expert coach recommendations has been gathered.
3. **PEFT/LoRA Execution**: A training experiment is conducted using `peft` and Hugging Face Transformers, producing verified adapter checkpoints under `models/adapters/`.
