"""
Unified Rules Retriever & Grounding Engine.
Queries both the versioned in-memory rule registry and the processed JSONL datasets:
- data/rules/processed/ittf_rules.jsonl
- data/rules/processed/rule_conflicts.jsonl
"""

import json
from pathlib import Path
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

# Locate data/rules directory dynamically
current = Path(__file__).resolve()
BASE_DIR = None
for p in current.parents:
    if (p / "data" / "rules" / "processed").exists():
        BASE_DIR = p
        break
if BASE_DIR is None:
    BASE_DIR = current.parents[4]

RULES_DIR = BASE_DIR / "data" / "rules" / "processed"
ITTF_RULES_JSONL = RULES_DIR / "ittf_rules.jsonl"
CONFLICTS_JSONL = RULES_DIR / "rule_conflicts.jsonl"


class RuleRecordSchema(BaseModel):
    rule_id: str
    source_title: str
    source_url: str = ""
    source_version: str = "2026"
    document_section: str
    page_number: int = 0
    rule_text: str
    plain_language_summary: str
    applies_to: List[str] = Field(default_factory=list)
    rule_type: str = "gameplay"
    effective_from: str = "2026-01-01"
    verification_status: str = "verified"


class RuleConflictRecord(BaseModel):
    conflict_id: str
    conflict_title: str
    arcade_pong_behavior: str
    table_tennis_regulation: str
    ittf_statute_ref: str
    system_resolution: str


class RuleRetrievalResult(BaseModel):
    query: str
    rule_profile: str  # "TABLE_TENNIS_TRAINING" | "ARCADE_PONG" | "ALL"
    matches: List[Dict[str, Any]]
    conflicts: List[Dict[str, Any]]
    found: bool
    uncertainty_flag: bool
    citation_summary: str


class RulesRetriever:
    def __init__(self):
        self._rules_cache: Dict[str, RuleRecordSchema] = {}
        self._conflicts_cache: Dict[str, RuleConflictRecord] = {}
        self._load_datasets()

    def _load_datasets(self):
        if ITTF_RULES_JSONL.exists():
            with open(ITTF_RULES_JSONL, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line:
                        data = json.loads(line)
                        rec = RuleRecordSchema(**data)
                        self._rules_cache[rec.rule_id] = rec

        if CONFLICTS_JSONL.exists():
            with open(CONFLICTS_JSONL, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line:
                        data = json.loads(line)
                        rec = RuleConflictRecord(**data)
                        self._conflicts_cache[rec.conflict_id] = rec

    def get_rule_by_id(self, rule_id: str) -> Optional[RuleRecordSchema]:
        """Look up rule by exact ID or normalized section number."""
        if rule_id in self._rules_cache:
            return self._rules_cache[rule_id]
        # Also try matching ITTF-2.x format
        norm_id = rule_id.replace("ITTF-", "ITTF-2026-")
        if norm_id in self._rules_cache:
            return self._rules_cache[norm_id]
        for rid, rec in self._rules_cache.items():
            if rule_id.lower() in rid.lower():
                return rec
        return None

    def get_conflict_by_id(self, conflict_id: str) -> Optional[RuleConflictRecord]:
        return self._conflicts_cache.get(conflict_id)

    def search(
        self,
        query: str,
        profile: str = "TABLE_TENNIS_TRAINING",
        top_k: int = 3
    ) -> RuleRetrievalResult:
        """
        Deterministic lexical retrieval across verified ITTF rules and conflict records.
        Returns explicit uncertainty if no matching rule evidence is found.
        """
        stopwords = {"the", "a", "an", "and", "or", "to", "of", "in", "is", "for", "with", "be", "by", "as", "at", "rules", "rule"}
        raw_tokens = [t.lower().strip("?,.!") for t in query.split()]
        q_tokens = [t for t in raw_tokens if t and t not in stopwords]

        matched_rules = []
        matched_conflicts = []

        norm_profile = profile.lower()

        if q_tokens:
            # Score rule records
            for rec in self._rules_cache.values():
                applies = [a.lower() for a in rec.applies_to]
                if profile != "ALL" and norm_profile not in applies:
                    continue

                text_corpus = f"{rec.document_section} {rec.plain_language_summary} {rec.rule_text}".lower()
                overlap = 0
                for t in q_tokens:
                    if t in text_corpus or (t == "length" and "long" in text_corpus) or (t == "dimensions" and ("long" in text_corpus or "wide" in text_corpus)):
                        overlap += 1
                ratio = overlap / len(q_tokens)
                if ratio >= 0.5:
                    score = ratio
                    # Boost section title matches
                    if any(t in rec.document_section.lower() for t in q_tokens):
                        score += 0.3
                    matched_rules.append((score, rec.model_dump()))

            # Score conflicts
            for conf in self._conflicts_cache.values():
                conf_corpus = f"{conf.conflict_title} {conf.arcade_pong_behavior} {conf.table_tennis_regulation}".lower()
                overlap = sum(1 for t in q_tokens if t in conf_corpus)
                ratio = overlap / len(q_tokens)
                if ratio >= 0.5:
                    matched_conflicts.append((ratio, conf.model_dump()))

        matched_rules.sort(key=lambda x: x[0], reverse=True)
        matched_conflicts.sort(key=lambda x: x[0], reverse=True)

        # Only consider matches with score >= 0.4 for rules and >= 0.3 for conflicts
        valid_rules = [r[1] for r in matched_rules if r[0] >= 0.4][:top_k]
        valid_conflicts = [c[1] for c in matched_conflicts if c[0] >= 0.3][:2]

        found = len(valid_rules) > 0 or len(valid_conflicts) > 0
        uncertainty = not found

        if valid_rules:
            citations = ", ".join([f"{r['rule_id']} ({r['document_section']}, Page {r['page_number']})" for r in valid_rules])
            cit_summary = f"Citing verified ITTF Statutes 2026: {citations}."
        elif valid_conflicts:
            citations = ", ".join([c['conflict_id'] for c in valid_conflicts])
            cit_summary = f"Citing documented rule conflict resolution: {citations}."
        else:
            cit_summary = "Uncertainty Note: No verified rule or conflict record matches the query with sufficient confidence in the ITTF 2026 database."

        return RuleRetrievalResult(
            query=query,
            rule_profile=profile,
            matches=valid_rules,
            conflicts=valid_conflicts,
            found=found,
            uncertainty_flag=uncertainty,
            citation_summary=cit_summary
        )


rules_retriever = RulesRetriever()
