import YAML from "yaml";
import type { ReapConfig } from "../types";
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
}
