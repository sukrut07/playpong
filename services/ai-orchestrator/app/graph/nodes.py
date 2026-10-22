"""
Explicit, testable nodes for the PONG AI LangGraph workflow.
Combines deterministic math and rules retrieval with Gemma 4 local inference and evidence validation.
"""

import time
import json
import re
from typing import Dict, Any, List, Optional
from .state import GraphState
from ..schemas import MatchStats
from ..tools.analytics_tool import compute_verified_metrics, compare_match_to_history
from ..tools.rules_tool import (
    RULE_REGISTRY,
    get_rule_by_id,
    get_rules_by_profile,
    search_rules,
)
from ..models.ollama_provider import ollama_provider, TaskType
from ..config import settings


async def validate_request_node(state: GraphState) -> Dict[str, Any]:
    """Node 1: Request and Match ID Validation"""
    match_id = state.get("match_id", "")
    req_type = state.get("request_type", "")

    if not match_id or not match_id.strip():
        return {
            "status": "FAILED",
            "current_stage": "validate_request",
            "error": "Missing or empty match_id in request",
            "validation_errors": ["Empty match_id"],
        }

    valid_types = {
        "MATCH_COACHING",
        "FAST_SUMMARY",
        "ANALYTICS_QUERY",
        "RULE_EXPLANATION",
        "CONTROLLER_EVALUATION",
        "BENCHMARK_INTERPRETATION",
    }
    if req_type not in valid_types:
        return {
            "status": "FAILED",
            "current_stage": "validate_request",
            "error": f"Invalid request_type '{req_type}'. Must be one of {valid_types}",
            "validation_errors": [f"Invalid request_type: {req_type}"],
        }

    return {
        "status": "PENDING",
        "current_stage": "validate_request",
        "validation_errors": [],
    }


async def load_match_evidence_node(state: GraphState) -> Dict[str, Any]:
    """Node 2: Load authoritative match events & raw stats"""
    raw_stats = state.get("raw_stats")
    if not raw_stats:
        return {
            "status": "FAILED",
            "current_stage": "load_match_evidence",
            "error": "Missing authoritative match statistics",
        }

    return {
        "current_stage": "load_match_evidence",
    }


async def compute_metrics_node(state: GraphState) -> Dict[str, Any]:
    """Node 3: Deterministic Metrics Computation & Auditing"""
    raw_stats = state.get("raw_stats", {})
    req_type = state.get("request_type", "MATCH_COACHING")

    # If this is a rule or benchmark query without full match stats
    if req_type in ("RULE_EXPLANATION", "CONTROLLER_EVALUATION", "BENCHMARK_INTERPRETATION"):
        match_id = raw_stats.get("match_id", state.get("match_id", "benchmark_query"))
        verified = {
            "match_id": match_id,
            "rule_profile": raw_stats.get("rule_profile", "TABLE_TENNIS_TRAINING"),
            "is_winner": False,
            "score_margin": 0,
            "player_score": 0,
            "opponent_score": 0,
            "return_success_rate": None,
            "miss_rate": None,
            "eligible_return_attempts": 0,
            "successful_returns": 0,
            "missed_returns": 0,
            "longest_rally": 0,
            "total_rallies": 0,
            "average_rally_length": None,
            "tracking_stability_percentage": 0.0,
            "controller_mode": "evaluation",
            "zone_dominant": "N/A",
            "validation_errors": [],
            "has_zero_attempts": True,
        }
        return {
            "current_stage": "compute_metrics",
            "validated_metrics": verified,
            "validation_errors": [],
        }

    try:
        stats_obj = MatchStats(**raw_stats)
        verified = compute_verified_metrics(stats_obj)

        val_errors = verified.get("validation_errors", [])
        return {
            "current_stage": "compute_metrics",
            "validated_metrics": verified,
            "validation_errors": val_errors,
        }
    except Exception as e:
        return {
            "status": "FAILED",
            "current_stage": "compute_metrics",
            "error": f"Metrics computation failure: {str(e)}",
            "validation_errors": [str(e)],
        }


