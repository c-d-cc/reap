#!/usr/bin/env bash
# List the places that know each shared fact, by reading the markers in them.
#
# Why markers instead of a list (gen-078): a list has to be maintained by the
# person who remembers it exists, and issues #21 and #22 both happened because
# a place nobody listed went stale. The genome carried such a list — three
# entries, then four — and #22 still slipped through, because every entry was a
# document and #22 was code-versus-code.
#
# So the file declares itself:
#
#     // reap:carrier(claude-code-commands-path)
#
# and finding every place that knows a fact is a grep, not a memory exercise.
# New kinds of carrier need no change here.
#
#   bash scripts/list-carriers.sh             # every ID and where it lives
#   bash scripts/list-carriers.sh --orphans   # IDs recorded in one file only
#
# An orphan is worth a look: either the marker is unnecessary, or the other
# places that know the fact were never marked — which is the state #21 and #22
# were in.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ORPHANS_ONLY=0
[ "${1:-}" = "--orphans" ] && ORPHANS_ONLY=1

bold()  { printf '\033[1m%s\033[0m\n' "$1"; }
dim()   { printf '\033[2m%s\033[0m\n' "$1"; }
amber() { printf '\033[33m%s\033[0m\n' "$1"; }

# Everything except build output, dependencies and REAP's own archives. Lineage
# copies of past artifacts would otherwise show up as extra carriers.
MATCHES=$(grep -rn --binary-files=without-match \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=.git \
  --exclude-dir=lineage \
  --exclude-dir=life \
  --exclude=list-carriers.sh \
  -o 'reap:carrier([a-z0-9-]*)' . 2>/dev/null \
  | sed 's/reap:carrier(\(.*\))/\1/' \
  | sed 's|^\./||')

if [ -z "$MATCHES" ]; then
  dim "No carrier markers found."
  exit 0
fi

IDS=$(echo "$MATCHES" | awk -F: '{print $NF}' | sort -u)
ORPHAN_COUNT=0

for id in $IDS; do
  # A file may carry the same marker more than once; count files, not lines.
  FILES=$(echo "$MATCHES" | awk -F: -v id="$id" '$NF == id {print $1}' | sort -u)
  COUNT=$(echo "$FILES" | wc -l | tr -d ' ')

  if [ "$COUNT" -eq 1 ]; then
    ORPHAN_COUNT=$((ORPHAN_COUNT + 1))
    amber "$id  (1 file — orphan)"
    echo "$FILES" | while IFS= read -r f; do dim "    $f"; done
    dim "    Either this marker is unnecessary, or the other places that know"
    dim "    this fact have not been marked yet."
    echo
  elif [ "$ORPHANS_ONLY" -eq 0 ]; then
    bold "$id  ($COUNT files)"
    echo "$FILES" | while IFS= read -r f; do dim "    $f"; done
    echo
  fi
done

if [ "$ORPHANS_ONLY" -eq 1 ] && [ "$ORPHAN_COUNT" -eq 0 ]; then
  dim "No orphaned carrier markers."
fi
