import { readdir, rm } from "fs/promises";
import { join } from "path";
import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { revertBacklogConsumed } from "../../../core/backlog.js";
import { writeTextFile, ensureDir } from "../../../core/fs.js";
import { emitOutput, emitError } from "../../../core/output.js";

interface AbortExtra {
  reason?: string;
  sourceAction?: string;
  saveBacklog?: boolean;
}

function parseExtra(extra?: string): AbortExtra {
  if (!extra) return {};
  try {
    return JSON.parse(extra) as AbortExtra;
  } catch {
    return {};
  }
}

export async function execute(paths: ReapPaths, phase?: string, extra?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("abort", "No active generation to abort.");

  const s = state!;

  // ── Phase 1: confirm (default) ────────────────────────────
  if (!phase || phase === "confirm") {
    emitOutput({
      status: "prompt",
      command: "abort",
      phase: "confirm",
      context: { id: s.id, goal: s.goal, stage: s.stage },
      prompt: [
        `Active generation: ${s.id} (goal: ${s.goal}, stage: ${s.stage}).`,
        "",
        "Ask the human: abort할까요?",
        "If yes: ask reason, check git diff for uncommitted changes.",
        "  If changes: offer rollback/stash/hold",
        "  If no changes: skip",
        "Ask: backlog에 진행상황 저장할까요?",
        "",
        "Then run:",
        "  reap run abort --phase execute --reason '<reason>' --source-action <rollback|stash|hold|none> [--save-backlog]",
      ].join("\n"),
      nextCommand: "reap run abort --phase execute --reason '<reason>' --source-action none",
    });
  }

  // ── Phase 2: execute ──────────────────────────────────────
  if (phase === "execute") {
    const opts = parseExtra(extra);
    const reason = opts.reason ?? "no reason provided";
    const sourceAction = opts.sourceAction ?? "none";
    const saveBacklog = opts.saveBacklog ?? false;
    const id = s.id;

    // Save progress to backlog if requested
    let savedBacklogFile: string | undefined;
    if (saveBacklog) {
      await ensureDir(paths.backlog);
      const filename = `aborted-${id}.md`;
      const content = `---
type: task
status: pending
priority: medium
createdAt: ${new Date().toISOString()}
---

# Aborted: ${s.goal}

## Abort Context
- **Generation**: ${id}
- **Stage at abort**: ${s.stage}
- **Reason**: ${reason}
- **Source action**: ${sourceAction}

## Progress
<!-- Progress from the aborted generation can be referenced here -->
`;
      await writeTextFile(join(paths.backlog, filename), content);
      savedBacklogFile = filename;
    }

    // Revert consumed backlog items
    const revertedCount = await revertBacklogConsumed(paths.backlog, id);

    // Remove artifacts (keep backlog for potential reuse)
    const lifeEntries = await readdir(paths.life);
    for (const entry of lifeEntries) {
      if (entry === "backlog") continue; // preserve backlog
      await rm(join(paths.life, entry), { recursive: true, force: true });
    }

    emitOutput({
      status: "ok",
      command: "abort",
      phase: "execute",
      completed: ["confirm", "save-backlog", "revert-consumed", "clear-life"],
      context: {
        abortedGeneration: id,
        reason,
        sourceAction,
        savedBacklogFile,
        revertedBacklogCount: revertedCount,
        backlogPreserved: true,
      },
      message: `Generation ${id} aborted (reason: ${reason}). ${revertedCount > 0 ? `${revertedCount} backlog item(s) reverted to pending. ` : ""}${savedBacklogFile ? `Progress saved to ${savedBacklogFile}. ` : ""}Life/ cleared.`,
    });
  }
}