async def route_request_node(state: GraphState) -> Dict[str, Any]:
    """Node 4: Intent Classification & Routing"""
    req_type = state.get("request_type", "MATCH_COACHING")
    return {
        "current_stage": "route_request",
    }


async def retrieve_rules_node(state: GraphState) -> Dict[str, Any]:
    """Node 5: Versioned Rules Retrieval (ITTF 2026 / Arcade)"""
    req_type = state.get("request_type", "MATCH_COACHING")
    validated = state.get("validated_metrics") or {}
    rule_profile = validated.get("rule_profile", "TABLE_TENNIS_TRAINING")

    evidence_rules = []

    if req_type == "RULE_EXPLANATION":
        question = state.get("question", "")
        # Check if user passed a specific rule ID or query
        target_rule_id = state.get("raw_stats", {}).get("rule_id") or ""
        if target_rule_id:
            rule_rec = get_rule_by_id(target_rule_id)
            if rule_rec:
                evidence_rules.append(rule_rec.model_dump())
            else:
                # Flag unregistered rule
                evidence_rules.append(
                    {
                        "rule_id": target_rule_id,
                        "title": "Unregistered Rule",
                        "description": "Rule ID not found in official ITTF Statutes or Arcade specification.",
                        "implemented": False,
                        "implementation_status": "NOT_IMPLEMENTED",
                        "limitations": "Rule reference does not exist in registry.",
                    }
                )
        elif question:
            matches = search_rules(question, rule_profile)
            evidence_rules = [r.model_dump() for r in matches[:3]]
    else:
        # Standard coaching: fetch primary game rules for this profile
        profile_rules = get_rules_by_profile(rule_profile)
        # Select foundational rules (scoring, let, return)
        core_ids = {"ITTF-2.5", "ITTF-2.7", "ITTF-2.10", "ITTF-2.11", "ARCADE-01", "ARCADE-03"}
        evidence_rules = [
            r.model_dump() for r in profile_rules if r.rule_id in core_ids
        ]

    return {
        "current_stage": "retrieve_rules_if_needed",
        "rule_evidence": evidence_rules,
    }


async def run_analytics_tool_node(state: GraphState) -> Dict[str, Any]:
    """Node 6: Run approved analytics queries & history comparisons"""
    raw_stats = state.get("raw_stats", {})
    history_raw = state.get("raw_stats", {}).get("history", [])

    history_comp = {"historical_matches_count": 0, "trend": "FIRST_RECORDED_SESSION"}
    if history_raw:
        try:
            curr_stats = MatchStats(**raw_stats)
            hist_stats = [MatchStats(**h) for h in history_raw]
            history_comp = compare_match_to_history(curr_stats, hist_stats)
        except Exception:
            pass

    return {
        "current_stage": "run_approved_analytics_tool",
        "history_comparison": history_comp,
    }


async def select_model_node(state: GraphState) -> Dict[str, Any]:
    """Node 7: Dynamic Model Routing Policy (E2B vs E4B)"""
    req_type = state.get("request_type", "MATCH_COACHING")
    override = state.get("model_override")

    model_tag, reason = await ollama_provider.select_model_for_task(
        task_type=req_type, model_override=override
    )

    return {
        "current_stage": "select_model",
        "selected_model": model_tag,
        "routing_reason": reason,
    }


