# PharmaGuard AI — Backend Service
### AI-Powered Customer Complaint Management System for Pharmaceutical Manufacturing

---

## 1. Overview

The backend service is built with **Python 3.11+**, **FastAPI**, **SQLAlchemy 2.0**, and **Pydantic v2**. It serves as the regulatory core of the Quality Management System (QMS), providing:
- Structured complaint intake and life-cycle state machines.
- 21 CFR Part 11 and EU GMP Annex 11 compliant immutable audit logging.
- Multi-channel document ingestion with cryptographic SHA-256 integrity checks and text extraction (`pypdf`).
- **LangGraph 8-Node Multi-Agent Pipeline** powered by **Groq LPU Inference**.
  - *Runtime Model:* `openai/gpt-oss-120b` (live remote inference)
  - *Assignment Requested Model:* `gemma2-9b-it` (preserved in configuration; decommissioned by Groq)
- Resilient multi-database architecture (PostgreSQL primary with automatic SQLite fallback for local developer testing).

---

## 2. Directory Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entrypoint, lifespan, CORS, and routers
│   ├── config.py               # Environment configuration with Pydantic BaseSettings
│   ├── database.py             # SQLAlchemy 2.0 engine with PostgreSQL/SQLite fallback
│   ├── models.py               # ORM models (Complaint, AuditEvent, Attachment, Investigation, CAPA)
│   ├── schemas.py              # Pydantic v2 schemas and standard APIResponse[T] envelopes
│   ├── dependencies.py         # Request session dependencies and user authentication context
│   │
│   ├── api/
│   │   ├── health.py           # GET /api/health probe and system diagnostics
│   │   ├── complaints.py       # CRUD endpoints, filtering, metrics, and lifecycle transitions
│   │   ├── uploads.py          # POST /api/uploads/document file ingestion & parsing
│   │   └── ai.py               # AI analysis endpoints (mocked in Phase 2, LangGraph in Phase 4)
│   │
│   ├── services/
│   │   ├── complaint_service.py# Business logic, sequential CMP-ID generation, audit logs
│   │   ├── file_service.py     # Safe file storage, checksums, and PDF text extraction
│   │   └── validation_service.py# Lifecycle transition rules and statutory field validation
│   │
│   └── ai/
│       └── interfaces.py       # Abstract protocols and Phase 2 mock engine
│
├── tests/
│   ├── conftest.py             # Isolated SQLite in-memory fixtures and TestClient
│   ├── test_health.py          # Liveness and diagnostic tests
│   ├── test_complaints.py      # CRUD, filtering, pagination, and audit trail tests
│   ├── test_validation.py      # Pydantic bounds and lifecycle rule tests
│   └── test_uploads.py         # Document upload and text extraction tests
│
├── scripts/
│   └── seed_db.py              # Populates 5 realistic pharma complaint scenarios
│
├── requirements.txt            # Python dependencies
├── README.md                   # This guide
└── .env.example                # Environment variables template
```

---

## 3. Windows Setup & Execution Instructions

### 3.1 Prerequisites
- **Python 3.11+** (Python 3.14 recommended)
- **PowerShell** or **Command Prompt (CMD)**
- Optional: **PostgreSQL 14+** (if not installed, the backend will automatically use SQLite `pharma_complaints.db`)

### 3.2 Environment Setup (PowerShell)

1. Open PowerShell and navigate to the `backend/` directory:
   ```powershell
   cd "e:\AI-Powered Customer Complaint Management System for Pharmaceutical Manufacturing\backend"
   ```

2. (Optional) Create and activate a Python virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
   *Note: If you encounter an execution policy error, run:*
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\venv\Scripts\Activate.ps1
   ```

3. Install required dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

---

## 4. Seeding Realistic Pharmaceutical Complaints

Run the database seed script to populate 5 authentic clinical and technical quality defect cases:
```powershell
python scripts/seed_db.py
```
This populates:
1. **Tablet physical defect:** Ciprofloxacin 500mg (capping and friability chipping).
2. **Packaging issue:** Amoxicillin 500mg (blister seal micro-pinholes with linked investigation and CAPA).
3. **Missing/incorrect labeling:** Atorvastatin 20mg (missing carton expiration date).
4. **Suspected efficacy issue:** Metoprolol 50mg ER (extended-release dissolution delay).
5. **Adverse event report:** JuniorCillin Pediatric Oral Suspension (miscalibrated dosing syringe with emergency hospitalization).

---

## 5. Running the FastAPI Application

Start the development server with live reload:
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Once running:
- **Interactive Swagger Documentation:** [`http://localhost:8000/docs`](http://localhost:8000/docs)
- **ReDoc Documentation:** [`http://localhost:8000/redoc`](http://localhost:8000/redoc)
- **Health Check Probe:** [`http://localhost:8000/api/health`](http://localhost:8000/api/health)

---

## 6. Running the Automated Test Suite

Execute the full suite of unit and integration tests using `pytest`:
```powershell
python -m pytest tests -v
```

All tests run against an isolated in-memory SQLite database, verifying:
- `/api/health` system diagnostics.
- Complaint creation with sequential `CMP-YYYY-XXXXX` identifier generation.
- Full 360-degree complaint retrieval with linked attachments and investigations.
- Granular field updates with mandatory 21 CFR Part 11 `change_reason` audit logging.
- Multi-field search, status filtering, and pagination.
- Lifecycle state transitions and rejection of illegal state jumps.
- Multi-format document uploads (.txt, .pdf) and cryptographic SHA-256 verification.
- Phase 1 structured schema compliance on AI endpoints.

---

## 7. API Summary Reference

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service diagnostics and database/AI connectivity |
| `GET` | `/api/complaints/metrics` | Dashboard KPI summary (active, critical, cycle days, CAPAs) |
| `POST` | `/api/complaints` | Register a new verified complaint |
| `GET` | `/api/complaints` | Paginated search and filtering across 10+ dimensions |
| `GET` | `/api/complaints/{id}` | Full complaint details with attachments, CAPAs, and audit logs |
| `PUT` | `/api/complaints/{id}` | Update complaint fields (requires `change_reason`) |
| `DELETE` | `/api/complaints/{id}` | Soft-delete / void complaint (requires `reason`) |
| `POST` | `/api/complaints/{id}/status`| Transition lifecycle status (`Logged` -> `Under Investigation`, etc.) |
| `GET` | `/api/complaints/{id}/audit-trail` | Retrieve immutable 21 CFR Part 11 chronological audit records |
| `POST` | `/api/uploads/document` | Upload PDF/TXT/Image file and extract text |
| `POST` | `/api/ai/analyze-text` | Multi-agent extraction, risk scoring, and CAPA synthesis |
| `POST` | `/api/ai/analyze-document`| Upload document and trigger AI analysis |
| `POST` | `/api/ai/risk-assessment`| Standalone ICH Q9 Risk Priority Number calculation |
