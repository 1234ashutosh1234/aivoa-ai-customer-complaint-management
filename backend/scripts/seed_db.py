"""
Database Seeding Script
Populates the database with realistic pharmaceutical customer complaints,
covering the mandatory scenarios:
1. Tablet physical defect (capped/chipped tablets)
2. Packaging issue (blister foil pinholes)
3. Missing/incorrect labeling (missing expiry date on carton)
4. Suspected efficacy issue (dissolution delay / lack of effect)
5. Adverse event report (pediatric syringe miscalibration leading to overdose)
"""

import sys
import os
from datetime import datetime, date, timedelta

# Ensure backend root is on Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.insert(0, backend_dir)

from app.database import SessionLocal, init_db
from app.models import Complaint, AuditEvent, Investigation, CAPA

def seed_database():
    print("Initializing database schema...")
    init_db()
    db = SessionLocal()

    try:
        # Check if already seeded with standard data
        sample_exists = db.query(Complaint).filter(Complaint.id == "CMP-2026-00002").first()
        if sample_exists:
            print("Database already contains seeded sample complaints. Skipping seed.")
            return

        print("Seeding realistic pharmaceutical complaint records...")

        now = datetime.utcnow()

        complaints_data = [
            # 1. Tablet Physical Defect
            {
                "id": "CMP-2026-00001",
                "complaint_date": (now - timedelta(days=25)).date(),
                "received_date": now - timedelta(days=24),
                "source": "Portal",
                "customer_name": "Marcus Vance, RPh",
                "customer_organization": "CVS Health Distribution Center #12",
                "contact_email": "m.vance@cvshealth-dc.com",
                "contact_phone": "+1-555-234-9912",
                "country": "USA",
                "product_name": "Ciprofloxacin Tablets USP",
                "product_code": "CIPRO-500-TAB",
                "manufacturing_type": "FDF",
                "dosage_form": "Tablet",
                "strength": "500 mg",
                "batch_lot_number": "BX-2026-012",
                "manufacturing_site": "Plant 1 - Solid Orals Unit A",
                "market_destination": "US Domestic",
                "complaint_category": "Physical Defect",
                "complaint_description": "Multiple bottles received with chipped tablet edges, excessive tablet friability dust, and several split/capped tablets at bottom of bottles.",
                "reported_defect": "Tablet capping and high friability chipping during transport",
                "patient_involvement": False,
                "patient_impact": "None",
                "medical_event": False,
                "severity": "Minor",
                "criticality": "Minor",
                "risk_level": "Low",
                "risk_priority_number": 8,
                "ai_confidence_score": 0.94,
                "initial_assessment": "Excessive tableting compression speed combined with low pre-compression force on Rotary Press 4.",
                "investigation_status": "Completed",
                "complaint_status": "Closed",
                "assigned_owner": "Emily Watson, QA Specialist",
                "closure_date": now - timedelta(days=5),
            },
            # 2. Packaging Issue
            {
                "id": "CMP-2026-00002",
                "complaint_date": (now - timedelta(days=15)).date(),
                "received_date": now - timedelta(days=14),
                "source": "Email",
                "customer_name": "Dr. Sarah Jenkins",
                "customer_organization": "St. Jude Memorial Hospital Pharmacy",
                "contact_email": "sjenkins@stjude-pharma.org",
                "contact_phone": "+1-555-019-2834",
                "country": "USA",
                "product_name": "Amoxicillin Trihydrate Capsules",
                "product_code": "AMX-500-CAP",
                "manufacturing_type": "FDF",
                "dosage_form": "Capsule",
                "strength": "500 mg",
                "batch_lot_number": "BX-2026-091",
                "manufacturing_site": "Plant 2 - Blister Packaging Suite C",
                "market_destination": "US Domestic",
                "complaint_category": "Packaging Defect",
                "complaint_description": "Blister backing foil failed to bond securely along perimeter knurling. Moisture permeated blister pockets causing gelatin capsules to soften and discolor.",
                "reported_defect": "Blister seal micro-pinholes and moisture-induced capsule discoloration",
                "patient_involvement": False,
                "patient_impact": "None",
                "medical_event": False,
                "severity": "Major",
                "criticality": "Major",
                "risk_level": "Medium",
                "risk_priority_number": 18,
                "ai_confidence_score": 0.96,
                "initial_assessment": "Temperature fluctuation on Line 3 blister heat-sealing roller. Intercepted prior to patient dispensing.",
                "investigation_status": "Completed",
                "complaint_status": "CAPA Pending",
                "assigned_owner": "Dr. Alan Grant, Senior QA Manager",
            },
            # 3. Missing/Incorrect Labeling
            {
                "id": "CMP-2026-00003",
                "complaint_date": (now - timedelta(days=10)).date(),
                "received_date": now - timedelta(days=9),
                "source": "Phone",
                "customer_name": "David Morales",
                "customer_organization": "Sunnyside Regional Retail Pharmacy",
                "contact_email": "dmorales@sunnyside-rx.com",
                "contact_phone": "+1-555-882-4411",
                "country": "USA",
                "product_name": "Atorvastatin Calcium Tablets",
                "product_code": "ATOR-20-TAB",
                "manufacturing_type": "FDF",
                "dosage_form": "Tablet",
                "strength": "20 mg",
                "batch_lot_number": "BX-2026-144",
                "manufacturing_site": "Secondary Packaging Facility B",
                "market_destination": "US Domestic",
                "complaint_category": "Labeling / Artwork Error",
                "complaint_description": "A case of 24 unit cartons has missing expiration dates and illegible faint lot number hot-stamping on side flap. 2D barcode still scans correctly.",
                "reported_defect": "Missing/illegible human-readable expiration date and lot number on outer carton",
                "patient_involvement": False,
                "patient_impact": "None",
                "medical_event": False,
                "severity": "Major",
                "criticality": "Major",
                "risk_level": "Medium",
                "risk_priority_number": 16,
                "ai_confidence_score": 0.95,
                "initial_assessment": "Thermal printer ribbon exhaustion on Cartoning Line 2 went undetected during batch changeover.",
                "investigation_status": "In Progress",
                "complaint_status": "Under Investigation",
                "assigned_owner": "Carlos Mendez, Packaging QA",
            },
            # 4. Suspected Efficacy Issue
            {
                "id": "CMP-2026-00004",
                "complaint_date": (now - timedelta(days=6)).date(),
                "received_date": now - timedelta(days=5),
                "source": "Email",
                "customer_name": "Dr. Aris Thorne, MD",
                "customer_organization": "Northwestern Cardiology Associates",
                "contact_email": "athorne@nw-cardio.org",
                "contact_phone": "+1-555-391-7700",
                "country": "USA",
                "product_name": "Metoprolol Tartrate Extended-Release Tablets",
                "product_code": "MET-50-ER",
                "manufacturing_type": "FDF",
                "dosage_form": "Tablet",
                "strength": "50 mg",
                "batch_lot_number": "BX-2026-205",
                "manufacturing_site": "Plant 1 - Solid Orals Unit A",
                "market_destination": "US Domestic",
                "complaint_category": "Lack of Efficacy / ADE",
                "complaint_description": "Three hypertension patients experienced sub-therapeutic blood pressure control and breakthrough tachycardia after switching to this new lot.",
                "reported_defect": "Suspected dissolution delay / out-of-specification extended release profile",
                "patient_involvement": True,
                "patient_impact": "Minor Symptoms",
                "medical_event": True,
                "severity": "Major",
                "criticality": "Major",
                "risk_level": "High",
                "risk_priority_number": 36,
                "ai_confidence_score": 0.92,
                "initial_assessment": "Polymer coating thickness variation suspected; retain samples pulled for immediate USP <711> dissolution testing.",
                "investigation_status": "In Progress",
                "complaint_status": "Under Investigation",
                "assigned_owner": "Dr. Henrik Lind, Quality Control Lead",
            },
            # 5. Adverse Event Report (Pediatric)
            {
                "id": "CMP-2026-00005",
                "complaint_date": (now - timedelta(days=2)).date(),
                "received_date": now - timedelta(days=1),
                "source": "Phone",
                "customer_name": "Maria Elena Rodriguez",
                "customer_organization": "Consumer / Lurie Children's Hospital Emergency",
                "contact_email": "m_rodriguez91@gmail.com",
                "contact_phone": "+1-312-555-8941",
                "country": "USA",
                "product_name": "JuniorCillin Pediatric Oral Suspension",
                "product_code": "PED-AMX-250",
                "manufacturing_type": "FDF",
                "dosage_form": "Oral Suspension",
                "strength": "250 mg / 5 mL",
                "batch_lot_number": "PED-2026-044",
                "manufacturing_site": "Liquid Fill Suite B",
                "market_destination": "US Domestic",
                "complaint_category": "Lack of Efficacy / ADE",
                "complaint_description": "Enclosed 5 mL calibrated oral dosing syringe has inverted 2.5 mL and 5.0 mL markings. 3-year-old child received accidental double-dose resulting in acute vomiting, severe diarrhea, and emergency hospitalization.",
                "reported_defect": "Miscalibrated oral dosing syringe graduation markings causing pediatric accidental overdose and hospitalization",
                "patient_involvement": True,
                "patient_impact": "Severe Illness",
                "medical_event": True,
                "severity": "Critical",
                "criticality": "Critical",
                "risk_level": "Critical",
                "risk_priority_number": 75,
                "ai_confidence_score": 0.98,
                "initial_assessment": "CRITICAL SERIOUS ADVERSE EVENT (SAE). Triggers expedited 15-day FDA MedWatch Form 3500A reporting. Immediate batch recall evaluation initiated.",
                "investigation_status": "In Progress",
                "complaint_status": "Under Investigation",
                "assigned_owner": "Sarah Lin, Director of Quality & Pharmacovigilance",
            },
        ]

        for item in complaints_data:
            existing_c = db.query(Complaint).filter(Complaint.id == item["id"]).first()
            if existing_c:
                continue

            c = Complaint(**item)
            db.add(c)

            # Add creation audit event
            audit = AuditEvent(
                complaint_id=c.id,
                entity_name="complaints",
                field_name="all",
                old_value=None,
                new_value=f"Seeded complaint {c.id}",
                action="CREATE",
                user_id="SYSTEM-SEEDER",
                change_reason="Initial historical seed data population",
                timestamp=c.received_date,
            )
            db.add(audit)

            # Add linked investigation for item 2
            if c.id == "CMP-2026-00002":
                inv = Investigation(
                    complaint_id=c.id,
                    investigation_number="INV-2026-00008",
                    investigation_status="Completed",
                    problem_statement="Blister cavity micro-pinholes detected on Lot BX-2026-091 manufactured on Packaging Line 3.",
                    root_cause_category="Machine (Equipment / Calibration)",
                    root_cause_narrative="Thermocouple TC-3 on knurling sealing roller failed, causing intermittent temperature drop below 135°C during high-speed blister seal.",
                    five_whys_analysis=[
                        {"step": 1, "question": "Why did capsules soften?", "answer": "Moisture entered blister cavity."},
                        {"step": 2, "question": "Why did moisture enter?", "answer": "Foil seal knurling had micro-void channels."},
                        {"step": 3, "question": "Why were there micro-void channels?", "answer": "Sealing temperature dropped intermittently."},
                        {"step": 4, "question": "Why did sealing temperature drop?", "answer": "Thermocouple TC-3 had intermittent contact resistance."},
                        {"step": 5, "question": "Why was thermocouple TC-3 not caught?", "answer": "Preventive maintenance was overdue by 14 days."}
                    ],
                    retain_sample_tested=True,
                    retain_sample_result="Retain samples failed methylene blue dye vacuum leak test (ASTM D4991).",
                    assigned_investigator="Dr. Alan Grant",
                    target_completion_date=c.received_date + timedelta(days=14),
                    completed_at=c.received_date + timedelta(days=12),
                )
                db.add(inv)

                # Add linked CAPA
                capa = CAPA(
                    complaint_id=c.id,
                    capa_number="CAPA-2026-00004",
                    capa_type="Corrective Action",
                    description="Replace thermocouple TC-3 on Packaging Line 3 and update PLC alarm threshold.",
                    action_owner="Maintenance Engineering",
                    target_date=c.received_date + timedelta(days=20),
                    effectiveness_criteria="24h continuous data logging with zero temperature drift.",
                    verification_status="Pending",
                    status="Open",
                )
                db.add(capa)

        db.commit()
        print(f"Successfully seeded {len(complaints_data)} realistic pharmaceutical complaints!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
