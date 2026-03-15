import YAML from "yaml";
import type { ReapConfig } from "../types";
import type { ReapPaths } from "./paths";

export class ConfigManager {
  static async read(paths: ReapPaths): Promise<ReapConfig> {
    const content = await Bun.file(paths.config).text();
    return YAML.parse(content) as ReapConfig;
  }

  static async write(paths: ReapPaths, config: ReapConfig): Promise<void> {
    const content = YAML.stringify(config);
    await Bun.write(paths.config, content);
  }
}
