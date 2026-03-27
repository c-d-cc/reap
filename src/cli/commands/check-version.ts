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
export function getInstalledVersion(): string | null {
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
 * Query the latest published version from npm registry.
 * Returns null on any failure (network, timeout, not found).
 */
export function queryLatestVersion(): string | null {
  try {
    const result = execSync("npm view @c-d-cc/reap version", {
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
 * Hand off to the newly installed binary by running `reap update --post-upgrade`.
 * The new binary performs project sync with its own (newer) code.
 * Returns true if hand-off succeeded, false if it failed (fail-safe).
 */
export function handOffToNewBinary(root: string): boolean {
  try {
    execSync("reap update --post-upgrade", {
      stdio: "inherit",
      timeout: 120_000,
      cwd: root,
    });
    return true;
  } catch {
    // New binary may not support --post-upgrade yet.
    // Fail silently — caller will fallback to current binary's reap update.
    return false;
  }
}

export interface AutoUpdateResult {
  action: "upgraded" | "blocked" | "skipped";
  from?: string;
  to?: string;
  reason?: string;
}

/**
 * Perform auto-update if conditions are met:
 * 1. Installed version is available and not a dev build
 * 2. A newer version exists on npm
 * 3. autoUpdateMinVersion guard passes
 *
 * On success, runs `reap update` to sync project structure.
 * All errors are silently swallowed — never breaks postinstall/hooks.
 */
export function performAutoUpdate(root: string): AutoUpdateResult {
  try {
    // 1. Get installed version
    const installed = getInstalledVersion();
    if (!installed) return { action: "skipped", reason: "version-unknown" };

    // 2. Skip dev/alpha builds
    if (installed.includes("+dev") || installed.includes("-alpha")) {
      return { action: "skipped", reason: "dev-build" };
    }

    // 3. Query latest version
    const latest = queryLatestVersion();
    if (!latest) return { action: "skipped", reason: "network-error" };

    // 5. Already up to date
    if (installed === latest) {
      return { action: "skipped", reason: "up-to-date" };
    }

    // 6. autoUpdateMinVersion guard
    const minVersion = queryAutoUpdateMinVersion();
    if (minVersion && !semverGte(installed, minVersion)) {
      console.error(
        `[REAP] Breaking change detected: v${installed} → v${latest}. ` +
        `Run: npm install -g @c-d-cc/reap@latest`
      );
      return {
        action: "blocked",
        from: installed,
        to: latest,
        reason: `breaking-change: v${installed} < minVersion v${minVersion}`,
      };
    }

    // 7. Perform upgrade
    execSync("npm install -g @c-d-cc/reap@latest", {
      encoding: "utf-8",
      timeout: 60_000,
      stdio: ["pipe", "pipe", "pipe"],
    });

    // 8. Hand off to new binary for project sync.
    // The new binary runs `reap update --post-upgrade` which skips self-upgrade
    // and only performs project sync with the new code.
    const handedOff = handOffToNewBinary(root);
    if (!handedOff) {
      // Fallback: run reap update with current (old) binary
      try {
        execSync("reap update", {
          encoding: "utf-8",
          timeout: 30_000,
          stdio: ["pipe", "pipe", "pipe"],
          cwd: root,
        });
      } catch {
        // reap update failure is non-fatal — the upgrade itself succeeded
      }
    }

    console.error(`[REAP] Auto-updated: v${installed} → v${latest}`);
    return { action: "upgraded", from: installed, to: latest };
  } catch {
    // Silent — never break postinstall or session hooks
    return { action: "skipped", reason: "error" };
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
 * - Auto-update if enabled in config.yml
 * - Check autoUpdateMinVersion guard (fallback for non-autoUpdate projects)
 */
export async function execute(): Promise<void> {
  const root = process.cwd();
  await cleanupLegacyHooks(root);
  await cleanupLegacyProjectSkills(root);

  // Auto-update: always attempt (skip dev/alpha, network failure is silent)
  performAutoUpdate(root);
}
