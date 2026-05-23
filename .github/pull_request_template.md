<!--
  QashqAI Voice — Pull Request Template
  Complete every applicable section. PRs with empty required sections will not be merged.
  Required sections are marked ✳️. Others are conditional on change type.
-->

## ✳️ Summary
<!-- 1–3 sentences: what this PR does and why. Focus on intent, not mechanics. -->



## ✳️ Type of Change
<!-- Check all that apply -->
- [ ] `fix` — bug fix (non-breaking)
- [ ] `feat` — new feature (non-breaking)
- [ ] `feat!` — breaking change
- [ ] `refactor` — code restructure, no behaviour change
- [ ] `docs` — documentation only
- [ ] `test` — tests only
- [ ] `chore` — build, CI, or tooling
- [ ] `cultural` — Qashqai linguistic or cultural content
- [ ] `governance` — consent, data policy, or governance framework
- [ ] `security` — security fix or hardening

---

## ✳️ Governance Impact
<!-- Does this PR touch the data pipeline, consent model, sensitivity tiers, or governance documents? -->

- [ ] **No governance impact** — purely technical or UI change
- [ ] **Governance impact** — describe below:

<!-- If yes: which documents or pipeline stages are affected? -->



---

## ✳️ Cultural Validation
<!-- Does this PR add, modify, or remove Qashqai linguistic or cultural content? -->

- [ ] **No** — skip to the next section
- [ ] **Yes** — all of the following must be completed before merge:
  - [ ] Primary native speaker (or vetted community member) consulted
  - [ ] Vowel markings verified against Darreh-Shuri dialect norms
  - [ ] Dialect attribution recorded: `Darreh-Shuri`
  - [ ] Confidence level assigned: `Verified` / `Likely` / `Unverified`
  - [ ] Consent metadata present for any speaker-attributed content
  - [ ] Validator name and date recorded here or in a commit message:

**Validator:** <!-- name -->
**Date:** <!-- YYYY-MM-DD -->
**Notes:** <!-- any dialect notes, uncertainty flags, or community feedback -->

<!--
  Cultural validation is NON-NEGOTIABLE for any linguistic change.
  No exceptions, even for "small" or "obvious" entries.
  When in doubt: mark Unverified and consult before merging.
-->

---

## ✳️ Consent and Privacy Impact
<!-- Does this PR affect how speaker data, recordings, or personal metadata are handled? -->

- [ ] **No consent or privacy impact**
- [ ] **Consent impact** — describe:
  - [ ] No new personal data is introduced
  - [ ] Any new speaker data follows the consent framework in `06_Data_Governance/`
  - [ ] Sensitivity tier is assigned to all new data
  - [ ] Tier 2 (restricted) content stays in `data/restricted/` only
  - [ ] Withdrawal protocol is unaffected, or changes are described below

<!-- Describe any consent or privacy changes: -->



---

## AI Provider Impact
<!-- Does this PR change how the Anthropic API or Claude models are used? -->

- [ ] **No AI provider impact**
- [ ] **AI provider impact** — check all that apply:
  - [ ] Model version changed — from: `___` to: `___`
  - [ ] System prompt modified (language: `___`)
  - [ ] `thinking` / `adaptive` config changed
  - [ ] Token budget changed — from: `___` to: `___`
  - [ ] New API feature used: `___`
  - [ ] API key handling changed
  - [ ] ALLOWED_ORIGINS or CORS config changed

<!-- If the model or prompts changed, explain the reasoning and expected behaviour difference: -->



---

## Security Considerations
<!-- Check all that apply, or mark N/A -->

- [ ] No new secrets, API keys, or tokens introduced
- [ ] No hardcoded credentials in source or config
- [ ] User input is validated at all new endpoints
- [ ] No new unauthenticated endpoints added (or risk accepted and documented)
- [ ] CORS policy is unchanged or tightened
- [ ] No new dependencies added without justification below

**New dependencies (if any):**
<!-- package name, version, reason -->



---

## Tests Performed
<!-- What was verified before opening this PR? -->

- [ ] Backend: `pytest app/tests/` — result: `___`
- [ ] Frontend: `npm run build` — result: `___`
- [ ] Manual test: describe below
- [ ] No tests available yet — explain:

<!-- Describe what you tested and the outcome: -->



---

## Reviewer Checklist
<!-- To be completed by the reviewer, not the author -->

**Code quality**
- [ ] Logic is correct and matches the PR description
- [ ] No dead code, commented-out blocks, or debug statements
- [ ] Error handling is explicit; no silent swallowing
- [ ] No hardcoded secrets or credentials

**Governance**
- [ ] Cultural validation section is complete (if applicable)
- [ ] Consent/privacy section is complete (if applicable)
- [ ] No tier 2 content outside `data/restricted/`
- [ ] Pipeline stage order is respected (intake → review → process)

**Security**
- [ ] No new attack surface introduced
- [ ] Input validation present at all new boundaries
- [ ] API key and secret handling follows existing patterns

**Merge decision**
- [ ] APPROVE — ready to merge
- [ ] REQUEST CHANGES — comments left inline
- [ ] BLOCK — critical issue; do not merge

---

## Notes for Reviewer
<!-- Anything not captured above that the reviewer should know -->



---

> *"Language · Heritage · Intelligence"* — every merge is a step toward keeping Darreh-Shuri alive.
