/**
 * 0.17.8 upgrade bridge (v018 milestone, "0.17.8 이행 다리").
 *
 * v0.18 does not arrive via auto-update — it is published on the npm dist-tag
 * `next` while `latest` stays on the 0.17 line. This module owns the two
 * mechanisms that make that liveable:
 *
 * 1. A daily cache for the npm registry queries. `reap check-version` runs on
 *    every SessionStart and used to spend a measured 0.34–1.2s per session on
 *    `npm view`. One check a day is enough for an announcement.
 * 2. The announcement itself — when the `next` tag carries UPGRADE_FLOOR or
 *    above, sessions are told the upgrade exists and how to start it.
 *
 * Design source: .reap/vision/design/plugin-distribution.md § 9.
 */
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { semverGte } from "./semver.js";

/** The version line the bridge announces. */
export const UPGRADE_FLOOR = "0.18.0";

const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface RegistryVersions {
  latest: string | null;
  minVersion: string | null;
  next: string | null;
  checkedAt: string;
}

export interface VersionCacheDeps {
  /** Home directory override for tests. */
  home?: string;
  /** Clock override for tests. */
  now?: () => Date;
  queryLatest: () => string | null;
  queryMinVersion: () => string | null;
  queryNext: () => string | null;
}

function cachePath(home: string): string {
  return join(home, ".reap", "version-check.json");
}

/**
 * Registry versions, at most one npm round-trip per day.
 *
 * The cache is written only when `latest` was actually obtained — a network
 * failure is not worth remembering for a day, and `minVersion`/`next` are
 * legitimately null (field or tag absent) so their nulls are cacheable.
 * Every failure path falls back to querying; a corrupt cache file is ignored.
 */
export function getRegistryVersionsDaily(deps: VersionCacheDeps): RegistryVersions {
  const home = deps.home ?? homedir();
  const now = (deps.now ?? (() => new Date()))();

  try {
    const raw = readFileSync(cachePath(home), "utf-8");
    const cached = JSON.parse(raw) as RegistryVersions;
    const age = now.getTime() - new Date(cached.checkedAt).getTime();
    if (
      typeof cached.checkedAt === "string" &&
      Number.isFinite(age) &&
      age >= 0 &&
      age < CACHE_MAX_AGE_MS &&
      cached.latest !== undefined
    ) {
      return cached;
    }
  } catch {
    // Absent or unreadable cache — query below.
  }

  const fresh: RegistryVersions = {
    latest: deps.queryLatest(),
    minVersion: deps.queryMinVersion(),
    next: deps.queryNext(),
    checkedAt: now.toISOString(),
  };

  if (fresh.latest !== null) {
    try {
      mkdirSync(join(home, ".reap"), { recursive: true });
      writeFileSync(cachePath(home), JSON.stringify(fresh, null, 2) + "\n");
    } catch {
      // Best-effort — a read-only home must not break the session hook.
    }
  }

  return fresh;
}

/**
 * The bridge announcement, or null when there is nothing to announce.
 *
 * Announces only when the `next` tag carries UPGRADE_FLOOR or above — the
 * 0.17.x alphas that also live on non-latest tags are not an upgrade path.
 */
export function upgradeAnnouncement(next: string | null): string | null {
  if (next && semverGte(next, UPGRADE_FLOOR)) {
    return (
      `[REAP] v${next} is available on the npm \`next\` tag. ` +
      `It will not arrive via auto-update — run \`reap update\` to install the guided upgrade agent.`
    );
  }
  return null;
}
