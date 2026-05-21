# QashqAI Voice Access Control Policy

## 1. Purpose

This policy defines how access to QashqAI Voice recordings, metadata, transcripts, translations, consent records, identity records, validation records, exports, and AI-derived artifacts should be managed.

QashqAI Voice is a small, local-first project. This policy sets practical expectations for responsible access without pretending that enterprise access-control infrastructure already exists.

The purpose is to protect narrator privacy, cultural dignity, revocable consent, multilingual archive integrity, and future collaboration with institutions without transferring ownership or control away from narrators, families, or authorized cultural governance.

## 2. Core Access Principles

QashqAI Voice follows these access principles:

- **Private by default:** no recording or sensitive derivative is public unless consent and cultural validation permit it.
- **Local first:** sensitive archive material should remain in trusted local or encrypted storage whenever possible.
- **Least privilege:** people should access only the files needed for their role and task.
- **Separation of duties:** raw recording access, identity access, validation access, and export authority should be separated where practical.
- **Consent dependency:** access must follow active consent and revocation status.
- **Cultural validation dependency:** broader access requires cultural validation where relevant.
- **Auditability:** meaningful access, export, review, and emergency actions should be logged.
- **No implied institutional ownership:** collaboration with external organizations does not transfer control over archive materials.

## 3. Access Categories

Suggested access categories:

- **Private:** restricted to authorized project maintainers and approved family or narrator representatives.
- **Family-only:** available only to the narrator, family, or designated family reviewers.
- **Reviewer access:** limited access for language, translation, cultural, or consent review.
- **Community-reviewed:** available under agreed community or family governance conditions.
- **Research-approved:** limited external research access under documented restrictions.
- **Public:** approved for public release after consent and cultural validation.
- **Restricted:** sensitive, sacred, private, disputed, or high-risk material with no external access.
- **Revoked:** material whose future access or use has been withdrawn or narrowed.

If an item fits more than one category, the most restrictive applicable category should apply.

## 4. Role Definitions

Practical roles may include:

- **Narrator:** the person whose voice, story, or knowledge is recorded.
- **Family representative:** a person authorized by the narrator or family to participate in review or access decisions.
- **Project maintainer:** a trusted person responsible for file organization, metadata, consent records, and basic technical handling.
- **Linguistic reviewer:** a person reviewing transcription, dialect, terminology, or language accuracy.
- **Translation reviewer:** a person reviewing translation quality and contextual meaning.
- **Cultural reviewer:** a trusted reviewer assessing sensitivity, cultural context, access suitability, and harm risk.
- **Institutional partner:** an external organization or researcher with limited, documented access for an approved purpose.
- **Technical processor:** a person or service assisting with storage, transcription, translation, audio processing, or archival tooling.

Roles should not automatically grant broad access. Each access decision should consider the item, consent status, cultural validation status, and task.

## 5. Raw Recording Access

Raw recordings are sensitive by default.

Raw recording access should be limited to:

- the narrator;
- authorized family or project maintainers;
- reviewers who need audio for transcription, translation, or validation;
- approved technical processors when consent and privacy review permit it.

Raw recordings should not be committed to Git, placed in public folders, uploaded to public repositories, or shared through informal channels without documented approval.

Edited or derived audio inherits the same restrictions as the raw recording unless a separate consent and validation decision permits broader access.

## 6. Metadata and Identity Separation

QashqAI Voice should separate archive metadata from narrator identity records.

Metadata may include item ID, recording ID, general language information, dialect notes, consent ID, review status, and access level.

Identity records may include legal name, contact details, precise family relationships, and other identifying information. These records should be stored separately, with stricter access than general metadata.

Archive metadata should use stable narrator IDs instead of exposing names or contact information. Public or institutional metadata should be reviewed for re-identification risk before sharing.

## 7. Reviewer and Validator Access

Reviewers should receive only the material needed for their review task.

Examples:

- a linguistic reviewer may need audio and source-language transcript;
- a translation reviewer may need source transcript, translation, and notes;
- a cultural reviewer may need transcript, translation, metadata, and relevant context;
- a consent reviewer may need consent and access-level records but not all raw audio.

Reviewers should not redistribute materials, create independent datasets, upload files to external services, or use recordings for unrelated research or AI development unless explicitly approved.

Reviewer notes may themselves contain sensitive information and should be handled as governance records, not casual comments.

## 8. Institutional and External Access

Institutional access is limited, conditional, and purpose-specific.

Before sharing with an external institution, QashqAI Voice should confirm:

- active consent for institutional sharing;
- completed cultural validation;
- approved access level;
- permitted purpose;
- files or fields to be shared;
- retention and deletion expectations;
- attribution or anonymity requirements;
- restrictions on redistribution, AI use, dataset creation, and publication;
- revocation and takedown expectations.

