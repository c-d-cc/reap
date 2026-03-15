import YAML from "yaml";
import { readdir, mkdir } from "fs/promises";
import type { GenerationState } from "../types";
import type { ReapPaths } from "./paths";
import { LifeCycle } from "./lifecycle";

export class GenerationManager {
  constructor(private paths: ReapPaths) {}

  async current(): Promise<GenerationState | null> {
    const file = Bun.file(this.paths.currentYml);
    if (!(await file.exists())) return null;
    const content = await file.text();
    if (!content.trim()) return null;
    return YAML.parse(content) as GenerationState;
  }

  async create(goal: string, genomeVersion: number): Promise<GenerationState> {
    const id = await this.nextGenId();
    const state: GenerationState = {
      id,
      goal,
      stage: "conception",
      genomeVersion,
      startedAt: new Date().toISOString(),
    };
    await Bun.write(this.paths.currentYml, YAML.stringify(state));
    return state;
  }

  async advance(): Promise<GenerationState> {
    const state = await this.current();
    if (!state) throw new Error("No active generation");

    const next = LifeCycle.next(state.stage);
    if (!next) throw new Error(`Cannot advance from ${state.stage}`);

    state.stage = next;
    if (LifeCycle.isComplete(next)) {
      state.completedAt = new Date().toISOString();
    }
    await Bun.write(this.paths.currentYml, YAML.stringify(state));
    return state;
  }

  async complete(): Promise<void> {
    const state = await this.current();
    if (!state) throw new Error("No active generation");
    if (state.stage !== "legacy") throw new Error("Generation must be in legacy stage to complete");

    // Move to lineage
    const genDir = this.paths.generationDir(state.id);
    await mkdir(genDir, { recursive: true });
    await mkdir(this.paths.adaptationsDir(state.id), { recursive: true });
    await Bun.write(`${genDir}/summary.md`, `# ${state.id}\n\n**Goal:** ${state.goal}\n**Genome Version:** ${state.genomeVersion}\n**Started:** ${state.startedAt}\n**Completed:** ${state.completedAt}\n`);

    // Clear current
    await Bun.write(this.paths.currentYml, "");
  }

  async save(state: GenerationState): Promise<void> {
    await Bun.write(this.paths.currentYml, YAML.stringify(state));
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
