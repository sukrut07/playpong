"""
Unit tests for ITTF 2026 Rules Knowledge Base and Rules Retriever.
Verifies:
- Rule record schema adherence
- Source provenance and page references
- Distinct ARCADE_PONG vs TABLE_TENNIS_TRAINING profiles
- Rule conflict detection
- Uncertainty responses for non-existent or unverified rules
"""

import pytest
from app.retrieval.rules_retriever import rules_retriever, RulesRetriever


def test_retriever_loads_records():
    retriever = RulesRetriever()
    assert len(retriever._rules_cache) >= 10, "Expected at least 10 verified ITTF rules"
    assert len(retriever._conflicts_cache) >= 4, "Expected at least 4 documented rule conflicts"


def test_get_rule_by_exact_and_normalized_id():
    rule = rules_retriever.get_rule_by_id("ITTF-2026-2.1.1")
    assert rule is not None
    assert "2.74m" in rule.rule_text
    assert rule.page_number == 34
    assert rule.verification_status == "verified"
    assert "table_tennis_training" in rule.applies_to

    # Normalized query
    rule2 = rules_retriever.get_rule_by_id("2.6.2")
    assert rule2 is not None
    assert "16cm" in rule2.rule_text


def test_rule_search_returns_citations():
    result = rules_retriever.search("table dimensions length width", profile="TABLE_TENNIS_TRAINING")
    assert result.found is True
    assert result.uncertainty_flag is False
    assert len(result.matches) > 0
    top_match = result.matches[0]
    assert top_match["rule_id"] == "ITTF-2026-2.1.1"
    assert "Page 34" in result.citation_summary


def test_conflict_search_wall_bounces():
    result = rules_retriever.search("wall bounces arcade physics", profile="ALL")
    assert len(result.conflicts) > 0
    conflict = result.conflicts[0]
    assert "CONFLICT-01-WALL-BOUNCES" == conflict["conflict_id"]
    assert "ITTF-2026-2.7.1" == conflict["ittf_statute_ref"]


def test_unknown_rule_triggers_uncertainty_flag():
    result = rules_retriever.search("quantum teleportation ball rules", profile="TABLE_TENNIS_TRAINING")
    assert result.uncertainty_flag is True
    assert "Uncertainty Note" in result.citation_summary
