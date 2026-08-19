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
#   - gen-074 daemon : shipped a daemon nobody could use (section 5)
#   - npm 12 default : install scripts blocked, no integration at all (section 6)
#   - gen-080        : agent files OpenCode could not parse (section 7)
#
# The daemon entry was false when it was written (gen-078) and stayed false for
# five generations. It claimed the gate caught the packaging defect; the gate
# only ever checked that installation succeeded and that `fix --check` was
# quiet, and the defective install did both. CI was green the whole time with
# the defect live. gen-083 added section 5 and confirmed it fails against the
# unfixed code before fixing anything — the claim is now earned rather than
# asserted.
#
# The lesson is in the ordering. A coverage claim written alongside a check that
# was never run against the broken state is a guess, and this file is read by
# whoever is deciding what still needs testing.
#
# Sections 5 through 7 exist because the first checks all ask the same question
# of one client, one package and one way of installing. REAP claims to support
# two clients and ships a second package; `reap init` exercises neither — so the
# OpenCode path reached users unverified and took their whole OpenCode install
# offline (gen-080), and the daemon reached users as a dangling symlink. Section
# 6 adds the third axis: sections 2 through 5 all install with scripts allowed,
# which npm 12 no longer does by default.
#
# Isolation is not optional. `install-skills` writes 19 files to
# ~/.claude/commands/ and postinstall touches ~/.reap/ and
# ~/.claude/settings.json, so an unisolated run would overwrite the developer's
# own setup. CI runners are disposable, but the same script has to be safe to
# run locally or nobody will run it before pushing.
#
# One exception, stated rather than hidden: section 5 rebuilds the daemon, which
# deletes and recreates daemon/dist in the working tree. It is a gitignored build
# output and `npm run build -w daemon` recreates it, so nothing is lost — but a
# local run does touch the checkout, unlike everything else here.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

