# QashqAI Voice Privacy Policy

## 1. Purpose

This policy defines the privacy approach for QashqAI Voice, an early-stage, local-first project for preserving Qashqai voice recordings, oral histories, transcripts, translations, and related cultural knowledge.

The policy is intended to support endangered-language preservation while respecting narrator rights, family and community authority, cultural review, revocable consent, and careful handling of sensitive voice and identity data.

This document is a governance policy for project practice. It is not a substitute for legal advice, institutional ethics review, or formal data-protection assessment where those are required.

## 2. Scope

This policy applies to:

- raw voice recordings;
- edited or derived audio files;
- transcripts and translations;
- recording metadata;
- narrator identity records;
- consent and revocation records;
- cultural validation records;
- audit logs and export logs;
- AI-derived artifacts, including embeddings, indexes, model inputs, and generated outputs when they are created from archive material.

The policy applies to local work, internal collaboration, research preparation, institutional sharing, public release, and AI-assisted processing.

## 3. Data Categories

QashqAI Voice separates data into practical categories:

- **Raw recordings:** original voice files and other primary media. These are private by default.
- **Derived audio:** cleaned, clipped, normalized, or converted audio files. These inherit the privacy status of the raw recording unless reviewed otherwise.
- **Transcripts:** source-language text derived from recordings. These may still contain personal, family, place, migration, linguistic, or culturally sensitive information.
- **Translations:** translated versions of transcripts. These require care because translation can change meaning, reduce context, or make sensitive material more widely accessible.
- **Metadata:** item IDs, recording dates, general locations, language and dialect information, consent references, file references, and review status.
- **Narrator identity records:** names, contact information, family relationships, and other identifying details. These should be stored separately from shareable archive metadata.
- **Consent records:** records defining allowed uses, restrictions, AI permissions, access levels, and revocation status.
- **Cultural validation records:** review notes on language accuracy, dialect accuracy, translation quality, sensitivity level, publication suitability, and AI-use suitability.
- **Audit and export records:** logs showing governance actions, approvals, exports, and external sharing events.

## 4. Consent Principles

QashqAI Voice treats consent as specific, documented, and revocable.

Consent should identify:

- the narrator or authorized consent giver;
- the recording or archive item covered by consent;
- permitted access level;
- whether transcription is allowed;
- whether translation is allowed;
- whether research use is allowed;
- whether institutional sharing is allowed;
- whether public release is allowed;
- whether AI processing is allowed;
- whether AI training is allowed;
- whether embeddings, vector indexes, or synthetic voice are allowed;
- whether commercial use is allowed;
- the consent date, consent version, and revocation status.

Consent for one activity does not imply consent for another. For example, permission to create a transcript does not imply permission to train a model, publish a dataset, create embeddings, or generate synthetic voice.

## 5. AI Processing Boundaries

QashqAI Voice distinguishes AI-assisted processing from AI training.

**AI-assisted processing** may include transcription support, translation support, summarization for internal review, or quality-control assistance. These uses still require consent and careful handling, especially if third-party services are involved.

**AI training** includes fine-tuning, model training, dataset creation for training, speaker modeling, or any use intended to improve or create an AI model. AI training requires explicit, separate permission and cultural validation.

Embeddings, vector databases, search indexes, and synthetic voice outputs are treated as derived data. They may expose or reproduce sensitive cultural and personal information even when raw audio is not visible. These artifacts should not be created, exported, or shared unless consent and cultural review permit the specific use.

Synthetic voice, voice cloning, or speaker imitation should be prohibited by default unless explicit consent and governance approval are documented.

## 6. Storage and Access

QashqAI Voice follows a private-by-default and local-first storage philosophy.

Raw recordings should be stored in trusted local or encrypted storage and should not be committed to Git. Exports, datasets, embeddings, model artifacts, local databases, API keys, secrets, and temporary processing files should also remain outside version control.

Narrator identity records should be kept separate from archive metadata. Archive items should use stable narrator IDs rather than exposing legal names or contact details in general metadata files.

Access should follow the most restrictive applicable rule from consent, cultural validation, and project policy. If consent or review status is unclear, the material should remain private until clarified.

Third-party services should be used only when their role, data handling, retention behavior, and consent basis are understood. Uploading recordings, transcripts, translations, or metadata to external AI or cloud services should not be treated as routine.

## 7. Revocation and Removal

Narrators, families, or authorized cultural authorities may revoke or narrow consent according to the applicable consent record and project governance process.

When consent is revoked or narrowed, QashqAI Voice should:

- update the consent ledger;
- record the change in the revocation log;
- update item metadata where applicable;
- stop future use that is no longer permitted;
- prevent future export or dataset inclusion;
- document the action in the audit log.

Removal from already shared external copies may depend on partner agreements, technical feasibility, and legal or institutional context. Future institutional collaboration should therefore include clear terms for revocation, takedown requests, and downstream restrictions before any sharing occurs.

## 8. Cultural Validation

Privacy protection is linked to cultural validation. A recording may contain sensitive cultural knowledge even when it does not appear to contain conventional personal data.

Cultural validation should review:

- language and dialect accuracy;
- translation accuracy and contextual meaning;
- names, places, family relationships, and migration details;
- sacred, restricted, or community-sensitive content;
- whether the item is suitable for family-only, community-reviewed, research, public, or no external access;
- whether AI processing or AI training is culturally appropriate.

No public release, institutional sharing, research export, dataset creation, AI training, or synthetic voice use should occur before consent and cultural validation are both checked.

## 9. Audit and Export Logging

QashqAI Voice should maintain auditability with lightweight records.

The audit log should record major governance actions, including:

- metadata creation or update;
- consent recording;
- consent revocation or narrowing;
- cultural validation decisions;
- access-level changes;
- AI-use decisions;
- export approval;
- institutional sharing.

The export log should record any external sharing event, including the item ID, files shared, recipient or partner, purpose, approval basis, consent status, cultural review status, date, and responsible person.

Auditability does not require heavy infrastructure at this stage, but governance decisions should be traceable enough that a small team can reconstruct what happened, when, why, and under whose authority.

## 10. Current Limitations

QashqAI Voice is currently an early governance and prototype repository.

Current limitations include:

- no automated access-control system;
- no encrypted storage automation;
- no implemented consent-management application;
- no automated revocation enforcement;
- no institutional data-sharing workflow;
- no verified multilingual transcription or translation pipeline;
- no automated cultural validation workflow;
- no technical prevention of copying files outside the repository;
- no guarantee that already shared files can be fully recalled.

Because of these limitations, the project should handle real recordings conservatively and keep sensitive material local and private unless consent, review, and storage controls are clearly in place.

## 11. Future Improvements

Future privacy improvements should include:

- a complete access-control policy linked to consent and cultural validation status;
- private narrator identity registry separated from archive metadata;
- encrypted storage guidance or tooling for raw recordings;
- structured export logging;
- review checklists for multilingual transcription and translation;
- clear third-party service review before AI or cloud processing;
- partner agreement templates for institutions;
- procedures for revocation, takedown, and downstream notification;
- periodic review of consent records, access levels, and exported materials.

The long-term objective is a practical preservation workflow where language documentation, ethical AI boundaries, and cultural authority are built into routine archive practice rather than added after collection.
