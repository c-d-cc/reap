#!/usr/bin/env bash
# Bun 없는 PATH에서 tarball 설치본이 명령 전부를 낸다는 실측. reap는 이 스크립트를 검증하지 않는다.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "== build:node =="
bun run build:node

echo "== npm pack =="
PACK_DIR="$(mktemp -d)"
TGZ="$(npm pack --pack-destination "$PACK_DIR" --json | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>console.log(JSON.parse(d)[0].filename))')"
echo "tarball: $PACK_DIR/$TGZ"

DRY_RUN="$(npm pack --dry-run 2>&1)"
for forbidden in "src/" "tests/" "plugin/" ".reap/"; do
  if printf '%s' "$DRY_RUN" | grep -q "$forbidden"; then
    echo "npm pack --dry-run listing must not contain: $forbidden" >&2
    exit 1
  fi
done

echo "== global install into a temp prefix =="
PREFIX_DIR="$(mktemp -d)"
npm install --global --prefix "$PREFIX_DIR" "$PACK_DIR/$TGZ"

echo "== strip the bun directory from PATH =="
BUN_DIR="$(dirname "$(command -v bun)")"
NO_BUN_PATH="$(printf '%s\n' "$PATH" | tr ':' '\n' | grep -vF "$BUN_DIR" | paste -s -d: -)"
if [ -z "$NO_BUN_PATH" ]; then
  echo "PATH filtering result is empty" >&2
  exit 1
fi
NO_BUN_PATH="$PREFIX_DIR/bin:$NO_BUN_PATH"

echo "== temp git repo for checks =="
REPO_DIR="$(mktemp -d)"
(
  cd "$REPO_DIR"
  git init -q -b main
  git config user.email "verify@example.com"
  git config user.name "verify"
  echo "# t" > README.md
  git add -A
  git commit -q -m "first commit"
)

run_reap() {
  hash -r
  PATH="$NO_BUN_PATH" command -v bun >/dev/null 2>&1 && { echo "bun is still on PATH" >&2; exit 1; }
  PATH="$NO_BUN_PATH" reap "$@"
}

echo "== every command =="
VERSION_OUT="$(run_reap --version)"
[ "$VERSION_OUT" = "reap 0.18.0" ] || { echo "version mismatch: $VERSION_OUT" >&2; exit 1; }
echo "PASS --version: $VERSION_OUT"

(cd "$REPO_DIR" && run_reap init) && echo "PASS init"
(cd "$REPO_DIR" && run_reap make loop --type plan --title t) && echo "PASS make loop"
(cd "$REPO_DIR" && run_reap make milestone --title m) && echo "PASS make milestone"
(cd "$REPO_DIR" && run_reap make generation --milestone ms-001 --title g) && echo "PASS make generation"
(cd "$REPO_DIR" && run_reap mark generation gen-0001-exec --aborted) && echo "PASS mark generation"

HOOK_OUT="$(cd "$REPO_DIR" && run_reap ctx --hook)"
printf '%s' "$HOOK_OUT" | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>JSON.parse(d))' \
  || { echo "ctx --hook is not valid JSON" >&2; exit 1; }
echo "PASS ctx --hook (JSON)"

(cd "$REPO_DIR" && run_reap doctor) && echo "PASS doctor"
(cd "$REPO_DIR" && run_reap plan sources) && echo "PASS plan sources"
(cd "$REPO_DIR" && run_reap index update && run_reap index status) && echo "PASS index update/status"
(cd "$REPO_DIR" && run_reap orch claim x && run_reap orch release x) && echo "PASS orch claim/release"

rm -rf "$PACK_DIR" "$PREFIX_DIR" "$REPO_DIR"
echo "== all passed =="
