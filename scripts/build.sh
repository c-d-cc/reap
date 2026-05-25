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

# OpenCode adapter assets (plugin source + AGENTS.md template)
mkdir -p dist/adapters/opencode/plugin dist/adapters/opencode/templates
cp src/adapters/opencode/plugin/reap-plugin.ts dist/adapters/opencode/plugin/
cp src/adapters/opencode/templates/agents.md dist/adapters/opencode/templates/

cp -r src/templates dist/

# Stamp dev version marker for local builds
if [ -z "${CI:-}" ] && [ -z "${npm_config_tag:-}" ]; then
  COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
  echo "${COMMIT_HASH}" > dist/.dev-build
fi
