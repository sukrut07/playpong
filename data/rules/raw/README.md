# ITTF Statutes 2026 Raw Ingestion Source

## Primary Source
- **Title**: International Table Tennis Federation (ITTF) Statutes 2026 (Clean Version)
- **Official URL**: https://db.ittf.com/document/389
- **Publication Version**: 2026 Edition
- **Effective Date**: January 1, 2026
- **Source Document ID**: db.ittf.com/document/389

## Ingestion & Provenance Protocol
1. **Acquisition**: Chapter 2 ("The Laws of Table Tennis") extracted directly from the verified 2026 ITTF Statutes PDF.
2. **Section Preservation**: Section numbering (§2.1 through §2.15), headings, page numbers, and exact rule texts are preserved verbatim.
3. **Partitioning**:
   - `data/rules/processed/ittf_rules.jsonl`: Clean, section-level records with unique `rule_id`, page references, plain language summaries, and applicability tags.
   - `data/rules/processed/rule_qa_train.jsonl`: Reviewed questions, expected rule citations, and answers.
   - `data/rules/processed/rule_qa_eval.jsonl`: Held-out evaluation questions for citation precision and hallucination prevention.
   - `data/rules/processed/rule_conflicts.jsonl`: Explicit mappings comparing arcade video game mechanics with official table tennis regulations.
4. **Audit Status**: Verified against the official ITTF Statutes 2026 clean version.
