"""
action_planner.py
=================

Turns a Classification into a structured GuardianResponse.

What this layer is allowed to do:
  - name the TYPE of official institution that is usually competent
  - list generic evidence a person should collect
  - propose generic, non-binding next steps (orientation, not instructions)
  - point at relevant document *templates* (generic forms, user-completed)
  - ask for the country / city / document date when they are missing

What this layer must NEVER do:
  - state a specific legal deadline as fact (it inserts a VERIFY prompt instead)
  - invent phone numbers, addresses, named offices, or statutes
  - tell the user the outcome of their case or what they 'should' legally do

Per-category content is deliberately stored as plain data so it can be
reviewed by a non-engineer (the Cultural / Legal Oversight Board) and later
externalised into the legal_knowledge/ markdown files.
"""

from __future__ import annotations

from guardian_schema import (
    ASSUMPTION,
    CrisisCategory,
    GuardianResponse,
    Language,
    Statement,
    UrgencyLevel,
    VERIFY,
    VERIFIED,
)
from crisis_classifier import Classification


# Generic, jurisdiction-neutral verify prompt about deadlines. We never assert
# a number; we point the user at the authoritative source: their own letter.
DEADLINE_VERIFY = Statement(
    "There is often a strict deadline (Frist). The authoritative deadline for "
    "YOUR case is printed in the Rechtsbehelfsbelehrung (legal-remedies notice) "
    "on your letter. Missing it can be irreversible — check it and, for "
    "high-risk cases, confirm with a qualified advice centre.",
    VERIFY,
)

PROFESSIONAL_HELP = (
    "This situation can have serious, hard-to-reverse consequences. "
    "Contact a qualified advice centre (Beratungsstelle) or a lawyer "
    "(Rechtsanwalt) as soon as possible — many offer free or low-cost help."
)

# Institution TYPES per category (names of institution categories that exist
# in Germany — not specific branches, numbers, or addresses).
INSTITUTIONS: dict[CrisisCategory, list[str]] = {
    CrisisCategory.HOUSING: [
        "Mieterverein / Mieterschutzbund (tenant association)",
        "Sozialamt (if rent/housing costs are at risk)",
        "Amtsgericht (only if a court case is already running)",
        "Local Schuldnerberatung (debt counselling) if arrears are involved",
    ],
    CrisisCategory.IMMIGRATION: [
        "Ausländerbehörde (foreigners' authority — the issuing office)",
        "BAMF (Federal Office for Migration and Refugees, for asylum matters)",
        "Migrationsberatung (MBE) / Jugendmigrationsdienst (JMD)",
        "A specialised immigration lawyer (Fachanwalt für Migrationsrecht)",
        "Local Flüchtlingsrat / Refugee Law Clinic",
    ],
    CrisisCategory.SOCIAL_BENEFITS: [
        "Jobcenter (Bürgergeld)",
        "Sozialamt (Grundsicherung / Sozialhilfe)",
        "Wohngeldstelle (housing benefit)",
        "Independent Sozialberatung (welfare counselling)",
    ],
    CrisisCategory.DISABILITY: [
        "Versorgungsamt / zuständige Behörde (degree of disability, GdB)",
        "Pflegekasse (care level / Pflegegrad)",
        "EUTB — Ergänzende unabhängige Teilhabeberatung (free disability advice)",
        "Sozialverband (e.g. VdK / SoVD) — membership-based support",
    ],
    CrisisCategory.EMPLOYMENT: [
        "Betriebsrat (works council, if one exists)",
        "Gewerkschaft (trade union, for members)",
        "Arbeitsagentur (employment agency)",
        "Arbeitsgericht (labour court — note the short dismissal-claim deadline)",
        "Specialised employment lawyer (Fachanwalt für Arbeitsrecht)",
    ],
    CrisisCategory.CONSUMER_CONTRACT: [
        "Verbraucherzentrale (consumer advice centre)",
        "Schuldnerberatung (debt counselling), if debt collection is involved",
        "The company's own complaints / cancellation channel (in writing)",
    ],
    CrisisCategory.DIGITAL_ACCESS: [
        "The service provider's official support channel (in writing)",
        "Verbraucherzentrale (for telecom / contract disputes)",
        "Local digital-inclusion offers (libraries, Volkshochschule, Caritas/Diakonie)",
    ],
    CrisisCategory.URGENT_SAFETY: [
        "Emergency services: 112 (medical / fire), 110 (police) in Germany",
        "Telefonseelsorge (free, confidential crisis counselling)",
        "Local Frauenhaus / violence-protection services if there is a threat",
    ],
    CrisisCategory.UNKNOWN: [
        "A general advice centre (Allgemeine Sozialberatung) can help triage",
    ],
}

