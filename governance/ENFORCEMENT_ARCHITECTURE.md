# QashqAI Voice Lightweight Enforcement Architecture

## Purpose

This document designs a lightweight enforcement layer for QashqAI Voice. It is intended for a small, local-first team and does not assume enterprise infrastructure, centralized identity management, or production archive software.

The goal is to make governance decisions harder to bypass by accident. Enforcement should support consent, revocation, cultural validation, export restrictions, auditability, multilingual metadata, and AI-use boundaries.

## Enforcement Model

QashqAI Voice should use simple gates before sensitive actions:

```text
metadata gate -> consent gate -> revocation gate -> cultural validation gate -> action gate -> audit log
```

Operational precedence is defined in `OPERATIONAL_ENFORCEMENT_SPEC.md`. If gate results conflict, the most restrictive applicable result prevails. Emergency restrictions and revocations take priority over consent permissions, cultural validation approvals, institutional requests, and action-specific defaults.

Lifecycle-state enforcement is defined in `LIFECYCLE_STATE_ENFORCEMENT.md`. Gates must not only decide whether an action is permitted; they must also decide whether the requested artifact state transition is legal, reversible, partially irreversible, or irreversible.

The action may be:

- transcription;
- translation;
- summarization;
- embedding creation;
- AI training preparation;
- export;
- institutional sharing;
- public release;
- dataset creation.

Each action should resolve to a lifecycle transition such as `processing_local`, `derived_reviewed`, `export_staged`, `exported_external`, `published_public`, `dataset_registered`, `training_committed`, `revoked_blocked`, `downstream_invalidation_pending`, or `invalidated`.

## Gate 1: Metadata Validation

The metadata gate checks whether an item has enough structure to be governed.

It should verify:

- `item_id` exists;
- `recording_id` exists;
- `narrator_ref.narrator_id` exists;
- language fields exist;
- dialect field exists, even if marked unknown;
- consent reference exists;
- cultural review reference exists;
- AI permission fields exist;
- file references are present;
- traceability fields exist.

This gate can be automated safely. It checks structure, not cultural meaning.

Metadata checks should distinguish evidence from inference. Source records, governance records, review findings, derived artifacts, machine outputs, inferences, and external claims have different evidentiary weight. Automated tooling should not treat AI-generated descriptions, inferred topics, or external claims as equivalent to consent records, revocation records, or human validation findings.

## Gate 2: Consent-Aware Processing

The consent gate checks whether the requested action is allowed by the active consent record.

Examples:

- transcription requires `transcription_allowed=true`;
- translation requires `translation_allowed=true`;
- summarization requires `summarization_allowed=true`;
- embedding requires `embedding_allowed=true`;
- training requires `ai_training_allowed=true`;
- synthetic voice requires `synthetic_voice_allowed=true`;
- institutional export requires `institutional_sharing_allowed=true`.

Blank, missing, unclear, or conflicting values should be treated as not allowed.

## Gate 3: Revocation-Aware Access

The revocation gate checks whether consent has been withdrawn or narrowed.

It should check:

- consent status is not `revoked`;
- item does not appear in a revocation record affecting the requested action;
- metadata does not mark the item as revoked;
- validation status is not `revoked`.

This can be automated for known records, but human review is still needed to interpret ambiguous revocation requests.

## Gate 4: Cultural Validation Enforcement

The cultural validation gate checks whether review status permits the requested action.

Suggested rules:

- `pending`: no export, no AI training, no public release;
- `approved_family_only`: local/family-only use only;
- `approved_research`: research export may be possible if consent allows it;
- `approved_public`: public release may be possible if consent allows it;
- `restricted`: no external sharing or AI processing beyond explicitly approved preservation work;
- `revoked`: no future access or processing.

This gate can check status values automatically, but human review must determine the status itself.

## Gate 5: Export Authorization

The export gate checks:

- recipient and purpose are documented;
- included files are listed;
- consent permits export purpose;
- cultural validation permits export purpose;
- no identity records are included unless explicitly approved;
- raw audio is excluded unless explicitly approved;
- export manifest exists;
- export log and audit log entries are prepared.

Export authorization should default to no when metadata, consent, validation, or recipient terms are incomplete.

## Gate 6: Audit Logging

The audit gate creates or requires an audit entry for:

- processing;
- export;
- access-level change;
- consent update;
- revocation;
- validation decision;
- dataset creation;
- AI-provider use.

Audit logging can be automated as a draft, but a human should review high-risk entries.

For governed actions, the audit entry should be backed by a decision trace. The decision trace records requested action, input records, evidence classes, rules evaluated, allow/deny/hold result, reasons, unresolved uncertainties, required human reviews, and the linked audit ID. A sample schema is available at `governance/schemas/decision_trace.schema.json`.

Denied, held, revoked, emergency-restricted, and invalidated results must produce both a decision trace and an audit row. Parser failure, schema failure, unreadable records, and missing lifecycle-transition rules must result in `hold_for_review`, not silent continuation.

## Enforcement Hierarchy

Use this hierarchy when an item has multiple applicable records:

```text
1. Emergency restriction
2. Revocation or narrowed consent
3. Active consent limits
4. Cultural validation status and sensitivity level
5. Access-control policy
6. AI-use policy
7. Export, dataset, or partner-specific terms
8. Requested action defaults
```

Default result is denial or hold for review. No export, dataset, AI process, or institutional request should broaden a higher-priority restriction.

## Local-First Enforcement Patterns

Recommended small-team patterns:

- use ignored folders for raw audio, exports, derived artifacts, and temporary processing;
- run a local pre-processing checklist before AI tools are used;
- run a local export checklist before any files leave custody;
- validate JSON and CSV files before review;
- keep identity records separate from shareable metadata;
- use stable IDs across metadata, consent, validation, audit, and export files;
- treat missing permission as denial;
- log decisions immediately.

## What Can Be Automated

Realistically automatable:

- JSON schema validation;
- CSV header validation;
- ID matching across files;
- consent boolean checks;
- revoked status checks;
- validation status checks;
- raw audio path detection;
- export manifest completeness;
- audit row generation;
- warnings for restricted sensitivity levels;
- detection of missing language or dialect fields.

## What Still Requires Human Judgment

Human judgment remains required for:

- whether consent was meaningfully understood;
- whether a reviewer has appropriate authority;
- whether dialect notes are accurate;
- whether translation preserves meaning;
- whether content is culturally sensitive;
- whether institutional terms are acceptable;
- whether a revocation request affects prior exports;
- whether an AI use is culturally appropriate even if technically permitted.

## Future-Ready Structure

A future implementation could provide local scripts such as:

```text
scripts/governance/check_metadata.py
scripts/governance/check_consent.py
scripts/governance/check_validation.py
scripts/governance/check_export.py
scripts/governance/write_audit_entry.py
```

These should run locally, avoid uploading data, and produce clear pass/fail results with human-readable reasons.

Initial implementation should read `governance/rules/enforcement_rules.sample.json` as a policy contract, not as an automatic approval engine. Passing structural checks may permit a low-risk local action only when consent, revocation, validation, and human-oversight boundaries are satisfied.
