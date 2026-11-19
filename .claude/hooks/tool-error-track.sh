# bodhiorchard-claude-hook
#!/bin/sh
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
. "$SCRIPT_DIR/_common.sh"

INPUT=$(cat)
SESSION_ID=$(sanitize_path "$(get_sid "$INPUT")")

TOOL=$(printf '%s' "$INPUT" | grep -o '"tool_name":"[^"]*"' | head -1 | cut -d'"' -f4)
ERR=$(printf '%s' "$INPUT" | grep -o '"error":"[^"]*"' | \
  head -1 | cut -d'"' -f4 | head -c 500)
EMAIL=$(session_get "$SESSION_ID" email)
BUD_NUM=$(session_get "$SESSION_ID" bud_number)
BRANCH=$(session_get "$SESSION_ID" branch)
BRANCH="${BRANCH:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")}"
[ -z "$BUD_NUM" ] && BUD_NUM=$(get_bud_from_branch)

J=$(build_json session_id "$SESSION_ID" event_type tool_error \
  author_email "$EMAIL" branch "$BRANCH" repo_path "$(pwd)" \
  message "$TOOL failed: $ERR")
[ -n "$BUD_NUM" ] && \
  J=$(printf '%s' "$J" | sed "s/}$/,\"bud_number\":$BUD_NUM}/")
bg_post "$J"
exit 0
