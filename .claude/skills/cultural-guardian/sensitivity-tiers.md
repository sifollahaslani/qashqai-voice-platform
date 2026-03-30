# Sensitivity Tier Reference

This document defines the three sensitivity tiers used by the Cultural Guardian in the QashqAI Voice pipeline.

---

## Tier 0 — Public

**Label:** `sensitivity: public`

**Definition:** Content that may be freely used in research publications, open datasets, public demonstrations, and training data — with attribution to the project and community.

**Typical examples:**
- General conversation about daily life, nature, seasons
- Common vocabulary and phrases
- Descriptions of landscape, food, animals
- Stories and proverbs that the speaker explicitly agreed to share publicly

**Requirements:**
- Explicit consent for public use documented
- Cultural Guardian review completed
- No elements from higher tiers present

---

## Tier 1 — Community-Restricted

**Label:** `sensitivity: community-restricted`

**Definition:** Content that may be shared with vetted Qashqai community partners, academic collaborators with signed data agreements, and internal project review — but not released publicly without further community consent.

**Typical examples:**
- Content naming specific families, sub-tribal groups, or individuals in context
- Internal community history or oral accounts of disputes and migrations
- Oral literature that may be considered family or community-held knowledge
- Content where the speaker's consent was for research use but not public distribution

**Requirements:**
- Consent documentation reviewed for scope
- Cultural Guardian flags the reason for restriction
- Access limited to named collaborators in the governance log

---

## Tier 2 — Restricted

**Label:** `sensitivity: restricted`

**Definition:** Content that must not be processed, distributed, or used in any form without explicit approval from the relevant Qashqai community authority or the speaker themselves. This content is held in archive pending community consultation.

**Typical examples:**
- Ceremonial or sacred language
- Ritual songs, prayers, or initiatory texts
- Content where the speaker later expressed discomfort or withdrew consent
- Content that could endanger the speaker, their family, or their community if released

**Requirements:**
- Immediately flagged and removed from processing pipeline
- Stored in restricted archive folder
- Operator notified within same session
- Community consultation process initiated before any further action

---

## Escalation

If a file's sensitivity tier is unclear, default to the **higher** tier and flag for human review. Never downgrade a tier without explicit operator approval and a documented reason.
