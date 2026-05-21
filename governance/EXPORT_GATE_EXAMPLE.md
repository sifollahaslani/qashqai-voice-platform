# QashqAI Voice Export Gate Example

## Purpose

This example shows how a lightweight export authorization check could work before material leaves local QashqAI Voice custody.

This is an enforcement design, not production application logic.

## Inputs

The export gate should read:

- export manifest;
- item metadata;
- consent ledger;
- revocation records;
- validation record;
- export log draft;
- recipient and purpose.

## Export Decision Rules

```text
1. Export manifest must exist.
2. Recipient must be identified.
3. Purpose must be documented.
4. Every item must have metadata.
5. Every item must have active consent.
6. No item may be revoked for the requested use.
7. Cultural validation must permit the requested use.
8. Included files must match approved access level.
9. Raw audio and identity records require explicit approval.
10. AI, dataset, public, research, or institutional uses require separate consent fields.
11. Export log entry must be prepared.
12. Audit entry must be prepared.
13. Decision trace must identify the exact records and rules supporting denial, hold, or approval.
14. Lifecycle transition must be legal before `export_staged`, `exported_external`, or `published_public`.
```

## Stop Conditions

Stop export when:

- consent is missing;
- consent is revoked;
- validation is pending, restricted, or revoked;
- export purpose is broader than consent;
- recipient terms allow redistribution without approval;
- AI training, embeddings, or dataset creation are requested without explicit consent;
- identity records are included accidentally;
- raw recordings are included accidentally;
- reviewer disagreement is unresolved.
- any higher-priority restriction conflicts with export approval.
- lifecycle rules classify the transition as irreversible or partially irreversible without recorded human approval, downstream invalidation plan, and recall limits.

## Example Export Authorization Result

```json
{
  "export_id": "export-2026-000001",
  "allowed": false,
  "recipient": "No external recipient",
  "reasons": [
    "export status is not_approved",
    "validation status is approved_family_only",
    "institutional_sharing_allowed is false",
    "files_included is empty"
  ],
  "required_before_export": [
    "new consent for institutional sharing",
    "updated cultural validation",
    "partner restrictions",
    "decision trace",
    "audit log entry"
  ]
}
```

## File Filtering Rules

Suggested file defaults:

- metadata: share only reviewed non-identifying fields;
- raw audio: exclude unless explicitly approved;
- transcripts: exclude unless transcript sharing is approved;
- translations: exclude unless translation sharing is approved;
- identity records: exclude by default;
- validation notes: share only summary status unless detailed notes are approved;
- embeddings and datasets: exclude unless explicitly approved.

Export release is at least partially irreversible. The decision trace should record prior state, requested state, final state, transition ID, reversibility, downstream artifacts, and revocation contact path.
