"""
Validation Service Module
Enforces pharmaceutical Quality Management System (QMS) business rules,
lifecycle state machine constraints, and regulatory integrity checks.
"""

from typing import Tuple, Optional, Set, Dict

# Allowed state machine transitions in the pharmaceutical complaint lifecycle
ALLOWED_TRANSITIONS: Dict[str, Set[str]] = {
    "Draft": {"Logged", "Under Review"},
    "Logged": {"Under Review", "Under Investigation", "Closed"},
    "Under Review": {"Under Investigation", "Closure Review", "Closed"},
    "Under Investigation": {"CAPA Pending", "Closure Review", "Closed"},
    "CAPA Pending": {"Closure Review", "Under Investigation", "Closed"},
    "Closure Review": {"Closed", "Under Investigation"},
    "Closed": {"Reopened"},
    "Reopened": {"Under Investigation", "CAPA Pending"},
}

def validate_status_transition(current_status: str, target_status: str) -> Tuple[bool, Optional[str]]:
    """
    Validates whether a lifecycle state transition is legally permissible under QMS SOPs.
    """
    if current_status == target_status:
        return True, None

    allowed_targets = ALLOWED_TRANSITIONS.get(current_status, set())
    if target_status not in allowed_targets:
        return False, (
            f"Invalid lifecycle transition: Cannot move complaint from '{current_status}' to '{target_status}'. "
            f"Permitted next states: {sorted(list(allowed_targets)) if allowed_targets else 'None (terminal state)'}."
        )

    return True, None

def validate_batch_number(batch_number: str) -> Tuple[bool, Optional[str]]:
    """Validates that a batch/lot identifier adheres to pharmaceutical numbering standards."""
    if not batch_number or len(batch_number.strip()) < 2:
        return False, "Batch number cannot be empty or fewer than 2 characters."
    return True, None
