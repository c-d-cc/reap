import { join } from "path";
import { readdir, cp, rm } from "fs/promises";
import YAML from "yaml";
import type { ReapPaths } from "./paths.js";
import type { GenerationState } from "../types/index.js";
import { ensureDir, writeTextFile, readTextFile } from "./fs.js";
import { scanBacklog } from "./backlog.js";
import { compressLineage } from "./compression.js";

/**
 * Archive the current generation to lineage/ and clear life/.
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

  // Copy artifacts
  const lifeEntries = await readdir(paths.life);
  for (const entry of lifeEntries) {
    if (entry === "current.yml") continue;
    const src = join(paths.life, entry);
    const dest = join(archiveDir, entry);
    await cp(src, dest, { recursive: true });
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

  // Carry-over: pending backlog stays in life/, consumed goes to lineage
  const backlogItems = await scanBacklog(paths.backlog);
  const pendingItems = backlogItems.filter((b) => b.status === "pending");

  // Clear life/ (remove artifacts + current.yml, but handle backlog carefully)
  for (const entry of lifeEntries) {
    if (entry === "backlog") continue; // handle separately
    await rm(join(paths.life, entry), { recursive: true, force: true });
  }

  // Clear backlog dir (consumed already archived via cp above)
  await rm(paths.backlog, { recursive: true, force: true });

  // Carry-over pending backlog to fresh life/backlog/
  if (pendingItems.length > 0) {
    await ensureDir(paths.backlog);
    for (const item of pendingItems) {
      const content = await readTextFile(join(archiveDir, "backlog", item.filename));
      if (content) {
        await writeTextFile(join(paths.backlog, item.filename), content);
      }
    }
  }

  // Run lineage compression (non-blocking)
  await compressLineage(paths.lineage).catch(() => {});

  return archiveDir;
}
