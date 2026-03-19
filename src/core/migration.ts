import YAML from "yaml";
import { readdir, mkdir, rename } from "fs/promises";
import { join } from "path";
import type { GenerationMeta, GenerationState } from "../types";
import type { ReapPaths } from "./paths";
import { readTextFile, writeTextFile } from "./fs";
import { generateGenHash, formatGenId, parseGenSeq, isLegacyId } from "./generation";

export interface MigrationResult {
  migrated: string[];   // "gen-001 → gen-001-a3f8c2"
  skipped: string[];    // already has meta.yml
  errors: string[];
}

/** Check if lineage needs migration (any directory without meta.yml) */
export async function needsMigration(paths: ReapPaths): Promise<boolean> {
  try {
    const entries = await readdir(paths.lineage, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || !entry.name.startsWith("gen-")) continue;
      const metaPath = join(paths.lineage, entry.name, "meta.yml");
      const content = await readTextFile(metaPath);
      if (content === null) return true;
    }
  } catch {
    return false;
  }
  return false;
}

/** Migrate legacy lineage entries to new DAG format with hash IDs */
export async function migrateLineage(paths: ReapPaths): Promise<MigrationResult> {
  const result: MigrationResult = { migrated: [], skipped: [], errors: [] };

  let entries: string[];
  try {
    const dirEntries = await readdir(paths.lineage, { withFileTypes: true });
    entries = dirEntries
      .filter(e => e.isDirectory() && e.name.startsWith("gen-"))
      .map(e => e.name)
      .sort();
  } catch {
    return result;
  }

  // Build migration plan: collect all entries that need migration
  const plan: { dirName: string; seq: number; goal: string; hasMeta: boolean }[] = [];
  for (const dirName of entries) {
    const metaPath = join(paths.lineage, dirName, "meta.yml");
    const metaContent = await readTextFile(metaPath);
    const seq = parseGenSeq(dirName);

    // Extract goal from 01-objective.md or directory name slug
    let goal = "";
    const objContent = await readTextFile(join(paths.lineage, dirName, "01-objective.md"));
    if (objContent) {
      const goalMatch = objContent.match(/## Goal\n+([\s\S]*?)(?=\n##)/);
      if (goalMatch) goal = goalMatch[1].trim();
    }
    if (!goal) {
      // Fallback: extract slug from directory name
      const slugMatch = dirName.match(/^gen-\d{3}(?:-[a-f0-9]{6})?-(.+)$/);
      goal = slugMatch ? slugMatch[1].replace(/-/g, " ") : `Generation ${seq}`;
    }

    plan.push({ dirName, seq, goal, hasMeta: metaContent !== null });
  }

  // Process entries in order, building parent chain
  let prevId: string | null = null;
  for (const entry of plan) {
    if (entry.hasMeta) {
      // Already migrated: read existing meta for parent chain continuity
      const metaContent = await readTextFile(join(paths.lineage, entry.dirName, "meta.yml"));
      if (metaContent) {
        const meta = YAML.parse(metaContent) as GenerationMeta;
        prevId = meta.id;
      }
      result.skipped.push(entry.dirName);
      continue;
    }

    try {
      const parents = prevId ? [prevId] : [];
      const hash = generateGenHash(parents, entry.goal, "legacy", "migration", `legacy-${entry.seq}`);
      const newId = formatGenId(entry.seq, hash);

      // Write meta.yml
      const meta: GenerationMeta = {
        id: newId,
        type: "normal",
        parents,
        goal: entry.goal,
        genomeHash: "legacy",
        startedAt: `legacy-${entry.seq}`,
        completedAt: `legacy-${entry.seq}`,
      };
      await writeTextFile(join(paths.lineage, entry.dirName, "meta.yml"), YAML.stringify(meta));

      // Rename directory to include hash
      const oldSlug = entry.dirName.replace(/^gen-\d{3}/, "");
      const newDirName = `${newId}${oldSlug}`;
      if (newDirName !== entry.dirName) {
        await rename(
          join(paths.lineage, entry.dirName),
          join(paths.lineage, newDirName),
        );
      }

      prevId = newId;
      result.migrated.push(`${entry.dirName} → ${newDirName}`);
    } catch (err) {
      result.errors.push(`${entry.dirName}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Migrate active generation in current.yml if it has legacy ID
  try {
    const currentContent = await readTextFile(paths.currentYml);
    if (currentContent && currentContent.trim()) {
      const state = YAML.parse(currentContent) as GenerationState;
      if (isLegacyId(state.id)) {
        const parents = prevId ? [prevId] : [];
        const genomeHash = "legacy";
        const hash = generateGenHash(parents, state.goal, genomeHash, "migration", state.startedAt);
        state.id = formatGenId(parseGenSeq(state.id), hash);
        state.type = state.type ?? "normal";
        state.parents = parents;
        state.genomeHash = genomeHash;
        await writeTextFile(paths.currentYml, YAML.stringify(state));
        result.migrated.push(`current.yml: ${state.id}`);
      }
    }
  } catch { /* no active generation */ }

  return result;
}
