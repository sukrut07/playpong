# PONG AI — Training Lifecycle & Dataset Validation

This directory contains the training configuration, data validation schemas, and reproducible training guidelines for future model adaptation.

## Fine-Tuning Prerequisites Checklist

Before executing any fine-tuning run:
1. **Measurable Baseline Failure**: Establish that Gemma 4 E2B or E4B fails specific factual grounding, coaching recommendation, or schema constraints on `models/datasets/evaluation_cases.json`.
2. **Consented Real Data**: Assemble at least 500+ verified match records with expert-reviewed coaching plans.
3. **Privacy Sanitization**: Strip all personal identifiers, IP addresses, player camera metadata, or telemetry timestamps.
4. **Data Splits**: Maintain strict 80/10/10 train/validation/test splits with zero match leakage.
5. **Compute & Tooling**: Utilize Hugging Face `transformers` + `peft` (QLoRA) or an official Gemma training recipe.

## Training Dataset Schema

Each training example must strictly adhere to the following schema:

```json
{
  "id": "train_001",
  "task": "MATCH_COACHING",
  "input": {
    "match_id": "match_live_01",
    "metrics": {
      "player_score": 11,
      "opponent_score": 9,
      "return_success_rate": 68.4,
      "eligible_return_attempts": 19,
      "longest_rally": 7,
      "average_rally_length": 3.8,
      "table_zone_distribution": { "left": 4, "center": 11, "right": 4 }
    },
    "rules_applied": ["ITTF-2.5", "ITTF-2.11"]
  },
  "ground_truth_output": {
    "summary": "...",
    "observations": [...],
    "recommendations": [...]
  },
  "verified_by_expert": true
}
```

## Current Status
- Training status: **NOT YET JUSTIFIED** (Base Gemma 4 + LangGraph deterministic tools achieve 100% schema and metric grounding compliance).
