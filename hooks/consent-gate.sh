#!/usr/bin/env bash
# QashqAI Voice — Consent gate hook
#
# This hook runs before any Bash command is executed. It intercepts
# Python scripts or data processing commands and checks that the
# target speaker ID has a confirmed consent record before the
# command is allowed to run.
#
# Hook type: PreToolUse (Bash)
# Configure in: .claude/settings.json under hooks.PreToolUse

set -euo pipefail

COMMAND="${CLAUDE_TOOL_INPUT_COMMAND:-}"
METADATA_DIR="metadata"

# Only act on commands that reference a speaker ID pattern
SPEAKER_ID=$(echo "$COMMAND" | grep -oE 'SPK_[0-9]{8}_[0-9]{3}' | head -1 || true)

if [[ -z "$SPEAKER_ID" ]]; then
  exit 0  # No speaker ID in command — allow through
fi

METADATA_FILE="$METADATA_DIR/${SPEAKER_ID}.json"

# Check metadata file exists
if [[ ! -f "$METADATA_FILE" ]]; then
  echo "CONSENT GATE: No metadata record found for $SPEAKER_ID"
  echo "Expected: $METADATA_FILE"
  echo "Run /intake first to register this speaker before processing."
  exit 1
fi

# Check consent_status field
CONSENT_STATUS=$(grep -o '"consent_status"[[:space:]]*:[[:space:]]*"[^"]*"' "$METADATA_FILE" | \
                 grep -o '"[^"]*"$' | tr -d '"' || true)

if [[ "$CONSENT_STATUS" != "confirmed" ]]; then
  echo "CONSENT GATE: Speaker $SPEAKER_ID does not have confirmed consent."
  echo "Current consent_status: '${CONSENT_STATUS:-not set}'"
  echo "Processing blocked. Obtain and record consent before proceeding."
  exit 1
fi

echo "Consent gate: $SPEAKER_ID — consent confirmed. Proceeding."
exit 0
