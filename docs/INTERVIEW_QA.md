# PharmaGuard QMS — Comprehensive Technical Interview Q&A

**Project:** AI-Powered Customer Complaint Management System for Pharmaceutical Manufacturing  
**Candidate Guide:** 23 Practical Questions and Direct Verbal Answers  

---

### 1. Explain the architecture.
**Answer:**  
PharmaGuard is built on a four-tier architecture:
1. **Frontend:** React 18 with Redux Toolkit for state management, Tailwind CSS for enterprise QMS styling, and Google Inter for clinical typography.
2. **Backend:** Python FastAPI providing high-throughput asynchronous REST endpoints and Pydantic v2 data validation.
3. **AI Layer:** LangGraph orchestrating an 8-node state machine that communicates with Groq Cloud API (`openai/gpt-oss-120b`) for sub-second structured inference.
4. **Database:** SQLAlchemy 2.0 ORM with PostgreSQL primary architecture and zero-config SQLite local development fallback, enforcing 21 CFR Part 11 append-only audit trails.

---

### 2. Why React?
**Answer:**  
React provides a component-driven architecture that lets us build complex, modular interfaces like multi-tab intake wizards, interactive 6M Ishikawa diagrams, and real-time metric counters. Its virtual DOM and vast ecosystem of UI primitives enable rapid rendering of live QMS data without reloading pages.

---

### 3. Why Redux?
**Answer:**  
In a regulated pharmaceutical application, state changes must be predictable, auditable, and immutable. Redux Toolkit (RTK) centralizes our application state in a single store, prevents erratic prop-drilling across multi-step complaint forms, manages asynchronous API lifecycles with `createAsyncThunk`, and enables time-travel debugging to trace state evolution.

---

### 4. Why FastAPI?
**Answer:**  
FastAPI is native asynchronous (`async`/`await`), which is crucial when handling LLM requests that can take 1 to 2 seconds over the wire—it doesn't block worker threads like synchronous Flask or Django. It also integrates natively with Pydantic for automated request/response validation and automatically generates interactive OpenAPI Swagger docs at `/docs`.

---

### 5. Why LangGraph instead of one LLM request?
**Answer:**  
A single massive LLM prompt is brittle: if one part fails (like duplicate detection or risk scoring), the entire extraction fails or hallucinates. LangGraph allows us to break the workflow into an 8-node state machine. Each node has a single responsibility, strongly-typed state inputs/outputs, and isolated fallback handling. This modularity makes the AI controllable, reproducible, and explainable for regulatory auditors.

---

### 6. Why Groq?
**Answer:**  
Groq’s Language Processing Unit (LPU) architecture delivers extraordinary inference speeds (often 300 to 500+ tokens per second). In an interactive QMS copilot where a QA specialist is waiting for analysis, waiting 15 seconds on a traditional cloud provider harms user adoption. Groq delivers complete 16-key structured analyses in under 2 seconds.

---

### 7. How does the LangGraph workflow operate?
**Answer:**  
The workflow operates as an explicit directed state machine initialized with a `ComplaintGraphState`. Raw text enters node 1 (`normalize_input`), passes through sequential extraction, validation, and risk assessment nodes, queries database records for duplicates, synthesizes 6M root causes and CAPAs, and terminates at node 8 (`final_response`), which validates the dictionary against our Pydantic schema before returning.

---

### 8. What does each node do?
**Answer:**  
1. `normalize_input`: Sanitizes text, strips control characters and PII.
2. `extract_complaint`: Extracts product, batch, customer, defect category, and description.
3. `completeness_check`: Scores regulatory completeness against FDA 211.198 criteria and identifies missing details.
4. `risk_assessment`: Computes Severity, Criticality (Class I/II/III), and Risk Priority Number (RPN) per ICH Q9.
5. `duplicate_detection`: Queries database for matching batch lots or similar defect text.
6. `root_cause_recommendation`: Formulates hypotheses across 6M Ishikawa dimensions (Machine, Material, etc.).
7. `capa_recommendation`: Drafts immediate containment, corrective, and preventive action items.
8. `final_response`: Assembles and validates the complete 16-key schema and attaches telemetry metadata.

---

### 9. How do you validate AI output?
**Answer:**  
We enforce validation at three layers:
1. Groq's `response_format={"type": "json_object"}` forces the decoder to output valid JSON syntax.
2. Regular expression sanitization strips any residual markdown tags.
3. Strict Pydantic v2 `StructuredAIAnalysisSchema` parsing verifies all 16 required keys, enforces string/float types, and applies safe defaults if any field is empty.

---

### 10. How do you prevent hallucinated fields?
**Answer:**  
We constrain LLM generation by providing strict system prompts with explicit allowable enums for categories, severities, and criticalities. Furthermore, our human-in-the-loop architecture displays field provenance badges: factual entities parsed directly from text are tagged `EXTRACTED`, while analytical suggestions are tagged `AI COPILOT`. The QA operator must review and confirm every field before the database write occurs.

---

### 11. How does duplicate detection work?
**Answer:**  
The `duplicate_detection` node queries existing database records matching the extracted `batch_number` or `product_name`. It evaluates exact batch matches, calculates token-level string overlap against recent complaints, and flags repeat occurrences. This alerts QA if multiple pharmacies are reporting defects on the same manufacturing lot.

---

