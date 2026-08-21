import { join } from "path";
import { readdir, rm, unlink } from "fs/promises";
import YAML from "yaml";
import type { ReapPaths } from "./paths.js";
import type { GenerationState } from "../types/index.js";
import { ensureDir, writeTextFile, readTextFile } from "./fs.js";
import { scanBacklog } from "./backlog.js";
import { compressLineage } from "./compression.js";

/**
 * Build archive directory path under lineage/ using gen id + slugified goal.
 */
function buildArchiveDir(lineageRoot: string, state: GenerationState): string {
  const goalSlug = state.goal
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .slice(0, 40)
    .replace(/-+$/, "");
  return join(lineageRoot, `${state.id}-${goalSlug}`);
}

/**
 * Write archive directory, meta.yml, and clean up life/.
 *
 * Common path for both full completion and early-close. Caller chooses what
 * extra metadata to include in meta.yml (e.g. fitnessFeedback or closeMeta).
 */
async function writeArchive(
  paths: ReapPaths,
  state: GenerationState,
  archiveDir: string,
  extraMeta: Record<string, unknown>,
): Promise<void> {
  await ensureDir(archiveDir);

  // Copy artifacts (excluding backlog/ and current.yml)
  const lifeEntries = await readdir(paths.life);
  for (const entry of lifeEntries) {
    if (entry === "current.yml" || entry === "backlog") continue;
    const src = join(paths.life, entry);
    const dest = join(archiveDir, entry);
    const { cp } = await import("fs/promises");
    await cp(src, dest, { recursive: true });
  }

  // Handle backlog separately: only archive consumed items
  const backlogItems = await scanBacklog(paths.backlog);
  const consumedItems = backlogItems.filter((b) => b.status === "consumed");

  if (consumedItems.length > 0) {
    const archiveBacklogDir = join(archiveDir, "backlog");
    await ensureDir(archiveBacklogDir);
    for (const item of consumedItems) {
      const content = await readTextFile(item.path);
      if (content) {
        await writeTextFile(join(archiveBacklogDir, item.filename), content);
      }
      // Remove consumed item from life/backlog/
      await unlink(item.path).catch(() => {});
    }
  }

  // Write meta.yml
  const meta: Record<string, unknown> = {
    id: state.id,
    type: state.type,
    goal: state.goal,
    parents: state.parents,
    timeline: state.timeline,
    ...(state.milestoneId ? { milestoneId: state.milestoneId } : {}),
    ...extraMeta,
  };
  await writeTextFile(join(archiveDir, "meta.yml"), YAML.stringify(meta));

  // Clear life/ artifacts (keep backlog/ — pending items remain)
  for (const entry of lifeEntries) {
    if (entry === "backlog") continue;
    await rm(join(paths.life, entry), { recursive: true, force: true });
  }

  // Run lineage compression (non-blocking)
  await compressLineage(paths.lineage).catch(() => {});
}

/**
 * Archive the current generation to lineage/ and clear life/.
 *
 * Backlog handling (v0.15 pattern):
 * - consumed backlog → copied to lineage, removed from life/backlog/
 * - pending backlog → stays in life/backlog/ (carry-over to next generation)
 */
export async function archiveGeneration(
  paths: ReapPaths,
  state: GenerationState,
  fitnessFeedback?: string,
): Promise<string> {
  const archiveDir = buildArchiveDir(paths.lineage, state);

  const extraMeta: Record<string, unknown> = {
    status: "completed",
  };
  if (fitnessFeedback) {
    extraMeta.fitnessFeedback = {
      text: fitnessFeedback,
      evaluatedAt: new Date().toISOString(),
    };
  }

  await writeArchive(paths, state, archiveDir, extraMeta);
  return archiveDir;
}

export interface EarlyCloseMeta {
  reason: string;
  closedAtStage: string;
  completedTasks: number;
  deferredTasks: number;
  deferredBacklogFile?: string;
  sourceAction: string;
}

/**
 * Archive the current generation as a partial close (early-close path).
 *
 * Differs from `archiveGeneration` in that meta.yml gets:
 * - `status: partial` (vs `completed`)
 * - `closeMeta` object with reason, closedAtStage, task counts, deferred backlog ref
 * - no fitnessFeedback (fitness is skipped in early-close)
 */
export async function archiveEarlyClose(
  paths: ReapPaths,
  state: GenerationState,
  closeMeta: EarlyCloseMeta,
): Promise<string> {
  const archiveDir = buildArchiveDir(paths.lineage, state);

  const extraMeta: Record<string, unknown> = {
    status: "partial",
    closeMeta: {
      reason: closeMeta.reason,
      closedAtStage: closeMeta.closedAtStage,
      completedTasks: closeMeta.completedTasks,
      deferredTasks: closeMeta.deferredTasks,
      sourceAction: closeMeta.sourceAction,
      ...(closeMeta.deferredBacklogFile
        ? { deferredBacklogFile: closeMeta.deferredBacklogFile }
        : {}),
      closedAt: new Date().toISOString(),
    },
  };

  await writeArchive(paths, state, archiveDir, extraMeta);
  return archiveDir;
}
