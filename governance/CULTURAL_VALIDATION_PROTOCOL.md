# QashqAI Voice Cultural Validation Protocol

## 1. Purpose

This protocol defines how QashqAI Voice should review recordings, transcripts, translations, metadata, summaries, and proposed uses for cultural accuracy, sensitivity, and appropriate access.

Cultural validation is a harm-reduction and accountability process. It helps protect narrator agency, family and community authority, multilingual integrity, and cultural dignity. It does not guarantee perfect representation, universal agreement, or a single authoritative Qashqai perspective.

This protocol is designed for a small project and should be applied in a practical, documented way.

## 2. Core Principles

QashqAI Voice follows these principles:

- **Narrator agency:** narrators retain authority over their own voice, story, and preferred level of identification.
- **Cultural respect:** materials should be handled with care for family, community, language, memory, and context.
- **Internal diversity:** Qashqai communities are not culturally or linguistically uniform. Review should avoid treating any one person as the sole voice of the whole community.
- **Dialect sensitivity:** dialect, pronunciation, idiom, oral style, and code-switching should be documented rather than corrected into a generic form.
- **Private by default:** unclear or unreviewed material should remain private.
- **Consent alignment:** cultural review cannot override consent limits.
- **Human judgment:** AI tools may assist transcription or translation only when permitted, but review decisions require human judgment.
- **Transparency:** review decisions, uncertainty, and disagreements should be recorded.

## 3. When Validation Is Required

Cultural validation is required before:

- public release;
- institutional sharing;
- research export;
- dataset creation;
- AI training or model fine-tuning;
- embedding or vector index export;
- synthetic voice, speaker modeling, or voice cloning;
- publication of translations, summaries, or excerpts;
- changing an item's access level beyond private or family-only use.

Cultural validation is also recommended when:

- a transcript includes names, places, migration routes, family relationships, or sensitive memories;
- translation uncertainty could change meaning;
- content may be sacred, restricted, private, traumatic, or politically sensitive;
- multiple dialects or languages appear in one recording.

If validation status is missing, unclear, or disputed, the item should remain private or at the most restrictive existing access level.

## 4. Types of Review

QashqAI Voice distinguishes several forms of review:

- **Linguistic review:** checks transcription accuracy, language identification, dialect or variety notes, pronunciation, terminology, and code-switching.
- **Translation review:** checks whether translations preserve meaning, uncertainty, tone, context, and culturally specific terms.
- **Cultural review:** checks sensitivity, context, appropriateness for sharing, names and places, family or community implications, restricted knowledge, and possible harm.
- **Consent review:** checks that the proposed use matches the consent ledger and any revocation record.
- **AI-use review:** checks whether transcription, translation, summarization, embeddings, training, synthetic voice, or dataset creation are permitted and appropriate.

These reviews may be performed by different people. Linguistic accuracy alone is not enough to approve publication or AI use.

## 5. Reviewer Roles

Reviewers may include:

- the narrator;
- a family-designated reviewer;
- a fluent speaker or dialect-aware language reviewer;
- a translator with relevant language competence;
- a cultural reviewer trusted by the narrator, family, or project governance process;
- a project maintainer responsible for documentation and audit records.

Reviewers should be selected based on the item, language variety, family context, and proposed use. A reviewer should not be asked to represent all Qashqai people or all possible interpretations.

When possible, high-risk decisions should include more than one reviewer or at least one reviewer separate from the person who created the transcript or translation.

## 6. Dialect and Translation Sensitivity

Dialect-sensitive review should document:

- dialect or variety when known;
- pronunciation or lexical features relevant to preservation;
- code-switching or mixed-language passages;
- uncertainty in words, names, places, or idioms;
- terms that should remain untranslated or be explained in notes.

Translations should preserve meaning rather than force direct equivalence. If a phrase has no stable translation, the translated text should mark uncertainty and include a note.

Reviewers should avoid normalizing transcripts in ways that erase dialect, oral style, pauses, repetitions, or culturally meaningful phrasing unless a normalized version is clearly labeled as a separate derivative.

## 7. Oral-History and Cultural Sensitivity

Oral histories may include personal memory, family history, migration experience, grief, conflict, humor, spiritual references, political context, or community-sensitive knowledge.

Review should consider:

- whether the narrator intended the story for family, community, researchers, or the public;
- whether the recording names living people or identifiable families;
- whether places or migration routes create privacy or safety concerns;
- whether a translation makes private material more visible to wider audiences;
- whether excerpts remove necessary context;
- whether publication could harm dignity, relationships, trust, or cultural continuity.

Reviewers should not treat oral histories only as data. They are records of lived experience and require contextual care.

## 8. Restricted or Sensitive Material

Material should be marked restricted when it includes:

