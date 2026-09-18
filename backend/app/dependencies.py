"""
FastAPI Request Dependencies Module
Provides database sessions, user identity extraction, and request contextual dependencies.
"""

from typing import Generator, Optional
from fastapi import Depends, Header
from sqlalchemy.orm import Session
from app.database import get_db

def get_current_user(
    x_user_id: Optional[str] = Header(default="QA-OPERATOR-01", description="Header specifying user performing the action for 21 CFR Part 11 audit logging")
) -> str:
    """Extracts operator identifier for audit trail logging."""
    return x_user_id or "QA-OPERATOR-01"