async def generate_analysis_node(state: GraphState) -> Dict[str, Any]:
    """Node 8: Structured Analysis Generation via LangChain ChatOllama"""
    selected_model = state.get("selected_model", settings.fast_model)
    req_type = state.get("request_type", "MATCH_COACHING")
    metrics = state.get("validated_metrics", {})
    rule_evidence = state.get("rule_evidence", [])
    history_comp = state.get("history_comparison", {})
    question = state.get("question", "")

    # Build constrained, evidence-grounded prompt
    prompt = f"""You are PONG AI's official Match Coach and Analytics Engine.
You must adhere strictly to evidence-based reasoning.
NEVER fabricate metrics, NEVER invent game scores, and NEVER cite rules not listed below.

[VALIDATED MATCH TELEMETRY]
Match ID: {metrics.get('match_id')}
Score: Player {metrics.get('player_score')} — Opponent {metrics.get('opponent_score')}
Result: {'WON' if metrics.get('is_winner') else 'LOST'} (Margin: {metrics.get('score_margin')})
Return Success Rate: {metrics.get('return_success_rate')}% (Eligible attempts: {metrics.get('eligible_return_attempts')}, Successful: {metrics.get('successful_returns')}, Missed: {metrics.get('missed_returns')})
Longest Rally: {metrics.get('longest_rally')}
Average Rally Length: {metrics.get('average_rally_length')}
Dominant Table Zone: {metrics.get('zone_dominant')}
Controller Mode: {metrics.get('controller_mode')} (Tracking Stability: {metrics.get('tracking_stability_percentage')}%)
Rule Profile: {metrics.get('rule_profile')}
Zero Attempts Flag: {metrics.get('has_zero_attempts')}

[OFFICIAL RULE CITATIONS AVAILABLE]
{json.dumps(rule_evidence, indent=2)}

[HISTORICAL CONTEXT]
{json.dumps(history_comp, indent=2)}

[TASK TYPE]: {req_type}
[USER QUESTION IF APPLICABLE]: {question}

Return ONLY a valid JSON object matching this exact schema:
{{
  "summary": "Clear, grounded 2-3 sentence match analysis",
  "observations": [
    {{
      "title": "Observation Title",
      "description": "Specific observation grounded in the telemetry above",
      "metricName": "Metric Name",
      "metricValue": "Exact value or percentage"
    }}
  ],
  "evidence": [
    {{
      "metric": "Metric identifier",
      "observedValue": "Observed value",
      "expectedBenchmark": "Expected baseline benchmark",
      "significance": "Why this metric impacted the match result"
    }}
  ],
  "weaknesses": [
    {{
      "issue": "Identified weak point",
      "likelyCause": "Possible biomechanical or tactical explanation",
      "isHypothesis": true
    }}
  ],
  "recommendations": [
    "Actionable, measurable recommendation 1",
    "Actionable, measurable recommendation 2"
  ],
  "training_plan": [
    {{
      "drillTitle": "Specific Drill Name",
      "targetMetric": "Target Metric to improve",
      "targetGoal": "Measurable success condition (e.g. >75% return success)",
      "instructions": "Step-by-step practice instructions",
      "durationGuidance": "3-5 minutes"
    }}
  ],
  "next_match_objective": "Single concrete goal for next match",
  "rule_references": [
    {{
      "ruleId": "Rule ID from citations above",
      "title": "Rule Title",
      "citation": "Official section citation",
      "explanation": "How this rule applied to the match"
    }}
  ],
  "limitations": [
    "Any data or physical limitations (e.g. single camera 2D depth limits, zero sample sizes)"
  ]
}}
"""

    t0 = time.time()
    try:
        chat_model = ollama_provider.get_chat_model(selected_model, temperature=0.2)
        response = await chat_model.ainvoke(prompt)
        elapsed_ms = round((time.time() - t0) * 1000, 1)

        raw_content = response.content if hasattr(response, "content") else str(response)

        return {
            "current_stage": "generate_analysis",
            "analysis_raw": raw_content,
            "inference_time_ms": elapsed_ms,
        }
    except Exception as e:
        elapsed_ms = round((time.time() - t0) * 1000, 1)
        return {
            "current_stage": "generate_analysis",
            "analysis_raw": None,
            "error": f"Model inference error: {str(e)}",
            "inference_time_ms": elapsed_ms,
            "validation_errors": [f"Provider exception: {str(e)}"],
        }


