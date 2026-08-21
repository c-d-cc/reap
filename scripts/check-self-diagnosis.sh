#!/usr/bin/env bash
# Install REAP the way a user would, then ask REAP whether the result is healthy.
#
# Why this exists (gen-078): issue #21 and #22 were both "one fact, several
# places, only some updated", and both were reported by an outside user rather
# than caught here. #22 in particular was visible to any run of `fix --check` —
# 19 warnings, for six generations — but the output was noisy enough that
# whoever looked filtered for the lines they cared about.
#
# reap:carrier(self-diagnosis-covered-incidents)
# This turns that into a gate: install from the actual publish artifact and
# require a clean bill of health. Four past incidents fail against it —
#   - #22            : install-skills wrote where fix --check called legacy
#   - gen-089 index  : a resolver that resolved nothing, reported as success
#                      (section 5)
#   - npm 12 default : install scripts blocked, no integration at all (section 6)
#   - gen-080        : agent files OpenCode could not parse (section 7)
#
# Every entry above was reproduced against the broken state before being listed.
# A coverage claim written alongside a check that was never run against the
# broken state is a guess, and this file is read by whoever is deciding what
# still needs testing.
#
# Section 5 asks whether the index finds relationships the fixture is known to
# have, not whether it produced any symbols at all. "Are there symbols?" is
# satisfied by a resolver that resolves nothing.
#
# Sections 5 through 7 exist because the first checks all ask the same question
# of one client, one code path and one way of installing. REAP claims to support
# two clients and now carries its own indexer; `reap init` exercises neither —
# so the OpenCode path reached users unverified and took their whole OpenCode
# install offline (gen-080). Section 6 adds the third axis: sections 2 through 5
# all install with scripts allowed, which npm 12 no longer does by default.
#
# Isolation is not optional. `install-skills` writes 19 files to
# ~/.claude/commands/ and postinstall touches ~/.reap/ and
# ~/.claude/settings.json, so an unisolated run would overwrite the developer's
# own setup. CI runners are disposable, but the same script has to be safe to
# run locally or nobody will run it before pushing.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

