# Phase 1: Structured AI Schema Specification
## AI-Powered Customer Complaint Management System for Pharmaceutical Manufacturing

---

## 1. Overview & Predictability Architecture

In a pharmaceutical regulatory context, non-deterministic or unvalidated LLM output is unacceptable. Every output produced by the AI Agent pipeline (orchestrated via **LangGraph** on **Groq**) must strictly conform to strongly typed **Pydantic v2 schemas**.

This document defines the schemas for:
1. **Complaint Extraction** (`ComplaintExtractionSchema`)
2. **Completeness Verification** (`CompletenessCheckSchema`)
3. **Quality Risk Management (ICH Q9)** (`RiskAssessmentSchema`)
4. **Duplicate & Trend Detection** (`DuplicateDetectionSchema`)
5. **Root Cause & Investigation** (`RootCauseRecommendationSchema`)
6. **Corrective & Preventive Action (CAPA)** (`CAPARecommendationSchema`)
7. **Unified Composite AI Response** (`CompositeAIResponseSchema`)

---

## 2. High-Level Composite Schema

All discrete AI evaluations are unified into a single composite payload returned by the LangGraph agent:

```json
{
  "complaint": { ... },
  "completeness": { ... },
  "risk_assessment": { ... },
  "duplicate_detection": { ... },
  "recommendations": {
    "summary": "...",
    "root_cause": { ... },
    "capa": { ... }
  },
  "metadata": {
    "model_name": "gemma2-9b-it",
    "total_execution_time_ms": 1420,
    "overall_confidence": 0.94
  }
}
```

---

## 3. Pydantic v2 Code Specifications

