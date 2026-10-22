# LoRA & PEFT Adapters Registry

This directory is reserved for fine-tuned parameter-efficient adapter weights (such as LoRA / QLoRA adapters) generated from empirical training runs on verified PONG AI match datasets.

## Status: No Fine-Tuned Checkpoints (Pretrained Baseline Phase)

In adherence to strict ML engineering integrity:
- **No fine-tuning has been executed yet.**
- The system currently operates on the official, unmodified **Gemma 4 E2B** and **Gemma 4 E4B** pretrained foundation weights served locally via Ollama.
- Fine-tuning is only justified if the empirical evaluation suite (`models/evaluations/`) reveals a specific, measurable reasoning deficit in base Gemma 4 that prompt engineering and deterministic tool-retrieval cannot resolve.

## Future Adapter Format
When an adapter is produced via `models/training/`:
- `adapter_config.json`: PEFT configuration (rank, alpha, target modules).
- `adapter_model.safetensors`: Quantized adapter deltas.
- `manifest.json`: Lineage metadata linking back to training run ID, dataset version, and evaluation score improvement.
