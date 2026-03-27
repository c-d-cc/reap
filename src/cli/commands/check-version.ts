import { cleanupLegacyHooks } from "../../core/integrity.js";

/**
 * Post-install side-effects only (no user-facing messages — npm suppresses them).
 * - Clean up legacy v0.15 SessionStart hooks
 */
export async function execute(): Promise<void> {
  const root = process.cwd();
  await cleanupLegacyHooks(root);
}