```python
"""
Pydantic v2 Schemas for AI Agents in Pharma Complaint Management.
Strict typing, validation rules, enums, and JSON Schema generation.
"""

from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field, EmailStr, field_validator

# ==========================================
# 1. DOMAIN ENUMS
# ==========================================

class ManufacturingTypeEnum(str, Enum):
    API = "API"  # Active Pharmaceutical Ingredient
    FDF = "FDF"  # Finished Dosage Form

class SeverityEnum(str, Enum):
    MINOR = "Minor"
    MAJOR = "Major"
    CRITICAL = "Critical"

class CriticalityEnum(str, Enum):
    MINOR = "Minor"      # Class III equivalent
    MAJOR = "Major"      # Class II equivalent
    CRITICAL = "Critical"# Class I equivalent (recall/quarantine risk)

class PatientImpactEnum(str, Enum):
    NONE = "None"
    MINOR = "Minor Symptoms"
    SEVERE = "Severe Illness"
    LIFE_THREATENING = "Life-Threatening"
    FATAL = "Fatal"

class ComplaintCategoryEnum(str, Enum):
    PACKAGING = "Packaging Defect"
    PHYSICAL = "Physical Defect"
    CHEMICAL = "Chemical / Assay OOS"
    MICROBIAL = "Microbial Contamination"
    LABELING = "Labeling / Artwork Error"
    CLINICAL = "Lack of Efficacy / ADE"
    COUNTERFEIT = "Counterfeit / Tampering Suspect"

class IshikawaCategoryEnum(str, Enum):
    MAN = "Man (Personnel / Training)"
    MACHINE = "Machine (Equipment / Calibration)"
    METHOD = "Method (SOP / Procedure)"
    MATERIAL = "Material (Raw Material / Excipient)"
    MEASUREMENT = "Measurement (QC Testing / Analytical)"
    ENVIRONMENT = "Environment (Cleanroom / Storage)"

# ==========================================
# 2. EXTRACTION SCHEMA
# ==========================================

class ComplainantInfo(BaseModel):
    customer_name: Optional[str] = Field(None, description="Full name of person reporting the complaint")
    customer_organization: Optional[str] = Field(None, description="Hospital, clinic, distributor, or pharmacy name")
    contact_email: Optional[str] = Field(None, description="Contact email address")
    contact_phone: Optional[str] = Field(None, description="Contact phone number")
    country: str = Field("USA", description="Country where complaint originated")
    reporter_role: Optional[str] = Field(None, description="Patient, Pharmacist, Physician, Distributor, or Wholesaler")

class ProductBatchInfo(BaseModel):
    product_name: str = Field(..., description="Commercial trade name of the pharmaceutical product")
    product_code: Optional[str] = Field(None, description="Internal product SKU, NDC, or material number")
    manufacturing_type: ManufacturingTypeEnum = Field(
        ManufacturingTypeEnum.FDF, description="Active Pharmaceutical Ingredient (API) or Finished Dosage Form (FDF)"
    )
    dosage_form: Optional[str] = Field(None, description="Tablet, Capsule, Sterile Injection, Oral Suspension, Bulk Powder")
    strength: Optional[str] = Field(None, description="Strength or concentration (e.g. 500 mg, 10 mg/mL, 99.5% Assay)")
    batch_lot_number: str = Field(..., description="Manufacturing lot or batch identifier (Mandatory regulatory field)")
    expiration_date: Optional[str] = Field(None, description="Stated expiration date (YYYY-MM-DD or MM/YYYY)")
    manufacturing_site: Optional[str] = Field(None, description="Manufacturing facility or plant location")
    market_destination: Optional[str] = Field(None, description="Intended market distribution jurisdiction")

class DefectReport(BaseModel):
    category: ComplaintCategoryEnum = Field(..., description="Primary defect classification")
    reported_defect: str = Field(..., description="Concise, normalized technical summary of the defect")
    detailed_description: str = Field(..., description="Verbatim or detailed account of the reported incident")
    affected_quantity: Optional[str] = Field(None, description="Number of defective units, packs, blisters, or drums")
    sample_available: bool = Field(False, description="Whether customer has retained or will return defective sample for lab QC")

class PatientImpactReport(BaseModel):
    patient_involved: bool = Field(False, description="Whether the drug was dispensed to or taken by a patient")
    patient_impact: PatientImpactEnum = Field(PatientImpactEnum.NONE, description="Clinical outcome or severity of symptoms")
    medical_event: bool = Field(False, description="Whether an adverse drug experience (ADE) occurred requiring pharmacovigilance logging")
    event_narrative: Optional[str] = Field(None, description="Description of clinical symptoms, hospitalization, or treatment required")

class ComplaintExtractionSchema(BaseModel):
    complainant: ComplainantInfo
    product_batch: ProductBatchInfo
    defect: DefectReport
    patient_safety: PatientImpactReport
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Overall confidence of entity extraction")

# ==========================================
# 3. COMPLETENESS CHECK SCHEMA
# ==========================================

class CompletenessCheckSchema(BaseModel):
    completeness_score: float = Field(..., ge=0.0, le=100.0, description="Percentage of regulatory required data present")
    is_ready_for_logging: bool = Field(..., description="True if mandatory fields (Product, Batch, Defect, Contact) are present")
    missing_mandatory_fields: List[str] = Field(default_factory=list, description="List of regulatory required fields missing")
    missing_recommended_fields: List[str] = Field(default_factory=list, description="List of recommended fields missing for thorough investigation")
    clarification_questions: List[str] = Field(default_factory=list, description="Actionable follow-up questions to send to complainant")

# ==========================================
# 4. QUALITY RISK ASSESSMENT SCHEMA (ICH Q9)
# ==========================================

class RiskScoringMatrix(BaseModel):
    severity_score: int = Field(..., ge=1, le=5, description="1: Negligible, 2: Minor, 3: Moderate, 4: Major, 5: Critical/Catastrophic")
    occurrence_score: int = Field(..., ge=1, le=5, description="1: Rare, 2: Unlikely, 3: Moderate, 4: Frequent, 5: Continuous")
    detectability_score: int = Field(..., ge=1, le=5, description="1: Immediate detection, 3: QC testing required, 5: Undetectable before patient use")
    rpn: int = Field(..., ge=1, le=125, description="Risk Priority Number = Severity * Occurrence * Detectability")

class RiskAssessmentSchema(BaseModel):
    severity: SeverityEnum = Field(..., description="Technical defect severity")
    criticality: CriticalityEnum = Field(..., description="Class I, II, III recall risk tier")
    risk_level: str = Field(..., description="Low, Medium, High, Critical")
    scoring: RiskScoringMatrix
    clinical_rationale: str = Field(..., description="Pharmacological and quality rationale for the assigned risk level")
    regulatory_alert_required: bool = Field(False, description="True if 15-day FDA Alert / EU Rapid Alert is triggered")
    target_investigation_days: int = Field(30, description="Regulatory compliance window for completing investigation (e.g., 30 days)")

# ==========================================
# 5. DUPLICATE & TREND DETECTION SCHEMA
# ==========================================

class DuplicateMatch(BaseModel):
    complaint_id: str = Field(..., description="Matched historical complaint identifier")
    similarity_score: float = Field(..., ge=0.0, le=1.0, description="Cosine or composite similarity metric")
    match_reasons: List[str] = Field(..., description="E.g., Identical batch, identical defect, same facility")

class DuplicateDetectionSchema(BaseModel):
    is_duplicate: bool = Field(False, description="Whether this complaint is an exact duplicate report of an existing case")
    duplicate_probability: float = Field(0.0, ge=0.0, le=1.0)
    matched_complaints: List[DuplicateMatch] = Field(default_factory=list)
    batch_clustering_detected: bool = Field(False, description="True if 3 or more complaints exist against the same batch")
    clustering_signal_summary: Optional[str] = Field(None, description="Summary of batch trend for QA alert")

# ==========================================
# 6. INVESTIGATION & CAPA RECOMMENDATIONS
# ==========================================

class FiveWhysItem(BaseModel):
    step: int = Field(..., ge=1, le=5)
    question: str = Field(..., description="Why did this event or condition occur?")
    answer: str = Field(..., description="Underlying causal factor identified")

class RootCauseRecommendationSchema(BaseModel):
    primary_category: IshikawaCategoryEnum = Field(..., description="Primary 6M Ishikawa classification")
    probable_root_causes: List[str] = Field(..., description="List of ranked potential root causes")
    five_whys_framework: List[FiveWhysItem] = Field(default_factory=list, description="Preliminary 5-Whys causal chain")
    recommended_testing: List[str] = Field(..., description="Suggested lab tests (e.g. HPLC Assay, Dissolution, Sterility, SEM)")

class CAPAActionItem(BaseModel):
    action_type: str = Field(..., description="Containment, Corrective Action, or Preventive Action")
    description: str = Field(..., description="Concrete task description")
    target_owner_department: str = Field(..., description="E.g. Manufacturing, Packaging, Quality Control, Facilities")
    timeline_days: int = Field(..., description="Target completion timeline in calendar days")
    effectiveness_check: str = Field(..., description="Protocol for verifying that action successfully prevented recurrence")

class CAPARecommendationSchema(BaseModel):
    immediate_containment: List[str] = Field(..., description="Quarantine actions, warehouse holds, customer return requests")
    corrective_actions: List[CAPAActionItem] = Field(default_factory=list)
    preventive_actions: List[CAPAActionItem] = Field(default_factory=list)

class RecommendationsSummary(BaseModel):
    complaint_summary: str = Field(..., description="Executive 2-sentence summary of complaint for management review")
    root_cause: RootCauseRecommendationSchema
    capa: CAPARecommendationSchema

# ==========================================
# 7. UNIFIED COMPOSITE AI RESPONSE SCHEMA
# ==========================================

class ExecutionMetadata(BaseModel):
    model_name: str = Field("gemma2-9b-it", description="Primary model used for inference")
    fallback_model_used: Optional[str] = Field(None, description="Model used if fallback was engaged (e.g. llama-3.3-70b-versatile)")
    total_execution_time_ms: int = Field(..., description="Total pipeline latency in milliseconds")
    overall_confidence: float = Field(..., ge=0.0, le=1.0)
    timestamp: str = Field(..., description="UTC ISO 8601 timestamp")

class CompositeAIResponseSchema(BaseModel):
    complaint: ComplaintExtractionSchema
    completeness: CompletenessCheckSchema
    risk_assessment: RiskAssessmentSchema
    duplicate_detection: DuplicateDetectionSchema
    recommendations: RecommendationsSummary
    metadata: ExecutionMetadata
```

