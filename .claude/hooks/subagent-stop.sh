        # bodhiorchard-claude-hook
        #!/bin/sh
        SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
        . "$SCRIPT_DIR/_common.sh"

        INPUT=$(cat)
        SESSION_ID=$(sanitize_path "$(get_sid "$INPUT")")

        AGENT_TYPE=$(printf '%s' "$INPUT" | python3 -c "
import sys,json
try: d=json.load(sys.stdin); print(d.get('agent_type',''))
except: pass
" 2>/dev/null)
        SUMMARY=$(printf '%s' "$INPUT" | python3 -c "
import sys,json
try: d=json.load(sys.stdin); print(d.get('last_assistant_message','')[:500])
except: pass
" 2>/dev/null)

        EMAIL=$(session_get "$SESSION_ID" email)
        BUD_NUM=$(session_get "$SESSION_ID" bud_number)
        BRANCH=$(session_get "$SESSION_ID" branch)
        BRANCH="${BRANCH:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")}"
        [ -z "$BUD_NUM" ] && BUD_NUM=$(get_bud_from_branch)

        MSG="Agent $AGENT_TYPE done"
        [ -n "$SUMMARY" ] && MSG="$SUMMARY"

        J=$(build_json session_id "$SESSION_ID" event_type subagent_stop \
          author_email "$EMAIL" branch "$BRANCH" \
          repo_path "$(pwd)" message "$MSG")
        [ -n "$BUD_NUM" ] && \
          J=$(printf '%s' "$J" | sed "s/}$/,\"bud_number\":$BUD_NUM}/")
        bg_post "$J"
        exit 0
