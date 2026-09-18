# Phase 1: RESTful API Contract Specification
## AI-Powered Customer Complaint Management System for Pharmaceutical Manufacturing

---

## 1. Overview & Standard Conventions

The backend is built with **FastAPI** adhering to OpenAPI 3.1 specifications. 

### Global Standards:
- **Base URL:** `/api`
- **Content-Type:** `application/json` (except document upload which uses `multipart/form-data`)
- **Authentication Header (Prepared for Phase 2/Production):** `Authorization: Bearer <JWT>`
- **Error Response Standard (RFC 7807 Problem Details):**
  ```json
  {
    "error_code": "RESOURCE_NOT_FOUND",
    "message": "Complaint with ID CMP-2026-00999 was not found in the QMS repository.",
    "timestamp": "2026-09-18T05:56:00Z",
    "details": null
  }
  ```

---

## 2. API Endpoint Matrix

| Method | Endpoint | Description | Primary Consumers |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health, Groq connectivity & DB status | Infrastructure / Settings |
| `GET` | `/api/complaints/metrics` | Aggregated KPI metrics for dashboard | Dashboard |
| `POST` | `/api/complaints` | Register a verified complaint into official QMS | Review / Form Submission |
| `GET` | `/api/complaints` | Filterable, paginated query of complaints | History / Action Queue |
| `GET` | `/api/complaints/{id}` | Detailed complaint profile with attachments & AI runs | Detail Workspace |
| `PUT` | `/api/complaints/{id}` | Update complaint fields (requires audit rationale) | Edit Workspace |
| `DELETE` | `/api/complaints/{id}` | Soft-delete / Void complaint (requires QA rationale) | QA Admin |
| `POST` | `/api/complaints/{id}/status` | Transition complaint lifecycle state | Quality Unit Approval |
| `GET` | `/api/complaints/{id}/audit-trail` | Retrieve 21 CFR Part 11 immutable audit logs | Quality Auditor |
| `POST` | `/api/ai/analyze-text` | Full LangGraph pipeline on raw text/email | Intake Copilot |
| `POST` | `/api/ai/analyze-document` | Upload file (.pdf, .txt, .png) and run pipeline | Intake Copilot |
| `POST` | `/api/ai/completeness` | Standalone completeness check on payload | Form Real-time Validation |
| `POST` | `/api/ai/risk-assessment` | Standalone ICH Q9 risk re-calculation | Risk Override Modal |
| `POST` | `/api/ai/duplicate-check` | Query database for batch/defect similarity | Intake & Detail Views |
| `POST` | `/api/ai/root-cause` | Generate 6M Ishikawa & 5-Whys hypotheses | Investigation Workspace |
| `POST` | `/api/ai/capa` | Generate containment & CAPA action plans | CAPA Workspace |

---

## 3. Core Endpoint Specifications

---

### 3.1 System Health & Diagnostics

#### `GET /api/health`
Checks server, database connection pool, and Groq LLM API responsiveness.

