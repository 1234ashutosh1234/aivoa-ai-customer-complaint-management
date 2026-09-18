# Master Implementation Plan: Phases 2 through 5
## AI-Powered Customer Complaint Management System for Pharmaceutical Manufacturing

---

## 1. Project Overview & Multi-Phase Roadmap

This master roadmap guides the execution of the remaining project phases following the architectural and regulatory foundations established in **Phase 1**.

```
[Phase 1: Architecture & Planning] (COMPLETED)
       │
       ▼
[Phase 2: Backend Core & Database Infrastructure]
       │
       ▼
[Phase 3: Frontend Architecture, Redux Toolkit & UI]
       │
       ▼
[Phase 4: LangGraph & Groq Multi-Agent Orchestration]
       │
       ▼
[Phase 5: End-to-End Integration, Validation & Demo Polish]
```

---

## 2. Phase 2: Backend Core & Database Infrastructure

### Goal:
Build a production-style, robust, and tested FastAPI backend with SQLAlchemy ORM, database migrations, CRUD complaint endpoints, lifecycle transitions, and 21 CFR Part 11 compliant audit logging.

### Detailed Scope & Tasks:
1. **FastAPI Application Scaffolding:**
   - Initialize `backend/app/main.py` with CORS middleware, lifespan events, and global exception handlers.
   - Configure modular routing structure:
     - `app/api/v1/endpoints/health.py`
     - `app/api/v1/endpoints/complaints.py`
     - `app/api/v1/endpoints/ai.py`
     - `app/api/v1/endpoints/investigations.py`
     - `app/api/v1/endpoints/capas.py`
     - `app/api/v1/endpoints/audit.py`
2. **Database Engine & SQLAlchemy Models:**
   - Implement `app/db/session.py` with SQLAlchemy 2.0 `create_engine` (PostgreSQL default, with automatic fallback / support for MySQL and SQLite).
   - Implement database connection pooling and health probe check.
   - Implement ORM models in `app/models/` for `Complaint`, `ComplaintAttachment`, `AIAssessment`, `Investigation`, `CAPA`, and `AuditLog`.
3. **Pydantic v2 Request/Response Schemas:**
   - Define strict Pydantic models in `app/schemas/` corresponding to the contracts designed in `docs/PHASE_1_DATA_MODEL.md` and `docs/PHASE_1_API_CONTRACT.md`.
4. **CRUD & Lifecycle Service Layer:**
   - Implement `app/services/complaint_service.py` to handle complaint creation (generating sequential `CMP-YYYY-XXXXX` identifier), updating, and querying.
   - Implement `app/services/audit_service.py` to automatically record every field change with timestamp, old value, new value, user ID, and mandatory change rationale.
   - Implement lifecycle state transitions (`Draft` -> `Logged` -> `Under Investigation` -> `CAPA Pending` -> `Closed`).
5. **Database Seed Data Loader:**
   - Create `backend/scripts/seed_db.py` to populate initial realistic pharmaceutical complaint records (API and FDF cases) to allow immediate frontend integration and duplicate detection testing.

### Deliverables:
- Working FastAPI backend running on `http://localhost:8000`.
- Interactive Swagger docs at `http://localhost:8000/docs`.
- Automated test suite verifying CRUD operations, filtering, pagination, and audit logging.

---

## 3. Phase 3: Frontend Architecture, Redux Toolkit & UI

### Goal:
Build a clinical, intuitive, and responsive React frontend leveraging Redux Toolkit for state management, Tailwind CSS for styling, and Google Inter typography.

### Detailed Scope & Tasks:
1. **React Application Initialization:**
   - Scaffold modern React application with TypeScript and Tailwind CSS.
   - Configure Google Inter font in `index.html` and `tailwind.config.js`.
   - Setup Axios / Fetch API client with base URL from environment variables.
2. **Redux Toolkit State Layer:**
   - Implement `frontend/src/store/`:
     - `complaintsSlice.ts`: handles list, pagination, active filters, selected complaint, creation, updates.
     - `aiCopilotSlice.ts`: handles extraction state, analysis progress steps, composite results.
     - `uiSlice.ts`: handles notifications, modal dialogs, and navigation state.
3. **Design System & Atomic Components:**
   - Implement `components/common/`: Button, Input, Select, Textarea, Badge, Modal, Card.
   - Implement `components/feedback/`: CompletenessGauge, ConfidenceBadge, AlertBanner, Toast.
   - Implement `components/data-display/`: MetricCard, DataTable, AuditTrailTimeline, IshikawaView.
4. **Core Application Screens:**
   - **Dashboard (`/dashboard`):** 4 KPI summary cards, intake trend chart, risk donut, active complaints table.
   - **Intake View (`/intake`):** Multi-tab input (Text, Email headers, Document upload, 1-click synthetic test scenario buttons).
   - **Review & Verification View (`/intake/review`):** Side-by-side split view with source document on left, editable verified form on right, and completeness score progress bar.
   - **AI Copilot Drawer:** Real-time risk assessment, RPN calculation, regulatory warning banners, and duplicate chips.
   - **Complaint Detail Workspace (`/complaints/:id`):** Tabbed interface for Overview, 6M Investigation & 5-Whys, CAPA tracking, and 21 CFR Part 11 Audit Trail.
   - **Complaint History (`/history`):** Audit-ready search, multi-filter dropdowns, pagination, CSV export.
   - **Settings (`/settings`):** Live backend health check, Groq model connectivity test.

