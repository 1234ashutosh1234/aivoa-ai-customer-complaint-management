"""
AI Engine Interfaces & Decoupling Layer
Defines abstract contracts for LangGraph node execution,
ensuring the AI subsystem remains modular and isolated from Phase 2 core backend logic.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class ComplaintExtractorInterface(ABC):
    @abstractmethod
    async def extract(self, text: str) -> Dict[str, Any]:
        """Extracts pharmaceutical domain entities from raw text."""
        pass

class CompletenessValidatorInterface(ABC):
    @abstractmethod
    async def validate(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validates regulatory completeness and generates follow-up queries."""
        pass

class RiskEvaluatorInterface(ABC):
    @abstractmethod
    async def evaluate_risk(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """Computes ICH Q9 Risk Priority Number and assigns Criticality."""
        pass

class DuplicateDetectorInterface(ABC):
    @abstractmethod
    async def check_duplicates(self, batch_lot: str, defect: str) -> Dict[str, Any]:
        """Searches historical database for recurring defects."""
        pass

class InvestigationRecommenderInterface(ABC):
    @abstractmethod
    async def recommend_investigation(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generates 6M Ishikawa root cause hypotheses and 5-Whys framework."""
        pass

class CAPARecommenderInterface(ABC):
    @abstractmethod
    async def recommend_capa(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """Formulates immediate containment, corrective, and preventive actions."""
        pass

class Phase2MockComplaintEngine:
    """
    Realistic mock implementation used during Phase 2 testing.
    Replaced by LangGraph state machine in Phase 4 without changing API contracts.
    """

    @classmethod
    def analyze_text(cls, raw_text: str, source_type: str = "text") -> Dict[str, Any]:
        """Generates a realistic structured pharmaceutical AI evaluation payload."""
        # Detect whether text is likely API or FDF
        is_api = "api" in raw_text.lower() or "bulk" in raw_text.lower() or "micronized" in raw_text.lower()
        is_pediatric = "pediatric" in raw_text.lower() or "child" in raw_text.lower() or "syringe" in raw_text.lower()
        is_critical = "glass" in raw_text.lower() or "overdose" in raw_text.lower() or "hospital" in raw_text.lower()

        if is_pediatric:
            product = "JuniorCillin Pediatric Oral Suspension 250mg/5mL"
            lot = "PED-2026-044"
            defect = "Defective syringe graduation markings with pediatric adverse reaction"
            criticality = "Critical"
            severity = "Critical"
            rpn = 48
            patient_inv = True
            patient_imp = "Severe Illness"
            med_event = True
        elif is_api:
            product = "Paracetamol Micronized Bulk API"
            lot = "LOT-PARA-2026-0814"
            defect = "Foreign black particulate matter embedded in bulk powder (Viton gasket wear)"
            criticality = "Major"
            severity = "Major"
            rpn = 24
            patient_inv = False
            patient_imp = "None"
            med_event = False
        else:
            product = "Amoxicillin Trihydrate Capsules 500mg"
            lot = "BX-2026-091"
            defect = "Blister foil perimeter seal micro-pinholes and moisture-induced discoloration"
            criticality = "Major"
            severity = "Major"
            rpn = 12
            patient_inv = False
            patient_imp = "None"
            med_event = False

        return {
            "complaint": {
                "complainant": {
                    "customer_name": "Clinical Quality Reporter",
                    "customer_organization": "Hospital Pharmacy / Formulations QC",
                    "contact_email": "quality.reporter@pharma-network.com",
                    "contact_phone": "+1-555-019-2834",
                    "country": "USA",
                    "reporter_role": "Pharmacist"
                },
                "product_batch": {
                    "product_name": product,
                    "product_code": "SKU-" + lot[:3],
                    "manufacturing_type": "API" if is_api else "FDF",
                    "dosage_form": "Bulk Powder" if is_api else "Capsule",
                    "strength": "500 mg" if not is_api else "99.8%",
                    "batch_lot_number": lot,
                    "expiration_date": "2027-11-30",
                    "manufacturing_site": "Plant 1 - Main Facility",
                    "market_destination": "US Domestic"
                },
                "defect": {
                    "category": "Physical Defect",
                    "reported_defect": defect,
                    "detailed_description": raw_text[:300] if len(raw_text) > 300 else raw_text,
                    "affected_quantity": "Multiple units",
                    "sample_available": True
                },
                "patient_safety": {
                    "patient_involved": patient_inv,
                    "patient_impact": patient_imp,
                    "medical_event": med_event,
                    "event_narrative": "Incident logged during intake triage."
                },
                "confidence_score": 0.95
            },
            "completeness": {
                "completeness_score": 92.0,
                "is_ready_for_logging": True,
                "missing_mandatory_fields": [],
                "missing_recommended_fields": ["Storage condition history during transit"],
                "clarification_questions": [
                    "Could the customer confirm if the shipping container was intact upon receipt?"
                ]
            },
            "risk_assessment": {
                "severity": severity,
                "criticality": criticality,
                "risk_level": "High" if criticality == "Critical" else "Medium",
                "scoring": {
                    "severity_score": 5 if is_critical else 3,
                    "occurrence_score": 2,
                    "detectability_score": 2,
                    "rpn": rpn
                },
                "clinical_rationale": "Evaluated in accordance with ICH Q9 principles.",
                "regulatory_alert_required": is_critical or med_event,
                "target_investigation_days": 15 if is_critical else 30
            },
            "duplicate_detection": {
                "is_duplicate": False,
                "duplicate_probability": 0.15,
                "matched_complaints": [],
                "batch_clustering_detected": False,
                "clustering_signal_summary": f"Initial reported complaint for batch {lot}."
            },
            "recommendations": {
                "summary": f"Quality defect complaint for {product} (Lot: {lot}).",
                "root_cause": {
                    "primary_category": "Machine (Equipment / Calibration)",
                    "probable_root_causes": [
                        "Packaging line heat-sealing temperature drift",
                        "Mechanical seal friction and wear"
                    ],
                    "five_whys_framework": [
                        {"step": 1, "question": "Why did defect occur?", "answer": "Equipment tolerance deviation."}
                    ],
                    "recommended_testing": ["Retain sample inspection", "Methylene blue dye leak test"]
                },
                "capa": {
                    "immediate_containment": ["Quarantine warehouse inventory of batch " + lot],
                    "corrective_actions": [
                        {
                            "action_type": "Corrective Action",
                            "description": "Recalibrate sealing machine thermocouples",
                            "target_owner_department": "Maintenance",
                            "timeline_days": 7,
                            "effectiveness_check": "Conduct 24h continuous temperature logging"
                        }
                    ],
                    "preventive_actions": [
                        {
                            "action_type": "Preventive Action",
                            "description": "Install automated visual defect detection sensor",
                            "target_owner_department": "Engineering",
                            "timeline_days": 30,
                            "effectiveness_check": "Zero seal defects across next 5 production batches"
                        }
                    ]
                }
            },
            "metadata": {
                "model_name": "gemma2-9b-it",
                "fallback_model_used": None,
                "total_execution_time_ms": 1120,
                "overall_confidence": 0.95,
                "timestamp": "2026-09-18T06:00:00Z"
            }
        }
