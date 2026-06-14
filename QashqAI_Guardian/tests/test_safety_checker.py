"""Tests for safety_checker — the guardrail layer."""

from crisis_classifier import classify
from action_planner import plan
from safety_checker import run_safety_checks
from guardian_schema import (
    CrisisCategory, UrgencyLevel, GuardianResponse, Statement, VERIFIED,
)


def _full(text, **kw):
    r = plan(classify(text), raw_text=text, **kw)
    return run_safety_checks(r, raw_text=text, **kw)


def test_self_harm_escalates_to_emergency_with_warning():
    res = _full("Ich will mich selbst verletzen.")
    assert res.response.urgency == UrgencyLevel.EMERGENCY
    assert res.response.safety_warning is not None
    assert "112" in res.response.safety_warning


def test_violence_escalates_to_emergency():
    res = _full("Mein Partner hat mich geschlagen und bedroht.")
    assert res.response.urgency == UrgencyLevel.EMERGENCY


def test_imminent_deportation_escalates():
    res = _full("Abschiebung heute, Hilfe!")
    assert res.response.urgency == UrgencyLevel.EMERGENCY
    assert any(f.startswith("escalated_emergency") for f in res.flags)


def test_disclaimer_is_restored_if_missing():
    r = GuardianResponse(
        problem_summary="x",
        category=CrisisCategory.HOUSING,
        urgency=UrgencyLevel.LOW,
        disclaimer="",  # deliberately wiped
    )
    res = run_safety_checks(r, raw_text="Mietfrage", has_country=True,
                            has_city=True, has_doc_date=True)
    assert "not a lawyer" in res.response.disclaimer.lower()
    assert "disclaimer_restored" in res.flags


def test_forbidden_advice_phrasing_is_flagged():
    r = GuardianResponse(
        problem_summary="case",
        category=CrisisCategory.EMPLOYMENT,
        urgency=UrgencyLevel.MEDIUM,
    )
    r.user_rights_information.append(
        Statement("You will definitely win and you don't need a lawyer.", VERIFIED))
    res = run_safety_checks(r, raw_text="lohn", has_country=True,
                            has_city=True, has_doc_date=True)
    assert any(f.startswith("forbidden_advice_phrasing") for f in res.flags)


def test_missing_context_is_flagged():
    res = _full("Jobcenter Bescheid.", has_country=False,
                has_city=False, has_doc_date=False)
    assert any(f.startswith("missing_context") for f in res.flags)
    assert res.response.needs_clarification is True


def test_high_risk_has_professional_help_or_warning():
    res = _full("Räumungsklage, Gerichtstermin.")
    has_help = res.response.safety_warning is not None or any(
        "advice centre" in s.text.lower() or "lawyer" in s.text.lower()
        for s in res.response.user_rights_information)
    assert has_help


def test_safety_emergency_does_not_demand_document_date():
    # Pure safety emergencies should not nag for a 'document date'.
    # (Uses an unambiguous violence phrase; bare "bedroht" is intentionally
    # NOT a violence signal, since "mit Räumung bedroht" is a housing matter.)
    res = _full("Mein Mann hat mich geschlagen.")
    assert res.response.category == CrisisCategory.URGENT_SAFETY
    assert "missing_context:" not in " ".join(res.flags)
