#!/usr/bin/env bash
# Does the site build actually produce a page per route per locale — layer 1.
#
# Ported from v0.17's `docs/` app (gen-096) to `site/`, ko-only, twelve routes
# (ms-022). Two layers, as elsewhere in this repository:
#
#   layer 1 (here)                 do the files land, with the right contents?
#                                  free, offline, runs on every site change
#   layer 2 (check-docs-live.sh)   does the deployed site serve them?
#                                  needs a deploy; cannot be inferred from this
#
# Wired into .github/workflows/docs.yml, which is the workflow that already
# installs site/node_modules and builds — and the only one that runs when the
# site changes. Not in ci.yml, which would pay for a site build on every push
# to src/.
#
# What it does NOT check:
#   - anything about the deployed site: status codes, redirects, whether GitHub
#     Pages actually serves them. Layer 2 answers that.
#   - that the markup hydrates. A page can be well-formed here and still throw
#     in a browser; nothing in this repository runs a browser. The one hydration
#     property that IS enforced — a page rendering identically at both spellings
#     of its URL, since GitHub Pages 301s `/docs/x` to `/docs/x/` — is checked in
#     the build by assertSlashInvariant in site/src/entry-server.tsx. It cannot
#     be checked here: both spellings are served the same file, so the difference
#     exists only once a browser renders it.
#   - whether the descriptions are any GOOD, only that each is non-empty.
#   - anything about the domain. `ORIGIN` comes from the same CNAME the build
#     read, so a wrong domain agrees with itself here — see the header of the
#     .mjs. Layer 2 is what asks that domain for the pages.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DIST="site/dist/public"

red()   { printf '\033[31m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }
amber() { printf '\033[33m%s\033[0m\n' "$1"; }
dim()   { printf '\033[2m%s\033[0m\n' "$1"; }

FAILURES=0
fail() { red "  FAIL  $1"; [ $# -gt 1 ] && dim "        $2"; FAILURES=$((FAILURES + 1)); }
pass() { green "  ok    $1"; }

# How many routes the manifest declares. Read from the source rather than
# written down here: a number in two places is a number that will disagree.
ROUTE_COUNT=$(grep -c '^    path: "' site/src/routes.ts)
# The locale set has one owner, `site/src/i18n/types.ts`, and both this script
# and check-docs-prerender.mjs read it from there.
LOCALE_COUNT=$(grep -o 'export const LOCALES: Locale\[\] = \[[^]]*\]' site/src/i18n/types.ts | grep -o '"[^"]*"' | wc -l | tr -d ' ')
EXPECTED=$((ROUTE_COUNT * LOCALE_COUNT))

echo "Checking prerendered site output in $DIST"
dim "  ${ROUTE_COUNT} route(s) x ${LOCALE_COUNT} locale(s) = ${EXPECTED} page(s) expected"
echo

# ---------------------------------------------------------------------------
# 1. The build ran at all.
# ---------------------------------------------------------------------------
if [ ! -d "$DIST" ]; then
  fail "$DIST does not exist" "run: bun run site:build"
  red "FAILED ($FAILURES)"
  exit 1
fi

if [ "$ROUTE_COUNT" -lt 10 ] || [ "$LOCALE_COUNT" -lt 1 ]; then
  fail "parsed $ROUTE_COUNT route(s) and $LOCALE_COUNT locale(s) from site/src" \
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
# 3. The default locale keeps its prefix-free URLs.
# ---------------------------------------------------------------------------
if [ -f "$DIST/index.html" ] && [ -f "$DIST/docs/quick-start/index.html" ]; then
  pass "the default locale is at / and /docs/* with no locale prefix"
else
  fail "default-locale pages are not where expected" \
       "expected $DIST/index.html and $DIST/docs/quick-start/index.html"
fi

# ---------------------------------------------------------------------------
# 3b. Every URL any README publishes now has a file behind it.
#
# Informational until a README links reap.cc/docs/*: this is a brand-new
# site, not yet linked from README.md/README.ko.md, so an empty result here
# is expected rather than a defect.
# ---------------------------------------------------------------------------
readme_paths=$(grep -oh 'reap\.cc/docs/[a-z-]*' README*.md 2>/dev/null | sed 's|reap\.cc||' | sort -u)
readme_count=$(printf '%s\n' "$readme_paths" | grep -c .)
if [ "$readme_count" -eq 0 ]; then
  dim "  no reap.cc/docs link in README*.md yet — nothing to check"
else
  readme_missing=0
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
# 4. What is inside each page — delegated to check-docs-prerender.mjs.
# ---------------------------------------------------------------------------
PER_PAGE="scripts/check-docs-prerender.mjs"
if ! command -v node >/dev/null 2>&1; then
  fail "node not found" "the per-page checks did not run; this is not a pass"
elif [ ! -f "$PER_PAGE" ]; then
  fail "$PER_PAGE is missing" "the per-page checks did not run; this is not a pass"
elif ! node "$PER_PAGE" "$ROOT"; then
  FAILURES=$((FAILURES + 1))
fi

# ---------------------------------------------------------------------------
# 5. robots.txt.
# ---------------------------------------------------------------------------
if [ -f "$DIST/robots.txt" ] && grep -q '^Sitemap: ' "$DIST/robots.txt"; then
  pass "robots.txt names the sitemap"
else
  fail "$DIST/robots.txt missing or does not name the sitemap"
fi

echo
if [ "$FAILURES" -eq 0 ]; then
  green "PASSED — the build produces $EXPECTED distinct pages"
  dim   "        This says nothing about the deployed site."
  exit 0
fi
red "FAILED ($FAILURES)"
exit 1
