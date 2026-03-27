#!/usr/bin/env bash
# REAP postinstall — side-effects only (npm v7+ suppresses all output)

# Install skills to ~/.claude/commands/
node "$(dirname "$0")/../dist/cli/index.js" install-skills 2>/dev/null || true

# Clean up legacy v0.15 hooks
node "$(dirname "$0")/../dist/cli/index.js" check-version 2>/dev/null || true
