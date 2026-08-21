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
#     // reap:carrier(claude-code-commands-path-<hash8>)
#
# An id is a slug and eight hex characters. The slug is first because the only
# thing a marker does is get read beside the value it guards; a hash in front
# would put the name where nobody looks. The hash is drawn at random when the
# marker is created, never derived from the slug — an id derived from a name
# changes when the name does, which is the thing ids exist to prevent (gen-098
# settled the same question for goal and backlog ids).
#
# Without the hash a collision is undetectable: two different facts given the
# same slug make `grep` return unrelated files, and nothing can tell that they
# are two facts. With it, `--check` says so.
#
#   bash scripts/list-carriers.sh             # every id and where it lives
#   bash scripts/list-carriers.sh --orphans   # ids recorded in one file only
#   bash scripts/list-carriers.sh --check     # problems only; exit 1 if any
#   bash scripts/list-carriers.sh --new <slug>  # a marker with a fresh, unused hash
#   bash scripts/list-carriers.sh --root <dir> --check   # scan somewhere else
#
# `--check` reports four things, each of which hides a marker in its own way: an
# id that is not `<slug>-<hash8>`; an opened marker with no closing bracket,
# which no id can be read from at all; one slug wearing two hashes; and one hash
# worn by two slugs.
#
# An orphan is worth a look: either the marker is unnecessary, or the other
# places that know the fact were never marked — which is the state #21 and #22
# were in. It is a note rather than a failure, so it does not affect the exit
# code. A one-character slip in a hash produces an orphan too and is invisible
# to the eye, so the report names any id sharing either half — and if the slip
# left two hashes on one slug, `--check` reports that outright.
#
# A mention is not a marker. Prose that explains the convention writes
# `reap:carrier(<slug>-<hash8>)` with the angle brackets, and anything holding
# `<`, `>` or whitespace is ignored entirely rather than counted as a carrier
# or reported as malformed. That is the whole rule — an ignore list of
# placeholder spellings would grow, and "skip markers inside code fences" is
# simply wrong here: the five locale files carry real markers inside TypeScript
# strings, one line above the value they guard.

set -uo pipefail

# Byte ordering, not the user's. Under a UTF-8 locale bash's `case` ranges
# collate, so `[a-z]` matches `A` and `[0-9a-f]` matches `0A1B2C3D` — an
# uppercase hash was classified well-formed until a test asked. It also keeps
# `sort` deterministic across machines.
export LC_ALL=C

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE=list
NEW_SLUG=""

while [ $# -gt 0 ]; do
  case "$1" in
    --orphans) MODE=orphans ;;
    --check)   MODE=check ;;
    --new)     MODE=new; NEW_SLUG="${2:-}"; shift ;;
    --root)    ROOT="${2:-}"; shift ;;
    # The header block, however long it is. A line range would have to be
    # re-counted every time the header changes, and the first edit after this
    # one printed `set -uo pipefail` as documentation.
    -h|--help) awk 'NR>1 && /^#/ {sub(/^# ?/,""); print; next} NR>1 {exit}' "${BASH_SOURCE[0]}"; exit 0 ;;
    *) printf 'unknown argument: %s\n' "$1" >&2; exit 2 ;;
  esac
  shift
done

if [ ! -d "$ROOT" ]; then
  printf 'no such directory: %s\n' "$ROOT" >&2
  exit 2
fi
cd "$ROOT"

bold()  { printf '\033[1m%s\033[0m\n' "$1"; }
dim()   { printf '\033[2m%s\033[0m\n' "$1"; }
amber() { printf '\033[33m%s\033[0m\n' "$1"; }
red()   { printf '\033[31m%s\033[0m\n' "$1"; }

# ── Scan ─────────────────────────────────────────────────────
#
# Everything except build output, dependencies and REAP's own archives. Lineage
# copies of past artifacts would otherwise show up as extra carriers.
#
# `list-carriers.*` is this script and its test. Both hold marker text as data
# rather than as a declaration — the script to document the convention, the test
# to feed it deliberately broken ids. One glob rather than two entries, because
# the reason is one reason: this is the tooling, and its markers are its input.
#
# The pattern is deliberately permissive — `[^)]*` rather than the id charclass
# — because a marker written without a hash has to be *seen* to be reported. A
# pattern that matched only well-formed ids would let the one failure this
# check exists to catch pass as silence.
EXCLUDES=(
  --exclude-dir=node_modules
  --exclude-dir=dist
  --exclude-dir=.git
  --exclude-dir=lineage
  --exclude-dir=life
  --exclude='list-carriers.*'
)

# Every *opened* marker, closed or not. `scan` needs a closing bracket to
# capture an id, so `reap:carrier(some-fact` — a dropped bracket — matches
# nothing and the marker vanishes silently. Comparing the two sets turns that
# back into a report; it is the failure the permissive id pattern guards
# against, one level further out.
#
# The open bracket is part of the pattern on purpose. Prose refers to the
# convention by its bare name ("each place carries a `reap:carrier` marker"),
# and that is not a marker missing its bracket — the first version of this
# check flagged exactly one such sentence and nothing else.
scan_words() {
  grep -rno --binary-files=without-match "${EXCLUDES[@]}" \
    'reap:carrier(' . 2>/dev/null | sed 's|^\./||'
}

