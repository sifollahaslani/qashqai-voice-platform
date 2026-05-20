# QashqAI Voice Audit Logging Guide

## Purpose

This guide defines lightweight audit logging behavior for QashqAI Voice. The aim is traceability, not heavy surveillance.

Audit logs should help a small team understand what happened, when, why, and under whose authority.

## Events To Log

Log these events:

- metadata created or updated;
- consent recorded;
- consent narrowed or revoked;
- validation completed;
- access level changed;
- AI processing started or completed;
- external API used;
- export manifest created;
- files exported;
- dataset created;
- emergency removal performed;
- partner access approved or declined.

## Minimal Audit Fields

```csv
audit_id,timestamp,item_id,recording_id,actor_id,action,governance_area,details
```

Recommended additional future fields:

```csv
source_file,consent_id,validation_id,export_id,requested_action,result,reason
```

## Audit Logging Behavior

For each governed action:

```text
1. Generate audit_id.
2. Record timestamp.
3. Record item_id and recording_id.
4. Record actor_id or role.
5. Record action.
6. Record governance area.
7. Record result: allowed, denied, pending, revoked, emergency.
8. Record concise reason.
9. Link export_id, consent_id, or validation_id when relevant.
```

## Examples

```csv
audit-2026-000010,2026-05-20T21:00:00+02:00,qv-item-2026-000001,qv-rec-2026-000001,maintainer-0001,processing_denied,ai_processing,"embedding denied because embedding_allowed=false"
```

```csv
audit-2026-000011,2026-05-20T21:05:00+02:00,qv-item-2026-000001,qv-rec-2026-000001,reviewer-9002,validation_updated,cultural_validation,"status set to approved_family_only"
```

## Privacy-Aware Logging

Audit logs should not include unnecessary private content. Avoid placing full transcript excerpts, legal names, contact details, or sensitive cultural details in log rows.

Use stable IDs and concise reasons. Store sensitive review notes in governed validation records instead.

## Local-First Practice

Audit logs may start as CSV files. A future local tool can append rows after checks or generate draft rows for human review.

Do not send audit logs to external services unless consent, privacy review, and partner terms allow it.

## Limits

Audit logs do not enforce governance by themselves. They provide accountability after or during decisions. Enforcement still requires gates, review, and disciplined handling.