- **Request:** None
- **Response `200 OK`:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "dialect": "postgresql",
    "active_pool_connections": 3
  },
  "ai_engine": {
    "provider": "Groq",
    "primary_model": "gemma2-9b-it",
    "contextual_model": "llama-3.3-70b-versatile",
    "status": "online",
    "latency_ms": 284
  },
  "timestamp": "2026-09-18T05:56:00Z"
}
```

---

### 3.2 AI Analysis Pipeline Endpoints

#### `POST /api/ai/analyze-text`
Executes the full LangGraph pipeline on an unstructured customer text or pasted email thread.

- **Request Body:**
```json
{
  "raw_text": "Subject: Urgent: Defective Blister Packaging on Amoxicillin 500mg (Batch BX-2026-091)\nFrom: sjenkins@stjude-pharma.org\nDate: September 17, 2026\n\nDear Quality Department,\nDuring routine unit-dose packaging check at St. Jude Hospital Pharmacy, our pharmacist noticed that several blister cards of Amoxicillin 500mg Capsules, Lot BX-2026-091 (Exp 11/2027), had loose foil seals with microscopic pinholes. Three capsules inside showed discoloration from moisture absorption. The units were quarantined immediately prior to patient distribution.\n\nSincerely,\nDr. Sarah Jenkins, Chief Pharmacist\nSt. Jude Memorial Hospital, USA\nPhone: +1-555-019-2834",
  "source_type": "email"
}
```

- **Response `200 OK`:**
```json
{
  "complaint": {
    "complainant": {
      "customer_name": "Dr. Sarah Jenkins",
      "customer_organization": "St. Jude Memorial Hospital",
      "contact_email": "sjenkins@stjude-pharma.org",
      "contact_phone": "+1-555-019-2834",
      "country": "USA",
      "reporter_role": "Pharmacist"
    },
    "product_batch": {
      "product_name": "Amoxicillin Capsules",
      "product_code": null,
      "manufacturing_type": "FDF",
      "dosage_form": "Capsule",
      "strength": "500 mg",
      "batch_lot_number": "BX-2026-091",
      "expiration_date": "2027-11-30",
      "manufacturing_site": null,
      "market_destination": "USA"
    },
    "defect": {
      "category": "Packaging Defect",
      "reported_defect": "Loose blister foil seals with micro-pinholes and moisture-induced capsule discoloration",
      "detailed_description": "Pharmacist noticed loose foil seals with microscopic pinholes along sealing tracks. Three capsules showed moisture-induced discoloration.",
      "affected_quantity": "Multiple blister cards",
      "sample_available": true
    },
    "patient_safety": {
      "patient_involved": false,
      "patient_impact": "None",
      "medical_event": false,
      "event_narrative": "Quarantined immediately prior to patient distribution."
    },
    "confidence_score": 0.96
  },
  "completeness": {
    "completeness_score": 92.0,
    "is_ready_for_logging": true,
    "missing_mandatory_fields": [],
    "missing_recommended_fields": [
      "Exact quantity of affected units"
    ],
    "clarification_questions": [
      "Please confirm the exact number of defective blister cards identified."
    ]
  },
  "risk_assessment": {
    "severity": "Major",
    "criticality": "Major",
    "risk_level": "Medium",
    "scoring": {
      "severity_score": 3,
      "occurrence_score": 2,
      "detectability_score": 2,
      "rpn": 12
    },
    "clinical_rationale": "Microbial/moisture ingress into antibiotic capsules causes loss of potency and degradation. Intercepted prior to patient administration.",
    "regulatory_alert_required": false,
    "target_investigation_days": 30
  },
  "duplicate_detection": {
    "is_duplicate": false,
    "duplicate_probability": 0.15,
    "matched_complaints": [],
    "batch_clustering_detected": false,
    "clustering_signal_summary": "First complaint on batch BX-2026-091."
  },
  "recommendations": {
    "summary": "Packaging seal integrity failure for Amoxicillin 500mg (Batch BX-2026-091). Quarantined at hospital pharmacy.",
    "root_cause": {
      "primary_category": "Machine (Equipment / Calibration)",
      "probable_root_causes": [
        "Knurling roller temperature drop on packaging line",
        "Uneven sealing pressure"
      ],
      "five_whys_framework": [
        {
          "step": 1,
          "question": "Why did capsule discolor?",
          "answer": "Moisture entered blister cavity."
        }
      ],
      "recommended_testing": [
        "Methylene Blue Dye leak test",
        "Assay and moisture testing"
      ]
    },
    "capa": {
      "immediate_containment": [
        "Place warehouse inventory of Batch BX-2026-091 on Quality Quarantine hold"
      ],
      "corrective_actions": [
        {
          "action_type": "Corrective Action",
          "description": "Recalibrate sealing station thermocouples",
          "target_owner_department": "Packaging Maintenance",
          "timeline_days": 7,
          "effectiveness_check": "Conduct 24h temperature data logger run"
        }
      ],
      "preventive_actions": [
        {
          "action_type": "Preventive Action",
          "description": "Install automated seal vision system",
          "target_owner_department": "Engineering",
          "timeline_days": 30,
          "effectiveness_check": "Zero pinhole defects over 5 consecutive batches"
        }
      ]
    }
  },
  "metadata": {
    "model_name": "gemma2-9b-it",
    "fallback_model_used": null,
    "total_execution_time_ms": 1340,
    "overall_confidence": 0.96,
    "timestamp": "2026-09-18T05:56:05Z"
  }
}
```

---

#### `POST /api/ai/analyze-document`
Accepts a document upload via `multipart/form-data`, extracts text, and triggers the LangGraph pipeline.

- **Request:**
  - `file`: Binary file (.pdf, .txt, .png, .jpg)
  - `source_type`: Optional string (`"document"` or `"lab_report"`)
- **Response `200 OK`:** Same schema as `/api/ai/analyze-text` plus `attachment_metadata` (file name, size, SHA-256 hash).

---

### 3.3 Complaint Management Endpoints

#### `POST /api/complaints`
Registers an officially reviewed complaint into the database. Generates the sequential `CMP-YYYY-XXXXX` tracking identifier and initializes the audit trail.

- **Request Body:**
```json
{
  "source": "Email",
  "complaint_date": "2026-09-17",
  "customer_name": "Dr. Sarah Jenkins",
  "customer_organization": "St. Jude Memorial Hospital",
  "contact_email": "sjenkins@stjude-pharma.org",
  "contact_phone": "+1-555-019-2834",
  "country": "USA",
  "product_name": "Amoxicillin Capsules",
  "product_code": "AMX-500",
  "manufacturing_type": "FDF",
  "dosage_form": "Capsule",
  "strength": "500 mg",
  "batch_lot_number": "BX-2026-091",
  "manufacturing_site": "Plant 1 - Blister Packaging",
  "market_destination": "USA",
  "complaint_category": "Packaging Defect",
  "complaint_description": "Loose foil seals with pinholes causing capsule discoloration.",
  "reported_defect": "Blister seal pinholes and capsule discoloration",
  "patient_involvement": false,
  "patient_impact": "None",
  "medical_event": false,
  "severity": "Major",
  "criticality": "Major",
  "risk_level": "Medium",
  "risk_priority_number": 12,
  "ai_confidence_score": 0.96,
  "initial_assessment": "Packaging integrity failure intercepted prior to patient administration.",
  "raw_input_text": "... full text ...",
  "ai_assessment_payload": { ... full AI composite object ... }
}
```

- **Response `201 Created`:**
```json
{
  "id": "CMP-2026-00104",
  "complaint_status": "Logged",
  "received_date": "2026-09-18T05:56:10Z",
  "created_at": "2026-09-18T05:56:10Z",
  "message": "Complaint successfully registered in QMS repository."
}
```

---

#### `GET /api/complaints`
Queries complaint records with pagination, sorting, and multi-field filtering.

- **Query Parameters:**
  - `page`: Integer (default: 1)
  - `limit`: Integer (default: 10, max: 100)
  - `search`: String (searches ID, product, batch, defect, customer)
  - `status`: String (`Logged`, `Under Investigation`, `CAPA Pending`, `Closed`)
  - `criticality`: String (`Critical`, `Major`, `Minor`)
  - `manufacturing_type`: String (`API`, `FDF`)
  - `batch_number`: String
  - `date_from`: ISO Date (`YYYY-MM-DD`)
  - `date_to`: ISO Date (`YYYY-MM-DD`)
- **Response `200 OK`:**
```json
{
  "items": [
    {
      "id": "CMP-2026-00104",
      "received_date": "2026-09-18T05:56:10Z",
      "product_name": "Amoxicillin Capsules",
      "strength": "500 mg",
      "batch_lot_number": "BX-2026-091",
      "complaint_category": "Packaging Defect",
      "reported_defect": "Blister seal pinholes and capsule discoloration",
      "criticality": "Major",
      "severity": "Major",
      "complaint_status": "Logged",
      "assigned_owner": "John Doe, QA Lead",
      "patient_involvement": false
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "total_pages": 5
}
```

---

#### `GET /api/complaints/{id}`
Returns complete 360-degree view of a single complaint including its attachments, latest AI evaluation, linked investigation, CAPAs, and status.

- **Response `200 OK`:** Returns full `ComplaintDetailModel`.
- **Response `404 Not Found`:** Standard error payload if ID does not exist.

---

#### `PUT /api/complaints/{id}`
Updates editable complaint fields. Mandatory 21 CFR Part 11 compliant `change_reason` must be provided in the request body.

- **Request Body:**
```json
{
  "product_code": "AMX-500-REV2",
  "manufacturing_site": "Plant 2 - Packaging Unit B",
  "change_reason": "Corrected manufacturing packaging line following ERP verification."
}
```
- **Response `200 OK`:** Updated complaint record. Automatically creates entry in `audit_logs`.

---

#### `POST /api/complaints/{id}/status`
Executes an official lifecycle state transition.

- **Request Body:**
```json
{
  "new_status": "Under Investigation",
  "change_reason": "Retain samples requested from warehouse and assigned to analytical chemist.",
  "user_id": "QA-SPECIALIST-04"
}
```
- **Response `200 OK`:**
```json
{
  "id": "CMP-2026-00104",
  "previous_status": "Logged",
  "current_status": "Under Investigation",
  "updated_at": "2026-09-18T05:57:00Z"
}
```

---

#### `GET /api/complaints/{id}/audit-trail`
Returns the tamper-evident chronological ledger of all modifications.

- **Response `200 OK`:**
```json
{
  "complaint_id": "CMP-2026-00104",
  "audit_trail": [
    {
      "id": "a9b8c7d6-0001",
      "timestamp": "2026-09-18T05:56:10Z",
      "action": "CREATE",
      "entity_name": "complaints",
      "field_name": "all",
      "old_value": null,
      "new_value": "CMP-2026-00104 created",
      "user_id": "QA-HANDLER-01",
      "change_reason": "Initial complaint intake via email"
    },
    {
      "id": "a9b8c7d6-0002",
      "timestamp": "2026-09-18T05:57:00Z",
      "action": "STATUS_CHANGE",
      "entity_name": "complaints",
      "field_name": "complaint_status",
      "old_value": "Logged",
      "new_value": "Under Investigation",
      "user_id": "QA-SPECIALIST-04",
      "change_reason": "Retain samples requested from warehouse and assigned to analytical chemist."
    }
  ]
}
```