---

## 4. Concrete Example: Unified Structured Output

Below is an authentic sample of the JSON payload produced by the LangGraph agent for an FDF blister leak complaint:

```json
{
  "complaint": {
    "complainant": {
      "customer_name": "Dr. Sarah Jenkins",
      "customer_organization": "St. Jude Memorial Hospital Pharmacy",
      "contact_email": "sjenkins@stjude-pharma.org",
      "contact_phone": "+1-555-019-2834",
      "country": "USA",
      "reporter_role": "Pharmacist"
    },
    "product_batch": {
      "product_name": "Amoxicillin Trihydrate Capsules",
      "product_code": "AMX-500-CAP",
      "manufacturing_type": "FDF",
      "dosage_form": "Capsule",
      "strength": "500 mg",
      "batch_lot_number": "BX-2026-091",
      "expiration_date": "2027-11-30",
      "manufacturing_site": "Site 2 - Packaging Facility C",
      "market_destination": "US Domestic"
    },
    "defect": {
      "category": "Packaging Defect",
      "reported_defect": "Blister pocket micro-pinholes with hydrolyzed, clumped capsule shells",
      "detailed_description": "Pharmacy received 5 cartons (50 blister cards). Card 04 showed loose foil bonding and microscopic pinholes along sealing grooves. Three capsules absorbed ambient moisture, became sticky, and discolored from white to pale brown.",
      "affected_quantity": "50 blister cards (500 capsules)",
      "sample_available": true
    },
    "patient_safety": {
      "patient_involved": false,
      "patient_impact": "None",
      "medical_event": false,
      "event_narrative": "Discovered during inpatient pharmacy dispensing verification prior to patient administration. Zero patient harm."
    },
    "confidence_score": 0.96
  },
  "completeness": {
    "completeness_score": 92.5,
    "is_ready_for_logging": true,
    "missing_mandatory_fields": [],
    "missing_recommended_fields": [
      "Manufacturing Date"
    ],
    "clarification_questions": [
      "Could the pharmacy confirm whether the shipping cartons showed any signs of physical crushing or high-humidity exposure during transit?"
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
    "clinical_rationale": "Degraded amoxicillin capsules exhibit diminished potency and can form penicillin-degradation allergenic products. However, defect was intercepted by hospital pharmacy before patient dispensing. Class II defect.",
    "regulatory_alert_required": false,
    "target_investigation_days": 30
  },
  "duplicate_detection": {
    "is_duplicate": false,
    "duplicate_probability": 0.35,
    "matched_complaints": [
      {
        "complaint_id": "CMP-2026-00042",
        "similarity_score": 0.68,
        "match_reasons": [
          "Same product (Amoxicillin 500mg)",
          "Packaging defect (Blister leak)",
          "Different batch (BX-2025-118)"
        ]
      }
    ],
    "batch_clustering_detected": false,
    "clustering_signal_summary": "First reported packaging defect for batch BX-2026-091."
  },
  "recommendations": {
    "summary": "Packaging integrity failure reported by St. Jude Hospital Pharmacy for Amoxicillin 500mg (Batch BX-2026-091) with moisture ingress and capsule clumping. Intercepted prior to patient administration.",
    "root_cause": {
      "primary_category": "Machine (Equipment / Calibration)",
      "probable_root_causes": [
        "Packaging Line 3 blister heat-sealing knurling roller temperature deviation below 135°C",
        "Uneven sealing pressure caused by misaligned pneumatic sealing cylinder",
        "Defective aluminum forming foil with pinhole perforation from supplier"
      ],
      "five_whys_framework": [
        {
          "step": 1,
          "question": "Why did capsule clumping occur?",
          "answer": "Moisture permeated the blister cavity."
        },
        {
          "step": 2,
          "question": "Why did moisture permeate?",
          "answer": "The aluminum foil-to-PVC seal had micro-void channels."
        },
        {
          "step": 3,
          "question": "Why were there micro-void channels in the seal?",
          "answer": "Sealing temperature dropped intermittently during the packaging run."
        },
        {
          "step": 4,
          "question": "Why did sealing temperature drop?",
          "answer": "Thermocouple heating element TC-3 had intermittent contact resistance."
        },
        {
          "step": 5,
          "question": "Why was the thermocouple defect not caught?",
          "answer": "Routine preventive maintenance check on Line 3 heating elements was overdue by 14 days."
        }
      ],
      "recommended_testing": [
        "Methylene Blue dye ingress leak testing (ASTM D4991) on retain samples of Batch BX-2026-091",
        "HPLC potency assay and moisture titration (Karl Fischer) on returned samples"
      ]
    },
    "capa": {
      "immediate_containment": [
        "Place warehouse inventory of Batch BX-2026-091 on Quality Quarantine hold",
        "Issue sample return kit to St. Jude Hospital Pharmacy for retain sample analysis"
      ],
      "corrective_actions": [
        {
          "action_type": "Corrective Action",
          "description": "Inspect, recalibrate, and replace thermocouple TC-3 on Blister Packaging Line 3",
          "target_owner_department": "Packaging Maintenance Engineering",
          "timeline_days": 7,
          "effectiveness_check": "Conduct 24-hour continuous temperature data logger study with zero drift"
        }
      ],
      "preventive_actions": [
        {
          "action_type": "Preventive Action",
          "description": "Upgrade Line 3 PLC to trigger automatic machine stoppage if sealing temperature deviates ±2°C from setpoint",
          "target_owner_department": "Automation & Controls",
          "timeline_days": 30,
          "effectiveness_check": "Challenge machine interlock with simulated temperature faults during qualification run"
        }
      ]
    }
  },
  "metadata": {
    "model_name": "gemma2-9b-it",
    "fallback_model_used": null,
    "total_execution_time_ms": 1280,
    "overall_confidence": 0.96,
    "timestamp": "2026-09-18T05:55:00Z"
  }
}
```
