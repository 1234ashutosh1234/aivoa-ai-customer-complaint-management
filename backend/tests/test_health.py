"""
Unit tests for Health and Diagnostic Endpoints
"""

def test_health_endpoint(client):
    """Verifies that /api/health returns 200 OK with proper system diagnostics."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "version" in data
    assert "database" in data
    assert "ai_engine" in data
    assert data["ai_engine"]["primary_model"] in ["openai/gpt-oss-120b", "gemma2-9b-it"]

def test_root_endpoint(client):
    """Verifies that the root endpoint returns service metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "documentation" in data
