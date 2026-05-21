# QashqAI Voice Processing Gate Example

## Purpose

This example shows how a small team could decide whether a recording may be processed for transcription, translation, summarization, embeddings, AI training, or synthetic voice.

This is an enforcement design, not production application logic.

## Inputs

The gate should read:

- item metadata JSON;
- consent ledger row;
- revocation records;
- validation record;
- requested action;
- processing location: local or external;
- tool/provider name, if any.

## Requested Action Values

```text
transcription
translation
summarization
embedding
ai_training
synthetic_voice
dataset_creation
```

## Decision Rules

```text
1. Metadata must be valid.
2. Consent record must exist.
3. Consent status must be active.
4. Revocation record must not block the action.
5. Requested permission must be true.
6. Cultural validation must permit the action.
7. External provider use must be separately permitted.
8. Temporary outputs must go to ignored local storage.
9. Audit entry must be prepared.
10. Decision trace must be prepared.
11. Requested lifecycle transition must be legal.
```

If any rule conflicts with a revocation, emergency restriction, cultural restriction, or unresolved reviewer disagreement, the more restrictive result applies.

If metadata, consent, validation, rule, or lifecycle records cannot be parsed or validated, the gate result is `hold_for_review`. The hold must generate a decision trace and audit row.

## Example: Local Transcription

Allowed only if:

- metadata exists;
- `transcription_allowed=true`;
- consent is active;
- item is not revoked;
- validation is not `restricted` or `revoked`;
- raw audio stays local;
- output is marked draft until human review;
- lifecycle transition remains local and reversible.

## Example: Translation

Allowed only if:

- `translation_allowed=true`;
- source transcript exists or is planned;
- language and dialect metadata are present;
- translation output is marked draft;
- translation review is required before export.

## Example: Embeddings

Allowed only if:

- `embedding_allowed=true`;
- cultural validation allows embeddings;
- derived artifacts are stored under ignored `derived/`;
- no external vector service is used unless explicitly approved;
- audit entry records model/tool and source item IDs;
- downstream invalidation behavior is defined before embeddings are created.

## Example: AI Training

Allowed only if:

- `ai_training_allowed=true`;
- cultural validation explicitly permits training;
- dataset creation is approved;
- export or dataset manifest exists;
- institutional or technical partner terms are documented;
- revocation limits are understood.

Default result should be denial.

## Example Output

```json
{
  "allowed": false,
  "requested_action": "embedding",
  "item_id": "qv-item-2026-000001",
  "reasons": [
    "embedding_allowed is false",
    "validation ai_use_recommendation does not approve embeddings"
  ],
  "next_steps": [
    "do not process",
    "request new consent only if appropriate",
    "complete cultural review before reconsidering",
    "write decision trace and audit row"
  ]
}
```
