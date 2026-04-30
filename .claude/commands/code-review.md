---
description: Generate a GPT-5.5 review prompt with the current diff embedded
argument-hint: "[git-ref] (default: main...HEAD)"
---

You are preparing a code review handoff for GPT-5.5. Do **not** review the code yourself — your job is to package the diff into the QashqAI Voice review template so the user can paste it into a fresh GPT-5.5 conversation.

## Steps

1. Determine the diff range:
   - If the user provided an argument (e.g., `HEAD~3`), use `git diff $ARGUMENTS`
   - Otherwise, default to `git diff main...HEAD`

2. Run the diff and capture the output. If the diff is empty, tell the user there is nothing to review and stop.

3. Check the diff size. If it exceeds ~200KB or ~3000 lines, **warn the user** and recommend splitting the PR before continuing. Ask whether to proceed anyway.

4. Read `.claude/review-prompt.md` from the project root.

5. Replace the `[PASTE DIFF HERE]` placeholder with the actual diff content (inside the existing ```diff fenced block).

6. Output the **complete filled-in prompt** to the chat, wrapped in a single markdown code block so the user can copy it in one click.

7. After the code block, print this reminder verbatim:

```
✓ Prompt ready. Next steps:
  1. Open a NEW GPT-5.5 conversation (fresh context — no carryover)
  2. Paste the entire prompt above
  3. Wait for VERDICT line
  4. If APPROVE → proceed to cultural validation (if applicable) → merge
  5. If REQUEST_CHANGES → fix and run /review again
  6. If BLOCK → return here, rethink approach
```

## Constraints

- Do NOT write or modify any files.
- Do NOT attempt to perform the review yourself — your output is only the packaged prompt.
- Do NOT summarize the diff before the prompt block — the user wants the prompt ready to copy, not commentary.
- If the project has no `main` branch (e.g., uses `master` or `develop`), detect this with `git branch -a` and use the correct default.
