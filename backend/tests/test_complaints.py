"""
Integration tests for Complaints CRUD API, filtering, status transitions, and audit logging.
"""

def test_create_complaint(client):
    """Tests official complaint creation and sequential CMP ID generation."""
    payload = {
        "product_name": "Amoxicillin Capsules",
        "batch_lot_number": "BX-2026-TEST1",
        "reported_defect": "Blister seal pinholes and moisture-induced discoloration",
        "complaint_description": "Hospital pharmacy received 5 blister cards with unbonded foil edges.",
        "source": "Email",
        "customer_name": "Dr. Sarah Jenkins",
        "customer_organization": "St. Jude Memorial Hospital",
        "contact_email": "sjenkins@stjude.org",
        "country": "USA",
        "manufacturing_type": "FDF",
        "dosage_form": "Capsule",
        "strength": "500 mg",
        "complaint_category": "Packaging Defect",
        "severity": "Major",
        "criticality": "Major",
        "risk_level": "Medium",
        "risk_priority_number": 12,
        "ai_confidence_score": 0.96,
    }

    response = client.post("/api/complaints", json=payload)
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["success"] is True
    complaint = res_data["data"]
    assert complaint["id"].startswith("CMP-")
    assert complaint["batch_lot_number"] == "BX-2026-TEST1"
    assert complaint["complaint_status"] == "Logged"

def test_get_complaint_by_id(client):
    """Tests retrieving a single complaint by ID."""
    # First create one
    create_payload = {
        "product_name": "Paracetamol Bulk Powder",
        "batch_lot_number": "LOT-PARA-TEST2",
        "reported_defect": "Foreign particulate matter",
        "complaint_description": "Black speck particles detected during IQC.",
        "manufacturing_type": "API",
        "severity": "Major",
    }
    create_res = client.post("/api/complaints", json=create_payload)
    complaint_id = create_res.json()["data"]["id"]

    # Now fetch
    get_res = client.get(f"/api/complaints/{complaint_id}")
    assert get_res.status_code == 200
    assert get_res.json()["data"]["id"] == complaint_id
    assert get_res.json()["data"]["product_name"] == "Paracetamol Bulk Powder"

def test_get_complaint_not_found(client):
    """Verifies that 404 is returned for non-existent complaints."""
    response = client.get("/api/complaints/CMP-1999-99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_list_complaints_with_filtering(client):
    """Tests query filtering and pagination on /api/complaints."""
    # Create two complaints with different products and severities
    client.post("/api/complaints", json={
        "product_name": "FilterProductA",
        "batch_lot_number": "BATCH-A-1",
        "reported_defect": "Defect A",
        "complaint_description": "Description A",
        "severity": "Minor",
    })
    client.post("/api/complaints", json={
        "product_name": "FilterProductB",
        "batch_lot_number": "BATCH-B-2",
        "reported_defect": "Defect B",
        "complaint_description": "Description B",
        "severity": "Critical",
    })

    # Query all
    all_res = client.get("/api/complaints")
    assert all_res.status_code == 200
    assert all_res.json()["data"]["total"] >= 2

    # Query by search
    search_res = client.get("/api/complaints?search=FilterProductA")
    assert search_res.status_code == 200
    items = search_res.json()["data"]["items"]
    assert any(i["product_name"] == "FilterProductA" for i in items)

    # Query by severity
    sev_res = client.get("/api/complaints?severity=Critical")
    assert sev_res.status_code == 200
    assert all(i["severity"] == "Critical" for i in sev_res.json()["data"]["items"])

def test_update_complaint_with_audit_trail(client):
    """Tests updating fields and verifying 21 CFR Part 11 audit log creation."""
    create_res = client.post("/api/complaints", json={
        "product_name": "UpdateTestProduct",
        "batch_lot_number": "BATCH-UPD-1",
        "reported_defect": "Initial defect",
        "complaint_description": "Initial description",
    })
    complaint_id = create_res.json()["data"]["id"]

    # Update with mandatory change_reason
    update_res = client.put(f"/api/complaints/{complaint_id}", json={
        "manufacturing_site": "Plant 3 - Packaging Suite D",
        "change_reason": "Corrected packaging plant location following QA record check."
    })
    assert update_res.status_code == 200
    assert update_res.json()["data"]["manufacturing_site"] == "Plant 3 - Packaging Suite D"

    # Verify audit trail contains the change
    audit_res = client.get(f"/api/complaints/{complaint_id}/audit-trail")
    assert audit_res.status_code == 200
    audit_entries = audit_res.json()["data"]
    assert len(audit_entries) >= 2  # 1 CREATE + 1 UPDATE
    assert any(a["field_name"] == "manufacturing_site" for a in audit_entries)

def test_status_transition_and_deletion(client):
    """Tests valid lifecycle status transition and subsequent soft deletion."""
    create_res = client.post("/api/complaints", json={
        "product_name": "StatusTestProduct",
        "batch_lot_number": "BATCH-STAT-1",
        "reported_defect": "Seal issue",
        "complaint_description": "Detailed description",
    })
    complaint_id = create_res.json()["data"]["id"]

    # Transition to Under Investigation
    trans_res = client.post(f"/api/complaints/{complaint_id}/status", json={
        "new_status": "Under Investigation",
        "change_reason": "Assigned to analytical laboratory for retain testing.",
        "user_id": "QA-INVESTIGATOR-09"
    })
    assert trans_res.status_code == 200
    assert trans_res.json()["data"]["complaint_status"] == "Under Investigation"

    # Soft delete with reason
    del_res = client.request(
        "DELETE",
        f"/api/complaints/{complaint_id}",
        json={"reason": "Duplicate entry logged by mistake; voided per SOP-QA-012."}
    )
    assert del_res.status_code == 200
    assert del_res.json()["data"]["deleted"] is True

    # Confirm not found after soft delete
    get_after_del = client.get(f"/api/complaints/{complaint_id}")
    assert get_after_del.status_code == 404

def test_dashboard_metrics(client):
    """Tests /api/complaints/metrics endpoint returns valid KPI data."""
    response = client.get("/api/complaints/metrics")
    assert response.status_code == 200
    data = response.json()["data"]
    assert "total_active_complaints" in data
    assert "critical_risk_alerts" in data
    assert "average_cycle_time_days" in data
    assert "pending_capa_actions" in data