### Deliverables:
- Fully functional React UI running on `http://localhost:5173`.
- Seamless Redux Toolkit state flow across all views.
- High-fidelity visual implementation matching Google Inter medical UI guidelines.

---

## 4. Phase 4: LangGraph & Groq Multi-Agent Orchestration

### Goal:
Integrate the LangGraph stateful agent pipeline with Groq API, executing the 8-node complaint intelligence workflow using `gemma2-9b-it` and `llama-3.3-70b-versatile`.

### Detailed Scope & Tasks:
1. **Groq Client & Environment Configuration:**
   - Configure `langchain-groq` client initialized with `GROQ_API_KEY` from `.env`.
   - Configure primary LLM: `ChatGroq(model_name="gemma2-9b-it", temperature=0.1)`.
   - Configure contextual/fallback LLM: `ChatGroq(model_name="llama-3.3-70b-versatile", temperature=0.2)`.
2. **LangGraph State & Nodes Implementation:**
   - `app/ai/graph.py` & `app/ai/nodes/`:
     - `normalize_input_node`: Cleans text, parses email headers, removes disclaimers.
     - `extract_complaint_node`: Prompt-engineered zero-shot extraction using `gemma2-9b-it`.
     - `completeness_check_node`: Evaluates presence of mandatory regulatory fields; computes 0–100% score; generates customer follow-up questions.
     - `risk_assessment_node`: Computes ICH Q9 Risk Priority Number ($S \times O \times D$), assigns Critical/Major/Minor, flags pharmacovigilance adverse events.
     - `deep_pharmacovigilance_node`: Escalates critical/adverse event cases to `llama-3.3-70b-versatile`.
     - `duplicate_detection_node`: Compares batch and defect against database records; flags batch clustering signals.
     - `investigation_recommendation_node`: Generates 6M Ishikawa hypotheses and 5-Whys analysis.
     - `capa_recommendation_node`: Formulates immediate containment, corrective, and preventive actions.
     - `synthesize_output_node`: Aggregates and validates complete Pydantic payload.
     - `repair_schema_node`: Self-healing fallback using `llama-3.3-70b-versatile` if JSON parsing fails.
3. **FastAPI AI Router Integration:**
   - Connect `POST /api/ai/analyze-text` and `POST /api/ai/analyze-document` to invoke the compiled LangGraph workflow.
   - Implement PDF/image text extraction using `pypdf` and text pre-processors.
   - Record AI run telemetry (latency, token usage, prompt version) into the `ai_assessments` database table.

### Deliverables:
- Operational LangGraph workflow producing structured, predictable JSON in $< 3$ seconds.
- Resilient fallback logic handling rate limits, network retries, and schema repairs.

---

## 5. Phase 5: End-to-End Integration, Testing, Polish & Demo Readiness

### Goal:
Connect frontend to backend, test with realistic pharmaceutical complaint scenarios, verify regulatory auditability, polish UI interactions, and prepare demonstration assets.

### Detailed Scope & Tasks:
1. **End-to-End Integration:**
   - Wire all frontend Redux thunks to live FastAPI endpoints.
   - Verify complete intake -> AI extraction -> review -> save -> investigation -> CAPA -> audit cycle.
2. **Realistic Scenario Validation:**
   - Validate with 4 authentic pharmaceutical cases:
     1. *API Scenario:* Paracetamol API Bulk Powder Black Particulate Contamination.
     2. *FDF Scenario:* Amoxicillin 500mg Blister Foil Pinhole Leak & Softened Tablets.
     3. *Pharmacovigilance Scenario:* Metformin XR Pediatric Dosing Confusion / Adverse Reaction.
     4. *Sterile Parenteral Scenario:* Ciprofloxacin Infusion Vial Glass Flake Particulate (Critical Class I).
3. **Audit Trail Verification (21 CFR Part 11):**
   - Verify that any edit to a complaint generates an immutable audit record with old value, new value, and mandatory reason.
4. **Performance & Error Handling Verification:**
   - Verify graceful degradation if Groq API key is invalid or rate limited.
   - Verify responsive design across screen sizes.
5. **Documentation & Demo Readiness:**
   - Comprehensive `README.md` with architecture diagrams, setup instructions, and API references.
   - Environment templates (`.env.example`).
   - Clean demonstration script for stakeholder evaluation.

---

## 6. Execution Order & Milestones Summary

| Milestone | Target Phase | Key Output | Verification Criteria |
| :--- | :--- | :--- | :--- |
| **M1: Architecture & Specs** | Phase 1 | 8 Specification Docs + Scaffolding | All Phase 1 documents verified and consistent |
| **M2: Backend & DB** | Phase 2 | FastAPI service + SQLAlchemy + DB Seed | All CRUD and audit endpoints pass tests |
| **M3: Frontend Experience** | Phase 3 | React UI + Redux Store + Inter Design | All 7 screens rendered and responsive |
| **M4: AI Intelligence** | Phase 4 | LangGraph Workflow + Groq Agents | Structured JSON extraction $< 3$s latency |
| **M5: Full Prototype** | Phase 5 | Fully Integrated Working Application | Flawless execution of all 4 demo scenarios |
