import YAML from "yaml";
import { readdir, unlink } from "fs/promises";
import { join } from "path";
import type { MutationRecord } from "../types";
import type { ReapPaths } from "./paths";

export class MutationManager {
  constructor(private paths: ReapPaths) {}

  async record(generationId: string, file: string, description: string): Promise<MutationRecord> {
    const id = `mut-${Date.now()}`;
    const mutation: MutationRecord = {
      id, generationId, file, description,
      createdAt: new Date().toISOString(),
    };
    await Bun.write(
      join(this.paths.mutations, `${id}.yml`),
      YAML.stringify(mutation),
    );
    return mutation;
  }

  async list(): Promise<MutationRecord[]> {
    try {
      const entries = await readdir(this.paths.mutations);
      const mutations: MutationRecord[] = [];
      for (const entry of entries.filter(e => e.endsWith(".yml"))) {
        const content = await Bun.file(join(this.paths.mutations, entry)).text();
        mutations.push(YAML.parse(content) as MutationRecord);
      }
      return mutations.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } catch {
      return [];
    }
  }

  async clear(): Promise<void> {
    const entries = await readdir(this.paths.mutations);
    for (const entry of entries.filter(e => e.endsWith(".yml"))) {
      await unlink(join(this.paths.mutations, entry));
    }
  }
}
