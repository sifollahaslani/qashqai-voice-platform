#!/bin/bash
# ─── PreToolUse Hook — QashqAI Voice Platform ───
# Prevents accidental destructive operations
# Deterministic callback: runs BEFORE every tool execution

INPUT=$(cat)

# Block dangerous deletions
if echo "$INPUT" | grep -qiE "rm\s+-rf\s+/|rm\s+-rf\s+\.|drop\s+database|DROP\s+TABLE|DELETE\s+FROM"; then
  echo '{"decision": "block", "reason": "🚫 Destructive operation blocked by QashqAI safety hook."}'
  exit 0
fi

# Block accidental secret exposure
if echo "$INPUT" | grep -qiE "echo.*API_KEY|echo.*SECRET|cat.*\.env\b|print.*password"; then
  echo '{"decision": "block", "reason": "🔐 Potential secret exposure blocked. Use environment variables."}'
  exit 0
fi

# Allow everything else
echo '{"decision": "allow"}'
