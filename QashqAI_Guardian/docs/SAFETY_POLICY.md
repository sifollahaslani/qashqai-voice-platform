# Safety Policy

These rules are binding. They are enforced in code by `backend/safety_checker.py`
and must not be weakened without Oversight Board sign-off (see GOVERNANCE.md).

## 1. No final legal advice
The system provides general information and referral only. It must never tell a
user they "will win", are "entitled", "must sue", or "don't need a lawyer".
Such phrasing is detected and flagged (`FORBIDDEN_ADVICE_PATTERNS`).

## 2. No invented facts
The system must never fabricate laws, deadlines, office names, addresses, or
phone numbers. Where a specific figure is required, it inserts a `VERIFY` prompt
pointing the user to the authoritative source — typically the
Rechtsbehelfsbelehrung (legal-remedies notice) on their own letter.

## 3. Mandatory escalation
If a message indicates **violence, self-harm, a court date, deportation,
eviction, or another imminent/irreversible event**, urgency is forced to
`EMERGENCY` and a safety warning is attached, directing the user to emergency
services (112 / 110) and qualified help.

## 4. Professional help for high risk
Any `HIGH` or `EMERGENCY` case must recommend a qualified advice centre
(Beratungsstelle) or lawyer. This is added automatically if missing.

## 5. Separate verified from assumed
Every statement carries a provenance tag: `VERIFIED`, `ASSUMPTION`, or `VERIFY`.
The category inferred from the user's wording is always tagged `ASSUMPTION`.

## 6. Always establish context
The system must ask for **country, city, and the document date** when they are
missing (deadlines and competent offices depend on all three). This is surfaced
as `missing_context` and as clarifying questions.

## 7. Mandatory disclaimer
No response leaves the system without the canonical non-lawyer disclaimer. The
safety checker restores it if it is missing.

## 8. Self-harm handling
For self-harm signals, the system does not engage in risk assessment or method
discussion. It expresses care, directs to emergency services and a confidential
crisis line (e.g. Telefonseelsorge), and does not nag for administrative details.
