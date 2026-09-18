# PharmaGuard QMS — 7 to 9 Minute Live Interview Demo Script

**Project:** AI-Powered Customer Complaint Management System for Pharmaceutical Manufacturing  
**Tone:** Natural, conversational, technically confident, and domain-grounded  
**Target Audience:** Technical Hiring Manager & AI Product Lead  
**Estimated Time:** Exactly 8 minutes 45 seconds  

---

### [00:00 – 00:45] Problem and Solution

**Screen:** Browser on `http://localhost:5173/` (Dashboard)

**What to Say:**
> "Hi everyone, thanks for having me today! I'm excited to walk you through **PharmaGuard QMS**, an AI-powered customer complaint management system built specifically for pharmaceutical manufacturing.
>
> In the pharma industry, customer complaints are never just customer service inquiries. Under **FDA 21 CFR 211.198** and **EU GMP Chapter 8**, every single complaint about a broken tablet, a contaminated vial, or a packaging defect is a regulated quality deviation. Handling them manually across unstructured customer emails, scanned call logs, and multi-page PDFs takes days, creates backlogs, and risks human error that could delay mandatory FDA Field Alert Reports.
>
> What PharmaGuard does is take that messy, unstructured intake and instantly turn it into structured, regulatory-compliant quality intelligence using a deterministic multi-agent LangGraph workflow. But crucially—because this is pharma—the AI doesn't make autonomous decisions. It acts as an intelligent copilot with full human-in-the-loop verification and an immutable 21 CFR Part 11 audit trail."

---

### [00:45 – 01:30] Architecture

**Screen:** Briefly switch to Swagger at `http://127.0.0.1:8000/docs` or point to UI status badges

**What to Say:**
> "Let's take a quick look at the architecture:
>
> On the frontend, we have **React 18** with **Redux Toolkit** for predictable, immutable state management, styled with **Tailwind CSS** and **Google Inter** typography for clinical readability.
>
> The frontend talks to a **Python FastAPI** backend. FastAPI handles high-concurrency async requests, validates all payloads using **Pydantic v2**, and talks to our database via **SQLAlchemy 2.0**.
>
> For the AI core, we implemented an **8-node cyclical state machine using LangGraph**. Instead of sending one big monolithic prompt to an LLM, the complaint flows through eight discrete, auditable nodes.
>
> For inference, we connect live to the **Groq Cloud API**, running `openai/gpt-oss-120b` for sub-second, highly structured JSON output.
>
> And underneath it all, we have dual-driver database compatibility: running lightweight SQLite locally for testing, with full PostgreSQL production support ready via environment variables."

---

### [01:30 – 02:15] Dashboard

**Screen:** Back to `http://localhost:5173/` (Dashboard)

**What to Say:**
> "Here on our executive dashboard, quality directors get immediate operational visibility.
>
> Across the top, we see our key metrics: Total Registered Complaints, Critical Class I events requiring urgent action, Active Investigations undergoing lab assay, and our CAPA closure rate.
>
> Over on the left, we have our **ICH Q9 Criticality Distribution**, giving us a clear proportional breakdown between Critical, Major, and Minor quality issues.
>
> In the middle, the **Investigation Lifecycle** tracks records moving from open intake through root cause analysis to closure.
>
> And in the AI telemetry panel on the right, you can see our live Groq model status, average triage execution time of under two seconds, and a reminder of our human-in-the-loop guarantee: AI never writes directly to the database without QA sign-off."

---

### [02:15 – 03:30] New Complaint Intake

**Screen:** Click "New Complaint Intake" or go to `http://localhost:5173/intake`

**What to Say:**
> "Now let's run a live complaint through the system. I'll click into **Intake & Triage**.
>
> Notice we have three ingestion channels here:
> 1. Raw narrative text for phone or customer logs.
> 2. An email parser that extracts headers like Subject and Facility.
> 3. A document upload zone where QA teams can drag-and-drop PDF complaint reports or lab certificates, which are parsed and cryptographically hashed using SHA-256 for audit integrity.
>
> Along the top, we also have quick presets for testing real-world scenarios: sterile injectables, cracked tablets, cold-chain temperature excursions, and label misprints.
>
> For our live test, I'll take an unstructured distributor report and paste it directly into our raw text area:
>
> *'Customer MediCare Distributors reported that Paracetamol 500 mg Tablets from batch PCM24017 had several broken tablets and powder inside the blister pockets. The issue was observed in multiple packs received by the distributor. No confirmed patient injury has been reported.'*
>
> Notice this is completely free-form text—no pre-formatting, just raw narrative."

---

### [03:30 – 04:45] Live AI Analysis

**Screen:** Click the purple **"Analyze with AI Copilot"** button

