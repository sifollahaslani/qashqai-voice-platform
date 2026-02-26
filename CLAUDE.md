# QashqAI Voice Platform

A cultural–technological initiative for preserving the Qashqai (an endangered Turkic language spoken in Iran) through ethical artificial intelligence. The platform routes multilingual messages through a three-agent pipeline: language detection → cultural safety check → language-aware reasoning.

## Tech stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Python 3, FastAPI, Uvicorn, Pydantic |
| Frontend | TypeScript, React, Next.js           |

## Project structure

```
qashqai-voice-platform/
├── app/
│   ├── main.py        # FastAPI backend — agents, detection, API routes
│   ├── page.tsx       # Next.js home page — interactive chat demo UI
│   ├── layout.tsx     # Next.js root layout — metadata, globals.css import
│   └── globals.css    # Design system — tokens, reset, component classes
├── requirements.txt   # Python deps: fastapi, uvicorn
└── CLAUDE.md
```

## Running the backend

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

- API root:     http://localhost:8000
- Swagger docs: http://localhost:8000/docs
- ReDoc:        http://localhost:8000/redoc

## Running the frontend

The frontend is a Next.js app directory project. A `package.json` does not yet exist in the repo — bootstrap it with:

```bash
npm init -y
npm install next react react-dom
npm install -D typescript @types/react @types/node
npx next dev
```

The Next.js dev server (port 3000) should proxy `/chat` and `/detect` requests to the FastAPI backend on port 8000.

## API reference

### `GET /`
Health check. Returns project name, status, and available endpoints.

### `POST /detect`
Detect the language of a text snippet without running the full agent pipeline.

```json
{ "text": "سلام، سن نئجه‌سین؟" }
```
Response:
```json
{ "language": "qashqai", "confidence": "medium" }
```

### `POST /chat`
Run the full three-agent pipeline. `language` is optional — omit it for auto-detection.

```json
{ "language": "qashqai", "text": "من قاشقایام" }
```
```json
{ "text": "Merhaba!" }
```
Response:
```json
{
  "detected_language": "tr",
  "steps": [
    { "agent": "language_detector", "text": "Detected language='tr' (confidence: high)." },
    { "agent": "cultural_guardian", "text": "Cultural check passed for language='tr'. Content looks respectful." },
    { "agent": "reasoner",          "text": "Türkçe akıl yürütme: «Merhaba!»." }
  ],
  "final": { "agent": "reasoner", "text": "Türkçe akıl yürütme: «Merhaba!»." }
}
```

Supported language codes: `qashqai`, `fa` (Persian), `tr` (Turkish), `en` (English).

## Architecture

### Agent pipeline (`app/main.py`)

```
OrchestratorAgent.run(msg)
  1. detect_language(text)    → if language not provided
  2. CulturalGuardianAgent    → safety / content check
  3. ReasoningAgent           → language-specific response
```

`detect_language()` uses Unicode script heuristics (no ML dependencies):
- Arabic-script characters + Qashqai-specific markers → `qashqai`
- Arabic-script characters otherwise → `fa`
- Latin characters + Turkish diacritics (ğ ş ı ö ü ç) → `tr`
- Latin characters otherwise → `en`

### Frontend (`app/page.tsx`)

Client component (`'use client'`). Sections:
- **Hero** — mission statement
- **Languages** — badge grid for all four supported languages
- **Pipeline** — visual three-step flow diagram
- **Chat demo** — interactive form with language selector, sample phrase chips, and live agent output

## Development notes

- **No tests** exist yet. Add `pytest` + `httpx` for backend tests; Jest + React Testing Library for the frontend.
- **No linting** configured. Recommended: `ruff` for Python, ESLint + Prettier for TypeScript.
- **No environment variables** are used. API base URL is hardcoded to relative paths (`/chat`, `/detect`).
- The reasoning agents are placeholders — they echo back the input. Replace `ReasoningAgent.handle()` with real LLM calls when ready.
- Cultural safety logic in `CulturalGuardianAgent` is minimal. Expand `handle()` with community-defined rules or an LLM-based classifier.
