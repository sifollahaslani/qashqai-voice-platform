# QashqAI Voice Governance-Aware Repository Structure

## 1. Recommended Top-Level Repository Structure

```text
QashqAI/
|-- README.md
|-- .gitignore
|-- consent_ledger.csv
|-- revocations.csv
|-- audit_log.csv
|-- governance/
|-- metadata_templates/
|-- archive/
|-- identity_private/
|-- processing_tmp/
|-- ai_artifacts/
|-- exports/
|-- audio/
`-- QashqAI_Archive/
```

Recommended handling:

- `audio/` should contain application code and small non-sensitive development assets.
- `archive/` should contain structured archive items and approved metadata.
- `identity_private/`, `processing_tmp/`, `ai_artifacts/`, and `exports/` should be ignored by Git unless a future governance process explicitly approves selected non-sensitive files.
- Raw recordings should remain local, encrypted where practical, and private by default.

## 2. Governance Folder Structure

```text
governance/
|-- PRIVACY_POLICY.md
|-- AI_USE_POLICY.md
|-- CULTURAL_VALIDATION_PROTOCOL.md
|-- ACCESS_CONTROL_POLICY.md
|-- REPOSITORY_STRUCTURE.md
|-- EXPORT_POLICY.md
|-- DATASET_GOVERNANCE.md
|-- INSTITUTIONAL_COLLABORATION.md
`-- CHANGELOG.md
```

The first four documents define the baseline policy set. The remaining proposed files can be added when the project begins exports, dataset creation, or formal collaboration.

## 3. Recording Archive Structure

```text
archive/
|-- oral_histories/
|   `-- family-node-001/
|       `-- qv-item-000001/
|           |-- metadata.json
|           |-- validation.json
|           |-- transcript.qashqai.txt
|           |-- transcript.en.txt
|           |-- translation_notes.md
|           `-- raw/
|               `-- qv-rec-2026-000001.wav
|-- lexicon/
|-- songs_poetry/
|-- migration_memory/
`-- material_culture/
```

The item folder is the main archive unit. A single item may include one or more recordings, transcripts, translations, validation records, and consent references.

The `raw/` subfolder should remain ignored by Git. If an item becomes public or research-approved, exports should be produced separately rather than exposing the raw archive folder.

## 4. Metadata Structure

Each archive item should include `metadata.json` based on `metadata_templates/metadata.sample.json`.

Minimum metadata fields:

- `item_id`
- `recording_id`
- `collection`
- `family_node`
- `title`
- `description`
- `date_recorded`
- `location_general`
- `narrator_ref.narrator_id`
- `language.primary_language`
- `language.dialect_or_variety`
- `language.transcript_languages`
- `language.translation_languages`
- `consent.consent_id`
- `consent.current_status`
- `ai_permissions`
- `cultural_review.status`
- `cultural_review.sensitivity_level`
- `files`
- `traceability`

Metadata should not include legal names, contact details, exact private locations, or full family relationship maps unless the item is explicitly approved for that level of visibility.

## 5. Consent Ledger Structure

Recommended root-level lightweight files:

```text
consent_ledger.csv
revocations.csv
```

Future expanded structure:

```text
consent/
|-- consent_ledger.csv
|-- revocations.csv
|-- consent_schema.md
`-- templates/
    |-- narrator_consent.md
    |-- ai_use_permission.md
    `-- withdrawal_request.md
```

Consent records should link `consent_id`, `item_id`, `recording_id`, and `narrator_id`. They should separate transcription, translation, summarization, embeddings, AI training, synthetic voice, research use, institutional sharing, public release, and commercial use.

Blank or ambiguous consent should be treated as no permission for that use.

## 6. Validation Workflow Structure

Each archive item should include a validation file:

```text
archive/.../qv-item-000001/
`-- validation.json
```

Suggested workflow statuses:

- `pending`
- `needs_linguistic_review`
- `needs_translation_review`
- `needs_cultural_review`
- `approved_family_only`
- `approved_research`
- `approved_public`
- `restricted`
- `revoked`

Validation should distinguish linguistic accuracy, translation accuracy, dialect accuracy, sensitivity level, publication recommendation, and AI-use recommendation.

## 7. Export Workflow Structure

Exports should be generated separately from source archive folders:

```text
exports/
|-- export-2026-000001/
|   |-- export_manifest.json
|   |-- included_items.csv
|   |-- consent_snapshot.csv
|   |-- validation_snapshot.csv
|   `-- files/
`-- README.local.md
```

Exports should remain ignored by Git by default.

Each export should document:

- export ID;
- recipient or destination;
- purpose;
- item IDs included;
- files included;
- consent basis;
- validation status;
- restrictions;
- responsible person;
- export date.

## 8. Temporary Processing Area

Temporary work should stay outside tracked source paths:

