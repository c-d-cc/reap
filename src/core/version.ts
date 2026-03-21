import { execSync } from "child_process";

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
