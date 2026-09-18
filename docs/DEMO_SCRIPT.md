# PharmaGuard AI — 7-to-9 Minute Live Interview Demo Script
## AI-Powered Customer Complaint Management System for Pharmaceutical Manufacturing
**Regulatory Standard:** FDA 21 CFR 211.198 | 21 CFR Part 11 | ICH Q10 | ICH Q9  
**Target Audience:** Technical Hiring Manager & AI Product Lead  
**Duration:** ~8 Minutes  

---

### Executive Pitch & Overview (0:00 – 1:00)
> *"Hello! Today I'm demonstrating **PharmaGuard AI**, an enterprise-grade Customer Complaint Management System built specifically for pharmaceutical manufacturing and clinical Quality Assurance.
>
> In pharma, customer complaints aren't just customer support tickets—they are statutory quality deviations governed strictly by **FDA 21 CFR 211.198**, **ICH Q10**, and **EU GMP Chapter 8**. A contaminated sterile injectable or an off-potency biologic can mandate an immediate nationwide recall and FDA Field Alert Report within 24 to 72 hours.
>
> Unlike generic LLM chatbots that hallucinate or operate as black boxes, PharmaGuard AI pairs **React and Redux Toolkit** on the frontend with **FastAPI, SQLAlchemy, and a deterministic 8-node LangGraph state machine powered by Groq's `gemma2-9b-it` and `llama-3.3-70b-versatile`**. Every extraction is verified through human-in-the-loop provenance tracking, and every change is locked in an immutable **21 CFR Part 11** electronic audit trail with SHA-256 cryptographic hashing."*

---

### Segment 1: Executive QMS Dashboard (1:00 – 2:30)
**Screen:** `/` (Dashboard)  
**Actions to Perform:**
1. Navigate to the top-level **Dashboard**.
2. Point out the top 4 KPI metric cards:
   - **Total Registered Complaints**: Live count queried from the relational database via `GET /api/complaints/metrics`.
   - **Critical / High Risk**: Highlight that critical Class I incidents trigger immediate health authority oversight.
   - **Active Investigations**: Complaints currently in lab assay or 6M root cause analysis.
   - **CAPA Execution Rate**: Completion percentage of assigned corrective and preventive actions.
3. Review the **Criticality Distribution (ICH Q9)** progress bars:
   - Shows proportional breakdown of Critical (Class I), Major (Class II), and Minor (Class III) events.
4. Point out the **AI Copilot Telemetry** panel:
   - Displays primary inference model (`gemma2-9b-it`), fallback/reasoning engine (`llama-3.3-70b-versatile`), and average triage execution time (~1.1s).
5. Inspect the **Recent Customer Complaints** table:
   - Shows batch numbers, product classifications, and fast inspection links.

**Talking Points:**
> *"The dashboard gives Quality Directors immediate visibility into product risk. Notice the compliance pill showing GMP Validated State and the operator badge attributing actions to QA Manager Vance (#QA-042), establishing regulatory accountability."*

---

### Segment 2: AI Copilot Intake & Multi-Modal Triage (2:30 – 4:30)
**Screen:** `/intake` (Intake & Triage)  
**Actions to Perform:**
1. Click **"New Complaint Intake"** or navigate to `/intake`.
2. Point out the **Quick Demo Pharma Scenarios** along the top:
   - Preset 1: *Sterile Injectable Particulate* (Ceftriaxone 1g, Batch CX-2024-088)
   - Preset 2: *Cracked Blister Tablets* (Metformin 500mg, Batch MET-2024-102)
   - Preset 3: *Cold-Chain Biologic Excursion* (Insulin Glargine 100U/mL, Batch INS-GL-993)
   - Preset 4: *Packaging Label Misprint* (Amoxicillin Suspension, Batch AMX-2024-055)
3. Show the **3 Ingestion Channels**:
   - Tab 1: **Raw Narrative Text** (unstructured doctor/pharmacist reports)
   - Tab 2: **Email Parser** (extracts headers: Subject, From hospital pharmacy, Body)
   - Tab 3: **Document Upload** (PDF uploader with server-side text extraction and SHA-256 digest)
4. Click **Scenario 1: "Sterile Injectable Particulate"** to populate the raw text area.
5. Click **"Analyze with AI Copilot"**.
6. Observe the real-time execution:
   - Notice the loading spinner executing the 8 LangGraph nodes (`normalize_input` → `extract_complaint` → `completeness_check` → `risk_assessment` → `duplicate_detection` → `root_cause_recommendation` → `capa_recommendation` → `final_response`).
   - The **AI Triage Assessment** card renders:
     - **Confidence Score**: 96% AI Confidence badge.
     - **Regulatory Completeness**: Live SVG circular completeness gauge showing 90%+.
     - **Identified Entities**: Product (`Ceftriaxone Sodium for Injection 1g`), Batch (`CX-2024-088`), Criticality (`CRITICAL`).
     - **FDA 21 CFR 211.198 Red Alert Banner**: Immediate notice that a sterile parenteral particulate defect mandates QA Director and Regulatory Affairs escalation.
     - **Initial 6M Hypothesis**: Material or packaging seal integrity failure.
7. Click **"Transfer to Verification Form"**.

