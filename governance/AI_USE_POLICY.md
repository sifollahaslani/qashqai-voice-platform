# QashqAI Voice AI Use Policy

## 1. Purpose

This policy defines how artificial intelligence may be used with QashqAI Voice recordings, transcripts, translations, metadata, and related cultural materials.

QashqAI Voice supports endangered-language preservation and responsible multilingual documentation. AI tools may assist this work, but they must not override narrator agency, cultural authority, consent limits, or human review.

This policy is a practical governance document for a small project. It does not provide legal certainty, replace institutional ethics review, or guarantee compliance with all laws or partner requirements.

## 2. Guiding Principles

QashqAI Voice follows these AI governance principles:

- **Private by default:** recordings and derived materials are not public AI resources by default.
- **Consent first:** AI use depends on documented consent for the specific activity.
- **Cultural authority:** cultural review may restrict or prohibit AI use even when technical processing is possible.
- **Human accountability:** AI outputs are drafts or aids, not final cultural, linguistic, or governance decisions.
- **Purpose limitation:** material collected for preservation must not be repurposed for unrelated AI development without explicit permission.
- **Transparency:** AI-assisted processing, AI training, exports, and dataset creation should be documented.
- **Multilingual integrity:** transcription and translation should preserve dialect, context, idiom, oral form, and uncertainty.
- **Revocability:** future AI use must stop when consent is revoked or narrowed.

## 3. Permitted AI Uses

AI-assisted uses may be permitted only when consent, privacy handling, and cultural validation requirements allow them.

Potentially acceptable AI-assisted processing includes:

- draft transcription for internal review;
- draft translation for internal review;
- speaker-independent audio quality checks;
- alignment of audio and transcript for archive navigation;
- internal summarization to help reviewers identify topics or sensitive sections;
- keyword extraction for internal indexing when consent allows it;
- quality-control support for multilingual metadata.

These uses must remain reviewable by humans. AI output should not be treated as authoritative without review by people with appropriate linguistic, cultural, or archival competence.

## 4. Restricted or Prohibited Uses

The following uses are prohibited unless explicit consent, cultural validation, and governance approval permit the specific activity:

- AI training or fine-tuning;
- creation of public datasets;
- creation of research datasets for external partners;
- speaker modeling;
- synthetic voice, voice cloning, or speaker imitation;
- automated publication or public release;
- commercial product development;
- creation of embeddings or vector indexes for external sharing;
- uploading sensitive recordings or transcripts to third-party AI services without review;
- using recordings to infer identity, ethnicity, family relationships, political views, health, migration status, or other sensitive attributes;
- using cultural material in ways that detach it from consent, attribution, context, or community authority.

Synthetic voice and voice cloning are prohibited by default. They require separate explicit permission and a documented cultural review decision.

## 5. AI Processing vs AI Training

QashqAI Voice distinguishes AI processing from AI training.

**AI processing** means using an existing tool to assist a specific task, such as transcription, translation, summarization, search, or quality review. AI processing may still create risks, especially if data is uploaded to an external service or stored in generated artifacts.

**AI training** means using QashqAI Voice material to create, improve, fine-tune, evaluate, or adapt an AI model. Training also includes preparing datasets specifically for model development.

Consent for AI processing does not imply consent for AI training. Consent for transcription does not imply consent for translation, embeddings, dataset creation, public release, synthetic voice, or commercial use.

Embeddings and vector indexes are treated as derived archive data. They may preserve or expose sensitive information and should be governed as carefully as transcripts or translations.

## 6. Human Review Requirements

Human review is required before:

- a transcript is treated as accurate;
- a translation is treated as reliable;
- a summary is used for governance or access decisions;
- metadata is shared outside the project;
- an item is exported;
- an item is included in a dataset;
- an AI-derived artifact is shared with an institution or partner;
- any public release occurs.

Reviewers should check for:

- transcription errors;
- mistranslation or loss of cultural meaning;
- uncertainty in dialect, idiom, names, or places;
- accidental disclosure of private family or community information;
- mismatch between consent and proposed AI use.

AI systems must not make final decisions about consent, cultural sensitivity, publication suitability, or access level.

## 7. Cultural Validation Requirements

