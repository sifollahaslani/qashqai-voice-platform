# Roadmap

## Phase 0 — Scaffold (this commit)
- Deterministic classifier, planner, safety checker, schema.
- Signposting content skeletons for 5+ domains (Germany).
- Generic German templates. Tests green. No APIs, no secrets.

## Phase 1 — Content validation
- Each `legal_knowledge/germany/*.md` reviewed by a qualified advisor per
  domain; statements promoted from `VERIFY` to `VERIFIED` only with a cited
  official source.
- Build a verified institution directory (official sources only) — replace
  institution *types* with real, current local contacts where confirmed.

## Phase 2 — Multilingual
- Author and human-review content in Persian, Turkish, Arabic, Qashqai.
- RTL-aware presentation. No machine translation of legal terms.

## Phase 3 — Frontend
- Minimal, accessible, low-literacy-friendly UI from `frontend/guardian_wireframe.md`.
- EU AI Act transparency: clearly disclose the user is interacting with a machine.

## Phase 4 — Bremen pilot
- Partner with local Beratungsstellen (Caritas, Diakonie, AWO, Flüchtlingsrat,
  Mieterverein, Refugee Law Clinic) for warm referrals.
- Measure: did people reach the right human help faster?

## Explicitly out of scope (unless legally cleared)
- Auto-drafting case-specific legal documents.
- Predicting case outcomes or asserting individual entitlements.
- Any feature that would constitute a regulated legal service (RDG).
