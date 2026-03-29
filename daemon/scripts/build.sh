#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

rm -rf dist
bun build src/index.ts --outdir dist --target node
echo "reap-daemon built → dist/index.js"