scan() {
  grep -rn --binary-files=without-match "${EXCLUDES[@]}" \
    -o 'reap:carrier([^)]*)' . 2>/dev/null \
    | sed 's|^\./||' \
    | sed 's/^\(.*\):\([0-9][0-9]*\):reap:carrier(\(.*\))$/\1'$'\t''\2'$'\t''\3/'
}

# "valid" | "malformed" | "mention"
classify() {
  local id="$1" slug hash
  case "$id" in
    *'<'*|*'>'*|*' '*|*"$(printf '\t')"*|'') printf mention; return ;;
  esac
  case "$id" in
    *[!a-z0-9-]*) printf malformed; return ;;
    *-*) ;;
    *) printf malformed; return ;;
  esac
  hash="${id##*-}"
  slug="${id%-*}"
  case "$slug" in
    ''|-*|*-) printf malformed; return ;;
  esac
  case "$hash" in
    [0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]) printf valid ;;
    *) printf malformed ;;
  esac
}

TMPDIR_="$(mktemp -d)"
trap 'rm -rf "$TMPDIR_"' EXIT
SCAN="$TMPDIR_/scan"
VALID="$TMPDIR_/valid"
BAD="$TMPDIR_/bad"
: > "$VALID"; : > "$BAD"

scan > "$SCAN"
scan_words > "$TMPDIR_/words"

# Per line, how many markers were opened against how many ids were read. Counts
# rather than set membership: a line carrying one closed marker and one unclosed
# one appears in both sets, and comparing sets would call it accounted for.
UNTERMINATED=$(awk '
  NR == FNR { opened[$0]++; next }
  { read[$0]++ }
  END { for (k in opened) if (opened[k] > read[k]) print k }
' <(cut -d: -f1,2 < "$TMPDIR_/words") \
  <(awk -F'\t' '{print $1 ":" $2}' "$SCAN") | sort)

while IFS=$'\t' read -r file line id; do
  [ -n "${file:-}" ] || continue
  case "$(classify "$id")" in
    valid)     printf '%s\t%s\t%s\n' "$file" "$line" "$id" >> "$VALID" ;;
    malformed) printf '%s\t%s\t%s\n' "$file" "$line" "$id" >> "$BAD" ;;
    mention)   ;;
  esac
done < "$SCAN"

IDS=$(cut -f3 "$VALID" | sort -u)
ID_COUNT=$(printf '%s' "$IDS" | grep -c . || true)

# ── --new ────────────────────────────────────────────────────

if [ "$MODE" = new ]; then
  case "$NEW_SLUG" in
    '') printf -- '--new needs a slug\n' >&2; exit 2 ;;
    *[!a-z0-9-]*|-*|*-) printf 'a slug is lowercase letters, digits and dashes: %s\n' "$NEW_SLUG" >&2; exit 2 ;;
  esac
  EXISTING_SLUG=$(printf '%s\n' "$IDS" | sed 's/-[0-9a-f]\{8\}$//' | grep -x "$NEW_SLUG" || true)
  if [ -n "$EXISTING_SLUG" ]; then
    printf 'slug already taken: %s\n' "$(printf '%s\n' "$IDS" | grep "^$NEW_SLUG-")" >&2
    printf 'two facts must not share a slug — that is the collision the hash cannot fix.\n' >&2
    exit 1
  fi
  # Random, never derived from the slug. Retried against the hashes already in
  # the tree so `--new` cannot hand out one that is taken.
  HASHES=$(printf '%s\n' "$IDS" | sed 's/^.*-\([0-9a-f]\{8\}\)$/\1/')
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    H=$(LC_ALL=C tr -dc '0-9a-f' < /dev/urandom | head -c 8)
    if ! printf '%s\n' "$HASHES" | grep -qx "$H"; then
      printf 'reap:carrier(%s-%s)\n' "$NEW_SLUG" "$H"
      exit 0
    fi
  done
  printf 'could not draw an unused hash\n' >&2
  exit 1
fi

# ── Problems: malformed ids, and one hash on two slugs ───────

PROBLEMS=0

report_malformed() {
  local n
  n=$(cut -f3 "$BAD" | sort -u | wc -l | tr -d ' ')
  [ -s "$BAD" ] || return 0
  PROBLEMS=$((PROBLEMS + 1))
  red "Malformed carrier ids ($n) — expected <slug>-<hash8>:"
  cut -f3 "$BAD" | sort -u | while IFS= read -r id; do
    amber "    $id"
    awk -F'\t' -v id="$id" '$3 == id {print "        " $1 ":" $2}' "$BAD"
  done
  dim "    Draw one with: bash scripts/list-carriers.sh --new <slug>"
  echo
}

