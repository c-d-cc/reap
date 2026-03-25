import { join } from "path";
import { readdir, rm, unlink } from "fs/promises";
import YAML from "yaml";
import type { ReapPaths } from "./paths.js";
import type { GenerationState } from "../types/index.js";
import { ensureDir, writeTextFile, readTextFile } from "./fs.js";
import { scanBacklog } from "./backlog.js";
import { compressLineage } from "./compression.js";

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
  // Build archive directory name
  const goalSlug = state.goal
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .slice(0, 40)
    .replace(/-+$/, "");
  const archiveDir = join(paths.lineage, `${state.id}-${goalSlug}`);
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
  };
  if (fitnessFeedback) {
    meta.fitnessFeedback = {
      text: fitnessFeedback,
      evaluatedAt: new Date().toISOString(),
    };
  }
  await writeTextFile(join(archiveDir, "meta.yml"), YAML.stringify(meta));

  // Clear life/ artifacts (keep backlog/ — pending items remain)
  for (const entry of lifeEntries) {
    if (entry === "backlog") continue;
    await rm(join(paths.life, entry), { recursive: true, force: true });
  }

  // Run lineage compression (non-blocking)
  await compressLineage(paths.lineage).catch(() => {});

  return archiveDir;
}