EVIDENCE: dict[CrisisCategory, list[str]] = {
    CrisisCategory.HOUSING: [
        "The full letter/notice (all pages, including the date)",
        "Your rental contract (Mietvertrag)",
        "Proof of rent payments / any arrears",
        "Any written communication with the landlord",
    ],
    CrisisCategory.IMMIGRATION: [
        "The full official letter (all pages + the date received)",
        "Your passport and any residence document (Aufenthaltstitel / Duldung)",
        "Any envelope showing the delivery date (deadlines often run from it)",
        "Previous decisions or correspondence in your file",
    ],
    CrisisCategory.SOCIAL_BENEFITS: [
        "The full Bescheid (decision letter) including the date",
        "Proof of income, rent, and household members",
        "Your application and any prior decisions",
    ],
    CrisisCategory.DISABILITY: [
        "The full decision letter (Bescheid) and its date",
        "Medical reports / Befunde supporting your condition",
        "Any prior assessments (GdB / Pflegegrad)",
    ],
    CrisisCategory.EMPLOYMENT: [
        "Your employment contract (Arbeitsvertrag)",
        "The dismissal letter (Kündigung) and the date you received it",
        "Payslips (Lohnabrechnungen) and proof of unpaid amounts",
        "Any written communication with the employer",
    ],
    CrisisCategory.CONSUMER_CONTRACT: [
        "The contract / order confirmation",
        "All invoices, reminders (Mahnung) and debt-collection letters",
        "Proof of any payments already made",
        "Any cancellation you already sent (with date and proof of delivery)",
    ],
    CrisisCategory.DIGITAL_ACCESS: [
        "The contract or account details",
        "Screenshots / error messages",
        "A written record of when access was lost and any support tickets",
    ],
    CrisisCategory.URGENT_SAFETY: [],
    CrisisCategory.UNKNOWN: [
        "Any letters or documents you received",
        "Notes on what happened and when (dates matter)",
    ],
}

# Generic, well-known orientation per category. Tagged VERIFIED only where the
# statement is a stable institutional fact; anything case-specific is VERIFY.
RIGHTS_INFO: dict[CrisisCategory, list[Statement]] = {
    CrisisCategory.HOUSING: [
        Statement("In Germany a landlord generally cannot evict you without a "
                  "court order; a termination letter is not the same as an eviction.", VERIFIED),
        Statement("Tenant associations (Mieterverein) give specialised, low-cost help.", VERIFIED),
        DEADLINE_VERIFY,
    ],
    CrisisCategory.IMMIGRATION: [
        Statement("Most decisions of the Ausländerbehörde or BAMF can be "
                  "challenged, but only within a strict time limit.", VERIFIED),
        Statement("Specialised, often free, migration counselling exists (MBE/JMD, "
                  "Refugee Law Clinics).", VERIFIED),
        DEADLINE_VERIFY,
    ],
    CrisisCategory.SOCIAL_BENEFITS: [
        Statement("A benefit decision (Bescheid) can usually be challenged with a "
                  "formal objection (Widerspruch).", VERIFIED),
        Statement("Bürgergeld is administered by the Jobcenter; Grundsicherung/"
                  "Sozialhilfe by the Sozialamt.", VERIFIED),
        DEADLINE_VERIFY,
    ],
    CrisisCategory.DISABILITY: [
        Statement("A rejected or too-low assessment (GdB / Pflegegrad) can usually "
                  "be challenged with a Widerspruch.", VERIFIED),
        Statement("Free, independent disability advice is available via EUTB.", VERIFIED),
        DEADLINE_VERIFY,
    ],
    CrisisCategory.EMPLOYMENT: [
        Statement("A dismissal-protection claim (Kündigungsschutzklage) has a "
                  "notably short deadline — act fast and verify it.", VERIFIED),
        Statement("Unpaid wages can usually be claimed; document the amounts.", VERIFIED),
        DEADLINE_VERIFY,
    ],
    CrisisCategory.CONSUMER_CONTRACT: [
        Statement("Many contracts have a withdrawal/cancellation right; debt-"
                  "collection demands can be disputed if the claim is unclear.", VERIFIED),
        Statement("The Verbraucherzentrale offers low-cost consumer advice.", VERIFIED),
        DEADLINE_VERIFY,
    ],
    CrisisCategory.DIGITAL_ACCESS: [
        Statement("Disputes about telecom/internet contracts can be raised with the "
                  "provider in writing and with the Verbraucherzentrale.", VERIFIED),
        Statement("Public libraries and adult-education centres often provide free "
                  "internet and digital help.", VERIFIED),
    ],
    CrisisCategory.URGENT_SAFETY: [],
    CrisisCategory.UNKNOWN: [],
}

