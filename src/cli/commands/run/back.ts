import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { LifeCycle } from "../../../core/lifecycle";
import { MergeLifeCycle } from "../../../core/merge-lifecycle";
import { emitOutput, emitError } from "../../../core/run-output";
import { executeHooks } from "../../../core/hook-engine";
import type { LifeCycleStage, MergeStage, AnyStage } from "../../../types";

function getFlag(args: string[], name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : undefined;
}

/** Extract positionals, skipping flag names and their values */
function getPositionals(args: string[], valueFlags: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const flagName = args[i].slice(2);
      if (valueFlags.includes(flagName) && i + 1 < args.length) i++; // skip value
      continue;
    }
    result.push(args[i]);
  }
  return result;
}

export async function execute(paths: ReapPaths, phase?: string, argv: string[] = []): Promise<void> {
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
      prompt: "Ask the human: (1) target stage (default: previous stage), (2) reason for regression, (3) related refs. Then run: reap run back --phase apply <target-stage> --reason \"<reason>\" --refs \"<a,b,c>\"",
      nextCommand: "reap run back --phase apply",
    });
  }

  if (phase === "apply") {
    const originalStage = state.stage;

    // Determine target from argv positional (skip flag values)
    const positionals = getPositionals(argv, ["reason", "refs"]);
    const targetArg = positionals[0];
    let target: AnyStage;
    if (targetArg) {
      target = targetArg as AnyStage;
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

    const reason = getFlag(argv, "reason") ?? "No reason provided";
    const refs = (getFlag(argv, "refs") ?? "").split(",").filter(Boolean);

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
