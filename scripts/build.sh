#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# Clean dist
rm -rf dist

# Bundle TypeScript → single JS file
bun build src/cli/index.ts --outdir dist/cli --target node

# Copy static assets
mkdir -p dist/adapters/claude-code
cp -r src/adapters/claude-code/skills dist/adapters/claude-code/
cp -r src/templates dist/

# Remove dev-only skills from dist (not for end users)
rm -f dist/adapters/claude-code/skills/reapdev.*.md
