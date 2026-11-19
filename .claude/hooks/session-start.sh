        # bodhiorchard-claude-hook
        #!/bin/sh
        SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
        . "$SCRIPT_DIR/_common.sh"

        INPUT=$(cat)
        SESSION_ID=$(sanitize_path "$(get_sid "$INPUT")")
        [ -z "$SESSION_ID" ] && exit 0

        NAME=$(get_git_name)
        EMAIL=$(get_git_email)
        BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
        BUD_NUM=$(get_bud_from_branch)

        # Write session context for later hooks (escape values for safe JSON)
        ENAME=$(escape_json "$NAME")
        EEMAIL=$(escape_json "$EMAIL")
        EBRANCH=$(escape_json "$BRANCH")
        SF=$(session_file "$SESSION_ID")
        printf '{"session_id":"%s","name":"%s","email":"%s","branch":"%s","bud_number":"%s"}' \
          "$SESSION_ID" "$ENAME" "$EEMAIL" "$EBRANCH" "$BUD_NUM" > "$SF"

        # Inject context into Claude
        echo "Developer: $NAME ($EMAIL)"
        echo "Branch: $BRANCH"
        if [ -n "$BUD_NUM" ]; then
          echo "Active BUD: BUD-$(printf '%03d' "$BUD_NUM")"
        else
          echo "No active BUD from branch. Mention a BUD in your prompt if working on one."
        fi

        # Extract model and source from Claude Code input
        MODEL=$(printf '%s' "$INPUT" | python3 -c "
import sys,json
try: d=json.load(sys.stdin); print(d.get('model',''))
except: pass
" 2>/dev/null)

        # Report to backend with model in metadata
        J=$(build_json session_id "$SESSION_ID" event_type session_start \
          author_email "$EMAIL" branch "$BRANCH" \
          repo_path "$(pwd)" message "Session started")
        [ -n "$BUD_NUM" ] && \
          J=$(printf '%s' "$J" | sed "s/}$/,\"bud_number\":$BUD_NUM}/")
        [ -n "$MODEL" ] && \
          J=$(printf '%s' "$J" | \
          sed "s/}$/,\"metadata\":{\"model\":\"$(escape_json "$MODEL")\"}}/")
        bg_post "$J"
        exit 0
