# Security Policy

## Scope

This document covers two distinct security concerns for QashqAI Voice:

1. **Software security** — vulnerabilities in the FastAPI backend, Next.js frontend, or supporting infrastructure
2. **Data security** — protection of speaker identities, voice recordings, consent records, and other sensitive community data

Both are taken seriously. A vulnerability that exposes speaker data or community-restricted content is treated with the highest urgency.

---

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.3.x (current prototype) | Yes |
| Earlier versions | No |

---

## Reporting a vulnerability

**Do not file security issues publicly in the GitHub issue tracker.**

To report a vulnerability, contact the project founder directly:

- **GitHub:** [@sifollahaslani](https://github.com/sifollahaslani) — open a private security advisory via the repository's Security tab
- Please include a clear description of the issue, steps to reproduce, and your assessment of impact

You will receive an acknowledgement within 5 business days. We will keep you informed as we investigate and remediate.

We do not currently operate a bug bounty programme. We do credit researchers in release notes unless you prefer to remain anonymous.

---

## Speaker data protection

QashqAI Voice collects voice recordings and personal metadata from Qashqai community members. The following controls are in place:

### Consent
- No data is collected without explicit, documented consent
- The consent framework is defined in `06_Data_Governance/Consent_Framework_v1.md`
- Speakers may withdraw consent at any time under the protocol in `06_Data_Governance/Withdrawal_Protocol_v1.md`
- Withdrawn data is deleted, not anonymised — anonymisation is insufficient for voice data

### Sensitivity tiers
All content is classified before processing:

| Tier | Label | Handling |
|------|-------|---------|
| 0 | `public` | May be used in research and training data with attribution |
| 1 | `community-restricted` | Shared only with vetted partners under data agreements |
| 2 | `restricted` | Held in archive; not processed or shared without explicit community approval |

Tier 2 content (ceremonial, sacred, or politically sensitive material) is never passed through the language-processor pipeline.

### Storage
- All data is stored locally during the prototype phase — no cloud upload without explicit operator decision
- Restricted content is stored in `data/restricted/` and not accessible to the data pipeline
- File naming follows a structured standard that does not encode speaker names

### Access controls
Automated hooks enforce governance at the tool level:
- `consent-gate.sh` — blocks any processing command on a speaker ID without confirmed consent
- `pre-data-operation.sh` — blocks restricted-tier content from being written outside `data/restricted/`

---

## API key handling

The platform requires an `ANTHROPIC_API_KEY` to power the Reasoning Agent.

- Never commit API keys to the repository
- The `.gitignore` excludes `.env` files — verify this before committing environment configuration
- If you believe an API key has been exposed in the repository history, rotate it immediately via the Anthropic Console and notify the project maintainer

---

## Known limitations (prototype)

- No authentication on the `/chat` or `/detect` API endpoints — the backend should not be exposed to the public internet in its current form
- No rate limiting — add before any public deployment
- No input sanitisation beyond empty-text checks in the Cultural Guardian — extend before production
- No audit logging on the API — add before handling real community data through the live platform

These are known gaps for the prototype phase. They are documented here, not because they are acceptable in production, but so contributors know where work is needed.

---

## Disclosure policy

We follow responsible disclosure. When a vulnerability is reported:

1. We acknowledge receipt within 5 business days
2. We investigate and assess impact
3. We develop and test a fix
4. We release the fix before public disclosure
5. We credit the reporter (unless anonymity is requested)

For issues that expose speaker data or community-restricted content, we treat remediation as urgent regardless of prototype status.
