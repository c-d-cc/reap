import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { LifeCycle } from "../../../core/lifecycle";
import { MergeLifeCycle } from "../../../core/merge-lifecycle";
import { emitOutput, emitError } from "../../../core/run-output";
import { executeHooks } from "../../../core/hook-engine";
import type { LifeCycleStage, MergeStage, AnyStage } from "../../../types";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) {
    emitError("back", "No active Generation.");
  }

  const isMerge = state.type === "merge";
  const firstStage: AnyStage = isMerge ? "detect" : "objective";

  if (state.stage === firstStage) {
    emitError("back", "Already at the first stage. Cannot go back.");
  }

  if (!phase || phase === "collect") {
    // Phase 1: Gate passed, ask AI to collect reason/target from user
    emitOutput({
      status: "prompt",
      command: "back",
      phase: "collect",
      completed: ["gate"],
      context: {
        currentStage: state.stage,
        type: state.type,
        id: state.id,
      },
      prompt: "Ask the human: (1) target stage (default: previous stage), (2) reason for regression, (3) related refs. Then run: reap run back --phase apply. Pass via env: REAP_BACK_TARGET, REAP_BACK_REASON, REAP_BACK_REFS (comma-separated).",
      nextCommand: "reap run back --phase apply",
    });
  }

  if (phase === "apply") {
    const originalStage = state.stage;

    // Determine target
    const targetEnv = process.env.REAP_BACK_TARGET;
    let target: AnyStage;
    if (targetEnv) {
      target = targetEnv as AnyStage;
    } else if (isMerge) {
      target = MergeLifeCycle.prev(state.stage as MergeStage)!;
    } else {
      target = LifeCycle.prev(state.stage as LifeCycleStage)!;
    }

    // Validate transition
    const canTransition = isMerge
      ? MergeLifeCycle.canTransition(originalStage as MergeStage, target as MergeStage)
      : LifeCycle.canTransition(originalStage as LifeCycleStage, target as LifeCycleStage);

    if (!canTransition) {
      emitError("back", `Cannot regress from '${originalStage}' to '${target}'.`);
    }

    const reason = process.env.REAP_BACK_REASON ?? "No reason provided";
    const refs = (process.env.REAP_BACK_REFS ?? "").split(",").filter(Boolean);

    // Update state
    state.stage = target;
    state.timeline.push({
      stage: target,
      at: new Date().toISOString(),
      from: originalStage,
      reason,
      refs: refs.length > 0 ? refs : undefined,
    });
    await gm.save(state);

    // Execute regression hook
    const hookEvent = isMerge ? "onMergeTransited" : "onLifeRegretted";
    const hookResults = await executeHooks(paths.hooks, hookEvent, paths.projectRoot);

    emitOutput({
      status: "prompt",
      command: "back",
      phase: "record-regression",
      completed: ["gate", "collect", "apply-regression", "hooks"],
      context: {
        id: state.id,
        targetStage: target,
        fromStage: originalStage,
        reason,
        refs,
        hookResults,
      },
      prompt: `Regression applied: ${originalStage} → ${target}. Add a ## Regression section to the target artifact. Then proceed with /reap.${target}.`,
      message: `Returned to ${target} stage.`,
    });
  }
}