report_unterminated() {
  [ -n "$UNTERMINATED" ] || return 0
  PROBLEMS=$((PROBLEMS + 1))
  red "Unterminated carrier markers — no closing bracket, so no id was read:"
  printf '%s\n' "$UNTERMINATED" | while IFS= read -r loc; do dim "    $loc"; done
  echo
}

# Two hashes on one slug. `--new` already refuses to hand out a slug that is
# taken, so a tree holding one anyway came from a hand-edit or a typo, and the
# hint below names the sibling. Reported rather than merely hinted because a
# hint only appears when one of the two is an orphan — a slug split across two
# well-populated ids would otherwise pass in silence.
report_slug_splits() {
  local dup
  dup=$(printf '%s\n' "$IDS" | sed 's/-[0-9a-f]\{8\}$//' | sort | uniq -d)
  [ -n "$dup" ] || return 0
  PROBLEMS=$((PROBLEMS + 1))
  printf '%s\n' "$dup" | while IFS= read -r slug; do
    red "One slug, more than one hash: $slug"
    printf '%s\n' "$IDS" | grep "^$slug-" | while IFS= read -r id; do dim "    $id"; done
    dim "    A hash typo looks exactly like this. Two facts must not share a slug."
    echo
  done
}

report_collisions() {
  local dup
  # Two different slugs on the same hash. This is the failure the hash exists
  # to make visible, so it is an error rather than a note.
  dup=$(printf '%s\n' "$IDS" | sed 's/^\(.*\)-\([0-9a-f]\{8\}\)$/\2\t\1/' \
        | sort -u | cut -f1 | uniq -d)
  [ -n "$dup" ] || return 0
  PROBLEMS=$((PROBLEMS + 1))
  printf '%s\n' "$dup" | while IFS= read -r h; do
    red "Hash collision: $h is used by more than one slug"
    printf '%s\n' "$IDS" | grep -- "-$h\$" | while IFS= read -r id; do dim "    $id"; done
    echo
  done
}

# A one-character slip in a hash leaves the slug whole, and a slip in the slug
# leaves the hash whole — so the sibling is found by matching either half. That
# is exact, unlike an edit-distance guess, and it is the only way this kind of
# typo is diagnosable at all: the eye cannot see it.
hint_for() {
  local id="$1" slug hash sib
  slug="${id%-*}"; hash="${id##*-}"
  sib=$(printf '%s\n' "$IDS" | grep -v -x "$id" \
        | grep -e "^$slug-" -e "-$hash\$" || true)
  [ -n "$sib" ] || return 0
  printf '%s\n' "$sib" | while IFS= read -r s; do
    amber "    Did you mean $s ? (it shares this id's slug or its hash)"
  done
}

if [ "$MODE" = check ]; then
  report_malformed
  report_unterminated
  report_slug_splits
  report_collisions
  if [ "$PROBLEMS" -eq 0 ]; then
    # Say what was measured. "No output" and "the scan found nothing to scan"
    # look the same, and a check whose pass is silence is a check nobody can
    # tell has stopped working.
    # Markers, not matches: prose explaining the convention is not counted,
    # which is the same claim the ignore rule makes. Counting it here would
    # report a repository of documentation as full of carriers.
    dim "$(cat "$VALID" "$BAD" | wc -l | tr -d ' ') marker(s), $ID_COUNT id(s) — well-formed, closed, one hash each, no hash shared."
    exit 0
  fi
  exit 1
fi

if [ -z "$IDS" ] && [ ! -s "$BAD" ]; then
  dim "No carrier markers found."
  exit 0
fi

ORPHAN_COUNT=0

for id in $IDS; do
  # A file may carry the same marker more than once; count files, not lines.
  FILES=$(awk -F'\t' -v id="$id" '$3 == id {print $1}' "$VALID" | sort -u)
  COUNT=$(printf '%s\n' "$FILES" | grep -c . || true)

  if [ "$COUNT" -eq 1 ]; then
    ORPHAN_COUNT=$((ORPHAN_COUNT + 1))
    amber "$id  (1 file — orphan)"
    printf '%s\n' "$FILES" | while IFS= read -r f; do dim "    $f"; done
    hint_for "$id"
    dim "    Either this marker is unnecessary, or the other places that know"
    dim "    this fact have not been marked yet."
    echo
  elif [ "$MODE" != orphans ]; then
    bold "$id  ($COUNT files)"
    printf '%s\n' "$FILES" | while IFS= read -r f; do dim "    $f"; done
    echo
  fi
done

report_malformed
report_unterminated
report_slug_splits
report_collisions

if [ "$MODE" = orphans ] && [ "$ORPHAN_COUNT" -eq 0 ] && [ "$PROBLEMS" -eq 0 ]; then
  dim "No orphaned carrier markers. ($ID_COUNT id(s) scanned.)"
fi

[ "$PROBLEMS" -eq 0 ] || exit 1
exit 0
