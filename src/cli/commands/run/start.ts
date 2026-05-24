import { join } from "path";
import { createPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { fileExists } from "../../../core/fs.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { executeHooks } from "../../../core/hooks.js";
import { scanBacklog, consumeBacklog } from "../../../core/backlog.js";
import { getLastLineageEntry } from "../../../core/lineage.js";

export async function execute(phase?: string, goal?: string, type?: string, parents?: string, backlog?: string): Promise<void> {
  const paths = createPaths(process.cwd());

  if (!(await fileExists(paths.config))) {
    emitError("start", "Not a reap project. Run 'reap init' first.");
  }

  const gm = new GenerationManager(paths);

  // Backward compatibility: if goal is provided without phase, treat as "create"
  const effectivePhase = (!phase && goal) ? "create" : phase;

  if (!effectivePhase || effectivePhase === "scan") {
    // Phase 1: Gate check + backlog scan
    const existing = await gm.current();
    if (existing) {
      emitError("start", `Generation ${existing.id} is already active at stage '${existing.stage}'. Abort or complete it first.`);
    }

    // Scan backlog for pending items
    const backlogItems = await scanBacklog(paths.backlog);
    const pendingBacklog = backlogItems.filter(b => b.status === "pending");

    // Detect previous early-close to surface a hint
    const lastEntry = await getLastLineageEntry(paths);
    const previousEarlyClose = lastEntry?.status === "partial"
      ? {
          id: lastEntry.id,
          closedAtStage: lastEntry.closeMeta?.closedAtStage,
          reason: lastEntry.closeMeta?.reason,
          deferredBacklogFile: lastEntry.closeMeta?.deferredBacklogFile,
          deferredTasks: lastEntry.closeMeta?.deferredTasks,
        }
      : null;

    const promptParts: string[] = [];
    if (previousEarlyClose) {
      promptParts.push(
        `## Previous generation was early-closed (${previousEarlyClose.id}, stage: ${previousEarlyClose.closedAtStage ?? "unknown"})`,
        previousEarlyClose.reason ? `Close reason: ${previousEarlyClose.reason}` : "",
        previousEarlyClose.deferredBacklogFile
          ? `Deferred backlog file: \`${previousEarlyClose.deferredBacklogFile}\` (${previousEarlyClose.deferredTasks ?? 0} task(s))`
          : "Deferred backlog: 없음 (defer-tasks=false 또는 미완 task 없음).",
        "이전 generation의 미완 작업을 이어가려면 위 deferred backlog를 source backlog로 선택하세요.",
        "",
      );
    }

    if (pendingBacklog.length > 0) {
      promptParts.push(
        `Pending backlog items (${pendingBacklog.length}):`,
        ...pendingBacklog.map((b) => `- [${b.type}] ${b.title} (\`${b.filename}\`)`),
        "",
        "Present these to the human. Ask: select one as the goal or enter a new goal.",
        "If a backlog item is selected, include --backlog <filename> in the start command.",
        'Then run: reap run start --phase create --goal "<goal>" [--backlog <filename>]',
      );
    } else {
      promptParts.push('Ask the human for the goal of this generation. Then run: reap run start --phase create --goal "<goal>"');
    }

    emitOutput({
      status: "prompt",
      command: "start",
      phase: "collect-goal",
      completed: ["gate", "backlog-scan"],
      context: {
        backlogItems: pendingBacklog.map(b => ({ type: b.type, title: b.title, filename: b.filename })),
        previousEarlyClose,
      },
      prompt: promptParts.filter(Boolean).join("\n"),
      nextCommand: "reap run start --phase create",
    });
  }

  if (effectivePhase === "create") {
    if (!goal) {
      emitError("start", 'Goal is required. Usage: reap run start --phase create --goal "<goal>" [--backlog <filename>]');
    }

    const existing = await gm.current();
    if (existing) {
      emitError("start", `Generation ${existing.id} is already active at stage '${existing.stage}'. Abort or complete it first.`);
    }

    if (type === "merge") {
      if (!parents) {
        emitError("start", "Merge requires --parents. Usage: reap run start --phase create --type merge --parents \"id1,id2\" --goal \"<goal>\"");
      }
      const parentIds = parents!.split(",").map((p) => p.trim());
      if (parentIds.length < 2) {
        emitError("start", "Merge requires at least 2 parent IDs.");
      }

      const state = await gm.createMerge(goal!, parentIds);
      await executeHooks(paths.hooks, "onMergeStarted", paths.root).catch(() => {});

      emitOutput({
        status: "ok",
        command: "start",
        completed: ["gate", "create-merge-generation"],
        context: {
          generationId: state.id,
          goal: state.goal,
          type: state.type,
          parents: state.parents,
        },
        message: `Merge generation ${state.id} created. Run: reap run detect`,
        nextCommand: "reap run detect",
      });
    }

    const genType = (type === "normal" ? "normal" : "embryo") as import("../../../types/index.js").GenerationType;
    const state = await gm.create(goal!, genType);

    // Mark backlog as consumed (after ID generation)
    if (backlog) {
      const backlogPath = join(paths.backlog, backlog);
      if (await fileExists(backlogPath)) {
        await consumeBacklog(backlogPath, state.id);
        state.sourceBacklog = backlog;
        await gm.save(state);
      }
    }

    // Run onLifeStarted hooks
    await executeHooks(paths.hooks, "onLifeStarted", paths.root).catch(() => {});

    // Trigger daemon indexing (silent fail if daemon not running)
    const { triggerIndexing } = await import("../daemon/lifecycle.js");
    await triggerIndexing(paths.root);

    emitOutput({
      status: "ok",
      command: "start",
      completed: backlog
        ? ["gate", "create-generation", "backlog-consumed"]
        : ["gate", "create-generation"],
      context: {
        generationId: state.id,
        goal: state.goal,
        type: state.type,
        parents: state.parents,
        sourceBacklog: state.sourceBacklog,
      },
      message: `Generation ${state.id} created. Run: reap run learning`,
      nextCommand: "reap run learning",
    });
  }

  emitError("start", `Unknown phase '${phase}'. Use 'scan' or 'create'.`);
}
