"""
End-to-End AIVOA Verification Test
Tests the full lifecycle:
1. AI Pipeline with specific test complaint:
   "Customer MediCare Distributors reported that Paracetamol 500 mg Tablets from batch PCM24017 had several broken tablets and powder inside the blister pockets. The issue was observed in multiple packs received by the distributor. No confirmed patient injury has been reported."
2. Extraction fidelity and 16 top-level keys
3. Complaint registration in QMS with audit trail
4. CAPA logging and linkage
5. Metrics aggregation and status transitions
6. Standalone AI endpoints
7. Edge case and error handling
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db, Base, engine
from app.models import Complaint, AuditEvent

client = TestClient(app)

TEST_COMPLAINT_TEXT = (
    "Customer MediCare Distributors reported that Paracetamol 500 mg Tablets from batch PCM24017 "
    "had several broken tablets and powder inside the blister pockets. "
    "The issue was observed in multiple packs received by the distributor. "
    "No confirmed patient injury has been reported."
)

def test_aivoa_end_to_end_complaint_workflow():
    # 1. AI Analysis via /api/ai/analyze
    ai_response = client.post("/api/ai/analyze", json={"raw_text": TEST_COMPLAINT_TEXT, "source_type": "text"})
    assert ai_response.status_code == 200, f"AI analyze failed: {ai_response.text}"
    ai_envelope = ai_response.json()
    assert ai_envelope["success"] is True
    data = ai_envelope["data"]

    # Verify 16 top-level keys
    required_keys = [
        "product", "batch", "customer", "category", "description",
        "severity", "criticality", "risk_level", "patient_impact",
        "completeness", "missing_information", "risk_factors",
        "duplicate_detection", "root_cause_recommendations",
        "capa_recommendations", "summary"
    ]
    for key in required_keys:
        assert key in data, f"Missing required top-level key: {key}"

    # Verify extraction accuracy for test complaint
    assert "Paracetamol" in data["product"]
    assert "PCM24017" in data["batch"]
    assert "MediCare" in data["customer"]
    assert "Physical" in data["category"] or "Defect" in data["category"]
    assert "No confirmed" in data["patient_impact"] or data["patient_impact"] == "None"
    assert data["criticality"] in ["MAJOR", "CRITICAL", "Major", "Critical"]
    assert data["severity"] in ["MEDIUM", "HIGH", "CRITICAL", "Medium", "High", "Critical", "Major"]

    # 2. Register complaint in QMS repository via POST /api/complaints
    intake_payload = {
        "product_name": data["product"],
        "batch_number": data["batch"],
        "description": data["description"],
        "complaint_type": data["category"],
        "complainant_name": data["customer"],
        "severity": data["severity"],
        "criticality": data["criticality"],
        "dosage_form": "Tablet",
        "manufacturing_type": "Oral Solid Dosage",
        "patient_involvement": False,
        "patient_impact": data["patient_impact"],
    }
    create_res = client.post("/api/complaints", json=intake_payload, headers={"X-User-ID": "QA-INVESTIGATOR-01"})
    assert create_res.status_code == 201, f"Complaint creation failed: {create_res.text}"
    complaint_data = create_res.json()["data"]
    complaint_id = complaint_data["id"]
    assert complaint_id.startswith("CMP-")
    assert complaint_data["batch_lot_number"] == "PCM24017"
    assert complaint_data["batch_number"] == "PCM24017"
    assert complaint_data["complaint_id"] == complaint_id

    # 3. Retrieve complaint by ID via GET /api/complaints/{id}
    get_res = client.get(f"/api/complaints/{complaint_id}")
    assert get_res.status_code == 200
    retrieved = get_res.json()["data"]
    assert retrieved["id"] == complaint_id
    assert len(retrieved["audit_logs"]) >= 1
    assert len(retrieved["audit_events"]) >= 1

    # 4. Attach CAPA via POST /api/complaints/{id}/capa
    capa_payload = {
        "capa_type": "Corrective Action",
        "description": "Inspect blister sealing platen pressure calibration and tooling alignment.",
        "owner": "Packaging Engineering Team",
        "target_completion_date": "2026-10-15T00:00:00Z"
    }
    capa_res = client.post(f"/api/complaints/{complaint_id}/capa", json=capa_payload)
    assert capa_res.status_code == 201
    capa_data = capa_res.json()["data"]
    assert capa_data["capa_number"].startswith("CAPA-")

    # 5. Transition Status with 21 CFR Part 11 electronic rationale
    status_res = client.post(
        f"/api/complaints/{complaint_id}/status",
        json={
            "new_status": "Under Investigation",
            "change_reason": "Commencing QA retain sample visual inspection and blister integrity test.",
            "user_id": "QA-AUDITOR-99"
        }
    )
    assert status_res.status_code == 200
    assert status_res.json()["data"]["complaint_status"] == "Under Investigation"

    # 6. Verify Dashboard Metrics via GET /api/complaints/metrics
    metrics_res = client.get("/api/complaints/metrics")
    assert metrics_res.status_code == 200
    metrics = metrics_res.json()["data"]
    assert metrics["total_complaints"] >= 1
    assert "by_criticality" in metrics
    assert "by_status" in metrics

def test_standalone_ai_endpoints():
    # 1. Risk Assessment
    risk_res = client.post("/api/ai/risk-assessment", json={"reported_defect": "Broken tablets in blister packs"})
    assert risk_res.status_code == 200
    assert risk_res.json()["data"]["criticality"] in ["MAJOR", "CRITICAL"]

    # 2. Completeness Check
    comp_res = client.post(
        "/api/ai/completeness",
        json={"product_name": "Paracetamol 500 mg Tablets", "batch_lot_number": "PCM24017", "reported_defect": "Broken tablets"}
    )
    assert comp_res.status_code == 200
    assert comp_res.json()["data"]["is_ready_for_logging"] is True

    # 3. Duplicate Check
    dup_res = client.post("/api/ai/duplicate-check", json={"batch_lot_number": "PCM24017"})
    assert dup_res.status_code == 200
    assert "is_duplicate" in dup_res.json()["data"]

    # 4. Root Cause
    rc_res = client.post("/api/ai/root-cause", json={"reported_defect": "Broken tablets in blister"})
    assert rc_res.status_code == 200
    assert "probable_root_causes" in rc_res.json()["data"]

    # 5. CAPA
    capa_res = client.post("/api/ai/capa", json={"reported_defect": "Broken tablets in blister"})
    assert capa_res.status_code == 200
    assert "corrective_actions" in capa_res.json()["data"]

def test_error_handling():
    # Empty text returns 400
    empty_res = client.post("/api/ai/analyze", json={"raw_text": "   "})
    assert empty_res.status_code == 400

    # Nonexistent complaint returns 404
    not_found_res = client.get("/api/complaints/CMP-9999-99999")
    assert not_found_res.status_code == 404
