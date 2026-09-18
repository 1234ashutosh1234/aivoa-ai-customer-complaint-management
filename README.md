# AIVOA AI-Powered Customer Complaint Management System

An enterprise-grade, AI-assisted Quality Management System (QMS) engineered for regulated pharmaceutical manufacturing, adhering to **US FDA 21 CFR Part 211.198**, **21 CFR Part 11**, **ICH Q10**, and **EU GMP Chapter 8**.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Redux Toolkit](https://img.shields.io/badge/State-Redux_Toolkit-764ABC.svg?style=flat&logo=redux)](https://redux-toolkit.js.org)
[![LangGraph](https://img.shields.io/badge/AI_Agent-LangGraph_1.2-FF6F00.svg?style=flat)](https://langchain-ai.github.io/langgraph/)
[![Groq](https://img.shields.io/badge/LLM_Inference-Groq_openai%2Fgpt--oss--120b-F55036.svg?style=flat)](https://groq.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_/_SQLite-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org)
[![Tests](https://img.shields.io/badge/Tests-23_Passed_/_0_Failed-emerald.svg?style=flat)](./backend/tests)
[![Build](https://img.shields.io/badge/Frontend_Build-Passed_0_Errors-emerald.svg?style=flat)](./frontend)

---

## 1. Project Overview

In the pharmaceutical industry, customer complaints are not conventional support inquiries—they represent potential statutory product quality deviations. A contaminated sterile injectable vial, a cracked oral solid dosage form, or an out-of-specification biologic cold-chain excursion requires immediate physical containment, preliminary risk assessment, root cause analysis, health authority escalation, and bound Corrective and Preventive Actions (CAPA).

Traditional pharmaceutical complaint management relies heavily on manual transcription of complaints received via customer service calls, distributor emails, and paper intake forms. **PharmaGuard QMS** introduces an AI-powered triage and assessment pipeline that transforms unstructured narratives into structured, regulatory-compliant quality intelligence, accelerating complaint triage while preserving human oversight and complete audit traceability.

---

## 2. Problem Statement

Manual complaint processing in life sciences organizations faces several systemic bottlenecks:
- **Unstructured Ingestion:** Quality teams receive complaints across disparate channels: unformatted emails, doctor voice notes, distributor memos, and multi-page PDF certificates of analysis.
- **Time-Intensive Entity Extraction:** Quality Assurance (QA) personnel must manually locate and cross-reference critical metadata—product trade names, active pharmaceutical ingredients (API), manufacturing batch numbers, expiration dates, and defect descriptions.
- **Inconsistent Risk Classification:** Subjective assessment of complaint severity can lead to delayed identification of Class I / Class II defects, endangering patient safety and risking regulatory non-compliance with FDA 24-to-72-hour Field Alert Report (FAR) mandates.
- **High Administrative Burden:** Transcribing details into complex QMS forms consumes valuable engineering time that should be spent on physical lab assays and preventive maintenance.

---

## 3. Solution

PharmaGuard QMS streamlines the complaint handling lifecycle by pairing a high-throughput **Python FastAPI** backend and an **8-node LangGraph multi-agent state machine** with an intuitive **React 18 and Redux Toolkit** frontend:
- **Multi-Modal Ingestion:** Ingests raw narrative text, parsed customer email headers, and uploaded PDF documents.
- **Automated Entity Extraction:** Extracts pharmaceutical trade names, batch identifiers, complainant details, and defect categories into strictly-typed Pydantic schemas.
- **Regulatory Completeness Evaluation:** Automatically evaluates complaint completeness against FDA 21 CFR 211.198 criteria and formulates follow-up clarification questions for the complainant.
- **Preliminary ICH Q9 Risk Assessment:** Calculates defect severity, clinical criticality (Class I, II, III), and Risk Priority Numbers (RPN).
- **Duplicate & Recurrence Detection:** Queries database records to identify recurring defects across identical batch lots or products.
- **Root Cause & CAPA Synthesis:** Synthesizes plausible 6M Ishikawa hypotheses (Machine, Material, Method, etc.) and drafts SMART CAPA remediation plans.
- **Human-in-the-Loop Form Review:** Automatically populates intake forms with visual field provenance tags (`EXTRACTED`, `AI COPILOT`, `EDITED`), ensuring human QA operators verify all data before database commitment.
- **21 CFR Part 11 Electronic Audit Trail:** Records an immutable append-only audit trail with SHA-256 cryptographic hashing for every write or status change.

---

## 4. Key Features

- **AI Complaint Intake:** Unified ingestion via free-form narrative, email header parser, and drag-and-drop document upload.
- **PDF & Document Upload:** Server-side document text extraction with automated SHA-256 integrity digest generation.
- **Structured Complaint Extraction:** Sub-second parsing of batch lots, dosage strengths, and clinical defect categories.
- **Completeness Checker:** Real-time circular SVG gauge scoring regulatory readiness (0–100%) against FDA mandates.
- **AI-Assisted Preliminary Risk Assessment:** Standardized ICH Q9 risk matrix evaluating patient harm probability and severity.
- **Duplicate Detection:** Automatic matching against active batch lots to identify emerging manufacturing cluster signals.
- **Root Cause Recommendation:** Automated Ishikawa (6M) fishbone hypotheses and 5-Whys causal tree construction.
- **CAPA Recommendation:** Structured drafting of immediate quarantine containment, corrective repairs, and preventive SOP updates.
- **AI Copilot Sidebar:** Interactive analytical copilot providing contextual guidance, SLA tracking, and regulatory alerts.
- **Complaint Register:** Searchable, filterable data grid with pagination, status badges, and one-click CSV regulatory export.
- **Dashboard Analytics:** Real-time KPI summary cards, criticality distribution bars, and investigation lifecycle metrics.
- **Human Review & Field Provenance:** Clear visual indicators distinguishing extracted facts, AI suggestions, and human edits.
- **21 CFR Part 11 Audit Trail:** Cryptographically hashed, append-only history of every user action and change justification.

---

## 5. Technology Stack

### Frontend
- **Framework:** React 18
- **State Management:** Redux Toolkit (RTK)
- **Bundler & Tooling:** Vite
- **Typography:** Google Inter
- **Styling:** Tailwind CSS (custom pharmaceutical QMS palette)
- **Icons:** Lucide React

### Backend
- **Language & Runtime:** Python 3.14 / 3.10+
- **API Framework:** FastAPI
- **Data Validation:** Pydantic v2
- **Database ORM:** SQLAlchemy 2.0
- **Database Driver:** `psycopg2-binary` (PostgreSQL) & SQLite driver

### AI & Orchestration
- **Agent Framework:** LangGraph 1.2
- **Inference Engine:** Groq Cloud API
- **Live Runtime Model:** `openai/gpt-oss-120b` (120B parameter open-weights production model)
- **Fallback Engine:** Deterministic regex-based local pharmaceutical NLP engine

### Database Architecture
- **Primary Architecture:** Enterprise PostgreSQL with connection pooling (`pool_size=10`, `max_overflow=20`)
- **Development Engine:** Zero-configuration SQLite (`pharma_complaints.db`)

---

## 6. Architecture

```text
Frontend (React 18 + Redux Toolkit)
       ↓ (HTTP REST / JSON)
FastAPI Backend (Pydantic v2)
       ↓ (StateGraph Execution)
LangGraph (8-Node State Machine)
       ↓ (Cloud LPU Inference)
Groq Cloud (openai/gpt-oss-120b)
       ↓ (RFC 8259 JSON)
Structured AI Output (16 Validated Fields)
       ↓ (Dispatch Thunks)
Redux Global Store
       ↓ (UI State Binding)
Complaint Form / AI Copilot (Human Review)
       ↓ (Commit Transaction & Audit Hash)
Database (PostgreSQL / SQLite)
       ↓ (Metrics Aggregation)
Dashboard / Complaint Register
```

---

## 7. LangGraph Workflow

The multi-agent triage pipeline is implemented as an explicit directed state machine in `backend/app/ai/nodes.py` across 8 sequential nodes:

```
+-------------------------------------------------------------------------------------------------+
|                                 LangGraph 8-Node Architecture                                   |
+-------------------------------------------------------------------------------------------------+
|  1. normalize_input            Normalizes text encoding, strips control characters, and        |
|                                removes patient identifying information (PII).                   |
|  2. extract_complaint          Parses pharmaceutical entities: Product Name, Batch Number,      |
|                                Dosage Form, Complainant Facility, and Defect Narrative.         |
|  3. completeness_check         Evaluates regulatory presence against FDA 21 CFR 211.198 criteria|
|                                and calculates completeness score (0-100%) + follow-up questions.|
|  4. risk_assessment            Applies ICH Q9 Quality Risk Management matrix to assign Severity |
|                                (Low-Critical), Criticality (Class I/II/III), and RPN.           |
|  5. duplicate_detection        Queries database records for matching batch lots, products, or   |
|                                recurring defect descriptions within a 90-day window.            |
|  6. root_cause_recommendation  Maps defect factors across the 6M Ishikawa manufacturing         |
|                                dimensions (Machine, Material, Method, Manpower, etc.).          |
|  7. capa_recommendation        Drafts immediate containment actions, corrective equipment       |
|                                repairs, and preventive SOP maintenance adjustments.             |
|  8. final_response             Validates all 16 required top-level keys against Pydantic        |
|                                StructuredAIAnalysisSchema and attaches provider metadata.       |
+-------------------------------------------------------------------------------------------------+
```

---

## 8. Structured AI Output

Every AI assessment is strictly validated against Pydantic's `StructuredAIAnalysisSchema` to guarantee that all 16 required top-level fields are present and typed:

1. **`product`**: Clean trade name and dosage form (e.g. `Paracetamol 500 mg Tablets`).
2. **`batch`**: Manufacturing lot identifier (e.g. `PCM24017`).
3. **`customer`**: Reporting healthcare provider, pharmacy, or distributor.
4. **`category`**: Defect taxonomy (Physical Defect, Packaging, Labeling, Lack of Efficacy, Contamination, Adverse Reaction).
5. **`description`**: Objective technical summary of the observed defect.
6. **`severity`**: Physical extent of the deviation (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
7. **`criticality`**: Statutory clinical classification (`CRITICAL` Class I, `MAJOR` Class II, `MINOR` Class III).
8. **`risk_level`**: Overall risk priority designation (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
9. **`patient_impact`**: Assessment of patient exposure or explicit statement that no patient harm occurred.
10. **`completeness`**: Normalized float score (0.0 to 1.0) measuring regulatory readiness.
11. **`missing_information`**: Specific follow-up clarification prompts for the complainant.
12. **`risk_factors`**: Key risk drivers identified during analysis.
13. **`duplicate_detection`**: Evaluation of batch matching and defect recurrence similarity.
14. **`root_cause_recommendations`**: Structured hypotheses categorized by 6M Ishikawa dimensions.
15. **`capa_recommendations`**: Concrete corrective and preventive action items.
16. **`summary`**: Executive QA summary suitable for regulatory submission and Field Alert Review.

---

## 9. Human-in-the-Loop Quality Paradigm

Under **FDA 21 CFR 211.198** and **EU GMP Annex 11**, ultimate legal accountability for pharmaceutical release, defect classification, and recall decisions rests exclusively with authorized human quality professionals:

```
[Unstructured Narrative] 
       → [LangGraph AI Triage] 
       → [Draft AI Suggestions] 
       → [Human QA Verification in /form] 
       → [Field Provenance Tagging (EXTRACTED / AI COPILOT / EDITED)] 
       → [QA Operator Electronic Signature & Mandatory Change Reason] 
       → [Database Commit & 21 CFR Part 11 Audit Log]
```

> [!NOTE]
> **AI is strictly an assistance and recommendation layer.** The system never permits autonomous AI agents to write directly to the primary QMS database or close investigations without human review and approval.

---

## 10. Groq Model Compatibility & Migration Notice

### Groq Model Compatibility
- **Assignment Requested Model:** `gemma2-9b-it`
- **Current Live Runtime Model:** `openai/gpt-oss-120b`
- **Migration Rationale:** During live implementation, `gemma2-9b-it` was decommissioned upstream on the Groq Cloud platform (direct API requests returned HTTP 400 `model_decommissioned`). Rather than using mock data or simulating responses, the application was migrated to `openai/gpt-oss-120b`, Groq’s active, high-throughput open-weights production model.
- **Traceability Preserved:** The architecture strictly preserves the mandatory **Groq + LangGraph (8 nodes) + structured output** pipeline. Configuration settings, telemetry headers, and UI badges explicitly maintain `ASSIGNMENT_REQUESTED_MODEL=gemma2-9b-it` for specification traceability while transparently executing on `runtime_model=openai/gpt-oss-120b`.

---

## 11. Setup & Installation Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.14 on Windows 11)
- Node.js 18+ and npm
- Groq Cloud API Key

### Backend Setup (Windows PowerShell)
```powershell
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
# Copy .env.example to .env and configure your GROQ_API_KEY
copy .env.example .env

# 5. (Optional) Seed the database with 5 representative pharmaceutical cases
python scripts/seed_db.py

# 6. Run FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup (Windows PowerShell)
```powershell
# 1. Open a new terminal and navigate to frontend directory
cd frontend

# 2. Install npm dependencies
npm install

# 3. Start Vite development server
npm run dev
```

---

## 12. Application URLs

- **Frontend QMS Web UI:** `http://localhost:5173`
- **Backend API Server:** `http://127.0.0.1:8000`
- **Interactive Swagger Documentation:** `http://127.0.0.1:8000/docs`
- **ReDoc API Specifications:** `http://127.0.0.1:8000/redoc`

---

## 13. Testing & Verification Results

All automated verification checks pass with zero errors:

```text
============================= pytest test session =============================
platform win32 -- Python 3.14.5, pytest-9.1.1, pluggy-1.6.0
rootdir: backend
plugins: anyio-4.13.0, langsmith-0.12.6
collected 23 items

tests/test_ai_graph.py ....                                              [ 17%]
tests/test_aivoa_e2e_verification.py ...                                 [ 30%]
tests/test_complaints.py .......                                         [ 60%]
tests/test_health.py ..                                                  [ 69%]
tests/test_uploads.py ...                                                [ 82%]
tests/test_validation.py ....                                            [100%]

====================== 23 passed in 121.93s (100% PASS) =======================
```

- **Backend Pytest Tests:** **23 passed, 0 failed**
- **Frontend Production Build:** **0 errors** (`vite build` completes cleanly, 1569 modules transformed)
- **LangGraph State Machine:** **8/8 nodes** executed live with state validation
- **Live Groq API Verification:** **PASS** (sub-second live inference using `openai/gpt-oss-120b`)
- **Database Transactions & Audit Trails:** **PASS** (SHA-256 integrity verified)

---

## 14. Sample Workflow Walkthrough

1. **Complaint Ingestion:** QA specialist navigates to `/intake` and inputs an unstructured report (or selects a pre-configured scenario).
2. **AI Analysis:** Clicking **"Analyze with AI Copilot"** invokes the 8-node LangGraph workflow via FastAPI and Groq.
3. **Structured AI Assessment:** System returns the 16 validated fields, showing regulatory completeness, confidence score, and preliminary risk level.
4. **Verification Form:** QA clicks **"Populate QMS Complaint Form"** (`/form`); fields are populated with visual provenance tags.
5. **Human Editing & Sign-Off:** QA operator reviews, edits fields if needed (triggering the `EDITED` badge), enters their operator ID (`#QA-042`), and provides a change justification.
6. **Database Persistence:** Clicking **"Register & Commit to QMS"** commits the record and writes an immutable SHA-256 audit entry.
7. **Registry & Dashboard:** Complaint appears immediately on the **Complaint Register** (`/complaints`) and updates the **Executive Dashboard** (`/`) in real time.

---

## 15. Security & Data Integrity

- **Strict Secret Isolation:** `GROQ_API_KEY` exists exclusively in the backend server environment (`backend/.env`).
- **Zero Frontend Secret Leaks:** No API keys or tokens are ever packaged in client-side bundles or exposed to React.
- **Git Hygiene:** Root and backend `.gitignore` rules strictly exclude `.env`, `.env.*`, `node_modules/`, `dist/`, `*.db`, and `__pycache__/`.
- **Server-Gated Database Operations:** All database writes, lifecycle transitions, and audit logs are mediated by FastAPI backend logic.
- **Tamper-Evident Audit Trails:** Every audit record incorporates a SHA-256 hash computed over row values.

---

## 16. Known Limitations

- **Prototype Classification:** This application is an engineering prototype and demonstrator of AI-assisted QMS workflows; it is not formally certified under GAMP 5 Category 4/5 Computerized System Validation.
- **Advisory AI Output:** AI-generated risk levels, root cause hypotheses, and CAPA plans are preliminary recommendations requiring review and confirmation by qualified QA personnel.
- **Document OCR:** The prototype supports digital text extraction from PDFs via `pypdf`; low-resolution scanned paper documents require an enterprise OCR engine (such as AWS Textract or Tesseract).
- **Duplicate Detection Heuristics:** Current duplicate detection utilizes exact batch lot matching and lexical text similarity; multi-site enterprise deployments would benefit from dense biomedical vector embeddings.

---

## 17. Future Improvements

- **Enterprise SSO & RBAC:** Integration with Okta/Azure AD via SAML 2.0 / OIDC with fine-grained Role-Based Access Control.
- **Biometric 21 CFR Part 11 Digital Signatures:** Cryptographic digital signing ceremonies with dual-factor authentication.
- **Multimodal Visual Defect Inspection:** Direct analysis of defect photos (cracked vials, blister leaks) using vision-language models.
- **Automated Regulatory E2B(R3) XML Export:** One-click generation of FDA MedWatch Form 3500A and ICH E2B(R3) electronic submissions.
- **Vector-Based Semantic Search:** Integration of `pgvector` or Qdrant with biomedical embeddings (`BioClinical-BERT`) for multilingual duplicate detection across global manufacturing plants.
- **Production Observability:** Distributed tracing and telemetry integration via OpenTelemetry and Prometheus.

---

## 18. Application Screenshots

The system UI comprises seven primary operational screens designed for pharmaceutical Quality Management. See [`docs/SCREENSHOT_CHECKLIST.md`](./docs/SCREENSHOT_CHECKLIST.md) for capture procedures and UI element mapping.

| # | Screen / View | Target Filename | Key Visual Elements |
| :-: | :--- | :--- | :--- |
| 1 | Executive Quality Dashboard | `screenshots/01-dashboard.png` | KPI cards, ICH Q9 criticality distribution, active investigations |
| 2 | Multi-Modal Intake & Presets | `screenshots/02-intake.png` | Preset scenario chips, raw narrative, email parser, document upload |
| 3 | Live AI Triage Assessment | `screenshots/03-ai-analysis.png` | 16 extracted fields, completeness gauge, Groq model badge |
| 4 | Regulatory AI Copilot | `screenshots/04-ai-copilot.png` | FDA 21 CFR 211.198 escalation alert, missing info, duplicate check |
| 5 | Human-in-the-Loop Form | `screenshots/05-verification-form.png` | Field provenance tags (`EXTRACTED`, `AI COPILOT`, `EDITED`), operator sign-off |
| 6 | Complaint Register Table | `screenshots/06-complaint-register.png` | Paginated complaint history, batch search, status pills, CSV export |
| 7 | FastAPI Interactive Swagger | `screenshots/07-swagger.png` | OpenAPI 3.1 endpoints (`/api/complaints`, `/api/ai`, `/api/health`) |

> [!NOTE]
> Screenshot images can be captured directly from the running local servers (`http://localhost:5173` and `http://127.0.0.1:8000/docs`) following the checklist in [`docs/SCREENSHOT_CHECKLIST.md`](./docs/SCREENSHOT_CHECKLIST.md).

---

## Documentation Index

- **[Live Interview Demo Script (7–9 min)](./docs/AIVOA_DEMO_SCRIPT.md)**
- **[Comprehensive Technical Interview Q&A (23 Questions)](./docs/INTERVIEW_QA.md)**
- **[System Architecture & Technical Design Document](./docs/ARCHITECTURE.md)**
- **[Final Submission Verification & Audit Matrix](./docs/FINAL_STATUS.md)**
- **[Screenshot Capture Checklist & Guide](./docs/SCREENSHOT_CHECKLIST.md)**
- **[Synthetic Sample Data Documentation](./sample_data/README.md)**
- **[Product Requirements Document (PRD)](./docs/PHASE_1_PRODUCT_REQUIREMENTS.md)**
- **[Complaint Data Model Specification](./docs/PHASE_1_DATA_MODEL.md)**
- **[LangGraph AI Agent Specification](./docs/PHASE_1_LANGGRAPH_DESIGN.md)**
- **[RESTful API Contract Specification](./docs/PHASE_1_API_CONTRACT.md)**
