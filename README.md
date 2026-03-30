# QashqAI Voice Platform

A cultural–technology initiative preserving the Qashqai language — an endangered Turkic language spoken in Iran — through ethical, community-centred artificial intelligence.

The platform routes multilingual messages through a three-agent pipeline (language detection → cultural safety check → language-aware reasoning) and provides a structured, consent-based pathway for collecting and archiving Qashqai voice data.

**Version:** 0.3.0 (prototype) · **Founder:** Siefollah Aslani

---

## Contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Quick start](#quick-start)
- [API reference](#api-reference)
- [Data pipeline](#data-pipeline)
- [Supported languages](#supported-languages)
- [Architecture](#architecture)
- [Environment variables](#environment-variables)
- [Development notes](#development-notes)
- [Contributing](#contributing)
- [Security](#security)
- [Licence](#licence)

---

## Overview

The Qashqai language has an estimated 1–1.5 million speakers, but no standardised digital presence, no large-scale speech corpus, and limited institutional support. QashqAI Voice addresses this in two complementary ways:

1. **Live platform** — A chat interface where users can write in Qashqai, Persian, Turkish, or English and receive culturally-aware, language-appropriate responses powered by Claude.
2. **Data pipeline** — A consent-based, community-governed workflow for collecting, reviewing, and archiving Qashqai voice recordings and transcriptions for future speech and language model research.

Both components are governed by the same ethical principles: consent before data, cultural integrity before utility, community authority over their own knowledge.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3, FastAPI, Uvicorn, Pydantic |
| AI | Anthropic SDK — `claude-opus-4-6`, adaptive thinking |
| Frontend | TypeScript, React 19, Next.js 16 (App Router) |
| Data pipeline | Claude Code agents, Bash hooks, Markdown governance docs |

---

## Project structure

```
qashqai-voice-platform/
├── app/                          # Next.js project root
│   ├── app/                      # App Router pages
│   │   ├── page.tsx              # Home — hero, language grid, pipeline diagram, chat demo
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Design system — CSS tokens, reset, component classes
│   ├── classroom/
│   │   └── page.tsx              # Classroom — phrase cards + chat practice (Beta)
│   ├── components/
│   │   └── ChatDemo.tsx          # Reusable chat UI
│   ├── main.py                   # FastAPI backend — agents, language detection, API routes
│   └── package.json
├── .claude/
│   ├── agents/                   # Claude Code subagent definitions
│   │   ├── voice-collector.md    # Stage 1 — intake, consent, metadata
│   │   ├── cultural-guardian.md  # Stage 2 — cultural review, sensitivity tiers
│   │   └── language-processor.md # Stage 3 — normalization, dataset packaging
│   ├── commands/                 # Slash commands: /intake /review /process /pipeline-status
│   ├── skills/cultural-guardian/ # Cultural sensitivity skill + sensitivity tier reference
│   └── settings.json             # Hook configuration
├── hooks/                        # Data governance enforcement hooks
│   ├── consent-gate.sh           # Blocks processing without confirmed consent
│   ├── pre-data-operation.sh     # Guards data/ and metadata/ writes
│   └── post-session-log.sh       # Appends session entry to project register
├── 01_Core_Documents/            # Institutional introduction, one-pager, project summary
├── 02_Outreach/                  # Outreach emails, contact tracking, next actions
├── 03_MVP/                       # MVP scope, tech stack, data pipeline notes, session logs
├── 04_Funding/                   # Funding logic, budget narrative, donor Q&A
├── 05_Website_Content/           # Homepage and about-page copy
├── 06_Data_Governance/           # Consent framework, withdrawal protocol, governance notes
├── requirements.txt              # Python dependencies
├── CLAUDE.md                     # Claude Code configuration and principles
├── CONTRIBUTING.md
└── SECURITY.md
```

---

## Quick start

### Backend

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-...     # required
uvicorn app.main:app --reload       # run from project root
```

- API root: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Frontend

```bash
cd app
npm install
npm run dev                         # http://localhost:3000
```

Next.js proxies `/chat` and `/detect` to FastAPI on port 8000. For production, configure `rewrites` in `next.config.mjs`.

---

## API reference

### `GET /`
Health check.
```json
{ "project": "QashqAI Voice", "status": "running", "endpoints": ["/chat", "/detect"] }
```

### `POST /detect`
Detect the language of a text snippet.
```json
{ "text": "سن نئجه‌سین؟" }
```
Response:
```json
{ "language": "qashqai", "confidence": "medium" }
```

### `POST /chat`
Run the full three-agent pipeline. `language` is optional — omit for auto-detection.
```json
{ "text": "من قاشقایام" }
```
Response:
```json
{
  "detected_language": "qashqai",
  "steps": [
    { "agent": "language_detector", "text": "Detected language='qashqai' (confidence: medium)." },
    { "agent": "cultural_guardian", "text": "Cultural check passed for language='qashqai'." },
    { "agent": "reasoner",          "text": "…Claude response in Qashqai Turkic…" }
  ],
  "final": { "agent": "reasoner", "text": "…" }
}
```

---

## Data pipeline

Voice recordings and transcriptions move through a three-stage Claude Code agent pipeline enforced by automated hooks:

```
/intake  →  /review  →  /process
(voice-collector)  (cultural-guardian)  (language-processor)
```

| Stage | Agent | What it does |
|-------|-------|-------------|
| 1 | `voice-collector` | Consent verification, speaker metadata registration, file naming |
| 2 | `cultural-guardian` | Cultural accuracy review, sensitivity tier classification (0/1/2), annotation |
| 3 | `language-processor` | Transcription normalization, translation alignment, dataset packaging |

**Sensitivity tiers:** `0` public · `1` community-restricted · `2` restricted (ceremonial/sacred — held pending community approval).

No file moves to the next stage without the previous one completing. No file is processed without confirmed consent. Run `/pipeline-status` at the start of any session to see the current state.

---

## Supported languages

| Code | Language | Script |
|------|----------|--------|
| `qashqai` | Qashqai | Arabic RTL |
| `fa` | Persian | Arabic RTL |
| `tr` | Turkish | Latin |
| `en` | English | Latin |

---

## Architecture

### Live platform — three-agent pipeline (`app/main.py`)

```
OrchestratorAgent.run(msg)
  1. detect_language(text)      # heuristic — Unicode script analysis
  2. CulturalGuardianAgent      # content safety / respectfulness check
  3. ReasoningAgent             # claude-opus-4-6 with adaptive thinking
```

**Language Detector** uses Unicode script ranges and Qashqai-specific vowel markers (`ۆۉۊۋ`) and function words. No ML dependency.

**Cultural Guardian** validates content before it reaches the LLM. Currently checks for empty text; designed to be extended with community-defined rules or an LLM-based classifier.

**Reasoning Agent** uses `claude-opus-4-6` with `"thinking": {"type": "adaptive"}` and selects a language-specific system prompt at runtime (Qashqai Turkic, Persian, Turkish, or English).

### Frontend

- Language selector: `auto`, `qashqai`, `fa`, `tr`, `en`
- `dir="auto"` on input and output — RTL/LTR handled automatically
- ARIA live region (`aria-live="polite"`) on agent output
- Classroom page (`/classroom`) — 8 Qashqai phrases with Persian and English translations

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Used by `ReasoningAgent` to call Claude |

Set in your shell before starting the backend. No `.env` management is configured.

---

## Development notes

- No tests yet — recommended: `pytest` + `httpx` (backend), Jest + React Testing Library (frontend)
- No linting yet — recommended: `ruff` (Python), ESLint + Prettier (TypeScript)
- API base URL is hardcoded to relative paths in `ChatDemo.tsx` — relies on Next.js dev proxy or a production reverse proxy
- Classroom orthography is illustrative and not yet community-validated — noted in the UI

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute code, documentation, or language data.

---

## Security

See [SECURITY.md](SECURITY.md) for how to report vulnerabilities and how speaker data is protected.

---

## Licence

This project is licenced under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)** licence. See [LICENSE](LICENSE) for the full text.

You are free to share and adapt this work for non-commercial, academic, and educational purposes, provided you give attribution and distribute any adaptations under the same licence. Commercial use is not permitted without explicit written consent from the project founder.

All Qashqai language data, voice recordings, transcriptions, and cultural content collected through this platform remain the property of the contributing speakers and their communities, and are additionally governed by the consent and withdrawal framework in `06_Data_Governance/`.
