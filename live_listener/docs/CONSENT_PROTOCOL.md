# Consent Protocol — QashqAI Live Listener

**Layer 4 Cultural Validator: Father (primary native Darreh-Shuri Qashqai speaker)**

---

## Purpose

This protocol governs the use of the Live Listener tool during fieldwork sessions with the primary speaker. It is a binding operational requirement, not a suggestion. No recording session may begin without completing this checklist.

---

## Before Every Session

The following steps must be completed in order. Do not skip or combine steps.

### Step 1 — Explain the session

Tell the speaker in Persian or Qashqai:

> "این ابزار فقط برای تحلیل زبانی است. صدای شما هیچ‌وقت ذخیره نمی‌شود.
> فقط متن گفتار در حافظه کوتاه‌مدت نگه داشته می‌شود و بعد از هر جلسه پاک می‌شود.
> آیا رضایت دارید که ادامه دهیم؟"

Translation: "This tool is only for linguistic analysis. Your voice is never saved. Only the text of the speech is kept in short-term memory and cleared after each session. Do you consent to continue?"

### Step 2 — Receive explicit verbal confirmation

The speaker must say **بله (yes)** or give a clear equivalent affirmation. Silence, a nod, or ambiguity is **not** consent.

### Step 3 — Confirm at the tool prompt

When the tool displays:

```
آیا پدر رضایت صریح داده است؟ (y = بله / n = خیر):
```

Type `y` **only after** the speaker has given verbal confirmation in Step 2. If you type `y` before asking, you are bypassing the protocol.

### Step 4 — Note the session in your fieldwork log

Record the following in your fieldwork notes (not in the tool — the tool stores nothing):

- Date and approximate time
- Speaker's verbal confirmation received: yes/no
- Topics discussed (general — e.g. "childhood memories", "seasonal migration")
- Any words or phrases the speaker asked not to use publicly

---

## What This Tool Does and Does Not Do

| What it DOES | What it DOES NOT do |
|---|---|
| Captures audio in 20-second chunks in memory | Write any audio file to disk |
| Transcribes via OpenAI Whisper API (in-memory stream) | Store raw audio beyond the transcription call |
| Sends transcript text to Claude for linguistic analysis | Send audio to Claude |
| Prints JSON analysis to your terminal | Save analysis output automatically |
| Clears transcript buffer on exit | Persist any session data |

---

## Community Consent Framework

This protocol implements the **QashqAI Voice Community Consent Framework v1.0** (published 2026-04-07).

Core principles from that framework that apply here:

1. **Consent comes before data.** No processing without confirmed consent.
2. **Dialect variation is preserved.** The speaker's natural speech is never "corrected."
3. **Cultural integrity is the purpose.** Every session serves language preservation, not extraction.
4. **All content is strictly cultural and educational.** Never political.

The full Community Consent Framework is maintained in the main QashqAI Voice repository.

---

## If the Speaker Withdraws Consent Mid-Session

Press `Ctrl+C` immediately. The tool will:

1. Stop recording
2. Clear the in-memory transcript buffer
3. Print confirmation that no data was persisted

Note the withdrawal time in your fieldwork log.

---

## Contact

Director: Siefollah Aslani — Bremen, Germany
Project: QashqAI Voice (github.com/sifollahaslani/qashqai-voice-platform)
