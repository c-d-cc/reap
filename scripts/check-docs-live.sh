#!/usr/bin/env bash
# Does the deployed docs site serve a real page at every URL — layer 2.
#
# Why this exists (gen-096): nothing in this repository had ever sent an HTTP
# request to reap.cc. So when the 22 `/docs/*` routes began answering 404 and
# the root began answering 200 with a 939-byte shell — the same shell for all
# 23 — there was no way to notice and no way to say how long it had been true. The backlog that opened this work said it
# plainly: without a check that asks the deployed site, the same defect returns
# and is again invisible.
#
# WHEN THIS FIRST RUNS AGAINST THE REAL SITE
#
# Not in the generation that wrote it. gen-096 changed the build; the site is
# published by .github/workflows/docs.yml on a push to main that touches
# `docs/**`, and that push had not happened. The intended first run against
# reap.cc is with the v0.17.7 release push, once the docs deploy completes.
#
# WHAT WAS OBSERVED
#
# Both verdicts, before any deploy.
#
# FAIL, against the live site on 2026-08-21 — 18 failures:
#
#   $ curl -sI https://reap.cc/docs/quick-start   -> HTTP/2 404
#   $ curl -sI https://reap.cc/sitemap.xml        -> HTTP/2 404
#
# That number has been 9, then 14, then 18 for the same unchanged site. Each
# rise is a branch of this script that used to say nothing, or to say something
# green, being made to speak: 9 -> 14 when two silent branches got verdicts,
# 14 -> 18 when the `<html lang>` line stopped reporting "on every page" for
# four locales in which no page returned 200 at all.
#
# The paragraph that made this point was itself carrying 14 when the answer was
# already 18 — which is the point, made the hard way. If you change what this
# script asserts, re-run it and re-read this comment.
#
# PASS, against the build output served locally, in about two seconds:
#
#   $ cd docs/dist/public && python3 -m http.server 8099 --bind 127.0.0.1 &
#   $ bash scripts/check-docs-live.sh http://127.0.0.1:8099
#   PASSED — 115 page(s) served with page-specific titles
#
# That second run is why the origin is an argument. An earlier version of this
# file claimed the pass path "could not be" observed before a deploy and told
# the reader to treat every green line as unverified. That was wrong, and the
# reason it was wrong is worth keeping: python's http.server reproduces the two
# GitHub Pages behaviours this script depends on — serving `dir/index.html` for
# `/dir`, and answering `/dir` with a 301 to `/dir/`. The claim that a thing
# cannot be measured is itself a claim, and this one cost two seconds to check.
#
# What the local run does NOT establish: that GitHub Pages behaves like
# python's http.server in every respect, that DNS and TLS for reap.cc are
# healthy, or that the deploy workflow uploaded what was built. Those are what
# the run against the real origin is for.
#
# WHAT IT CANNOT TELL YOU
#
#   - whether the page hydrates, or whether anything works in a browser. It
#     reads bytes off the wire. The hydration invariant that matters here — a
#     page rendering the same at both spellings of its URL — is checked in the
#     build instead, by assertSlashInvariant in docs/src/entry-server.tsx.
#   - whether a search engine indexes any of it. That is a consequence of these
#     files existing, not the same thing as them existing.
#
# THE TRAILING SLASH, WHICH IS MEASURED AND STILL PRINTED
#
# Pages are written as `<route>/index.html`, and GitHub Pages answers `/dir`
# with a 301 to `/dir/`:
#
#   $ curl -so /dev/null -w '%{http_code} %{redirect_url}' https://pages.github.com/versions
#   301 https://pages.github.com/versions/
#
# So the address a visitor's browser settles on is not the one the prerenderer
# rendered. That is handled in the app (useNormalizedLocation in App.tsx) and
# enforced in the build, not here. This script follows redirects and prints the
# effective URL anyway, because the number of hops is a property of the host
# rather than of this repository, and a log entry is how the next person finds
# out it changed.
#
# Usage:  bash scripts/check-docs-live.sh [origin]
#         origin defaults to https://<contents of docs/public/CNAME>

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

