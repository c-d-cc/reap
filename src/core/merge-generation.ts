import YAML from "yaml";
import { readdir, mkdir, rename } from "fs/promises";
import { join } from "path";
import type { GenerationState, GenerationMeta, MergeStage } from "../types";
import type { ReapPaths } from "./paths";
import { MergeLifeCycle } from "./merge-lifecycle";
import { compressLineageIfNeeded } from "./compression";
import { readTextFile, writeTextFile } from "./fs";
import { generateGenHash, getMachineId, computeGenomeHash, formatGenId } from "./generation";
import { gitShow, gitLsTree, gitRefExists, gitCurrentBranch } from "./git";
import { detectDivergenceFromRefs, type DivergenceReport } from "./merge";
import * as lineageUtils from "./lineage";
import { parseFrontmatter } from "./compression";

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

  /** Create a merge generation from a target branch, using git refs for detection */
  async createFromBranch(
    targetBranch: string,
    projectRoot: string,
  ): Promise<{ state: GenerationState; report: DivergenceReport }> {
    const currentBranch = gitCurrentBranch(projectRoot);
    if (!currentBranch) throw new Error("Cannot determine current branch");
    if (!gitRefExists(targetBranch, projectRoot)) {
      throw new Error(`Branch "${targetBranch}" does not exist. Run "git fetch" first.`);
    }

    // Read lineage from both branches to find parent generation IDs
    const localParent = await this.resolveLatestGenId(currentBranch, projectRoot);
    const remoteParent = this.resolveLatestGenIdFromRef(targetBranch, projectRoot);

    if (!localParent) throw new Error("No completed generation found on current branch");
    if (!remoteParent) throw new Error(`No completed generation found on branch "${targetBranch}"`);

    const parents = [localParent, remoteParent];

    // Collect all metas from both branches for LCA search
    const localMetas = await lineageUtils.listMeta(this.paths);
    const remoteMetas = this.listMetaFromRef(targetBranch, projectRoot);
    const allMetas = this.mergeMetaLists(localMetas, remoteMetas);

    const commonAncestor = findCommonAncestor(localParent, remoteParent, allMetas);

    // Find the common ancestor's ref (it should exist on both branches)
    const ancestorRef = commonAncestor ? this.findRefForGeneration(commonAncestor, currentBranch, targetBranch, projectRoot) : currentBranch;

    // Run detect using git refs
    const genomePath = ".reap/genome";
    const report = detectDivergenceFromRefs(
      ancestorRef, currentBranch, targetBranch,
      genomePath, projectRoot,
      commonAncestor, localParent, remoteParent,
    );

    // Create the merge generation state
    const currentState = await this.current();
    const seq = await lineageUtils.nextSeq(this.paths, currentState?.id);
    const now = new Date().toISOString();
    const genomeHash = await computeGenomeHash(this.paths.genome);
    const machineId = getMachineId();
    const hash = generateGenHash(parents, `merge ${currentBranch} + ${targetBranch}`, genomeHash, machineId, now);
    const id = formatGenId(seq, hash);
    const goal = `Merge ${currentBranch} + ${targetBranch}`;

    const state: GenerationState = {
      id,
      goal,
      stage: "detect",
      genomeVersion: allMetas.length + 1,
      startedAt: now,
      timeline: [{ stage: "detect", at: now }],
      type: "merge",
      parents,
      genomeHash,
      commonAncestor: commonAncestor ?? undefined,
    };
    await writeTextFile(this.paths.currentYml, YAML.stringify(state));
    return { state, report };
  }

  /** Resolve the latest generation ID from local lineage */
  private async resolveLatestGenId(branch: string, cwd: string): Promise<string | null> {
    const metas = await lineageUtils.listMeta(this.paths);
    if (metas.length === 0) return null;
    const sorted = metas.sort((a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    return sorted[0].id;
  }

  /** Resolve the latest generation ID from a remote branch's lineage via git ref */
  private resolveLatestGenIdFromRef(ref: string, cwd: string): string | null {
    const metas = this.listMetaFromRef(ref, cwd);
    if (metas.length === 0) return null;
    const sorted = metas.sort((a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    return sorted[0].id;
  }

  /** List generation metadata from a git ref */
  private listMetaFromRef(ref: string, cwd: string): GenerationMeta[] {
    const metas: GenerationMeta[] = [];
    const entries = gitLsTree(ref, ".reap/lineage", cwd);
    // Find meta.yml files
    const metaFiles = entries.filter(e => e.endsWith("/meta.yml"));
    for (const metaFile of metaFiles) {
      const content = gitShow(ref, metaFile, cwd);
      if (content) {
        try {
          const meta = YAML.parse(content) as GenerationMeta;
          if (meta?.id) metas.push(meta);
        } catch { /* invalid yaml */ }
      }
    }
    // Also check compressed .md files
    const mdFiles = entries.filter(e =>
      e.startsWith(".reap/lineage/gen-") && e.endsWith(".md") && !e.includes("/")
    );
    for (const mdFile of mdFiles) {
      const content = gitShow(ref, mdFile, cwd);
      if (content) {
        const meta = parseFrontmatter(content);
        if (meta) metas.push(meta);
      }
    }
    return metas;
  }

  /** Merge two meta lists, deduplicating by id */
  private mergeMetaLists(a: GenerationMeta[], b: GenerationMeta[]): GenerationMeta[] {
    const map = new Map<string, GenerationMeta>();
    for (const m of a) map.set(m.id, m);
    for (const m of b) map.set(m.id, m);
    return Array.from(map.values());
  }

  /** Find which ref contains a generation (for common ancestor lookup) */
  private findRefForGeneration(genId: string, refA: string, refB: string, cwd: string): string {
    // Check refA first
    const entriesA = gitLsTree(refA, ".reap/lineage", cwd);
    if (entriesA.some(e => e.includes(genId))) return refA;
    // Then refB
    const entriesB = gitLsTree(refB, ".reap/lineage", cwd);
    if (entriesB.some(e => e.includes(genId))) return refB;
    // Fallback to refA
    return refA;
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
