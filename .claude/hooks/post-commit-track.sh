# bodhiorchard-claude-hook
#!/bin/sh
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
. "$SCRIPT_DIR/_common.sh"

INPUT=$(cat)

# Only process git commit commands
CMD=$(printf '%s' "$INPUT" | grep -o '"command":"[^"]*"' | head -1 | cut -d'"' -f4)
case "$CMD" in *git\ commit*|*git\ -c*commit*) ;; *) exit 0 ;; esac

SHA=$(git rev-parse HEAD 2>/dev/null || exit 0)
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
BUD_NUM=$(get_bud_from_branch)
EMAIL=$(get_git_email)
MSG=$(git log -1 --format=%s 2>/dev/null | head -c 400)
FILES=$(git diff-tree --no-commit-id --name-only -r HEAD 2>/dev/null | tr '\n' ',')
REPO=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
SESSION_ID=$(sanitize_path "$(get_sid "$INPUT")")

J=$(build_json session_id "$SESSION_ID" event_type commit \
  author_email "$EMAIL" branch "$BRANCH" repo_path "$REPO" \
  message "$MSG" commit_sha "$SHA" files_changed "$FILES")
[ -n "$BUD_NUM" ] && \
  J=$(printf '%s' "$J" | sed "s/}$/,\"bud_number\":$BUD_NUM}/")
bg_post "$J"
exit 0
