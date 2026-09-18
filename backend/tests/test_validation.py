"""
Validation & Constraint Tests
Verifies Pydantic schema validation, mandatory audit reasons, and lifecycle state rules.
"""

def test_missing_mandatory_fields_on_create(client):
    """Verifies that 422 is returned if statutory fields are omitted."""
    # Omit product_name and batch_lot_number
    incomplete_payload = {
        "reported_defect": "Packaging torn",
        "complaint_description": "Some description",
    }
    response = client.post("/api/complaints", json=incomplete_payload)
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert "validation failed" in data["message"].lower()

def test_missing_change_reason_on_update(client):
    """Verifies that updating a complaint without change_reason is rejected (21 CFR Part 11)."""
    # Create valid complaint
    create_res = client.post("/api/complaints", json={
        "product_name": "ValidationProduct",
        "batch_lot_number": "VAL-BATCH-01",
        "reported_defect": "Valid defect",
        "complaint_description": "Valid description",
    })
    complaint_id = create_res.json()["data"]["id"]

    # Attempt update without change_reason
    update_res = client.put(f"/api/complaints/{complaint_id}", json={
        "product_name": "NewProductName"
        # change_reason omitted
    })
    assert update_res.status_code == 422

def test_invalid_lifecycle_transition(client):
    """Verifies that invalid lifecycle state jumps are rejected by validation service."""
    # Create complaint (starts in 'Logged' status)
    create_res = client.post("/api/complaints", json={
        "product_name": "LifecycleProduct",
        "batch_lot_number": "VAL-BATCH-02",
        "reported_defect": "Valid defect",
        "complaint_description": "Valid description",
    })
    complaint_id = create_res.json()["data"]["id"]

    # Attempt illegal transition directly from 'Logged' to 'Reopened' (can only reopen if Closed)
    trans_res = client.post(f"/api/complaints/{complaint_id}/status", json={
        "new_status": "Reopened",
        "change_reason": "Trying illegal transition",
    })
    assert trans_res.status_code == 400
    assert "invalid lifecycle transition" in trans_res.json()["detail"].lower()

def test_rpn_range_validation(client):
    """Verifies that RPN score must be within range 1 to 125."""
    invalid_rpn_payload = {
        "product_name": "RPNTestProduct",
        "batch_lot_number": "RPN-01",
        "reported_defect": "Defect",
        "complaint_description": "Description",
        "risk_priority_number": 200,  # Max allowed is 125 (5*5*5)
    }
    response = client.post("/api/complaints", json=invalid_rpn_payload)
    assert response.status_code == 422
