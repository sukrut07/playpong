"""
Deterministic analytics tools for PONG AI.
Provides strictly auditable mathematical metrics, denominator checking, and zone distribution calculations.
Never allows LLMs to calculate match scores or invent statistics.
"""

from typing import Dict, Any, List, Optional
from ..schemas import MatchStats


def compute_verified_metrics(stats: MatchStats) -> Dict[str, Any]:
    """
    Computes and audits deterministic match metrics.
    Ensures that zero denominators are properly handled with null and flagged.
    Checks consistency constraints (e.g. successfulReturns <= eligibleReturnAttempts).
    """
    validation_errors = []

    # Consistency check
    if stats.successfulReturns > stats.eligibleReturnAttempts:
        validation_errors.append(
            f"Constraint violation: successfulReturns ({stats.successfulReturns}) exceeds eligibleReturnAttempts ({stats.eligibleReturnAttempts})"
        )

    # Return success rate calculation
    return_success_rate = None
    if stats.eligibleReturnAttempts > 0:
        return_success_rate = round(
            (stats.successfulReturns / stats.eligibleReturnAttempts) * 100.0, 1
        )
    else:
        # Zero denominator handled safely
        return_success_rate = None

    # Miss rate calculation
    miss_rate = None
    if stats.eligibleReturnAttempts > 0:
        miss_rate = round(
            (stats.missedReturns / stats.eligibleReturnAttempts) * 100.0, 1
        )

    # Average rally length
    avg_rally = None
    if stats.totalRallies > 0:
        avg_rally = stats.averageRallyLength
        if avg_rally is not None:
            avg_rally = round(avg_rally, 2)

    # Zone analysis
    zd = stats.tableZoneDistribution
    total_zones = zd.left + zd.center + zd.right
    zone_dominant = "BALANCED"
    if total_zones > 0:
        if zd.center >= zd.left and zd.center >= zd.right:
            zone_dominant = "CENTER"
        elif zd.left > zd.right:
            zone_dominant = "LEFT_CORNER"
        else:
            zone_dominant = "RIGHT_CORNER"

    return {
        "match_id": stats.matchId,
        "player_score": stats.playerScore,
        "opponent_score": stats.opponentScore,
        "is_winner": stats.playerScore > stats.opponentScore,
        "score_margin": abs(stats.playerScore - stats.opponentScore),
        "return_success_rate": return_success_rate,
        "miss_rate": miss_rate,
        "eligible_return_attempts": stats.eligibleReturnAttempts,
        "successful_returns": stats.successfulReturns,
        "missed_returns": stats.missedReturns,
        "longest_rally": stats.longestRally,
        "total_rallies": stats.totalRallies,
        "average_rally_length": avg_rally,
        "tracking_stability_percentage": stats.trackingStabilityPercentage,
        "controller_mode": stats.controllerMode,
        "rule_profile": stats.ruleProfile,
        "zone_dominant": zone_dominant,
        "validation_errors": validation_errors,
        "has_zero_attempts": stats.eligibleReturnAttempts == 0,
    }


def compare_match_to_history(
    current: MatchStats, history: List[MatchStats]
) -> Dict[str, Any]:
    """
    Compares current match performance with historical trends.
    """
    if not history:
        return {
            "historical_matches_count": 0,
            "trend": "FIRST_RECORDED_SESSION",
            "delta_return_rate": None,
            "delta_rally_length": None,
        }

    valid_hist_rates = [
        m.returnSuccessRate
        for m in history
        if m.returnSuccessRate is not None and m.eligibleReturnAttempts > 0
    ]
    avg_hist_rate = (
        sum(valid_hist_rates) / len(valid_hist_rates) if valid_hist_rates else None
    )

    delta_rate = None
    if current.returnSuccessRate is not None and avg_hist_rate is not None:
        delta_rate = round(current.returnSuccessRate - avg_hist_rate, 1)

    return {
        "historical_matches_count": len(history),
        "avg_historical_return_rate": round(avg_hist_rate, 1) if avg_hist_rate else None,
        "delta_return_rate": delta_rate,
        "trend": "IMPROVING" if delta_rate and delta_rate > 0 else "STABLE_OR_DECLINING",
    }