```text
processing_tmp/
|-- transcription/
|-- translation/
|-- audio_cleanup/
|-- api_responses/
`-- review_drafts/
```

This area should be ignored by Git. It may contain sensitive audio snippets, draft transcripts, API responses, logs, or intermediate AI outputs.

Temporary files should be deleted when no longer needed or promoted into an approved archive item with appropriate metadata, consent, and validation status.

## 9. AI-Derived Artifact Structure

AI-derived artifacts should be separated from source archive material:

```text
ai_artifacts/
|-- embeddings/
|-- vector_indexes/
|-- summaries/
|-- model_inputs/
|-- model_outputs/
`-- datasets/
```

This folder should be ignored by Git by default.

Embeddings, indexes, summaries, and datasets may expose sensitive information even when raw audio is absent. They should be governed by consent, cultural validation, export logging, and revocation rules.

## 10. Separation of Identity Records

Private identity records should be separated from archive metadata:

```text
identity_private/
|-- narrators_private.csv
|-- contact_records.csv
`-- identity_notes/
```

This folder should be ignored by Git and stored with stronger local protections.

Archive metadata should reference `narrator_id` rather than exposing names, contact details, or private family relationships.

## 11. Suggested Naming Conventions

Recommended IDs:

```text
qv-rec-YYYY-NNNNNN
qv-item-NNNNNN
nar-NNNN
consent-NNNN
review-NNNN
export-YYYY-NNNNNN
dataset-YYYY-NNNNNN
```

Recommended language suffixes:

```text
transcript.qashqai.txt
transcript.en.txt
transcript.tr.txt
transcript.az.txt
transcript.fa.txt
translation_notes.md
```

Recommended file names:

```text
metadata.json
validation.json
export_manifest.json
consent_snapshot.csv
validation_snapshot.csv
```

Names should be stable, non-identifying, and consistent across metadata, consent, validation, audit, and export records.

## 12. Recommended .gitignore Strategy

Git should track:

- policy documents;
- schemas and templates;
- non-sensitive source code;
- approved sample metadata;
- non-sensitive documentation.

Git should ignore:

- raw recordings;
- private identity records;
- signed consent documents;
- exports;
- datasets;
- AI artifacts;
- embeddings;
- vector stores;
- local databases;
- API keys;
- `.env` files;
- temporary processing files;
- model checkpoints.

The repository should avoid storing sensitive cultural materials in Git history. If private data is accidentally committed, remediation may require more than adding `.gitignore`.

## 13. Suggested Future Automation Hooks

Future tooling could add checks before processing or export:

- block export when consent is missing or revoked;
- block export when validation is pending or restricted;
- warn when raw audio appears in tracked paths;
- validate `metadata.json` against a schema;
- validate consent IDs against `consent_ledger.csv`;
- require an export manifest before files leave local custody;
- generate checksums for raw recordings;
- flag AI permissions before transcription, translation, embeddings, or training;
- create audit log entries for access-level changes and exports;
- create dataset manifests with consent and revocation snapshots.

These hooks should support small-team practice rather than create heavy administrative overhead.

## 14. Risks If Structure Is Ignored

Risks include:

- raw voice recordings may be exposed accidentally;
- narrator identity may be linked to public metadata;
- revoked consent may not be honored;
- transcripts or translations may circulate without cultural validation;
- embeddings or datasets may leak sensitive information;
- institutional partners may receive unclear or excessive rights;
- AI training may occur from preservation material without explicit permission;
- exports may become untraceable;
- dialect and oral-history context may be flattened or lost;
- future takedown or correction requests may become difficult to execute.

## Why This Structure Fits Endangered-Language Governance Needs

Endangered-language preservation requires both continuity and restraint. The structure keeps recordings, consent, identity, metadata, validation, exports, and AI-derived artifacts connected but not collapsed into one folder or one permission model.

This supports preservation of Qashqai language, dialect, and oral history while respecting privacy, narrator agency, revocable consent, cultural review, and future collaboration boundaries.

## Where Human Review Still Matters

Human review remains necessary for:

- dialect interpretation;
- translation uncertainty;
- oral-history context;
- cultural sensitivity;
- publication suitability;
- consent explanation and revocation;
- disagreement resolution;
- institutional collaboration decisions;
- determining whether an AI use is appropriate.

Automation can assist checks, but it cannot determine cultural meaning, community expectations, or narrator dignity.

## Where Future Tooling Could Enforce Policy

Future tooling could enforce:

- metadata schema validation;
- consent and revocation checks;
- validation status checks;
- export manifest creation;
- audit log creation;
- `.gitignore` compliance checks for raw audio;
- AI-use permission gates;
- dataset registry checks;
- identity-record separation warnings.

These controls would make the governance documents operational without replacing human responsibility.
