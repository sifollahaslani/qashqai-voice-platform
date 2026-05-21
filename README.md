# QashqAI Voice

## Project Overview

QashqAI Voice is an early-stage, local-first repository for the preservation and responsible handling of Qashqai voice recordings, oral histories, multilingual transcripts, translations, and related cultural knowledge.

The project is designed for small-team archival work where cultural authority, narrator consent, language preservation, and auditability are treated as core requirements. It is not currently a public dataset, production archive, or model-training corpus.

## Mission

The mission of QashqAI Voice is to support endangered language preservation while respecting the rights, dignity, and cultural authority of narrators, families, and communities.

The project aims to:

- preserve Qashqai speech, dialect features, oral histories, and intergenerational knowledge;
- support multilingual transcription and translation workflows;
- separate private identity records from archive metadata;
- document consent, revocation, cultural review, and AI-use permissions;
- enable future collaboration with cultural, academic, or institutional partners under clear governance conditions.

## Governance Principles

QashqAI Voice follows a governance-first approach:

- Narrators and families retain ownership and authority over their stories, voices, and associated cultural knowledge.
- Recordings are private by default unless explicit consent and cultural review allow a wider access level.
- Consent must be specific, documented, and revocable.
- Cultural validation is required before publication, institutional sharing, research use, dataset creation, or AI training.
- AI-assisted transcription and translation are treated separately from AI training, embeddings, synthetic voice, or model fine-tuning.
- Multilingual work should preserve dialect, context, idiom, and culturally specific meaning rather than flattening content into generic translation.
- External collaboration must respect consent limits, attribution requirements, revocation rights, and community or family review.

## Consent and Cultural Validation

Consent is not treated as a one-time administrative form. It is a continuing governance relationship between the archive and the narrator, family, or community authority connected to the recording.

The consent model is intended to record:

- who gave permission;
- which recording or archive item the permission applies to;
- whether transcription, translation, research use, public release, institutional sharing, commercial use, AI processing, AI training, embeddings, or synthetic voice are allowed;
- whether consent is active, narrowed, or revoked;
- who approved the relevant governance decision.

Cultural validation is a separate review step. It should assess language accuracy, dialect accuracy, translation quality, names and places, culturally sensitive material, restricted or sacred content, and whether the item is suitable for family-only, community, research, public, or no external access.

Revocation must be respected. If consent is withdrawn or narrowed, future use, export, publication, or dataset inclusion should stop according to the revocation record and applicable obligations.

## Repository Structure

Current structure:

```text
QashqAI/
|-- README.md
|-- .gitignore
|-- consent_ledger.csv
|-- revocations.csv
|-- audit_log.csv
|-- governance/
|-- metadata_templates/
|   |-- metadata.sample.json
|   `-- validation.sample.json
|-- audio/
`-- QashqAI_Archive/
```

Key files and folders:

- `.gitignore` protects private recordings, exports, embeddings, models, local databases, secrets, and temporary files from accidental commits.
- `consent_ledger.csv` is the lightweight consent register for archive items and AI-use permissions.
- `revocations.csv` records withdrawn or narrowed consent.
- `audit_log.csv` records governance actions, review decisions, and traceability events.
- `metadata_templates/metadata.sample.json` defines a practical recording metadata template.
- `metadata_templates/validation.sample.json` defines a practical cultural validation template.
- `governance/` contains policy documents and enforcement infrastructure, including operational precedence, lifecycle-state rules, rule samples, and decision-trace schemas.
- `audio/` contains early prototype voice-recording code.
- `QashqAI_Archive/` contains early archive materials and governance notes from the initial cultural archive structure.

## Development Workflow

Development should remain local-first and governance-aware:

1. Recordings should be stored outside Git or in ignored local archive folders.
2. Each recording should receive a stable recording ID and archive item ID.
3. Metadata should be created before any transcription, translation, review, or sharing.
4. Consent should be recorded in `consent_ledger.csv`.
5. Cultural validation should be recorded before any external use.
6. Exports, datasets, model inputs, embeddings, or institutional packages should be created only after checking consent and review status.
7. Governed actions should produce a decision trace when they allow, deny, hold, revoke, or emergency-restrict a requested use.
8. Lifecycle transitions should identify prior state, requested state, final state, reversibility, and downstream invalidation requirements.
9. Governance actions should be recorded in `audit_log.csv`.

Application code changes should not weaken privacy, consent, or review requirements.

## Privacy and Data Handling

Raw recordings, exports, model artifacts, embeddings, vector stores, local databases, secrets, and API keys should not be committed to Git.

The project treats voice recordings as sensitive personal and cultural data. Even when names are removed, oral histories may contain identifiable family, place, migration, linguistic, or cultural information. Anonymization should therefore be treated as risk reduction, not a guarantee.

Recommended handling:

- store raw audio in trusted local or encrypted storage;
- keep narrator identity records separate from public or shareable metadata;
- avoid uploading recordings to third-party services unless consent and data-processing terms are clear;
- distinguish AI-assisted transcription or translation from AI training;
- do not create public datasets, embeddings, synthetic voice outputs, or fine-tuning corpora without explicit permission and cultural review.

## Current Status

QashqAI Voice is at an initial governance-skeleton stage.

What exists:

- minimal Python voice-recording prototype;
- initial cultural archive materials;
- `.gitignore` policy for local-first protection;
- consent, revocation, audit, metadata, and validation templates.

What does not yet exist:

- production archive software;
- access-control implementation;
- encrypted storage automation;
- complete consent-management application;
- cultural review board workflow implementation;
- institutional data-sharing agreements;
- validated multilingual transcription or translation pipeline.

## Future Goals

Future work should prioritize:

- a complete governance document set covering privacy, AI use, access levels, cultural validation, and institutional collaboration;
- stable archive item folders linked to consent and validation records;
- narrator identity separation and private identity registry;
- multilingual transcript and translation workflows for Qashqai and partner languages;
- culturally reviewed lexicon and dialect documentation;
- audit tooling for access, export, review, and revocation events;
- secure local or encrypted storage practices for raw recordings;
- partner-ready governance terms for universities, archives, museums, cultural institutions, or ethical AI collaborators.

The long-term goal is to make QashqAI Voice useful for language preservation while ensuring that technical systems remain accountable to consent, cultural authority, and community-defined boundaries.