async def validate_analysis_node(state: GraphState) -> Dict[str, Any]:
    """Node 9: Deterministic Evidence and Schema Grounding Validation"""
    raw_content = state.get("analysis_raw")
    metrics = state.get("validated_metrics") or {}
    rule_evidence = state.get("rule_evidence") or []
    val_errors = list(state.get("validation_errors") or [])

    if not raw_content:
        val_errors.append("No response received from language model")
        return {
            "current_stage": "validate_analysis",
            "validation_errors": val_errors,
            "evidence_status": "DEGRADED",
        }

    # Extract JSON block
    parsed_json = None
    try:
        # Strip markdown fences if present
        clean_text = raw_content.strip()
        if "```json" in clean_text:
            clean_text = clean_text.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_text:
            clean_text = clean_text.split("```")[1].split("```")[0].strip()

        # Find first { and last }
        start_idx = clean_text.find("{")
        end_idx = clean_text.rfind("}")
        if start_idx != -1 and end_idx != -1:
            clean_text = clean_text[start_idx : end_idx + 1]

        parsed_json = json.loads(clean_text)
    except Exception as e:
        val_errors.append(f"JSON parsing error: {str(e)}")
        return {
            "current_stage": "validate_analysis",
            "validation_errors": val_errors,
            "evidence_status": "DEGRADED",
        }

    # Evidence Grounding Verification
    # 1. Check if model made claims when sample size is zero
    if metrics.get("has_zero_attempts", False):
        for obs in parsed_json.get("observations", []):
            desc = obs.get("description", "").lower()
            if "100%" in desc or "perfect return" in desc:
                val_errors.append(
                    "Model hallucinated 100% return rate on zero eligible attempts"
                )

    # 2. Check rule reference existence
    valid_rule_ids = {r.get("rule_id", "").upper() for r in rule_evidence}
    # Also allow global registry rule IDs
    all_registry_ids = {r.rule_id.upper() for r in RULE_REGISTRY}

    for rr in parsed_json.get("rule_references", []):
        r_id = rr.get("ruleId", "").strip().upper()
        if r_id and r_id not in all_registry_ids:
            val_errors.append(f"Model cited non-existent rule ID: {r_id}")

    # 3. Check schema required keys
    for req_key in ["summary", "observations", "recommendations"]:
        if req_key not in parsed_json or not parsed_json[req_key]:
            val_errors.append(f"Missing required schema field '{req_key}'")

    evidence_status = "VERIFIED" if not val_errors else "DEGRADED"

    return {
        "current_stage": "validate_analysis",
        "analysis": parsed_json,
        "validation_errors": val_errors,
        "evidence_status": evidence_status,
    }


