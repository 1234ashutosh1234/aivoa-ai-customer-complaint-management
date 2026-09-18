"""
Complaints API Router
Exposes RESTful endpoints for complaint lifecycle management, search, filtering,
granular field updates, and 21 CFR Part 11 audit trails.
"""

from datetime import date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas import (
    APIResponse,
    ComplaintCreateRequest,
    ComplaintUpdateRequest,
    ComplaintStatusUpdateRequest,
    ComplaintDeleteRequest,
    ComplaintSummaryItem,
    ComplaintDetailResponse,
    PaginatedComplaintsResponse,
    DashboardMetrics,
    AuditEventResponse,
    CAPACreateRequest,
    CAPAResponse,
)
from app.services import complaint_service

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.get("/metrics", response_model=APIResponse[DashboardMetrics], summary="Get aggregated dashboard metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Returns real-time KPI metrics for dashboard cards and charts."""
    metrics = complaint_service.get_dashboard_metrics(db)
    return APIResponse(
        success=True,
        data=metrics,
        message="Dashboard metrics retrieved successfully."
    )

@router.post("", status_code=status.HTTP_201_CREATED, response_model=APIResponse[ComplaintDetailResponse], summary="Create new complaint")
def create_complaint(
    request: ComplaintCreateRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """Registers a verified pharmaceutical complaint and generates sequential CMP-YYYY-XXXXX ID."""
    complaint = complaint_service.create_complaint(db, request, user_id=user_id)
    return APIResponse(
        success=True,
        data=complaint,
        message=f"Complaint {complaint.id} successfully registered in QMS repository."
    )

@router.get("", response_model=APIResponse[PaginatedComplaintsResponse], summary="List and filter complaints")
def list_complaints(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Free-text search across product, batch, defect, customer"),
    status: Optional[str] = Query(None, description="Filter by complaint status (Logged, Under Investigation, etc.)"),
    severity: Optional[str] = Query(None, description="Filter by severity (Minor, Major, Critical)"),
    criticality: Optional[str] = Query(None, description="Filter by criticality"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level (Low, Medium, High, Critical)"),
    manufacturing_type: Optional[str] = Query(None, description="Filter by type (API or FDF)"),
    batch_number: Optional[str] = Query(None, description="Filter by batch/lot number"),
    complaint_category: Optional[str] = Query(None, description="Filter by defect category"),
    date_from: Optional[date] = Query(None, description="Filter complaints received on or after date"),
    date_to: Optional[date] = Query(None, description="Filter complaints received on or before date"),
    db: Session = Depends(get_db),
):
    """Queries complaint records with pagination and multi-dimensional filters."""
    items, total, total_pages = complaint_service.get_complaints(
        db=db,
        page=page,
        limit=limit,
        search=search,
        status=status,
        severity=severity,
        criticality=criticality,
        risk_level=risk_level,
        manufacturing_type=manufacturing_type,
        batch_number=batch_number,
        complaint_category=complaint_category,
        date_from=date_from,
        date_to=date_to,
    )

    paginated_data = PaginatedComplaintsResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )

    return APIResponse(
        success=True,
        data=paginated_data,
        message="Complaints retrieved successfully."
    )

@router.get("/{complaint_id}", response_model=APIResponse[ComplaintDetailResponse], summary="Get full complaint details")
def get_complaint(complaint_id: str, db: Session = Depends(get_db)):
    """Retrieves full 360-degree view of a single complaint including linked entities."""
    complaint = complaint_service.get_complaint_by_id(db, complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with identifier '{complaint_id}' was not found."
        )

    return APIResponse(
        success=True,
        data=complaint,
        message="Complaint details retrieved successfully."
    )

@router.put("/{complaint_id}", response_model=APIResponse[ComplaintDetailResponse], summary="Update complaint fields")
def update_complaint(
    complaint_id: str,
    update_data: ComplaintUpdateRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """Updates editable complaint fields. Mandatory 21 CFR Part 11 change_reason required."""
    complaint = complaint_service.update_complaint(db, complaint_id, update_data, user_id=user_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with identifier '{complaint_id}' was not found."
        )

    return APIResponse(
        success=True,
        data=complaint,
        message=f"Complaint {complaint_id} updated successfully. Change logged in audit trail."
    )

@router.delete("/{complaint_id}", response_model=APIResponse[dict], summary="Soft delete / void complaint")
def delete_complaint(
    complaint_id: str,
    delete_request: ComplaintDeleteRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """Soft deletes / marks void a complaint record with mandatory audit rationale."""
    success = complaint_service.delete_complaint(db, complaint_id, delete_request.reason, user_id=user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with identifier '{complaint_id}' was not found."
        )

    return APIResponse(
        success=True,
        data={"id": complaint_id, "deleted": True},
        message=f"Complaint {complaint_id} successfully voided and archived with audit reason."
    )

@router.post("/{complaint_id}/status", response_model=APIResponse[ComplaintDetailResponse], summary="Transition lifecycle state")
def transition_status(
    complaint_id: str,
    request: ComplaintStatusUpdateRequest,
    db: Session = Depends(get_db),
):
    """Executes validated complaint lifecycle status change and logs audit event."""
    complaint, err_msg = complaint_service.transition_complaint_status(db, complaint_id, request)
    if err_msg:
        if "not found" in err_msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=err_msg)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_msg)

    return APIResponse(
        success=True,
        data=complaint,
        message=f"Complaint {complaint_id} status transitioned to '{complaint.complaint_status}'."
    )

@router.get("/{complaint_id}/audit-trail", response_model=APIResponse[List[AuditEventResponse]], summary="Get 21 CFR Part 11 audit trail")
def get_audit_trail(complaint_id: str, db: Session = Depends(get_db)):
    """Retrieves immutable chronological audit ledger for regulatory inspections."""
    complaint = complaint_service.get_complaint_by_id(db, complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with identifier '{complaint_id}' was not found."
        )

    return APIResponse(
        success=True,
        data=complaint.audit_logs,
        message=f"Audit trail for complaint {complaint_id} retrieved successfully."
    )

@router.post("/{complaint_id}/capa", response_model=APIResponse[CAPAResponse], status_code=status.HTTP_201_CREATED, summary="Add CAPA to complaint")
def add_capa_to_complaint(
    complaint_id: str,
    request: CAPACreateRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """Logs a CAPA action item and links to complaint with audit trail."""
    capa = complaint_service.add_capa(db, complaint_id, request, user_id=user_id)
    if not capa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with identifier '{complaint_id}' was not found."
        )

    return APIResponse(
        success=True,
        data=capa,
        message=f"CAPA {capa.capa_number} successfully registered and linked."
    )
