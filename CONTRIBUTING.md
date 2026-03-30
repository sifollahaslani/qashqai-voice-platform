# Contributing to QashqAI Voice

Thank you for your interest in contributing to QashqAI Voice. This project is about more than software — it is about preserving a language and protecting a community. Please read this document carefully before contributing.

---

## Ways to contribute

### Code and technical work
- Bug fixes and improvements to the FastAPI backend or Next.js frontend
- Extending the Cultural Guardian logic with community-validated rules
- Improving language detection accuracy for Qashqai
- Adding tests (backend: `pytest` + `httpx`, frontend: Jest + React Testing Library)
- Performance, accessibility, or RTL rendering improvements

### Documentation
- Improving inline comments and docstrings
- Translating documentation into Persian (`fa`) or Turkish (`tr`)
- Clarifying setup instructions or API reference

### Language and cultural work
- Reviewing Qashqai phrase translations in the Classroom page
- Suggesting additional vocabulary or cultural context
- Providing feedback on the system prompts used for Qashqai responses
- Connecting the project with Qashqai linguists, community elders, or cultural institutions

### Voice data (future)
Voice data collection is not yet open to external contributors. When it opens, it will follow the consent and governance framework in `06_Data_Governance/`. All contributing speakers retain ownership of their recordings.

---

## Before you start

1. **Open an issue first** for any non-trivial change. Describe what you want to do and why. This avoids duplicated effort and ensures the change aligns with the project's direction.
2. **Read `CLAUDE.md`** — it describes the architectural principles and the non-negotiable rules around data governance.
3. **Read `06_Data_Governance/`** — if your contribution touches anything related to speaker data, consent, or cultural content, the governance framework applies to your work.

---

## Development setup

```bash
# Clone the repository
git clone https://github.com/sifollahaslani/qashqai-voice-platform.git
cd qashqai-voice-platform

# Backend
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-...
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd app
npm install
npm run dev
```

---

## Pull request guidelines

- Keep PRs focused — one concern per PR
- Write a clear description of what changed and why
- If you are changing language-facing behaviour (system prompts, language detection, Cultural Guardian logic), explain the reasoning
- Do not introduce hard-coded text in languages other than Qashqai, Persian, Turkish, or English without discussion
- Do not add dependencies without opening an issue first

---

## Cultural sensitivity guidelines

This project works with an endangered language and a living community. The following apply to all contributions:

- **Do not flatten dialect variation.** Qashqai has internal variation across tribal groups and regions. Do not normalise to a single standard form.
- **Do not present uncertain language as authoritative.** If you are unsure whether a word, phrase, or translation is correct, say so explicitly.
- **Respect the sensitivity tier system.** If you encounter content marked `community-restricted` or `restricted`, do not reproduce or redistribute it.
- **Community authority takes precedence.** If a Qashqai community member or linguist objects to how their language is represented, their view takes precedence over technical convenience.

---

## Reporting issues

Use the GitHub issue tracker. For security-related issues, see [SECURITY.md](SECURITY.md) — do not file them publicly.

---

## Code of conduct

Treat every contributor, community member, and speaker with respect. Discrimination, mockery of the Qashqai language or culture, or disregard for the consent and governance framework will result in removal from the project.

---

## Questions

Open a GitHub issue with the `question` label, or contact the project founder directly through the repository.
