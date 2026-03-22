import YAML from "yaml";
import type { ReapConfig, StrictMode } from "../types";
import type { ReapPaths } from "./paths";
import { readTextFileOrThrow, writeTextFile } from "./fs";

export class ConfigManager {
  static async read(paths: ReapPaths): Promise<ReapConfig> {
    const content = await readTextFileOrThrow(paths.config);
    return YAML.parse(content) as ReapConfig;
  }

  static async write(paths: ReapPaths, config: ReapConfig): Promise<void> {
    const content = YAML.stringify(config);
    await writeTextFile(paths.config, content);
  }

  /** Resolve autoSubagent option. Default: true */
  static resolveAutoSubagent(value?: boolean): boolean {
    return value !== false;
  }

  /** Backfill missing config fields with defaults (for existing projects) */
  static async backfill(paths: ReapPaths): Promise<{ added: string[] }> {
    const config = await ConfigManager.read(paths);
    const added: string[] = [];

    const defaults: Partial<ReapConfig> = {
      strict: false,
      autoUpdate: true,
      autoSubagent: true,
      autoIssueReport: false,
      lastSyncedGeneration: "",
    };

    for (const [key, defaultValue] of Object.entries(defaults)) {
      if ((config as any)[key] === undefined) {
        (config as any)[key] = defaultValue;
        added.push(key);
      }
    }

    // Migrate legacy lastSyncedCommit → lastSyncedGeneration
    if ((config as any).lastSyncedCommit !== undefined) {
      // If lastSyncedGeneration is still empty and lastSyncedCommit has a value,
      // mark as "legacy" to indicate it was synced before the migration
      if (!config.lastSyncedGeneration && (config as any).lastSyncedCommit) {
        config.lastSyncedGeneration = "legacy";
        added.push("lastSyncedGeneration(migrated)");
      }
      delete (config as any).lastSyncedCommit;
      added.push("lastSyncedCommit(removed)");
    }

    if (added.length > 0) {
      await ConfigManager.write(paths, config);
    }

    return { added };
  }

  /** Resolve strict mode from boolean | object to StrictMode */
  static resolveStrict(strict?: boolean | { edit?: boolean; merge?: boolean }): StrictMode {
    if (strict === undefined || strict === false) {
      return { edit: false, merge: false };
    }
    if (strict === true) {
      return { edit: true, merge: true };
    }
    return {
      edit: strict.edit ?? false,
      merge: strict.merge ?? false,
    };
  }
}
