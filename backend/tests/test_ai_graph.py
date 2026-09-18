"""
Tests for LangGraph Multi-Agent AI Pipeline & FastAPI AI Endpoints.
Verifies all 8 nodes, ICH Q9 risk classification, 6M Ishikawa causality, and CAPA generation.
"""

import asyncio
from app.ai.graph import run_complaint_pipeline, compiled_graph

def test_langgraph_pipeline_execution():
    """Verifies that the compiled LangGraph executes all 8 nodes sequentially and returns valid schema."""
    sample_text = (
        "URGENT: St. Jude Medical Center reported particulate matter floating inside 4 sealed vials "
        "of Ceftriaxone Sodium for Injection 1g (Batch: CX-2024-088). Chief Pharmacist Dr. Thorne noticed "
        "dark visible flakes before administration to pediatric ICU patients. Lot was quarantined."
    )

    result = asyncio.run(run_complaint_pipeline(sample_text, source_type="text"))

    assert result is not None
    assert "extracted_fields" in result
    assert "risk_assessment" in result
    assert "completeness" in result
    assert "root_cause_analysis" in result
    assert "capa_recommendations" in result
    assert "recommendations" in result
    assert "metadata" in result

    # Check extracted fields
    ext = result["extracted_fields"]
    assert "Ceftriaxone" in ext["product_name"]
    assert "CX-2024-088" in ext["batch_number"]
    assert ext["criticality"] == "CRITICAL"
    assert ext["severity"] == "CRITICAL"

    # Check 6M Ishikawa Root Cause
    rc = result["root_cause_analysis"]
    assert "primary_category" in rc
    assert len(rc.get("probable_root_causes", [])) > 0
    assert len(rc.get("five_whys_framework", [])) >= 1

    # Check CAPA
    capa = result["capa_recommendations"]
    assert len(capa.get("immediate_containment", [])) > 0
    assert len(capa.get("corrective_actions", [])) > 0
    assert len(capa.get("preventive_actions", [])) > 0

    # Check Metadata
    meta = result["metadata"]
    assert meta["nodes_executed"] == 8
    assert meta["primary_model"] in ["openai/gpt-oss-120b", "gemma2-9b-it"]
    assert meta["assignment_requested_model"] == "gemma2-9b-it"

def test_langgraph_tablet_scenario():
    """Verifies Oral Solid Dosage scenario with major defect classification."""
    sample_text = (
        "CVS Pharmacy reported that Metformin HCl Extended-Release Tablets 500mg "
        "(Batch: MET-2024-102) has crumbled and fractured tablets inside sealed blister packs."
    )

    result = asyncio.run(run_complaint_pipeline(sample_text, source_type="text"))
    ext = result["extracted_fields"]

    assert "Metformin" in ext["product_name"]
    assert "MET-2024-102" in ext["batch_number"]
    assert ext["criticality"] == "MAJOR"
    assert result["completeness"]["completeness_score"] >= 0.8

def test_api_ai_analyze_text_endpoint(client):
    """Verifies FastAPI /api/ai/analyze-text endpoint returns APIResponse envelope."""
    payload = {
        "raw_text": (
            "Regional Hub reported temperature excursion of Insulin Glargine 100 Units/mL "
            "(Batch: INS-GL-993) at 29°C for 36 hours during transport."
        ),
        "source_type": "text"
    }
    response = client.post("/api/ai/analyze-text", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert data["data"]["extracted_fields"]["batch_number"] == "INS-GL-993"
    assert data["data"]["metadata"]["nodes_executed"] == 8

def test_api_ai_analyze_alias_endpoint(client):
    """Verifies FastAPI /api/ai/analyze convenience alias."""
    payload = {
        "text": "Packaging line 4 Amoxicillin Oral Suspension (Batch: AMX-2024-055) has smudged ink.",
        "source_type": "text"
    }
    response = client.post("/api/ai/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "AMX-2024-055" in data["data"]["extracted_fields"]["batch_number"]
