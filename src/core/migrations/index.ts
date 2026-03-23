import type { Migration, MigrationRunResult } from "./types";
import type { ReapPaths } from "../paths";
import { migration_0_0_0_to_0_10_0 } from "./0.0.0-to-0.10.0";

/** All registered migrations, in order */
const MIGRATIONS: Migration[] = [
  migration_0_0_0_to_0_10_0,
];

export class MigrationRunner {
  /**
   * Run all applicable migrations for a project.
   * Each migration's check() determines whether it needs to run (idempotent).
   * @param paths - ReapPaths for the project
   * @param dryRun - if true, report what would run without executing
   * @returns migration result
   */
  static async run(
    paths: ReapPaths,
    dryRun: boolean = false,
  ): Promise<MigrationRunResult> {
    const result: MigrationRunResult = {
      migrated: [],
      skipped: [],
      errors: [],
    };

    for (const migration of MIGRATIONS) {
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

    return result;
  }

  /** Get list of all registered migrations (for testing/inspection) */
  static getMigrations(): readonly Migration[] {
    return MIGRATIONS;
  }
}

export type { Migration, MigrationRunResult } from "./types";
