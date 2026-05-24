import { readdir, stat } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";
import YAML from "yaml";
import type { ReapPaths } from "./paths.js";
import { readTextFile } from "./fs.js";

export interface LineageMeta {
  id: string;
  type: string;
  goal: string;
  parents: string[];
  dirName: string;
}

export interface GenomeDiff {
  conflicts: GenomeConflict[];
  aOnly: string[];
  bOnly: string[];
}

export interface GenomeConflict {
  file: string;
  parentA: string;
  parentB: string;
  ancestor: string;
}

// ── Git utilities ──────────────────────────────────────────

export function gitShow(cwd: string, ref: string, path: string): string | null {
  try {
    return execSync(`git show ${ref}:${path}`, { cwd, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] });
  } catch {
    return null;
  }
}

export function gitMergeBase(cwd: string, refA: string, refB: string): string | null {
  try {
    return execSync(`git merge-base ${refA} ${refB}`, { cwd, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
}

// ── Git-based genome diff ──────────────────────────────────

export function findCommonAncestor(cwd: string, refA: string, refB: string): string | null {
  return gitMergeBase(cwd, refA, refB);
}

export function extractGenomeDiff(
  cwd: string,
  refA: string,
  refB: string,
  ancestorRef: string | null,
): GenomeDiff {
  const genomeFiles = ["application.md", "evolution.md", "invariants.md"];
  const conflicts: GenomeConflict[] = [];
  const aOnly: string[] = [];
  const bOnly: string[] = [];

  for (const file of genomeFiles) {
    const genomePath = `.reap/genome/${file}`;
    const contentA = gitShow(cwd, refA, genomePath);
    const contentB = gitShow(cwd, refB, genomePath);
    const contentAnc = ancestorRef ? gitShow(cwd, ancestorRef, genomePath) : null;

    if (contentA === contentB) continue;

    if (contentA && !contentB) {
      aOnly.push(file);
    } else if (!contentA && contentB) {
      bOnly.push(file);
    } else if (contentA !== contentAnc && contentB !== contentAnc) {
      conflicts.push({
        file,
        parentA: contentA ?? "",
        parentB: contentB ?? "",
        ancestor: contentAnc ?? "",
      });
    } else if (contentA !== contentAnc) {
      aOnly.push(file);
    } else {
      bOnly.push(file);
    }
  }

  return { conflicts, aOnly, bOnly };
}

// ── Lineage meta utilities (still useful for context) ──────

export async function readLineageMetas(lineagePath: string): Promise<LineageMeta[]> {
  let entries: string[];
  try {
    entries = await readdir(lineagePath);
  } catch {
    return [];
  }

  const genDirs = entries.filter((e) => e.startsWith("gen-")).sort();
  const metas: LineageMeta[] = [];

  for (const dir of genDirs) {
    const metaContent = await readTextFile(join(lineagePath, dir, "meta.yml"));
    if (!metaContent) continue;

    const meta = YAML.parse(metaContent) as Record<string, unknown>;
    metas.push({
      id: (meta.id as string) ?? dir,
      type: (meta.type as string) ?? "normal",
      goal: (meta.goal as string) ?? "",
      parents: (meta.parents as string[]) ?? [],
      dirName: dir,
    });
  }

  return metas;
}

export function findLineageDir(metas: LineageMeta[], genId: string): string | null {
  const meta = metas.find((m) => m.id === genId);
  return meta?.dirName ?? null;
}

// ── Last lineage entry (for early-close hint propagation) ───

export interface LastLineageEntry {
  id: string;
  status?: string;
  goal?: string;
  dirName: string;
  closeMeta?: {
    reason?: string;
    closedAtStage?: string;
    completedTasks?: number;
    deferredTasks?: number;
    deferredBacklogFile?: string;
  };
}

/**
 * Read the most recent lineage entry (sorted by generation directory name).
 *
 * Returns null if no entry exists or if the latest entry is a compressed
 * `.md` file (no meta.yml). Used by `reap run start` to surface a hint when
 * the previous generation was early-closed.
 */
export async function getLastLineageEntry(paths: ReapPaths): Promise<LastLineageEntry | null> {
  let entries: string[];
  try {
    entries = await readdir(paths.lineage);
  } catch {
    return null;
  }

  const genEntries = entries.filter((e) => e.startsWith("gen-")).sort();
  if (genEntries.length === 0) return null;

  const last = genEntries[genEntries.length - 1];
  const lastPath = join(paths.lineage, last);

  // Only consider directories (compressed entries are .md files w/o meta.yml).
  try {
    const st = await stat(lastPath);
    if (!st.isDirectory()) return null;
  } catch {
    return null;
  }

  const metaContent = await readTextFile(join(lastPath, "meta.yml"));
  if (!metaContent) return null;

  let parsed: Record<string, unknown>;
  try {
    parsed = (YAML.parse(metaContent) as Record<string, unknown>) ?? {};
  } catch {
    return null;
  }

  const closeMetaRaw = parsed.closeMeta as Record<string, unknown> | undefined;
  const result: LastLineageEntry = {
    id: (parsed.id as string) ?? last,
    dirName: last,
    status: parsed.status as string | undefined,
    goal: parsed.goal as string | undefined,
  };
  if (closeMetaRaw) {
    result.closeMeta = {
      reason: closeMetaRaw.reason as string | undefined,
      closedAtStage: closeMetaRaw.closedAtStage as string | undefined,
      completedTasks: closeMetaRaw.completedTasks as number | undefined,
      deferredTasks: closeMetaRaw.deferredTasks as number | undefined,
      deferredBacklogFile: closeMetaRaw.deferredBacklogFile as string | undefined,
    };
  }
  return result;
}

