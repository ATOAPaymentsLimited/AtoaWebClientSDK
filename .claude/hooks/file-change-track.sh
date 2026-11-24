# bodhiorchard-claude-hook
#!/bin/sh
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
. "$SCRIPT_DIR/_common.sh"

INPUT=$(cat)
SESSION_ID=$(sanitize_path "$(get_sid "$INPUT")")

# Extract file_path from tool_input
FPATH=$(printf '%s' "$INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$FPATH" ] && exit 0

TOOL=$(printf '%s' "$INPUT" | grep -o '"tool_name":"[^"]*"' | head -1 | cut -d'"' -f4)
refresh_session_bud "$SESSION_ID"
EMAIL=$(session_get "$SESSION_ID" email)
BUD_NUM=$(session_get "$SESSION_ID" bud_number)
BRANCH=$(session_get "$SESSION_ID" branch)
BRANCH="${BRANCH:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")}"
[ -z "$BUD_NUM" ] && BUD_NUM=$(get_bud_from_branch)
REPO=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

J=$(build_json session_id "$SESSION_ID" event_type file_change \
  author_email "$EMAIL" branch "$BRANCH" repo_path "$REPO" \
  file_path "$FPATH" message "$TOOL: $FPATH")
[ -n "$BUD_NUM" ] && \
  J=$(printf '%s' "$J" | sed "s/}$/,\"bud_number\":$BUD_NUM}/")
bg_post "$J"
exit 0
