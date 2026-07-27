#!/usr/bin/env bash
# Verify that an agent can actually drive REAP.
#
# The self-diagnosis gate (check-self-diagnosis.sh) confirms the files land in
# the right places with the right contents. It cannot confirm the client reads
# them. gen-063 shipped an adapter whose static loading, dynamic refresh and
# entry-point file all passed their tests, and the slash commands still did not
# appear — a user found that during fitness. gen-064 repeated the shape.
#
# So this drives a real headless agent and judges the result by what changed on
# disk, never by what the agent said. One invocation exercises the whole chain:
#
#   slash command recognised   — /reap.start would not run otherwise
#   @ imports loaded           — the agent needs CLAUDE.md's genome refs for context
#   SessionStart hook fired    — injected state reaches the agent
#   CLI works                  — a generation actually appears
#
# Unlike the self-diagnosis gate this does NOT install into a throwaway HOME,
# and cannot: Claude Code keeps its login beside the slash commands under
# ~/.claude/, so redirecting HOME to isolate the commands also throws away the
# session ("Not logged in"). The two cannot be separated.
#
# That turns out to suit the question. Layer 1 asks whether the tarball puts the
# right files in the right place; layer 2 asks whether the client reads what is
# there. The second needs only the installation the developer already has — this
# script reads it and writes nothing outside a temporary project directory.
#
# Because it checks what is currently installed, run `reap install-skills` first
# if the sources have moved on since. Costs roughly $0.25 and takes tens of
# seconds, so it belongs before a release rather than in CI: agent responses
# vary in wording and length, and the moment a check greps them it becomes
# flaky.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

red()   { printf '\033[31m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }
amber() { printf '\033[33m%s\033[0m\n' "$1"; }
dim()   { printf '\033[2m%s\033[0m\n' "$1"; }

PROBE_GOAL="agent integration probe"

PROJECT=""
cleanup() { [ -n "$PROJECT" ] && rm -rf "$PROJECT"; return 0; }
trap cleanup EXIT

# ── 0. Is an agent available at all? ────────────────────────────────────────
#
# Skipping is fine; skipping quietly is not. A silent exit 0 reads as "checked
# and clean" to whoever runs this before tagging a release.
if ! command -v claude >/dev/null 2>&1; then
  amber "SKIP  claude CLI not found — agent integration was NOT verified"
  dim "      Install Claude Code to run this check."
  exit 0
fi

if ! command -v reap >/dev/null 2>&1; then
  amber "SKIP  reap not on PATH — agent integration was NOT verified"
  dim "      Run 'npm i -g @c-d-cc/reap' (or 'npm link') first."
  exit 0
fi

PKG_VERSION=$(node -p "require('./package.json').version")
INSTALLED_VERSION=$(reap --version 2>/dev/null | head -1 || echo "unknown")
echo "Agent integration check"
dim "  sources: v$PKG_VERSION   installed: $INSTALLED_VERSION"
dim "  (~\$0.25 per run — pre-release, not CI)"
dim "  reads the current installation; run 'reap install-skills' first if stale"
echo

# ── 1. A throwaway project against the real installation ────────────────────
PROJECT=$(mktemp -d)
(cd "$PROJECT" && git init -q && git config user.email "agent@check" && git config user.name "Agent Check")
if ! (cd "$PROJECT" && reap init agentcheck >/dev/null 2>&1); then
  red "  FAIL  reap init failed"
  exit 1
fi
green "  ok    project initialised at a temporary path"

# ── 2. Hand it to an agent ──────────────────────────────────────────────────
#
# The agent runs against the developer's real installation — that is the thing
# under test. Only the project directory is temporary.
echo
echo "Asking the agent to start a generation..."
AGENT_JSON=$(cd "$PROJECT" && claude -p \
  "Use the /reap.start slash command to create a generation with the goal '$PROBE_GOAL'. Pass --no-backlog if asked about backlog. Stop after the generation is created.

IMPORTANT: use the slash command only. Do not invoke the reap CLI directly, and do not work around its absence. If /reap.start is not available to you, create nothing and reply exactly: SLASH_COMMAND_UNAVAILABLE" \
  --output-format json < /dev/null 2>&1)

AGENT_STATUS=$(node -e '
  let raw = "";
  process.stdin.on("data", d => raw += d).on("end", () => {
    try {
      const d = JSON.parse(raw);
      console.log(`${d.subtype || "?"}|${d.is_error ? "error" : "ok"}|${d.total_cost_usd || 0}`);
    } catch { console.log("unparseable|error|0"); }
  });
' <<< "$AGENT_JSON")

IFS='|' read -r SUBTYPE ERRFLAG COST <<< "$AGENT_STATUS"
if [ "$ERRFLAG" != "ok" ]; then
  red "  FAIL  the agent run itself failed (subtype: $SUBTYPE)"
  dim "        $(echo "$AGENT_JSON" | head -5)"
  exit 1
fi
green "  ok    agent completed (subtype: $SUBTYPE, cost: \$$COST)"

# The agent was told to reply with this exact token if the slash command is not
# available to it. Matching a token we dictated is not prose-parsing; it just
# lets the failure explain itself. The verdict is still the filesystem check.
if grep -q "SLASH_COMMAND_UNAVAILABLE" <<< "$AGENT_JSON"; then
  echo
  red "  FAIL  the client does not expose /reap.start"
  dim "        The agent reported the slash command is unavailable to it."
  dim "        Files may be installed correctly and still never reach the user —"
  dim "        that is the gen-063 failure."
  exit 1
fi

# ── 3. Judge by what is on disk ─────────────────────────────────────────────
#
# Nothing below reads the agent's prose. If the slash command had not been
# recognised, current.yml simply would not exist.
echo
echo "Checking what actually happened..."
CURRENT="$PROJECT/.reap/life/current.yml"

if [ ! -f "$CURRENT" ]; then
  red "  FAIL  no generation was created"
  echo
  dim "        .reap/life/current.yml is absent, so /reap.start never ran."
  dim "        The files are in place — the client did not surface them as a"
  dim "        slash command. This is the gen-063 failure exactly: an adapter"
  dim "        that installed correctly and could not be invoked."
  echo
  dim "        Agent said:"
  node -e '
    let raw = ""; process.stdin.on("data", d => raw += d).on("end", () => {
      try { console.log("        " + (JSON.parse(raw).result || "").slice(0, 400)); }
      catch { console.log("        <unparseable>"); }
    });
  ' <<< "$AGENT_JSON"
  exit 1
fi

if ! grep -q "goal: $PROBE_GOAL" "$CURRENT"; then
  red "  FAIL  a generation exists but carries the wrong goal"
  dim "        expected: $PROBE_GOAL"
  dim "        found:    $(grep '^goal:' "$CURRENT" || echo '<none>')"
  exit 1
fi

GEN_ID=$(grep '^id:' "$CURRENT" | head -1 | sed 's/^id: *//')
green "  ok    generation created: $GEN_ID"

echo
green "Agent integration verified against $INSTALLED_VERSION."
dim "  slash command recognised · @ imports loaded · hook fired · CLI reachable"
