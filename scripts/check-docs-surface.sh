#!/usr/bin/env bash
# Do the user-facing documents name every surface the code ships — the
# docsUpdate gate. Three surfaces, each read from its source of truth, each
# looked for in README.md, README.ko.md and every site locale file:
#
#   skills      plugin/skills/<name>/ (shared/ excluded)
#   hook events HOOK_EVENTS in src/hooks.ts
#   CLI verbs   the first word of every command line in `reap` usage
#
# Skills are looked for everywhere. Hook events and CLI verbs only in the site
# locale files — README says on purpose that it doesn't transcribe the CLI
# surface (`run reap with no arguments for usage`).
#
# Grep-level: it proves a name is mentioned, not that its description is
# current. Exits non-zero listing every missing (surface, document) pair.
set -u
cd "$(dirname "$0")/.."
bin="${REAP_BIN:-./dist/reap}"
fail=0
site=()
for f in site/src/i18n/translations/*.ts; do [ -f "$f" ] && site+=("$f"); done
docs=(README.md README.ko.md "${site[@]}")

check_in() { # kind name [site-only]
  local kind="$1" name="$2" d
  local -a targets; if [ "${3:-}" = "site" ]; then targets=("${site[@]}"); else targets=("${docs[@]}"); fi
  for d in "${targets[@]}"; do
    grep -qF -- "$name" "$d" || { echo "FAIL: $kind '$name' not mentioned in $d"; fail=1; }
  done
}

for dir in plugin/skills/*/; do
  name=$(basename "$dir"); [ "$name" = "shared" ] && continue
  check_in skill "$name"
done

for ev in $(awk '/HOOK_EVENTS = \[/{f=1;next} f && /\]/{exit} f' src/hooks.ts | tr -d ' ",'); do
  check_in "hook event" "$ev" site
done

if [ -x "$bin" ]; then
  # usage lines look like "  make loop  --type ..."; the first word is the verb
  for verb in $("$bin" 2>/dev/null | awk '/^  [a-z]/{print $1}' | sort -u); do
    check_in "CLI verb" "$verb" site
  done
else
  echo "note: $bin not found — CLI verbs not checked (build first, or set REAP_BIN)"
fi

[ $fail -eq 0 ] && echo "ok: every skill is named in ${#docs[@]} documents; every hook event and CLI verb in ${#site[@]} site locale(s)"
exit $fail
