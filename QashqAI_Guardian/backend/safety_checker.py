"""
safety_checker.py
=================

The guardrail layer. It runs AFTER the planner and has the authority to
mutate the response to make it safe. It encodes the project's hard safety
rules so they cannot be silently bypassed by upstream changes.

Rules enforced here:
  1. Never let a response go out without the canonical disclaimer.
  2. Detect self-harm / violence / imminent (court, deportation, eviction)
     signals and escalate to EMERGENCY with a clear safety warning + human help.
  3. Reject / flag any text that reads like FINAL legal advice
     ("you will win", "you must", "I guarantee", "definitely entitled").
  4. For HIGH / EMERGENCY: ensure professional help is recommended.
  5. Flag missing country / city / document date.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from guardian_schema import (
    DISCLAIMER,
    CrisisCategory,
    GuardianResponse,
    UrgencyLevel,
    VERIFIED,
    Statement,
)

# Signals that always force an EMERGENCY classification.
HARD_ESCALATION_SIGNALS = [
    "suizid", "selbstmord", "selbstverletzung", "umbringen", "umzubringen",
    "selbst verletzen", "mich verletzen", "suicide", "self-harm",
    "kill myself", "hurt myself",
    "gewalt", "geschlagen", "missbrauch", "violence", "abuse", "beaten",
    "خودکشی", "خشونت", "کتک", "به خودم آسیب",
    "abschiebung heute", "abschiebung morgen", "deportation today",
    "zwangsräumung", "evicted today", "räumung heute",
]

# Phrasing that would constitute final legal advice / a guarantee — forbidden.
FORBIDDEN_ADVICE_PATTERNS = [
    "you will win", "you will definitely", "i guarantee", "guaranteed to",
    "you are entitled to", "you must sue", "you should sue", "you will succeed",
    "no need for a lawyer", "you don't need a lawyer", "this is illegal, so you",
    "you are legally entitled", "definitely entitled",
]

SAFETY_WARNING_EMERGENCY = (
    "⚠ This looks urgent and potentially dangerous. If anyone is in immediate "
    "danger, call 112 (medical/fire) or 110 (police) now. For deportation, "
    "eviction, or court deadlines, contact a qualified advice centre or lawyer "
    "immediately — these deadlines can be very short and hard to reverse. "
    "If you are thinking about harming yourself, you are not alone; please reach "
    "out to emergency services or a confidential crisis line such as "
    "Telefonseelsorge right now."
)

SAFETY_WARNING_HIGH = (
    "⚠ This is time-sensitive. Check the deadline on your document today and "
    "contact a qualified advice centre (Beratungsstelle) as soon as possible."
)


@dataclass
class SafetyResult:
    response: GuardianResponse
    flags: list[str] = field(default_factory=list)
    passed: bool = True


def _contains(text: str, needles: list[str]) -> list[str]:
    low = (text or "").lower()
    return [n for n in needles if (n in low if n.isascii() else n in (text or ""))]


def run_safety_checks(response: GuardianResponse, raw_text: str = "",
                      has_country: bool = False, has_city: bool = False,
                      has_doc_date: bool = False) -> SafetyResult:
    flags: list[str] = []

    # 1. Disclaimer is mandatory.
    if not response.disclaimer or "not a lawyer" not in response.disclaimer.lower():
        response.disclaimer = DISCLAIMER
        flags.append("disclaimer_restored")

    # 2. Hard escalation on safety / imminent-irreversible signals.
    hard_hits = _contains(raw_text, HARD_ESCALATION_SIGNALS)
    if hard_hits:
        response.urgency = response.urgency.escalate_to(UrgencyLevel.EMERGENCY)
        flags.append(f"escalated_emergency:{','.join(hard_hits)}")

    # 3. Forbidden 'final advice' phrasing anywhere in the user-facing text.
    haystack = " ".join(
        [response.problem_summary]
        + [s.text for s in response.user_rights_information]
        + response.next_steps
    )
    advice_hits = _contains(haystack, FORBIDDEN_ADVICE_PATTERNS)
    if advice_hits:
        flags.append(f"forbidden_advice_phrasing:{','.join(advice_hits)}")
        # Defensive: scrub by appending an explicit non-advice clarifier.
        response.user_rights_information.append(
            Statement("The above is general information, not a prediction or a "
                      "guarantee about your specific case.", VERIFIED)
        )

    # 4. Attach the correct safety warning.
    if response.urgency == UrgencyLevel.EMERGENCY:
        response.safety_warning = SAFETY_WARNING_EMERGENCY
    elif response.urgency == UrgencyLevel.HIGH and not response.safety_warning:
        response.safety_warning = SAFETY_WARNING_HIGH

    # 5. Ensure professional help is recommended for high-risk cases.
    if response.urgency in (UrgencyLevel.HIGH, UrgencyLevel.EMERGENCY):
        has_prof = any("advice centre" in s.text.lower() or "lawyer" in s.text.lower()
                       or "112" in s.text for s in response.user_rights_information) \
            or (response.safety_warning is not None)
        if not has_prof:
            response.user_rights_information.append(
                Statement("Contact a qualified advice centre or lawyer as soon as "
                          "possible.", VERIFIED))
            flags.append("professional_help_added")

    # 6. Missing context must be surfaced (unless pure safety emergency).
    if response.category != CrisisCategory.URGENT_SAFETY:
        missing = []
        if not has_country:
            missing.append("country")
        if not has_city:
            missing.append("city")
        if not has_doc_date:
            missing.append("document_date")
        if missing:
            response.needs_clarification = True
            flags.append(f"missing_context:{','.join(missing)}")

    return SafetyResult(response=response, flags=flags, passed=True)
