import { createPaths } from "../../../core/paths.js";
import { fileExists } from "../../../core/fs.js";
import { emitError } from "../../../core/output.js";
import { execute as startExecute } from "./start.js";
import { execute as learningExecute } from "./learning.js";
import { execute as planningExecute } from "./planning.js";
import { execute as implementationExecute } from "./implementation.js";
import { execute as validationExecute } from "./validation.js";
import { execute as completionExecute } from "./completion.js";
import { execute as evolveExecute } from "./evolve.js";
import { execute as backExecute } from "./back.js";
import { execute as nextExecute } from "./next.js";
import { execute as abortExecute } from "./abort.js";
import { execute as restartExecute } from "./restart.js";
import { execute as detectExecute } from "./detect.js";
import { execute as mateExecute } from "./mate.js";
import { execute as mergeExecute } from "./merge.js";
import { execute as reconcileExecute } from "./reconcile.js";
import { execute as pushExecute } from "./push.js";

const STAGE_HANDLERS: Record<string, (paths: ReturnType<typeof createPaths>, phase?: string, extra?: string) => Promise<void>> = {
  learning: learningExecute,
  planning: planningExecute,
  implementation: implementationExecute,
  validation: validationExecute,
  completion: completionExecute,
  evolve: evolveExecute,
  back: backExecute,
  next: nextExecute,
  abort: abortExecute,
  restart: restartExecute,
  detect: detectExecute,
  mate: mateExecute,
  merge: mergeExecute,
  reconcile: reconcileExecute,
  push: pushExecute,
};

export async function execute(stage: string, options: { phase?: string; goal?: string; type?: string; parents?: string; feedback?: string; reason?: string; backlog?: string }): Promise<void> {
  if (stage === "start") {
    await startExecute(options.phase, options.goal, options.type, options.parents, options.backlog);
    return;
  }

  const paths = createPaths(process.cwd());
  if (!(await fileExists(paths.config))) {
    emitError("run", "Not a reap project. Run 'reap init' first.");
  }

  const handler = STAGE_HANDLERS[stage];
  if (!handler) {
    emitError("run", `Unknown stage '${stage}'. Available: start, ${Object.keys(STAGE_HANDLERS).join(", ")}`);
  }

  // Pass extra: feedback for completion, reason for back, goal for restart
  const extra = options.feedback || options.reason || options.goal;
  await handler(paths, options.phase, extra);
}
