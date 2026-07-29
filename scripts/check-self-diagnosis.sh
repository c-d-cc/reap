#!/usr/bin/env bash
# Install REAP the way a user would, then ask REAP whether the result is healthy.
#
# Why this exists (gen-078): issue #21 and #22 were both "one fact, several
# places, only some updated", and both were reported by an outside user rather
# than caught here. #22 in particular was visible to any run of `fix --check` —
# 19 warnings, for six generations — but the output was noisy enough that
# whoever looked filtered for the lines they cared about.
#
# This turns that into a gate: install from the actual publish artifact and
# require a clean bill of health. Three past incidents fail against it —
#   - #22            : install-skills wrote where fix --check called legacy
#   - gen-074 daemon : `files` omitted daemon/, leaving a broken symlink
#   - gen-080        : agent files OpenCode could not parse (see part 2)
#
# Part 2 exists because the first three checks all ask the same question of one
# client. REAP claims to support two, and `reap init` only ever exercises the
# default — so the OpenCode path reached users unverified, and gen-080 took
# their whole OpenCode install offline.
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
cleanup() {
  [ -n "$FAKE_HOME" ]  && rm -rf "$FAKE_HOME"
  [ -n "$PREFIX" ]     && rm -rf "$PREFIX"
  [ -n "$PROJECT" ]    && rm -rf "$PROJECT"
  [ -n "$OC_HOME" ]    && rm -rf "$OC_HOME"
  [ -n "$OC_PROJECT" ] && rm -rf "$OC_PROJECT"
  [ -n "$TARBALL" ] && [ -f "$ROOT/$TARBALL" ] && rm -f "$ROOT/$TARBALL"
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
if ! HOME="$FAKE_HOME" npm i -g --prefix "$PREFIX" "$ROOT/$TARBALL" >/dev/null 2>&1; then
  red "  FAIL  global install failed"
  dim "        HOME=$FAKE_HOME PREFIX=$PREFIX"
  exit 1
fi

REAP_BIN="$PREFIX/bin/reap"
if [ ! -x "$REAP_BIN" ]; then
  red "  FAIL  reap binary missing at $REAP_BIN"
  exit 1
fi
green "  ok    installed"

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

# ── 5. The other client: can OpenCode read what REAP wrote for it? ──────────
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

if ! (cd "$OC_PROJECT" && HOME="$OC_HOME" "$REAP_BIN" install-skills >/dev/null 2>&1); then
  red "  FAIL  install-skills failed for agentClient: opencode"
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
    echo "$OC_OUT" | head -12 | while IFS= read -r line; do dim "        $line"; done
    echo
    dim "        The configuration parses, so REAP either wrote nothing or wrote"
    dim "        somewhere OpenCode does not look."
    exit 1
  fi
done
green "  ok    OpenCode loads reap-evolve and reap-evaluate"

echo
green "Self-diagnosis passed for v$PKG_VERSION."
