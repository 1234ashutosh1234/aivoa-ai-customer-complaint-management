"""
State Definition for LangGraph Pharmaceutical Complaint State Machine.
Defines typed dictionary structure passed between the 8 multi-agent nodes.
"""

from typing import TypedDict, Optional, List, Dict, Any

class ComplaintGraphState(TypedDict, total=False):
    # Ingestion & Normalization
    raw_text: str
    source_type: str  # 'text' | 'email' | 'document' | 'call_log'
    normalized_text: str
    language: str

    # Node 2: Extracted QMS Entities
    extracted_complaint: Dict[str, Any]

    # Node 3: Regulatory Completeness Evaluation
    completeness: Dict[str, Any]

    # Node 4: ICH Q9 Quality Risk Assessment
    risk_assessment: Dict[str, Any]

    # Node 5: Duplicate & Cluster Batch Detection
    duplicate_detection: Dict[str, Any]

    # Node 6: 6M Ishikawa & 5-Whys Hypotheses
    root_cause_analysis: Dict[str, Any]

    # Node 7: Corrective & Preventive Actions (CAPA)
    capa_recommendation: Dict[str, Any]

    # Node 8: Final Compiled Assessment & Metadata
    final_response: Dict[str, Any]
    metadata: Dict[str, Any]
    errors: List[str]

    # Telemetry tracking
    ai_provider_used: str  # "groq" | "fallback"
    model_used: str
    execution_mode: str  # "live" | "fallback"
