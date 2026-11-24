        # bodhiorchard-claude-hook
        #!/bin/sh
        SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
        . "$SCRIPT_DIR/_common.sh"

        INPUT=$(cat)
        SESSION_ID=$(sanitize_path "$(get_sid "$INPUT")")

        # Extract prompt text (handles escapes via Python)
        PROMPT=$(printf '%s' "$INPUT" | python3 -c "
import sys,json
try: d=json.load(sys.stdin); print(d.get('prompt','')[:500])
except: pass
" 2>/dev/null)

        # Detect BUD references in prompt
        RAW_REF=$(echo "$PROMPT" | grep -ioE 'bud[- #]*([0-9]+)' | head -1 | grep -oE '[0-9]+')
        BUD_REF=$([ -n "$RAW_REF" ] && printf '%d' "$RAW_REF" || echo "")

        if [ -n "$BUD_REF" ]; then
          SF=$(session_file "$SESSION_ID")
          if [ -f "$SF" ]; then
            TMP="$SF.tmp"
            sed 's/"bud_number":"[^"]*"/"bud_number":"'"$BUD_REF"'"/' \
              "$SF" > "$TMP" 2>/dev/null && mv "$TMP" "$SF"
            rm -f "$TMP"
          fi
        fi

        # Post user prompt event (captures what the developer asked)
        [ -z "$PROMPT" ] && exit 0
        EMAIL=$(session_get "$SESSION_ID" email)
        BUD_NUM=$(session_get "$SESSION_ID" bud_number)
        [ -z "$BUD_NUM" ] && BUD_NUM="$BUD_REF"
        BRANCH=$(session_get "$SESSION_ID" branch)
        BRANCH="${BRANCH:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")}"

        J=$(build_json session_id "$SESSION_ID" event_type user_prompt \
          author_email "$EMAIL" branch "$BRANCH" \
          repo_path "$(pwd)" message "$PROMPT")
        [ -n "$BUD_NUM" ] && \
          J=$(printf '%s' "$J" | sed "s/}$/,\"bud_number\":$BUD_NUM}/")
        bg_post "$J"
        exit 0
