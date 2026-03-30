Run the Language Processor agent to convert culturally-approved transcriptions into clean, model-ready dataset records.

This command runs the third and final stage of the QashqAI Voice pipeline. It will:
1. Verify all entry gates (consent confirmed, cultural review approved, sensitivity tier present)
2. Normalize transcriptions preserving dialect features
3. Align translations if available
4. Package records in the appropriate format (ASR training or archival documentation)
5. Run quality checks and produce a processing log

**Usage:** `/process [speaker_id or "batch"]`

Examples:
- `/process SPK_20260315_001` — process approved files for one speaker
- `/process batch` — process all files currently marked `cultural_review_status: approved`

**Important:** This command will refuse to run on any file that has not passed Cultural Guardian review. The cultural integrity of this dataset is not optional.
