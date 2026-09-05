#!/usr/bin/env bash
# Every place that states the release version must agree — layer 1 of the
# versionBump gate. Runs in release.yml before `npm publish`, and locally from
# /reapdev.versionBump after the bump commit and before the tag.
#
#   package.json version          — what npm publishes
#   plugin/.claude-plugin/plugin.json version — what the marketplace installs
#   RELEASE_NOTES.md first `## v` — what release.yml publishes as the release body
#   site/src/i18n/translations/*.ts releaseNotes.version — what the docs say
#   package.json reap.autoUpdateMinVersion ≤ version — the 0.17 safety floor
#
# Exits non-zero on the first disagreement, listing every one it found.
set -u
cd "$(dirname "$0")/.."
fail=0
say_fail() { echo "FAIL: $*"; fail=1; }

pkg=$(node -p 'require("./package.json").version')
plugin=$(node -p 'require("./plugin/.claude-plugin/plugin.json").version')
floor=$(node -p '(require("./package.json").reap||{}).autoUpdateMinVersion||""')
notes=$(grep -m1 -E '^## v[0-9]' RELEASE_NOTES.md | sed -E 's/^## v([0-9][^ ]*).*/\1/')

echo "package.json: $pkg"
[ "$plugin" = "$pkg" ] || say_fail "plugin.json version is $plugin (package.json $pkg)"
[ "$notes" = "$pkg" ] || say_fail "RELEASE_NOTES.md first heading is v${notes:-?} (package.json $pkg) — release.yml publishes that block as the release body"

for f in site/src/i18n/translations/*.ts; do
  [ -f "$f" ] || continue
  v=$(awk '/^  releaseNotes: \{/{f=1} f && /^    version: "/{gsub(/.*version: "|".*/,""); print; exit}' "$f")
  [ "$v" = "$pkg" ] || say_fail "$f releaseNotes.version is ${v:-missing} (package.json $pkg)"
done

if [ -n "$floor" ]; then
  # sort -V puts the lower version first; floor must not come after pkg
  first=$(printf '%s\n%s\n' "$floor" "$pkg" | sort -V | head -1)
  [ "$first" = "$floor" ] || say_fail "reap.autoUpdateMinVersion $floor is above $pkg — a release below its own floor blocks itself"
fi

if git rev-parse -q --verify "refs/tags/v$pkg" >/dev/null 2>&1; then
  echo "note: tag v$pkg already exists — this is a re-check, not a new bump"
fi

[ $fail -eq 0 ] && echo "ok: every version says $pkg"
exit $fail
