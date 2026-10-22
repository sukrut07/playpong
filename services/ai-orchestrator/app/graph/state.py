"""
Typed state definition for the PONG AI LangGraph StateGraph.
Only contains serializable, strictly typed context.
"""

from typing import TypedDict, Optional, Dict, Any, List


class GraphState(TypedDict, total=False):
    # Execution Tracking
    run_id: str
    match_id: str
    request_type: str  # "MATCH_COACHING" | "ANALYTICS_QUERY" | "RULE_EXPLANATION" | "CONTROLLER_EVALUATION"
    question: Optional[str]
    model_override: Optional[str]

    # Authoritative Evidence Inputs
    raw_stats: Optional[Dict[str, Any]]
    validated_metrics: Optional[Dict[str, Any]]
    benchmark_summary: Optional[Dict[str, Any]]
    rule_evidence: Optional[List[Dict[str, Any]]]
    history_comparison: Optional[Dict[str, Any]]

    # Model Routing & Selection
    selected_model: str
    routing_reason: str

    # Intermediate Generation & Evidence Verification
    analysis_raw: Optional[str]
    analysis: Optional[Dict[str, Any]]
    validation_errors: List[str]
    evidence_status: str  # "VERIFIED" | "DEGRADED" | "FALLBACK"
    retry_count: int

    # Final Payload
    final_report: Optional[Dict[str, Any]]
    status: str  # "PENDING" | "SUCCESS" | "FAILED" | "FALLBACK"
    current_stage: str
    error: Optional[str]
    inference_time_ms: float
