"""
crisis_classifier.py
=====================

Deterministic, transparent, rule-based classifier.

There is intentionally NO machine-learning model and NO LLM in this path.
This honours the QashqAI Architecture Doctrine (#28-#30): no model sits in
the raw-data runtime path. Every decision here is auditable: you can read the
keyword that triggered each classification in `matched`.

Output: a `Classification` describing the most likely category, the urgency,
the keywords that matched, and whether clarification is required.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from guardian_schema import CrisisCategory, UrgencyLevel


# ---------------------------------------------------------------------------
# Keyword sets. German first (the jurisdiction), then EN / FA / TR / AR.
# These are signals, not exhaustive — they are meant to be extended.
# ---------------------------------------------------------------------------
CATEGORY_KEYWORDS: dict[CrisisCategory, list[str]] = {
    CrisisCategory.HOUSING: [
        "wohnung", "miete", "mieter", "vermieter", "räumung", "raeumung",
        "zwangsräumung", "mietvertrag", "nebenkosten", "kaution",
        "rent", "landlord", "eviction", "tenant", "evicted",
        "خانه", "اجاره", "صاحبخانه", "تخلیه", "موجر",
        "kira", "ev sahibi", "tahliye",
        "إيجار", "سكن", "إخلاء", "مالك",
    ],
    CrisisCategory.IMMIGRATION: [
        "ausländerbehörde", "auslaenderbehoerde", "bamf", "aufenthalt",
        "aufenthaltstitel", "duldung", "abschiebung", "asyl", "visum", "visa",
        "residence", "deportation", "deport", "deported", "asylum",
        "اقامت", "مهاجرت", "اخراج", "دیپورت", "پناهندگی", "اداره اتباع",
        "oturum", "ikamet", "sınır dışı", "iltica",
        "إقامة", "ترحيل", "لجوء", "تأشيرة",
    ],
    CrisisCategory.SOCIAL_BENEFITS: [
        "jobcenter", "bürgergeld", "buergergeld", "sozialamt", "sozialhilfe",
        "wohngeld", "grundsicherung", "hartz", "leistungen", "bescheid",
        "benefits", "welfare", "social assistance",
        "یارانه", "کمک هزینه", "اداره کار", "مستمری",
        "sosyal yardım", "iş merkezi",
        "مساعدات", "إعانة",
    ],
    CrisisCategory.DISABILITY: [
        "schwerbehinderung", "behinderung", "behindert", "pflegegrad",
        "pflege", "gdb", "versorgungsamt", "schwerbehindertenausweis",
        "disability", "disabled", "care level",
        "معلولیت", "ازکارافتادگی", "ناتوانی", "درجه پرستاری",
        "engellilik", "engelli",
        "إعاقة", "معاق",
    ],
    CrisisCategory.EMPLOYMENT: [
        "arbeit", "arbeitgeber", "arbeitsvertrag", "lohn", "gehalt",
        "arbeitslos", "abmahnung", "arbeitsgericht", "job",
        "wage", "salary", "fired", "dismissal", "employer", "unpaid",
        "کار", "حقوق", "دستمزد", "کارفرما", "اخراج از کار", "قرارداد کار",
        "iş", "maaş", "işveren", "işten",
        "عمل", "راتب", "أجر", "صاحب العمل",
    ],
    CrisisCategory.CONSUMER_CONTRACT: [
        "vertrag", "rechnung", "abo", "abonnement", "mahnung", "inkasso",
        "verbraucher", "widerruf", "vertragsstrafe",
        "contract", "invoice", "subscription", "bill", "debt collection",
        "قرارداد", "فاکتور", "اشتراک", "صورتحساب",
        "sözleşme", "fatura", "abonelik",
        "عقد", "فاتورة", "اشتراك",
    ],
    CrisisCategory.DIGITAL_ACCESS: [
        "internet", "wlan", "account", "konto gesperrt", "passwort", "login",
        "email gesperrt", "online-zugang", "digital", "gesperrt",
        "locked out", "no internet", "online access", "digital exclusion",
        "اینترنت", "حساب کاربری", "رمز عبور", "قطع اینترنت", "دسترسی آنلاین",
        "internet yok", "hesap", "şifre",
        "إنترنت", "حساب", "كلمة المرور",
    ],
    # Note: generic "threat"/"bedroht" are deliberately EXCLUDED here, because
    # phrases like "threatening eviction" / "mit Räumung bedroht" are housing
    # matters, not violence. Real violence/self-harm is matched by the explicit
    # words below; imminent threats with death/harm use multi-word signals.
    CrisisCategory.URGENT_SAFETY: [
        "gewalt", "geschlagen", "missbrauch",
        "suizid", "selbstmord", "selbstverletzung", "umbringen", "umzubringen",
        "selbst verletzen", "mich verletzen", "selbst zu verletzen", "töten",
        "todesdrohung", "death threat", "threatened to kill", "threatened to hurt",
        "violence", "abuse", "beaten", "suicide", "self-harm",
        "kill myself", "hurt myself",
        "خشونت", "خودکشی", "آزار", "کتک", "به خودم آسیب", "خودم را بکشم",
        "şiddet", "intihar", "kendime zarar",
        "عنف", "انتحار", "إيذاء النفس",
    ],
}

# Urgency signal words. EMERGENCY signals dominate everything.
EMERGENCY_SIGNALS = [
    # safety (explicit violence / self-harm only)
    "gewalt", "geschlagen", "missbrauch", "suizid", "selbstmord",
    "selbstverletzung", "umbringen", "umzubringen", "selbst verletzen",
    "violence", "abuse", "suicide", "self-harm", "kill myself", "hurt myself",
    "خشونت", "خودکشی", "کتک",
    # imminent, irreversible administrative events
    "zwangsräumung", "abschiebung heute", "abschiebung morgen",
    "abgeschoben", "deportation today", "evicted today", "heute geräumt",
]

HIGH_SIGNALS = [
    "kündigung", "kuendigung", "räumung", "raeumung", "eviction",
    "abschiebung", "deportation", "deport", "frist", "deadline",
    "widerspruch", "gericht", "court", "klage", "räumungsklage",
    "inkasso", "mahnung", "gesperrt",
    "اخراج", "دیپورت", "مهلت", "دادگاه", "تخلیه",
]

MEDIUM_SIGNALS = [
    "rechnung", "vertrag", "bescheid", "ablehnung", "abgelehnt", "rejected",
    "nicht bezahlt", "unpaid", "lohn", "wage", "salary",
    "antrag", "application", "abmahnung",
    "فاکتور", "قرارداد", "رد شد", "پرداخت نشده",
]

# Vague / low-signal phrases that mean we should ask clarifying questions.
VAGUE_PHRASES = [
    "problem", "help", "hilfe", "frage", "question", "weiß nicht",
    "ich brauche", "i need help", "what should i do", "was soll ich tun",
    "مشکل", "کمک", "نمی‌دانم", "چه کار",
]

# Context words that disambiguate the overloaded term "Kündigung"
HOUSING_CONTEXT = ["wohnung", "miete", "vermieter", "mietvertrag", "rent", "landlord"]
EMPLOYMENT_CONTEXT = ["arbeit", "arbeitgeber", "job", "lohn", "gehalt", "arbeitsvertrag", "employer"]


@dataclass
class Classification:
    category: CrisisCategory
    urgency: UrgencyLevel
    matched: dict[str, list[str]] = field(default_factory=dict)
    needs_clarification: bool = False

    def to_dict(self) -> dict:
        return {
            "category": self.category.value,
            "urgency": self.urgency.value,
            "matched": self.matched,
            "needs_clarification": self.needs_clarification,
        }


def _find(text: str, keywords: list[str]) -> list[str]:
    """Return the keywords that appear in text (case-insensitive substring)."""
    low = text.lower()
    hits = []
    for kw in keywords:
        # word-ish match for ASCII; substring match for non-Latin scripts
        if re.search(r"[a-zäöüß]", kw):
            if kw in low:
                hits.append(kw)
        elif kw in text:
            hits.append(kw)
    return hits


def _score_categories(text: str) -> dict[CrisisCategory, list[str]]:
    scores: dict[CrisisCategory, list[str]] = {}
    for cat, kws in CATEGORY_KEYWORDS.items():
        hits = _find(text, kws)
        if hits:
            scores[cat] = hits
    return scores


def _resolve_kuendigung(text: str, scores: dict) -> None:
    """'Kündigung' alone is ambiguous (rental vs. employment). Use context."""
    low = text.lower()
    if "kündigung" in low or "kuendigung" in low or "kündig" in low:
        has_housing = any(c in low for c in HOUSING_CONTEXT)
        has_employment = any(c in low for c in EMPLOYMENT_CONTEXT)
        if has_housing and not has_employment:
            scores.setdefault(CrisisCategory.HOUSING, []).append("kündigung[housing-context]")
        elif has_employment and not has_housing:
            scores.setdefault(CrisisCategory.EMPLOYMENT, []).append("kündigung[employment-context]")


def classify(text: str, language=None) -> Classification:
    """Classify free-text input into a category + urgency.

    Purely deterministic. `language` is accepted for forward-compatibility
    (the data model is multilingual) but the keyword sets already span
    several languages, so it does not change the logic yet.
    """
    if not text or not text.strip():
        return Classification(
            category=CrisisCategory.UNKNOWN,
            urgency=UrgencyLevel.LOW,
            needs_clarification=True,
        )

    scores = _score_categories(text)
    _resolve_kuendigung(text, scores)

    # --- Urgency -----------------------------------------------------------
    emergency_hits = _find(text, EMERGENCY_SIGNALS)
    high_hits = _find(text, HIGH_SIGNALS)
    medium_hits = _find(text, MEDIUM_SIGNALS)

    if emergency_hits:
        urgency = UrgencyLevel.EMERGENCY
    elif high_hits:
        urgency = UrgencyLevel.HIGH
    elif medium_hits:
        urgency = UrgencyLevel.MEDIUM
    else:
        urgency = UrgencyLevel.LOW

    matched = {
        "emergency_signals": emergency_hits,
        "high_signals": high_hits,
        "medium_signals": medium_hits,
    }

    # --- Safety overrides everything --------------------------------------
    safety_hits = _find(text, CATEGORY_KEYWORDS[CrisisCategory.URGENT_SAFETY])
    if safety_hits:
        matched["category_keywords"] = safety_hits
        return Classification(
            category=CrisisCategory.URGENT_SAFETY,
            urgency=UrgencyLevel.EMERGENCY,
            matched=matched,
            needs_clarification=False,
        )

    # --- Category ----------------------------------------------------------
    if not scores:
        vague_hits = _find(text, VAGUE_PHRASES)
        matched["category_keywords"] = []
        return Classification(
            category=CrisisCategory.UNKNOWN,
            urgency=urgency if urgency != UrgencyLevel.LOW else UrgencyLevel.LOW,
            matched=matched,
            needs_clarification=True,
        )

    # pick the category with the most keyword hits (stable tie-break by order)
    best = max(scores.items(), key=lambda kv: (len(kv[1]),))
    category = best[0]
    matched["category_keywords"] = scores[category]

    # A bare deportation / eviction reference is high-risk by default even
    # without an explicit deadline word.
    if category == CrisisCategory.IMMIGRATION and _find(text, ["abschiebung", "deportation", "deport"]):
        urgency = urgency.escalate_to(UrgencyLevel.HIGH)
    if category == CrisisCategory.HOUSING and _find(text, ["räumung", "raeumung", "eviction", "zwangsräumung"]):
        urgency = urgency.escalate_to(UrgencyLevel.HIGH)
    # Unpaid wages: a livelihood risk -> at least HIGH
    if category == CrisisCategory.EMPLOYMENT and _find(text, ["nicht bezahlt", "unpaid", "kein lohn", "kein gehalt"]):
        urgency = urgency.escalate_to(UrgencyLevel.HIGH)

    return Classification(
        category=category,
        urgency=urgency,
        matched=matched,
        needs_clarification=False,
    )
