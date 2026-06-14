# Frontend Wireframe (textual) — QashqAI Guardian

> No UI is implemented yet. This describes the intended flow and the
> non-negotiable safety/transparency elements any future UI must include.
> Design priorities: low-literacy-friendly, mobile-first, accessible, RTL-aware
> (Persian/Arabic), and honest.

## Global elements (every screen)
- **AI transparency banner** (EU AI Act): "You are talking to an automated
  assistant, not a person and not a lawyer."
- **Language selector**: DE · FA · TR · EN · AR · QSQ (RTL for FA/AR).
- **Emergency bar**: always-visible "In danger? Call 112 / 110."
- **Disclaimer footer**: the canonical non-lawyer disclaimer.

## Screen 1 — Language & welcome
- Pick language. One sentence on what this tool does (and does not) do.

## Screen 2 — Describe the problem
- Free-text box + a few large category buttons (Wohnen, Aufenthalt, Leistungen,
  Behinderung, Arbeit, Verträge, Internet, "Etwas anderes").
- Microcopy: "Tell us what happened, in your own words."

## Screen 3 — Clarify (only if needed)
- Asks **country, city, document date** if missing.
- For "unknown": 1–2 simple clarifying questions.

## Screen 4 — Result (renders GuardianResponse)
Ordered, scannable cards:
1. **What this looks like** (category + urgency, plain words)
2. **⚠ Safety warning** (only if present) — shown FIRST when EMERGENCY
3. **Immediate risks**
4. **General information** — each item tagged ✓ verified / ~ assumption /
   ❓ to-verify
5. **Evidence to collect** (checklist)
6. **Next steps**
7. **Who can help** (institution types → later: real local contacts)
8. **Templates** (download / open the generic forms)
9. **Disclaimer** (always)

## Hard UI rules
- Never label any output "Rechtsberatung" / "legal advice".
- Never show a hard deadline as fact — always render `VERIFY` items as
  "check this on your letter".
- For EMERGENCY: the safety warning and the 112 action come before everything.
- A persistent "Find a human advice centre" button on the result screen.
