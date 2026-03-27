import { join } from "path";
import { fileExists } from "../../core/fs.js";
import { createPaths } from "../../core/paths.js";
import { cleanupLegacyHooks } from "../../core/integrity.js";

/**
 * Post-install check: detect project state and show relevant message.
 * Outputs plain text (not JSON) and exits silently on error.
 */
export async function execute(): Promise<void> {
  const root = process.cwd();
  const paths = createPaths(root);

  // Clean up legacy v0.15 SessionStart hooks (safe to run always)
  const cleanedHooks = await cleanupLegacyHooks(root);
  if (cleanedHooks.length > 0) {
    console.log("\n✓ Removed legacy REAP v0.15 SessionStart hooks from Claude Code settings.");
  }

  const hasReap = await fileExists(paths.config);

  if (!hasReap) {
    // New user — no .reap/ directory
    console.log(`
┌─────────────────────────────────────────────┐
│  REAP installed successfully.               │
│                                             │
│  Get started:                               │
│    /reap.init    — Initialize a project     │
│    /reap.help    — Show available commands   │
└─────────────────────────────────────────────┘
`);
    return;
  }

  // Existing REAP project — check version
  const isV15 = await fileExists(join(paths.genome, "principles.md"));

  if (isV15) {
    console.log(`
┌─────────────────────────────────────────────┐
│  ⚠ REAP v0.15 project detected.            │
│                                             │
│  Run '/reap.update' in your AI agent        │
│  to migrate to v0.16.                       │
└─────────────────────────────────────────────┘
`);
  } else {
    console.log(`
┌─────────────────────────────────────────────┐
│  REAP updated successfully.                 │
│                                             │
│  /reap.evolve    — Run a generation         │
│  /reap.status    — Check current state      │
│  /reap.help      — Show available commands   │
└─────────────────────────────────────────────┘
`);
  }
}
