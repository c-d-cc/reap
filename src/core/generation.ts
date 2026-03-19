import YAML from "yaml";
import { createHash } from "crypto";
import { hostname } from "os";
import { readdir, mkdir, rename } from "fs/promises";
import { join } from "path";
import type { GenerationState, GenerationMeta } from "../types";
import type { ReapPaths } from "./paths";
import { LifeCycle } from "./lifecycle";
import { compressLineageIfNeeded } from "./compression";
import { readTextFile, writeTextFile } from "./fs";

// ── Hash utilities ──────────────────────────────────────────

/** Generate a 6-char hex hash for a generation ID */
export function generateGenHash(
  parents: string[],
  goal: string,
  genomeHash: string,
  machineId: string,
  startedAt: string,
): string {
  const input = JSON.stringify({ parents, goal, genomeHash, machineId, startedAt });
  return createHash("sha256").update(input).digest("hex").slice(0, 6);
}

/** Get a stable machine identifier */
export function getMachineId(): string {
  return hostname();
}

/** Compute content hash of genome/ directory */
export async function computeGenomeHash(genomePath: string): Promise<string> {
  const hash = createHash("sha256");
  try {
    const entries = (await readdir(genomePath, { recursive: true, withFileTypes: true }))
      .filter(e => e.isFile())
      .sort((a, b) => {
        const pathA = join(e2path(a), a.name);
        const pathB = join(e2path(b), b.name);
        return pathA.localeCompare(pathB);
      });
    for (const entry of entries) {
      const filePath = join(e2path(entry), entry.name);
      const content = await readTextFile(filePath);
      if (content !== null) {
        hash.update(filePath.replace(genomePath, ""));
        hash.update(content);
      }
    }
  } catch { /* genome dir may not exist */ }
  return hash.digest("hex").slice(0, 8);
}

function e2path(entry: { parentPath?: string; path?: string }): string {
  // Bun uses `path`, Node 20+ uses `parentPath`
  return (entry as any).parentPath ?? (entry as any).path ?? "";
}

/** Format generation ID: gen-{seq}-{hash} */
export function formatGenId(seq: number, hash: string): string {
  return `gen-${String(seq).padStart(3, "0")}-${hash}`;
}

/** Extract seq number from a generation ID (supports both legacy and new format) */
export function parseGenSeq(id: string): number {
  const match = id.match(/^gen-(\d{3})/);
  return match ? parseInt(match[1], 10) : 0;
}

/** Extract hash from a generation ID (returns null for legacy format) */
export function parseGenHash(id: string): string | null {
  const match = id.match(/^gen-\d{3}-([a-f0-9]{6})$/);
  return match ? match[1] : null;
}

/** Check if an ID is in legacy format (gen-NNN without hash) */
export function isLegacyId(id: string): boolean {
  return /^gen-\d{3}$/.test(id);
}

// ── GenerationManager ───────────────────────────────────────

export class GenerationManager {
  constructor(private paths: ReapPaths) {}

  async current(): Promise<GenerationState | null> {
    const content = await readTextFile(this.paths.currentYml);
    if (content === null || !content.trim()) return null;
    const state = YAML.parse(content) as GenerationState;
    // Backward compat: ensure new fields have defaults
    if (!state.type) state.type = "normal";
    if (!state.parents) state.parents = [];
    return state;
  }

  async create(goal: string, genomeVersion: number): Promise<GenerationState> {
    const seq = await this.nextSeq();
    const now = new Date().toISOString();
    const genomeHash = await computeGenomeHash(this.paths.genome);
    const machineId = getMachineId();
    const parents = await this.resolveParents();
    const hash = generateGenHash(parents, goal, genomeHash, machineId, now);
    const id = formatGenId(seq, hash);

    const state: GenerationState = {
      id,
      goal,
      stage: "objective",
      genomeVersion,
      startedAt: now,
      timeline: [{ stage: "objective", at: now }],
      type: "normal",
      parents,
      genomeHash,
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

    const now = new Date().toISOString();
    state.completedAt = now;

    // Generate lineage directory name
    const goalSlug = state.goal
      .toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "")
      .slice(0, 30);
    const genDirName = `${state.id}-${goalSlug}`;
    const genDir = this.paths.generationDir(genDirName);
    await mkdir(genDir, { recursive: true });

    // Write meta.yml for DAG structure
    const meta: GenerationMeta = {
      id: state.id,
      type: state.type ?? "normal",
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

  /** Read meta.yml from a lineage directory */
  async readMeta(lineageDirName: string): Promise<GenerationMeta | null> {
    const metaPath = join(this.paths.lineage, lineageDirName, "meta.yml");
    const content = await readTextFile(metaPath);
    if (content === null) return null;
    return YAML.parse(content) as GenerationMeta;
  }

  /** List all generation metadata (DAG-aware) */
  async listMeta(): Promise<GenerationMeta[]> {
    const dirs = await this.listCompleted();
    const metas: GenerationMeta[] = [];
    for (const dir of dirs) {
      // Only directories (not compressed .md files)
      const meta = await this.readMeta(dir);
      if (meta) metas.push(meta);
    }
    return metas;
  }

  /** Resolve parent generation IDs for a new generation */
  private async resolveParents(): Promise<string[]> {
    // Find the most recently completed generation
    const metas = await this.listMeta();
    if (metas.length > 0) {
      // Sort by completedAt descending
      const sorted = metas.sort((a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
      return [sorted[0].id];
    }
    // Fallback: check lineage dirs for legacy entries (no meta.yml)
    const dirs = await this.listCompleted();
    if (dirs.length > 0) {
      const lastDir = dirs[dirs.length - 1];
      const legacyId = lastDir.match(/^(gen-\d{3}(?:-[a-f0-9]{6})?)/)?.[1];
      if (legacyId) return [legacyId];
    }
    return [];
  }

  /** Calculate next sequence number */
  async nextSeq(): Promise<number> {
    const genDirs = await this.listCompleted();
    if (genDirs.length === 0) {
      const current = await this.current();
      if (current) {
        return parseGenSeq(current.id) + 1;
      }
      return 1;
    }
    // Find the highest seq number across all entries
    let maxSeq = 0;
    for (const dir of genDirs) {
      const seq = parseGenSeq(dir);
      if (seq > maxSeq) maxSeq = seq;
    }
    return maxSeq + 1;
  }

  /**
   * @deprecated Use nextSeq() + formatGenId() instead.
   * Kept for backward compatibility with slash command templates.
   */
  async nextGenId(): Promise<string> {
    const seq = await this.nextSeq();
    return `gen-${String(seq).padStart(3, "0")}`;
  }
}
