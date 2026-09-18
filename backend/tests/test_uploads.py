"""
Unit tests for Document Uploads and AI Integration Endpoints
"""

from io import BytesIO

def test_upload_text_document(client):
    """Tests uploading a .txt complaint file and verifying text extraction."""
    file_content = b"Customer reported broken tablets in Lot TXT-100."
    files = {"file": ("complaint_note.txt", BytesIO(file_content), "text/plain")}

    response = client.post("/api/uploads/document", files=files, data={"source_type": "text"})
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["success"] is True
    data = res_data["data"]
    assert data["file_name"] == "complaint_note.txt"
    assert data["is_parsed"] is True
    assert "Customer reported broken tablets" in data["extracted_text"]
    assert len(data["file_hash_sha256"]) == 64  # Valid SHA-256

def test_upload_unsupported_file_extension(client):
    """Verifies graceful handling of unsupported file types."""
    files = {"file": ("malicious.exe", BytesIO(b"binarycontent"), "application/octet-stream")}
    response = client.post("/api/uploads/document", files=files)
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["is_parsed"] is False
    assert "unsupported file extension" in data["message"].lower()

def test_ai_analyze_text_endpoint(client):
    """Tests /api/ai/analyze-text endpoint returns Phase 1 structured schema."""
    payload = {
        "raw_text": "Subject: Amoxicillin blister seal broken\nLot BX-2026-091 capsules discolored.",
        "source_type": "email"
    }
    response = client.post("/api/ai/analyze-text", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    ai_data = res_data["data"]
    assert "complaint" in ai_data
    assert "completeness" in ai_data
    assert "risk_assessment" in ai_data
    assert "duplicate_detection" in ai_data
    assert "recommendations" in ai_data
    assert "metadata" in ai_data
