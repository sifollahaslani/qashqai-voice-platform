#!/usr/bin/env bash
# QashqAI Voice — Post-session log hook
#
# This hook runs after each Claude Code session ends (Stop event).
# It appends a brief session summary to the project register so
# the project history stays current without manual updates.
#
# Hook type: Stop
# Configure in: .claude/settings.json under hooks.Stop

set -euo pipefail

PROJECT_REGISTER="project_register.md"
SESSION_DATE=$(date +"%Y-%m-%d")
SESSION_TIME=$(date +"%H:%M")

if [[ ! -f "$PROJECT_REGISTER" ]]; then
  echo "project_register.md not found — skipping session log append."
  exit 0
fi

# Append a timestamped session entry
cat >> "$PROJECT_REGISTER" << EOF

## Session — $SESSION_DATE $SESSION_TIME
- Claude Code session completed
- Review project_register.md and 03_MVP/session_logs/ for details
EOF

echo "Session entry appended to $PROJECT_REGISTER"
exit 0
