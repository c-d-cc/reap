#!/usr/bin/env bash
# Install this working tree as the machine's reap — CLI and plugin — before
# anything is published. Idempotent: run it again after `git pull`.
#
#   bun install → bun run build + build:node → npm link
#   shared local reap-dev marketplace → installed in every available host → reap setup
#
# Usage: scripts/local-install.sh [--no-plugin]
set -u
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
fail=0
say() { printf '%s\n' "$*"; }
need() { command -v "$1" >/dev/null 2>&1 || { say "missing: $1 — $2"; fail=1; }; }

need bun "https://bun.sh"
need node "Node 20+ (nvm or https://nodejs.org)"
need npm "comes with node"
if [ "${1:-}" != "--no-plugin" ] && ! command -v claude >/dev/null 2>&1 && ! command -v codex >/dev/null 2>&1; then
  say "missing: claude or codex — install at least one host CLI"
  fail=1
fi
[ $fail -eq 0 ] || exit 1

say "== bun install =="
bun install --frozen-lockfile || exit 1

say "== build (bun binary + node bundle) =="
bun run build >/dev/null || exit 1
bun run build:node >/dev/null || exit 1

say "== npm link (global reap → $ROOT/dist/node/reap.js) =="
npm link >/dev/null 2>&1 || { say "npm link failed — try: sudo npm link, or fix the npm prefix"; exit 1; }
hash -r
resolved="$(readlink -f "$(command -v reap)" 2>/dev/null || true)"
case "$resolved" in
  "$ROOT"/dist/*) say "reap → $resolved" ;;
  *) say "warning: 'reap' on PATH is $resolved, not this tree — another reap comes first on PATH"; fail=1 ;;
esac
say "$(reap --version)"

if [ "${1:-}" = "--no-plugin" ]; then
  say "== plugin skipped (--no-plugin) — for one session: claude --plugin-dir $ROOT/plugin =="
  exit $fail
fi

say "== dev marketplace reap-dev → $ROOT/plugin =="
D="$HOME/.claude/dev-marketplaces/reap-dev"
mkdir -p "$D/.claude-plugin"
ln -sfn "$ROOT/plugin" "$D/plugin"
if [ ! -f "$D/.claude-plugin/marketplace.json" ]; then
cat > "$D/.claude-plugin/marketplace.json" <<JSON
{ "name": "reap-dev",
  "description": "REAP development marketplace — points at a working tree",
  "owner": { "name": "$(git config user.name 2>/dev/null || echo dev)" },
  "plugins": [{ "name": "reap", "description": "REAP (working tree)", "source": "./plugin" }] }
JSON
fi
if command -v claude >/dev/null 2>&1; then
if claude plugin marketplace list 2>/dev/null | grep -q 'reap-dev'; then
  claude plugin marketplace update reap-dev >/dev/null 2>&1 || true
else
  claude plugin marketplace add "$D" >/dev/null 2>&1 || { say "claude plugin marketplace add $D failed"; exit 1; }
fi
# reinstall, not update — `update` only acts on a version change (see reapdev.localUpdate)
claude plugin uninstall reap@reap-dev >/dev/null 2>&1 || true
claude plugin install reap@reap-dev -y >/dev/null 2>&1 || { say "claude plugin install reap@reap-dev failed"; exit 1; }
V=$(node -p 'require("./plugin/.claude-plugin/plugin.json").version')
if diff -rq plugin "$HOME/.claude/plugins/cache/reap-dev/reap/$V" >/dev/null 2>&1; then
  say "plugin reap@reap-dev $V installed (cache == working tree)"
else
  say "warning: plugin cache differs from working tree"; fail=1
fi

fi

if command -v codex >/dev/null 2>&1; then
  say "== Codex: install reap@reap-dev =="
  # Local marketplaces are copied into Codex's cache. Reinstall to refresh skills
  # even when the development version number has not changed.
  codex plugin marketplace add "$D" || exit 1
  codex plugin remove reap@reap-dev >/dev/null 2>&1 || true
  codex plugin add reap@reap-dev || exit 1
fi

# setup owns Codex's SessionStart registration and preserves other hooks.
reap setup || exit 1
say "== done — start a new host session; in Codex ask to use reap:init or reap:evolve =="
exit $fail
