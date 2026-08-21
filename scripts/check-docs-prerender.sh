#!/usr/bin/env bash
# Does the docs build actually produce a page per route per locale — layer 1.
#
# Why this exists (gen-096): the docs site is a client-routed SPA, so for its
# whole life the server had one file to give — a 939-byte shell, identical for
# every one of the 23 routes, titled `REAP`. In a browser it looked perfect: the
# shell booted, wouter routed, and a person saw a complete page. Nothing in the
# repository asked what the server had actually sent, so nothing noticed, and
# `reap.cc/docs/*` stayed out of every search index while the five READMEs
# linked to it from inside the published npm tarball.
#
# The lesson is not "prerender" — it is that a build can be green and produce
# nothing. This check reads the files on disk and asks what is in them.
#
# Two layers, as elsewhere in this repository:
#
#   layer 1 (here)                 do the files land, with the right contents?
#                                  free, offline, runs on every docs change
#   layer 2 (check-docs-live.sh)   does the deployed site serve them?
#                                  needs a deploy; cannot be inferred from this
#
# Wired into .github/workflows/docs.yml, which is the workflow that already
# installs docs/node_modules and builds — and the only one that runs when docs
# change. Not in ci.yml, which would pay for a docs build on every push to src/.
#
# What it does NOT check:
#   - anything about the deployed site: status codes, redirects, whether GitHub
#     Pages actually serves them. Layer 2 answers that.
#   - that the markup hydrates. A page can be well-formed here and still throw
#     in a browser; nothing in this repository runs a browser. The one hydration
#     property that IS enforced — a page rendering identically at both spellings
#     of its URL, since GitHub Pages 301s `/docs/x` to `/docs/x/` — is checked in
#     the build by assertSlashInvariant in docs/src/entry-server.tsx. It cannot
#     be checked here: both spellings are served the same file, so the difference
#     exists only once a browser renders it.
#   - whether the descriptions and translated text are any GOOD. Four routes
#     carried no description at all until gen-096 (quick-start, core-concepts,
#     release-notes, advanced); they have one in all five languages now, and
#     check-docs-prerender.mjs requires a non-empty one from every page. It
#     does NOT require them to be distinct, and they are not: /docs/hooks and
#     /docs/hook-reference deliberately share `t.hooks.intro`, so five snippets
#     appear on ten pages. Titles ARE required to be distinct within a locale.
#   - anything about the domain. `ORIGIN` comes from the same CNAME the build
#     read, so a wrong domain agrees with itself here — see the header of the
#     .mjs. Layer 2 is what asks that domain for the pages.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DIST="docs/dist/public"

