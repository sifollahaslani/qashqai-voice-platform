# QashqAI Voice — Technical Brief

**Code with Claude London | 19 May 2026 | Siefollah Aslani**

---

## Problem

Over 1,500 languages will disappear this century. Qashqai — a Turkic language spoken by 1.5M+ nomadic people in Iran — has no keyboard standard, no spell checker, no Wikipedia, and zero representation in any AI training corpus. The speakers who carry this language are aging. Every month of inaction is permanent loss.

## Solution

QashqAI Voice is a consent-first AI platform that preserves endangered languages through a three-agent pipeline powered by Claude Opus 4.6. It detects Qashqai using heuristic Unicode analysis (no ML training data required), enforces cultural safety before every LLM call, and responds in four languages with full RTL support. The architecture is modular — each new endangered language is a configuration change, not a rebuild.

## Architecture

```
  Input ──▶ Language Detector ──▶ Cultural Guardian ──▶ Claude Opus 4.6 ──▶ Response
            (heuristic, offline)  (mandatory gate)      (adaptive thinking)

  Frontend: Next.js 16 · React 19 · TypeScript 5.9
  Backend:  FastAPI · Pydantic · Anthropic SDK (async streaming)
  Data:     Claude Code 3-agent pipeline with consent hooks
```

## Live Demo — What You Will See

- Type Qashqai script (`سلام، سن نئجه‌سین؟`) — pipeline detects the language, clears cultural safety, and Claude responds in Qashqai Turkic
- Switch to Persian, Turkish, English — same pipeline adapts instantly
- Living Dictionary: 50+ words, 11 categories, 5 languages, Web Speech API pronunciation
- Consent gate: a shell hook that blocks the entire data pipeline if speaker consent is unconfirmed

## Impact

| Metric | Value |
|--------|-------|
| Languages supported | 4 (Qashqai, Persian, Turkish, English) |
| Dictionary entries | 50+ across 11 semantic categories |
| Candidate languages for replication | 6 identified (Zazaki, Luri, Balochi, Uyghur, Aromanian, Sami) |
| UNESCO frameworks aligned | 5 (Atlas of Endangered Languages, ICH Convention, Open Science, Indigenous Languages Decade, SDG 11.4) |
| Academic validation | LDA 2026 Berlin — abstract accepted (ID: 713903) |
| Community governance | Consent Framework v1.0 published |

## Why Now

UNESCO's Decade of Indigenous Languages runs 2022-2032, Claude can reason in under-resourced languages that no other model handles, and the elder speakers who carry Qashqai will not wait for the next funding cycle.

## Contact

**Siefollah Aslani** — Founder, QashqAI Voice
GitHub: [sifollahaslani/qashqai-voice-platform](https://github.com/sifollahaslani/qashqai-voice-platform)
