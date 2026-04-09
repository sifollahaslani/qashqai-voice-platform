# QashqAI Voice Platform — CLAUDE.md

> Persistent context for Claude Code sessions. Loaded automatically at start of every session.

## WHAT — Tech Stack & Architecture

- **Frontend:** Next.js (App Router) — deployed on Vercel at qashqaivoice.com
- **Backend:** FastAPI (Python)
- **LLM:** Claude (Anthropic API) — claude-opus-4-6
- **Speech AI:** Whisper + SeamlessM4T
- **Deployment:** Vercel (auto-deploy from GitHub)
- **License:** CC BY-NC-SA 4.0
- **Brand Colors:** Navy #1A2E44, Teal #0E7C7B, Gold #C8952A

## WHY — Purpose & Mission

QashqAI Voice is an ethical AI-powered platform for digital preservation of the Qashqai language (Darreh-Shuri dialect).

### Core Ethical Principles (NON-NEGOTIABLE)

- Cultural Data Sovereignty
- Community Consent (Framework v1.0)
- Non-Extractive Data Policy
- Transparent AI Documentation
- UNESCO Faro Convention & EU AI Act aligned

## HOW — Architecture Decisions

### Three-Agent Pipeline

1. **Language Detector** → identifies input language
2. **Cultural Guardian** → validates cultural sensitivity & accuracy
3. **Reasoning Agent** → generates culturally appropriate response

### Directory Map

```
app/app/[page]/page.tsx    ← Next.js pages (NOT src/app/)
api/                       ← FastAPI backend
.claude/                   ← Claude Code config (skills, hooks, agents, commands)
```

### Design Decisions

- Web Speech API uses `tr-TR` voice for Qashqai pronunciation
- Classroom: 30+ phrases across 5 categories
- GitHub: github.com/sifollahaslani/qashqai-voice-platform
- Vercel auto-deploy from main branch

## Gotchas

- ⚠️ **Path:** Next.js pages at `app/app/[page]/page.tsx` — NOT `src/app/`
- ⚠️ **PowerShell:** Heredoc syntax strips `__double_underscores__` from Python — never use heredoc for Python file creation
- ⚠️ **Windows encoding:** Smart quotes corrupt Python files — avoid copy-paste for Telegram bot
- ⚠️ **API credit:** $10 Anthropic API credit separate from claude.ai subscription

## Commands

```bash
npm run dev                # Next.js dev server
npm run build              # Production build
npm run test               # Run tests
uvicorn main:app --reload  # FastAPI dev
git push origin main       # Auto-deploys via Vercel
```

## Workflows

- Always commit frequently with descriptive messages
- Test before push
- Run /compact when context gets long
- Use Shift+Tab for Plan Mode on complex features
- Start new session per major feature

## Content Red Lines

- ❌ No content interpretable as political opposition to Iran
- ❌ No naming specific UNESCO/EU officials in damaging ways
- ❌ No unverified legal/statistical claims without hedging
- ✅ Always cultural, educational, constructive
- ✅ 4 languages (FA, QA/TR, DE, EN) — each with unique angle, NOT translations
