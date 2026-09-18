"""
Pydantic v2 Schemas for Pharma Customer Complaint Management System.
Validates all inputs, enforces 21 CFR Part 11 change rationales, and defines standard API response envelopes.
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any, Generic, TypeVar
from enum import Enum
from pydantic import BaseModel, Field, EmailStr, ConfigDict, model_validator

T = TypeVar("T")

# ==========================================
# 1. STANDARDIZED API ENVELOPE
# ==========================================

class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: str = "Operation successful"

# ==========================================
# 2. DOMAIN ENUMS
# ==========================================

class ManufacturingTypeEnum(str, Enum):
    API = "API"
    FDF = "FDF"

class SeverityEnum(str, Enum):
    MINOR = "Minor"
    MAJOR = "Major"
    CRITICAL = "Critical"

class CriticalityEnum(str, Enum):
    MINOR = "Minor"
    MAJOR = "Major"
    CRITICAL = "Critical"

class RiskLevelEnum(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class ComplaintStatusEnum(str, Enum):
    DRAFT = "Draft"
    LOGGED = "Logged"
    UNDER_REVIEW = "Under Review"
    UNDER_INVESTIGATION = "Under Investigation"
    CAPA_PENDING = "CAPA Pending"
    CLOSURE_REVIEW = "Closure Review"
    CLOSED = "Closed"
    REOPENED = "Reopened"

class InvestigationStatusEnum(str, Enum):
    NOT_INITIATED = "Not Initiated"
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    WAIVED = "Waived"

# ==========================================
# 3. REQUEST SCHEMAS
# ==========================================

class ComplaintCreateRequest(BaseModel):
    # Mandatory Regulatory Fields
    product_name: str = Field(..., min_length=2, max_length=128, description="Product commercial name")
    batch_lot_number: str = Field(..., min_length=2, max_length=64, description="Manufacturing lot or batch identifier")
    reported_defect: str = Field(..., min_length=3, description="Technical defect summary")
    complaint_description: str = Field(..., min_length=5, description="Full complaint narrative")

    # Optional Complainant Metadata
    source: str = Field("Email", max_length=32)
    complaint_date: Optional[date] = None
    customer_name: Optional[str] = Field(None, max_length=128)
    customer_organization: Optional[str] = Field(None, max_length=128)
    contact_email: Optional[str] = Field(None, max_length=128)
    contact_phone: Optional[str] = Field(None, max_length=64)
    country: str = Field("USA", max_length=64)

    # Optional Product Metadata
    product_code: Optional[str] = Field(None, max_length=64)
    manufacturing_type: ManufacturingTypeEnum = ManufacturingTypeEnum.FDF
    dosage_form: Optional[str] = Field(None, max_length=64)
    strength: Optional[str] = Field(None, max_length=64)
    manufacturing_site: Optional[str] = Field(None, max_length=128)
    market_destination: Optional[str] = Field(None, max_length=64)
    complaint_category: str = Field("Physical Defect", max_length=64)

    # Safety & Risk
    patient_involvement: bool = False
    patient_impact: str = Field("None", max_length=64)
    medical_event: bool = False
    severity: SeverityEnum = SeverityEnum.MINOR
    criticality: CriticalityEnum = CriticalityEnum.MINOR
    risk_level: RiskLevelEnum = RiskLevelEnum.LOW
    risk_priority_number: Optional[int] = Field(1, ge=1, le=125)
    ai_confidence_score: float = Field(1.0, ge=0.0, le=1.0)
    initial_assessment: Optional[str] = None
    assigned_owner: Optional[str] = Field(None, max_length=64)

    # AI Integration Payloads
    raw_input_text: Optional[str] = None
    ai_assessment_payload: Optional[Dict[str, Any]] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data

        # 1. batch_lot_number fallback from batch_number / batch
        if not data.get("batch_lot_number"):
            data["batch_lot_number"] = data.get("batch_number") or data.get("batch") or "UNKNOWN-BATCH"

        # 2. complaint_description fallback from description
        if not data.get("complaint_description"):
            data["complaint_description"] = data.get("description") or data.get("raw_text") or "Complaint reported without extended narrative."

        # 3. reported_defect fallback from title / complaint_type / category
        if not data.get("reported_defect"):
            data["reported_defect"] = data.get("title") or data.get("complaint_type") or data.get("complaint_category") or data.get("defect") or "Defect reported"

        # 4. Complainant details
        if not data.get("customer_name"):
            data["customer_name"] = data.get("complainant_name") or data.get("customer")
        if not data.get("customer_organization"):
            data["customer_organization"] = data.get("complainant_organization")
        if not data.get("contact_email") and data.get("complainant_contact") and "@" in str(data.get("complainant_contact")):
            data["contact_email"] = data.get("complainant_contact")
        elif not data.get("contact_phone") and data.get("complainant_contact"):
            data["contact_phone"] = str(data.get("complainant_contact"))

        # 5. Normalize manufacturing_type enum
        mfg = str(data.get("manufacturing_type", "FDF")).strip().upper()
        if "API" in mfg or "BULK" in mfg or "RAW" in mfg:
            data["manufacturing_type"] = ManufacturingTypeEnum.API.value
        else:
            data["manufacturing_type"] = ManufacturingTypeEnum.FDF.value

        # 6. Normalize severity enum (Minor, Major, Critical)
        sev = str(data.get("severity", "Minor")).strip().title()
        if sev in ["High", "Major"]:
            data["severity"] = SeverityEnum.MAJOR.value
        elif sev in ["Critical"]:
            data["severity"] = SeverityEnum.CRITICAL.value
        else:
            data["severity"] = SeverityEnum.MINOR.value

        # 7. Normalize criticality enum (Minor, Major, Critical)
        crit = str(data.get("criticality", "Minor")).strip().title()
        if crit in ["Critical"]:
            data["criticality"] = CriticalityEnum.CRITICAL.value
        elif crit in ["Major", "High"]:
            data["criticality"] = CriticalityEnum.MAJOR.value
        else:
            data["criticality"] = CriticalityEnum.MINOR.value

        # 8. Normalize risk_level enum
        risk = str(data.get("risk_level", "Low")).strip().title()
        if risk in ["Critical"]:
            data["risk_level"] = RiskLevelEnum.CRITICAL.value
        elif risk in ["High"]:
            data["risk_level"] = RiskLevelEnum.HIGH.value
        elif risk in ["Medium"]:
            data["risk_level"] = RiskLevelEnum.MEDIUM.value
        else:
            data["risk_level"] = RiskLevelEnum.LOW.value

        return data

class CAPACreateRequest(BaseModel):
    capa_type: str = Field("Corrective Action", description="Type: Corrective Action or Preventive Action")
    description: str = Field(..., min_length=3, description="Detailed action description")
    owner: Optional[str] = Field(None, description="Action owner or department")
    target_completion_date: Optional[datetime] = Field(None, description="Target completion deadline")
    effectiveness_criteria: Optional[str] = Field(None, description="Verification criteria")

class ComplaintUpdateRequest(BaseModel):
    # Editable Fields
    product_name: Optional[str] = Field(None, max_length=128)
    product_code: Optional[str] = Field(None, max_length=64)
    dosage_form: Optional[str] = Field(None, max_length=64)
    strength: Optional[str] = Field(None, max_length=64)
    batch_lot_number: Optional[str] = Field(None, max_length=64)
    manufacturing_site: Optional[str] = Field(None, max_length=128)
    customer_name: Optional[str] = Field(None, max_length=128)
    customer_organization: Optional[str] = Field(None, max_length=128)
    contact_email: Optional[str] = Field(None, max_length=128)
    contact_phone: Optional[str] = Field(None, max_length=64)
    complaint_category: Optional[str] = Field(None, max_length=64)
    reported_defect: Optional[str] = None
    complaint_description: Optional[str] = None
    severity: Optional[SeverityEnum] = None
    criticality: Optional[CriticalityEnum] = None
    risk_level: Optional[RiskLevelEnum] = None
    risk_priority_number: Optional[int] = Field(None, ge=1, le=125)
    patient_involvement: Optional[bool] = None
    patient_impact: Optional[str] = None
    medical_event: Optional[bool] = None
    assigned_owner: Optional[str] = None
    investigation_status: Optional[InvestigationStatusEnum] = None

    # Mandatory 21 CFR Part 11 Audit Rationale
    change_reason: str = Field(..., min_length=3, description="Mandatory regulatory reason for update")

class ComplaintStatusUpdateRequest(BaseModel):
    new_status: ComplaintStatusEnum = Field(..., description="Target lifecycle state")
    change_reason: str = Field(..., min_length=3, description="Mandatory regulatory reason for state transition")
    user_id: str = Field("QA-OPERATOR-01", description="Authorizing user ID")

class ComplaintDeleteRequest(BaseModel):
    reason: str = Field(..., min_length=5, description="Mandatory regulatory reason for voiding or deleting complaint")

# ==========================================
# 4. RESPONSE SCHEMAS
# ==========================================

class AuditEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    complaint_id: str
    entity_name: str
    field_name: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    action: str
    user_id: str
    change_reason: str
    timestamp: datetime

class ComplaintAttachmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    file_name: str
    file_type: str
    file_size_bytes: int
    raw_extracted_text: Optional[str] = None
    file_hash_sha256: Optional[str] = None
    uploaded_at: datetime

class InvestigationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    investigation_number: str
    investigation_status: str
    problem_statement: Optional[str] = None
    root_cause_category: Optional[str] = None
    root_cause_narrative: Optional[str] = None
    five_whys_analysis: Optional[List[Dict[str, Any]]] = None
    retain_sample_tested: bool
    retain_sample_result: Optional[str] = None
    assigned_investigator: Optional[str] = None
    target_completion_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class CAPAResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    capa_number: str
    capa_type: str
    description: str
    action_owner: Optional[str] = None
    target_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    effectiveness_criteria: Optional[str] = None
    verification_status: str
    status: str

class ComplaintSummaryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    received_date: datetime
    complaint_date: Optional[date] = None
    product_name: str
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    batch_lot_number: str
    manufacturing_type: str
    complaint_category: str
    reported_defect: str
    criticality: str
    severity: str
    risk_level: str
    complaint_status: str
    assigned_owner: Optional[str] = None
    patient_involvement: bool = False
    customer_organization: Optional[str] = None

    # Frontend compatibility aliases
    complaint_id: Optional[str] = None
    batch_number: Optional[str] = None
    complaint_type: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    title: Optional[str] = None
    description: Optional[str] = None

    @model_validator(mode="after")
    def populate_summary_aliases(self) -> "ComplaintSummaryItem":
        if not self.complaint_id:
            self.complaint_id = self.id
        if not self.batch_number:
            self.batch_number = self.batch_lot_number
        if not self.complaint_type:
            self.complaint_type = self.complaint_category or self.reported_defect
        if not self.status:
            self.status = self.complaint_status
        if not self.created_at:
            self.created_at = self.received_date
        if not self.title:
            self.title = self.reported_defect
        if not self.description:
            self.description = self.reported_defect
        return self

class ComplaintDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    complaint_date: Optional[date] = None
    received_date: datetime
    source: str
    customer_name: Optional[str] = None
    customer_organization: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    country: str
    product_name: str
    product_code: Optional[str] = None
    manufacturing_type: str
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    batch_lot_number: str
    manufacturing_site: Optional[str] = None
    market_destination: Optional[str] = None
    complaint_category: str
    complaint_description: str
    reported_defect: str
    patient_involvement: bool = False
    patient_impact: str
    medical_event: bool = False
    severity: str
    criticality: str
    risk_level: str
    risk_priority_number: Optional[int] = None
    ai_confidence_score: float
    initial_assessment: Optional[str] = None
    investigation_status: str
    complaint_status: str
    duplicate_probability: Optional[float] = None
    similar_complaint_ids: Optional[List[str]] = None
    assigned_owner: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    closure_date: Optional[datetime] = None

    attachments: List[ComplaintAttachmentResponse] = []
    investigation: Optional[InvestigationResponse] = None
    capas: List[CAPAResponse] = []
    audit_logs: List[AuditEventResponse] = []

    # Frontend compatibility aliases
    complaint_id: Optional[str] = None
    batch_number: Optional[str] = None
    complaint_type: Optional[str] = None
    status: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    audit_events: List[AuditEventResponse] = []

    @model_validator(mode="after")
    def populate_detail_aliases(self) -> "ComplaintDetailResponse":
        if not self.complaint_id:
            self.complaint_id = self.id
        if not self.batch_number:
            self.batch_number = self.batch_lot_number
        if not self.complaint_type:
            self.complaint_type = self.complaint_category or self.reported_defect
        if not self.status:
            self.status = self.complaint_status
        if not self.title:
            self.title = self.reported_defect
        if not self.description:
            self.description = self.complaint_description
        if not self.audit_events and self.audit_logs:
            self.audit_events = list(self.audit_logs)
        return self

class PaginatedComplaintsResponse(BaseModel):
    items: List[ComplaintSummaryItem]
    total: int
    page: int
    limit: int
    total_pages: int

class DashboardMetrics(BaseModel):
    total_active_complaints: int = 0
    critical_risk_alerts: int = 0
    average_cycle_time_days: float = 0.0
    pending_capa_actions: int = 0
    risk_distribution: Dict[str, int] = Field(default_factory=dict)
    category_distribution: Dict[str, int] = Field(default_factory=dict)
    status_distribution: Dict[str, int] = Field(default_factory=dict)

    # Frontend compatibility metrics
    total_complaints: int = 0
    closed_complaints: int = 0
    by_criticality: Dict[str, int] = Field(default_factory=dict)
    by_status: Dict[str, int] = Field(default_factory=dict)

class FileUploadResponse(BaseModel):
    attachment_id: str
    file_name: str
    file_type: str
    file_size_bytes: int
    file_hash_sha256: str
    extracted_text: Optional[str] = None
    is_parsed: bool
    message: str

# ==========================================
# 5. AI COPILOT STRUCTURED SCHEMAS
# ==========================================

class StructuredAIAnalysisSchema(BaseModel):
    product: str
    batch: str
    customer: str
    category: str
    description: str
    severity: str
    criticality: str
    risk_level: str
    patient_impact: str
    completeness: Dict[str, Any]
    missing_information: List[Any] = Field(default_factory=list)
    risk_factors: Dict[str, Any] = Field(default_factory=dict)
    duplicate_detection: Dict[str, Any] = Field(default_factory=dict)
    root_cause_recommendations: Dict[str, Any] = Field(default_factory=dict)
    capa_recommendations: Dict[str, Any] = Field(default_factory=dict)
    summary: str

    ai_provider: str
    execution_mode: str
    model_used: str
    runtime_model: str
    assignment_requested_model: str

    metadata: Dict[str, Any] = Field(default_factory=dict)
    confidence_score: Optional[float] = 0.95
    completeness_score: Optional[float] = 0.9
    extracted_fields: Dict[str, Any] = Field(default_factory=dict)
    complaint: Dict[str, Any] = Field(default_factory=dict)
    risk_assessment: Dict[str, Any] = Field(default_factory=dict)
    root_cause_analysis: Dict[str, Any] = Field(default_factory=dict)
    recommendations: Dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(extra="allow")

class AIStatusResponse(BaseModel):
    is_configured: bool
    runtime_model: str
    primary_model: str
    assignment_requested_model: str
    reasoning_model: str
    model_compatibility_note: str

