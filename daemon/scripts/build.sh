#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

rm -rf dist

# Native and WASM-backed dependencies stay external.
#
# Bundling better-sqlite3 inlines the `bindings` lookup, which then searches for
# the compiled .node relative to the *bundle* — i.e. the package root — and
# never finds the one npm installed under node_modules/better-sqlite3/. The
# daemon then starts, answers /health, and fails every query. bun happened to
# resolve it anyway, so the whole defect was invisible for as long as the daemon
# was only ever launched with bun.
#
# Leaving them external means node's ordinary resolution applies, which is what
# a published package needs. It also cuts the bundle from ~182KB to ~45KB.
bun build src/index.ts --outdir dist --target node \
  --external better-sqlite3 \
  --external web-tree-sitter \
  --external tree-sitter-wasms

echo "reap-daemon built → dist/index.js"
