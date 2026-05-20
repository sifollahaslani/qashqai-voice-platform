# QashqAI Voice

QashqAI Voice is a local-first prototype for preserving Qashqai voice recordings, oral histories, multilingual transcripts, and cultural knowledge with explicit consent and cultural review.

The project treats recordings as private cultural and personal data by default. Raw audio, exports, embeddings, model artifacts, local databases, secrets, and API keys should not be committed to Git.

## Governance Principles

- Narrators and families retain ownership of their stories and voice recordings.
- Consent must be recorded before any archive use beyond local capture.
- Consent is revocable.
- AI processing and AI training are separate permission categories.
- Cultural review is required before publication, institutional sharing, research use, or AI dataset creation.
- Multilingual transcripts and translations should preserve dialect, context, and culturally specific meaning.

## Current Skeleton

- `.gitignore` protects private recordings and local AI artifacts from accidental commits.
- `consent_ledger.csv` defines the minimal consent fields for each archive item.
- `revocations.csv` records withdrawn or narrowed consent.
- `audit_log.csv` tracks governance actions and review decisions.
- `metadata_templates/metadata.sample.json` provides a lightweight recording metadata template.
- `metadata_templates/validation.sample.json` provides a cultural validation template.
- `governance/` is reserved for future policy documents such as charter, privacy, AI-use, access levels, and cultural validation protocol.

## Local-First Handling

Keep raw recordings on trusted local or encrypted storage. Track only templates, schemas, approved metadata, and non-sensitive governance records unless explicit consent and cultural review allow broader sharing.
