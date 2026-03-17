import YAML from "yaml";
import { readdir } from "fs/promises";
import { join } from "path";
import type { AdaptationRecord } from "../types";
import type { ReapPaths } from "./paths";
import { readTextFileOrThrow, writeTextFile } from "./fs";

let adaptCounter = 0;

export class AdaptationManager {
  constructor(private paths: ReapPaths) {}

  async record(generationId: string, targetFile: string, description: string, diff?: string): Promise<AdaptationRecord> {
    const id = `adapt-${Date.now()}-${adaptCounter++}`;
    const adaptation: AdaptationRecord = {
      id, generationId, targetFile, description,
      diff: diff ?? "",
      createdAt: new Date().toISOString(),
    };
    const dir = join(this.paths.lineage, generationId, "adaptations");
    await writeTextFile(join(dir, `${id}.yml`), YAML.stringify(adaptation));
    return adaptation;
  }

  async list(generationId: string): Promise<AdaptationRecord[]> {
    try {
      const dir = join(this.paths.lineage, generationId, "adaptations");
      const entries = await readdir(dir);
      const adaptations: AdaptationRecord[] = [];
      for (const entry of entries.filter(e => e.endsWith(".yml"))) {
        const content = await readTextFileOrThrow(join(dir, entry));
        adaptations.push(YAML.parse(content) as AdaptationRecord);
      }
      return adaptations.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } catch {
      return [];
    }
  }
}
