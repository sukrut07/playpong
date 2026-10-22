"""
LangGraph Workflow Engine for PONG AI.
Assembles the complete state graph with explicit nodes, conditional edges, retry limits, and local checkpointer.
"""

from typing import Dict, Any, Literal
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from .state import GraphState
from .nodes import (
    validate_request_node,
    load_match_evidence_node,
    compute_metrics_node,
    route_request_node,
    retrieve_rules_node,
    run_analytics_tool_node,
    select_model_node,
    generate_analysis_node,
    validate_analysis_node,
    retry_or_fallback_node,
    finalise_report_node,
)


def route_after_validation(state: GraphState) -> Literal["load_match_evidence", "finalise_report"]:
    if state.get("status") == "FAILED":
        return "finalise_report"
    return "load_match_evidence"


def route_after_evidence(state: GraphState) -> Literal["compute_metrics", "finalise_report"]:
    if state.get("status") == "FAILED":
        return "finalise_report"
    return "compute_metrics"


def route_after_metrics(state: GraphState) -> Literal["route_request", "finalise_report"]:
    if state.get("status") == "FAILED":
        return "finalise_report"
    return "route_request"


def route_after_retry_or_fallback(state: GraphState) -> Literal["generate_analysis", "finalise_report"]:
    if state.get("status") == "RETRYING":
        return "generate_analysis"
    return "finalise_report"


def build_pong_ai_graph():
    """
    Constructs the compiled LangGraph StateGraph with bounded execution and memory checkpointer.
    """
    builder = StateGraph(GraphState)

    # Register Nodes
    builder.add_node("validate_request", validate_request_node)
    builder.add_node("load_match_evidence", load_match_evidence_node)
    builder.add_node("compute_metrics", compute_metrics_node)
    builder.add_node("route_request", route_request_node)
    builder.add_node("retrieve_rules_if_needed", retrieve_rules_node)
    builder.add_node("run_approved_analytics_tool", run_analytics_tool_node)
    builder.add_node("select_model", select_model_node)
    builder.add_node("generate_analysis", generate_analysis_node)
    builder.add_node("validate_analysis", validate_analysis_node)
    builder.add_node("retry_or_fallback", retry_or_fallback_node)
    builder.add_node("finalise_report", finalise_report_node)

    # Edge Definitions
    builder.add_edge(START, "validate_request")

    builder.add_conditional_edges(
        "validate_request",
        route_after_validation,
        {
            "load_match_evidence": "load_match_evidence",
            "finalise_report": "finalise_report",
        },
    )

    builder.add_conditional_edges(
        "load_match_evidence",
        route_after_evidence,
        {
            "compute_metrics": "compute_metrics",
            "finalise_report": "finalise_report",
        },
    )

    builder.add_conditional_edges(
        "compute_metrics",
        route_after_metrics,
        {
            "route_request": "route_request",
            "finalise_report": "finalise_report",
        },
    )

    builder.add_edge("route_request", "retrieve_rules_if_needed")
    builder.add_edge("retrieve_rules_if_needed", "run_approved_analytics_tool")
    builder.add_edge("run_approved_analytics_tool", "select_model")
    builder.add_edge("select_model", "generate_analysis")
    builder.add_edge("generate_analysis", "validate_analysis")
    builder.add_edge("validate_analysis", "retry_or_fallback")

    builder.add_conditional_edges(
        "retry_or_fallback",
        route_after_retry_or_fallback,
        {
            "generate_analysis": "generate_analysis",
            "finalise_report": "finalise_report",
        },
    )

    builder.add_edge("finalise_report", END)

    # Memory checkpointer for run persistence & inspection
    checkpointer = MemorySaver()
    return builder.compile(checkpointer=checkpointer)


# Singleton graph instance
pong_ai_workflow = build_pong_ai_graph()