Endangered-language materials may contain meaning that is not visible to general-purpose AI systems. Cultural validation is therefore required before broader AI use.

Cultural validation should consider:

- Qashqai language accuracy;
- dialect or variety accuracy;
- oral-history context;
- sacred, restricted, family-private, or community-sensitive material;
- names, places, kinship references, and migration details;
- whether translation changes or flattens meaning;
- whether AI use could harm narrator dignity, community trust, or cultural authority.

If cultural validation is pending, unclear, or disputed, AI use should remain limited to local preservation tasks that have documented consent.

## 8. Export and Sharing Restrictions

AI-related exports are restricted by default.

The following should not be exported without documented consent, cultural validation, and audit logging:

- raw recordings;
- transcripts;
- translations;
- metadata containing sensitive cultural or identity information;
- embeddings;
- vector indexes;
- model inputs;
- training datasets;
- evaluation datasets;
- synthetic voice outputs;
- summaries that reveal sensitive content.

Any export should record the item ID, recipient, purpose, files shared, consent basis, cultural review status, date, and responsible person.

Third-party AI services should be reviewed before use. The project should understand whether uploaded data may be retained, reviewed, logged, used for training, or transferred to other systems.

## 9. Consent Dependencies

AI use depends on the most restrictive applicable consent and review status.

Required consent fields should distinguish:

- transcription allowed;
- translation allowed;
- summarization allowed;
- embedding or indexing allowed;
- AI training allowed;
- synthetic voice allowed;
- research use allowed;
- institutional sharing allowed;
- public release allowed;
- commercial use allowed.

If a consent field is blank, missing, ambiguous, or disputed, the default answer is no for that use.

Consent should be recorded at the item level whenever possible. Broad or implied consent should not be used for high-risk AI activities such as training, embeddings for external search, dataset creation, or synthetic voice.

## 10. Revocation Handling

When consent is revoked or narrowed, future AI use that no longer fits the consent record must stop.

Revocation handling should include:

- updating the consent ledger;
- updating the revocation log;
- updating item metadata where applicable;
- removing the item from future AI processing queues, datasets, exports, and model-development workflows;
- documenting the action in the audit log;
- notifying partners when prior export agreements require or allow downstream action.

The project should not claim that all prior AI effects can always be reversed. For example, removal from already trained external models may be technically or contractually difficult. Because of this, AI training and external dataset sharing should be treated as high-risk and should require strong prior approval.

## 11. Transparency and Documentation

QashqAI Voice should document AI use in a way that a small team can maintain.

Records should identify:

- what AI tool or service was used;
- what material was processed;
- the purpose of processing;
- whether data left local storage;
- whether outputs were retained;
- who reviewed the output;
- which consent record supported the activity;
- which cultural validation status applied;
- whether the activity produced embeddings, datasets, summaries, or other derived artifacts.

Public or institutional descriptions should avoid exaggerating model capability, dataset completeness, language coverage, or cultural authority.

## 12. Current Technical Limitations

QashqAI Voice is currently an early governance and prototype repository.

Current limitations include:

- no automated AI permission checks;
- no access-control system that prevents unauthorized processing;
- no automated enforcement of revocation across generated artifacts;
- no third-party AI service approval workflow;
- no implemented dataset registry;
- no automated export logging;
- no validated multilingual transcription or translation pipeline;
- no mechanism to prove that external partners deleted or stopped using exported material.

Until these controls exist, AI use should remain conservative, local where possible, and limited to clearly consented preservation tasks.

## 13. Future Governance Goals

Future AI governance work should include:

- structured AI-use fields in metadata and consent records;
- a lightweight AI processing log;
- an export log for AI-derived artifacts and datasets;
- a dataset registry with consent and revocation status;
- review checklists for transcription, translation, summarization, and embeddings;
- third-party AI service review criteria;
- partner agreement templates covering training, retention, deletion, revocation, attribution, and downstream use;
- technical checks that prevent export or AI processing when consent or cultural validation is missing.

The goal is not to prohibit all AI assistance. The goal is to ensure that AI use remains accountable to preservation, consent, cultural dignity, multilingual integrity, and the authority of narrators, families, and communities.
