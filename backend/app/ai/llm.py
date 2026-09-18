"""
LLM Configuration & Groq Client Setup
Supports runtime model `openai/gpt-oss-120b` (migrated from decommissioned `gemma2-9b-it`)
and contextual reasoning model `llama-3.3-70b-versatile`.
Provides resilient invocation with automatic JSON parsing and graceful deterministic fallback.
"""

import os
import re
import json
import logging
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

ASSIGNMENT_REQUESTED_MODEL = getattr(settings, "ASSIGNMENT_REQUESTED_MODEL", None) or "gemma2-9b-it"
RUNTIME_MODEL = getattr(settings, "GROQ_MODEL", None) or "openai/gpt-oss-120b"
PRIMARY_MODEL = RUNTIME_MODEL
REASONING_MODEL = getattr(settings, "CONTEXTUAL_MODEL", None) or "llama-3.3-70b-versatile"

_primary_llm = None
_reasoning_llm = None
_groq_available = False

def initialize_llms():
    global _primary_llm, _reasoning_llm, _groq_available
    api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")

    if api_key and api_key.strip() and not api_key.startswith("mock") and not api_key.startswith("your_"):
        try:
            from langchain_groq import ChatGroq
            _primary_llm = ChatGroq(
                model_name=PRIMARY_MODEL,
                groq_api_key=api_key,
                temperature=0.1,
                max_tokens=2048,
            )
            _reasoning_llm = ChatGroq(
                model_name=REASONING_MODEL,
                groq_api_key=api_key,
                temperature=0.2,
                max_tokens=3072,
            )
            _groq_available = True
            logger.info(
                "Initialized Groq LLM with runtime model '%s' (assignment requested '%s') and reasoning model '%s'",
                PRIMARY_MODEL,
                ASSIGNMENT_REQUESTED_MODEL,
                REASONING_MODEL,
            )
        except Exception as exc:
            logger.warning("Failed to initialize Groq LLM: %s. Using clinical rules fallback.", exc)
            _groq_available = False
    else:
        logger.info("No active GROQ_API_KEY detected. Running in high-fidelity deterministic clinical mode.")
        _groq_available = False

initialize_llms()

def is_groq_configured() -> bool:
    return _groq_available

def get_groq_status() -> Dict[str, Any]:
    return {
        "is_configured": _groq_available,
        "runtime_model": RUNTIME_MODEL,
        "primary_model": PRIMARY_MODEL,
        "assignment_requested_model": ASSIGNMENT_REQUESTED_MODEL,
        "reasoning_model": REASONING_MODEL,
        "model_compatibility_note": (
            f"Assignment requested model: {ASSIGNMENT_REQUESTED_MODEL} (decommissioned by Groq). "
            f"Runtime model: {RUNTIME_MODEL}."
        ),
    }

def get_primary_llm():
    return _primary_llm

def get_reasoning_llm():
    return _reasoning_llm or _primary_llm

async def call_groq_json(prompt: str, system_prompt: str = "", model_type: str = "primary") -> Optional[Dict[str, Any]]:
    """Calls Groq and safely extracts and parses JSON response."""
    if not _groq_available:
        return None

    llm = get_primary_llm() if model_type == "primary" else get_reasoning_llm()
    if not llm:
        return None

    try:
        from langchain_core.messages import SystemMessage, HumanMessage
        messages = []
        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))
        messages.append(HumanMessage(content=prompt))

        response = await llm.ainvoke(messages)
        content = response.content.strip()

        # Clean JSON markdown fences if returned
        if "```" in content:
            m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", content)
            if m:
                content = m.group(1).strip()
            else:
                content = content.replace("```json", "").replace("```", "").strip()

        try:
            return json.loads(content)
        except json.JSONDecodeError:
            s = content.find("{")
            e = content.rfind("}")
            if s != -1 and e != -1 and e > s:
                return json.loads(content[s : e + 1])
            raise
    except Exception as exc:
        logger.warning("Groq invocation error (%s): %s", model_type, exc)
        return None

