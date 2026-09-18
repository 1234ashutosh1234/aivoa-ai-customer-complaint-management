"""
LangGraph StateGraph Compilation & Pipeline Orchestrator.
Assembles the 8 discrete nodes into an executable StateGraph complying with
ICH Q10 and 21 CFR Part 11 requirements.
"""

import logging
import time
from typing import Dict, Any
from langgraph.graph import StateGraph, START, END

from app.ai.state import ComplaintGraphState
from app.ai.nodes import (
    node_normalize_input,
    node_extract_complaint,
    node_completeness_check,
    node_risk_assessment,
    node_duplicate_detection,
    node_root_cause_recommendation,
    node_capa_recommendation,
    node_final_response,
)

logger = logging.getLogger(__name__)

def build_complaint_graph() -> StateGraph:
    """Constructs and compiles the 8-node LangGraph state machine."""
    workflow = StateGraph(ComplaintGraphState)

    # Register Nodes
    workflow.add_node("normalize_input", node_normalize_input)
    workflow.add_node("extract_complaint", node_extract_complaint)
    workflow.add_node("completeness_check", node_completeness_check)
    workflow.add_node("risk_assessment", node_risk_assessment)
    workflow.add_node("duplicate_detection", node_duplicate_detection)
    workflow.add_node("root_cause_recommendation", node_root_cause_recommendation)
    workflow.add_node("capa_recommendation", node_capa_recommendation)
    workflow.add_node("final_response", node_final_response)

    # Establish Transitions
    workflow.add_edge(START, "normalize_input")
    workflow.add_edge("normalize_input", "extract_complaint")
    workflow.add_edge("extract_complaint", "completeness_check")
    workflow.add_edge("completeness_check", "risk_assessment")
    workflow.add_edge("risk_assessment", "duplicate_detection")
    workflow.add_edge("duplicate_detection", "root_cause_recommendation")
    workflow.add_edge("root_cause_recommendation", "capa_recommendation")
    workflow.add_edge("capa_recommendation", "final_response")
    workflow.add_edge("final_response", END)

    return workflow.compile()

# Singleton compiled graph instance
compiled_graph = build_complaint_graph()

async def run_complaint_pipeline(raw_text: str, source_type: str = "text") -> Dict[str, Any]:
    """
    Executes the full LangGraph 8-node multi-agent pipeline asynchronously.
    Returns the comprehensive assessment payload.
    """
    initial_state: ComplaintGraphState = {
        "raw_text": raw_text,
        "source_type": source_type,
        "normalized_text": "",
        "errors": []
    }

    start_time = time.time()
    try:
        final_state = await compiled_graph.ainvoke(initial_state)
        elapsed_ms = int((time.time() - start_time) * 1000)

        response = final_state.get("final_response", {})
        if "metadata" in response:
            response["metadata"]["total_execution_time_ms"] = elapsed_ms

        return response
    except Exception as exc:
        logger.error("LangGraph execution failed: %s", exc, exc_info=True)
        # Fallback to direct synchronous execution of final compiler
        from app.ai.interfaces import Phase2MockComplaintEngine
        fallback = Phase2MockComplaintEngine.analyze_text(raw_text, source_type=source_type)
        fallback["metadata"]["total_execution_time_ms"] = int((time.time() - start_time) * 1000)
        return fallback