- sacred or ceremonial knowledge not intended for public circulation;
- family-private material;
- community-sensitive material;
- traumatic or conflict-related accounts;
- identifiable information about people who have not consented;
- location details that should not be public;
- material the narrator or family asks to withhold;
- content whose meaning is uncertain but potentially sensitive.

Suggested sensitivity levels:

- `unclassified`
- `low`
- `family_private`
- `community_sensitive`
- `restricted`
- `sacred_or_not_for_publication`

Restricted status should block publication, dataset creation, institutional sharing, and AI training unless a later documented review changes the status and consent allows the use.

## 9. Publication and External Sharing

Publication or external sharing requires:

- active consent for the proposed use;
- completed cultural validation;
- review of language and translation accuracy where relevant;
- access-level approval;
- export logging;
- clear attribution or anonymity rules;
- confirmation that AI-use restrictions are respected.

External sharing includes sending materials to researchers, universities, archives, museums, technology partners, AI services, public repositories, or online platforms.

No item should be treated as publishable only because it has been transcribed or translated.

## 10. Documentation Requirements

Each reviewed item should record:

- item ID;
- recording ID;
- review ID;
- reviewer ID or role;
- review date;
- review type;
- language or dialect reviewed;
- validation status;
- sensitivity level;
- publication recommendation;
- AI-use recommendation;
- required corrections or restrictions;
- unresolved uncertainty;
- notes on disagreement, if any.

Recommended status values:

- `pending`
- `needs_linguistic_review`
- `needs_translation_review`
- `needs_cultural_review`
- `approved_family_only`
- `approved_research`
- `approved_public`
- `restricted`
- `revoked`

Documentation should be clear enough for a small team to understand why a decision was made without exposing unnecessary private details.

## 11. Handling Disagreements and Uncertainty

Disagreement should be expected and documented respectfully.

If reviewers disagree:

- record the disagreement without forcing false consensus;
- use the more restrictive access level until resolved;
- seek narrator or family input where appropriate;
- consult an additional reviewer for high-risk uses;
- avoid publication, dataset creation, AI training, or institutional export while the disagreement remains material.

If a translation is uncertain:

- mark uncertain words or passages;
- preserve the source-language text;
- add translator notes;
- avoid using uncertain passages in public summaries or AI datasets;
- request additional review when the uncertainty affects meaning or sensitivity.

## 12. Revocation and Corrections

Narrators, families, or authorized reviewers may request correction, restriction, or removal according to consent and governance records.

Correction requests may involve:

- transcription errors;
- mistranslation;
- incorrect dialect identification;
- inaccurate metadata;
- inappropriate sensitivity level;
- mistaken publication or access recommendation.

Revocation or restriction requests should:

- update the consent ledger or revocation record;
- update item metadata and validation status;
- stop future publication, export, AI processing, dataset inclusion, or institutional sharing where no longer permitted;
- record the action in the audit log.

Emergency removal should be available when continued access may create immediate privacy, dignity, cultural, or safety risk. Emergency removal may occur before full review, with documentation completed afterward.

## 13. Institutional Collaboration Conditions

Institutional partners may include universities, archives, museums, cultural organizations, research groups, or technology providers.

Before sharing material with an institution, QashqAI Voice should confirm:

- the item has active consent for institutional sharing;
- cultural validation permits the proposed use;
- AI-use permissions are explicit;
- access, retention, attribution, deletion, and downstream sharing terms are documented;
- revocation and takedown expectations are understood;
- public release, dataset creation, and model training are not implied by research access.

Partners should not receive unrestricted rights to reuse, publish, train on, or redistribute QashqAI Voice materials unless those rights are explicitly documented and culturally reviewed.

## 14. Current Limitations

QashqAI Voice currently has a lightweight governance skeleton, not a full review platform.

Current limitations include:

- no automated validation workflow;
- no reviewer management system;
- no role-based access control;
- no automated block on export when validation is missing;
- no formal advisory board process;
- no complete institutional agreement template;
- no guaranteed method to recall material already shared externally;
- limited tooling for multilingual transcript comparison or dialect annotation.

Because of these limitations, sensitive or disputed material should remain private until governance capacity is stronger.

## 15. Future Governance Goals

Future improvements should include:

- a structured validation form linked to each item;
- reviewer role definitions and conflict-of-interest guidance;
- dialect and translation annotation guidelines;
- an access-control policy linked to validation status;
- export checks that require consent and validation before sharing;
- partner agreement templates for institutions;
- emergency removal procedure with clear responsibilities;
- periodic review of restricted and sensitive items;
- practical training materials for reviewers and project maintainers.

The goal is to support preservation and responsible access while recognizing that cultural validation is an ongoing relationship of care, not a single technical checkbox.
