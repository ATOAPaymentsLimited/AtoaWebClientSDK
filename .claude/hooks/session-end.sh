# bodhiorchard-claude-hook
#!/bin/sh
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
. "$SCRIPT_DIR/_common.sh"

INPUT=$(cat)
SESSION_ID=$(sanitize_path "$(get_sid "$INPUT")")
[ -z "$SESSION_ID" ] && exit 0

EMAIL=$(session_get "$SESSION_ID" email)
BUD_NUM=$(session_get "$SESSION_ID" bud_number)
BRANCH=$(session_get "$SESSION_ID" branch)
BRANCH="${BRANCH:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")}"
[ -z "$BUD_NUM" ] && BUD_NUM=$(get_bud_from_branch)

J=$(build_json session_id "$SESSION_ID" event_type session_end \
  author_email "$EMAIL" branch "$BRANCH" \
  repo_path "$(pwd)" message "Session ended")
[ -n "$BUD_NUM" ] && \
  J=$(printf '%s' "$J" | sed "s/}$/,\"bud_number\":$BUD_NUM}/")
bg_post "$J"

# Clean up session file
rm -f "$(session_file "$SESSION_ID")"
exit 0
