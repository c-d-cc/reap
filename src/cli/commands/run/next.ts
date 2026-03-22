import { join } from "path";
import type { ReapPaths } from "../../../core/paths";
import { GenerationManager, verifyStageToken } from "../../../core/generation";
import { LifeCycle } from "../../../core/lifecycle";
import { MergeLifeCycle } from "../../../core/merge-lifecycle";
import { readTextFile, writeTextFile, fileExists } from "../../../core/fs";
import { emitOutput, emitError } from "../../../core/run-output";
import { executeHooks } from "../../../core/hook-engine";
import type { LifeCycleStage, MergeStage, AnyStage, ReapHookEvent } from "../../../types";

const NORMAL_ARTIFACT: Partial<Record<LifeCycleStage, string>> = {
  planning: "02-planning.md",
  implementation: "03-implementation.md",
  validation: "04-validation.md",
  completion: "05-completion.md",
};

const MERGE_ARTIFACT: Partial<Record<MergeStage, string>> = {
  mate: "02-mate.md",
  merge: "03-merge.md",
  sync: "04-sync.md",
  validation: "05-validation.md",
  completion: "06-completion.md",
};

export async function execute(paths: ReapPaths, _phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();
  if (!state) {
    emitError("next", "No active Generation. Run /reap.start first.");
  }

  // Stage chain token verification — nonce passed as argument, hash in current.yml
  if (state.expectedTokenHash) {
    // Read nonce from argv: reap run next <nonce>
    const args = process.argv.slice(2); // strip 'node' and script path
    let nonce = args.find(a => !a.startsWith("-") && a !== "run" && a !== "next");

    // Fallback: read from state.lastNonce if no explicit argument
    if (!nonce && state.lastNonce) {
      nonce = state.lastNonce;
    }

    if (!nonce) {
      emitError("next", `Stage transition blocked: no token provided. The stage command outputs a nonce that must be passed to /reap.next. Example: /reap.next <nonce>. This ensures the stage command was actually executed — you cannot skip stages.`);
    }

    if (!verifyStageToken(nonce, state.id, state.stage as string, state.expectedTokenHash)) {
      emitError("next", `Token verification failed. The provided nonce does not match. Re-run the current stage command (reap run ${state.stage}) to get a valid token. You cannot forge or guess the token.`);
    }

    // Clear lastNonce after use to prevent reuse
    state.lastNonce = undefined;
  }

  const isMerge = state.type === "merge";
  let nextStage: AnyStage | null;

  if (isMerge) {
    nextStage = MergeLifeCycle.next(state.stage as MergeStage);
  } else {
    nextStage = LifeCycle.next(state.stage as LifeCycleStage);
  }

  if (!nextStage) {
    emitError("next", `Cannot advance from '${state.stage}' — already at the last stage.`);
  }

  // Update state
  state.stage = nextStage;
  if (!state.timeline) state.timeline = [];
  state.timeline.push({ stage: nextStage, at: new Date().toISOString() });

  // Clear consumed token hash — next stage command will generate a new one
  state.expectedTokenHash = undefined;

  await gm.save(state);

  // Determine artifact file
  const artifactFile = isMerge
    ? MERGE_ARTIFACT[nextStage as MergeStage]
    : NORMAL_ARTIFACT[nextStage as LifeCycleStage];

  // Copy artifact template if it exists
  if (artifactFile) {
    const templateDir = join(require("os").homedir(), ".reap", "templates");
    const templatePath = join(templateDir, artifactFile);
    const destPath = paths.artifact(artifactFile);

    if (await fileExists(templatePath) && !(await fileExists(destPath))) {
      const templateContent = await readTextFile(templatePath);
      if (templateContent) {
        await writeTextFile(destPath, templateContent);
      }
    }
  }

  // Stage-specific hook (e.g., objective→planning triggers onLifeObjected)
  const previousStage = state.timeline[state.timeline.length - 2]?.stage;
  const STAGE_HOOK: Record<string, ReapHookEvent> = {
    planning: "onLifeObjected",
    implementation: "onLifePlanned",
    validation: "onLifeImplemented",
    completion: "onLifeValidated",
    // merge
    mate: "onMergeDetected",
    merge: "onMergeMated",
    sync: "onMergeMerged",
    "validation:merge": "onMergeSynced",
    "completion:merge": "onMergeValidated",
  };

  const stageKey = isMerge && (nextStage === "validation" || nextStage === "completion")
    ? `${nextStage}:merge` : nextStage;
  const stageHookEvent = STAGE_HOOK[stageKey];
  const stageHookResults = stageHookEvent
    ? await executeHooks(paths.hooks, stageHookEvent, paths.projectRoot)
    : [];

  // Transition hook
  const transitionEvent: ReapHookEvent = isMerge ? "onMergeTransited" : "onLifeTransited";
  const transitionHookResults = await executeHooks(paths.hooks, transitionEvent, paths.projectRoot);

  emitOutput({
    status: "ok",
    command: "next",
    phase: "done",
    completed: ["gate", "nonce-verify", "advance-stage", "create-artifact", "hooks"],
    context: {
      generationId: state.id,
      previousStage,
      stage: nextStage,
      type: state.type,
      artifactFile,
      hookResults: [...stageHookResults, ...transitionHookResults],
    },
    message: `Advanced to ${nextStage}. Proceed with /reap.${nextStage}.`,
  });

  // Auto-execute the next stage command (skip completion — user must run explicitly)
  if (nextStage !== "completion") {
    const moduleName = isMerge ? `./merge-${nextStage}` : `./${nextStage}`;
    const { execute: nextExecute } = await import(moduleName);
    await nextExecute(paths);
  }
}
