# bodhiorchard-claude-hook
# Shared utilities for Glideship hooks.
# Sourced by individual hook scripts — not executed directly.

BACKEND_URL="http://localhost:8000"
# GLIDESHIP_MCP_TOKEN wins when set; the pre-rename name still works.
TOKEN="${GLIDESHIP_MCP_TOKEN-${BODHIORCHARD_MCP_TOKEN:-}}"

escape_json() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr '\n\r\t' '   '
}

sanitize_path() {
  printf '%s' "$1" | tr -cd 'a-zA-Z0-9_-'
}

get_sid() {
  # Accept both Claude/Codex ``session_id`` and Copilot ``sessionId``
  # so one script set serves every provider's stdin payload.
  printf '%s' "$1" \
    | grep -o '"session_id":"[^"]*"\|"sessionId":"[^"]*"' \
    | head -1 | cut -d'"' -f4
}

get_bud_from_branch() {
  RAW=$(git rev-parse --abbrev-ref HEAD 2>/dev/null | \
    sed -n 's/^bud-\([0-9][0-9]*\)\/.*/\1/p')
  # Strip leading zeros for valid JSON numbers (POSIX)
  [ -n "$RAW" ] && printf '%d' "$RAW" || echo ""
}

get_git_email() {
  git config user.email 2>/dev/null || echo ""
}

get_git_name() {
  git config user.name 2>/dev/null || echo ""
}

# Build JSON from key=value pairs. Usage: build_json key1 val1 key2 val2 ...
build_json() {
  J='{'
  SEP=""
  while [ $# -ge 2 ]; do
    KEY="$1"; VAL="$2"; shift 2
    if [ "$KEY" = "_int" ]; then
      # Next pair is an integer field: _int bud_number 42
      KEY="$VAL"; VAL="$1"; shift
      J="$J${SEP}\"$KEY\":$VAL"
    else
      J="$J${SEP}\"$KEY\":\"$(escape_json "$VAL")\""
    fi
    SEP=","
  done
  printf '%s}' "$J"
}

# Fire-and-forget POST with Bearer auth. No-op if no token.
bg_post() {
  [ -z "$TOKEN" ] && return 0
  curl -s -X POST "$BACKEND_URL/mcp/dev-activity" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    --connect-timeout 5 --max-time 10 \
    -d "$1" >/dev/null 2>&1 &
}

# Read a field from the session context file
session_file() {
  echo "${TMPDIR:-/tmp}/.bodhiorchard-session-$1.json"
}

session_get() {
  # session_get <session_id> <field>
  F=$(session_file "$1")
  PAT=$(printf '"%s":"[^"]*"' "$2")
  [ -f "$F" ] && grep -o "$PAT" "$F" | head -1 | cut -d'"' -f4
}

# Re-detect BUD from current branch and update session file
refresh_session_bud() {
  SID="$1"
  SF=$(session_file "$SID")
  [ -f "$SF" ] || return 0
  NEW_BUD=$(get_bud_from_branch)
  OLD_BUD=$(session_get "$SID" bud_number)
  if [ "$NEW_BUD" != "$OLD_BUD" ] && [ -n "$NEW_BUD" ]; then
    TMP="$SF.tmp"
    sed 's/"bud_number":"[^"]*"/"bud_number":"'"$NEW_BUD"'"/' \
      "$SF" > "$TMP" 2>/dev/null && mv "$TMP" "$SF"
    rm -f "$TMP"
  fi
  # Also update branch
  CUR_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
  OLD_BRANCH=$(session_get "$SID" branch)
  if [ "$CUR_BRANCH" != "$OLD_BRANCH" ]; then
    TMP="$SF.tmp"
    sed 's/"branch":"[^"]*"/"branch":"'"$(escape_json "$CUR_BRANCH")"'"/' \
      "$SF" > "$TMP" 2>/dev/null && mv "$TMP" "$SF"
    rm -f "$TMP"
  fi
}
