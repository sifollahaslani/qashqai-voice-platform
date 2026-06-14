# Governance

QashqAI Guardian inherits the QashqAI ecosystem's governance discipline and
adds a domain-specific layer for legal-information work.

## Authority & provenance (Doctrine #30)
- The Git repository is the authoritative source for logic and policy.
- Every information statement is tagged `VERIFIED` / `ASSUMPTION` / `VERIFY`.
- `legal_knowledge/` content must cite an official source before it may be
  tagged `VERIFIED`. Until then it is `VERIFY`.

## Architecture firewall (Doctrine #28–#29)
- No LLM or external model sits in the raw-data runtime path.
- Classification is deterministic and human-auditable.
- Any future STT/translation models run only on self-hosted / European
  infrastructure under QashqAI control.

## Legal Boundary Doctrine (new, Guardian-specific)
1. Information and referral only — never individualised legal advice.
2. No fabricated laws, deadlines, offices, or contact details.
3. Generic, user-completed templates only — no auto-drafted case documents.
4. Mandatory human handoff for all HIGH / EMERGENCY cases.
5. Mandatory disclaimer on every output.

## Oversight
- A Legal/Cultural Oversight Board reviews `legal_knowledge/` and `templates/`
  content per domain before it is marked verified or shown to users.
- The Board holds veto rights over any change that touches the Legal Boundary
  Doctrine or the Safety Policy.

## Data protection
- Minimise collection. The system is designed to function without storing the
  user's sensitive narrative.
- Treat all input as potential GDPR Article 9 special-category data (health,
  ethnic origin, residence status) and handle accordingly.

## Multilingual data model
- `Language` ∈ {de, fa, tr, en, ar, qsq}; RTL handled for fa/ar.
- Content is authored per language and reviewed by a competent speaker —
  legal terms are NOT machine-translated.
