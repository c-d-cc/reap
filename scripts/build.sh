#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# Clean dist
rm -rf dist

# Bundle TypeScript → single JS file
#
# reap:carrier(zero-native-dependency)
# web-tree-sitter stays external, and the reason is narrower than it looks.
#
# The daemon inlined a *native* module (better-sqlite3); the `bindings` lookup
# then searched relative to the bundle, found no .node, and every query returned
# zero while /health said fine. web-tree-sitter is not that: it is JS plus a
# .wasm, and inlining it was tried here (gen-089) and the self-diagnosis gate
# still passed under node — so the analogous failure is NOT demonstrated for
# this package, and claiming it would be a guess wearing the shape of a reason.
#
# External is kept anyway, for what is actually known: it is node's ordinary
# resolution, which npm guarantees for a declared dependency, and it keeps the
# bundle 0.11 MB smaller. If it ever moves inline, the gate's section 5 is what
# would have to stay green — it runs the published bundle under node.
bun build src/cli/index.ts --outdir dist/cli --target node \
  --external web-tree-sitter

# Copy static assets
mkdir -p dist/adapters/claude-code
cp -r src/adapters/claude-code/skills dist/adapters/claude-code/

# OpenCode adapter assets (plugin source + AGENTS.md template)
mkdir -p dist/adapters/opencode/plugin dist/adapters/opencode/templates
cp src/adapters/opencode/plugin/reap-plugin.ts dist/adapters/opencode/plugin/
cp src/adapters/opencode/templates/agents.md dist/adapters/opencode/templates/

cp -r src/templates dist/

# Tree-sitter grammars for the built-in indexer.
#
# tree-sitter-wasms ships 36 grammars (51.8 MB unpacked / 4.4 MB gzipped) and is
# a devDependency, not a runtime one. Only the languages REAP actually indexes
# are copied, which is 15 of them (26.6 MB / 2.4 MB gzipped) — and the set is
# derived from the tag queries rather than restated here, so a language cannot
# be added to the indexer without its grammar following.
mkdir -p dist/grammars
WASMS_DIR="node_modules/tree-sitter-wasms/out"
for scm in src/templates/tree-sitter/*-tags.scm; do
  lang="$(basename "$scm" -tags.scm)"
  src="${WASMS_DIR}/tree-sitter-${lang}.wasm"
  if [ ! -f "$src" ]; then
    echo "error: no grammar for '${lang}' at ${src}" >&2
    echo "       (tag query ${scm} has no matching tree-sitter-wasms grammar)" >&2
    exit 1
  fi
  cp "$src" dist/grammars/
done
echo "grammars bundled: $(ls dist/grammars | wc -l | tr -d ' ')"

# Stamp dev version marker for local builds
if [ -z "${CI:-}" ] && [ -z "${npm_config_tag:-}" ]; then
  COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
  echo "${COMMIT_HASH}" > dist/.dev-build
fi
