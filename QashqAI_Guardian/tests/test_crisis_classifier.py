"""Tests for crisis_classifier — the required classification scenarios."""

from crisis_classifier import classify
from guardian_schema import CrisisCategory, UrgencyLevel


def test_eviction_threat_is_housing_high():
    res = classify("Mein Vermieter droht mit Räumung der Wohnung.")
    assert res.category == CrisisCategory.HOUSING
    assert res.urgency == UrgencyLevel.HIGH


def test_eviction_threat_english():
    res = classify("My landlord is threatening eviction from my flat.")
    assert res.category == CrisisCategory.HOUSING
    assert res.urgency in (UrgencyLevel.HIGH, UrgencyLevel.EMERGENCY)


def test_deportation_letter_is_immigration_high_or_emergency():
    res = classify("Ich habe einen Brief von der Ausländerbehörde über Abschiebung bekommen.")
    assert res.category == CrisisCategory.IMMIGRATION
    assert res.urgency in (UrgencyLevel.HIGH, UrgencyLevel.EMERGENCY)


def test_deportation_imminent_is_emergency():
    res = classify("Abschiebung morgen, ich weiß nicht was ich tun soll.")
    assert res.urgency == UrgencyLevel.EMERGENCY


def test_unpaid_wage_is_employment_medium_or_high():
    res = classify("Mein Arbeitgeber hat meinen Lohn nicht bezahlt.")
    assert res.category == CrisisCategory.EMPLOYMENT
    assert res.urgency in (UrgencyLevel.MEDIUM, UrgencyLevel.HIGH)


def test_disability_rejection_is_disability_medium_or_high():
    res = classify("Mein Antrag auf Schwerbehinderung wurde abgelehnt, ich will Widerspruch.")
    assert res.category == CrisisCategory.DISABILITY
    assert res.urgency in (UrgencyLevel.MEDIUM, UrgencyLevel.HIGH)


def test_vague_problem_is_unknown_and_needs_clarification():
    res = classify("Ich habe ein Problem und brauche Hilfe.")
    assert res.category == CrisisCategory.UNKNOWN
    assert res.needs_clarification is True


def test_empty_input_is_unknown():
    res = classify("")
    assert res.category == CrisisCategory.UNKNOWN
    assert res.needs_clarification is True


def test_self_harm_is_urgent_safety_emergency():
    res = classify("Ich denke daran, mich umzubringen.")
    assert res.category == CrisisCategory.URGENT_SAFETY
    assert res.urgency == UrgencyLevel.EMERGENCY


def test_kuendigung_disambiguation_housing():
    res = classify("Kündigung meiner Wohnung durch den Vermieter.")
    assert res.category == CrisisCategory.HOUSING


def test_kuendigung_disambiguation_employment():
    res = classify("Kündigung durch meinen Arbeitgeber, mein Job ist weg.")
    assert res.category == CrisisCategory.EMPLOYMENT


def test_persian_immigration_keyword():
    res = classify("نامه اخراج از اداره اتباع آمده است")
    assert res.category == CrisisCategory.IMMIGRATION
