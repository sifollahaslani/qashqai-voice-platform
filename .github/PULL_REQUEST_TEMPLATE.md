<!--
  QashqAI Voice — Pull Request Template
  Fill out every section. Empty PRs will be closed without review.
-->

## Summary
<!-- 1–3 sentences: what this PR does and why -->



## Type of Change
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 🌍 Linguistic / cultural content (Qashqai vocabulary, proverbs, audio)
- [ ] 🎨 UI / design
- [ ] 🔧 Refactor / cleanup
- [ ] 📚 Documentation
- [ ] 🔒 Security
- [ ] ⚙️ Infrastructure / CI / deploy

## Layer 1 — Builder (Claude Code)
- [ ] Branch is a `feature/*`, `fix/*`, or `docs/*` branch (NOT `main`)
- [ ] Local tests pass / build succeeds
- [ ] No hardcoded secrets, API keys, or tokens
- [ ] Page paths follow `app/app/[page]/page.tsx` convention
- [ ] Brand color tokens used (no rogue hex values)

## Layer 2 — Reviewer (GPT-5.5)
- [ ] Diff exported (`git diff main...HEAD > /tmp/diff.patch`)
- [ ] `.claude/review-prompt.md` filled with the diff
- [ ] Pasted into a **fresh** GPT-5.5 conversation (no context carryover)
- [ ] GPT-5.5 verdict received

<details>
<summary>📋 GPT-5.5 Review Output (paste here)</summary>

```
[PASTE GPT-5.5 OUTPUT INCLUDING VERDICT LINE]
```

</details>

**GPT-5.5 Verdict:**
- [ ] ✅ APPROVE
- [ ] ⚠️ REQUEST_CHANGES (addressed in follow-up commits below)
- [ ] ❌ BLOCK (do not merge — see comments)

## Layer 3 — Version Control (GitHub)
- [ ] PR title follows Conventional Commits (e.g., `feat(dictionary): add 12 Darreh-Shuri verbs`)
- [ ] Diff size ≤ ~200 KB (split larger PRs)
- [ ] Linked issue / context: <!-- e.g., Closes #42 -->

## Layer 4 — Cultural Validation
**Does this PR add, modify, or remove any Qashqai linguistic / cultural content?**

- [ ] **NO** — purely technical change. Skip cultural validation.
- [ ] **YES** — cultural validation required:
  - [ ] Father (primary native speaker) consulted
  - [ ] Or: Qashqai community member consulted
  - [ ] Vowel markings verified
  - [ ] Confidence level assigned (Verified / Likely / Unverified)
  - [ ] Dialect attribution = Darreh-Shuri
  - [ ] Consent metadata present (where applicable)
  - [ ] Validator name / date in commit or PR comment

<!--
  Cultural validation is NON-NEGOTIABLE.
  No exceptions, even for "small" or "obvious" entries.
  When in doubt: BLOCK and consult.
-->

## Screenshots / Evidence
<!-- For UI changes: before / after. For data changes: sample entries. Optional otherwise. -->



## Notes for Reviewer
<!-- Anything the reviewer should know that isn't obvious from the diff -->



---

> 🌿 *"Language · Heritage · Intelligence"* — every merge is a step toward keeping Darreh-Shuri alive.
