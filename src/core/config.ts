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
