import { createHash } from "crypto";
import { hostname } from "os";
import { readdir } from "fs/promises";
import YAML from "yaml";
import type { ReapPaths } from "./paths.js";
import type { GenerationState, GenerationType } from "../types/index.js";
import { readTextFile, writeTextFile, ensureDir } from "./fs.js";
import { generateToken } from "./nonce.js";

export class GenerationManager {
  constructor(private paths: ReapPaths) {}

  async current(): Promise<GenerationState | null> {
    const content = await readTextFile(this.paths.current);
    if (!content) return null;
    return YAML.parse(content) as GenerationState;
  }

  async save(state: GenerationState): Promise<void> {
    const header = "# REAP MANAGED — Do not modify directly.\n";
    await writeTextFile(this.paths.current, header + YAML.stringify(state));
  }

  async create(goal: string, type: GenerationType = "embryo"): Promise<GenerationState> {
    await ensureDir(this.paths.life);
    await ensureDir(this.paths.backlog);

    const parents = await this.lastGenerationIds();
    const startedAt = new Date().toISOString();
    const genHash = generateGenHash(parents, goal, hostname(), startedAt);
    const genNumber = (await this.countLineage()) + 1;
    const id = `gen-${String(genNumber).padStart(3, "0")}-${genHash}`;

    const { nonce, hash } = generateToken(id, "learning", "entry");

    const state: GenerationState = {
      id,
      type,
      stage: "learning",
      goal,
      parents,
      timeline: [{ stage: "learning", at: startedAt }],
      lastNonce: nonce,
      expectedHash: hash,
      phase: "entry",
    };

    await this.save(state);
    return state;
  }

  async createMerge(goal: string, parentIds: string[]): Promise<GenerationState> {
    await ensureDir(this.paths.life);
    await ensureDir(this.paths.backlog);

    const startedAt = new Date().toISOString();
    const genHash = generateGenHash(parentIds, goal, hostname(), startedAt);
    const genNumber = (await this.countLineage()) + 1;
    const id = `gen-${String(genNumber).padStart(3, "0")}-${genHash}`;

    const { nonce, hash } = generateToken(id, "detect", "entry");

    const state: GenerationState = {
      id,
      type: "merge",
      stage: "detect",
      goal,
      parents: parentIds,
      timeline: [{ stage: "detect", at: startedAt }],
      lastNonce: nonce,
      expectedHash: hash,
      phase: "entry",
    };

    await this.save(state);
    return state;
  }

  async countLineage(): Promise<number> {
    try {
      const entries = await readdir(this.paths.lineage);
      return entries.filter((e) => e.startsWith("gen-")).length;
    } catch {
      return 0;
    }
  }

  private async lastGenerationIds(): Promise<string[]> {
    try {
      const entries = await readdir(this.paths.lineage);
      const gens = entries.filter((e) => e.startsWith("gen-")).sort();
      if (gens.length === 0) return [];
      const last = gens[gens.length - 1];
      // Extract gen ID from directory name (gen-001-abc123-goal-summary → gen-001-abc123)
      const match = last.match(/^(gen-\d+-[a-f0-9]+)/);
      return match ? [match[1]] : [last];
    } catch {
      return [];
    }
  }
}

function generateGenHash(
  parents: string[],
  goal: string,
  machineId: string,
  startedAt: string,
): string {
  const input = JSON.stringify({ parents, goal, machineId, startedAt });
  return createHash("sha256").update(input).digest("hex").slice(0, 6);
}
