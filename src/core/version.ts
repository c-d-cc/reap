import { execSync } from "child_process";

/**
 * Compare two semver strings: returns true if a >= b.
 * Handles only numeric major.minor.patch (no pre-release tags).
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
 * Check the autoUpdateMinVersion field from the latest published @c-d-cc/reap.
 * Returns the minVersion string, or null if the check fails.
 */
export function checkAutoUpdateMinVersion(): string | null {
  try {
    const result = execSync("npm view @c-d-cc/reap reap.autoUpdateMinVersion", {
      timeout: 10_000,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return result.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Check the latest published version of @c-d-cc/reap on npm.
 * Returns the version string, or null if the check fails (network error, timeout, etc.).
 */
export function checkLatestVersion(): string | null {
  try {
    const result = execSync("npm view @c-d-cc/reap version", {
      timeout: 2000,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return result.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Get the current REAP version from the build-time define.
 */
export function getCurrentVersion(): string {
  return process.env.__REAP_VERSION__ || "0.0.0";
}

/**
 * Format version display string:
 *   "REAP v0.10.3 (latest)" or "REAP v0.10.3 (update available: 0.11.0)"
 * If skipCheck is true or latest check fails, just returns "REAP v0.10.3".
 */
export function formatVersionLine(current: string, skipCheck: boolean): string {
  if (skipCheck) {
    return `REAP v${current}`;
  }
  const latest = checkLatestVersion();
  if (!latest) {
    return `REAP v${current}`;
  }
  if (latest === current) {
    return `REAP v${current} (latest)`;
  }
  return `REAP v${current} (update available: ${latest})`;
}
