#!/usr/bin/env node
/**
 * preinstall — block local (non-global) installation.
 * REAP is a CLI tool and must be installed globally.
 */
if (process.env.npm_config_global !== "true") {
  console.error("\n  ✗ @c-d-cc/reap is a CLI tool. Install globally:\n    npm install -g @c-d-cc/reap\n");
  process.exit(1);
}