red()   { printf '\033[31m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }
amber() { printf '\033[33m%s\033[0m\n' "$1"; }
dim()   { printf '\033[2m%s\033[0m\n' "$1"; }

FAILURES=0
fail() { red "  FAIL  $1"; [ $# -gt 1 ] && dim "        $2"; FAILURES=$((FAILURES + 1)); }
pass() { green "  ok    $1"; }

# How many routes the manifest declares. Read from the source rather than
# written down here: a number in two places is a number that will disagree, and
# this check exists because of a disagreement nobody could see.
ROUTE_COUNT=$(grep -c '^    path: "' docs/src/routes.ts)
# The locale set has one owner, `docs/src/i18n/types.ts`, and both this script
# and check-docs-prerender.mjs read it from there. A copy kept here would be a
# second thing to update when a sixth language is added — and it would fail
# open, since every count would simply expect less.
LOCALE_COUNT=$(grep -o 'export const LOCALES: Locale\[\] = \[[^]]*\]' docs/src/i18n/types.ts | grep -o '"[^"]*"' | wc -l | tr -d ' ')
EXPECTED=$((ROUTE_COUNT * LOCALE_COUNT))

echo "Checking prerendered docs output in $DIST"
dim "  ${ROUTE_COUNT} route(s) x ${LOCALE_COUNT} locale(s) = ${EXPECTED} page(s) expected"
echo

# ---------------------------------------------------------------------------
# 1. The build ran at all.
#
# Every assertion below is of the form "look in these files and find X", and an
# empty directory satisfies none of them by satisfying all of them vacuously.
# So the count comes first and everything else is conditional on it.
# ---------------------------------------------------------------------------
if [ ! -d "$DIST" ]; then
  fail "$DIST does not exist" "run: (cd docs && npm run build)"
  red "FAILED ($FAILURES)"
  exit 1
fi

if [ "$ROUTE_COUNT" -lt 15 ] || [ "$LOCALE_COUNT" -lt 2 ]; then
  fail "parsed $ROUTE_COUNT route(s) and $LOCALE_COUNT locale(s) from docs/src" \
       "a manifest failed to parse; every count below would be meaningless"
  red "FAILED ($FAILURES)"
  exit 1
fi

ACTUAL=$(find "$DIST" -name index.html | wc -l | tr -d ' ')
if [ "$ACTUAL" = "$EXPECTED" ]; then
  pass "$ACTUAL page(s) written"
else
  fail "expected $EXPECTED page(s), found $ACTUAL" \
       "a route or a locale is missing from the prerender"
fi

# ---------------------------------------------------------------------------
# 2. Every page carries real markup, not the shell.
#
# The shell is 939 bytes and the smallest real page is fifteen thousand, so the
# floor does not need to be delicate. It needs to be a floor rather than a
# non-emptiness check, which the shell would pass.
# ---------------------------------------------------------------------------
SHELL_BYTES=2000
TOO_SMALL=$(find "$DIST" -name index.html -size -${SHELL_BYTES}c)
if [ -z "$TOO_SMALL" ]; then
  pass "every page is larger than ${SHELL_BYTES} bytes (the shell was 939)"
else
  fail "$(echo "$TOO_SMALL" | wc -l | tr -d ' ') page(s) are shell-sized" "$(echo "$TOO_SMALL" | head -3 | tr '\n' ' ')"
fi

EMPTY_ROOT=$(grep -rl '<div id="root"></div>' "$DIST" --include=index.html 2>/dev/null)
if [ -z "$EMPTY_ROOT" ]; then
  pass "no page has an empty #root"
else
  fail "$(echo "$EMPTY_ROOT" | wc -l | tr -d ' ') page(s) have an empty #root" \
       "the markup substitution did not happen: $(echo "$EMPTY_ROOT" | head -2 | tr '\n' ' ')"
fi

# ---------------------------------------------------------------------------
# 3. English keeps its prefix-free URLs.
#
# This is the constraint that fixes the shape of everything else: README.md and
# its four translations link https://reap.cc/docs/* directly, and those files
# ship inside the npm tarball. An /en/ prefix would break links in copies that
# are already published and cannot be edited.
# ---------------------------------------------------------------------------
if [ -f "$DIST/index.html" ] && [ -f "$DIST/docs/quick-start/index.html" ]; then
  pass "English is at / and /docs/* with no locale prefix"
else
  fail "English pages are not where the READMEs point" \
       "expected $DIST/index.html and $DIST/docs/quick-start/index.html"
fi
if [ -e "$DIST/en" ]; then
  fail "$DIST/en exists" "English must not be prefixed — 80 published README links point at /docs/*"
else
  pass "no /en/ prefix was created"
fi

# ---------------------------------------------------------------------------
# 3b. Every URL the READMEs publish now has a file behind it.
#
# This is the reported damage, asserted directly rather than inferred from the
# page count. The backlog that opened this work listed, among the measured
# harms, that link checkers report every `reap.cc/docs/*` link in all five
# READMEs as broken. Counting 115 files does not establish that these 15 paths
# are among them — a renamed route would keep the count and break the links.
# ---------------------------------------------------------------------------
readme_missing=0
readme_paths=$(grep -oh 'reap\.cc/docs/[a-z-]*' README*.md 2>/dev/null | sed 's|reap\.cc||' | sort -u)
readme_count=$(printf '%s\n' "$readme_paths" | grep -c .)
if [ "$readme_count" -lt 5 ]; then
  fail "found only $readme_count reap.cc/docs link(s) in README*.md" \
       "the extraction failed; this check would otherwise pass on an empty set"
else
  while IFS= read -r path; do
    [ -z "$path" ] && continue
    [ -f "$DIST$path/index.html" ] || {
      readme_missing=$((readme_missing + 1))
      dim "        no file for $path"
    }
  done <<EOF
$readme_paths
EOF
  if [ "$readme_missing" -eq 0 ]; then
    pass "all $readme_count URLs linked from README*.md have a page"
  else
    fail "$readme_missing of $readme_count README link(s) have no page" \
         "these are live links in READMEs already published to npm"
  fi
fi

# ---------------------------------------------------------------------------
# 4. What is inside each page.
#
# Delegated to a node script because these are assertions about VALUES —
# each page's canonical URL, its five hreflang targets, the addresses its
# language selector offers — recomputed from the file's own position on disk.
# The first version of this gate did the equivalent in shell by counting, and
# an independent review passed three broken sites through it. The header of
# check-docs-prerender.mjs names all three.
#
# node is present wherever this runs: docs.yml sets it up to install and build.
# ---------------------------------------------------------------------------
PER_PAGE="scripts/check-docs-prerender.mjs"
if ! command -v node >/dev/null 2>&1; then
  fail "node not found" "the per-page checks did not run; this is not a pass"
elif [ ! -f "$PER_PAGE" ]; then
  fail "$PER_PAGE is missing" "the per-page checks did not run; this is not a pass"
elif ! node "$PER_PAGE" "$ROOT"; then
  # The script prints its own findings; count one failure so the verdict below
  # is red. Saying more here would restate what it has already said.
  FAILURES=$((FAILURES + 1))
fi

# ---------------------------------------------------------------------------
# 5. robots.txt.
#
# sitemap.xml is NOT counted here. It used to be — `grep -c '<loc>' == 115` —
# and a review then replaced every <loc> with the home page's URL: 115 entries,
# one distinct URL, green. The sitemap is the discovery mechanism this whole
# generation exists to add, so it is asserted by VALUE, next to the canonical
# links it shares a code path with, in check-docs-prerender.mjs.
# ---------------------------------------------------------------------------
if [ -f "$DIST/robots.txt" ] && grep -q '^Sitemap: ' "$DIST/robots.txt"; then
  pass "robots.txt names the sitemap"
else
  fail "$DIST/robots.txt missing or does not name the sitemap"
fi

echo
if [ "$FAILURES" -eq 0 ]; then
  green "PASSED — the build produces $EXPECTED distinct pages"
  dim   "        This says nothing about the deployed site. Run scripts/check-docs-live.sh after a deploy."
  exit 0
fi
red "FAILED ($FAILURES)"
exit 1
