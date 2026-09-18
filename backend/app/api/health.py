"""
Health & Diagnostic Endpoints
Checks server liveness, database connectivity, and configured AI model status.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db, ACTIVE_DATABASE_URL
from app.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", summary="System health probe and diagnostic status")
def get_health(db: Session = Depends(get_db)):
    """Verifies backend service health, database responsiveness, and configuration."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    dialect = ACTIVE_DATABASE_URL.split(":")[0] if ":" in ACTIVE_DATABASE_URL else "unknown"

    return {
        "success": True if db_status == "connected" else False,
        "status": "healthy" if db_status == "connected" else "degraded",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database": {
            "status": db_status,
            "dialect": dialect,
            "url_type": "postgresql" if "postgresql" in dialect else "sqlite_fallback"
        },
        "ai_engine": {
            "provider": "Groq",
            "primary_model": settings.GROQ_MODEL,
            "contextual_model": settings.CONTEXTUAL_MODEL,
            "status": "configured" if settings.GROQ_API_KEY else "unconfigured_key",
        }
    }
