# QashqAI Voice Consent Check Pseudocode

## Purpose

This file provides implementation-oriented pseudocode for consent-aware, revocation-aware governance checks. It is not production code.

## Action Permission Map

```text
transcription -> transcription_allowed
translation -> translation_allowed
summarization -> summarization_allowed
embedding -> embedding_allowed
ai_training -> ai_training_allowed
synthetic_voice -> synthetic_voice_allowed
research_export -> research_use_allowed
public_export -> public_release_allowed
institutional_export -> institutional_sharing_allowed
commercial_use -> commercial_use_allowed
```

## Consent Check

```text
function can_process(item_id, requested_action):
    metadata = load_metadata(item_id)
    if metadata is missing:
        deny("missing metadata")

    if metadata.consent.revoked == true:
        deny("metadata marks item revoked")

    consent = find_consent(metadata.consent.consent_id)
    if consent is missing:
        deny("missing consent record")

    if consent.status not in ["active"]:
        deny("consent is not active")

    revocations = find_revocations(item_id, consent.consent_id)
    if revocations affect requested_action:
        deny("revocation blocks requested action")

    permission_field = map_action_to_permission(requested_action)
    if consent[permission_field] is not true:
        deny(permission_field + " is not true")

    if metadata.ai_permissions has permission_field:
        if metadata.ai_permissions[permission_field] is not true:
            deny("metadata AI permission does not allow action")

    validation = load_validation(metadata.cultural_review.validation_id)
    if validation is missing:
        deny("missing cultural validation")

    if validation.status in ["pending", "restricted", "revoked"]:
        deny("validation status blocks action")

    if requested_action is external or high_risk:
        require_human_review()

    allow("consent and validation permit requested action")
```

## Export Check

```text
function can_export(export_manifest):
    if export_manifest.recipient is empty:
        deny("missing recipient")

    if export_manifest.purpose is empty:
        deny("missing purpose")

    for each item in export_manifest.items:
        result = can_process(item.item_id, export_manifest.requested_use)
        if result.allowed is false:
            deny("item blocked: " + item.item_id + " " + result.reason)

        if item.files_included contains raw audio:
            require_explicit_raw_audio_approval()

        if item.files_included contains identity records:
            require_explicit_identity_approval()

    require_export_log_entry()
    require_audit_log_entry()
    require_human_approval()
```

## Denial Defaults

The check should deny when:

- fields are missing;
- values are blank;
- consent is unclear;
- revocation is ambiguous;
- validation is incomplete;
- requested action is broader than documented permission.

## Human Escalation Cases

Escalate to human review when:

- consent wording is ambiguous;
- reviewer disagreement exists;
- a narrator requests a change;
- a partner requests broad rights;
- an AI provider may retain data;
- material has restricted or sacred sensitivity;
- translation uncertainty affects meaning.