### 12. How is risk assessed?
**Answer:**  
Risk is assessed using the **ICH Q9 Quality Risk Management** framework:
- **Severity:** Evaluates the physical magnitude of the defect (Low, Medium, High, Critical).
- **Criticality:** Classifies patient health impact into FDA/ICH recall classes:
  - *Critical (Class I):* Life-threatening or severe adverse health risk.
  - *Major (Class II):* Reversible health consequence or quality defect without acute toxicity.
  - *Minor (Class III):* Low patient risk (cosmetic packaging/labeling issue).
- Combined with detection and occurrence ratings to compute the Risk Priority Number (RPN).

---

### 13. Why does a human review AI output?
**Answer:**  
Under **FDA 21 CFR 211.198** and **EU GMP Annex 11**, the pharmaceutical Quality Unit bears legal responsibility for all batch release and defect decisions. Autonomous AI writing directly to a production QMS database violates GAMP 5 validation principles. The AI serves strictly as a decision-support copilot; human QA operators verify, edit, and sign off on all records.

---

### 14. How is the API key protected?
**Answer:**  
The `GROQ_API_KEY` is stored exclusively in `backend/.env` on the backend server and loaded via Pydantic `BaseSettings`. It is never transmitted to the browser, never referenced in Vite frontend bundles, never printed in application logs, and both root and backend `.gitignore` rules prevent it from ever being committed to Git.

---

### 15. Why is the LLM API called from FastAPI instead of React?
**Answer:**  
Calling an LLM directly from React would expose private API keys in client-side network tabs and bundle code. Brokering requests through FastAPI keeps credentials secure, allows rate-limiting and access control, enables server-side Pydantic validation, and lets the server query internal database records for duplicate detection before generating recommendations.

---

### 16. How does the database work?
**Answer:**  
We use **SQLAlchemy 2.0** with dual-engine flexibility:
- In production, it connects to PostgreSQL with enterprise connection pooling (`pool_size=10`, `max_overflow=20`, `pool_pre_ping=True`).
- In local development, it defaults to a zero-configuration SQLite database (`pharma_complaints.db`).
The relational model links Complaints to Audit Logs, Investigations (6M/5-Whys), and CAPA action items with foreign key integrity.

---

### 17. How is the audit trail handled?
**Answer:**  
In compliance with **21 CFR Part 11**, every create, update, or status change creates an append-only row in the `audit_logs` table. It captures operator ID, action, field name, old value, new value, mandatory reason for change, server timestamp, and a cryptographic **SHA-256 integrity hash**. The API exposes no update or delete endpoints for audit records.

---

### 18. What happens if Groq fails?
**Answer:**  
PharmaGuard has a resilient multi-tier fallback mechanism:
If the Groq API experiences rate limits (HTTP 429), timeouts, or network outages, `backend/app/ai/llm.py` catches the exception and transparently routes the request to our local deterministic rule-based NLP engine. This engine extracts all 16 required schema fields using regular expressions and clinical lookup tables, ensuring zero user downtime.

---

### 19. Why was Gemma replaced?
**Answer:**  
The assignment originally requested `gemma2-9b-it`. However, during live testing against the Groq Cloud API, Groq returned HTTP 400 `model_decommissioned`, having retired Gemma 2 9B from their active serving tier. Rather than faking execution or using static mocks, we performed a documented migration to `openai/gpt-oss-120b`, Groq's active high-performance open model, while preserving `ASSIGNMENT_REQUESTED_MODEL=gemma2-9b-it` for specification traceability.

---

### 20. How would you scale this application?
**Answer:**  
1. **Containerization & Orchestration:** Deploy FastAPI backend containers via Kubernetes behind an AWS ALB.
2. **Database Scaling:** Run PostgreSQL on Amazon RDS Multi-AZ with read replicas for analytics queries.
3. **Caching & Message Queues:** Use Redis for session state and Celery/RabbitMQ for long-running document OCR and batch duplicate analysis.
4. **Vector Search:** Integrate PostgreSQL `pgvector` for semantic similarity search across historical complaints.

---

### 21. How would this differ in a real GMP environment?
**Answer:**  
A commercial GMP system would require:
1. Formal **GAMP 5 Category 4/5 Computerized System Validation (CSV)**, including User Requirements Specification (URS), Functional Specification (FS), Installation Qualification (IQ), Operational Qualification (OQ), and Performance Qualification (PQ).
2. Certified PKI digital signatures for 21 CFR Part 11 electronic signing ceremonies.
3. SOC 2 Type II, ISO 27001, and HIPAA/GDPR data privacy controls.
4. Continuous model monitoring to prevent AI drift on medical nomenclature.

---

### 22. How would production authentication work?
**Answer:**  
Production deployment would replace simulated operator headers with enterprise **OAuth 2.0 / OIDC** connected to corporate identity providers (Okta, Azure AD, PingFederate). It would enforce **Role-Based Access Control (RBAC)**—differentiating between Complaint Intake Operators, QA Investigators, Quality Directors, and Regulatory Auditors—with mandatory multi-factor authentication (MFA).

---

### 23. What would you improve next?
**Answer:**  
1. **Multimodal Visual Inspection:** Connect vision LLMs to analyze uploaded photos of blister cracks, vial fractures, and seal defects.
2. **Regulatory E2B(R3) Export:** Build automated XML export compliant with FDA MedWatch Form 3500A and EMA ICSR standards.
3. **Semantic Vector Search:** Implement dense embeddings for cross-lingual duplicate detection across global manufacturing sites.
4. **Real-Time Collaboration:** Add WebSockets for concurrent QA review on Class I urgent containment files.
