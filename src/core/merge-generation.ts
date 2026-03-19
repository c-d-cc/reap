import YAML from "yaml";
import { readdir, mkdir, rename } from "fs/promises";
import { join } from "path";
import type { GenerationState, GenerationMeta, MergeStage } from "../types";
import type { ReapPaths } from "./paths";
import { MergeLifeCycle } from "./merge-lifecycle";
import { compressLineageIfNeeded } from "./compression";
import { readTextFile, writeTextFile } from "./fs";
import { generateGenHash, getMachineId, computeGenomeHash, formatGenId } from "./generation";
import * as lineageUtils from "./lineage";

export class MergeGenerationManager {
  constructor(private paths: ReapPaths) {}

  async current(): Promise<GenerationState | null> {
    const content = await readTextFile(this.paths.currentYml);
    if (content === null || !content.trim()) return null;
    const state = YAML.parse(content) as GenerationState;
    if (!state.type) state.type = "normal";
    if (!state.parents) state.parents = [];
    return state;
  }

  async create(parents: string[], goal: string): Promise<GenerationState> {
    if (parents.length < 2) {
      throw new Error("Merge generation requires at least 2 parents");
    }

    const metas = await lineageUtils.listMeta(this.paths);
    const commonAncestor = findCommonAncestor(parents[0], parents[1], metas);

    const currentState = await this.current();
    const seq = await lineageUtils.nextSeq(this.paths, currentState?.id);
    const now = new Date().toISOString();
    const genomeHash = await computeGenomeHash(this.paths.genome);
    const machineId = getMachineId();
    const hash = generateGenHash(parents, goal, genomeHash, machineId, now);
    const id = formatGenId(seq, hash);

    const genomeVersion = metas.length + 1;

    const state: GenerationState = {
      id,
      goal,
      stage: "detect",
      genomeVersion,
      startedAt: now,
      timeline: [{ stage: "detect", at: now }],
      type: "merge",
      parents,
      genomeHash,
      commonAncestor: commonAncestor ?? undefined,
    };
    await writeTextFile(this.paths.currentYml, YAML.stringify(state));
    return state;
  }

  async advance(): Promise<GenerationState> {
    const state = await this.current();
    if (!state) throw new Error("No active generation");
    if (state.type !== "merge") throw new Error("Not a merge generation");

    const next = MergeLifeCycle.next(state.stage as MergeStage);
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
    if (state.type !== "merge") throw new Error("Not a merge generation");
    if (state.stage !== "completion") throw new Error("Generation must be in completion stage");

    const now = new Date().toISOString();
    state.completedAt = now;

    const goalSlug = state.goal
      .toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "")
      .slice(0, 30);
    const genDirName = `${state.id}-${goalSlug}`;
    const genDir = this.paths.generationDir(genDirName);
    await mkdir(genDir, { recursive: true });

    const meta: GenerationMeta = {
      id: state.id,
      type: "merge",
      parents: state.parents ?? [],
      goal: state.goal,
      genomeHash: state.genomeHash ?? "unknown",
      startedAt: state.startedAt,
      completedAt: now,
    };
    await writeTextFile(join(genDir, "meta.yml"), YAML.stringify(meta));

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

    // Move backlog/ to lineage
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

    // Clear current
    await writeTextFile(this.paths.currentYml, "");

    const compression = await compressLineageIfNeeded(this.paths);
    return compression;
  }

  async save(state: GenerationState): Promise<void> {
    await writeTextFile(this.paths.currentYml, YAML.stringify(state));
  }
}

// ── Merge utilities ─────────────────────────────────────────

/** Find the common ancestor of two generations using BFS on DAG */
export function findCommonAncestor(
  idA: string,
  idB: string,
  metas: GenerationMeta[],
): string | null {
  const metaMap = new Map<string, GenerationMeta>();
  for (const m of metas) metaMap.set(m.id, m);

  // BFS ancestors of A
  const ancestorsA = new Set<string>();
  const queueA = [idA];
  while (queueA.length > 0) {
    const id = queueA.shift()!;
    if (ancestorsA.has(id)) continue;
    ancestorsA.add(id);
    const meta = metaMap.get(id);
    if (meta?.parents) {
      for (const p of meta.parents) queueA.push(p);
    }
  }

  // BFS ancestors of B, first match in A's ancestors is LCA
  const visited = new Set<string>();
  const queueB = [idB];
  while (queueB.length > 0) {
    const id = queueB.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    if (ancestorsA.has(id)) return id;
    const meta = metaMap.get(id);
    if (meta?.parents) {
      for (const p of meta.parents) queueB.push(p);
    }
  }

  return null;
}