**What to Say:**
> "Now I'll click **Analyze with AI Copilot**.
>
> While that processes for a second or two, our backend is executing the LangGraph pipeline:
> - It sanitizes the text and scrubs any personal data.
> - It extracts the key pharma entities.
> - It checks regulatory completeness against FDA 21 CFR 211.198.
> - And it performs an ICH Q9 risk calculation.
>
> And here are the live results!
>
> Notice what the model extracted:
> - Product: `Paracetamol 500 mg Tablets`
> - Batch Number: `PCM24017`
> - Defect Category: `Physical Defect`
> - Risk Level: `MEDIUM` severity with `MAJOR` criticality, which is appropriate because broken tablets compromise dosage uniformity even though no patient was directly injured.
>
> Up top, our SVG **Regulatory Completeness Gauge** shows an 88% completeness score, and the **AI Confidence Badge** confirms high certainty from our live Groq model."

---

### [04:45 – 05:45] AI Copilot

**Screen:** Scroll down the right-hand panel of `/intake`

**What to Say:**
> "Now look below the extraction at the **AI Copilot** recommendations:
>
> First, it generates **Regulatory Missing Information** questions. For example, it prompts QA to ask MediCare Distributors: *'What is the storage temperature at the distribution depot?'* and *'Can retain samples of batch PCM24017 be returned to QC for friability testing?'*
>
> Second, our **Duplicate Detection** node checked the database to see if other facilities have reported defects on batch `PCM24017`.
>
> Third, the Copilot has already drafted **Root Cause Hypotheses**—pointing towards tablet compression punch wear or excessive mechanical vibration during cartoning.
>
> And fourth, it proposed **Immediate CAPA Actions**—such as quarantining remaining reserve stock of lot PCM24017 and scheduling an immediate tooling inspection on tablet press #3."

---

### [05:45 – 06:30] Verification Form and Human Editing

**Screen:** Click **"Populate QMS Complaint Form"** (navigates to `/form`)

**What to Say:**
> "Now here is the critical regulatory handoff. I'll click **Populate QMS Complaint Form**.
>
> Notice all the fields are filled in, but look at the badges next to each field:
> - The blue badges say `EXTRACTED`—indicating factual data taken straight from the source narrative.
> - The purple badges say `AI COPILOT`—indicating generated analytical suggestions.
>
> Now watch what happens when I, the human QA operator, make an adjustment. If I edit the Customer Organization from `MediCare Distributors` to `MediCare National Supply Chain - Central Depot`, the badge immediately changes to an amber `EDITED` badge.
>
> This field-level provenance tracking gives regulatory auditors complete clarity on where every single piece of data originated."

---

### [06:30 – 07:15] Save Complaint and Complaint Register

**Screen:** Click **"Register & Commit to QMS"**, then navigate to `/complaints`

**What to Say:**
> "At the bottom of the form, I enter my operator credentials—QA Manager Vance, #QA-042—and provide my mandatory change justification.
>
> When I click **Register & Commit to QMS**, the system creates the permanent complaint record, advances its lifecycle status, and writes an immutable entry into our `audit_logs` table with a cryptographic SHA-256 hash.
>
> Now let's head over to the **Complaint Register** at `/complaints`.
>
> Here we see our newly created complaint registered at the top of the table. We can filter by batch, search by product name, inspect criticality badges, or export the entire register to CSV for health authority submission."

---

### [07:15 – 08:00] LangGraph / Backend Code Walkthrough

**Screen:** Show IDE or code snippet of `backend/app/ai/nodes.py` or `docs/ARCHITECTURE.md`

**What to Say:**
> "Let's briefly touch on how this is built under the hood.
>
> In `backend/app/ai/nodes.py`, we defined an explicit LangGraph state machine with eight distinct nodes:
> 1. `normalize_input`
> 2. `extract_complaint`
> 3. `completeness_check`
> 4. `risk_assessment`
> 5. `duplicate_detection`
> 6. `root_cause_recommendation`
> 7. `capa_recommendation`
> 8. `final_response`
>
> Each node has a strictly typed contract. If the LLM output ever deviates or omits a key, our Pydantic validation schema intercepts it, applies fallback defaults, and prevents corrupted data from ever reaching our database or client."

---

### [08:00 – 08:45] Testing, Security, and Model Migration

**Screen:** Terminal showing `23 passed` or `docs/FINAL_STATUS.md`

**What to Say:**
> "To ensure enterprise reliability, we built a comprehensive automated test suite:
> - **23 backend pytest tests** pass with zero failures, covering the full LangGraph pipeline, live Groq API communication, CRUD operations, and 21 CFR Part 11 audit logging.
> - The React frontend compiles cleanly with **0 build errors** on Vite.
>
> On security: zero API keys exist in the frontend, `.env` files are strictly gitignored, and database writes are strictly gated behind backend authorization.
>
> A quick note on model selection: the original assignment requested `gemma2-9b-it`. During implementation, Groq officially decommissioned Gemma 2 on their cloud API. Rather than faking execution or using mock data, we performed a clean, documented migration to Groq's active high-performance model, `openai/gpt-oss-120b`, while preserving the exact LangGraph multi-agent architecture."

---

### [08:45 – 09:00] Conclusion

**What to Say:**
> "In summary: PharmaGuard QMS transforms a slow, error-prone 5-day paper intake process into an assisted 2-minute triage, while enforcing complete compliance with FDA 21 CFR 211.198 and Part 11.
>
> Thank you so much for your time, and I would be delighted to answer any questions or dive deeper into the code!"