red()   { printf '\033[31m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }
amber() { printf '\033[33m%s\033[0m\n' "$1"; }
dim()   { printf '\033[2m%s\033[0m\n' "$1"; }

FAILURES=0
fail() { red "  FAIL  $1"; [ $# -gt 1 ] && dim "        $2"; FAILURES=$((FAILURES + 1)); }
pass() { green "  ok    $1"; }

CNAME_FILE="docs/public/CNAME"
# Whether ORIGIN is the address this site is actually published at, or a local
# stand-in. It decides one assertion below: the sitemap is generated from the
# CNAME, so its URLs name reap.cc even when the pages are being fetched from
# http://127.0.0.1:8099, and requiring them to match a local origin would be a
# red about nothing.
ORIGIN_IS_DEPLOY=1
if [ -n "${1:-}" ]; then
  ORIGIN="${1%/}"
  ORIGIN_IS_DEPLOY=0
else
  if [ ! -s "$CNAME_FILE" ]; then
    amber "SKIP  $CNAME_FILE is missing or empty — no origin to check"
    exit 0
  fi
  ORIGIN="https://$(tr -d '[:space:]' < "$CNAME_FILE")"
fi

# The routes and the locales are read from the files that own them, not kept as
# a list here. A list kept here goes stale the first time a page or a language
# is added, and it goes stale in the direction that fails open: the check keeps
# passing while quietly no longer covering the new thing.
#
# The prefix rule below (English bare, everything else `/<locale>`) is the one
# thing restated rather than read. It is two lines, and a checker that imports
# its expectations from the subject is not checking anything.
ROUTES=$(grep -o '^    path: "[^"]*"' docs/src/routes.ts | sed 's/.*path: "//; s/"$//')
ROUTE_COUNT=$(printf '%s\n' "$ROUTES" | grep -c .)
LOCALES=()
while IFS= read -r l; do
  [ -n "$l" ] && LOCALES+=("$l")
done <<EOF
$(grep -o 'export const LOCALES: Locale\[\] = \[[^]]*\]' docs/src/i18n/types.ts \
    | grep -o '"[^"]*"' | tr -d '"')
EOF
EXPECTED=$((ROUTE_COUNT * ${#LOCALES[@]}))

if [ "$ROUTE_COUNT" -lt 15 ] || [ "${#LOCALES[@]}" -lt 2 ]; then
  fail "parsed $ROUTE_COUNT route(s) and ${#LOCALES[@]} locale(s) from docs/src" \
       "a manifest failed to parse; every count below would be meaningless"
  red "FAILED (1)"
  exit 1
fi

locale_prefix() {
  case "$1" in
    en) printf '' ;;
    *)  printf '/%s' "$1" ;;
  esac
}

echo "Checking the deployed docs site at $ORIGIN"
dim "  ${ROUTE_COUNT} route(s) x ${#LOCALES[@]} locale(s) = ${EXPECTED} page(s)"
echo

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

# ---------------------------------------------------------------------------
# Reachability, decided once and separately from correctness.
#
# "The site said 404" and "nothing answered" are different findings, and only
# the first is about this project. A release gate that reports an unreachable
# host as a REAP defect teaches people to scroll past it — which is how a red
# that is one day right gets ignored. So: no answer at all is an amber SKIP,
# and any HTTP response, including a bad one, is a measurement.
# ---------------------------------------------------------------------------
probe_body="$WORK/probe.html"
probe_meta=$(curl -sL --max-time 30 -o "$probe_body" \
  -w '%{http_code} %{url_effective} %{num_redirects}' "$ORIGIN/" 2>/dev/null)
curl_status=$?
if [ $curl_status -ne 0 ]; then
  amber "SKIP  could not reach $ORIGIN (curl exit $curl_status)"
  dim   "      This measured nothing. It is not a statement about the site."
  exit 0
fi
pass "$ORIGIN answered — $probe_meta"

# The trailing-slash question, answered by measurement rather than assumed.
slash_meta=$(curl -sL --max-time 30 -o /dev/null \
  -w '%{http_code} %{url_effective} redirects=%{num_redirects}' \
  "$ORIGIN/docs/quick-start" 2>/dev/null)
dim "  note  GET $ORIGIN/docs/quick-start -> $slash_meta"
dim "        (recorded, not asserted — see the header of this file)"
echo

# ---------------------------------------------------------------------------
# Every page, in every locale.
# ---------------------------------------------------------------------------
SHELL_BYTES=2000
for locale in "${LOCALES[@]}"; do
  prefix=$(locale_prefix "$locale")
  titles_file="$WORK/titles.$locale"
  : > "$titles_file"
  bad_status=0
  bad_size=0
  bad_lang=0
  bad_title=0
  # One example per category, not one shared example. A single `first_bad` put
  # the root page's byte count next to the "did not return 200" line, where it
  # was evidence for a different claim than the one it stood under — the exact
  # shape of mis-citation this repository has been bitten by before.
  first_status=""
  first_size=""
  first_title=""

  while IFS= read -r route; do
    [ -z "$route" ] && continue
    if [ "$route" = "/" ]; then
      url="$ORIGIN${prefix}/"
    else
      url="$ORIGIN${prefix}${route}"
    fi

    body="$WORK/page.html"
    code=$(curl -sL --max-time 30 -o "$body" -w '%{http_code}' "$url" 2>/dev/null)
    if [ "$code" != "200" ]; then
      bad_status=$((bad_status + 1))
      [ -z "$first_status" ] && first_status="$url -> HTTP $code"
      continue
    fi

    bytes=$(wc -c < "$body" | tr -d ' ')
    [ "$bytes" -lt "$SHELL_BYTES" ] && {
      bad_size=$((bad_size + 1))
      [ -z "$first_size" ] && first_size="$url -> ${bytes}B (shell was 939B)"
    }

    grep -q "<html lang=\"$locale\"" "$body" || bad_lang=$((bad_lang + 1))

    title=$(grep -o '<title>[^<]*</title>' "$body" | head -1 | sed 's/<title>//; s|</title>||')
    # `REAP` alone was the shell's title on every one of the 23 routes. No real
    # page has it: the root is "REAP — Recursive Evolutionary Autonomous
    # Pipeline" and the rest end in " — REAP".
    if [ -z "$title" ] || [ "$title" = "REAP" ]; then
      bad_title=$((bad_title + 1))
      [ -z "$first_title" ] && first_title="$url -> title '$title'"
    fi
    printf '%s\n' "$title" >> "$titles_file"
  done <<EOF
$ROUTES
EOF

  if [ "$bad_status" -eq 0 ]; then
    pass "locale $locale: all $ROUTE_COUNT page(s) returned 200"
  else
    fail "locale $locale: $bad_status page(s) did not return 200" "$first_status"
  fi
  [ "$bad_size" -eq 0 ]  || fail "locale $locale: $bad_size page(s) are shell-sized" "$first_size"
  [ "$bad_title" -eq 0 ] || fail "locale $locale: $bad_title page(s) carry no page-specific <title>" "$first_title"
  # This one prints on success as well as failure. A reader of an all-green run
  # cannot otherwise tell whether `<html lang>` was checked or merely omitted.
  #
  # And it says how many pages it looked at, because it only looks at pages
  # that returned 200 — so on a site where a whole locale 404s it counted zero
  # wrong out of zero and printed `<html lang="ko"> on every page` for 23 pages
  # that did not exist. Observed on the real site while this was being written:
  # the run was red from the status counter above, and this line was green
  # underneath it. The run being red for another reason is not a defence; the
  # sentence is what a reader takes away.
  fetched=$((ROUTE_COUNT - bad_status))
  if [ "$fetched" -eq 0 ]; then
    fail "locale $locale: <html lang> was not checked — no page returned 200"
  elif [ "$bad_lang" -eq 0 ]; then
    pass "locale $locale: <html lang=\"$locale\"> on all $fetched page(s) fetched"
  else
    fail "locale $locale: $bad_lang of $fetched fetched page(s) have the wrong <html lang>"
  fi

  got=$(grep -c . "$titles_file")
  dupes=$(sort "$titles_file" | uniq -d)
  if [ -n "$dupes" ]; then
    fail "locale $locale: duplicate <title> values" "$(printf '%s' "$dupes" | tr '\n' '|')"
  elif [ "$got" -ne "$ROUTE_COUNT" ]; then
    # Reachable only when a page 200s with no title at all; the counters above
    # normally catch that first. It used to print neither pass nor fail, which
    # is the one outcome a check must never have.
    fail "locale $locale: collected $got title(s) from $ROUTE_COUNT page(s)"
  else
    pass "locale $locale: $got distinct <title> values"
  fi
done

echo
# ---------------------------------------------------------------------------
# Discovery files.
# ---------------------------------------------------------------------------
# The sitemap is the only route a crawler has to 114 of these 115 pages, so
# what is asserted is WHICH URLs it lists. It used to be how many: an
# independent review replaced every <loc> with the home page's URL — 115
# entries, one distinct URL — and this script said "sitemap.xml lists all 115
# URLs" and exited 0. The paths are compared as a set; the host is compared
# only when this is running against the real deploy, since the file names
# reap.cc whatever origin served it.
sitemap="$WORK/sitemap.xml"
code=$(curl -sL --max-time 30 -o "$sitemap" -w '%{http_code}' "$ORIGIN/sitemap.xml" 2>/dev/null)
if [ "$code" != "200" ]; then
  fail "$ORIGIN/sitemap.xml returned $code"
else
  grep -o '<loc>[^<]*</loc>' "$sitemap" | sed 's|<loc>||; s|</loc>||' | sort -u > "$WORK/loc-urls"
  sed 's|^https\{0,1\}://[^/]*||' "$WORK/loc-urls" | sort -u > "$WORK/loc-paths"

  : > "$WORK/want-paths"
  for locale in "${LOCALES[@]}"; do
    prefix=$(locale_prefix "$locale")
    while IFS= read -r route; do
      [ -z "$route" ] && continue
      if [ "$route" = "/" ]; then
        printf '%s\n' "${prefix}/" >> "$WORK/want-paths"
      else
        printf '%s\n' "${prefix}${route}" >> "$WORK/want-paths"
      fi
    done <<EOF
$ROUTES
EOF
  done
  sort -u "$WORK/want-paths" -o "$WORK/want-paths"

  listed=$(grep -c . "$WORK/loc-paths")
  absent=$(comm -23 "$WORK/want-paths" "$WORK/loc-paths" | grep -c .)
  extra=$(comm -13 "$WORK/want-paths" "$WORK/loc-paths" | grep -c .)
  if [ "$absent" -eq 0 ] && [ "$extra" -eq 0 ]; then
    pass "sitemap.xml lists exactly the $EXPECTED page URLs"
  else
    fail "sitemap.xml lists $listed distinct path(s): $absent missing, $extra unexpected" \
         "$(comm -3 "$WORK/want-paths" "$WORK/loc-paths" | head -3 | tr '\n' ' ')"
  fi

  if [ "$ORIGIN_IS_DEPLOY" -eq 1 ]; then
    # `awk index()`, not `grep -v "^$ORIGIN/"`: ORIGIN contains dots and would
    # be read as a regex, so `reap.cc` would accept `reapXcc`.
    off_host=$(awk -v o="$ORIGIN/" 'index($0, o) != 1 { n++ } END { print n + 0 }' "$WORK/loc-urls")
    if [ "$listed" -eq 0 ]; then
      # Zero URLs means zero wrong ones, and this line would have said every
      # URL names the right host over an empty file. The same 0/0 shape as the
      # `<html lang>` line forty lines above — fixed there and, on the first
      # attempt, not here. The set comparison above is already red in this
      # case; a green sentence underneath it is still a sentence a reader takes
      # away.
      fail "sitemap host was not checked — the sitemap listed no URLs"
    elif [ "$off_host" -eq 0 ]; then
      pass "all $listed sitemap URL(s) name $ORIGIN"
    else
      fail "$off_host of $listed sitemap URL(s) name a different origin than $ORIGIN" \
           "$(awk -v o="$ORIGIN/" 'index($0, o) != 1' "$WORK/loc-urls" | head -2 | tr '\n' ' ')"
    fi
  else
    dim "  note  sitemap host not asserted — $ORIGIN is a stand-in, the file names the deploy domain"
  fi
fi

robots="$WORK/robots.txt"
code=$(curl -sL --max-time 30 -o "$robots" -w '%{http_code}' "$ORIGIN/robots.txt" 2>/dev/null)
if [ "$code" = "200" ] && grep -q '^Sitemap: ' "$robots"; then
  pass "robots.txt names the sitemap"
else
  fail "$ORIGIN/robots.txt returned $code or does not name the sitemap"
fi

echo
if [ "$FAILURES" -eq 0 ]; then
  green "PASSED — $EXPECTED page(s) served with page-specific titles"
  exit 0
fi
red "FAILED ($FAILURES)"
exit 1
