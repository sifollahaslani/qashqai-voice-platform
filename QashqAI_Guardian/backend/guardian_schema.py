"""
guardian_schema.py
==================

Shared data model for QashqAI Guardian.

This module defines the *vocabulary* of the system: the crisis categories,
the urgency levels, the supported languages, and the structured response
object that every other layer reads and writes.

Design principles (locked):
- Pure standard library. No external APIs, no network, no secrets.
- The model is data, not advice. Nothing here renders a legal opinion.
- Multilingual by design: every user-facing payload carries a language tag,
  even though full translation is NOT implemented yet.
- Every response MUST separate VERIFIED information from ASSUMPTIONS, and
  MUST always carry a disclaimer. This is enforced downstream by
  safety_checker.py.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


# ---------------------------------------------------------------------------
# Crisis categories
# ---------------------------------------------------------------------------
class CrisisCategory(str, Enum):
    HOUSING = "housing"
    IMMIGRATION = "immigration"
    SOCIAL_BENEFITS = "social_benefits"
    DISABILITY = "disability"
    EMPLOYMENT = "employment"
    CONSUMER_CONTRACT = "consumer_contract"
    DIGITAL_ACCESS = "digital_access"
    URGENT_SAFETY = "urgent_safety"
    UNKNOWN = "unknown"


# ---------------------------------------------------------------------------
# Urgency levels (ordered, so they can be compared / escalated)
# ---------------------------------------------------------------------------
class UrgencyLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EMERGENCY = "emergency"

    @property
    def rank(self) -> int:
        return {"low": 0, "medium": 1, "high": 2, "emergency": 3}[self.value]

    def escalate_to(self, other: "UrgencyLevel") -> "UrgencyLevel":
        """Return the more severe of two urgency levels."""
        return other if other.rank > self.rank else self


# ---------------------------------------------------------------------------
# Languages — prepared for, not yet fully translated
# ---------------------------------------------------------------------------
class Language(str, Enum):
    DE = "de"          # German   (primary jurisdiction language)
    FA = "fa"          # Persian
    TR = "tr"          # Turkish
    EN = "en"          # English
    AR = "ar"          # Arabic
    QSQ = "qsq"        # Qashqai (Darreh-Shuri) — community language

    @property
    def is_rtl(self) -> bool:
        """Right-to-left scripts, relevant for any future frontend."""
        return self in (Language.FA, Language.AR)


SUPPORTED_LANGUAGES = [lang.value for lang in Language]


# ---------------------------------------------------------------------------
# Canonical, non-negotiable disclaimer
# ---------------------------------------------------------------------------
# This text is the legal spine of the project. It must appear on EVERY
# response. safety_checker.run_safety_checks() refuses to pass a response
# that does not carry it.
DISCLAIMER = (
    "QashqAI Guardian is NOT a lawyer and does NOT provide legal advice "
    "(keine Rechtsberatung). It offers general information, orientation, and "
    "referral to official institutions and qualified counselling. Information "
    "may be incomplete or out of date. Always verify deadlines and rights with "
    "the official body or a qualified advice centre (Beratungsstelle) before "
    "acting. In an emergency call 112."
)

# A short machine-readable marker used to tag every factual statement.
VERIFIED = "VERIFIED"        # stable, well-known fact (institution type, generic process)
ASSUMPTION = "ASSUMPTION"    # inferred from the user's wording — must be confirmed
VERIFY = "VERIFY"            # placeholder the user/operator must fill from an official source


@dataclass
class Statement:
    """A single piece of information, explicitly tagged for provenance.

    This is how the system honours the rule 'always separate verified
    information from assumptions' (Doctrine #30: Provenance & Authority).
    """
    text: str
    status: str = VERIFIED  # one of VERIFIED / ASSUMPTION / VERIFY

    def to_dict(self) -> dict:
        return {"text": self.text, "status": self.status}


@dataclass
class GuardianResponse:
    """The single structured object returned to the caller / frontend."""

    problem_summary: str
    category: CrisisCategory
    urgency: UrgencyLevel
    immediate_risks: list[str] = field(default_factory=list)
    user_rights_information: list[Statement] = field(default_factory=list)
    evidence_to_collect: list[str] = field(default_factory=list)
    next_steps: list[str] = field(default_factory=list)
    relevant_institutions: list[str] = field(default_factory=list)
    document_templates: list[str] = field(default_factory=list)
    safety_warning: Optional[str] = None
    disclaimer: str = DISCLAIMER

    # Operational fields
    language: Language = Language.DE
    clarifying_questions: list[str] = field(default_factory=list)
    needs_clarification: bool = False
    safety_flags: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "problem_summary": self.problem_summary,
            "category": self.category.value,
            "urgency": self.urgency.value,
            "immediate_risks": self.immediate_risks,
            "user_rights_information": [s.to_dict() for s in self.user_rights_information],
            "evidence_to_collect": self.evidence_to_collect,
            "next_steps": self.next_steps,
            "relevant_institutions": self.relevant_institutions,
            "document_templates": self.document_templates,
            "safety_warning": self.safety_warning,
            "disclaimer": self.disclaimer,
            "language": self.language.value,
            "clarifying_questions": self.clarifying_questions,
            "needs_clarification": self.needs_clarification,
            "safety_flags": self.safety_flags,
        }
