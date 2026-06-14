# QashqAI Guardian

**An AI Rights & Crisis Navigator — not a lawyer, a signpost.**

QashqAI Guardian is a subproject of the QashqAI ecosystem. It helps people who
are low-income, migrant, disabled, digitally excluded, or simply unsure of
their next step to **understand a situation, find the right official
institution, and reach qualified human help** — in their own language.

It is built on one hard rule:

> **This system does not give legal advice. It gives orientation and referral.**

---

## Purpose

The hardest barrier for vulnerable people is rarely a lack of information — it
is not knowing *what the next concrete step is*. QashqAI Guardian closes that
gap with four functions:

1. **Crisis triage** — what kind of problem is this, and how urgent?
2. **Legal-information navigation** — general, sourced information (never a
   verdict on your case).
3. **Official-resource guidance** — which institution / advice centre is
   competent, and what evidence to bring.
4. **Document-drafting support** — generic, user-completed templates you can
   take to a qualified advisor.

## Ethical scope

- **Information & referral, not representation.** See
  [`docs/LEGAL_DISCLAIMER.md`](docs/LEGAL_DISCLAIMER.md).
- **No invented facts.** The system never fabricates laws, deadlines, offices,
  or phone numbers. Anything case-specific is marked `VERIFY`.
- **Human in the loop for anything serious.** High-risk situations always route
  to a qualified advice centre (Beratungsstelle) or lawyer.
- **No model in the raw-data path.** Classification is deterministic and
  auditable (QashqAI Architecture Doctrine #28–#30).
- **Multilingual by design.** German, Persian, Turkish, English, Arabic,
  Qashqai. See [`docs/GOVERNANCE.md`](docs/GOVERNANCE.md).

## Non-lawyer disclaimer

QashqAI Guardian is **not a lawyer** and provides **no legal advice**
(*keine Rechtsberatung*). It offers general information and referral only.
Always confirm rights and deadlines with the competent authority or a qualified
advice centre. **In an emergency, call 112.**

## Installation (placeholder)

```bash
# Python 3.10+
python -m pytest -q          # run the test suite
```

> No external APIs, keys, paid services, or deployment are configured yet.
> This is an offline, transparent reference implementation.

## Example user flow

```
User: "Mein Vermieter droht mit Räumung der Wohnung."

 1. crisis_classifier  -> category = housing, urgency = high
 2. action_planner     -> immediate_risks, generic rights info (with a VERIFY
                          prompt about the deadline), evidence checklist,
                          relevant institution TYPES (Mieterverein, Sozialamt…),
                          template suggestions (objection_letter_de.md)
 3. safety_checker      -> attaches time-sensitive warning, ensures the
                          disclaimer + professional-help recommendation,
                          flags that country / city / document-date are missing
                          and must be asked

 Output: a structured GuardianResponse the frontend renders, ending with the
         disclaimer and an explicit "go to a qualified advice centre" step.
```

## Layout

```
backend/         deterministic logic (schema, classifier, planner, safety)
legal_knowledge/ general, sourced signposting content (germany/ first)
templates/       generic, user-completed German letter skeletons
docs/            vision, safety, disclaimer, governance, roadmap
frontend/        textual wireframe (no UI built yet)
tests/           pytest suite
```

## Future roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md). In short: validate content with
qualified advisors per domain → add real translations → integrate a verified,
official-source institution directory → pilot in Bremen with partner
Beratungsstellen.

---

*Part of the QashqAI ecosystem. Built under the project's governance and
oversight framework; production QashqAI Voice logic is untouched.*
