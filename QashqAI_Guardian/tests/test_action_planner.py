"""Tests for action_planner — structured output and required behaviours."""

from crisis_classifier import classify
from action_planner import plan
from guardian_schema import CrisisCategory, UrgencyLevel, VERIFY, ASSUMPTION


def _plan_for(text, **kw):
    return plan(classify(text), raw_text=text, **kw)


def test_response_has_all_required_fields():
    r = _plan_for("Mein Vermieter droht mit Räumung.")
    d = r.to_dict()
    for key in [
        "problem_summary", "category", "urgency", "immediate_risks",
        "user_rights_information", "evidence_to_collect", "next_steps",
        "relevant_institutions", "document_templates", "safety_warning",
        "disclaimer",
    ]:
        assert key in d


def test_unknown_produces_clarifying_questions():
    r = _plan_for("Ich habe ein Problem.")
    assert r.category == CrisisCategory.UNKNOWN
    assert r.needs_clarification is True
    assert len(r.clarifying_questions) > 0


def test_missing_context_triggers_country_city_date_questions():
    r = _plan_for("Bürgergeld Bescheid abgelehnt.",
                  has_country=False, has_city=False, has_doc_date=False)
    joined = " ".join(r.clarifying_questions).lower()
    assert "country" in joined
    assert "city" in joined or "bundesland" in joined


def test_high_risk_recommends_professional_help():
    r = _plan_for("Abschiebung morgen!")
    texts = " ".join(s.text.lower() for s in r.user_rights_information)
    assert ("advice centre" in texts) or ("lawyer" in texts)


def test_deadline_is_never_asserted_as_a_number():
    # The planner must surface a VERIFY prompt about deadlines, not a hard figure.
    r = _plan_for("Widerspruch gegen Jobcenter Bescheid.")
    statuses = [s.status for s in r.user_rights_information]
    assert VERIFY in statuses


def test_category_is_flagged_as_assumption():
    r = _plan_for("Mein Arbeitgeber hat meinen Lohn nicht bezahlt.")
    statuses = [s.status for s in r.user_rights_information]
    assert ASSUMPTION in statuses


def test_disclaimer_present_and_non_lawyer():
    r = _plan_for("Mietvertrag gekündigt.")
    assert "not a lawyer" in r.disclaimer.lower()


def test_institutions_are_listed_for_known_category():
    r = _plan_for("Jobcenter hat mein Bürgergeld gestrichen.")
    assert len(r.relevant_institutions) > 0
