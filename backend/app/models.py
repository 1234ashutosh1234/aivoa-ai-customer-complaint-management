"""
SQLAlchemy ORM Models for Pharmaceutical Customer Complaint Management System.
Adheres to 21 CFR Part 11, ICH Q10, and EU GMP Chapter 8.
Portable across PostgreSQL, MySQL 8.0, and SQLite.
"""

from datetime import datetime, date
import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, Date, DateTime, JSON, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Complaint(Base):
    __tablename__ = "complaints"

    # Primary Regulatory Identifier (e.g. CMP-2026-00104)
    id = Column(String(32), primary_key=True, index=True)
    complaint_date = Column(Date, nullable=True)
    received_date = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    source = Column(String(32), default="Email", nullable=False)
    
    # Complainant Details
    customer_name = Column(String(128), nullable=True)
    customer_organization = Column(String(128), nullable=True)
    contact_email = Column(String(128), nullable=True)
    contact_phone = Column(String(64), nullable=True)
    country = Column(String(64), default="USA", nullable=False)
    
    # Product & Lot Identification
    product_name = Column(String(128), nullable=False, index=True)
    product_code = Column(String(64), nullable=True)
    manufacturing_type = Column(String(16), default="FDF", nullable=False)  # API or FDF
    dosage_form = Column(String(64), nullable=True)
    strength = Column(String(64), nullable=True)
    batch_lot_number = Column(String(64), nullable=False, index=True)
    manufacturing_site = Column(String(128), nullable=True)
    market_destination = Column(String(64), nullable=True)
    
    # Defect & Narrative
    complaint_category = Column(String(64), default="Physical Defect", nullable=False, index=True)
    complaint_description = Column(Text, nullable=False)
    reported_defect = Column(Text, nullable=False)
    
    # Patient Safety & Pharmacovigilance
    patient_involvement = Column(Boolean, default=False, nullable=False)
    patient_impact = Column(String(64), default="None", nullable=False)
    medical_event = Column(Boolean, default=False, nullable=False)
    
    # Risk & Criticality Scoring (ICH Q9)
    severity = Column(String(32), default="Minor", nullable=False, index=True)
    criticality = Column(String(32), default="Minor", nullable=False, index=True)
    risk_level = Column(String(32), default="Low", nullable=False, index=True)
    risk_priority_number = Column(Integer, default=1, nullable=True)
    ai_confidence_score = Column(Float, default=1.0, nullable=False)
    initial_assessment = Column(Text, nullable=True)
    
    # Lifecycle & Workflow State
    investigation_status = Column(String(32), default="Not Initiated", nullable=False)
    complaint_status = Column(String(32), default="Logged", nullable=False, index=True)
    duplicate_probability = Column(Float, default=0.0, nullable=True)
    similar_complaint_ids = Column(JSON, default=list, nullable=True)
    assigned_owner = Column(String(64), nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)  # Soft delete
    
    # Audit Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    closure_date = Column(DateTime, nullable=True)

    # Relationships
    attachments = relationship("ComplaintAttachment", back_populates="complaint", cascade="all, delete-orphan")
    ai_assessments = relationship("AIAssessment", back_populates="complaint", cascade="all, delete-orphan")
    investigation = relationship("Investigation", back_populates="complaint", uselist=False, cascade="all, delete-orphan")
    capas = relationship("CAPA", back_populates="complaint", cascade="all, delete-orphan")
    audit_logs = relationship("AuditEvent", back_populates="complaint", cascade="all, delete-orphan")

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(32), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    entity_name = Column(String(64), default="complaints", nullable=False)
    field_name = Column(String(64), nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    action = Column(String(32), nullable=False)  # CREATE, UPDATE, STATUS_CHANGE, DELETE
    user_id = Column(String(64), nullable=False)
    change_reason = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    complaint = relationship("Complaint", back_populates="audit_logs")

class ComplaintAttachment(Base):
    __tablename__ = "complaint_attachments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(32), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=True, index=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(64), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    raw_extracted_text = Column(Text, nullable=True)
    file_hash_sha256 = Column(String(64), nullable=True)
    storage_path = Column(String(512), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    complaint = relationship("Complaint", back_populates="attachments")

class AIAssessment(Base):
    __tablename__ = "ai_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(32), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    model_name = Column(String(64), nullable=False)
    prompt_version = Column(String(32), default="v1.0", nullable=False)
    completeness_score = Column(Float, default=0.0, nullable=False)
    extraction_payload = Column(JSON, nullable=True)
    completeness_payload = Column(JSON, nullable=True)
    risk_payload = Column(JSON, nullable=True)
    duplicate_payload = Column(JSON, nullable=True)
    recommendations_payload = Column(JSON, nullable=True)
    execution_time_ms = Column(Integer, default=0, nullable=False)
    assessed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    complaint = relationship("Complaint", back_populates="ai_assessments")

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(32), ForeignKey("complaints.id", ondelete="CASCADE"), unique=True, nullable=False)
    investigation_number = Column(String(32), nullable=False)
    investigation_status = Column(String(32), default="Open", nullable=False)
    problem_statement = Column(Text, nullable=True)
    root_cause_category = Column(String(64), nullable=True)  # Man, Machine, Method, Material, Measurement, Environment
    root_cause_narrative = Column(Text, nullable=True)
    five_whys_analysis = Column(JSON, nullable=True)
    retain_sample_tested = Column(Boolean, default=False, nullable=False)
    retain_sample_result = Column(Text, nullable=True)
    assigned_investigator = Column(String(64), nullable=True)
    target_completion_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    complaint = relationship("Complaint", back_populates="investigation")

class CAPA(Base):
    __tablename__ = "capas"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(32), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    capa_number = Column(String(32), nullable=False)
    capa_type = Column(String(32), default="Corrective Action", nullable=False)  # Corrective Action, Preventive Action
    description = Column(Text, nullable=False)
    action_owner = Column(String(64), nullable=True)
    target_date = Column(DateTime, nullable=True)
    completed_date = Column(DateTime, nullable=True)
    effectiveness_criteria = Column(String(255), nullable=True)
    verification_status = Column(String(32), default="Pending", nullable=False)  # Pending, Effective, Ineffective
    status = Column(String(32), default="Open", nullable=False)

    complaint = relationship("Complaint", back_populates="capas")
