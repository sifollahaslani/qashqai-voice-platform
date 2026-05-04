# AI Infrastructure Transparency

**Document type:** Public transparency disclosure
**Audience:** Anyone — speakers, partners, researchers, public
**Last reviewed:** May 2026

---

## Purpose

QashqAI Voice is committed to transparent AI documentation as one of its four foundational principles, alongside cultural data sovereignty, community consent, and non-extractive data policy.

This document describes which AI services QashqAI Voice uses, for what purpose, and how interested users can independently verify the state of those services. It exists so that anyone — a speaker, a researcher, a partner institution, a journalist — can understand what processes their cultural data and what its operational status is at any moment.

---

## What we use

### Primary AI provider

QashqAI Voice uses **Anthropic's Claude models** (claude.ai) for cultural-linguistic processing across three internal agents:

1. **Language Detector** — identifies the input language (Persian, Qashqai, German, English) before further processing.
2. **Cultural Guardian** — applies cultural-sensitivity checks aligned with the Qashqai Darreh-Shuri context.
3. **Reasoning Agent** — produces translation, contextual analysis, and educational content.

We selected Claude after evaluating multilingual capability, alignment with the EU AI Act, and Anthropic's published research on responsible AI development. We are an applicant to Anthropic's Partner Network and have submitted a humanitarian/research API access request.

### Hosting and infrastructure

- **Frontend:** Vercel (Next.js application)
- **Backend:** Render (FastAPI application)
- **Domain:** Webador Lite (qashqaivoice.com)
- **Source code:** GitHub (`sifollahaslani/qashqai-voice-platform`)

### Licensing

All QashqAI Voice content is published under **CC BY-NC-SA 4.0**. The codebase is open and available at the GitHub repository above.

---

## How to verify operational status

QashqAI Voice maintains a public status component at `qashqaivoice.com/status` showing the state of the platform from the speaker's perspective.

For independent verification of upstream services:

| Service | Status page |
|---|---|
| Anthropic (Claude API) | https://status.claude.com |
| Vercel | https://www.vercel-status.com |
| Render | https://status.render.com |
| GitHub | https://www.githubstatus.com |

If our public status component shows "AI Pipeline: Degraded" and you wish to understand why, the Anthropic status page will typically (though not always) reflect the corresponding upstream incident.

---

## Why we name our stack

Some platforms keep their AI stack opaque, treating it as a proprietary advantage. We do not.

For a critically endangered language preservation project, opacity is incompatible with the consent we ask of speakers. A speaker who contributes a word of Qashqai Darreh-Shuri has a legitimate interest in knowing which company's models process that word, where those models are hosted, and what the current state of those services is. This transparency is a precondition for meaningful consent under the CARE Principles, the EU AI Act, and the UNESCO Faro Convention.

**We name our stack because we owe speakers that knowledge.**

---

## What we do not name (and why)

In our public status component, we describe component-level state ("AI Pipeline: Degraded") without identifying the specific vendor having an incident. This is a deliberate boundary:

- Speakers need to know what they will experience. ("Will my submission be processed now?")
- Speakers do not need real-time operational details about a specific company's incident response.

For users who want that level of detail, this document and the linked status pages provide it. The status component itself remains focused on user experience.

---

## Roadmap toward reduced single-vendor dependency

We name single-vendor dependency as a structural risk, not a neutral fact. Our roadmap toward resilience is documented in `OPS_PLAYBOOK.md` (AI Provider Incident Response Protocol, Step 7) and includes evaluation of secondary providers and open-weight models in 2026–2027.

---

## Questions

For questions about this document or the underlying infrastructure:

**Contact:** hello@qashqaivoice.com
**Director:** Siefollah Aslani, Bremen, Germany

---

*Practice precedes public claim.*
