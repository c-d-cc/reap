#!/usr/bin/env bash
# Do the versions reap orders people to install actually exist?
#
# Why this exists (gen-085): REAP holds two numbers that name a release on npm
# and are spent telling users to upgrade.
#
#   MIN_DAEMON_VERSION      — below this, reap refuses to talk to the daemon and
#                             says to upgrade it
#   reap.autoUpdateMinVersion — below this, reap refuses to auto-update itself
#                             and says to install @latest by hand
#
# Nothing checked that either named a real release. The mistake is only possible
# in the direction nobody tests: raise a floor, forget to publish, and every
# affected user is instructed — correctly, repeatedly, and uselessly — to install
# something that was never released. That is the same shape as the defect gen-083
# fixed, where a setting pointed at an absent thing and no one asked.
#
# Both floors are currently satisfied, which is the point: the check has to exist
# before the first raise, not after the first mistake.
#
# Run before tagging a reap release. Wired into .github/workflows/release.yml
# ahead of `npm publish`. Deliberately NOT in ci.yml — it needs the network on
# every push, and a check that periodically reports SKIP for reasons unrelated to
# the code is one people learn to scroll past.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

red()   { printf '\033[31m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }
amber() { printf '\033[33m%s\033[0m\n' "$1"; }
dim()   { printf '\033[2m%s\033[0m\n' "$1"; }

FAILURES=0

# Ask npm whether $2 is a published version of package $1, and print a verdict.
#
# The lookup and the parse are separate commands rather than one pipeline. `npm`
# writes its JSON and exits; a reader that stops early would leave it writing
# into a closed pipe, and under `pipefail` that turns a successful lookup into a
# failure — which is how a matched `grep -q` was read as a miss twice in this
# repository (gen-083/084).
published_verdict() {
  local package="$1" floor="$2" out err status

  err=$(mktemp)
  out=$(npm view "$package" versions --json 2>"$err")
  status=$?

  if [ "$status" -ne 0 ]; then
    # A package that does not exist and a registry that cannot be reached are
    # different answers, and only one of them is this project's problem. Reading
    # both as "could not check" was the first version of this script, and it
    # meant a typo in the package name passed the gate in silence — the check
    # would have verified a version while never noticing that the thing it
    # belongs to is fictional.
    if grep -qE 'E404|404 Not Found' "$err"; then
      rm -f "$err"
      echo "NOPACKAGE"
      return
    fi
    rm -f "$err"
    echo "UNREACHABLE"
    return
  fi
  rm -f "$err"

  # `npm view ... versions --json` is documented to answer with a bare string
  # when a package has exactly one version. npm 10.9.4 in fact returns an array
  # in that case, so this branch is not what runs today — it is carried because
  # the release workflow installs npm@latest and the shape belongs to whichever
  # npm ends up running. Both forms were fed to this parser and both answer
  # FOUND.
  FLOOR="$floor" node -e '
    let raw = "";
    process.stdin.on("data", (d) => (raw += d)).on("end", () => {
      let parsed;
      try { parsed = JSON.parse(raw); } catch { console.log("BAD_JSON"); return; }
      const versions = Array.isArray(parsed) ? parsed : [parsed];
      if (versions.length === 0) { console.log("EMPTY"); return; }
      console.log(versions.includes(process.env.FLOOR) ? "FOUND" : "MISSING\n" + versions.slice(-8).join(", "));
    });' <<< "$out"
}

# $1 = package, $2 = floor, $3 = where the floor is declared, $4 = what it does
check_floor() {
  local package="$1" floor="$2" origin="$3" consequence="$4"
  local verdict
  verdict=$(published_verdict "$package" "$floor")

  case "$verdict" in
    FOUND)
      green "  ok    $package@$floor is published"
      return
      ;;
    NOPACKAGE)
      red "  FAIL  $package is not a package on this registry"
      dim "        The floor in $origin names a version of something that does not exist."
      FAILURES=$((FAILURES + 1))
      return
      ;;
    UNREACHABLE)
      amber "  SKIP  npm could not be queried for $package — registry unreachable or lookup failed"
      dim "        Nothing was verified. Re-run with network access before publishing,"
      dim "        or confirm by hand that $package@$floor exists."
      return
      ;;
    BAD_JSON|EMPTY)
      amber "  SKIP  npm answered for $package, but not with a version list ($verdict)"
      dim "        Nothing was verified. Check by hand before publishing."
      return
      ;;
  esac

  red "  FAIL  $origin names $floor, and $package has no such release"
  dim "        most recent published versions:"
  echo "$verdict" | tail -n +2 | while IFS= read -r line; do dim "          $line"; done
  dim "        $consequence"
  dim "        Either publish $package@$floor first, or lower the floor to a release that is out."
  FAILURES=$((FAILURES + 1))
}

# reap:carrier(min-daemon-version)
# Read from the source rather than restated here. A copy would be a second owner
# of the number, and this check could then pass while disagreeing with the code
# it is checking. Unreadable is a failure, not a skip: if the declaration moves,
# the check must go red rather than quietly verify nothing.
CLIENT_TS="src/cli/commands/daemon/client.ts"
DAEMON_FLOOR=$(sed -n 's/^export const MIN_DAEMON_VERSION = "\([^"]*\)";$/\1/p' "$CLIENT_TS")
# reap:carrier(daemon-package-name)
DAEMON_PACKAGE=$(sed -n 's/^export const DAEMON_PACKAGE = "\([^"]*\)";$/\1/p' "$CLIENT_TS")

REAP_PACKAGE=$(node -p "require('./package.json').name")
REAP_FLOOR=$(node -p "require('./package.json').reap?.autoUpdateMinVersion ?? ''")

echo "Checking that the versions reap tells people to install exist"
echo

if [ -z "$DAEMON_FLOOR" ] || [ -z "$DAEMON_PACKAGE" ]; then
  red "  FAIL  could not read MIN_DAEMON_VERSION / DAEMON_PACKAGE from $CLIENT_TS"
  dim "        The declarations moved or changed shape. This check reads them with"
  dim "        sed; update the patterns rather than hardcoding the values."
  FAILURES=$((FAILURES + 1))
else
  check_floor "$DAEMON_PACKAGE" "$DAEMON_FLOOR" "MIN_DAEMON_VERSION in $CLIENT_TS" \
    "reap tells every user with 'daemon: true' to upgrade to this version."
fi

if [ -z "$REAP_FLOOR" ]; then
  # Absent is legitimate — the guard is skipped entirely when the field is unset.
  dim "  --    package.json declares no reap.autoUpdateMinVersion (the guard is inactive)"
else
  check_floor "$REAP_PACKAGE" "$REAP_FLOOR" "reap.autoUpdateMinVersion in package.json" \
    "reap blocks auto-update below this and tells users to install @latest by hand."
fi

echo
if [ "$FAILURES" -eq 0 ]; then
  green "All version floors name published releases."
  exit 0
fi
red "$FAILURES floor(s) name something that is not published — resolve before releasing."
exit 1
