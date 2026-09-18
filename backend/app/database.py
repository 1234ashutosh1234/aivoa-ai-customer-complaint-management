"""
Database Infrastructure Module
SQLAlchemy 2.0 engine configuration with resilient PostgreSQL-to-SQLite fallback.
"""

import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

logger = logging.getLogger("pharmaguard.database")

Base = declarative_base()

def build_engine():
    """
    Creates SQLAlchemy engine with automatic fallback.
    Tries PostgreSQL first; if connection cannot be established,
    falls back to SQLite to ensure zero blockers for local development/testing.
    """
    primary_url = settings.DATABASE_URL
    is_sqlite = primary_url.startswith("sqlite")

    if is_sqlite:
        logger.info(f"Using SQLite database: {primary_url}")
        return create_engine(
            primary_url,
            connect_args={"check_same_thread": False},
        ), primary_url

    # Attempt PostgreSQL
    try:
        logger.info(f"Attempting connection to primary database: {primary_url}")
        engine = create_engine(
            primary_url,
            pool_size=settings.DB_POOL_SIZE,
            max_overflow=settings.DB_MAX_OVERFLOW,
            pool_timeout=settings.DB_POOL_TIMEOUT,
            pool_pre_ping=True,
        )
        # Test connection immediately
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Successfully connected to primary PostgreSQL database.")
        return engine, primary_url
    except Exception as e:
        logger.warning(
            f"Could not connect to primary database ({e}). "
            f"Engaging resilient fallback to SQLite: {settings.SQLITE_FALLBACK_URL}"
        )
        fallback_engine = create_engine(
            settings.SQLITE_FALLBACK_URL,
            connect_args={"check_same_thread": False},
        )
        return fallback_engine, settings.SQLITE_FALLBACK_URL

engine, ACTIVE_DATABASE_URL = build_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for yielding transactional database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes all database tables registered with Base."""
    # Import models to ensure they are registered on Base
    from app import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    logger.info(f"Database tables initialized on {ACTIVE_DATABASE_URL}")
