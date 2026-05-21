# QashqAI Voice Operational Enforcement Specification

## Purpose

This specification turns QashqAI Voice governance into enforceable operating rules. It is designed for a local-first archive that may later add scripts, review tools, or institutional workflows without weakening consent, revocation, cultural validation, auditability, or human oversight.

This document is not a claim that technical controls can determine cultural meaning. It defines what software may check, what humans must decide, and how decisions must be traced.

The enforcement posture should remain institutionally precise and anti-romanticizing: QashqAI Voice materials are governed records with cultural, linguistic, personal, and archival significance, not symbolic raw material for unrestricted AI development.

## Enforcement Hierarchy

When records conflict, the most restrictive applicable rule prevails.

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

Default decision: deny or hold for review.

No lower-level permission can override a higher-level restriction. Public approval cannot override revoked consent. AI permission cannot override restricted cultural validation. Institutional terms cannot broaden consent.

## Evidence Classification Architecture

Governed records should distinguish evidence from inference.

| Class | Description | Examples | Enforcement Use |
|---|---|---|---|
| `source_record` | Original or directly supplied material | raw audio, signed consent, narrator statement | highest evidentiary weight; access restricted |
| `governance_record` | Formal project governance record | consent ledger, revocation row, validation record, export manifest | primary enforcement input |
| `review_finding` | Human review result | validation status, sensitivity level, translation review | enforceable after reviewer authority is recorded |
| `derived_artifact` | Output created from source or review material | transcript, translation, summary, embedding, dataset | inherits restrictions from source and review records |
| `machine_output` | Automated draft or model-generated result | AI transcript draft, keyword list, summary | never final without human review |
| `inference` | Interpretation not directly evidenced | topic label, cultural risk estimate, identity risk estimate | advisory only unless confirmed by human review |
| `external_claim` | Partner, institution, or third-party statement | deletion confirmation, provider retention terms | usable only with source and date recorded |

Evidence classification must be recorded for decision traces when a decision depends on more than one source.

## Human Oversight Boundaries

Automated checks may:

- validate required metadata fields;
- match IDs across metadata, consent, validation, revocation, audit, and export records;
- deny actions when consent is missing, false, revoked, narrowed, or ambiguous;
- deny actions when validation status or sensitivity level blocks the use;
- detect raw audio, identity files, embeddings, datasets, or exports in risky locations;
- generate draft audit entries and decision traces.

Automated checks must not:

- declare consent meaningful or culturally adequate;
- determine cultural sensitivity from content alone;
- approve public release, AI training, synthetic voice, dataset creation, or institutional sharing;
- resolve reviewer disagreement;
- treat AI summaries, translations, or classifications as final governance evidence;
- override emergency restrictions, revocations, or narrator/family restrictions.

Human review is mandatory for cultural validation, consent interpretation, emergency removals, reviewer authority, partner acceptability, and any override request.

## Decision-Trace Requirements

Every governed action should produce or reference a decision trace with:

- requested action;
- item and recording IDs;
- actor or role;
- input records and versions;
- evidence classes used;
- rule IDs evaluated;
- allow, deny, hold, or revoke result;
- reasons;
- unresolved uncertainties;
- required human reviews;
- audit log reference.

Decision traces should avoid full transcript excerpts, legal names, exact private locations, or sensitive cultural details. Use stable IDs and concise reasons.

## Cultural Validation Checkpoints

The following actions require completed cultural validation before approval:

- external export;
- public release;
- research use;
- institutional sharing;
- dataset creation;
- embeddings or vector indexes beyond strictly local review;
- AI training or model evaluation;
- synthetic voice, speaker modeling, or voice imitation;
- publication of translations, excerpts, summaries, or metadata beyond private/family use;
- access-level expansion.

Validation status is insufficient by itself. The sensitivity level, required actions, disagreement notes, and AI-use recommendation must also be checked.

## Rule-Enforcement Behavior Mapping

