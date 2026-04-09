#!/bin/bash
# ─── PostToolUse Hook — QashqAI Voice Platform ───
# Reminds to test after code file changes

INPUT=$(cat)

# Check if a code file was modified
if echo "$INPUT" | grep -qiE "\.(tsx|ts|jsx|js|py)\""; then
  echo "💡 Code file changed — remember: npm run test / npm run build before commit"
fi
