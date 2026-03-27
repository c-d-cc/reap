import { cleanupLegacyHooks, cleanupLegacyProjectSkills } from "../../core/integrity.js";

/**
 * Post-install side-effects only (no user-facing messages — npm suppresses them).
 * - Clean up legacy v0.15 SessionStart hooks
 * - Clean up legacy v0.15 project-level skills (if cwd is a project directory)
 */
export async function execute(): Promise<void> {
  const root = process.cwd();
  await cleanupLegacyHooks(root);
  await cleanupLegacyProjectSkills(root);
}
