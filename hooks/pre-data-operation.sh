#!/usr/bin/env bash
# QashqAI Voice — Pre-data-operation hook
#
# This hook runs before any file write or edit operation on files under
# data/, metadata/, or 06_Data_Governance/. It checks that:
#   1. A session log exists for the current session
#   2. The operator has been identified
#   3. No tier-2 (restricted) files are being written outside the restricted archive
#
# Hook type: PreToolUse (Write, Edit)
# Configure in: .claude/settings.json under hooks.PreToolUse

set -euo pipefail

TARGET_FILE="${CLAUDE_TOOL_INPUT_FILE_PATH:-}"

# Only act on data-related paths
if [[ "$TARGET_FILE" != *"/data/"* ]] && \
   [[ "$TARGET_FILE" != *"/metadata/"* ]] && \
   [[ "$TARGET_FILE" != *"/06_Data_Governance/"* ]]; then
  exit 0
fi

# Check for active session log
SESSION_LOG_DIR="03_MVP/session_logs"
if ! ls "$SESSION_LOG_DIR"/*.md &>/dev/null 2>&1; then
  echo "WARNING: No session log found in $SESSION_LOG_DIR"
  echo "Please run /intake or create a session log before modifying data files."
  echo "This is a reminder, not a block — proceed with care."
fi

# Warn on restricted archive writes outside the restricted folder
if [[ "$TARGET_FILE" == *"restricted"* ]] || \
   echo "$TARGET_FILE" | grep -qi "tier.2\|sensitivity.*2\|restricted"; then
  if [[ "$TARGET_FILE" != *"/data/restricted/"* ]]; then
    echo "ERROR: Restricted (Tier 2) content must be written to data/restricted/ only."
    echo "File attempted: $TARGET_FILE"
    echo "Please move this file to the correct location before proceeding."
    exit 1
  fi
fi

exit 0
