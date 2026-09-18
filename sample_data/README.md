# Synthetic Sample Data Documentation

**System:** PharmaGuard QMS — Customer Complaint Management System  
**Classification:** Fictional / Demonstration & Validation Dataset Only  
**Regulatory Notice:** No Protected Health Information (PHI) or Confidential Customer/Patient Data is Included.

---

## Overview

All records in this directory are **100% synthetic scenarios** generated strictly for software demonstration, schema validation, and unit/integration testing of the PharmaGuard AI triage system. No data represents actual clinical events, real patient records, or real commercial manufacturing deviation logs.

---

## Available Synthetic Datasets

### 1. `complaints_sample.json`
Contains 5 structured pharmaceutical complaint records formatted to match the database and Pydantic schemas:

| Complaint ID | Product Name | Batch # | Category | Criticality / Severity | Description Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CMP-2026-00042** | Amoxicillin Trihydrate Capsules 500mg | `BX-2025-118` | Packaging Defect | Minor / Minor | Blister pocket unsealed along perimeter causing soft capsules. Intercepted at dispensary; no patient injury. |
| **CMP-2026-00055** | Paracetamol Extended-Release Tablets 500mg | `PCM24017` | Physical Defect | Major / Medium | Multiple blister cavities contain cracked, chipped, and pulverized tablets with loose white powder. |
| **CMP-2026-00073** | Amoxicillin Trihydrate Oral Suspension 250mg/5mL | `AMX-2024-055` | Labeling Issue | Minor / Minor | Secondary carton packaging has smudged, unreadable lot and expiration dates due to inkjet nozzle misalignment. |
| **CMP-2026-00089** | Metformin HCl Extended-Release Tablets 500mg | `MET-2024-102` | Lack of Efficacy | Major / Major | Physician reported 3 stabilized diabetic patients showed persistent postprandial hyperglycemia. Dissolution assay under review. |
| **CMP-2026-00101** | Ceftriaxone Sodium for Injection 1g | `CX-2024-088` | Adverse Drug Reaction | Critical / Critical | Hospital reported acute urticaria and dyspnea 10 mins post-IV infusion. Residual vial showed cloudy particulate. 24h FDA report triggered. |

---

### 2. Unstructured Narrative Test Files

- **`sample_api_complaint.txt`:** Demonstrates API bulk synthesis reporting an Out-of-Specification (OOS) related substance impurity for Ibuprofen Micronized Bulk API (Batch `IBU-2026-0612`).
- **`sample_email_complaint.txt`:** Demonstrates multi-line email ingestion with headers (`From:`, `Subject:`, `Hospital/Facility:`) reporting glass delamination flake particulates in Ciprofloxacin 0.2% IV Infusion Vials.
- **`sample_fdf_defect.txt`:** Finished Dosage Form (FDF) incident report detailing blister pocket delamination on secondary packaging lines.

---

## Usage in Testing & Evaluation

1. **Intake Page Presets:** The presets on the frontend (`/intake`) allow 1-click loading of these representative scenarios.
2. **Database Seeding:** Run `python scripts/seed_db.py` from the `backend/` directory to populate the local database with these 5 baseline records.
3. **Automated Testing:** Pytest test cases in `backend/tests/` utilize these scenarios to assert deterministic entity extraction and ICH Q9 risk classification.
