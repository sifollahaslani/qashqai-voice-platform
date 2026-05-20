# QashqAI Voice AI Processing Checklist

## Purpose

Use this checklist before any QashqAI Voice material is processed with AI tools, including local tools, external APIs, transcription services, translation services, embedding models, summarizers, or model-training workflows.

## Before AI Processing Checklist

### 1. Define the AI Activity

- [ ] Activity is identified: transcription, translation, summarization, embedding, search, training, evaluation, synthetic voice, or other.
- [ ] Tool or provider is identified.
- [ ] Local or external processing is identified.
- [ ] Inputs are listed.
- [ ] Outputs to retain are listed.
- [ ] Temporary files are identified.

### 2. Consent Check

- [ ] Consent record exists.
- [ ] Consent is active.
- [ ] Consent has not been revoked or narrowed.
- [ ] Transcription is allowed, if applicable.
- [ ] Translation is allowed, if applicable.
- [ ] Summarization is allowed, if applicable.
- [ ] Embeddings are allowed, if applicable.
- [ ] AI training is allowed, if applicable.
- [ ] Synthetic voice is allowed, if applicable.
- [ ] External processing is allowed, if applicable.

If a permission is blank or unclear, treat it as not allowed.

### 3. Cultural Validation Check

- [ ] Validation record exists.
- [ ] Sensitivity level permits the AI activity.
- [ ] AI-use recommendation permits the activity.
- [ ] Translation and dialect risks have been reviewed where relevant.
- [ ] Restricted or sacred material is not processed without explicit approval.

### 4. Provider and API Review

- [ ] API key is stored outside Git.
- [ ] Provider retention behavior is understood.
- [ ] Provider training behavior is understood.
- [ ] Provider logging or human review behavior is understood.
- [ ] Uploading the material is consistent with consent and policy.
- [ ] Output storage location is identified.

### 5. Output Handling

- [ ] Outputs are stored in an approved location.
- [ ] Temporary files are deleted or moved into governed storage.
- [ ] Embeddings and indexes are treated as sensitive derived artifacts.
- [ ] Summaries are reviewed before use.
- [ ] AI outputs are labeled as drafts until reviewed.

### 6. Audit Requirements

- [ ] AI processing action is logged.
- [ ] Tool/provider is recorded.
- [ ] Input item IDs are recorded.
- [ ] Consent basis is recorded.
- [ ] Validation status is recorded.
- [ ] Reviewer or maintainer is recorded.

## Prohibited Without Separate Approval

- AI training or fine-tuning.
- Synthetic voice, speaker modeling, or voice cloning.
- Public dataset creation.
- External embedding index sharing.
- Commercial AI use.
- Processing restricted material through external APIs.