| Rule Condition | Required Behavior | Human Boundary |
|---|---|---|
| Metadata missing required governance fields | deny or hold | maintainer may correct structure |
| Consent missing, blank, pending, unclear, or conflicting | deny | consent reviewer may seek clarification |
| Consent revoked or narrowed against action | deny and mark revoked/blocked | human interprets scope and partner notice |
| Revocation record exists for item or permission | deny affected action | human reviews downstream effects |
| Validation pending or needs review | hold private/family-only | reviewer determines status |
| Validation restricted, sacred, or revoked | deny external use and high-risk AI use | emergency restriction may apply |
| AI permission false or absent | deny AI action | new consent required before reconsideration |
| External AI provider requested | hold unless provider review and explicit permission exist | human reviews retention, training, transfer, and deletion terms |
| Raw audio or identity record included in export | deny unless explicitly approved | human must document exceptional basis |
| Dataset, embedding export, training, or synthetic voice requested | deny unless explicitly consented and culturally approved | higher review threshold required |
| Reviewer disagreement unresolved | hold at most restrictive access level | human resolution required |
| Emergency risk identified | restrict immediately | document and complete review after stabilization |

## Revocation and Override Precedence

Revocation has priority over processing, export, dataset, and AI permissions for future use.

Permitted override types:

- `emergency_restriction`: may further restrict access immediately.
- `clerical_correction`: may correct IDs, dates, or file references without expanding use.
- `scope_clarification`: may interpret an ambiguous revocation or consent boundary after human review.

Prohibited overrides:

- expanding consent through technical convenience;
- treating institutional interest as approval;
- using previous export as permission for future export;
- using preservation value as permission for AI training;
- using public metadata as permission to expose raw voice, identity, transcripts, embeddings, or datasets.

Any override must record authority, reason, affected records, duration if temporary, and audit reference.

## Repository Governance Structure

Governance infrastructure should be organized as follows:

```text
governance/
|-- OPERATIONAL_ENFORCEMENT_SPEC.md
|-- ENFORCEMENT_ARCHITECTURE.md
|-- LIFECYCLE_STATE_ENFORCEMENT.md
|-- PROCESSING_GATE_EXAMPLE.md
|-- EXPORT_GATE_EXAMPLE.md
|-- AUDIT_LOGGING_GUIDE.md
|-- rules/
|   `-- enforcement_rules.sample.json
|   `-- lifecycle_transitions.sample.json
|-- schemas/
|   `-- decision_trace.schema.json
`-- scripts/
    `-- validate_governance_artifacts.py
```

Policy documents define principles. Rule files define checkable behavior. Schemas define traceable records. Examples show how a small team can apply the rules before full software exists.

## Implementation Realism

The first enforceable implementation should be lightweight:

1. Validate JSON and CSV structure.
2. Match IDs across records.
3. Evaluate consent and revocation before any AI or export action.
4. Evaluate validation status, sensitivity level, and AI-use recommendation.
5. Produce a decision trace and draft audit row.
6. Require human sign-off for high-risk approvals.
7. Run local artifact validation before relying on rule or trace files.

This approach is compatible with UNESCO-aligned values of safeguarding, consent, cultural continuity, human oversight, transparency, and community authority, while avoiding claims that automation can replace cultural governance.

## Lifecycle Enforcement

Action gates must be evaluated together with lifecycle-state rules. A governed artifact should not move from one lifecycle state to another unless the transition is legal under `LIFECYCLE_STATE_ENFORCEMENT.md` and `governance/rules/lifecycle_transitions.sample.json`.

Lifecycle enforcement adds four requirements:

- every governed artifact has an artifact class and lifecycle state;
- irreversible or partially irreversible transitions must be identified before approval;
- revocation must propagate to downstream artifacts, exports, datasets, partner copies, public releases, and AI-derived artifacts;
- every denied, held, revoked, emergency-restricted, or invalidated result must generate both a decision trace and an audit row.

Parser failure, schema validation failure, unreadable governance records, missing transition rules, or broken artifact links must result in `hold_for_review`. They must not be treated as successful enforcement.
