import YAML from "yaml";
import { readdir } from "fs/promises";
import { join } from "path";
import type { GenerationMeta } from "../types";
import type { ReapPaths } from "./paths";
import { readTextFile } from "./fs";
import { parseFrontmatter } from "./compression";
import { parseGenSeq } from "./generation";

/** List completed generation directory names in lineage/ */
export async function listCompleted(paths: ReapPaths): Promise<string[]> {
  try {
    const entries = await readdir(paths.lineage);
    return entries.filter(e => e.startsWith("gen-")).sort();
  } catch {
    return [];
  }
}

/** List generation IDs compressed into epoch.md */
export async function listEpochGenerations(paths: ReapPaths): Promise<string[]> {
  const epochPath = join(paths.lineage, "epoch.md");
  const content = await readTextFile(epochPath);
  if (!content) return [];
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return [];
  try {
    const meta = YAML.parse(match[1]) as { generations?: Array<{ id: string }> } | null;
    if (!meta?.generations) return [];
    return meta.generations.map(g => g.id).filter(Boolean);
  } catch {
    return [];
  }
}

/** Count all completed generations (gen-* entries + epoch.md generations) */
export async function countAllCompleted(paths: ReapPaths): Promise<number> {
  const genDirs = await listCompleted(paths);
  const epochGens = await listEpochGenerations(paths);
  return genDirs.length + epochGens.length;
}

/** Read meta.yml from a lineage directory */
export async function readMeta(paths: ReapPaths, lineageDirName: string): Promise<GenerationMeta | null> {
  const metaPath = join(paths.lineage, lineageDirName, "meta.yml");
  const content = await readTextFile(metaPath);
  if (content === null) return null;
  return YAML.parse(content) as GenerationMeta;
}

/** List all generation metadata (DAG-aware, reads both directories and compressed .md) */
export async function listMeta(paths: ReapPaths): Promise<GenerationMeta[]> {
  const metas: GenerationMeta[] = [];
  try {
    const entries = await readdir(paths.lineage, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith("gen-")) {
        const meta = await readMeta(paths, entry.name);
        if (meta) metas.push(meta);
      } else if (entry.isFile() && entry.name.startsWith("gen-") && entry.name.endsWith(".md")) {
        const content = await readTextFile(join(paths.lineage, entry.name));
        if (content) {
          const meta = parseFrontmatter(content);
          if (meta) metas.push(meta);
        }
      }
    }
  } catch { /* lineage dir may not exist */ }
  return metas;
}

/** Calculate next sequence number from lineage */
export async function nextSeq(paths: ReapPaths, currentId?: string): Promise<number> {
  const genDirs = await listCompleted(paths);
  const epochGens = await listEpochGenerations(paths);
  const allIds = [...genDirs, ...epochGens];
  if (allIds.length === 0) {
    if (currentId) {
      return parseGenSeq(currentId) + 1;
    }
    return 1;
  }
  let maxSeq = 0;
  for (const id of allIds) {
    const seq = parseGenSeq(id);
    if (seq > maxSeq) maxSeq = seq;
  }
  return maxSeq + 1;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;

/** Safe completedAt to timestamp — returns 0 for non-ISO or invalid dates */
export function safeCompletedAtTime(dateStr: string): number {
  if (!ISO_DATE_RE.test(dateStr)) return 0;
  const t = new Date(dateStr).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** Resolve parent generation IDs (most recently completed) */
export async function resolveParents(paths: ReapPaths): Promise<string[]> {
  const metas = await listMeta(paths);
  if (metas.length > 0) {
    const sorted = metas.sort((a, b) =>
      safeCompletedAtTime(b.completedAt) - safeCompletedAtTime(a.completedAt)
    );
    return [sorted[0].id];
  }
  const dirs = await listCompleted(paths);
  if (dirs.length > 0) {
    const lastDir = dirs[dirs.length - 1];
    const legacyId = lastDir.match(/^(gen-\d{3}(?:-[a-f0-9]{6})?)/)?.[1];
    if (legacyId) return [legacyId];
  }
  return [];
}
