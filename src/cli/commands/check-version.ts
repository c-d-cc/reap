import { execSync } from "child_process";
import { cleanupLegacyHooks, cleanupLegacyProjectSkills } from "../../core/integrity.js";

/**
 * Inline semver comparison: returns true if a >= b.
 * Handles simple major.minor.patch format.
 */
export function semverGte(a: string, b: string): boolean {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return true;
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return false;
  }
  return true; // equal
}

/**
 * Query autoUpdateMinVersion from the latest npm package metadata.
 * Returns null on any failure (network, timeout, field not found).
 */
export function queryAutoUpdateMinVersion(): string | null {
  try {
    const result = execSync("npm view @c-d-cc/reap reap.autoUpdateMinVersion", {
      encoding: "utf-8",
      timeout: 10_000,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const trimmed = result.trim();
    return trimmed || null;
  } catch {
    return null;
  }
}

/**
 * Get the currently installed reap version.
 * Returns null on failure.
 */
function getInstalledVersion(): string | null {
  try {
    const result = execSync("reap --version", {
      encoding: "utf-8",
      timeout: 5_000,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return result.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Check autoUpdateMinVersion guard.
 * If installed version < minVersion from npm registry, emit a warning to stderr.
 * All errors are silently swallowed to avoid breaking postinstall/hooks.
 */
export function checkAutoUpdateGuard(): void {
  try {
    const installed = getInstalledVersion();
    if (!installed || installed.includes("+dev")) return;

    const minVersion = queryAutoUpdateMinVersion();
    if (!minVersion) return;

    if (!semverGte(installed, minVersion)) {
      console.error(
        `[REAP] Breaking change detected: installed v${installed} < required v${minVersion}. ` +
        `Run: npm install -g @c-d-cc/reap@latest`
      );
    }
  } catch {
    // Silent — never break postinstall or session hooks
  }
}

/**
 * Post-install + SessionStart hook entry point.
 * - Clean up legacy v0.15 SessionStart hooks
 * - Clean up legacy v0.15 project-level skills
 * - Check autoUpdateMinVersion guard
 */
export async function execute(): Promise<void> {
  const root = process.cwd();
  await cleanupLegacyHooks(root);
  await cleanupLegacyProjectSkills(root);
  checkAutoUpdateGuard();
}