async def retry_or_fallback_node(state: GraphState) -> Dict[str, Any]:
    """Node 10: Retry logic or deterministic fallback engine"""
    val_errors = state.get("validation_errors") or []
    retry_count = state.get("retry_count", 0)

    # If valid, pass through
    if not val_errors and state.get("analysis"):
        return {
            "current_stage": "retry_or_fallback",
            "status": "SUCCESS",
        }

    # Bounded retry: if we have not retried yet, request retry
    if retry_count < settings.ai_max_retries and not state.get("error"):
        return {
            "current_stage": "retry_or_fallback",
            "retry_count": retry_count + 1,
            "status": "RETRYING",
        }

    # Fallback: Generate completely deterministic, verified coaching report
    metrics = state.get("validated_metrics") or {}
    match_id = state.get("match_id", "unknown")
    rule_profile = metrics.get("rule_profile", "TABLE_TENNIS_TRAINING")
    is_winner = metrics.get("is_winner", False)
    ret_rate = metrics.get("return_success_rate")
    ret_str = f"{ret_rate}%" if ret_rate is not None else "N/A (0 attempts)"

    observations = [
        {
            "title": "Match Result & Margin" if is_winner else "Defensive Pressure Analysis",
            "description": f"Player finished {metrics.get('player_score')} to {metrics.get('opponent_score')} ({'Won' if is_winner else 'Lost'} by {metrics.get('score_margin')} points) with a {ret_str} return success rate across {metrics.get('eligible_return_attempts')} eligible balls.",
            "metricName": "Return Success Rate",
            "metricValue": ret_str,
        },
        {
            "title": "Rally Exchange Depth",
            "description": f"Completed {metrics.get('total_rallies')} rallies with a peak rally length of {metrics.get('longest_rally')} and an average of {metrics.get('average_rally_length')} returns.",
            "metricName": "Average Rally Length",
            "metricValue": str(metrics.get("average_rally_length") or "0"),
        },
        {
            "title": "Spatial Court Placement",
            "description": f"Primary ball placement was focused on {metrics.get('zone_dominant')} sector.",
            "metricName": "Zone Dominance",
            "metricValue": metrics.get("zone_dominant"),
        },
    ]

    evidence = [
        {
            "metric": "Return Success Rate",
            "observedValue": ret_str,
            "expectedBenchmark": "> 75.0% for competitive stability",
            "significance": "Fundamental indicator of stroke execution and paddle-ball contact accuracy.",
        },
        {
            "metric": "Miss Rate",
            "observedValue": f"{metrics.get('miss_rate')}%" if metrics.get("miss_rate") is not None else "0%",
            "expectedBenchmark": "< 25.0%",
            "significance": "Frequency of unforced errors or paddle interception misses.",
        },
    ]

    weaknesses = [
        {
            "issue": "Interception Timing Consistency",
            "likelyCause": "Hand movement lag or early racket commitment before ball bounce",
            "isHypothesis": True,
        }
    ]

    recommendations = [
        "Focus on holding paddle position in center court until ball crosses the net plane.",
        "Maintain consistent hand depth relative to the webcam to prevent z-axis jitter.",
    ]

    training_plan = [
        {
            "drillTitle": "Deep Return Defense Drill",
            "targetMetric": "Return Success Rate",
            "targetGoal": "> 80% return rate on 15 consecutive balls",
            "instructions": "Place racket in center court and focus on smooth horizontal tracking.",
            "durationGuidance": "3 minutes",
        }
    ]

    applicable_rules = [
        {
            "ruleId": "ITTF-2.5",
            "title": "Definitions: Rally, Let, and Point",
            "citation": "ITTF Statutes 2026 §2.5",
            "explanation": "Authoritative definition governing rally state transitions in the simulation engine.",
        },
        {
            "ruleId": "ITTF-2.11",
            "title": "A Game (11 Points & Deuce Rule)",
            "citation": "ITTF Statutes 2026 §2.11",
            "explanation": "Game threshold requiring 11 points and 2-point winning margin.",
        },
    ]

    limitations = [
        "Single-camera 2D perspective limits depth estimation accuracy.",
        f"Fallback engine engaged due to validation/inference notice: {'; '.join(val_errors) if val_errors else 'Deterministic baseline requested'}",
    ]

    fallback_analysis = {
        "summary": f"Match {match_id} completed under {rule_profile} profile. The player achieved a {ret_str} return success rate over {metrics.get('total_rallies')} rallies.",
        "observations": observations,
        "evidence": evidence,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "training_plan": training_plan,
        "next_match_objective": "Achieve >= 80% return success rate in opening 5 rallies.",
        "rule_references": applicable_rules,
        "limitations": limitations,
    }

    return {
        "current_stage": "retry_or_fallback",
        "analysis": fallback_analysis,
        "status": "FALLBACK",
        "evidence_status": "FALLBACK",
    }


async def finalise_report_node(state: GraphState) -> Dict[str, Any]:
    """Node 11: Final Report Packaging & Metadata Attachment"""
    analysis = state.get("analysis") or {}
    match_id = state.get("match_id", "unknown")
    selected_model = state.get("selected_model", settings.fast_model)
    status = state.get("status", "SUCCESS")
    evidence_status = state.get("evidence_status", "VERIFIED")
    inference_ms = state.get("inference_time_ms", 0.0)

    report_payload = {
        "match_id": match_id,
        "model_id": selected_model,
        "summary": analysis.get("summary", "Match completed."),
        "observations": analysis.get("observations", []),
        "evidence": analysis.get("evidence", []),
        "weaknesses": analysis.get("weaknesses", []),
        "recommendations": analysis.get("recommendations", []),
        "training_plan": analysis.get("training_plan", []),
        "next_match_objective": analysis.get("next_match_objective", ""),
        "rule_references": analysis.get("rule_references", []),
        "limitations": analysis.get("limitations", []),
        "evidence_status": evidence_status,
        "providerInfo": {
            "provider": "ollama",
            "model": selected_model,
            "inferenceTimeMs": inference_ms,
            "routingReason": state.get("routing_reason", "Deterministic routing"),
        },
    }

    return {
        "current_stage": "finalise_report",
        "final_report": report_payload,
        "status": status,
    }
