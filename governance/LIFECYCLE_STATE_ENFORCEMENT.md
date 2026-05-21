# QashqAI Voice Lifecycle-State Enforcement

## Purpose

This document defines lifecycle-state enforcement for QashqAI Voice artifacts. It moves governance from action checklists into explicit state transitions that can be denied, held, allowed, revoked, invalidated, audited, and traced.

Lifecycle enforcement does not decide cultural meaning. It prevents governed artifacts from moving into broader, higher-risk, or irreversible states unless the required consent, cultural validation, revocation checks, and human approvals exist.

## Artifact Classes

Lifecycle rules apply to:

- `source_audio`
- `metadata_record`
- `consent_record`
- `validation_record`
- `transcript`
- `translation`
- `summary`
- `embedding`
- `dataset`
- `export_package`
- `public_release`
- `synthetic_voice_artifact`
- `partner_copy`
- `audit_record`
- `decision_trace`

Derived artifacts inherit the most restrictive state and restrictions of their source artifacts unless a documented transition lawfully narrows or broadens access.

## Lifecycle States

| State | Meaning | Default Handling |
|---|---|---|
| `created_unclassified` | Artifact exists but governance linkage is incomplete | hold private |
| `metadata_linked` | Artifact is linked to item, recording, consent, and validation IDs | no external use |
| `consent_pending` | Consent exists but is not active for the requested use | deny requested use |
| `consent_active` | Consent is active for at least one specific use | continue gate checks |
| `validation_pending` | Cultural or linguistic validation is missing or incomplete | hold private/family-only |
| `validated_restricted` | Validation blocks or restricts use | deny external/high-risk use |
| `validated_family_only` | Use limited to narrator/family-approved contexts | deny external/public/high-risk AI |
| `validated_research` | Limited research use may be possible | require purpose, export, partner, and audit checks |
| `validated_public` | Public release may be possible | require final release approval and audit |
| `processing_local` | Local processing is allowed and in progress | keep outputs local and draft |
| `derived_draft` | AI or human derivative exists but is not reviewed | hold private |
| `derived_reviewed` | Derivative has completed required review | follow inherited restrictions |
| `export_staged` | Export package prepared but not released | hold until export transition passes |
| `exported_external` | Artifact has left local custody | irreversible transition; monitor revocation obligations |
| `published_public` | Artifact is publicly released | irreversible transition; takedown may reduce access but cannot guarantee recall |
| `dataset_registered` | Artifact is included in governed dataset registry | high-risk; revocation propagation required |
| `training_committed` | Artifact has been used for model training/fine-tuning/evaluation | irreversible or partially irreversible |
| `synthetic_voice_committed` | Voice-derived synthetic artifact exists | irreversible or partially irreversible |
| `revocation_pending` | Revocation received, scope not fully interpreted | emergency hold/restrict |
| `revoked_blocked` | Future use is blocked by revocation | deny affected actions |
| `downstream_invalidation_pending` | Existing derivatives/exports require invalidation review | hold dependent use |
| `invalidated` | Artifact or derivative is removed from future use | deny except audit/remediation |
| `emergency_restricted` | Immediate harm-reduction restriction applied | deny broader use until reviewed |
| `retired_preserved` | Preserved only for governed internal recordkeeping | no processing/export |

## Reversible and Irreversible Actions

Reversible actions may be corrected, rolled back, or reclassified inside local custody:

- metadata correction;
- draft transcript creation;
- draft translation creation;
- local summary draft;
- local processing hold;
- access reduction;
- emergency restriction;
- clerical correction.

Partially irreversible actions may be restricted later, but some copies, traces, or derived effects may remain:

- external export;
- institutional sharing;
- partner copy creation;
- dataset registration;
- embedding creation;
- public metadata release;
- transcript or translation publication.

Irreversible or high-risk actions require the strongest approval threshold:

- public release;
- AI training, fine-tuning, or model evaluation use;
- synthetic voice, speaker modeling, or voice imitation;
- external dataset release;
- broad redistribution permission;
- any action where downstream deletion cannot be verified.

Irreversibility must be recorded before the transition is allowed.

## Transition Legality

A transition is legal only when:

- prior state permits the requested transition;
- artifact class is covered by transition rules;
- consent permits the exact action;
- revocation does not block the item, recording, narrator, permission, or artifact class;
- cultural validation permits the action and access level;
- required human approval exists for high-risk or irreversible transitions;
- downstream dependencies are identified;
- decision trace and audit row are created for allow, deny, hold, revoke, emergency restriction, and invalidation outcomes.

Parser failure, schema failure, missing records, broken links, or unreadable governance artifacts must produce `hold_for_review`, a decision trace, and an audit row. Failure to evaluate must never default to allow.

## Revocation Propagation

When revocation or narrowed consent is received:

1. Move affected source and metadata records to `revocation_pending`.
2. Block new processing, export, publication, dataset inclusion, AI training, synthetic voice, and external sharing.
3. Identify all derived artifacts, exports, datasets, partner copies, and public releases linked to the affected item, recording, narrator, or consent ID.
4. Move dependent artifacts to `downstream_invalidation_pending` unless they are already `invalidated`, `revoked_blocked`, or `retired_preserved`.
5. Apply `revoked_blocked` to future actions within the revoked scope.
6. Notify partners where agreements require or support restriction, takedown, deletion, or downstream marking.
7. Record known limits where recall, deletion, or model untraining cannot be verified.
8. Create a decision trace and audit row for the revocation and each downstream invalidation action.

Revocation cannot be overridden to broaden use. Scope clarification may only narrow uncertainty after human review and must be traced.

## Downstream Invalidation Requirements

Invalidation records must identify:

- source item and recording IDs;
- affected consent or revocation IDs;
- artifact class and artifact ID;
- current lifecycle state;
- invalidation action requested;
- whether the artifact is local, exported, public, partner-held, dataset-linked, or training-committed;
- required partner notification;
- deletion, removal, quarantine, access reduction, or warning label outcome;
- known limits to technical or contractual removal;
- audit ID and decision ID.

Dependent use remains blocked while invalidation is pending.

## Audit and Trace Mandate

Every `denied`, `hold_for_review`, `revoked`, `emergency_restricted`, and `invalidated` result must generate both:

- a decision trace explaining records, rules, state transition, reasons, and required reviews;
- an audit row recording the governed action and decision ID.

Allowed transitions also require both records when the action is external, high-risk, irreversible, or access-expanding.

