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
# disk, never by what the agent said. Be exact about what that establishes,
# because this script has overstated it before:
#
#   CLI reachable and working  — the file proves it, on its own
#   slash command recognised   — only if the agent obeyed the sentinel rule
#
# The second is NOT proved by the file. A slash command is a wrapper around the
# CLI, so an agent that cannot find /reap.start and runs `reap run start`
# itself produces a byte-identical result — gen-079 measured exactly that, and
# the sentinel below exists because of it. "The file is here, so the command was
# surfaced" is the same converse error as "no file, so the command was missing".
# What carries this half of the verdict is the agent following an instruction,
# and no amount of filesystem checking can replace that.
#
# Neither does the file establish that CLAUDE.md's @ imports loaded or that the
# SessionStart hook fired. reap.start.md says, in full, to run `reap run start`
# and follow its stdout; an agent can do that having read neither. This script
# claimed all four for six generations. Inferring them from "the same installer
# placed them" is layer-1 reasoning, and the two layers cannot infer each other
# — which is the entire reason layer 2 exists.
#
# What it must not do is read that chain backwards. "The command was not
# surfaced, so no generation appears" is true; its converse is not. No
# generation appears when the CLI crashes, when init failed, and — this is the
# one that actually happened — when the permission classifier blocked the
# command the slash command told the agent to run. The gate reported that as
# gen-063 and sent a release chasing a defect that was not there.
#
# So a missing generation is never attributed to one cause. Where the cause is
# known to be outside what this gate measures, it says it measured nothing —
# amber, not red. A check that failed and a check that could not run are
# different answers, and only one of them is about REAP.
#
# That distinction is drawn in exactly one place: a refusal of a command
# containing `reap run` — the one /reap.start issues. An agent run that ends
# in a turn limit, a crash or unparseable output measured nothing about REAP
# either, and still exits 1 — deliberately, and the
# asymmetry is not an oversight. A permission refusal recurs on every run in a
# session whose default mode is `auto`, so treating it as red trains a person
# to scroll past this gate; the others are rare and worth stopping for. Amber is
# reserved for what would otherwise cry wolf, not granted to everything that
# failed to measure.
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

# The one string that decides whether a refusal is REAP's. Two node blocks read
# it — the parser, which counts, and printDenials, which orders — and they take
# it from here rather than each spelling it out. A literal in both places is
# issue #22's exact shape: narrow one copy and the count line starts disagreeing
# with the list below it, which is the failure the ordering below exists to
# prevent.
export REAP_CMD_MATCH="reap run"

# Both the skip and the fail path show what was refused. A count tells a person
# nothing they can act on, and the review's fixtures turned on exactly this:
# the entries reveal a misclassification at a glance where the number hides it.
#
# Two ways a list can assert something its lines do not show, and both have
# occurred here. Ordering: slice before filtering and the deciding entry falls
# off the end while the count above says it exists. Truncation: keep the entry
# and cut the line before the match, and the same sentence is true again — a
# realistic command carries `cd … && export PATH=… && reap run start …` and the
# match sits past column 160. So hits are windowed around the match, and every
# cut is marked. An absence a reader can see is a different thing from one they
# cannot.
printDenials() {
  node -e '
    const NEEDLE = (process.env.REAP_CMD_MATCH || "").toLowerCase();
    const WIDTH = 160;
    const line = (s) => {
      const t = JSON.stringify(s);
      const at = NEEDLE ? t.toLowerCase().indexOf(NEEDLE) : -1;
      if (t.length <= WIDTH) return t;
      if (at < 0 || at + NEEDLE.length <= WIDTH) return t.slice(0, WIDTH) + " …";
      const from = Math.max(0, at - 40);
      return "… " + t.slice(from, from + WIDTH) + (from + WIDTH < t.length ? " …" : "");
    };
    let raw = ""; process.stdin.on("data", d => raw += d).on("end", () => {
      try {
        const parsed = JSON.parse(raw).permission_denials;
        const list = Array.isArray(parsed) ? parsed : [];
        const hit = x => NEEDLE && JSON.stringify(x).toLowerCase().includes(NEEDLE);
        const ordered = [...list.filter(hit), ...list.filter(x => !hit(x))];
        for (const x of ordered.slice(0, 5)) console.log("          · " + line(x));
        if (ordered.length > 5) console.log(`          · … and ${ordered.length - 5} more`);
      } catch {}
    });
  '
}

# reap:carrier(agent-integration-gate-verdicts)
# This gate answers three ways — pass / FAIL / amber SKIP — and the skip is for
# a refusal of a command containing `reap run`. Said in reap-guide
# § Verifying a Release,
# environment/summary.md, and reapdev.versionBump Step 5-2. Prose, so it cannot
# be shared; change it here and grep for the marker.
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

