#!/usr/bin/env bash
# Verify that every version-carrying document matches package.json before a release.
#
# Why this exists (gen-073): v0.17.1 shipped without any docs update. Nothing in
# the release pipeline noticed, because nothing checked. Worse, the locale files
# had already drifted apart — en/ko carried 0.16.5 while ja/de/zh-CN did not —
# so a check that only compares "latest version" would still have missed it.
#
# Run before tagging a release. Wired into .github/workflows/release.yml ahead of
# `npm publish`.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

LOCALES=(en ko ja de zh-CN)
FAILURES=0

red()   { printf '\033[31m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }
dim()   { printf '\033[2m%s\033[0m\n' "$1"; }

fail() {
  red "  FAIL  $1"
  [ $# -gt 1 ] && dim "        $2"
  FAILURES=$((FAILURES + 1))
}
pass() { green "  ok    $1"; }
note() { dim   "  note  $1"; }

# Sorted list of every version in a locale's releaseNotes array.
locale_versions() {
  sed -n '/releaseNotes: {/,/^  },/p' "docs/src/i18n/translations/$1.ts" \
    | grep -o 'version: "[^"]*"' \
    | sed 's/version: "//; s/"//' \
    | sort -V
}

# Newest version in a locale's releaseNotes array (first entry, not sorted —
# the array is authored newest-first and the site renders it in that order).
locale_latest() {
  sed -n '/releaseNotes: {/,/^  },/p' "docs/src/i18n/translations/$1.ts" \
    | grep -o 'version: "[^"]*"' \
    | head -1 \
    | sed 's/version: "//; s/"//'
}

PKG_VERSION=$(node -p "require('./package.json').version")
echo "Checking documents against package.json v$PKG_VERSION"
echo

# ── 1. RELEASE_NOTICE.md — shown in the terminal on upgrade (src/core/notice.ts)
echo "RELEASE_NOTICE.md (CLI upgrade notice)"
NOTICE_LATEST=$(grep -m1 '^## v' RELEASE_NOTICE.md | sed 's/^## v//')
if [ "$NOTICE_LATEST" = "$PKG_VERSION" ]; then
  pass "latest entry is v$PKG_VERSION"
else
  fail "latest entry is v$NOTICE_LATEST, expected v$PKG_VERSION" \
       "Add a '## v$PKG_VERSION' section with en/ko notes at the top."
fi
echo

# ── 2. RELEASE_NOTES.md — body of the GitHub release (.github/workflows/release.yml)
#
# This file has no version number in its '## What's New' section, so the current
# release cannot be matched directly. Instead check that the PREVIOUS release was
# promoted out of What's New into the archive: if the top archived heading still
# equals the previous version, promotion happened; if it equals the current one,
# What's New was never refreshed and the GitHub release would publish stale text.
echo "RELEASE_NOTES.md (GitHub release body)"
NOTES_TOP_ARCHIVE=$(grep -m1 '^## v' RELEASE_NOTES.md | sed 's/^## v//')
if [ "$NOTES_TOP_ARCHIVE" = "$PKG_VERSION" ]; then
  fail "v$PKG_VERSION is already archived — What's New was not refreshed" \
       "What's New must hold the v$PKG_VERSION notes; archive the previous release below it."
elif [ -z "$NOTES_TOP_ARCHIVE" ]; then
  fail "no archived '## vX.Y.Z' section found" \
       "Expected the previous release to be archived under What's New."
else
  # Confirm What's New is non-empty (the section between the title and the first ---)
  WHATS_NEW_LINES=$(sed -n '/^## What.s New/,/^---/p' RELEASE_NOTES.md | grep -c '^- ')
  if [ "$WHATS_NEW_LINES" -eq 0 ] && grep -q '^<!-- no-user-facing-change -->$' RELEASE_NOTES.md; then
    pass "What's New declares no user-facing change; previous release v$NOTES_TOP_ARCHIVE archived"
  elif [ "$WHATS_NEW_LINES" -eq 0 ]; then
    fail "What's New has no entries" "The GitHub release body would be empty. If this release changes nothing a user would act on, write <!-- no-user-facing-change --> there instead."
  else
    pass "What's New has $WHATS_NEW_LINES entries; previous release v$NOTES_TOP_ARCHIVE archived"
  fi
fi
echo

# ── 3. docs changelog — latest entry per locale
#
# A release with nothing a user would act on does not need a changelog entry —
# but "deliberately omitted" and "forgotten" look identical from here, and
# forgotten is what happened before gen-073 wrote this check. So the omission
# has to be declared, in the one file a release cannot skip:
#
#     ## What's New
#
#     <!-- no-user-facing-change -->
#
# Present → the locale entries may stop at the previous version. Absent → every
# locale must carry an entry for this version, exactly as before.
#
# Omission has to be in ALL five locales: § 4 compares the version sets and
# catches a partial one. That is deliberate — a changelog that lists a version
# in two languages and not the other three is the gen-073 defect, declared or not.
echo "docs changelog — latest entry (reap.cc)"
if grep -q '^<!-- no-user-facing-change -->$' RELEASE_NOTES.md; then
  note "v$PKG_VERSION declares no user-facing change"
  note "locale entries may stop at the previous version"
  for L in "${LOCALES[@]}"; do
    LATEST=$(locale_latest "$L")
    if [ "$LATEST" = "$PKG_VERSION" ]; then
      pass "$L.ts → $LATEST (an entry was written anyway)"
    elif printf '%s\n%s\n' "$LATEST" "$PKG_VERSION" | sort -V -C; then
      pass "$L.ts → $LATEST (no entry for $PKG_VERSION, as declared)"
    else
      fail "$L.ts → $LATEST, which is ahead of $PKG_VERSION" \
           "A changelog entry names a version that has not been released."
    fi
  done
else
  for L in "${LOCALES[@]}"; do
    LATEST=$(locale_latest "$L")
    if [ "$LATEST" = "$PKG_VERSION" ]; then
      pass "$L.ts → $LATEST"
    else
      fail "$L.ts → $LATEST, expected $PKG_VERSION" \
           "Add a { version: \"$PKG_VERSION\", notes: \"...\" } entry at the top of releaseNotes.versions, or declare <!-- no-user-facing-change --> in RELEASE_NOTES.md."
    fi
  done
fi
echo

# ── 4. docs changelog — locale sets must be identical
#
# The drift this catches is real: before gen-073, en/ko listed 0.16.5 and
# ja/de/zh-CN did not. Comparing only the latest version would pass that.
echo "docs changelog — locale parity"
REFERENCE=$(locale_versions en)
REF_COUNT=$(echo "$REFERENCE" | wc -l | tr -d ' ')
for L in "${LOCALES[@]}"; do
  [ "$L" = "en" ] && continue
  CURRENT=$(locale_versions "$L")
  if [ "$CURRENT" = "$REFERENCE" ]; then
    pass "$L.ts matches en.ts ($REF_COUNT entries)"
  else
    MISSING=$(comm -23 <(echo "$REFERENCE") <(echo "$CURRENT") | tr '\n' ' ')
    EXTRA=$(comm -13 <(echo "$REFERENCE") <(echo "$CURRENT") | tr '\n' ' ')
    DETAIL=""
    [ -n "${MISSING// }" ] && DETAIL="missing: $MISSING"
    [ -n "${EXTRA// }" ] && DETAIL="$DETAIL extra: $EXTRA"
    fail "$L.ts differs from en.ts" "$DETAIL"
  fi
done
echo

# ── 5. migration notes must not outrun the package version
#
# detectPendingMigrations selects notes in (lastMigratedVersion, packageVersion].
# A note numbered above the package version can never fall in that window, so it
# would sit in the tree permanently invisible.
echo "migration notes (src/templates/migration/)"
NEWEST_NOTE=$(ls src/templates/migration/ 2>/dev/null \
  | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+\.md$' \
  | sed 's/^v//; s/\.md$//' \
  | sort -V | tail -1)
if [ -z "$NEWEST_NOTE" ]; then
  pass "no migration notes"
elif [ "$(printf '%s\n%s\n' "$NEWEST_NOTE" "$PKG_VERSION" | sort -V | tail -1)" = "$PKG_VERSION" ]; then
  pass "newest note v$NEWEST_NOTE <= v$PKG_VERSION"
else
  fail "newest note v$NEWEST_NOTE is above package v$PKG_VERSION" \
       "It falls outside detectPendingMigrations' range and would never surface."
fi
echo

# ── result
if [ "$FAILURES" -eq 0 ]; then
  green "All document checks passed for v$PKG_VERSION."
  exit 0
fi
red "$FAILURES check(s) failed — resolve before releasing v$PKG_VERSION."
exit 1
