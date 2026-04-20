# QashqAI Voice — Architecture Document v0.5

**Version:** 0.5 (Roadmap) | **Current Release:** 0.4.0 (Prototype)
**Author:** Siefollah Aslani
**Audiences:** LDA 2026 Berlin (academic), Code with Claude London (investor/technical)
**Last updated:** 2026-04-20

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Current State — v0.4.0](#2-current-state--v040)
3. [v0.5 Roadmap](#3-v05-roadmap)
4. [Technical Stack & Rationale](#4-technical-stack--rationale)
5. [Ethical Architecture](#5-ethical-architecture)
6. [Scalability Model](#6-scalability-model)
7. [London Demo Flow](#7-london-demo-flow)

---

## 1. System Overview

QashqAI Voice is a cultural-technological platform for preserving the Qashqai language — an endangered Turkic language spoken by approximately 1.5–2 million nomadic and semi-nomadic people in southwestern Iran. The platform combines ethical AI, community governance, and multilingual interface design to create living digital infrastructure for language revitalization.

### Three-Agent Pipeline

Every user message flows through a sequential pipeline of three specialized agents before a response is returned. No stage may be bypassed.

```
                    ┌─────────────────────────────────────────────────────────┐
                    │              ORCHESTRATOR AGENT                        │
                    │                                                         │
  User Message ─────┤                                                         │
  (Qashqai /        │   ┌──────────────┐   ┌──────────────┐   ┌───────────┐  │
   Persian /        │   │   AGENT 1    │   │   AGENT 2    │   │  AGENT 3  │  │
   Turkish /        │   │              │   │              │   │           │  │
   English)         │   │  Language    │──▶│  Cultural    │──▶│ Reasoning │  │
                    │   │  Detector    │   │  Guardian    │   │   Agent   │  │
                    │   │              │   │              │   │           │  │
                    │   │  Heuristic   │   │  Safety &    │   │ Claude    │  │
                    │   │  Unicode     │   │  Respect     │   │ Opus 4.6  │  │
                    │   │  Analysis    │   │  Validation  │   │ Adaptive  │  │
                    │   │              │   │              │   │ Thinking  │  │
                    │   └──────────────┘   └──────────────┘   └───────────┘  │
                    │         │                   │                  │        │
                    │         ▼                   ▼                  ▼        │
                    │    {language,           "passed" /        Final text    │
                    │     confidence}          "blocked"        response      │
                    │                                                         │
                    └────────────────────────────────────────┬────────────────┘
                                                             │
                                                             ▼
                                                      JSON Response
                                                    {detected_language,
                                                     steps[],
                                                     final}
```

### Data Pipeline (Claude Code Agents)

A separate three-stage pipeline governs language data collection and processing, executed through Claude Code subagents with automated hook-based governance:

```
  Speaker Audio ──▶ /intake ──▶ /review ──▶ /process ──▶ Dataset
                    (voice-     (cultural-   (language-
                    collector)   guardian)     processor)

  Hooks enforce:
  ├── pre-data-operation.sh  — session log required; restricted content gated
  ├── consent-gate.sh        — blocks processing without confirmed consent
  └── post-session-log.sh    — appends entry to project register
```

### High-Level Architecture

```
  ┌──────────────────────────────────────────────────────────────────────┐
  │                         CLIENT LAYER                                 │
  │                                                                      │
  │  Next.js 16 (App Router)  ·  React 19  ·  TypeScript 5.9            │
  │                                                                      │
  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────────┐  │
  │  │   Home /   │  │ Classroom  │  │ Dictionary │  │   ChatDemo    │  │
  │  │   Landing  │  │  /classroom│  │ /dictionary│  │  (component)  │  │
  │  └────────────┘  └────────────┘  └────────────┘  └───────────────┘  │
  │        │                │               │               │            │
  └────────┼────────────────┼───────────────┼───────────────┼────────────┘
           │           POST /chat      (client-side)   POST /chat
           │                │                          POST /detect
           ▼                ▼                               ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │                         API LAYER                                    │
  │                                                                      │
  │  FastAPI  ·  Uvicorn  ·  Pydantic  ·  CORS                          │
  │                                                                      │
  │  GET  /         → Health check                                       │
  │  POST /detect   → Language detection (heuristic, no LLM)             │
  │  POST /chat     → Full three-agent pipeline                          │
  └──────────────────────────────────────────────────────────────────────┘
           │
           ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │                       INTELLIGENCE LAYER                             │
  │                                                                      │
  │  Claude Opus 4.6  ·  Adaptive Extended Thinking                      │
  │  Anthropic AsyncAnthropic SDK  ·  Streaming                          │
  │                                                                      │
  │  4 language-specific system prompts:                                  │
  │    qashqai → Turkish (instructs Qashqai Turkic response)             │
  │    fa      → Persian (full Persian, Qashqai-aware)                   │
  │    tr      → Turkish (full Turkish, Qashqai connections)             │
  │    en      → English (explains Qashqai context)                      │
  └──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Current State — v0.4.0

### What exists today

| Component | Status | Description |
|-----------|--------|-------------|
| Three-agent pipeline | Production-ready | Language detection + Cultural Guardian + Claude Opus reasoning |
| Language detector | Stable | Heuristic Unicode script analysis; zero ML dependencies; offline-capable |
| Cultural Guardian | Minimal | Empty-text validation; designed for community-rule extension |
| Reasoning Agent | Stable | Claude Opus 4.6 with adaptive thinking; 4 language-specific system prompts |
| Landing page | Complete | Hero, language grid, pipeline visualization, ethics section, milestones timeline |
| Classroom | Beta | 8 Qashqai phrase cards (Qashqai/English/Persian), chat practice with Qashqai-only sample chips |
| Living Dictionary | Beta | 50+ words across 11 categories; search, filtering, Web Speech API pronunciation; 5-language display (Qashqai/Latin/Persian/German/English) |
| ChatDemo component | Stable | Reusable `'use client'` component; language selector, sample chips, RTL/LTR auto-direction, ARIA live regions |
| Data pipeline agents | Configured | voice-collector, cultural-guardian, language-processor with hook-based governance |
| Community Consent Framework | v1.0 published | Foundational governance document for all data collection |

### API surface

```
GET  /              → { project, status, endpoints }
POST /detect        → { language, confidence }
POST /chat          → { detected_language, steps[], final }
```

### Known limitations (v0.4.0)

- **No voice input** — text-only interaction
- **No offline mode** — requires internet for Claude API calls
- **Cultural Guardian is minimal** — only validates non-empty text
- **No authentication** — open API without rate limiting
- **No test suite** — no pytest, no Jest, no Playwright
- **Classroom orthography** — not yet community-validated
- **Dictionary is client-side only** — no persistent storage, no community contribution workflow

---

## 3. v0.5 Roadmap

### 3.1 Voice Recording Module

**Motivation:** The Qashqai language is primarily oral. Text-based tools exclude the majority of speakers — many of whom are elderly, semi-literate in Arabic script, or more comfortable speaking than writing. Voice is not a feature; it is the medium of the language itself.

```
  ┌─────────────────────────────────────────────────────┐
  │              VOICE RECORDING MODULE                  │
  │                                                      │
  │  Browser MediaRecorder API                           │
  │  ├── Consent capture (visual + audio confirmation)   │
  │  ├── Waveform visualization (Canvas/WebAudio)        │
  │  ├── Metadata tagging (speaker, dialect, context)    │
  │  └── Upload to /voice/submit                         │
  │                                                      │
  │  Backend pipeline:                                   │
  │  ├── POST /voice/submit → validate + store           │
  │  ├── Whisper-based transcription (future)             │
  │  ├── Cultural Guardian review (mandatory)             │
  │  └── Dataset integration via /process                │
  └─────────────────────────────────────────────────────┘
```

**Technical decisions:**
- MediaRecorder API for browser-native recording — no plugins, works on mobile
- WebM/Opus codec for size efficiency; WAV fallback for archival quality
- Client-side waveform via Web Audio API — visual feedback builds speaker confidence
- All recordings tagged with consent status, dialect region, speaker pseudonym
- No recording leaves the device without explicit, informed consent confirmation

### 3.2 Father Interview Module

**Motivation:** The most urgent data for endangered language preservation is the speech of elder native speakers. This module is designed for structured interview sessions with Qashqai elders — starting with my own father, a native Qashqai speaker from the Amaleh tribe.

```
  ┌─────────────────────────────────────────────────────┐
  │            FATHER INTERVIEW MODULE                   │
  │                                                      │
  │  Interview Template Engine                           │
  │  ├── Structured topic prompts (kinship, migration,   │
  │  │   seasons, animal husbandry, traditional crafts)  │
  │  ├── Open-ended narrative capture                    │
  │  ├── Multi-turn session management                   │
  │  └── Pause/resume with timestamp markers             │
  │                                                      │
  │  Cultural Metadata Layer                             │
  │  ├── Dialect: Amaleh (آمَلِه) tribal variant          │
  │  ├── Topic sensitivity tier (1–2)                    │
  │  ├── Community attribution preferences               │
  │  └── Intergenerational context tags                  │
  │                                                      │
  │  Output                                              │
  │  ├── Timestamped audio segments                      │
  │  ├── Speaker-verified transcription                  │
  │  ├── Cultural guardian annotation                    │
  │  └── Aligned parallel text (Qashqai ↔ Persian/EN)   │
  └─────────────────────────────────────────────────────┘
```

**Design principles:**
- Interview flows are unhurried — UI accommodates pauses, repetition, and storytelling rhythm
- Every session produces a session log registered in `project_register.md`
- Tier 2 (restricted) content is flagged immediately and routed to `data/restricted/`
- Speaker can review, redact, or withdraw any recording at any time

### 3.3 Offline Dictionary

**Motivation:** Many Qashqai communities have limited or no internet access. The dictionary must work fully offline — searchable, pronounceable, and expandable without connectivity.

```
  ┌─────────────────────────────────────────────────────┐
  │             OFFLINE DICTIONARY                       │
  │                                                      │
  │  Storage: IndexedDB (client) + Service Worker cache  │
  │  ├── Full lexicon synced on first load                │
  │  ├── Incremental updates when online                  │
  │  ├── Search + filter fully client-side                │
  │  └── Web Speech API pronunciation (offline-capable)   │
  │                                                      │
  │  Community Contribution Workflow                      │
  │  ├── "Suggest a word" form → queued locally           │
  │  ├── Sync to server when connectivity returns         │
  │  ├── Cultural Guardian review before publication      │
  │  └── Attribution to contributing speaker/community    │
  │                                                      │
  │  Data Schema (per entry)                             │
  │  ├── qashqai (Arabic script, full vowel markings)    │
  │  ├── latin (transliteration)                         │
  │  ├── phonetic (IPA)                                  │
  │  ├── persian, turkish, english, german               │
  │  ├── category, dialect_notes, usage_examples         │
  │  ├── audio_ref (optional recorded pronunciation)     │
  │  └── contributor_id, cultural_tier, verified_by      │
  └─────────────────────────────────────────────────────┘
```

### v0.5 Architecture Diagram

```
  ┌──────────────────────────────────────────────────────────────────┐
  │                        v0.5 CLIENT                               │
  │                                                                  │
  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
  │  │  Home    │ │Classroom │ │Dictionary│ │Interview │           │
  │  │         │ │  + Chat  │ │ (Offline) │ │ Module   │           │
  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
  │       │            │            │             │                  │
  │  ┌────┴────────────┴────────────┴─────────────┴───────────────┐ │
  │  │                  Service Worker                             │ │
  │  │  ├── Offline dictionary cache (IndexedDB)                   │ │
  │  │  ├── Static asset caching                                   │ │
  │  │  └── Queue: voice uploads, word suggestions                 │ │
  │  └────────────────────────────────────────────────────────────┘ │
  │       │            │                          │                  │
  └───────┼────────────┼──────────────────────────┼──────────────────┘
          │            │                          │
          ▼            ▼                          ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │                        v0.5 API                                  │
  │                                                                  │
  │  Existing:                    New:                               │
  │  GET  /                       POST /voice/submit                 │
  │  POST /detect                 GET  /dictionary/sync              │
  │  POST /chat                   POST /dictionary/suggest           │
  │                               POST /interview/session            │
  │                               GET  /interview/templates          │
  └──────────────────────────────────────────────────────────────────┘
```

---

## 4. Technical Stack & Rationale

### Backend

| Technology | Version | Rationale |
|------------|---------|-----------|
| **Python 3** | 3.12+ | Dominant in NLP/ML ecosystems; Anthropic SDK is Python-first; async support via `asyncio` |
| **FastAPI** | Latest | Async-native, auto-generated OpenAPI docs, Pydantic validation — ideal for prototype-to-production path |
| **Uvicorn** | Latest | ASGI server; lightweight, production-grade with `--workers` scaling |
| **Pydantic** | v2 | Schema validation at API boundary; type-safe request/response models |
| **Anthropic SDK** | Latest | Official async client; streaming support; native extended thinking integration |

### Frontend

| Technology | Version | Rationale |
|------------|---------|-----------|
| **Next.js** | 16 | App Router for file-based routing; server components for SEO; API proxying in dev |
| **React** | 19 | Latest concurrent features; `use client` boundary for interactive components |
| **TypeScript** | 5.9 | Type safety across the frontend; catches RTL/LTR direction bugs at compile time |

### AI Model

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Primary model** | Claude Opus 4.6 | Deepest reasoning capability; critical for nuanced understanding of an under-resourced language with no training data |
| **Thinking mode** | Adaptive | Model allocates extended thinking proportionally to complexity; efficient for simple greetings, thorough for cultural questions |
| **Streaming** | AsyncAnthropic stream | Reduces perceived latency; critical for conversational UX |

### Language Detection

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Approach** | Heuristic Unicode analysis | Zero ML dependencies; instant response; works fully offline; no training data needed for a language with minimal digital corpus |
| **Script analysis** | Arabic range + Qashqai-specific vowel markers (`ۆۉۊۋ`) | These characters are diagnostic — present in Qashqai Arabic script but absent in standard Persian |
| **Function words** | 11 high-frequency Qashqai words | Fallback for texts without diagnostic characters; provides medium-confidence classification |

**Why not ML-based detection?** Qashqai has virtually no representation in any language identification training corpus. A heuristic approach that leverages the language's distinctive orthographic features outperforms any general-purpose classifier for this specific task. This is a deliberate, informed decision — not a shortcut.

### Why no database (yet)?

The current prototype stores no persistent data. This is intentional:

1. **Consent-first architecture** — we build the governance framework before building the data store
2. **Data sovereignty** — storage decisions must be made with community input, not assumed
3. **Prototype velocity** — stateless API allows rapid iteration without migration overhead
4. **v0.5 plan** — IndexedDB for client-side dictionary; server-side storage decisions pending community consultation

---

## 5. Ethical Architecture

### 5.1 Community Consent Framework

Consent is not a checkbox — it is the architectural foundation. The Community Consent Framework v1.0 (published April 2026) establishes:

```
  ┌─────────────────────────────────────────────────────────────┐
  │                 CONSENT ARCHITECTURE                         │
  │                                                              │
  │  Layer 1: Individual Speaker Consent                         │
  │  ├── Informed consent in speaker's preferred language        │
  │  ├── Right to review, redact, or withdraw at any time        │
  │  ├── Consent is per-session, per-use — not blanket           │
  │  └── consent-gate.sh hook blocks all processing without it   │
  │                                                              │
  │  Layer 2: Community Governance                               │
  │  ├── Cultural Guardian review before any data reaches LLM    │
  │  ├── Tier system: Tier 1 (open) vs Tier 2 (restricted)       │
  │  ├── Community elders approve Tier 2 usage                   │
  │  └── Cultural sensitivity classification on every artifact   │
  │                                                              │
  │  Layer 3: Technical Enforcement                              │
  │  ├── pre-data-operation.sh — session log required            │
  │  ├── consent-gate.sh — blocks unconsented speaker data       │
  │  ├── post-session-log.sh — audit trail in project register   │
  │  └── Tier 2 data physically segregated in data/restricted/   │
  └─────────────────────────────────────────────────────────────┘
```

### 5.2 Cultural Data Sovereignty

QashqAI Voice operates on the principle that language data belongs to its speakers and their community — not to the platform, the developer, or any external institution.

**Five non-negotiable principles:**

| # | Principle | Technical enforcement |
|---|-----------|----------------------|
| 1 | **Consent before data** | `consent-gate.sh` hook blocks all Bash commands on a speaker ID without confirmed consent |
| 2 | **Guardian before model** | `OrchestratorAgent.run()` always invokes `CulturalGuardianAgent` before `ReasoningAgent` — hardcoded pipeline order |
| 3 | **Restricted data stays restricted** | `pre-data-operation.sh` blocks writing restricted content outside `data/restricted/` |
| 4 | **Dialect is not error** | Language detector preserves dialect variation; system prompts instruct Claude to respect Qashqai as-is, never "correct" toward Turkish or Persian |
| 5 | **Cultural integrity is the mission** | All content is strictly cultural and educational — never political; this constraint is encoded in system prompts and Cultural Guardian logic |

### 5.3 UNESCO Alignment

QashqAI Voice aligns with multiple UNESCO frameworks for endangered language preservation:

| UNESCO Framework | QashqAI Voice Alignment |
|-----------------|------------------------|
| **UNESCO Atlas of the World's Languages in Danger** | Qashqai is classified as "vulnerable" — our platform addresses the digital gap that accelerates language loss |
| **Convention for the Safeguarding of Intangible Cultural Heritage (2003)** | Voice recording and interview modules preserve oral tradition as intangible heritage |
| **UNESCO Recommendation on Open Science (2021)** | Open-source architecture; community-governed data; transparent AI pipeline |
| **UNESCO Decade of Indigenous Languages (2022–2032)** | Direct contribution to the decade's goals; platform designed for replication across indigenous language communities |
| **Sustainable Development Goal 11.4** | Strengthening efforts to protect and safeguard cultural and linguistic heritage |

### 5.4 Ethical AI Principles

```
  TRADITIONAL APPROACH              QashqAI VOICE APPROACH
  ─────────────────────             ──────────────────────
  Extract → Train → Deploy         Listen → Protect → Serve

  Data as resource                  Data as heritage
  Community as source               Community as owner
  Language as dataset               Language as living identity
  Speed of collection               Depth of consent
  Model accuracy                    Cultural accuracy
  Scale first                       Trust first
```

---

## 6. Scalability Model

### Adapting for other endangered languages

QashqAI Voice is designed as a reference architecture, not a one-off project. The platform's modular design enables adaptation for other endangered languages with minimal structural changes.

### Language Adaptation Layer

```
  ┌─────────────────────────────────────────────────────────────┐
  │              LANGUAGE ADAPTATION LAYER                       │
  │                                                              │
  │  To support a new language, configure:                       │
  │                                                              │
  │  1. DETECTION MODULE                                         │
  │     └── Add Unicode ranges + diagnostic markers              │
  │         (e.g., Zazaki-specific characters, Luri diacritics)  │
  │                                                              │
  │  2. SYSTEM PROMPTS                                           │
  │     └── Language-specific Claude system prompt               │
  │         (cultural context, response language, constraints)   │
  │                                                              │
  │  3. CULTURAL GUARDIAN RULES                                  │
  │     └── Community-defined sensitivity rules                  │
  │         (what is sacred, what is restricted, what is open)   │
  │                                                              │
  │  4. DICTIONARY SCHEMA                                        │
  │     └── Script + transliteration + phonetic + translations   │
  │         (schema already supports multi-script)               │
  │                                                              │
  │  5. CONSENT FRAMEWORK                                        │
  │     └── Adapt governance to community structures             │
  │         (tribal councils, elder approval, regional norms)    │
  └─────────────────────────────────────────────────────────────┘
```

### Candidate languages (same architectural fit)

| Language | Speakers | Region | Script | Architectural similarity |
|----------|----------|--------|--------|-------------------------|
| **Zazaki** | ~1.5M | Turkey | Latin + Arabic | Turkic family; similar diaspora context |
| **Luri** | ~4M | Iran | Arabic | Geographic overlap; shared cultural markers |
| **Balochi** | ~8M | Iran/Pakistan | Arabic + Latin | Multi-script; cross-border community |
| **Uyghur** | ~10M | China/diaspora | Arabic + Latin | Turkic family; digital preservation urgent |
| **Aromanian** | ~250K | Balkans | Latin | Small community; oral tradition dominant |
| **Sámi languages** | ~25K | Scandinavia | Latin | Existing digital infrastructure to build on |

### Scaling architecture

```
                        ┌───────────────────────┐
                        │   QashqAI Platform     │
                        │   (shared infra)       │
                        └───────────┬───────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                   │
          ┌──────▼──────┐   ┌──────▼──────┐   ┌───────▼──────┐
          │  Qashqai    │   │   Zazaki    │   │   Luri       │
          │  Instance   │   │  Instance   │   │  Instance    │
          │             │   │             │   │              │
          │ Detection   │   │ Detection   │   │ Detection    │
          │ Guardian    │   │ Guardian    │   │ Guardian     │
          │ Prompts     │   │ Prompts     │   │ Prompts      │
          │ Dictionary  │   │ Dictionary  │   │ Dictionary   │
          │ Consent     │   │ Consent     │   │ Consent      │
          └─────────────┘   └─────────────┘   └──────────────┘

  Each instance is:
  - Governed by its own community
  - Configured with its own cultural rules
  - Linguistically independent
  - Architecturally identical
```

### What scales vs. what doesn't

| Scales directly | Requires community work |
|----------------|------------------------|
| Pipeline architecture (3-agent pattern) | Cultural Guardian rules — must be defined by each community |
| API structure and data models | Consent framework — governance structures vary |
| Frontend components (ChatDemo, Dictionary) | Dictionary content — linguistic data must come from speakers |
| Claude integration (model + streaming) | System prompts — cultural context is language-specific |
| Data pipeline hooks and governance tooling | Community trust — cannot be templated or accelerated |

---

## 7. London Demo Flow

**Event:** Code with Claude London
**Date:** 19 May 2026
**Duration:** Live demo segment (~5 minutes)

### Demo Script

```
  PHASE 1: THE PROBLEM (60 seconds)
  ──────────────────────────────────
  "1,500+ languages will fall silent this century. Qashqai — a Turkic
   language spoken by nomadic communities in Iran — has no keyboard
   standard, no spell checker, no Wikipedia, and no seat at the table
   of the AI revolution. Until now."

  → Show: UNESCO statistics, Qashqai community photograph

  PHASE 2: LIVE PIPELINE DEMO (120 seconds)
  ──────────────────────────────────────────
  Step 1: Type a Qashqai phrase: "سلام، سن نئجه‌سین؟"
  → Watch: Language Detector identifies Qashqai (confidence: medium)
  → Watch: Cultural Guardian approves content
  → Watch: Claude responds in Qashqai Turkic with cultural awareness

  Step 2: Switch to Persian: "سلام، چطوری؟"
  → Watch: Pipeline adapts — Persian detection, Persian response,
           Qashqai cultural connections maintained

  Step 3: English query: "What is the Qashqai word for water?"
  → Watch: Claude explains "سۇ" (su) with cultural context about
           nomadic water sources and seasonal migration

  PHASE 3: DICTIONARY + CLASSROOM (60 seconds)
  ─────────────────────────────────────────────
  → Show: Living Dictionary — search "sheep" → قۆیۇن (qoyun)
  → Show: Web Speech API pronunciation
  → Show: Classroom phrase cards with RTL rendering
  → Show: 11 categories, 50+ words, 5 languages

  PHASE 4: ETHICAL ARCHITECTURE (60 seconds)
  ──────────────────────────────────────────
  → Show: Pipeline diagram — Guardian ALWAYS runs before Claude
  → Explain: "Consent is not a feature. It's a hook that blocks
              our entire data pipeline if consent isn't confirmed."
  → Show: consent-gate.sh in action

  PHASE 5: VISION (60 seconds)
  ────────────────────────────
  → Show: v0.5 roadmap — Voice Recording, Father Interview, Offline
  → Show: Scalability model — "This architecture works for any
           endangered language. Swap the detection rules, the system
           prompts, and the cultural guardian — the pipeline is the same."
  → Close: "The first voice we're recording is my father's. He's a
            native Qashqai speaker from the Amaleh tribe. His language
            has never been inside a computer. That changes now."
```

### Technical requirements for demo

| Requirement | Solution |
|-------------|----------|
| Backend running | `uvicorn app.main:app --reload` on localhost:8000 |
| Frontend running | `npm run dev` on localhost:3000 |
| API key | `ANTHROPIC_API_KEY` set in environment |
| Network | Required for Claude API calls; dictionary works offline |
| Fallback | Pre-recorded video of pipeline in case of network failure |
| Browser | Chrome or Firefox with Web Speech API support |

### Key talking points for investor audience

1. **Market timing** — UNESCO Decade of Indigenous Languages (2022–2032) creates institutional demand; no competing AI-native platform exists for endangered language preservation
2. **Technical moat** — heuristic language detection for languages with zero ML training data; Claude's extended thinking enables nuanced responses in under-resourced languages
3. **Ethical differentiation** — consent-first architecture is not just principled, it's the only approach that earns community trust — without which there is no data, no product, no impact
4. **Scalability** — the adaptation layer means each new language is a configuration change, not a rebuild; the community governance work is the bottleneck, not the technology
5. **Built with Claude** — the entire platform — backend reasoning, data pipeline governance, development workflow — runs on Anthropic infrastructure; this is a showcase of what Claude enables

---

## Appendix A: File Map

```
qashqai-voice-platform/
├── ARCHITECTURE.md              ← This document
├── CLAUDE.md                    ← Project instructions and configuration
├── requirements.txt             ← Python: fastapi, uvicorn, anthropic
├── app/
│   ├── main.py                  ← FastAPI backend: agents, detection, routes
│   ├── package.json             ← Node: Next.js 16, React 19, TypeScript 5.9
│   ├── app/
│   │   ├── page.tsx             ← Landing page (v0.4.0)
│   │   ├── layout.tsx           ← Root layout
│   │   ├── globals.css          ← Design system
│   │   ├── classroom/
│   │   │   └── page.tsx         ← Classroom (Beta)
│   │   └── dictionary/
│   │       └── page.tsx         ← Living Dictionary (Beta)
│   ├── classroom/
│   │   └── page.tsx             ← Classroom alt route
│   └── components/
│       └── ChatDemo.tsx         ← Reusable chat UI component
├── .claude/
│   ├── agents/                  ← Data pipeline agent definitions
│   ├── rules/                   ← Development rules and standards
│   └── settings.json            ← Hook configuration
└── hooks/
    ├── pre-data-operation.sh    ← Session log + restricted content gate
    ├── consent-gate.sh          ← Blocks unconsented data processing
    └── post-session-log.sh      ← Audit trail in project register
```

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Qashqai** (قشقایی) | A Southwestern Turkic language spoken by the Qashqai people, a tribal confederation in Fars Province, Iran |
| **Amaleh** (آمَلِه) | A Qashqai tribal division; the dialect variant of the project founder's family |
| **Cultural Guardian** | An agent in the pipeline that validates content for cultural safety before any LLM processing |
| **Tier 1 / Tier 2** | Data sensitivity classification: Tier 1 is openly shareable; Tier 2 is restricted and requires community elder approval |
| **Extended Thinking** | Claude's capability to allocate additional reasoning tokens for complex questions, controlled via the `thinking` parameter |
| **Adaptive Thinking** | A mode where Claude dynamically decides how much extended thinking to use based on question complexity |
| **Consent Gate** | A shell hook that blocks all data pipeline operations on a speaker ID until consent is confirmed in the session log |

---

*QashqAI Voice — giving a digital future to voices that history ignored.*
*LDA 2026 Berlin (Submission ID: 713903) · Code with Claude London (19 May 2026)*
