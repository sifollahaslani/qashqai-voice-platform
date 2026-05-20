# Example Governed Archive Item

This folder demonstrates how a fictional QashqAI Voice archive item connects metadata, consent, validation, audit, and export records.

No real recording is included. The raw audio path is represented as:

```text
archive/raw_audio/qv-rec-2026-000001.wav
```

That location is ignored by Git and should be used only for local/private storage when real recordings exist.

Linked records:

- Metadata: `metadata/examples/qv-item-2026-000001.metadata.json`
- Consent ledger row: `consent/examples/consent_ledger.example.csv`
- Revocation template row: `consent/examples/revocations.example.csv`
- Validation record: `validation/examples/qv-item-2026-000001.validation.json`
- Audit entries: `audit/examples/audit_log.example.csv`
- Export log row: `audit/examples/export_log.example.csv`
- Example export manifest: `archive/example_items/qv-item-2026-000001/export-2026-000001.manifest.json`
- Protected local export path: `exports/examples/export-2026-000001.manifest.json`

Fictional sample:

- Narrator ID: `nar-9001`
- Narrator display name: `Fictional Narrator A`
- Recording ID: `qv-rec-2026-000001`
- Item ID: `qv-item-2026-000001`
- Consent ID: `consent-2026-000001`
- Validation ID: `review-2026-000001`
- Export ID: `export-2026-000001`
