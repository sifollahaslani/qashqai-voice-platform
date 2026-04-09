#!/bin/bash
# ─── Notification Hook — QashqAI Voice Platform ───
# Alerts when a long-running task completes

# Windows (PowerShell beep)
if command -v powershell.exe &>/dev/null; then
  powershell.exe -Command "[console]::beep(800,200); [console]::beep(1000,200)" 2>/dev/null
# Linux
elif command -v notify-send &>/dev/null; then
  notify-send "Claude Code ✅" "QashqAI Voice — Task completed!"
# macOS
elif command -v osascript &>/dev/null; then
  osascript -e 'display notification "Task completed!" with title "Claude Code ✅"'
fi
