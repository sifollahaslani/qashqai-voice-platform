Show the current status of all files in the QashqAI Voice pipeline — how many are at each stage, what is blocked, and what is ready to move forward.

This command reads across all metadata records, session logs, review logs, and processing logs to produce a single-page pipeline status report.

**Usage:** `/pipeline-status`

The report will show:
- **Intake stage:** files registered but not yet reviewed
- **Review stage:** files pending or in cultural guardian review
- **Blocked:** files on hold or pending community consultation
- **Processing stage:** approved files ready for or currently being processed
- **Complete:** files fully processed and in the dataset
- **Flags:** any consent mismatches, missing metadata, or naming issues

No arguments needed. Run this at the start of any work session to orient yourself.
