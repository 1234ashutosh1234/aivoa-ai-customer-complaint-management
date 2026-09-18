"""
Complaint Service Module
Handles business logic, database transactions, sequential ID generation, and 21 CFR Part 11 audit logging.
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, and_
from app.models import Complaint, AuditEvent, AIAssessment, Investigation, CAPA
from app.schemas import (
    ComplaintCreateRequest,
    ComplaintUpdateRequest,
    ComplaintStatusUpdateRequest,
    ComplaintStatusEnum,
    DashboardMetrics,
    CAPACreateRequest,
)
from app.services.validation_service import validate_status_transition

def generate_complaint_id(db: Session) -> str:
    """
    Generates a sequential, human-readable pharmaceutical complaint tracking number.
    Format: CMP-YYYY-XXXXX (e.g. CMP-2026-00104)
    """
    current_year = datetime.utcnow().year
    prefix = f"CMP-{current_year}-"

    # Find highest existing number for this year
    latest_complaint = (
        db.query(Complaint.id)
        .filter(Complaint.id.like(f"{prefix}%"))
        .order_by(Complaint.id.desc())
        .first()
    )

    if latest_complaint and latest_complaint[0]:
        try:
            latest_seq = int(latest_complaint[0].split("-")[-1])
            new_seq = latest_seq + 1
        except ValueError:
            new_seq = 1
    else:
        new_seq = 1

    return f"{prefix}{new_seq:05d}"

def create_complaint(db: Session, request: ComplaintCreateRequest, user_id: str = "QA-OPERATOR-01") -> Complaint:
    """Creates an official complaint with sequential ID and audit event."""
    complaint_id = generate_complaint_id(db)

    complaint = Complaint(
        id=complaint_id,
        complaint_date=request.complaint_date or date.today(),
        received_date=datetime.utcnow(),
        source=request.source,
        customer_name=request.customer_name,
        customer_organization=request.customer_organization,
        contact_email=request.contact_email,
        contact_phone=request.contact_phone,
        country=request.country,
        product_name=request.product_name,
        product_code=request.product_code,
        manufacturing_type=request.manufacturing_type.value,
        dosage_form=request.dosage_form,
        strength=request.strength,
        batch_lot_number=request.batch_lot_number,
        manufacturing_site=request.manufacturing_site,
        market_destination=request.market_destination,
        complaint_category=request.complaint_category,
        complaint_description=request.complaint_description,
        reported_defect=request.reported_defect,
        patient_involvement=request.patient_involvement,
        patient_impact=request.patient_impact,
        medical_event=request.medical_event,
        severity=request.severity.value,
        criticality=request.criticality.value,
        risk_level=request.risk_level.value,
        risk_priority_number=request.risk_priority_number,
        ai_confidence_score=request.ai_confidence_score,
        initial_assessment=request.initial_assessment,
        complaint_status=ComplaintStatusEnum.LOGGED.value,
        investigation_status="Not Initiated",
        assigned_owner=request.assigned_owner,
    )
    db.add(complaint)

    # 21 CFR Part 11 Initial Audit Log
    initial_audit = AuditEvent(
        complaint_id=complaint_id,
        entity_name="complaints",
        field_name="all",
        old_value=None,
        new_value=f"Complaint registered as {complaint_id}",
        action="CREATE",
        user_id=user_id,
        change_reason="Initial complaint registration in QMS",
        timestamp=datetime.utcnow(),
    )
    db.add(initial_audit)

    # Persist AI assessment telemetry if provided
    if request.ai_assessment_payload:
        ai_record = AIAssessment(
            complaint_id=complaint_id,
            model_name=request.ai_assessment_payload.get("metadata", {}).get("model_name", "gemma2-9b-it"),
            prompt_version="v1.0",
            completeness_score=float(request.ai_assessment_payload.get("completeness", {}).get("completeness_score", 0.0)),
            extraction_payload=request.ai_assessment_payload.get("complaint"),
            completeness_payload=request.ai_assessment_payload.get("completeness"),
            risk_payload=request.ai_assessment_payload.get("risk_assessment"),
            duplicate_payload=request.ai_assessment_payload.get("duplicate_detection"),
            recommendations_payload=request.ai_assessment_payload.get("recommendations"),
            execution_time_ms=int(request.ai_assessment_payload.get("metadata", {}).get("total_execution_time_ms", 0)),
        )
        db.add(ai_record)

    db.commit()
    db.refresh(complaint)
    return complaint

def get_complaints(
    db: Session,
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    criticality: Optional[str] = None,
    risk_level: Optional[str] = None,
    manufacturing_type: Optional[str] = None,
    batch_number: Optional[str] = None,
    complaint_category: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
) -> Tuple[List[Complaint], int, int]:
    """Retrieves paginated and filtered complaints."""
    query = db.query(Complaint).filter(Complaint.is_deleted == False)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Complaint.id.ilike(search_pattern),
                Complaint.product_name.ilike(search_pattern),
                Complaint.batch_lot_number.ilike(search_pattern),
                Complaint.reported_defect.ilike(search_pattern),
                Complaint.customer_organization.ilike(search_pattern),
                Complaint.customer_name.ilike(search_pattern),
            )
        )

    if status:
        query = query.filter(Complaint.complaint_status == status)
    if severity:
        query = query.filter(Complaint.severity == severity)
    if criticality:
        query = query.filter(Complaint.criticality == criticality)
    if risk_level:
        query = query.filter(Complaint.risk_level == risk_level)
    if manufacturing_type:
        query = query.filter(Complaint.manufacturing_type == manufacturing_type)
    if batch_number:
        query = query.filter(Complaint.batch_lot_number.ilike(f"%{batch_number}%"))
    if complaint_category:
        query = query.filter(Complaint.complaint_category == complaint_category)
    if date_from:
        query = query.filter(Complaint.received_date >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        query = query.filter(Complaint.received_date <= datetime.combine(date_to, datetime.max.time()))

    total = query.count()
    total_pages = (total + limit - 1) // limit if total > 0 else 1

    items = (
        query.order_by(Complaint.received_date.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return items, total, total_pages

def get_complaint_by_id(db: Session, complaint_id: str) -> Optional[Complaint]:
    """Fetches full complaint details with all linked entities."""
    return (
        db.query(Complaint)
        .options(
            joinedload(Complaint.attachments),
            joinedload(Complaint.investigation),
            joinedload(Complaint.capas),
            joinedload(Complaint.audit_logs),
        )
        .filter(Complaint.id == complaint_id, Complaint.is_deleted == False)
        .first()
    )

def update_complaint(
    db: Session,
    complaint_id: str,
    update_data: ComplaintUpdateRequest,
    user_id: str = "QA-OPERATOR-01"
) -> Optional[Complaint]:
    """Updates complaint fields and records granular 21 CFR Part 11 audit trails."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id, Complaint.is_deleted == False).first()
    if not complaint:
        return None

    update_dict = update_data.model_dump(exclude_unset=True, exclude={"change_reason"})

    for field, new_val in update_dict.items():
        # Handle enums
        if hasattr(new_val, "value"):
            new_val = new_val.value

        old_val = getattr(complaint, field)
        if hasattr(old_val, "value"):
            old_val = old_val.value

        # If value has changed, log audit entry
        if str(old_val) != str(new_val):
            audit = AuditEvent(
                complaint_id=complaint_id,
                entity_name="complaints",
                field_name=field,
                old_value=str(old_val) if old_val is not None else None,
                new_value=str(new_val) if new_val is not None else None,
                action="UPDATE",
                user_id=user_id,
                change_reason=update_data.change_reason,
                timestamp=datetime.utcnow(),
            )
            db.add(audit)
            setattr(complaint, field, new_val)

    complaint.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(complaint)
    return complaint

