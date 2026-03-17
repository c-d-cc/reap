import YAML from "yaml";
import { readdir, mkdir, rename } from "fs/promises";
import { join } from "path";
import type { GenerationState } from "../types";
import type { ReapPaths } from "./paths";
import { LifeCycle } from "./lifecycle";
import { compressLineageIfNeeded } from "./compression";
import { readTextFile, writeTextFile } from "./fs";

export class GenerationManager {
  constructor(private paths: ReapPaths) {}

  async current(): Promise<GenerationState | null> {
    const content = await readTextFile(this.paths.currentYml);
    if (content === null || !content.trim()) return null;
    return YAML.parse(content) as GenerationState;
  }

  async create(goal: string, genomeVersion: number): Promise<GenerationState> {
    const id = await this.nextGenId();
    const now = new Date().toISOString();
    const state: GenerationState = {
      id,
      goal,
      stage: "objective",
      genomeVersion,
      startedAt: now,
      timeline: [{ stage: "objective", at: now }],
    };
    await writeTextFile(this.paths.currentYml, YAML.stringify(state));
    return state;
  }

  async advance(): Promise<GenerationState> {
    const state = await this.current();
    if (!state) throw new Error("No active generation");

    const next = LifeCycle.next(state.stage);
    if (!next) throw new Error(`Cannot advance from ${state.stage}`);

    state.stage = next;
    if (!state.timeline) state.timeline = [];
    state.timeline.push({ stage: next, at: new Date().toISOString() });
    await writeTextFile(this.paths.currentYml, YAML.stringify(state));
    return state;
  }

  async complete(): Promise<{ level1: string[]; level2: string[] }> {
    const state = await this.current();
    if (!state) throw new Error("No active generation");
    if (state.stage !== "completion") throw new Error("Generation must be in completion stage to complete");

    // Generate lineage directory name
    const goalSlug = state.goal
      .toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "")
      .slice(0, 30);
    const genDirName = `${state.id}-${goalSlug}`;
    const genDir = this.paths.generationDir(genDirName);
    await mkdir(genDir, { recursive: true });

    // Move artifacts from life/ to lineage/
    const lifeEntries = await readdir(this.paths.life);
    for (const entry of lifeEntries) {
      if (/^\d{2}-[a-z]+(?:-[a-z]+)*\.md$/.test(entry)) {
        await rename(
          join(this.paths.life, entry),
          join(genDir, entry),
        );
      }
    }

    // Move backlog/ to lineage (genome-change items were already consumed in Closure)
    const backlogDir = join(genDir, "backlog");
    await mkdir(backlogDir, { recursive: true });
    try {
      const backlogEntries = await readdir(this.paths.backlog);
      for (const entry of backlogEntries) {
        await rename(
          join(this.paths.backlog, entry),
          join(backlogDir, entry),
        );
      }
    } catch { /* no backlog items */ }

    // Also move legacy mutations/ if present (backward compat)
    try {
      const mutEntries = await readdir(this.paths.mutations);
      if (mutEntries.length > 0) {
        const mutDir = join(genDir, "mutations");
        await mkdir(mutDir, { recursive: true });
        for (const entry of mutEntries) {
          await rename(
            join(this.paths.mutations, entry),
            join(mutDir, entry),
          );
        }
      }
    } catch { /* no mutations dir */ }

    // Clear current
    await writeTextFile(this.paths.currentYml, "");

    // Compress lineage if needed
    const compression = await compressLineageIfNeeded(this.paths);
    return compression;
  }

  async save(state: GenerationState): Promise<void> {
    await writeTextFile(this.paths.currentYml, YAML.stringify(state));
  }

  async listCompleted(): Promise<string[]> {
    try {
      const entries = await readdir(this.paths.lineage);
      return entries.filter(e => e.startsWith("gen-")).sort();
    } catch {
      return [];
    }
  }

  async nextGenId(): Promise<string> {
    const genDirs = await this.listCompleted();
    if (genDirs.length === 0) {
      const current = await this.current();
      if (current) {
        const num = parseInt(current.id.replace("gen-", ""), 10);
        return `gen-${String(num + 1).padStart(3, "0")}`;
      }
      return "gen-001";
    }
    const last = genDirs[genDirs.length - 1];
    const num = parseInt(last.replace("gen-", ""), 10);
    return `gen-${String(num + 1).padStart(3, "0")}`;
  }
}