Institutional collaboration should support preservation and responsible access without centralizing ownership or control outside the narrator, family, or authorized governance process.

## 9. AI Provider and API Restrictions

External AI providers and APIs should be treated as external access.

Recordings, transcripts, translations, metadata, or summaries should not be sent to an AI provider unless:

- consent permits the specific processing activity;
- cultural validation does not prohibit the use;
- the project understands whether the provider stores, logs, reviews, transfers, or trains on submitted data;
- the output and any retained files can be handled according to project policy;
- the action is recorded when the material is sensitive or externally processed.

API keys and credentials must not be committed to Git. Local `.env` files, secrets, credentials, temporary outputs, and API logs should be ignored or stored securely.

## 10. Export and Dataset Restrictions

Exports are restricted by default.

No export should occur unless:

- consent allows the proposed use;
- cultural validation allows the proposed use;
- the export purpose is documented;
- the files and fields being exported are identified;
- the recipient or destination is known;
- the export is logged.

Dataset creation is a high-risk activity. It may combine materials in ways that change privacy, cultural, or AI-use risk. Dataset creation for research, publication, training, benchmarking, or institutional sharing requires explicit consent, cultural validation, and export logging.

Public release, AI training, embeddings export, synthetic voice development, and commercial use must not be implied by general preservation consent.

## 11. Temporary Files and Processing Storage

Temporary processing files can contain sensitive material.

This includes:

- audio clips;
- normalized or converted audio;
- transcript drafts;
- translation drafts;
- summaries;
- embeddings;
- API request or response logs;
- local database caches;
- model inputs and outputs.

Temporary files should be stored in ignored local folders, deleted when no longer needed, and not copied into tracked source directories. If temporary files are needed for audit or review, they should be moved into an approved archive location with the correct access level.

Portable drives and backups should be encrypted or physically protected when they contain private recordings, identity records, consent documents, transcripts, translations, or exports.

## 12. Logging and Audit Expectations

QashqAI Voice should log meaningful access and sharing decisions in a lightweight way.

The audit log should record:

- major access-level changes;
- consent updates;
- revocations;
- cultural validation decisions;
- export approvals;
- external sharing;
- AI-provider processing;
- emergency access or removal;
- dataset creation decisions.

The project does not currently require full low-level file access logs for every local file open. However, decisions that change access, create exports, or send material outside local custody should be documented.

## 13. Revocation-Aware Access Handling

When consent is revoked or narrowed, access must be reduced accordingly.

Revocation handling should include:

- marking the consent record as revoked or narrowed;
- updating metadata and validation status where needed;
- restricting future local access;
- stopping future exports, dataset inclusion, AI processing, or public display;
- notifying external partners when agreements require or support downstream action;
- recording the action in the audit log.

The project should not promise perfect recall of files already shared externally unless a specific agreement and technical process make that possible. This limitation is one reason external sharing and dataset creation should remain conservative.

## 14. Emergency Access Situations

Emergency access may be needed to prevent or reduce immediate privacy, dignity, cultural, or safety harm.

Examples include:

- accidental public exposure of a recording;
- discovery of restricted or sacred material in an accessible location;
- mistaken export;
- compromised credentials;
- urgent narrator or family request for removal;
- material that could expose a person, family, or community to harm.

In an emergency, a trusted maintainer may temporarily restrict access, remove a public copy under project control, disable a shared link, or quarantine files before completing the full review process.

Emergency actions should be documented afterward, including the reason, files affected, person responsible, and follow-up steps needed.

## 15. Current Technical Limitations

QashqAI Voice currently relies on policy, file organization, `.gitignore`, and human discipline rather than a full access-control platform.

Current limitations include:

- no role-based access-control system;
- no automated permission checks before file access;
- no encrypted archive implementation;
- no automated export gate;
- no automated revocation enforcement;
- no centralized identity-management system;
- no full file-level access log;
- no technical prevention of copying local files;
- no verified backup or disaster-recovery process.

Because these controls do not yet exist, the project should avoid storing highly sensitive material in broadly shared folders and should limit external access until stronger procedures are in place.

## 16. Future Governance Goals

Future access-control improvements should include:

- encrypted local archive storage guidance;
- a private narrator identity registry;
- access-level fields linked to metadata and consent records;
- export checklists tied to consent and cultural validation;
- a lightweight export log;
- dataset registry with revocation status;
- partner access agreement templates;
- documented backup and portable-drive procedures;
- emergency removal checklist;
- technical checks that warn or block export when consent or validation is missing.

The long-term goal is practical, trust-preserving access governance that protects narrators and cultural materials while still allowing careful preservation, review, and responsible collaboration.