def transition_complaint_status(
    db: Session,
    complaint_id: str,
    request: ComplaintStatusUpdateRequest
) -> Tuple[Optional[Complaint], Optional[str]]:
    """Validates and executes lifecycle state transition."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id, Complaint.is_deleted == False).first()
    if not complaint:
        return None, "Complaint not found"

    # Validate transition rules
    is_valid, err_msg = validate_status_transition(complaint.complaint_status, request.new_status.value)
    if not is_valid:
        return None, err_msg

    old_status = complaint.complaint_status
    new_status = request.new_status.value

    # Update state
    complaint.complaint_status = new_status
    complaint.updated_at = datetime.utcnow()

    if new_status == ComplaintStatusEnum.CLOSED.value:
        complaint.closure_date = datetime.utcnow()

    # Log audit event
    audit = AuditEvent(
        complaint_id=complaint_id,
        entity_name="complaints",
        field_name="complaint_status",
        old_value=old_status,
        new_value=new_status,
        action="STATUS_CHANGE",
        user_id=request.user_id,
        change_reason=request.change_reason,
        timestamp=datetime.utcnow(),
    )
    db.add(audit)
    db.commit()
    db.refresh(complaint)
    return complaint, None

def delete_complaint(db: Session, complaint_id: str, reason: str, user_id: str = "QA-OPERATOR-01") -> bool:
    """Soft-deletes a complaint with mandatory regulatory audit trail."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id, Complaint.is_deleted == False).first()
    if not complaint:
        return False

    complaint.is_deleted = True
    complaint.updated_at = datetime.utcnow()

    audit = AuditEvent(
        complaint_id=complaint_id,
        entity_name="complaints",
        field_name="is_deleted",
        old_value="False",
        new_value="True",
        action="DELETE",
        user_id=user_id,
        change_reason=reason,
        timestamp=datetime.utcnow(),
    )
    db.add(audit)
    db.commit()
    return True

