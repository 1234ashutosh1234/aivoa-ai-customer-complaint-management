# PharmaGuard QMS — Screenshot Capture Checklist & Guide

**Directory Target:** `screenshots/`  
**Purpose:** Visual documentation for repository README, client demonstration, and presentation slides.

---

## Recommended Screenshot Files

Capture each of the following 7 high-resolution screenshots at standard 1920x1080 (or 16:9 retina desktop resolution):

| Filename | Page / Route | Component / View to Capture | Key Elements to Highlight |
| :--- | :--- | :--- | :--- |
| **`01-dashboard.png`** | `http://localhost:5173/` | Executive Quality Dashboard | Top KPI summary cards (Total Complaints, Critical/High Risk, Active Investigations, CAPA Rate), Criticality Distribution bars, and AI Copilot Telemetry card. |
| **`02-intake.png`** | `http://localhost:5173/intake` | Multi-Modal Intake Screen | Preset scenario chips along the top, the 3 intake tabs (Raw Narrative, Email Parser, Document Upload), and the complaint text input area. |
| **`03-ai-analysis.png`** | `http://localhost:5173/intake` | Live AI Triage Assessment Card | The rendered AI results card showing the circular Completeness Gauge (85%+), AI Confidence Badge (`openai/gpt-oss-120b`), and extracted chips (Product, Batch, Severity, Criticality). |
| **`04-ai-copilot.png`** | `http://localhost:5173/intake` | Escalation & Missing Info Panel | The red FDA 21 CFR 211.198 regulatory escalation alert banner, duplicate detection card, and missing regulatory questions list. |
| **`05-verification-form.png`** | `http://localhost:5173/form` | Structured Form (Human-in-the-Loop) | Form populated with extracted values, highlighting the field provenance badges (`[EXTRACTED]` in blue, `[AI COPILOT]` in violet, and `[EDITED]` in amber), plus 21 CFR Part 11 operator attribution. |
| **`06-complaint-register.png`** | `http://localhost:5173/complaints` | Complaint Register Table | Paginated data grid with search filters, lot numbers, criticality chips (`CRITICAL`, `MAJOR`, `MINOR`), investigation status pills, and CSV export button. |
| **`07-swagger.png`** | `http://127.0.0.1:8000/docs` | FastAPI Interactive Swagger UI | OpenAPI 3.1 documentation highlighting `/api/complaints`, `/api/ai/analyze-complaint`, and `/api/ai/status` endpoints. |

---

## Capture Procedure

1. **Verify Backend & Frontend are Running:**
   - Backend on `http://127.0.0.1:8000`
   - Frontend on `http://localhost:5173`
2. **Execute Demo Complaint Flow:**
   - Go to `/intake`, paste the test complaint:
     > *"Customer MediCare Distributors reported that Paracetamol 500 mg Tablets from batch PCM24017 had several broken tablets and powder inside the blister pockets. The issue was observed in multiple packs received by the distributor. No confirmed patient injury has been reported."*
   - Click **"Analyze with AI Copilot"**.
   - Capture `02-intake.png`, `03-ai-analysis.png`, and `04-ai-copilot.png`.
   - Click **"Populate QMS Complaint Form"**, edit one field (e.g. customer name), capture `05-verification-form.png`.
   - Click **"Register & Commit"**, go to `/complaints` to capture `06-complaint-register.png`.
   - Return to `/` to capture `01-dashboard.png`.
   - Open `http://127.0.0.1:8000/docs` in browser and capture `07-swagger.png`.
3. **Save into `screenshots/` Directory:**
   - Ensure filenames strictly match `01-dashboard.png` through `07-swagger.png`.
   - Keep file sizes optimized (< 1.5MB per PNG).
