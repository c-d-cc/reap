import { createPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { fileExists } from "../../../core/fs.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { runHooks } from "../../../core/hooks.js";

export async function execute(goal?: string, type?: string, parents?: string): Promise<void> {
  if (!goal) {
    emitError("start", "Goal is required. Usage: reap run start \"<goal>\"");
  }

  const paths = createPaths(process.cwd());

  if (!(await fileExists(paths.config))) {
    emitError("start", "Not a reap project. Run 'reap init' first.");
  }

  const gm = new GenerationManager(paths);
  const existing = await gm.current();
  if (existing) {
    emitError("start", `Generation ${existing.id} is already active at stage '${existing.stage}'. Abort or complete it first.`);
  }

  if (type === "merge") {
    if (!parents) {
      emitError("start", "Merge requires --parents. Usage: reap run start --type merge --parents \"id1,id2\" \"<goal>\"");
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
    return;
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
