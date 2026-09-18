"""
Application Configuration Module
Loads settings from environment variables and .env file with robust defaults.
"""

from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[str(BASE_DIR / ".env"), ".env"],
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    # Application Info
    APP_NAME: str = "PharmaGuard AI - Customer Complaint Management System"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    APP_HOST: str = "127.0.0.1"
    APP_PORT: int = 8000

    # Database Configuration (PostgreSQL preferred, with automatic SQLite fallback)
    # Format: postgresql+psycopg2://USER:PASSWORD@HOST:PORT/DATABASE
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/pharma_complaints_db"
    SQLITE_FALLBACK_URL: str = "sqlite:///./pharma_complaints.db"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30

    # Frontend URL & CORS Configuration
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    SECRET_KEY: str = "pharmaguard-prototype-secret-key-development-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # AI Configuration (Groq)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    ASSIGNMENT_REQUESTED_MODEL: str = "gemma2-9b-it"
    CONTEXTUAL_MODEL: str = "openai/gpt-oss-120b"
    LLM_TEMPERATURE: float = 0.1
    LLM_TIMEOUT_SECONDS: int = 30

    # Compliance & Quality System Flags
    STRICT_AUDIT_MODE: bool = True
    MAX_INVESTIGATION_CYCLE_DAYS: int = 30
    REGULATORY_REPORTING_ALERT_DAYS: int = 15

    # File Upload Directory
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploaded_documents")

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        defaults = [
            "http://localhost:5173", 
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ]
        origins = []
        if isinstance(v, str) and not v.startswith("["):
            origins = [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            origins = [str(i).strip() for i in v if str(i).strip()]
        
        # Merge defaults and origins preserving uniqueness
        for d in defaults:
            if d not in origins:
                origins.append(d)
        return origins

settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
