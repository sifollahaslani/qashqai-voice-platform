Run the Cultural Guardian agent to review a transcription or batch of transcriptions for cultural accuracy, sensitivity classification, and consent alignment.

This command runs the second stage of the QashqAI Voice pipeline. It will:
1. Read the transcription file(s) and corresponding metadata
2. Assess cultural accuracy and annotate dialect features
3. Apply a sensitivity tier (0 = public, 1 = community-restricted, 2 = restricted)
4. Verify consent alignment
5. Produce a review report and mark files as approved, pending, or on hold

**Usage:** `/review [file or speaker_id]`

Examples:
- `/review SPK_20260315_001` — review all files for this speaker
- `/review data/transcriptions/QASHQAI_SPK_20260315_001_story_20260315.txt` — review a single file

If no argument is given, the agent will review all files with `cultural_review_status: pending`.
