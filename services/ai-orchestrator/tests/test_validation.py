"""
Tests for deterministic metrics calculation, zero denominator handling, and rule lookups.
"""

import pytest
from app.schemas import MatchStats, TableZoneDistribution
from app.tools.analytics_tool import compute_verified_metrics, compare_match_to_history
from app.tools.rules_tool import get_rule_by_id, get_rules_by_profile, search_rules


def test_compute_metrics_normal():
    stats = MatchStats(
        matchId="match_001",
        playerScore=11,
        opponentScore=9,
        eligibleReturnAttempts=20,
        successfulReturns=16,
        missedReturns=4,
        longestRally=8,
        totalRallies=12,
        averageRallyLength=3.5,
        tableZoneDistribution=TableZoneDistribution(left=3, center=10, right=3),
    )

    metrics = compute_verified_metrics(stats)
    assert metrics["is_winner"] is True
    assert metrics["score_margin"] == 2
    assert metrics["return_success_rate"] == 80.0
    assert metrics["miss_rate"] == 20.0
    assert metrics["zone_dominant"] == "CENTER"
    assert len(metrics["validation_errors"]) == 0
    assert metrics["has_zero_attempts"] is False


def test_zero_denominator_handling():
    stats = MatchStats(
        matchId="match_zero",
        playerScore=0,
        opponentScore=5,
        eligibleReturnAttempts=0,
        successfulReturns=0,
        missedReturns=0,
        longestRally=0,
        totalRallies=0,
    )

    metrics = compute_verified_metrics(stats)
    assert metrics["return_success_rate"] is None
    assert metrics["miss_rate"] is None
    assert metrics["has_zero_attempts"] is True
    assert len(metrics["validation_errors"]) == 0


def test_constraint_violation_detection():
    stats = MatchStats(
        matchId="match_corrupt",
        playerScore=11,
        opponentScore=2,
        eligibleReturnAttempts=5,
        successfulReturns=10,  # Invalid: more successes than attempts
        missedReturns=0,
    )

    metrics = compute_verified_metrics(stats)
    assert len(metrics["validation_errors"]) > 0
    assert "Constraint violation" in metrics["validation_errors"][0]


def test_rules_lookup():
    rule = get_rule_by_id("ITTF-2.11")
    assert rule is not None
    assert "11 Points" in rule.title
    assert "ITTF Statutes 2026" in rule.source_document

    arcade_rules = get_rules_by_profile("ARCADE_PONG")
    assert len(arcade_rules) >= 3

    search_res = search_rules("serve", "TABLE_TENNIS_TRAINING")
    assert any(r.rule_id == "ITTF-2.6" for r in search_res)


def test_history_comparison():
    current = MatchStats(
        matchId="match_curr",
        playerScore=11,
        opponentScore=8,
        eligibleReturnAttempts=20,
        successfulReturns=18,
        returnSuccessRate=90.0,
    )

    history = [
        MatchStats(
            matchId="hist_1",
            playerScore=9,
            opponentScore=11,
            eligibleReturnAttempts=20,
            successfulReturns=14,
            returnSuccessRate=70.0,
        ),
        MatchStats(
            matchId="hist_2",
            playerScore=11,
            opponentScore=7,
            eligibleReturnAttempts=20,
            successfulReturns=16,
            returnSuccessRate=80.0,
        ),
    ]

    comp = compare_match_to_history(current, history)
    assert comp["historical_matches_count"] == 2
    assert comp["avg_historical_return_rate"] == 75.0
    assert comp["delta_return_rate"] == 15.0
    assert comp["trend"] == "IMPROVING"