red()   { printf '\033[31m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }
amber() { printf '\033[33m%s\033[0m\n' "$1"; }
dim()   { printf '\033[2m%s\033[0m\n' "$1"; }

FAKE_HOME=""; PREFIX=""; PROJECT=""; TARBALL=""
OC_HOME=""; OC_PROJECT=""
IX_PROJECT=""
BL_HOME=""; BL_PREFIX=""; BL_PROJECT=""
UN_HOME=""; UN_PREFIX=""
cleanup() {
  [ -n "$FAKE_HOME" ]  && rm -rf "$FAKE_HOME"
  [ -n "$PREFIX" ]     && rm -rf "$PREFIX"
  [ -n "$PROJECT" ]    && rm -rf "$PROJECT"
  [ -n "$OC_HOME" ]    && rm -rf "$OC_HOME"
  [ -n "$OC_PROJECT" ] && rm -rf "$OC_PROJECT"
  [ -n "$IX_PROJECT" ]  && rm -rf "$IX_PROJECT"
  [ -n "$BL_HOME" ]    && rm -rf "$BL_HOME"
  [ -n "$BL_PREFIX" ]  && rm -rf "$BL_PREFIX"
  [ -n "$BL_PROJECT" ] && rm -rf "$BL_PROJECT"
  [ -n "$UN_HOME" ]    && rm -rf "$UN_HOME"
  [ -n "$UN_PREFIX" ]  && rm -rf "$UN_PREFIX"
  return 0
}
trap cleanup EXIT

PKG_VERSION=$(node -p "require('./package.json').version")
echo "Self-diagnosis for v$PKG_VERSION"
echo

# ── 1. Build the artifact that would actually ship ──────────────────────────
# Packing rather than linking the source tree is the point: `files` omissions
# and postinstall problems only exist in the tarball.
echo "Packing..."
if ! npm run build >/dev/null 2>&1; then
  red "  FAIL  npm run build"
  exit 1
fi
TARBALL=$(npm pack --silent 2>/dev/null | tail -1)
if [ -z "$TARBALL" ] || [ ! -f "$ROOT/$TARBALL" ]; then
  red "  FAIL  npm pack produced no tarball"
  exit 1
fi
green "  ok    $TARBALL"

# ── 2. Install into a throwaway HOME and prefix ─────────────────────────────
FAKE_HOME=$(mktemp -d)
PREFIX=$(mktemp -d)
echo
echo "Installing into an isolated environment..."

# The prefix's own bin goes on PATH, which is what a real global install looks
# like and is not what an isolated one does by default. REAP's postinstall runs
# `reap check-version`, which reads `reap --version` off PATH to decide whether
# to auto-update. With the isolated bin absent it reads whatever reap the
# developer or runner has installed, finds it differs from `latest`, and runs
# `npm install -g @c-d-cc/reap@latest` — inheriting npm_config_prefix, so the
# upgrade lands in *this* prefix and overwrites the tarball that was just
# installed. Measured: the installed bundle was byte-identical to the published
# 0.17.5 rather than to the one packed a second earlier, and every section below
# was diagnosing the published package (gen-088).
if ! HOME="$FAKE_HOME" PATH="$PREFIX/bin:$PATH" \
     npm i -g --prefix "$PREFIX" "$ROOT/$TARBALL" >/dev/null 2>&1; then
  red "  FAIL  global install failed"
  dim "        HOME=$FAKE_HOME PREFIX=$PREFIX"
  exit 1
fi

REAP_BIN="$PREFIX/bin/reap"
if [ ! -x "$REAP_BIN" ]; then
  red "  FAIL  reap binary missing at $REAP_BIN"
  exit 1
fi

# And then check rather than trust. The line above is a precaution against one
# known mechanism; this is the property that actually matters, and it holds
# whatever replaces the artifact next time. Without it "the gate passed" and
# "the gate tested something else entirely" are the same observation — which is
# what they were, silently, from the moment 0.17.5 was published.
PACKED_SHA=$(tar -xzOf "$ROOT/$TARBALL" package/dist/cli/index.js | shasum -a 256 | cut -d" " -f1)
INSTALLED_SHA=$(shasum -a 256 "$PREFIX/lib/node_modules/@c-d-cc/reap/dist/cli/index.js" 2>/dev/null | cut -d" " -f1)
if [ -z "$PACKED_SHA" ] || [ "$PACKED_SHA" != "$INSTALLED_SHA" ]; then
  red "  FAIL  what got installed is not what was packed"
  dim "        packed:    ${PACKED_SHA:-<could not read tarball>}"
  dim "        installed: ${INSTALLED_SHA:-<no bundle at the install path>}"
  dim "        Everything below would be diagnosing some other build. The known"
  dim "        cause is REAP's own postinstall auto-updating to the published"
  dim "        version; check that the prefix bin is on PATH for the install."
  exit 1
fi
green "  ok    installed, and it is the artifact we packed"

# ── 3. Initialise a project the way a new user would ────────────────────────
PROJECT=$(mktemp -d)
echo
echo "Initialising a project..."
(cd "$PROJECT" && git init -q && git config user.email "self@check" && git config user.name "Self Check")
if ! (cd "$PROJECT" && HOME="$FAKE_HOME" "$REAP_BIN" init selftest >/dev/null 2>&1); then
  red "  FAIL  reap init failed"
  exit 1
fi
green "  ok    initialised"

# The genome this tarball ships tells every agent to open
# environment/source-map.md before changing code. `adoption` has always written
# that file from its scan; `greenfield` — which is what an empty directory gets,
# and what this section just ran — never did, so the shipped rule would have
# pointed a new project's agent at nothing (gen-090).
#
# This lives here rather than only in the e2e suite because the two ask
# different questions. The e2e runs the source tree; this runs what npm
# actually unpacks, which is the half that has shipped broken before.
#
# Content, not just existence: a file that is nothing but headings satisfies
# `-f` while teaching the agent nothing. The filter is the one `checkIntegrity`
# uses to call a genome file placeholder-only.
SOURCE_MAP="$PROJECT/.reap/environment/source-map.md"
if [ ! -f "$SOURCE_MAP" ]; then
  red "  FAIL  greenfield init wrote no environment/source-map.md"
  dim "        The shipped genome/evolution.md tells agents to read it before"
  dim "        changing code. A rule whose premise the installer does not create"
  dim "        sends every new project's agent looking for a missing file."
  exit 1
fi
SUBSTANTIVE=$(grep -cvE '^[[:space:]]*($|#|>|<!--)' "$SOURCE_MAP")
if [ "${SUBSTANTIVE:-0}" -lt 1 ]; then
  red "  FAIL  environment/source-map.md is scaffolding only ($SUBSTANTIVE content lines)"
  dim "        Headings and comments alone tell the agent nothing about what the"
  dim "        file is for or when to fill it."
  exit 1
fi
green "  ok    source-map.md written ($SUBSTANTIVE content lines)"

# `reap init` deliberately leaves genome/application.md and vision/goals.md as
# skeletons — they are filled in conversation with the agent, which no script
# can stand in for. Reporting them is correct behaviour, not an install fault,
# so fill them the way a real project would before diagnosing. Otherwise the
# gate would fail on REAP working as designed, and a gate that cries wolf gets
# switched off.
cat >> "$PROJECT/.reap/genome/application.md" <<'FILLER'

## Identity

Fixture project used by the self-diagnosis gate.

## Architecture

Single-purpose: exists only to verify a fresh install diagnoses cleanly.
FILLER
cat >> "$PROJECT/.reap/vision/goals.md" <<'FILLER'

## Goal Items

- [ ] Verify a freshly installed REAP reports nothing about itself
FILLER

# ── 4. Ask REAP about its own handiwork ─────────────────────────────────────
#
# With the conversational parts filled, whatever remains is REAP disagreeing
# with what REAP just did — exactly the shape of #22.
echo
echo "Diagnosing..."
CHECK_JSON=$(cd "$PROJECT" && HOME="$FAKE_HOME" "$REAP_BIN" fix --check 2>/dev/null)

FINDINGS=$(node -e '
  let raw = "";
  process.stdin.on("data", d => raw += d).on("end", () => {
    let ctx = {};
    try { ctx = (JSON.parse(raw).context) || {}; } catch { console.log("PARSE_ERROR"); return; }
    const out = [
      ...(ctx.errors   || []).map(m => "ERROR   " + m),
      ...(ctx.warnings || []).map(m => "WARNING " + m),
    ];
    console.log(out.join("\n"));
  });
' <<< "$CHECK_JSON")

if [ "$FINDINGS" = "PARSE_ERROR" ]; then
  red "  FAIL  could not parse fix --check output"
  dim "        $(echo "$CHECK_JSON" | head -3)"
  exit 1
fi

if [ -n "$FINDINGS" ]; then
  COUNT=$(echo "$FINDINGS" | wc -l | tr -d ' ')
  red "  FAIL  a fresh install reports $COUNT finding(s) about itself"
  echo
  echo "$FINDINGS" | while IFS= read -r line; do dim "        $line"; done
  echo
  dim "        A new user sees these on day one. Either the installer or the"
  dim "        checker is wrong — they cannot both be right."
  exit 1
fi
green "  ok    no findings"

# ── 5. The index: does the published bundle produce answers that make sense? ─
#
# Everything above verifies files landing in the right place. This section
# refuses to accept that as evidence, for two reasons.
#
# The first is packaging: a source tree resolves everything, so nothing in one
# can see a dependency that fails to resolve once installed. This runs the
# *installed* reap, under **node**, with bun made unavailable — bun hid two
# defects for three generations by resolving what node could not.
#
# The second is why the assertion below is shaped as it is. A grammar that fails
# to load, a resolver that resolves nothing, an index written to the wrong
# place: all of them produce a confident success and an empty graph, and every
# one of them satisfies "did indexing run?".
#
# So the fixture below has known relationships, and the check is that the index
# finds *those*, at a 100% import resolution rate.
echo
echo "Checking the built-in code index (installed bundle, node, no bun)..."

IX_PROJECT=$(mktemp -d)

# A NodeNext fixture: `.js` specifiers naming `.ts` files, plus one call edge
# across files. A resolver that cannot map the one to the other returns an empty
# blast radius for the whole chain.
mkdir -p "$IX_PROJECT/src"
cat > "$IX_PROJECT/src/leaf.ts" <<'IXEOF'
export function leafHelper(n: number): number {
  return n * 2;
}
IXEOF
cat > "$IX_PROJECT/src/middle.ts" <<'IXEOF'
import { leafHelper } from "./leaf.js";

export function middleCaller(n: number): number {
  return leafHelper(n) + 1;
}
IXEOF
cat > "$IX_PROJECT/src/top.ts" <<'IXEOF'
import { middleCaller } from "./middle.js";

export function topEntry(): number {
  return middleCaller(21);
}
IXEOF

(
  cd "$IX_PROJECT"
  git init -q -b main .
  git config user.email "gate@example.com"
  git config user.name "Gate"
) >/dev/null 2>&1

(cd "$IX_PROJECT" && HOME="$FAKE_HOME" "$REAP_BIN" init index-gate >/dev/null 2>&1) || true
if [ ! -f "$IX_PROJECT/.reap/config.yml" ]; then
  red "  FAIL  reap init did not create a project for the index check"
  exit 1
fi

(cd "$IX_PROJECT" && git add -A && git commit -qm "fixture") >/dev/null 2>&1

# node only. `IX_NOBUN/bun` exits 127, so anything that silently depended on bun
# fails here rather than on a user's machine.
IX_NOBUN="$IX_PROJECT/.nobun"
mkdir -p "$IX_NOBUN"
printf '#!/bin/sh\nexit 127\n' > "$IX_NOBUN/bun"
chmod +x "$IX_NOBUN/bun"

IX_UPDATE=$(cd "$IX_PROJECT" && HOME="$FAKE_HOME" PATH="$IX_NOBUN:$PATH" \
  "$REAP_BIN" index update 2>&1)
if ! grep -q '"status": *"ok"' <<< "$IX_UPDATE"; then
  red "  FAIL  'reap index update' did not succeed from an installed bundle under node"
  echo
  echo "$IX_UPDATE" | head -12 | while IFS= read -r line; do dim "        $line"; done
  echo
  dim "        The likely causes are a grammar missing from dist/grammars/ or"
  dim "        web-tree-sitter inlined into the bundle instead of left external."
  rm -rf "$IX_PROJECT"
  exit 1
fi

IX_STATUS=$(cd "$IX_PROJECT" && HOME="$FAKE_HOME" PATH="$IX_NOBUN:$PATH" \
  "$REAP_BIN" index status 2>&1)

# Everything below reads fields out of this JSON, so prove it is JSON and that
# the command ran before believing any number in it. An absent field and a
# crashed process look identical to a grep.
IX_VERDICT=$(node -e '
  let raw = "";
  process.stdin.on("data", d => raw += d).on("end", () => {
    let ctx;
    try { ctx = JSON.parse(raw).context; } catch { console.log("PARSE_ERROR"); return; }
    if (!ctx) { console.log("NO_CONTEXT"); return; }
    const need = ["nodes", "imports", "edgeTotal", "edgeDistinct", "indexPath"];
    const missing = need.filter(k => ctx[k] === undefined);
    if (missing.length) { console.log("MISSING " + missing.join(",")); return; }
    console.log([
      ctx.nodes,
      ctx.imports.resolved,
      ctx.imports.attempted,
      ctx.edgeTotal,
      ctx.edgeDistinct,
      ctx.indexPath,
      JSON.stringify(ctx.languageFailures ?? null),
    ].join("|"));
  });
' <<< "$IX_STATUS")

case "$IX_VERDICT" in
  PARSE_ERROR|NO_CONTEXT|MISSING*)
    red "  FAIL  'reap index status' did not report usable numbers ($IX_VERDICT)"
    echo "$IX_STATUS" | head -12 | while IFS= read -r line; do dim "        $line"; done
    rm -rf "$IX_PROJECT"
    exit 1
    ;;
esac

IFS='|' read -r IX_NODES IX_RESOLVED IX_ATTEMPTED IX_ETOTAL IX_EDISTINCT IX_PATH IX_LANGFAIL <<< "$IX_VERDICT"

if [ "$IX_LANGFAIL" != "null" ]; then
  red "  FAIL  a grammar did not load from the installed package"
  dim "        $IX_LANGFAIL"
  dim "        dist/grammars/ is populated by scripts/build.sh from the tag queries."
  rm -rf "$IX_PROJECT"
  exit 1
fi

# The fixture has two relative imports. Naming the number rather than only the
# ratio means a fixture that stopped being parsed cannot pass as 0/0.
if [ "$IX_ATTEMPTED" != "2" ] || [ "$IX_RESOLVED" != "2" ]; then
  red "  FAIL  import resolution is $IX_RESOLVED/$IX_ATTEMPTED, expected 2/2"
  echo
  dim "        The fixture imports './leaf.js' and './middle.js', which are .ts"
  dim "        files — the NodeNext form. A resolver that cannot map .js to .ts"
  dim "        returns an empty blast radius for every TypeScript project."
  rm -rf "$IX_PROJECT"
  exit 1
fi

if [ "$IX_NODES" -lt 3 ]; then
  red "  FAIL  the index holds $IX_NODES symbols; the fixture defines 3"
  rm -rf "$IX_PROJECT"
  exit 1
fi

if [ "$IX_ETOTAL" != "$IX_EDISTINCT" ]; then
  red "  FAIL  $IX_ETOTAL edges of which $IX_EDISTINCT distinct — duplicates are back"
  dim "        A store that appends without a key multiplies the edge count on"
  dim "        every re-index, and every count-based figure with it."
  rm -rf "$IX_PROJECT"
  exit 1
fi

# The index belongs to the project, not to the home directory: it is derived
# data keyed to one repository's commits, and nothing in HOME can be keyed to
# that.
# Compared through `pwd -P`: reap reports `process.cwd()`, which is resolved,
# while `mktemp -d` on macOS hands back the /var symlink to /private/var. The
# two spell one directory and a literal comparison fails on every macOS run.
IX_REAL=$(cd "$IX_PROJECT" && pwd -P)
if [ "$IX_PATH" != "$IX_REAL/.reap/.index" ]; then
  red "  FAIL  the index was written to $IX_PATH, not to $IX_REAL/.reap/.index"
  rm -rf "$IX_PROJECT"
  exit 1
fi
# Reuse the name the comparison above just validated. This used to spell it a
# second time, as `index` against an actual `.index`, and so could not fire for
# anything at all. `$IX_PATH` is now guaranteed to end in the right directory
# name because the check above exits on any mismatch — which is also where a
# rename of `.index` would go red first.
IX_DIRNAME=$(basename "$IX_PATH")
if [ -e "$FAKE_HOME/.reap/$IX_DIRNAME" ]; then
  red "  FAIL  indexing wrote into the home directory ($FAKE_HOME/.reap)"
  ls -la "$FAKE_HOME/.reap" | while IFS= read -r line; do dim "        $line"; done
  rm -rf "$IX_PROJECT"
  exit 1
fi

# The known relationship. This is the assertion the previous gate lacked: not
# "are there symbols" but "did it find the thing we know is there".
IX_IMPACT=$(cd "$IX_PROJECT" && HOME="$FAKE_HOME" PATH="$IX_NOBUN:$PATH" \
  "$REAP_BIN" index impact src/leaf.ts 2>&1)
IX_DEPS=$(node -e '
  let raw = "";
  process.stdin.on("data", d => raw += d).on("end", () => {
    let ctx;
    try { ctx = JSON.parse(raw).context; } catch { console.log("PARSE_ERROR"); return; }
    if (!ctx || !Array.isArray(ctx.directFiles) || !Array.isArray(ctx.indirectFiles)) {
      console.log("NO_FIELDS"); return;
    }
    console.log([...ctx.directFiles, ...ctx.indirectFiles].sort().join(","));
  });
' <<< "$IX_IMPACT")

if [ "$IX_DEPS" != "src/middle.ts,src/top.ts" ]; then
  red "  FAIL  blast radius of src/leaf.ts is '$IX_DEPS', expected 'src/middle.ts,src/top.ts'"
  echo
  dim "        top.ts imports middle.ts imports leaf.ts. Changing the leaf affects"
  dim "        both — directly and transitively. An empty answer here means the"
  dim "        resolver produced nothing usable."
  rm -rf "$IX_PROJECT"
  exit 1
fi

# Nothing changed since the commit, so nothing should be re-parsed.
IX_AGAIN=$(cd "$IX_PROJECT" && HOME="$FAKE_HOME" PATH="$IX_NOBUN:$PATH" \
  "$REAP_BIN" index update 2>&1)
IX_MODE=$(node -e '
  let raw = "";
  process.stdin.on("data", d => raw += d).on("end", () => {
    let ctx;
    try { ctx = JSON.parse(raw).context; } catch { console.log("PARSE_ERROR"); return; }
    console.log(ctx ? `${ctx.mode}|${ctx.filesProcessed}` : "NO_CONTEXT");
  });
' <<< "$IX_AGAIN")
if [ "$IX_MODE" != "up-to-date|0" ]; then
  red "  FAIL  re-indexing an unchanged commit reported '$IX_MODE', expected 'up-to-date|0'"
  rm -rf "$IX_PROJECT"
  exit 1
fi

rm -rf "$IX_PROJECT"
green "  ok    index built under node from the published bundle: 2/2 imports, known blast radius, no duplicates"

# ── 6. Install scripts blocked: is what we ship still usable? ──────────────
#
# npm 12 stopped running install scripts for global installs by default. REAP
# put every user-level asset behind exactly one of them:
#
#   scripts/postinstall.sh → install-skills → slash commands, agent
#   definitions, ~/.reap/reap-guide.md, the SessionStart hook
#
# Blocked, the install still succeeds and the binary still runs. What the user
# loses is the entire agent integration, with no error anywhere — and the
# README's first instruction is `/reap.init`, a slash command that is now one
# of the missing files. Measured against the real 0.17.5 tarball before this
# section existed: 19 commands and 2 agents on npm 11, zero of each on npm 12.
#
# The condition is forced with --ignore-scripts rather than inferred from the
# runner's npm version. release.yml pins the gate to node's bundled npm, so a
# version-dependent check here would quietly stop reproducing anything the day
# that pin changes — and the failure mode would be a passing check.
#
# Absence is asserted before the repair is asserted. Without it a future npm
# that ignores --ignore-scripts would leave this section testing a healthy
# install and reporting a pass, which is the same shape of defect it exists to
# catch.
echo
echo "Checking an install with scripts blocked..."

BL_HOME=$(mktemp -d)
BL_PREFIX=$(mktemp -d)
BL_PROJECT=$(mktemp -d)

if ! HOME="$BL_HOME" npm i -g --ignore-scripts --prefix "$BL_PREFIX" "$ROOT/$TARBALL" >/dev/null 2>&1; then
  red "  FAIL  global install with --ignore-scripts failed"
  exit 1
fi

BL_BIN="$BL_PREFIX/bin/reap"
if [ ! -x "$BL_BIN" ]; then
  red "  FAIL  reap binary missing at $BL_BIN"
  exit 1
fi

BL_PKG="$BL_PREFIX/lib/node_modules/@c-d-cc/reap"
BL_CMD_DIR="$BL_HOME/.claude/commands"
BL_AGENT_DIR="$BL_HOME/.claude/agents"
BL_GUIDE="$BL_HOME/.reap/reap-guide.md"

count_matching() { ls -1 "$1" 2>/dev/null | grep -c "$2" | tr -d ' '; }

if [ -e "$BL_GUIDE" ] || [ "$(count_matching "$BL_CMD_DIR" '^reap\.')" != "0" ]; then
  red "  FAIL  --ignore-scripts no longer blocks the postinstall"
  dim "        This section reproduces npm 12 by blocking install scripts. If"
  dim "        they ran, nothing below is testing the condition it claims to."
  exit 1
fi
green "  ok    blocked install leaves no user-level assets (condition reproduced)"

# What the user has at this point is the binary and the README. `reap init` is
# what the README's CLI path leads to, so that is the command asked to repair.
# Any other reap command must do the same — this one is chosen because it is
# the first a new user runs, not because it is special.
(cd "$BL_PROJECT" && git init -q && git config user.email "self@check" && git config user.name "Self Check")
if ! (cd "$BL_PROJECT" && HOME="$BL_HOME" "$BL_BIN" init blockedtest >/dev/null 2>&1); then
  red "  FAIL  reap init failed under a blocked install"
  exit 1
fi

# Counts come from the package that was just installed, so this asserts "all of
# them" rather than a number written here that drifts as commands are added.
BL_WANT_CMDS=$(count_matching "$BL_PKG/dist/adapters/claude-code/skills" '^reap\..*\.md$')
BL_WANT_AGENTS=$(count_matching "$BL_PKG/dist/templates/agents" '^reap-.*\.md$')
if [ "$BL_WANT_CMDS" = "0" ] || [ "$BL_WANT_AGENTS" = "0" ]; then
  red "  FAIL  the installed package carries no skills or no agent definitions"
  dim "        expected sources under $BL_PKG/dist/"
  exit 1
fi

BL_FAILURES=""
[ -f "$BL_GUIDE" ] || BL_FAILURES="$BL_FAILURES\n        ~/.reap/reap-guide.md missing — CLAUDE.md imports it by path"
BL_GOT_CMDS=$(count_matching "$BL_CMD_DIR" '^reap\..*\.md$')
[ "$BL_GOT_CMDS" = "$BL_WANT_CMDS" ] || BL_FAILURES="$BL_FAILURES\n        ~/.claude/commands/: $BL_GOT_CMDS of $BL_WANT_CMDS reap.*.md — /reap.* unavailable"
BL_GOT_AGENTS=$(count_matching "$BL_AGENT_DIR" '^reap-.*\.md$')
[ "$BL_GOT_AGENTS" = "$BL_WANT_AGENTS" ] || BL_FAILURES="$BL_FAILURES\n        ~/.claude/agents/: $BL_GOT_AGENTS of $BL_WANT_AGENTS reap-*.md — no evolve/evaluate agent"
grep -q "reap load-context" "$BL_HOME/.claude/settings.json" 2>/dev/null \
  || BL_FAILURES="$BL_FAILURES\n        ~/.claude/settings.json has no SessionStart hook — no dynamic context"

if [ -n "$BL_FAILURES" ]; then
  red "  FAIL  a blocked install stays broken after the user's first command"
  echo
  printf '%b\n' "$BL_FAILURES"
  echo
  dim "        The binary works and the integration does not. Nothing tells the"
  dim "        user, and the documented next step (/reap.init) is one of the"
  dim "        files that did not get installed."
  exit 1
fi
green "  ok    the first reap command restores all user-level assets"

# ── 7. The other client: can OpenCode read what REAP wrote for it? ──────────
#
# Everything above runs as a claude-code project, because that is what
# `reap init` produces. The OpenCode path is written by the same installer and
# was never exercised — which is how gen-080 shipped agent definitions carrying
# Claude Code's frontmatter. OpenCode validates its configuration all or
# nothing, so that single unreadable file took every `opencode` command down
# until it was deleted, and reinstalling REAP put it back.
#
# Asking OpenCode itself is the point. Validating the frontmatter against a
# copy of OpenCode's schema kept here would be one more place holding a fact
# that lives somewhere else, and it would drift exactly like #21 and #22 did.
#
# No model is involved: `agent list` parses configuration and exits. It needs
# no credentials and no network, so unlike the agent-integration check this one
# is free and belongs in CI.
echo
echo "Checking the OpenCode client..."

if ! command -v opencode >/dev/null 2>&1; then
  amber "  SKIP  opencode not found — the OpenCode client was NOT verified"
  dim "        npm i -g opencode-ai (or https://opencode.ai/install) to run it."
  echo
  green "Self-diagnosis passed for v$PKG_VERSION (OpenCode skipped)."
  exit 0
fi

dim "  against opencode $(opencode --version 2>/dev/null | head -1)"

# A separate HOME so the claude-code diagnosis above is left as it was, and so
# the developer's own ~/.config/opencode is neither read nor written. One
# variable isolates both directions: reap resolves its install path from $HOME,
# and opencode resolves its config from $HOME too (measured, not assumed —
# bun's in-process os.homedir() ignores $HOME, but opencode runs as its own
# process, so it follows).
OC_HOME=$(mktemp -d)
OC_PROJECT=$(mktemp -d)
(cd "$OC_PROJECT" && git init -q && git config user.email "self@check" && git config user.name "Self Check")

if ! (cd "$OC_PROJECT" && HOME="$OC_HOME" "$REAP_BIN" init octest >/dev/null 2>&1); then
  red "  FAIL  reap init failed for the OpenCode project"
  exit 1
fi

# `reap init` writes claude-code; switching the config is the supported way to
# choose a client, and it is that path this check covers.
if ! sed -i.bak 's/^agentClient:.*/agentClient: opencode/' "$OC_PROJECT/.reap/config.yml"; then
  red "  FAIL  could not switch agentClient to opencode"
  exit 1
fi
rm -f "$OC_PROJECT/.reap/config.yml.bak"

OC_INSTALL=$(cd "$OC_PROJECT" && HOME="$OC_HOME" "$REAP_BIN" install-skills 2>&1)
if [ $? -ne 0 ]; then
  red "  FAIL  install-skills failed for agentClient: opencode"
  echo "$OC_INSTALL" | head -5 | while IFS= read -r line; do dim "        $line"; done
  exit 1
fi
green "  ok    installed as an OpenCode project"

OC_OUT=$(cd "$OC_PROJECT" && HOME="$OC_HOME" opencode agent list 2>&1)
OC_STATUS=$?

if [ $OC_STATUS -ne 0 ]; then
  red "  FAIL  OpenCode rejects the configuration REAP just wrote"
  echo
  echo "$OC_OUT" | head -6 | while IFS= read -r line; do dim "        $line"; done
  echo
  dim "        One file OpenCode cannot parse invalidates the whole config, so"
  dim "        installing REAP would leave the user with no working opencode"
  dim "        command at all. That is gen-080."
  dim "        If REAP's agent files did not change, OpenCode's schema may have."
  exit 1
fi

# Exiting 0 is not enough on its own: `agent list` succeeds with no REAP agents
# at all, reporting only the built-ins. A check that stops at the exit code
# would pass an install that wrote nothing.
for agent in reap-evolve reap-evaluate; do
  if ! grep -q "$agent" <<< "$OC_OUT"; then
    red "  FAIL  OpenCode accepted the config but does not list $agent"
    echo
    dim "        REAP reported: $(echo "$OC_INSTALL" | node -e '
      let raw=""; process.stdin.on("data",d=>raw+=d).on("end",()=>{
        try { console.log(JSON.parse(raw).message || "(no message)"); }
        catch { console.log("(unparseable install-skills output)"); }
      });')"
    dim "        $OC_HOME/.config/opencode/agent/ contains:"
    if [ -d "$OC_HOME/.config/opencode/agent" ]; then
      ls -1 "$OC_HOME/.config/opencode/agent" 2>/dev/null | while IFS= read -r f; do dim "          $f"; done
      [ -z "$(ls -A "$OC_HOME/.config/opencode/agent" 2>/dev/null)" ] && dim "          (empty)"
    else
      dim "          (directory does not exist)"
    fi
    echo
    dim "        opencode listed:"
    echo "$OC_OUT" | grep -E "^[a-zA-Z].*\((primary|subagent)\)" | while IFS= read -r line; do dim "          $line"; done
    echo
    echo
    dim "        XDG_CONFIG_HOME=${XDG_CONFIG_HOME:-<unset>}"
    dim "        HOME (for opencode)=$OC_HOME"
    echo
    dim "        REAP resolves its install path from HOME, while OpenCode reads"
    dim "        XDG_CONFIG_HOME when that is set. If the two disagree above,"
    dim "        REAP is writing where this client does not look."
    exit 1
  fi
done
green "  ok    OpenCode loads reap-evolve and reap-evaluate"

# ── 8. Uninstall: does removing REAP actually remove it? ───────────────────
#
# npm runs no code at uninstall time. `preuninstall` and `postuninstall` are in
# its documentation and fire in neither npm 10 nor npm 12, global or local;
# the same probe script fired on install, so the absence proved itself. So
# `npm uninstall -g @c-d-cc/reap` removes the package directory and the bin
# symlink and leaves everything REAP wrote to the home directory exactly where
# it was — including the SessionStart hooks, which then invoke a command that
# is no longer installed on every session the user starts.
#
# `reap uninstall` is the answer, and this is the only place its npm step can
# be run for real. Everything below section 2 has an isolated global prefix;
# the unit tests can assert which arguments npm WOULD be given but never a
# global install actually disappearing, and the e2e tests run from a source
# checkout, where the command deliberately refuses to touch npm at all. Left
# unexercised, that step would be the shape gen-084 named: working, and named
# by no gate and no test.
#
# `npm_config_prefix` is what makes the isolation hold. `reap uninstall` asks
# npm where its global root is and only proceeds when the package it is running
# from is inside it, so without this the answer would be the developer's real
# root, the install would be judged "not global", and the section would pass
# while testing nothing.
#
# Removal is asserted only after the command has proved it ran: an exit code, a
# `status` of ok, and a removed count that is a number greater than zero. A
# crash, a renamed field or a usage error all produce an empty directory too.
#
# And survival is asserted beside it. A section that only checks that things are
# gone is passed just as well by a command that deletes the user's home
# directory.
UN_HOME=$(mktemp -d)
UN_PREFIX=$(mktemp -d)
echo
echo "Checking uninstall..."

# PATH as in section 2 — otherwise REAP's postinstall replaces this install
# with the published version, and the command under test is not the one built.
if ! HOME="$UN_HOME" PATH="$UN_PREFIX/bin:$PATH" \
     npm i -g --prefix "$UN_PREFIX" "$ROOT/$TARBALL" >/dev/null 2>&1; then
  red "  FAIL  global install for the uninstall check failed"
  exit 1
fi
UN_INSTALLED_SHA=$(shasum -a 256 "$UN_PREFIX/lib/node_modules/@c-d-cc/reap/dist/cli/index.js" 2>/dev/null | cut -d" " -f1)
if [ "$UN_INSTALLED_SHA" != "$PACKED_SHA" ]; then
  red "  FAIL  the uninstall check installed something other than the packed artifact"
  dim "        packed: $PACKED_SHA  installed: ${UN_INSTALLED_SHA:-<none>}"
  exit 1
fi
UN_BIN="$UN_PREFIX/bin/reap"
UN_PKG="$UN_PREFIX/lib/node_modules/@c-d-cc/reap"
UN_CMDS="$UN_HOME/.claude/commands"
UN_AGENTS="$UN_HOME/.claude/agents"
UN_SETTINGS="$UN_HOME/.claude/settings.json"

# Things that belong to the user, planted in the same directories REAP writes
# to. `reapdev.*` is in there because it is the near miss: REAP's own repo keeps
# its development commands under that name and the only thing separating it
# from `reap.*` is the dot.
mkdir -p "$UN_CMDS" "$UN_AGENTS" "$UN_HOME/.reap"
printf 'mine\n'    > "$UN_CMDS/my-command.md"
printf 'devtool\n' > "$UN_CMDS/reapdev.publish.md"
printf 'agent\n'   > "$UN_AGENTS/my-agent.md"
printf 'secret\n'  > "$UN_HOME/.reap/my-private-key.pem"

# `~/.reap/daemon/` — stale data on machines that carry it, and one of the
# entries `REAP_HOME_ENTRIES` allowlists for removal. Nothing here creates it,
# so without planting it the later "it is gone" check could not fail: it would
# be asserting the absence of something that never existed.
mkdir -p "$UN_HOME/.reap/daemon/indexes"
printf '{}\n' > "$UN_HOME/.reap/daemon/registry.json"

# A SessionStart hook of the user's own, in the same array REAP writes into.
if ! node -e '
  const fs = require("fs");
  const p = process.argv[1];
  const s = JSON.parse(fs.readFileSync(p, "utf-8"));
  s.hooks.SessionStart.push({ matcher: "", hooks: [{ type: "command", command: "my-own-thing" }] });
  fs.writeFileSync(p, JSON.stringify(s, null, 2) + "\n");
' "$UN_SETTINGS" 2>/dev/null; then
  red "  FAIL  could not plant a user hook — is $UN_SETTINGS what the installer wrote?"
  exit 1
fi

# The condition, before anything is removed. Every later absence is only
# meaningful against these.
UN_CMDS_BEFORE=$(ls -1 "$UN_CMDS" 2>/dev/null | grep -c '^reap\.' || true)
UN_AGENTS_BEFORE=$(ls -1 "$UN_AGENTS" 2>/dev/null | grep -c '^reap-' || true)
if [ "$UN_CMDS_BEFORE" -lt 1 ] || [ "$UN_AGENTS_BEFORE" -lt 1 ]; then
  red "  FAIL  nothing to uninstall — install placed $UN_CMDS_BEFORE commands, $UN_AGENTS_BEFORE agents"
  exit 1
fi
for before in "$UN_HOME/.reap/reap-guide.md" "$UN_HOME/.reap/.install-stamp"; do
  if [ ! -f "$before" ]; then
    red "  FAIL  nothing to uninstall — $before absent before the run"
    exit 1
  fi
done
if [ ! -d "$UN_PKG" ] || [ ! -d "$UN_HOME/.reap/daemon" ] || [ ! -e "$UN_BIN" ]; then
  red "  FAIL  nothing to uninstall — package dir, ~/.reap/daemon or bin link absent before the run"
  exit 1
fi
green "  ok    installed state to remove ($UN_CMDS_BEFORE commands, $UN_AGENTS_BEFORE agents)"

set +e
UN_OUT=$(cd "$UN_HOME" && HOME="$UN_HOME" npm_config_prefix="$UN_PREFIX" \
  "$UN_BIN" uninstall --confirm 2>&1)
UN_CODE=$?
set -e

if [ "$UN_CODE" -ne 0 ]; then
  red "  FAIL  reap uninstall --confirm exited $UN_CODE"
  dim "        $UN_OUT"
  exit 1
fi

# What the command says it did, before looking at what is on disk.
UN_VERDICT=$(node -e '
  let raw = ""; process.stdin.on("data", d => raw += d).on("end", () => {
    let o; try { o = JSON.parse(raw); } catch { console.log("unparseable"); return; }
    const n = o.context && o.context.removedCount;
    const npmRan = o.context && o.context.npm && o.context.npm.executed;
    if (o.status !== "ok") { console.log("status:" + o.status); return; }
    if (typeof n !== "number" || n < 1) { console.log("removedCount:" + JSON.stringify(n)); return; }
    if (npmRan !== true) { console.log("npm-not-executed:" + JSON.stringify(o.context.npm)); return; }
    console.log("ok:" + n);
  });' <<< "$UN_OUT")

case "$UN_VERDICT" in
  ok:*) ;;
  *)
    red "  FAIL  uninstall did not report a completed removal ($UN_VERDICT)"
    dim "        $UN_OUT"
    exit 1
    ;;
esac
green "  ok    uninstall ran and reported ${UN_VERDICT#ok:} removals"

# Gone.
UN_CMDS_AFTER=$(ls -1 "$UN_CMDS" 2>/dev/null | grep -c '^reap\.' || true)
UN_AGENTS_AFTER=$(ls -1 "$UN_AGENTS" 2>/dev/null | grep -c '^reap-' || true)
if [ "$UN_CMDS_AFTER" -ne 0 ] || [ "$UN_AGENTS_AFTER" -ne 0 ]; then
  red "  FAIL  slash commands or agents survived ($UN_CMDS_AFTER commands, $UN_AGENTS_AFTER agents)"
  exit 1
fi
if [ -f "$UN_HOME/.reap/reap-guide.md" ] || [ -f "$UN_HOME/.reap/.install-stamp" ] || [ -d "$UN_HOME/.reap/daemon" ]; then
  red "  FAIL  ~/.reap/ still holds REAP's own files"
  ls -1a "$UN_HOME/.reap" | while IFS= read -r f; do dim "        $f"; done
  exit 1
fi
if grep -q "reap check-version\|reap load-context" "$UN_SETTINGS" 2>/dev/null; then
  red "  FAIL  settings.json still calls REAP on every session"
  dim "        $(cat "$UN_SETTINGS")"
  exit 1
fi
if [ -d "$UN_PKG" ]; then
  red "  FAIL  the package itself is still installed at $UN_PKG"
  exit 1
fi
# The symlink is what `reap` on PATH resolves to; a package directory removed
# while the link survives leaves a broken command rather than no command.
if [ -e "$UN_BIN" ] || [ -L "$UN_BIN" ]; then
  red "  FAIL  the bin link survived at $UN_BIN"
  exit 1
fi
green "  ok    every REAP surface is gone, including the package"

# Kept.
for survivor in "$UN_CMDS/my-command.md" "$UN_CMDS/reapdev.publish.md" \
                "$UN_AGENTS/my-agent.md" "$UN_HOME/.reap/my-private-key.pem"; do
  if [ ! -f "$survivor" ]; then
    red "  FAIL  uninstall removed something that was not REAP's: $survivor"
    exit 1
  fi
done
if ! grep -q "my-own-thing" "$UN_SETTINGS" 2>/dev/null; then
  red "  FAIL  uninstall removed the user's own SessionStart hook"
  dim "        $(cat "$UN_SETTINGS" 2>/dev/null || echo '(settings.json is gone)')"
  exit 1
fi
green "  ok    the user's own files and hooks survived"


echo
green "Self-diagnosis passed for v$PKG_VERSION."
