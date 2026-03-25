import { createPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { fileExists } from "../../../core/fs.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { runHooks } from "../../../core/hooks.js";
import { scanBacklog } from "../../../core/backlog.js";

export async function execute(phase?: string, goal?: string, type?: string, parents?: string): Promise<void> {
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

    emitOutput({
      status: "prompt",
      command: "start",
      phase: "collect-goal",
      completed: ["gate", "backlog-scan"],
      context: {
        backlogItems: pendingBacklog.map(b => ({ type: b.type, title: b.title, filename: b.filename })),
      },
      prompt: pendingBacklog.length > 0
        ? `Pending backlog items (${pendingBacklog.length}):\n${pendingBacklog.map(b => `- [${b.type}] ${b.title}`).join("\n")}\n\nPresent these to the human. Ask: select one as the goal or enter a new goal. Then run: reap run start --phase create --goal "<goal>"`
        : 'Ask the human for the goal of this generation. Then run: reap run start --phase create --goal "<goal>"',
      nextCommand: "reap run start --phase create",
    });
  }

  if (effectivePhase === "create") {
    if (!goal) {
      emitError("start", 'Goal is required. Usage: reap run start --phase create --goal "<goal>"');
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
      await runHooks(paths.hooks, "onMergeStarted", paths.root).catch(() => {});

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

    // Run onLifeStarted hooks
    await runHooks(paths.hooks, "onLifeStarted", paths.root).catch(() => {});

    emitOutput({
      status: "ok",
      command: "start",
      completed: ["gate", "create-generation"],
      context: {
        generationId: state.id,
        goal: state.goal,
        type: state.type,
        parents: state.parents,
      },
      message: `Generation ${state.id} created. Run: reap run learning`,
      nextCommand: "reap run learning",
    });
  }

  emitError("start", `Unknown phase '${phase}'. Use 'scan' or 'create'.`);
}