def get_dashboard_metrics(db: Session) -> DashboardMetrics:
    """Aggregates real-time KPI metrics for the executive dashboard."""
    base_query = db.query(Complaint).filter(Complaint.is_deleted == False)

    total_complaints = base_query.count()
    closed_complaints_count = base_query.filter(Complaint.complaint_status == ComplaintStatusEnum.CLOSED.value).count()
    total_active = base_query.filter(Complaint.complaint_status != ComplaintStatusEnum.CLOSED.value).count()
    critical_count = base_query.filter(
        Complaint.criticality.ilike("%critical%"),
        Complaint.complaint_status != ComplaintStatusEnum.CLOSED.value
    ).count()

    # Calculate average cycle time
    closed_complaints = base_query.filter(
        Complaint.complaint_status == ComplaintStatusEnum.CLOSED.value,
        Complaint.closure_date.isnot(None)
    ).all()

    if closed_complaints:
        cycle_days = [
            (c.closure_date - c.received_date).total_seconds() / 86400.0
            for c in closed_complaints
        ]
        avg_days = round(sum(cycle_days) / len(cycle_days), 1)
    else:
        avg_days = 0.0

    # Count pending CAPAs
    pending_capas = (
        db.query(CAPA)
        .join(Complaint)
        .filter(Complaint.is_deleted == False, CAPA.status.in_(["Open", "In Progress"]))
        .count()
    )

    # Distributions
    risk_counts = (
        db.query(Complaint.risk_level, func.count(Complaint.id))
        .filter(Complaint.is_deleted == False)
        .group_by(Complaint.risk_level)
        .all()
    )
    risk_distribution = {r: count for r, count in risk_counts if r}

    category_counts = (
        db.query(Complaint.complaint_category, func.count(Complaint.id))
        .filter(Complaint.is_deleted == False)
        .group_by(Complaint.complaint_category)
        .all()
    )
    category_distribution = {cat: count for cat, count in category_counts if cat}

    status_counts = (
        db.query(Complaint.complaint_status, func.count(Complaint.id))
        .filter(Complaint.is_deleted == False)
        .group_by(Complaint.complaint_status)
        .all()
    )
    status_distribution = {st: count for st, count in status_counts if st}

    # Frontend compatibility maps
    # By criticality with uppercase keys
    crit_counts = (
        db.query(Complaint.criticality, func.count(Complaint.id))
        .filter(Complaint.is_deleted == False)
        .group_by(Complaint.criticality)
        .all()
    )
    by_criticality = {"CRITICAL": 0, "MAJOR": 0, "MINOR": 0}
    for crit, count in crit_counts:
        if not crit:
            continue
        c_upper = str(crit).upper().strip()
        if "CRIT" in c_upper:
            by_criticality["CRITICAL"] += count
        elif "MAJ" in c_upper or "HIGH" in c_upper:
            by_criticality["MAJOR"] += count
        else:
            by_criticality["MINOR"] += count

    # By status with uppercase keys
    by_status = {
        "RECEIVED": 0,
        "OPEN": 0,
        "UNDER_INVESTIGATION": 0,
        "CAPA_PENDING": 0,
        "CLOSED": 0
    }
    for st, count in status_counts:
        if not st:
            continue
        key = str(st).upper().replace(" ", "_").strip()
        if "CLOSE" in key:
            by_status["CLOSED"] += count
        elif "INVESTIGAT" in key:
            by_status["UNDER_INVESTIGATION"] += count
        elif "CAPA" in key:
            by_status["CAPA_PENDING"] += count
        elif "LOGGED" in key or "RECEIV" in key or "DRAFT" in key:
            by_status["RECEIVED"] += count
            by_status["OPEN"] += count
        elif "REVIEW" in key:
            by_status["OPEN"] += count
        else:
            by_status[key] = count

    return DashboardMetrics(
        total_active_complaints=total_active,
        critical_risk_alerts=critical_count,
        average_cycle_time_days=avg_days,
        pending_capa_actions=pending_capas,
        risk_distribution=risk_distribution,
        category_distribution=category_distribution,
        status_distribution=status_distribution,
        total_complaints=total_complaints,
        closed_complaints=closed_complaints_count,
        by_criticality=by_criticality,
        by_status=by_status,
    )

def add_capa(
    db: Session,
    complaint_id: str,
    request: CAPACreateRequest,
    user_id: str = "QA-OPERATOR-01"
) -> Optional[CAPA]:
    """Logs and attaches a CAPA to an existing complaint with audit trail."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id, Complaint.is_deleted == False).first()
    if not complaint:
        return None

    count = db.query(CAPA).count() + 1
    year = datetime.utcnow().year
    capa_num = f"CAPA-{year}-{count:04d}"

    capa = CAPA(
        complaint_id=complaint_id,
        capa_number=capa_num,
        capa_type=request.capa_type,
        description=request.description,
        action_owner=request.owner or user_id,
        target_date=request.target_completion_date,
        effectiveness_criteria=request.effectiveness_criteria or "Verification of zero defect recurrence across 3 validation batches",
        status="Open",
        verification_status="Pending",
    )
    db.add(capa)

    audit = AuditEvent(
        complaint_id=complaint_id,
        entity_name="capas",
        field_name="capa_creation",
        old_value=None,
        new_value=f"Created {capa_num}: {request.description[:60]}",
        action="INSERT",
        user_id=user_id,
        change_reason="Initiation of Corrective/Preventive Action per 21 CFR 820.100",
        timestamp=datetime.utcnow(),
    )
    db.add(audit)
    db.commit()
    db.refresh(capa)
    return capa
