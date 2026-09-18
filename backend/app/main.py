"""
FastAPI Main Application Entrypoint
AI-Powered Customer Complaint Management System for Pharmaceutical Manufacturing
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.database import init_db
from app.api import health, complaints, uploads, ai

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("pharmaguard.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager to handle startup and shutdown events."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}...")
    init_db()
    logger.info("Database initialized successfully.")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}...")

app = FastAPI(
    title=settings.APP_NAME,
    description="Quality Intelligence platform for pharmaceutical complaint intake, triage, risk assessment, and CAPA.",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Standardized validation error handler."""
    errors = []
    for err in exc.errors():
        loc = " -> ".join([str(x) for x in err.get("loc", []) if x != "body"])
        msg = err.get("msg", "Invalid value")
        errors.append(f"{loc}: {msg}" if loc else msg)

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "data": None,
            "message": "Input validation failed: " + "; ".join(errors),
            "errors": exc.errors(),
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Catches unexpected unhandled exceptions."""
    logger.error(f"Unhandled exception during {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "data": None,
            "message": "An unexpected internal server error occurred. Please contact the Quality Systems Administrator.",
            "error_detail": str(exc) if settings.DEBUG else None,
        }
    )

# Register API Routers
app.include_router(health.router, prefix="/api")
app.include_router(complaints.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(ai.router, prefix="/api")

@app.get("/", tags=["Root"])
def root_redirect():
    """Root landing endpoint displaying service metadata."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "documentation": "/docs",
        "openapi_spec": "/openapi.json"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.DEBUG,
    )
