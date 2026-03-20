import type { Migration, MigrationRunResult } from "./types";
import type { ReapPaths } from "../paths";
import { ConfigManager } from "../config";
import { migration_0_0_0_to_0_10_0 } from "./0.0.0-to-0.10.0";

/** All registered migrations, in order */
const MIGRATIONS: Migration[] = [
  migration_0_0_0_to_0_10_0,
];

/** Compare two semver strings. Returns -1, 0, or 1. */
function compareSemver(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na < nb) return -1;
    if (na > nb) return 1;
  }
  return 0;
}

/** Normalize legacy/unknown versions to "0.0.0" */
function normalizeVersion(version: string | undefined): string {
  if (!version) return "0.0.0";
  // Treat the old hardcoded "0.1.0" as "0.0.0" (pre-migration era)
  if (version === "0.1.0") return "0.0.0";
  // Strip +dev suffix for comparison
  return version.replace(/\+.*$/, "");
}

export class MigrationRunner {
  /**
   * Run all applicable migrations for a project.
   * @param paths - ReapPaths for the project
   * @param currentPackageVersion - current REAP package version (from __REAP_VERSION__)
   * @param dryRun - if true, report what would run without executing
   * @returns migration result
   */
  static async run(
    paths: ReapPaths,
    currentPackageVersion: string,
    dryRun: boolean = false,
  ): Promise<MigrationRunResult> {
    const config = await ConfigManager.read(paths);
    const configVersion = normalizeVersion(config.version);
    const targetVersion = normalizeVersion(currentPackageVersion);

    const result: MigrationRunResult = {
      migrated: [],
      skipped: [],
      errors: [],
      fromVersion: configVersion,
      toVersion: targetVersion,
    };

    // Already up to date
    if (compareSemver(configVersion, targetVersion) >= 0) {
      return result;
    }

    // Filter applicable migrations: configVersion < toVersion
    const applicable = MIGRATIONS
      .filter(m => compareSemver(configVersion, m.toVersion) < 0)
      .filter(m => compareSemver(m.toVersion, targetVersion) <= 0)
      .sort((a, b) => compareSemver(a.toVersion, b.toVersion));

    for (const migration of applicable) {
      const needs = await migration.check(paths);
      if (!needs) {
        result.skipped.push(migration.description);
        continue;
      }

      if (dryRun) {
        result.migrated.push(`[dry-run] ${migration.description}`);
        continue;
      }

      try {
        const messages = await migration.up(paths);
        result.migrated.push(...messages);
      } catch (err) {
        const errorMsg = `${migration.description}: ${err instanceof Error ? err.message : String(err)}`;
        result.errors.push(errorMsg);
        // Stop on first failure (NFR2: no partial migration)
        break;
      }
    }

    // Update config.yml version to current package version (only if no errors and not dry-run)
    if (result.errors.length === 0 && !dryRun) {
      config.version = currentPackageVersion;
      await ConfigManager.write(paths, config);
    }

    return result;
  }

  /** Get list of all registered migrations (for testing/inspection) */
  static getMigrations(): readonly Migration[] {
    return MIGRATIONS;
  }
}

export type { Migration, MigrationRunResult } from "./types";