**Talking Points:**
> *"Here you see the power of LangGraph. Instead of an uncontrollable chat loop, the system executes a deterministic sequence of state transitions. It parsed the verbatim text, recognized the sterile injectable formulation, evaluated the high patient hazard, computed an ICH Q9 Critical rating, and alerted the user to statutory FDA notification requirements—all in under 1.2 seconds."*

---

### Segment 3: Human-in-the-Loop Structured Form (4:30 – 5:45)
**Screen:** `/form` (Structured Form)  
**Actions to Perform:**
1. Observe how the form fields were automatically pre-populated from the LangGraph pipeline.
2. Point out the **Data Provenance Badges**:
   - `[AI COPILOT]`: Marks fields inferred or extracted by Groq/LangGraph.
3. Edit one of the fields (e.g., add detail to the Title or change the Complainant Name).
   - Observe how the badge dynamically shifts from `[AI COPILOT]` to `[EDITED]` in amber!
4. Point out the live **Form Data Completeness** meter at the top.
5. Scroll down to Section 4: **21 CFR Part 11 Electronic Attribution**:
   - Responsible Operator ID (`QA-OPERATOR-042`).
   - Regulatory Reason for Entry (`Initial QMS Registration from Hospital Particulate Report`).
6. Click **"Submit & Record in QMS Register"**.
   - Notice the success notification toast and automatic navigation to the newly minted record!

**Talking Points:**
> *"Notice the provenance badges. In a validated pharmaceutical QMS, you can NEVER blindly trust AI output. The system enforces complete transparency: auditors can clearly see what was extracted by the AI model versus what was reviewed or edited by the human operator. Furthermore, 21 CFR Part 11 mandates that no record is written without operator attribution and an explicit reason for entry."*

---

### Segment 4: 6M Ishikawa, CAPA, & 21 CFR Part 11 Audit Trail (5:45 – 7:15)
**Screen:** `/complaints/:id` (Complaint Record Detail)  
**Actions to Perform:**
1. Point out the record header: Complaint ID (e.g., `CMP-2026-00001`), Status (`RECEIVED`), Criticality (`CRITICAL`).
2. Tab 1 (**Record Overview**):
   - Product particulars, batch numbers, dosage form, complainant info, and compliance checklist.
3. Tab 2 (**6M Ishikawa & Root Cause**):
   - Displays the **6M Fishbone Diagram Framework**:
     - *Machine* (Crimping head alignment, particulate inspection camera)
     - *Material* (Rubber stopper fragmentation, glass vial annealing stress)
     - *Method* (SOP-QC-204 optical inspection protocol)
     - *Manpower* (Visual inspector qualification interval)
     - *Measurement* (Polarized light intensity, particle counter calibration)
     - *Milieu* (ISO 5 laminar airflow velocity, HEPA filter integrity)
   - Shows the automated **5-Whys Causal Tree** (W1 → W2 → W3).
4. Tab 3 (**CAPA Tracking**):
   - Shows containment actions, corrective actions, and preventive actions.
   - Click **"Assign New CAPA"** to demonstrate modal creation of a corrective mitigation.
5. Tab 4 (**21 CFR Part 11 Audit Trail**):
   - Review the chronological append-only audit event log!
   - Highlight:
     - Event Type: `CREATED`, `STATUS_CHANGE`
     - Operator ID & Role: `QA-OPERATOR-042 (QA Manager)`
     - Old Value vs. Updated Value delta visualizer
     - Mandatory Regulatory Reason for Change
     - Cryptographic SHA-256 verification digest
6. Click **"Advance Lifecycle Status"**:
   - Advance status from `RECEIVED` to `UNDER_INVESTIGATION`.
   - Enter operator signature and required Reason for Change: *"Initiating laboratory microscopic particle identification and reserve vial inspection."*
   - Click **"Sign & Advance Status"** and show the instant new audit record added to the timeline!

**Talking Points:**
> *"The 6M Ishikawa view translates raw incident text into standard pharmaceutical root cause categories. And in the audit trail, you can see our strict 21 CFR Part 11 implementation: every single status transition or field edit is permanently logged with the operator ID, timestamp, the old value, the new value, the mandatory justification, and a SHA-256 hash. This satisfies FDA inspectors during Form 483 audits."*

---

### Segment 5: System Telemetry & Closing Q&A (7:15 – 8:00)
**Screen:** `/settings` (System & Validation)  
**Actions to Perform:**
1. Navigate to `/settings`.
2. Review the live telemetry:
   - FastAPI Backend: `HEALTHY` (Python 3.14 async worker).
   - Relational Database Engine: `PostgreSQL 16 / SQLite Fallback` (Connected via SQLAlchemy 2.0).
   - Primary Inference Model: `gemma2-9b-it` via Groq.
   - Escalation Model: `llama-3.3-70b-versatile` via Groq.
   - LangGraph State Machine: `8 / 8 Active Nodes`.
3. Mention the automated test suite:
   - **20 / 20 pytest unit and integration tests passing** covering CRUD, audit events, validation constraints, and the LangGraph graph.
   - **Zero errors** in Vite React production build.

**Closing Statement:**
> *"In summary, PharmaGuard AI demonstrates how modern AI can be applied responsibly in heavily regulated life sciences. It isn't a toy wrapper around an LLM; it is a full-stack, GAMP-aligned pharmaceutical Quality Management System combining React, Redux Toolkit, FastAPI, PostgreSQL, and LangGraph. Thank you, and I look forward to your technical questions!"*