# Let the agent run REAP without a permission prompt it cannot answer.
#
# /reap.start's first instruction is `reap run start`, and in a session whose
# default mode is `auto` the classifier decides. It denied exactly that on
# 0.17.6's release run, the gate called it a missing slash command, and the
# release chased a defect that did not exist. Granting it removes the cause;
# the verdict below still refuses to name a single one.
#
# Narrow on purpose — `Bash(reap:*)`, not `Bash(*)`. And written inside the
# temporary project only: this gate reads the developer's installation and
# writes nowhere else. Both the settings file and --allowedTools are used
# because that pair is the combination measured to work; either alone is
# untested, and narrowing a check is how its bar quietly drops.
mkdir -p "$PROJECT/.claude"
cat > "$PROJECT/.claude/settings.local.json" <<'JSON'
{ "permissions": { "allow": ["Bash(reap:*)"], "deny": [] } }
JSON

# ── 2. Hand it to an agent ──────────────────────────────────────────────────
#
# The agent runs against the developer's real installation — that is the thing
# under test. Only the project directory is temporary.
echo
echo "Asking the agent to start a generation..."
AGENT_JSON=$(cd "$PROJECT" && claude -p \
  "Use the /reap.start slash command to create a generation with the goal '$PROBE_GOAL'. Pass --no-backlog if asked about backlog. Stop after the generation is created.

IMPORTANT: use the slash command only. Do not invoke the reap CLI directly, and do not work around its absence. If /reap.start is not available to you, create nothing and reply exactly: SLASH_COMMAND_UNAVAILABLE

If /reap.start IS available but a command it tells you to run is refused by the permission system, do not retry and do not work around it: reply exactly PERMISSION_BLOCKED and nothing else." \
  --allowedTools "Bash(reap:*)" \
  --output-format json < /dev/null 2>&1)

# Assert the run itself succeeded before reading anything into what is on disk.
# An unparseable result, a crash or a turn limit all leave the project empty,
# and none of them says a thing about the client's slash commands.
#
# DENIALS counts every tool the permission system refused; REAP_DENIALS counts
# only those naming `reap run`. The second is what the verdict may use.
#
# Counting alone was wrong and the review caught it: the allow-list here is
# `Bash(reap:*)` and nothing else, so any other command the skill provokes is
# the classifier's to judge. One refused WebFetch would then excuse an agent
# that plainly said it could not find /reap.start — the gate would assert a
# cause its own evidence contradicts two lines further down, which is the
# defect this script was rewritten to stop making.
#
# Matching bare "reap" was wrong for a subtler reason, and the second review
# caught that: it selects adversely. An agent that cannot find the slash
# command says reap MORE, not less — its first move is something like
# `ls ~/.claude/commands | grep reap`, and the project's own domain is
# reap.cc. The string most likely to appear in the exact scenario this gate
# exists to catch would have been the string that excused it. `reap run` is
# what /reap.start tells the agent to run and what the classifier refused in
# the 0.17.6 incident; diagnostic pokes around the installation do not contain
# it.
#
# Matching on a substring rather than a field is deliberate: no denial was
# ever captured from a real run, so the element's shape is unknown. It does not
# depend on any field NAME — but two tokens do assume the words land adjacent
# in the serialisation, which a single token did not. An entry holding
# {command:"reap",args:["run","start"]}, one that wraps the line between the
# words, or a refused `reap status`, all miss.
#
# Every one of those misses lands on FAIL, and the token leg covers them
# whenever the agent obeys it — which is not the case in exactly the runs where
# the misses matter. So the field leg's unique reach is now: an agent that
# ignored the token rule whose refusal carries the command as one string
# with `reap run` in it. That
# is narrow. It is kept because it is the exact shape of the 0.17.6 incident
# and it costs nothing — but a later reader deciding whether to keep it should
# know it is nearly subsumed, not assume it is load-bearing.
#
# The narrowing is chosen in the conservative direction, and that has a price
# worth naming rather than dressing up as "safe": a missed refusal becomes a
# red, and a red for something that is not REAP's fault is the thing the amber
# above exists to prevent. The FAIL text prints the entries and says what an
# opaque one would mean, which is the mitigation. It is a mitigation, not a
# solution.
#
# And this is a weak signal, not a detector. Three attempts to provoke a
# denial produced an empty array, so a zero means "nothing seen", never
# "nothing happened".
AGENT_STATUS=$(node -e '
  let raw = "";
  process.stdin.on("data", d => raw += d).on("end", () => {
    try {
      const d = JSON.parse(raw);
      const list = Array.isArray(d.permission_denials) ? d.permission_denials : [];
      const needle = (process.env.REAP_CMD_MATCH || "").toLowerCase();
      const reapish = needle ? list.filter(x => JSON.stringify(x).toLowerCase().includes(needle)) : [];
      console.log(`${d.subtype || "?"}|${d.is_error ? "error" : "ok"}|${d.total_cost_usd || 0}|${list.length}|${reapish.length}`);
    } catch { console.log("unparseable|error|0|0|0"); }
  });
' <<< "$AGENT_JSON")

IFS='|' read -r SUBTYPE ERRFLAG COST DENIALS REAP_DENIALS <<< "$AGENT_STATUS"
if [ "$ERRFLAG" != "ok" ] || [ "$SUBTYPE" != "success" ]; then
  red "  FAIL  the agent run itself failed (subtype: $SUBTYPE)"
  dim "        Nothing about REAP was measured — the agent never got that far."
  dim "        $(echo "$AGENT_JSON" | head -5)"
  exit 1
fi
green "  ok    agent completed (subtype: $SUBTYPE, cost: \$$COST)"

# The agent was told to reply with this exact token if the slash command is not
# available to it. Matching a token we dictated is not prose-parsing; it just
# lets the failure explain itself.
#
# This is checked BEFORE the filesystem, and the order carries the whole point
# of the sentinel. gen-079's first attempt was passed by an agent that could
# not find /reap.start and ran the CLI itself, producing the same file. A
# generation that appears after the agent has said the command is missing is
# not a pass; it is that bypass. Permissions are open now, which makes the
# bypass easier, not harder.
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
# The verdict is the file. Only when the file is absent does anything below
# consult the agent, and then only to decide whether this gate has measured
# REAP at all — never to pick which REAP defect to name.
echo
echo "Checking what actually happened..."
CURRENT="$PROJECT/.reap/life/current.yml"

if [ ! -f "$CURRENT" ]; then
  # Blocked by permissions: the agent never reached REAP, so there is nothing
  # here to pass or fail. Reporting that as a failure is what sent 0.17.6's
  # release after a defect that did not exist.
  #
  # Both conditions have to point at REAP. REAP_DENIALS, not DENIALS, for the
  # reason given at the parser; and the token is dictated for this one purpose.
  #
  # Two ways in, and each can in principle turn a red into an amber. Say both,
  # because the previous revision claimed there was one:
  #
  #   · the agent emits the token without having been blocked
  #   · a refusal naming `reap run` occurs in a run where the slash command was
  #     ALSO missing and the agent did not say so
  #
  # Both need the agent to depart from its instructions, which is the same
  # assumption the whole gate already rests on and states below. Accepted
  # deliberately: the branch needs no generation on disk to be reached, the
  # amber says in the same words as every other skip here that nothing was
  # verified, and what it buys is the removal of a wrong FAIL this gate produced
  # on every run in an `auto` session. A gate people learn to scroll past
  # catches nothing at all.
  if [ "${REAP_DENIALS:-0}" -gt 0 ] || grep -q "PERMISSION_BLOCKED" <<< "$AGENT_JSON"; then
    amber "  SKIP  permission system stopped the agent — agent integration was NOT verified"
    dim "        The agent could not run the command /reap.start told it to run, so"
    dim "        nothing here says whether REAP is installed correctly. This is a"
    dim "        check that could not run, not a check that failed."
    dim "        Refused tool calls recorded by the client: ${DENIALS:-0} (${REAP_DENIALS:-0} naming \`reap run\`)"
    printDenials <<< "$AGENT_JSON"
    echo
    dim "        Allow \`Bash(reap:*)\` for the probe — this script writes that into"
    dim "        the throwaway project — or run it from a session that permits it."
    echo
    dim "        Agent said:"
    node -e '
      let raw = ""; process.stdin.on("data", d => raw += d).on("end", () => {
        try { console.log("        " + (JSON.parse(raw).result || "").slice(0, 400)); }
        catch { console.log("        <unparseable>"); }
      });
    ' <<< "$AGENT_JSON"
    exit 0
  fi

  red "  FAIL  no generation was created"
  echo
  dim "        .reap/life/current.yml is absent. The agent ran to completion and"
  dim "        reported neither a missing slash command nor a blocked command, so"
  dim "        the cause is not established. Any of these produces this state:"
  echo
  dim "          · the client did not surface /reap.start   (the gen-063 shape)"
  dim "          · the CLI failed or crashed once invoked"
  dim "          · reap init left the project in a state run start rejects"
  dim "          · the agent stopped early for a reason of its own"
  if [ "${DENIALS:-0}" -gt 0 ]; then
    echo
    dim "        The client refused ${DENIALS} tool call(s), none naming \`reap run\`."
    dim "        Reported, not treated as an excuse: a refusal that is not REAP's"
    dim "        does not mean REAP was never reached. Read them — this is also"
    dim "        what a refusal the client recorded without its command text looks"
    dim "        like, and that one WOULD be REAP's."
    printDenials <<< "$AGENT_JSON"
  fi
  echo
  dim "        Read the reply below before assuming which. Reproducing the same"
  dim "        prompt by hand in the throwaway project separates them quickly."
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
dim "  CLI reachable and working — the generation proves that much on its own."
dim "  /reap.start was surfaced — resting on the agent having obeyed the rule"
dim "  not to bypass it, since a bypass leaves the same file behind."
dim "  @ imports and the SessionStart hook are NOT covered: /reap.start does"
dim "  not need either to succeed."
