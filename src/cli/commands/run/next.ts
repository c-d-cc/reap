import { join } from "path";
import type { ReapPaths } from "../../../core/paths";
import { GenerationManager, generateStageToken, verifyStageToken } from "../../../core/generation";
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

  // Stage chain token verification
  if (state.expectedTokenHash) {
    // Read token from --token arg or REAP_STAGE_TOKEN env var
    let token: string | undefined = process.env.REAP_STAGE_TOKEN;
    const tokenArgIdx = process.argv.indexOf("--token");
    if (tokenArgIdx !== -1 && process.argv[tokenArgIdx + 1]) {
      token = process.argv[tokenArgIdx + 1];
    }

    if (!token) {
      emitError("next", "Stage transition requires a valid token. Run the current stage command first to obtain one. Use: reap run next --token <TOKEN> or set REAP_STAGE_TOKEN environment variable.");
    }

    if (!verifyStageToken(token, state.id, state.stage as string, state.expectedTokenHash)) {
      emitError("next", `Token mismatch. The token must come from the output of \`reap run ${state.stage}\`. Re-run the stage command to get a valid token.`);
    }
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

  // Generate new stage chain token for the next stage
  const { nonce: stageToken, hash: tokenHash } = generateStageToken(state.id, nextStage);
  state.expectedTokenHash = tokenHash;

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
    completed: ["gate", "token-verify", "advance-stage", "create-artifact", "hooks"],
    context: {
      generationId: state.id,
      previousStage,
      stage: nextStage,
      type: state.type,
      artifactFile,
      stageToken,
      hookResults: [...stageHookResults, ...transitionHookResults],
    },
    message: `Advanced to ${nextStage}. Proceed with /reap.${nextStage}.\n\nIMPORTANT: Pass the following token to the next stage transition: \`reap run next --token ${stageToken}\`. Without this token, stage transition will be REJECTED.`,
  });
}
