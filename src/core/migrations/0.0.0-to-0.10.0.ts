import type { Migration } from "./types";
import { needsMigration, migrateLineage } from "../migration";
import type { ReapPaths } from "../paths";

/**
 * Legacy lineage migration: gen-NNN → gen-NNN-HASH (DAG format).
 * Wraps existing migration.ts logic into the registry pattern.
 */
export const migration_0_0_0_to_0_10_0: Migration = {
  description: "Lineage DAG migration — legacy gen-NNN directories to gen-NNN-HASH format",

  async check(paths: ReapPaths): Promise<boolean> {
    return needsMigration(paths);
  },

  async up(paths: ReapPaths): Promise<string[]> {
    const result = await migrateLineage(paths);
    const messages: string[] = [];
    for (const m of result.migrated) {
      messages.push(`[lineage] ${m}`);
    }
    if (result.errors.length > 0) {
      throw new Error(`Lineage migration errors: ${result.errors.join("; ")}`);
    }
    return messages;
  },
};
