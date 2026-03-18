# QashqAI Voice Platform

A cultural–technological initiative for preserving the Qashqai language — an endangered Turkic language spoken in Iran — through ethical, community-centred artificial intelligence. The platform routes multilingual messages through a three-agent pipeline: language detection → cultural safety check → language-aware reasoning powered by Claude.

## Tech stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Backend  | Python 3, FastAPI, Uvicorn, Pydantic            |
| AI       | Anthropic SDK — `claude-opus-4-6`, adaptive thinking |
| Frontend | TypeScript, React 19, Next.js 16 (App Router)   |

## Project structure

```
qashqai-voice-platform/
├── app/                        # Next.js project root
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home page — hero, language grid, pipeline diagram, chat demo
│   │   ├── layout.tsx          # Root layout — metadata, globals.css import
│   │   └── globals.css         # Design system — CSS tokens, reset, component classes
│   ├── classroom/
│   │   └── page.tsx            # Classroom page — phrase cards + chat practice (Beta)
│   ├── components/
│   │   └── ChatDemo.tsx        # Reusable chat UI — language selector, sample chips, agent output
│   ├── main.py                 # FastAPI backend — agents, language detection, API routes
│   ├── package.json            # Node deps: Next.js 16, React 19
│   └── node_modules/           # Installed — ready to run
├── requirements.txt            # Python deps: fastapi, uvicorn, anthropic
└── CLAUDE.md
```

## Supported languages

| Code      | Language | Script     |
|-----------|----------|------------|
| `qashqai` | Qashqai  | Arabic RTL |
| `fa`      | Persian  | Arabic RTL |
| `tr`      | Turkish  | Latin      |
| `en`      | English  | Latin      |

## Running the backend

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-...        # required — used by ReasoningAgent
uvicorn app.main:app --reload          # run from qashqai-voice-platform/
```

- API root:     http://localhost:8000
- Swagger docs: http://localhost:8000/docs
- ReDoc:        http://localhost:8000/redoc

## Running the frontend

```bash
cd app
npm install        # already done — node_modules present
npm run dev        # Next.js dev server on http://localhost:3000
```

Next.js proxies `/chat` and `/detect` to the FastAPI backend on port 8000.
For production, configure `next.config.js` with a `rewrites` rule.

## API reference

### `GET /`
Health check. Returns project name, status, and available endpoints.

```json
{ "project": "QashqAI Voice", "status": "running", "endpoints": ["/chat", "/detect"] }
```

### `POST /detect`
Detect the language of a text snippet — no agent pipeline involved.

```json
{ "text": "سن نئجه‌سین؟" }
```
Response:
```json
{ "language": "qashqai", "confidence": "medium" }
```

### `POST /chat`
Run the full three-agent pipeline. `language` is optional — omit it for auto-detection.

```json
{ "text": "من قاشقایام" }
{ "language": "fa", "text": "سلام، چطوری؟" }
```
Response:
```json
{
  "detected_language": "qashqai",
  "steps": [
    { "agent": "language_detector", "text": "Detected language='qashqai' (confidence: medium)." },
    { "agent": "cultural_guardian", "text": "Cultural check passed for language='qashqai'. Content looks respectful." },
    { "agent": "reasoner",          "text": "…Claude response in Qashqai/Persian/Turkish…" }
  ],
  "final": { "agent": "reasoner", "text": "…" }
}
```

## Architecture

### Three-agent pipeline (`app/main.py`)

```
OrchestratorAgent.run(msg)
  1. detect_language(text)    → if language not provided by caller
  2. CulturalGuardianAgent    → content safety / respectfulness check
  3. ReasoningAgent           → Claude-powered, language-specific response
```

#### Agent 1 — Language Detector (`detect_language()`)
Pure heuristic — no ML dependencies. Uses Unicode script analysis:

- Arabic-script characters + Qashqai-specific vowel markers (`ۆۉۊۋ`) or ≥ 2 Qashqai function words → `qashqai`
- Arabic-script characters otherwise → `fa`
- Latin characters + Turkish diacritics (`ğ ş ı ö ü ç`) → `tr`
- Latin characters otherwise → `en`

Confidence levels: `low` / `medium` / `high` — reported in the pipeline steps.

#### Agent 2 — Cultural Guardian (`CulturalGuardianAgent`)
Validates content before it reaches the LLM. Currently checks for empty text; designed to be extended with community-defined cultural safety rules or an LLM-based classifier.

#### Agent 3 — Reasoning Agent (`ReasoningAgent`)
Powered by **`claude-opus-4-6`** with `"thinking": {"type": "adaptive"}` (extended thinking).
Selects a language-specific system prompt at runtime:

| Language  | System prompt language              |
|-----------|-------------------------------------|
| `qashqai` | Turkish — instructs response in Qashqai Turkic, with Persian/Turkish support |
| `fa`      | Persian — full Persian response, Qashqai cultural awareness |
| `tr`      | Turkish — full Turkish response, Qashqai cultural connections |
| `en`      | English — explains Qashqai context, responds in English |

Uses `anthropic.AsyncAnthropic` (async streaming). Raises `HTTPException` on auth, connection, or API errors.

### Frontend (`app/components/ChatDemo.tsx`)

Reusable `'use client'` React component used on both pages:

- Language selector: `auto` (default), `qashqai`, `fa`, `tr`, `en`
- Sample phrase chips: click-to-fill
- `dir="auto"` on textarea and output — handles RTL/LTR automatically
- ARIA live region on output (`aria-live="polite"`) for accessibility
- Fetches `POST /chat` with `{ text }` or `{ language, text }`

### Pages

| Route        | File                     | Description                                              |
|--------------|--------------------------|----------------------------------------------------------|
| `/`          | `app/app/page.tsx`       | Hero, language grid, pipeline diagram, chat demo         |
| `/classroom` | `app/classroom/page.tsx` | Phrase card vocabulary table + chat practice (Beta)      |

The Classroom page (`/classroom`) displays 8 Qashqai phrases with English and Persian translations, and uses Qashqai-only sample chips in the chat demo to keep practice on-topic.

## Environment variables

| Variable            | Required | Description                       |
|---------------------|----------|-----------------------------------|
| `ANTHROPIC_API_KEY` | Yes      | Used by `ReasoningAgent` to call Claude |

No `.env` management is configured. Set the variable in your shell before starting the backend.

## Development notes

- **Version**: `0.3.0` (prototype) — shown in UI header and footer.
- **No tests** — add `pytest` + `httpx` for backend; Jest + React Testing Library for frontend.
- **No linting** — recommended: `ruff` for Python, ESLint + Prettier for TypeScript.
- **API base URL** is hardcoded to relative paths (`/chat`, `/detect`) in `ChatDemo.tsx` — relies on Next.js dev proxy or a production reverse proxy.
- **Cultural Guardian** logic is minimal (empty-text check only). Extend `handle()` with community-validated rules for production use.
- **Classroom orthography** is illustrative and not yet community-validated — noted in the UI with a beta disclaimer.
