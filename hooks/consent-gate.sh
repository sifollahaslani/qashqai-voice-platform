#!/usr/bin/env bash
# QashqAI Voice — Consent gate hook (Step 4)
#
# Runs as PreToolUse(Bash). Inspects the Bash command Claude Code is about
# to execute. If it mentions a speaker ID, the hook verifies that every
# entry for that speaker in data/entries.json has consent_status == "confirmed";
# anything else (pending / withdrawn / restricted, or missing entries, or a
# corrupt store) is a hard block.
#
# WHAT CHANGED VS. THE PRE-STEP-4 HOOK
#   1. Regex now matches the canonical speaker_id format SPK-\d{3,}
#      (was SPK_[0-9]{8}_[0-9]{3}, which matched no real IDs in this repo
#      and silently allowed every speaker-touching command through).
#   2. Regex is case-insensitive at detect time; the matched ID is upper-
#      cased before lookup. Lowercase mentions cannot sneak past.
#   3. Reads data/entries.json (the actual store), not metadata/<SPK>.json
#      (the imaginary store from before).
#   4. JSON parsing delegated to inline Python (grep on JSON was the
#      pre-Step-4 source of the parsing fragility).
#   5. Per-speaker all-or-nothing: ANY non-confirmed entry for the speaker
#      blocks the command. Aligned with the new ConsentStatus enum
#      (confirmed / pending / withdrawn / restricted) — only "confirmed"
#      authorises processing.
#   6. Entries path overridable via $QV_ENTRIES_FILE for testing only.
#      Default remains data/entries.json — no other behavior change.
#
# Exit codes:
#   0  command may proceed (no speaker ID mentioned, or speaker fully confirmed)
#   1  command blocked (speaker not confirmed, store missing/corrupt, or other failure)
#
# Configure in: .claude/settings.json under hooks.PreToolUse

set -euo pipefail

COMMAND="${CLAUDE_TOOL_INPUT_COMMAND:-}"
ENTRIES_FILE="${QV_ENTRIES_FILE:-data/entries.json}"

# Detect a speaker reference in the command. Case-insensitive — we want to
# catch lowercase mentions even though the canonical store is uppercase.
SPEAKER_ID_RAW=$(echo "$COMMAND" | grep -oiE 'SPK-[0-9]{3,}' | head -1 || true)

if [[ -z "$SPEAKER_ID_RAW" ]]; then
  # No speaker reference. Command is not subject to consent enforcement.
  # This is deliberate and scoped — the hook gates speaker data access, not
  # every Bash command. Documented in the v0 governance hardening plan.
  exit 0
fi

# Normalize to canonical uppercase for store lookup.
SPEAKER_ID=$(echo "$SPEAKER_ID_RAW" | tr '[:lower:]' '[:upper:]')

# Consent lookup. JSON parsing is done in Python because bash + grep on JSON
# was the entire reason this hook silently failed pre-Step-4.
python - "$SPEAKER_ID" "$ENTRIES_FILE" <<'PY'
import json
import sys

speaker_id, entries_path = sys.argv[1], sys.argv[2]

try:
    with open(entries_path, encoding="utf-8") as fh:
        entries = json.load(fh)
except FileNotFoundError:
    print(f"CONSENT GATE: {entries_path} not found. Cannot verify consent for {speaker_id}.")
    print("Processing blocked. Confirm the entries store exists before proceeding.")
    sys.exit(1)
except json.JSONDecodeError as exc:
    print(f"CONSENT GATE: {entries_path} is not valid JSON ({exc}). Failing closed.")
    sys.exit(1)

if not isinstance(entries, list):
    print(f"CONSENT GATE: {entries_path} top-level is not a list. Failing closed.")
    sys.exit(1)

matching = [
    e for e in entries
    if isinstance(e, dict) and e.get("speaker_id") == speaker_id
]

if not matching:
    print(f"CONSENT GATE: no entries found for speaker {speaker_id} in {entries_path}.")
    print("Run /intake first to register this speaker before processing.")
    sys.exit(1)

# All-or-nothing per speaker. Any non-confirmed entry blocks the speaker.
unconfirmed = [
    (e.get("id", "<no id>"), e.get("consent_status"))
    for e in matching
    if e.get("consent_status") != "confirmed"
]

if unconfirmed:
    print(
        f"CONSENT GATE: speaker {speaker_id} has {len(unconfirmed)} "
        f"entry/entries without confirmed consent:"
    )
    for entry_id, status in unconfirmed:
        print(f"  - entry {entry_id}: consent_status={status!r}")
    print("Processing blocked. Obtain and record confirmed consent before proceeding.")
    sys.exit(1)

print(
    f"CONSENT GATE: speaker {speaker_id} — {len(matching)} entry/entries, "
    f"all confirmed. Proceeding."
)
sys.exit(0)
PY