TEMPLATES: dict[CrisisCategory, list[str]] = {
    CrisisCategory.HOUSING: ["objection_letter_de.md", "evidence_checklist_de.md"],
    CrisisCategory.IMMIGRATION: ["objection_letter_de.md", "deadline_extension_de.md", "evidence_checklist_de.md"],
    CrisisCategory.SOCIAL_BENEFITS: ["objection_letter_de.md", "evidence_checklist_de.md"],
    CrisisCategory.DISABILITY: ["objection_letter_de.md", "evidence_checklist_de.md"],
    CrisisCategory.EMPLOYMENT: ["complaint_email_de.md", "evidence_checklist_de.md"],
    CrisisCategory.CONSUMER_CONTRACT: ["complaint_email_de.md", "objection_letter_de.md"],
    CrisisCategory.DIGITAL_ACCESS: ["complaint_email_de.md"],
    CrisisCategory.URGENT_SAFETY: [],
    CrisisCategory.UNKNOWN: [],
}

IMMEDIATE_RISKS: dict[CrisisCategory, list[str]] = {
    CrisisCategory.HOUSING: ["Possible loss of housing if deadlines are missed"],
    CrisisCategory.IMMIGRATION: ["Possible loss of residence / removal if deadlines are missed"],
    CrisisCategory.SOCIAL_BENEFITS: ["Possible loss of income / benefits"],
    CrisisCategory.DISABILITY: ["Possible loss of support / entitlements"],
    CrisisCategory.EMPLOYMENT: ["Possible loss of job / unpaid income; very short claim deadline"],
    CrisisCategory.CONSUMER_CONTRACT: ["Escalating debt / collection costs"],
    CrisisCategory.DIGITAL_ACCESS: ["Loss of access to essential online services"],
    CrisisCategory.URGENT_SAFETY: ["Immediate danger to safety or life"],
    CrisisCategory.UNKNOWN: [],
}

CLARIFYING_QUESTIONS_BASE = [
    "Which country is this about? (this version covers Germany)",
    "Which city / Bundesland are you in?",
    "What is the date on your letter or document?",
]


def plan(classification: Classification, raw_text: str = "",
         language: Language = Language.DE,
         has_country: bool = False, has_city: bool = False,
         has_doc_date: bool = False) -> GuardianResponse:
    """Build a GuardianResponse from a Classification (orientation, not advice)."""

    cat = classification.category
    urgency = classification.urgency

    summary = (raw_text.strip()[:280] + ("…" if len(raw_text.strip()) > 280 else "")) \
        if raw_text.strip() else "No description provided."

    # Missing context -> we must ask (rule: always ask for country/city/date),
    # EXCEPT for a pure safety emergency, where we must not nag (Safety Policy §8).
    clarifying: list[str] = []
    if cat != CrisisCategory.URGENT_SAFETY:
        if not has_country:
            clarifying.append(CLARIFYING_QUESTIONS_BASE[0])
        if not has_city:
            clarifying.append(CLARIFYING_QUESTIONS_BASE[1])
        if not has_doc_date and cat != CrisisCategory.UNKNOWN:
            clarifying.append(CLARIFYING_QUESTIONS_BASE[2])

    needs_clarification = classification.needs_clarification or cat == CrisisCategory.UNKNOWN
    if cat == CrisisCategory.UNKNOWN:
        clarifying = [
            "Can you describe what happened in one or two sentences?",
            "Did you receive a letter, email, or call? From whom?",
        ] + clarifying

    next_steps: list[str] = []
    if cat == CrisisCategory.URGENT_SAFETY:
        next_steps = [
            "If you are in immediate danger, call 112 (or 110 for police) now.",
            "Reach out to a person you trust or a confidential crisis line.",
        ]
    else:
        next_steps = [
            "Find and read the deadline (Frist) on your document.",
            "Gather the evidence listed below.",
            "Contact the relevant official institution and a free advice centre.",
        ]
        if urgency in (UrgencyLevel.HIGH, UrgencyLevel.EMERGENCY):
            next_steps.insert(0, "Act today — high-risk deadlines can be very short.")

    response = GuardianResponse(
        problem_summary=summary,
        category=cat,
        urgency=urgency,
        immediate_risks=list(IMMEDIATE_RISKS.get(cat, [])),
        user_rights_information=list(RIGHTS_INFO.get(cat, [])),
        evidence_to_collect=list(EVIDENCE.get(cat, [])),
        next_steps=next_steps,
        relevant_institutions=list(INSTITUTIONS.get(cat, [])),
        document_templates=list(TEMPLATES.get(cat, [])),
        language=language,
        clarifying_questions=clarifying,
        needs_clarification=needs_clarification or bool(clarifying),
    )

    # Always recommend professional help for high-risk situations.
    if urgency in (UrgencyLevel.HIGH, UrgencyLevel.EMERGENCY):
        response.user_rights_information.append(Statement(PROFESSIONAL_HELP, VERIFIED))

    # Tag the user's own framing as an assumption to be confirmed.
    if raw_text.strip() and cat != CrisisCategory.UNKNOWN:
        response.user_rights_information.append(
            Statement(f"Category '{cat.value}' was inferred from your wording and "
                      f"should be confirmed.", ASSUMPTION)
        )

    return response