red()   { printf '\033[31m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }
amber() { printf '\033[33m%s\033[0m\n' "$1"; }
dim()   { printf '\033[2m%s\033[0m\n' "$1"; }

FAKE_HOME=""; PREFIX=""; PROJECT=""; TARBALL=""
OC_HOME=""; OC_PROJECT=""
DM_HOME=""; DM_INSTALL=""; DM_PROJECT=""; DM_TARBALL=""; DM_PID=""
BL_HOME=""; BL_PREFIX=""; BL_PROJECT=""
UN_HOME=""; UN_PREFIX=""
cleanup() {
  [ -n "$DM_PID" ] && kill "$DM_PID" 2>/dev/null
  [ -n "$FAKE_HOME" ]  && rm -rf "$FAKE_HOME"
  [ -n "$PREFIX" ]     && rm -rf "$PREFIX"
  [ -n "$PROJECT" ]    && rm -rf "$PROJECT"
  [ -n "$OC_HOME" ]    && rm -rf "$OC_HOME"
  [ -n "$OC_PROJECT" ] && rm -rf "$OC_PROJECT"
  [ -n "$DM_HOME" ]    && rm -rf "$DM_HOME"
  [ -n "$DM_INSTALL" ] && rm -rf "$DM_INSTALL"
  [ -n "$DM_PROJECT" ] && rm -rf "$DM_PROJECT"
  [ -n "$DM_TARBALL" ] && [ -f "$ROOT/daemon/$DM_TARBALL" ] && rm -f "$ROOT/daemon/$DM_TARBALL"
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

# ── 5. The daemon: is what we publish something that actually works? ────────
#
# Everything above verifies files landing in the right place. The daemon fails
# a level lower: it was declared as `file:./daemon`, packed into nothing, and
# never published — so `daemon: true` installed a broken symlink and every call
# site swallowed the failure. Nothing in a source tree can see that, because in
# a source tree the dependency resolves.
#
# So this section refuses to look at the source tree at all. It packs the daemon
# the way it would be published, installs it as a stranger would, and runs it
# under **node** — not bun. Running under bun hid two separate defects for three
# generations: bun resolved the native sqlite binding that node could not, and
# nobody ever ran the bundle rather than the sources.
#
# The assertion is symbols, not startup. A daemon that starts, answers /health
# and reports a successful index while extracting zero symbols is exactly the
# state this defect left behind, and every weaker check passes it.
#
# 5e is here because the rest of this section tests the two packages apart, and
# splitting them is precisely what created a seam between them. "reap does not
# ship it", "a missing one is reported" and "it works standalone" are all true
# in a world where users install both and still get nothing, so the last step
# installs them side by side and makes reap do the finding.
#
# Kept deliberately self-contained: its own HOME, its own port, its own install
# directory, no state shared with the sections above. That is what keeps a
# retreat cheap if the cost turns out to hurt — the section can be moved to the
# release workflow by deleting one call, with nothing to untangle.
#
# There is deliberately no environment variable to skip it. An escape hatch
# shipped alongside a brand-new gate blunts it before anyone has measured a
# reason to, and the reason it would exist has not happened: the cost is NOT
# measured, but "unmeasured" is not "too slow". Locally the install takes ~2s
# against a warm cache, and better-sqlite3 is installed twice (5c and 5e), so a
# runner unable to fetch a prebuild compiles it twice. If that proves painful,
# measure it and move the section — do not leave a switch that turns the check
# off while still reporting a pass.
echo
echo "Checking the daemon..."

# 5a. reap must not carry the daemon. A `file:` dependency on a directory that
#     is not in `files` is what produced the broken symlink; either half alone
#     is harmless, so both are checked.
# The listing is read once into a variable, never piped into grep. `grep -q`
# leaves at its first match while tar is still writing, and under `pipefail`
# that SIGPIPE turns a matched grep into a failed pipeline. Here that would be
# silent: the `if` would read false and the check would report a clean tarball
# precisely when daemon/ is in it. Same shape as the pipefail defect gen-083
# found in 5a-bis; this is the rest of that class.
REAP_LISTING=$(tar -tzf "$ROOT/$TARBALL")
if grep -q "package/daemon/" <<< "$REAP_LISTING"; then
  red "  FAIL  the reap tarball contains daemon/ — it is meant to be a separate package"
  exit 1
fi

REAP_DEPS=$(node -e '
  const {execSync} = require("child_process");
  const t = process.argv[1];
  const out = execSync(`tar -xzOf ${JSON.stringify(t)} package/package.json`, {encoding:"utf-8"});
  console.log(Object.keys(JSON.parse(out).dependencies || {}).join(" "));
' "$ROOT/$TARBALL")

if grep -q "reap-daemon" <<< "$REAP_DEPS"; then
  red "  FAIL  the reap tarball still depends on @c-d-cc/reap-daemon"
  dim "        dependencies: $REAP_DEPS"
  dim "        npm creates a symlink for a file: dependency whether or not the"
  dim "        target ships. That link is what users got instead of a daemon."
  exit 1
fi
green "  ok    reap ships without the daemon ($REAP_DEPS)"

# 5a-bis. The published bundle must not contain the path it was built from.
#
# `bun build` replaces a bare `__dirname` with a string literal fixed at build
# time, so v0.17.4 shipped this developer's checkout path to every user, and the
# code that consulted it looked into a directory that existed on exactly one
# machine. Nothing noticed for three generations, because on that machine the
# path was correct.
#
# Checked here rather than left to the behavioural assertions below, which catch
# it only by accident: with the daemon properly installed `require.resolve`
# succeeds and the baked path is never consulted, so a run on any machine other
# than the one that built it would go green with the defect present.
# Extracted to a variable rather than piped: `set -o pipefail` is in force, and
# `grep -q` exits at the first match, which hands tar a SIGPIPE. The pipeline
# then reports tar's failure, the `if` reads false, and a match becomes a pass.
# The first negative test of this very assertion caught that — which is the
# argument for running one.
BUNDLE=$(tar -xzOf "$ROOT/$TARBALL" package/dist/cli/index.js)
if grep -qF "$ROOT" <<< "$BUNDLE"; then
  red "  FAIL  the reap bundle contains the path it was built from"
  echo
  grep -oF "$ROOT" <<< "$BUNDLE" | head -1 | while IFS= read -r line; do dim "        $line"; done
  echo
  dim "        A user's copy would look for files under a directory that only"
  dim "        exists here. Resolve from import.meta.url, which survives"
  dim "        bundling, rather than the bare __dirname, which does not."
  exit 1
fi
unset BUNDLE
green "  ok    the bundle carries no build-machine paths"

# 5b. An installed reap must say so when the daemon it was told to use is
#     absent. This runs against the isolated project from section 3 — a real
#     global install, not the source tree — because in the source tree the
#     daemon resolves from the checkout beside it and the case cannot occur.
cp "$PROJECT/.reap/config.yml" "$PROJECT/.reap/config.yml.orig"
cp "$PROJECT/.reap/config.yml" "$PROJECT/.reap/config.yml.orig2"
printf '\ndaemon: true\n' >> "$PROJECT/.reap/config.yml"
DM_FINDINGS=$(cd "$PROJECT" && HOME="$FAKE_HOME" "$REAP_BIN" fix --check 2>/dev/null | node -e '
  let raw=""; process.stdin.on("data",d=>raw+=d).on("end",()=>{
    let ctx={}; try { ctx=(JSON.parse(raw).context)||{}; } catch {}
    console.log((ctx.warnings||[]).join("\n"));
  });')
mv "$PROJECT/.reap/config.yml.orig" "$PROJECT/.reap/config.yml"

if ! grep -q "reap-daemon" <<< "$DM_FINDINGS"; then
  red "  FAIL  'daemon: true' with no daemon installed produces no warning"
  echo
  dim "        warnings were: ${DM_FINDINGS:-(none)}"
  echo
  dim "        This is the state every npm user was in. Saying nothing about it"
  dim "        is how it survived three generations."
  exit 1
fi
# `fix --check` is not the only channel. `reap daemon status` phrases this
# separately, and until gen-084 nothing ran that branch — not the gate, not a
# test. It said what it should, but only inspection said so, which is the shape
# of evidence gen-083 was caught recording as if it were a run.
printf '\ndaemon: true\n' >> "$PROJECT/.reap/config.yml"
DM_ST_MISSING=$(cd "$PROJECT" && HOME="$FAKE_HOME" "$REAP_BIN" daemon status 2>&1)
cp "$PROJECT/.reap/config.yml.orig2" "$PROJECT/.reap/config.yml"
if ! grep -q "not installed" <<< "$DM_ST_MISSING"; then
  red "  FAIL  'daemon status' does not say the daemon is missing"
  echo
  echo "$DM_ST_MISSING" | head -6 | while IFS= read -r line; do dim "        $line"; done
  exit 1
fi
if ! grep -q "resolution roots" <<< "$DM_ST_MISSING"; then
  red "  FAIL  'daemon status' does not say what to do if it IS installed"
  echo
  echo "$DM_ST_MISSING" | head -6 | while IFS= read -r line; do dim "        $line"; done
  echo
  dim "        Someone whose reap and daemon are in different resolution roots"
  dim "        reads 'not installed' about software they installed. Without the"
  dim "        way out, that is where they stop."
  exit 1
fi
green "  ok    a missing daemon is reported, not swallowed — by both channels"

# 5c. Pack and install the daemon on its own, as a user would.
#
# Built here rather than assumed: daemon/dist is gitignored and no workflow
# produces it, so packing without this step ships a tarball with no entry point
# — and the check would have passed only on a machine where someone had run the
# build by hand. That is the same "works in my tree" this section exists to end,
# reproduced inside the section itself.
if ! (cd "$ROOT/daemon" && npm run build >/dev/null 2>&1); then
  red "  FAIL  building the daemon failed"
  exit 1
fi

DM_TARBALL=$(cd "$ROOT/daemon" && npm pack --silent 2>/dev/null | tail -1)
if [ -z "$DM_TARBALL" ] || [ ! -f "$ROOT/daemon/$DM_TARBALL" ]; then
  red "  FAIL  npm pack produced no daemon tarball"
  exit 1
fi

DM_LISTING=$(tar -tzf "$ROOT/daemon/$DM_TARBALL")
if ! grep -q "package/queries/" <<< "$DM_LISTING"; then
  red "  FAIL  the daemon tarball has no queries/ — it cannot parse anything without them"
  exit 1
fi

DM_INSTALL=$(mktemp -d)
DM_HOME=$(mktemp -d)
(cd "$DM_INSTALL" && npm init -y >/dev/null 2>&1)
if ! (cd "$DM_INSTALL" && npm i --silent --no-audit --no-fund "$ROOT/daemon/$DM_TARBALL" >/dev/null 2>&1); then
  red "  FAIL  installing the daemon tarball failed"
  exit 1
fi
green "  ok    daemon installs standalone"

# 5d. Run the installed bundle under node and ask it to index real source.
DM_BIN="$DM_INSTALL/node_modules/@c-d-cc/reap-daemon/dist/index.js"
if [ ! -f "$DM_BIN" ]; then
  red "  FAIL  the installed daemon has no dist/index.js"
  exit 1
fi

DM_PORT=17296
DM_PROJECT=$(mktemp -d)
mkdir -p "$DM_PROJECT/src"
cat > "$DM_PROJECT/src/sample.ts" <<'SAMPLE'
export function selfDiagnosisMarker(n: number): number {
  return n + 1;
}
export class SelfDiagnosisFixture {
  run(): number { return selfDiagnosisMarker(1); }
}
SAMPLE
(cd "$DM_PROJECT" && git init -q -b main && git config user.email "self@check" \
  && git config user.name "Self Check" && git add -A && git commit -qm fixture)

HOME="$DM_HOME" REAP_DAEMON_PORT="$DM_PORT" node "$DM_BIN" > "$DM_HOME/daemon.log" 2>&1 &
DM_PID=$!

DM_UP=""
for _ in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:$DM_PORT/health" >/dev/null 2>&1; then DM_UP=1; break; fi
  sleep 0.5
done
if [ -z "$DM_UP" ]; then
  red "  FAIL  the installed daemon did not come up under node"
  echo
  head -20 "$DM_HOME/daemon.log" 2>/dev/null | while IFS= read -r line; do dim "        $line"; done
  echo
  dim "        node, not bun, on purpose. detectRuntime() prefers bun but falls"
  dim "        back to node, so a bundle only bun can load is broken for anyone"
  dim "        without bun installed."
  exit 1
fi

DM_REG=$(curl -s -X POST "http://127.0.0.1:$DM_PORT/projects/register" \
  -H 'Content-Type: application/json' \
  -d "{\"path\":\"$DM_PROJECT\",\"name\":\"selfcheck\"}")
DM_ID=$(node -e '
  let raw=""; process.stdin.on("data",d=>raw+=d).on("end",()=>{
    try { console.log(JSON.parse(raw).data.id); } catch { console.log(""); }
  });' <<< "$DM_REG")

if [ -z "$DM_ID" ]; then
  red "  FAIL  the daemon would not register a project"
  dim "        $DM_REG"
  exit 1
fi

DM_INDEX=$(curl -s -X POST "http://127.0.0.1:$DM_PORT/projects/$DM_ID/index")
DM_NODES=$(node -e '
  let raw=""; process.stdin.on("data",d=>raw+=d).on("end",()=>{
    try { const j=JSON.parse(raw); console.log(j.status === "ok" ? (j.data.nodesCreated ?? -1) : -1); }
    catch { console.log(-1); }
  });' <<< "$DM_INDEX")

# Zero is the failure this whole section exists for: indexing "succeeds" and
# produces nothing, because the bundle looks for its .scm queries one directory
# too far up. Treating a successful response as proof would pass it.
case "$DM_NODES" in ''|*[!0-9]*) DM_NODES=0 ;; esac
if [ "$DM_NODES" -le 0 ]; then
  red "  FAIL  the installed daemon extracted no symbols"
  echo
  dim "        index response: $DM_INDEX"
  echo
  dim "        It started, answered /health and reported success. A daemon in"
  dim "        this state is indistinguishable from a working one at every"
  dim "        level except the one that matters."
  exit 1
fi

DM_SYM=$(curl -s "http://127.0.0.1:$DM_PORT/projects/$DM_ID/symbols?q=selfDiagnosisMarker")
if ! grep -q "selfDiagnosisMarker" <<< "$DM_SYM"; then
  red "  FAIL  the daemon indexed $DM_NODES symbol(s) but cannot find a known one"
  dim "        $DM_SYM"
  exit 1
fi
green "  ok    installed daemon indexes and answers under node ($DM_NODES symbols)"

kill "$DM_PID" 2>/dev/null; DM_PID=""

# 5d-bis. The daemon is on this disk, works, and reap cannot see it.
#
#     Right here — after 5c installed the daemon into its own directory and 5d
#     proved that copy runs — the environment is in the exact state that broke
#     users: a working daemon present, and no path from reap's location to it.
#     5b already proved reap calls that state "not installed". So this is where
#     naming the location has to rescue it, and it costs nothing to arrange
#     because the two halves were built above for other reasons.
#
#     The state is not a stand-in for one package manager. Reaching it needs
#     only reap and the daemon in different resolution roots: a global reap with
#     a project-local daemon, two prefixes, a switched Node version. gen-083
#     recorded pnpm's default store and Yarn PnP as the cause "in principle";
#     gen-084 installed both and measured otherwise — pnpm isolates by symlink
#     layout rather than by replacing the resolver, and PnP's default fallback
#     admits the top-level project's dependencies. Testing against pnpm here
#     would have spent an install to check something that does not break.
#
#     Runs before 5e on purpose: 5e installs the daemon where reap can find it,
#     and after that this can no longer be asked. The config is restored on the
#     way out so 5e still starts from a project with no daemon settings — an
#     assertion of 5e's would otherwise pass because of a leftover from here.

# Parse `fix --check` and refuse to confuse silence with success.
#
# Every assertion below is of the form "the complaint is gone", and absence is
# also what a crash, an unparseable line or a renamed field look like. gen-083
# shipped exactly that hole in 5e. So the output must prove it is an answer —
# `status` plus a numeric `warningCount` — before its content means anything.
dm_fix_verdict() {
  node -e '
    let raw=""; process.stdin.on("data",d=>raw+=d).on("end",()=>{
      let out;
      try { out = JSON.parse(raw); } catch { console.log("BAD_JSON"); return; }
      const ctx = out.context || {};
      if (out.status !== "ok" || typeof ctx.warningCount !== "number") {
        console.log("BAD_SHAPE"); return;
      }
      console.log("OK\n" + (ctx.warnings || []).join("\n"));
    });'
}

dm_require_verdict() {
  # $1 = verdict text, $2 = what was being checked
  case "$1" in
    BAD_JSON|BAD_SHAPE)
      red "  FAIL  fix --check gave no usable answer while $2 ($1)"
      exit 1
      ;;
  esac
}

cp "$PROJECT/.reap/config.yml" "$PROJECT/.reap/config.yml.orig3"

# (a) A named location is used, and the complaint stops.
printf '\ndaemon: true\ndaemonBin: %s\n' "$DM_BIN" >> "$PROJECT/.reap/config.yml"
DM_NAMED=$(cd "$PROJECT" && HOME="$FAKE_HOME" "$REAP_BIN" fix --check 2>/dev/null | dm_fix_verdict)
dm_require_verdict "$DM_NAMED" "checking a named daemon location"
if grep -q "reap-daemon" <<< "$DM_NAMED"; then
  red "  FAIL  reap still reports the daemon as missing after being told where it is"
  echo
  dim "        daemonBin: $DM_BIN"
  echo "$DM_NAMED" | while IFS= read -r line; do dim "        $line"; done
  echo
  dim "        This is the whole point of the setting. Without it, anyone whose"
  dim "        reap and daemon live in different resolution roots is told"
  dim "        forever to install what they already have."
  exit 1
fi

# (b) And it is actually launched — resolving a path is not running one.
DM_NAMED_STATUS=$(cd "$PROJECT" && HOME="$FAKE_HOME" REAP_DAEMON_PORT=17292 \
  "$REAP_BIN" daemon status 2>&1)
if ! grep -q '"status": *"ok"' <<< "$DM_NAMED_STATUS"; then
  red "  FAIL  reap could not start the daemon it was pointed at"
  echo
  echo "$DM_NAMED_STATUS" | head -8 | while IFS= read -r line; do dim "        $line"; done
  exit 1
fi
# The user has no other way to confirm the setting took effect, so reap says
# which daemon it used and how it got there. A workaround you cannot verify is
# barely a workaround — and this also catches the setting being ignored while
# something else happened to satisfy the lookup.
if ! grep -q '"binSource": *"config"' <<< "$DM_NAMED_STATUS"; then
  red "  FAIL  the daemon started, but reap does not report using the named location"
  echo
  echo "$DM_NAMED_STATUS" | head -12 | while IFS= read -r line; do dim "        $line"; done
  exit 1
fi
(cd "$PROJECT" && HOME="$FAKE_HOME" REAP_DAEMON_PORT=17292 "$REAP_BIN" daemon stop >/dev/null 2>&1)

# (c) Again without bun. detectRuntime() prefers bun, so (b) proved this only
#     for machines that have it — the same asymmetry that let an inlined native
#     binding work under bun and fail under node for three generations.
DM_NOBUN="$DM_HOME/nobun"
mkdir -p "$DM_NOBUN"
printf '#!/bin/sh\nexit 127\n' > "$DM_NOBUN/bun"
chmod +x "$DM_NOBUN/bun"

DM_NAMED_NODE=$(cd "$PROJECT" && HOME="$FAKE_HOME" REAP_DAEMON_PORT=17291 \
  PATH="$DM_NOBUN:$PATH" "$REAP_BIN" daemon status 2>&1)
if ! grep -q '"status": *"ok"' <<< "$DM_NAMED_NODE"; then
  red "  FAIL  the named location works with bun but not without it"
  echo
  echo "$DM_NAMED_NODE" | head -8 | while IFS= read -r line; do dim "        $line"; done
  exit 1
fi
(cd "$PROJECT" && HOME="$FAKE_HOME" REAP_DAEMON_PORT=17291 PATH="$DM_NOBUN:$PATH" \
  "$REAP_BIN" daemon stop >/dev/null 2>&1)

# (d) The environment variable, with nothing in the config. This is the channel
#     for a CI job or a one-off command, and it has to work on its own — not
#     merely as an override of a config entry that is already correct.
cp "$PROJECT/.reap/config.yml.orig3" "$PROJECT/.reap/config.yml"
printf '\ndaemon: true\n' >> "$PROJECT/.reap/config.yml"
DM_ENV_STATUS=$(cd "$PROJECT" && HOME="$FAKE_HOME" REAP_DAEMON_PORT=17290 \
  REAP_DAEMON_BIN="$DM_BIN" "$REAP_BIN" daemon status 2>&1)
if ! grep -q '"status": *"ok"' <<< "$DM_ENV_STATUS"; then
  red "  FAIL  REAP_DAEMON_BIN did not get the daemon started"
  echo
  echo "$DM_ENV_STATUS" | head -8 | while IFS= read -r line; do dim "        $line"; done
  exit 1
fi
if ! grep -q '"binSource": *"env"' <<< "$DM_ENV_STATUS"; then
  red "  FAIL  the daemon started, but reap does not report using REAP_DAEMON_BIN"
  echo
  echo "$DM_ENV_STATUS" | head -12 | while IFS= read -r line; do dim "        $line"; done
  exit 1
fi
(cd "$PROJECT" && HOME="$FAKE_HOME" REAP_DAEMON_PORT=17290 REAP_DAEMON_BIN="$DM_BIN" \
  "$REAP_BIN" daemon stop >/dev/null 2>&1)

# ...and the fourth corner. The two channels differ only in where the string
# comes from, so this is cheap insurance rather than a suspicion — but the
# completion criterion says both channels on both runtimes, and three of four
# is not that. One extra spawn.
DM_ENV_NODE=$(cd "$PROJECT" && HOME="$FAKE_HOME" REAP_DAEMON_PORT=17289 \
  PATH="$DM_NOBUN:$PATH" REAP_DAEMON_BIN="$DM_BIN" "$REAP_BIN" daemon status 2>&1)
if ! grep -q '"status": *"ok"' <<< "$DM_ENV_NODE"; then
  red "  FAIL  REAP_DAEMON_BIN works with bun but not without it"
  echo
  echo "$DM_ENV_NODE" | head -8 | while IFS= read -r line; do dim "        $line"; done
  exit 1
fi
(cd "$PROJECT" && HOME="$FAKE_HOME" REAP_DAEMON_PORT=17289 PATH="$DM_NOBUN:$PATH" \
  REAP_DAEMON_BIN="$DM_BIN" "$REAP_BIN" daemon stop >/dev/null 2>&1)

# (e) A location that holds nothing must be named, not swallowed.
#
#     reap goes on searching after a miss, because config.yml is committed and a
#     path that is right on one machine may be absent on the next. That silence
#     would be the same defect one level along: an instruction followed to
#     nowhere, with no word about it.
cp "$PROJECT/.reap/config.yml.orig3" "$PROJECT/.reap/config.yml"
DM_GONE="$DM_HOME/not-a-daemon/dist/index.js"
printf '\ndaemon: true\ndaemonBin: %s\n' "$DM_GONE" >> "$PROJECT/.reap/config.yml"
DM_MISS=$(cd "$PROJECT" && HOME="$FAKE_HOME" "$REAP_BIN" fix --check 2>/dev/null | dm_fix_verdict)
dm_require_verdict "$DM_MISS" "checking a daemon location that does not exist"
if ! grep -q "$DM_GONE" <<< "$DM_MISS"; then
  red "  FAIL  a daemonBin pointing at nothing is not reported"
  echo
  dim "        daemonBin: $DM_GONE"
  echo "$DM_MISS" | while IFS= read -r line; do dim "        $line"; done
  echo
  dim "        The path has to appear, or the user is left comparing a generic"
  dim "        'not installed' against a setting they believe is correct."
  exit 1
fi

# (f) The likeliest way to write this setting wrong: naming the package instead
#     of its entry point. The path exists, so an existence check alone accepts
#     it — and then reap reports a healthy daemon that cannot start, with every
#     downstream diagnostic quiet. That is this generation's own defect one
#     level along, and the person most exposed to it is by definition someone
#     already unsure where the daemon lives.
cp "$PROJECT/.reap/config.yml.orig3" "$PROJECT/.reap/config.yml"
DM_PKGDIR="$DM_INSTALL/node_modules/@c-d-cc/reap-daemon"
printf '\ndaemon: true\ndaemonBin: %s\n' "$DM_PKGDIR" >> "$PROJECT/.reap/config.yml"
DM_DIR=$(cd "$PROJECT" && HOME="$FAKE_HOME" "$REAP_BIN" fix --check 2>/dev/null | dm_fix_verdict)
dm_require_verdict "$DM_DIR" "checking a daemon location that is a directory"
if ! grep -q "$DM_PKGDIR" <<< "$DM_DIR"; then
  red "  FAIL  a daemonBin naming a directory is accepted in silence"
  echo
  dim "        daemonBin: $DM_PKGDIR"
  echo "$DM_DIR" | while IFS= read -r line; do dim "        $line"; done
  echo
  dim "        A directory cannot be spawned. Treating it as found reports a"
  dim "        working daemon to a user who has none, and hands the agent a"
  dim "        query protocol for a port nothing is listening on."
  exit 1
fi

# (g) A named location holding a daemon that is too old. gen-085.
#
#     The advice for a stale daemon was `npm i -g @c-d-cc/reap-daemon` in all
#     three places that give it, unconditionally. That is wrong for exactly the
#     users the setting above exists for: reap goes on resolving the named path,
#     so the command changes nothing, the warning returns unchanged, and there is
#     no way to tell why. Someone follows correct-sounding advice forever.
#
#     gen-084 declined to fix it, reasoning that the branch could not be reached
#     — MIN_DAEMON_VERSION and the only published daemon are both 0.2.0 — and
#     that shipping a branch no test can execute is worse. The reasoning was
#     sound; the premise was not. daemon/package.json carried 0.1.0 until
#     gen-083, so any checkout from before then is a stale daemon, and making
#     the version comparison prerelease-aware in this same generation turned
#     every 0.2.0-x into one as well.
#
#     The package.json here is fabricated rather than a real old release, because
#     none was ever published. That is a real difference and it is worth naming:
#     what is being simulated is only where the version string comes from, and
#     resolveDaemonAvailability reads nothing else about the package. The
#     location is accepted without an identity check by design (gen-084: nothing
#     is accidental about a path someone wrote down) — an accepted limitation
#     that turns out to be what makes this testable at all.
cp "$PROJECT/.reap/config.yml.orig3" "$PROJECT/.reap/config.yml"
DM_STALE="$DM_HOME/stale-daemon"
mkdir -p "$DM_STALE/dist"
cat > "$DM_STALE/package.json" <<'STALEPKG'
{ "name": "@c-d-cc/reap-daemon", "version": "0.1.0", "main": "dist/index.js" }
STALEPKG
# Never started, so it need not be a daemon — the verdict is read off the
# manifest precisely so that `fix --check` can answer without spawning anything.
echo 'process.exit(0);' > "$DM_STALE/dist/index.js"
printf '\ndaemon: true\ndaemonBin: %s\n' "$DM_STALE/dist/index.js" >> "$PROJECT/.reap/config.yml"

DM_STALE_OUT=$(cd "$PROJECT" && HOME="$FAKE_HOME" "$REAP_BIN" fix --check 2>/dev/null | dm_fix_verdict)
dm_require_verdict "$DM_STALE_OUT" "checking a named daemon location that is out of date"

# It has to be recognised as stale at all — otherwise the two assertions below
# pass by describing a warning that was never emitted.
if ! grep -q "0.1.0" <<< "$DM_STALE_OUT"; then
  red "  FAIL  a daemon older than the floor at a named location is not reported"
  echo
  dim "        daemonBin: $DM_STALE/dist/index.js  (version 0.1.0)"
  echo "$DM_STALE_OUT" | while IFS= read -r line; do dim "        $line"; done
  exit 1
fi
if ! grep -q "$DM_STALE/dist/index.js" <<< "$DM_STALE_OUT"; then
  red "  FAIL  a stale daemon is reported without saying which copy is stale"
  echo
  echo "$DM_STALE_OUT" | while IFS= read -r line; do dim "        $line"; done
  echo
  dim "        The user has a global daemon and a named one. Without the path"
  dim "        they cannot tell which of them reap is talking about."
  exit 1
fi
if grep -q "npm i -g @c-d-cc/reap-daemon" <<< "$DM_STALE_OUT"; then
  red "  FAIL  a stale daemon at a named location is still met with the global upgrade command"
  echo
  echo "$DM_STALE_OUT" | while IFS= read -r line; do dim "        $line"; done
  echo
  dim "        reap will keep resolving daemonBin. Running that command changes"
  dim "        nothing and produces this same warning again — advice that cannot"
  dim "        work is worse than none, because it looks like it should."
  exit 1
fi

# And the CLI, which is a separate code path from `fix --check` and the one a
# user reaches by trying to make the daemon go.
DM_STALE_CLI=$(cd "$PROJECT" && HOME="$FAKE_HOME" REAP_DAEMON_PORT=17288 \
  "$REAP_BIN" daemon status 2>&1)
if ! grep -q "0.1.0" <<< "$DM_STALE_CLI"; then
  red "  FAIL  'reap daemon status' does not report the stale named daemon"
  echo
  echo "$DM_STALE_CLI" | head -8 | while IFS= read -r line; do dim "        $line"; done
  exit 1
fi
# The CLI does mention the global command — to say it would not help — so its
# presence proves nothing. What must be absent is the bare instruction, and what
# must be present is the path and the setting that chose it.
if grep -q "Upgrade with:" <<< "$DM_STALE_CLI"; then
  red "  FAIL  'reap daemon status' sends the user after a global upgrade that cannot help"
  echo
  echo "$DM_STALE_CLI" | head -8 | while IFS= read -r line; do dim "        $line"; done
  exit 1
fi
if ! grep -q "daemonBin" <<< "$DM_STALE_CLI"; then
  red "  FAIL  'reap daemon status' does not say which setting chose the stale daemon"
  echo
  echo "$DM_STALE_CLI" | head -8 | while IFS= read -r line; do dim "        $line"; done
  exit 1
fi

cp "$PROJECT/.reap/config.yml.orig3" "$PROJECT/.reap/config.yml"
rm -f "$PROJECT/.reap/config.yml.orig3"
green "  ok    a named daemon location is used, launched and verifiable — and a bad or stale one is named"

# 5e. The seam the split created: does an installed reap find an installed
#     daemon? Everything above tests the two packages apart — 5a that reap does
#     not carry the daemon, 5b that a missing one is reported, 5c/5d that the
#     daemon works on its own. All of that stays green in a world where users
#     install both and still get nothing, because none of it runs reap against a
#     present daemon. Splitting the packages is what created this gap, so it is
#     the one thing this section must not leave to inspection.
if ! HOME="$FAKE_HOME" npm i -g --prefix "$PREFIX" "$ROOT/daemon/$DM_TARBALL" >/dev/null 2>&1; then
  red "  FAIL  installing the daemon beside reap failed"
  exit 1
fi

# The warning from 5b must now be gone. Same project, same command, opposite
# answer — anything less proves only that reap can complain, not that it can
# stop complaining once the problem is fixed.
#
# Note the asymmetry with 5b, which asserts a warning is PRESENT. That one is
# self-proving: nothing can be found in output that was never produced. This
# asserts a warning is ABSENT, and absence is exactly what a crashed command,
# an unparseable line on stdout or a renamed field also look like. So the run
# has to prove itself first — `fix --check` reports `status` and a numeric
# `warningCount`, and both are demanded before the absence means anything.
#
# The generation that added this section exists because a missing daemon was
# indistinguishable from a working one. A check with the same shape would let
# its own defect through.
printf '\ndaemon: true\n' >> "$PROJECT/.reap/config.yml"
DM_RAW=$(cd "$PROJECT" && HOME="$FAKE_HOME" "$REAP_BIN" fix --check 2>/dev/null)
DM_AFTER=$(node -e '
  let raw=""; process.stdin.on("data",d=>raw+=d).on("end",()=>{
    let out;
    try { out = JSON.parse(raw); } catch { console.log("BAD_JSON"); return; }
    const ctx = out.context || {};
    if (out.status !== "ok" || typeof ctx.warningCount !== "number") {
      console.log("BAD_SHAPE"); return;
    }
    console.log("OK\n" + (ctx.warnings || []).join("\n"));
  });' <<< "$DM_RAW")

if [ "$DM_AFTER" = "BAD_JSON" ] || [ "$DM_AFTER" = "BAD_SHAPE" ]; then
  red "  FAIL  fix --check did not produce a usable answer ($DM_AFTER)"
  echo
  echo "${DM_RAW:-(no output)}" | head -5 | while IFS= read -r line; do dim "        $line"; done
  echo
  dim "        Silence would otherwise read as 'no warning', which is the same"
  dim "        mistake this whole section exists to remove."
  exit 1
fi

if grep -q "reap-daemon" <<< "$DM_AFTER"; then
  red "  FAIL  reap still reports the daemon as missing after installing it"
  echo
  dim "        $DM_AFTER"
  echo
  dim "        reap resolves the daemon from its own location; if the two"
  dim "        packages land somewhere this cannot bridge, the user is told to"
  dim "        install what they already have."
  exit 1
fi

# And it must actually launch it. Resolving a path is not the same as spawning
# it, and a wrong runtime or a bad entry point only shows up here. Isolated port
# and HOME so a developer's own daemon is neither contacted nor disturbed.
DM_STATUS=$(cd "$PROJECT" && HOME="$FAKE_HOME" REAP_DAEMON_PORT=17294 \
  "$REAP_BIN" daemon status 2>&1)
if ! grep -q '"status": *"ok"' <<< "$DM_STATUS"; then
  red "  FAIL  an installed reap could not start the installed daemon"
  echo
  echo "$DM_STATUS" | head -8 | while IFS= read -r line; do dim "        $line"; done
  exit 1
fi
(cd "$PROJECT" && HOME="$FAKE_HOME" REAP_DAEMON_PORT=17294 "$REAP_BIN" daemon stop >/dev/null 2>&1)

# Again with node, because `detectRuntime()` prefers bun and the run above
# therefore proved the link only for machines that have it. 5d ran the daemon
# under node but never through reap; this is the remaining combination, and it
# is the one a user without bun actually gets.
#
# That asymmetry is not hypothetical here: an inlined native binding worked
# under bun and failed under node for three generations precisely because
# nothing ever exercised the node side. Leaving the same gap one layer up would
# waste the finding.
#
# A stub that fails makes `bun --version` throw, which is all detectRuntime
# needs to fall back. Cheaper than a second install, so this costs a runner
# nothing beyond one more spawn.
DM_NOBUN="$DM_HOME/nobun"
mkdir -p "$DM_NOBUN"
printf '#!/bin/sh\nexit 127\n' > "$DM_NOBUN/bun"
chmod +x "$DM_NOBUN/bun"

DM_STATUS_NODE=$(cd "$PROJECT" && HOME="$FAKE_HOME" REAP_DAEMON_PORT=17293 \
  PATH="$DM_NOBUN:$PATH" "$REAP_BIN" daemon status 2>&1)
if ! grep -q '"status": *"ok"' <<< "$DM_STATUS_NODE"; then
  red "  FAIL  reap could not start the daemon when bun is unavailable"
  echo
  echo "$DM_STATUS_NODE" | head -8 | while IFS= read -r line; do dim "        $line"; done
  echo
  dim "        detectRuntime() falls back to node when bun is missing. If only"
  dim "        bun can load the bundle, every user without bun gets nothing."
  exit 1
fi
(cd "$PROJECT" && HOME="$FAKE_HOME" REAP_DAEMON_PORT=17293 PATH="$DM_NOBUN:$PATH" \
  "$REAP_BIN" daemon stop >/dev/null 2>&1)
mv "$PROJECT/.reap/config.yml.orig2" "$PROJECT/.reap/config.yml" 2>/dev/null || true
green "  ok    an installed reap starts an installed daemon, with bun and without"

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

# The daemon's own data. Section 8 never runs a daemon, so without planting
# this the later "~/.reap/daemon is gone" check could not fail — it would be
# asserting the absence of something that never existed.
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
  red "  FAIL  nothing to uninstall — package dir, daemon dir or bin link absent before the run"
  exit 1
fi
green "  ok    installed state to remove ($UN_CMDS_BEFORE commands, $UN_AGENTS_BEFORE agents)"

# 17288 is an address nothing in this script uses. The daemon is stopped before
# the files are deleted, and without a port of its own that stop would reach
# whatever daemon the developer happens to be running.
set +e
UN_OUT=$(cd "$UN_HOME" && HOME="$UN_HOME" npm_config_prefix="$UN_PREFIX" REAP_DAEMON_PORT=17288 \
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
