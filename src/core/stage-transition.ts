import { join } from "path";
import type { ReapPaths } from "./paths";
import type { GenerationState, AnyStage, LifeCycleStage, MergeStage, ReapHookEvent, HookResult } from "../types";
import { LifeCycle } from "./lifecycle";
import { MergeLifeCycle } from "./merge-lifecycle";
import { verifyStageToken } from "./generation";
import { readTextFile, writeTextFile, fileExists } from "./fs";
import { executeHooks } from "./hook-engine";
import { emitError } from "./run-output";

// ── Artifact mappings ───────────────────────────────────────

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

// ── Stage-specific hook mappings ────────────────────────────

const STAGE_HOOK: Record<string, ReapHookEvent> = {
  // Normal lifecycle — hook fires when entering this stage
  planning: "onLifeObjected",
  implementation: "onLifePlanned",
  validation: "onLifeImplemented",
  completion: "onLifeValidated",
  // Merge lifecycle
  mate: "onMergeDetected",
  merge: "onMergeMated",
  sync: "onMergeMerged",
  "validation:merge": "onMergeSynced",
  "completion:merge": "onMergeValidated",
};

// ── Token verification ──────────────────────────────────────

/**
 * Verify the stage chain token at stage entry.
 * - If lastNonce exists: verify against expectedTokenHash, clear lastNonce on success.
 * - If lastNonce does not exist: pass (first stage like objective/detect).
 * Mutates state in-place (clears lastNonce + expectedTokenHash on success).
 */
export function verifyStageEntry(
  command: string,
  state: GenerationState,
): void {
  if (!state.lastNonce) {
    // First stage (objective/detect) — no token to verify
    return;
  }

  if (!state.expectedTokenHash) {
    emitError(command, "Stage transition error: lastNonce exists but expectedTokenHash is missing. State may be corrupted.");
  }

  // The previous stage stored the nonce for the PREVIOUS stage.
  // We need to figure out which stage generated the token.
  // The token was generated with (genId, previousStage), so we need to verify against the previous stage.
  const isMerge = state.type === "merge";
  let prevStage: AnyStage | null;
  if (isMerge) {
    prevStage = MergeLifeCycle.prev(state.stage as MergeStage);
  } else {
    prevStage = LifeCycle.prev(state.stage as LifeCycleStage);
  }

  if (!prevStage) {
    // Should not happen — first stages don't have lastNonce
    emitError(command, "Stage transition error: cannot determine previous stage for token verification.");
  }

  if (!verifyStageToken(state.lastNonce, state.id, prevStage as string, state.expectedTokenHash)) {
    emitError(command, `Token verification failed. The stage chain token does not match. Re-run the previous stage command to get a valid token.`);
  }

  // Clear consumed token
  state.lastNonce = undefined;
  state.expectedTokenHash = undefined;
}

// ── Auto-transition ─────────────────────────────────────────

export interface TransitionResult {
  nextStage: AnyStage;
  artifactFile: string | undefined;
  stageHookResults: HookResult[];
  transitionHookResults: HookResult[];
}

/**
 * Perform automatic stage transition after --phase complete.
 * - Advances state.stage to next stage
 * - Updates timeline
 * - Copies artifact template for next stage
 * - Runs stage-specific and transition hooks
 * - Saves state
 *
 * Mutates state in-place. Caller MUST call this BEFORE emitOutput.
 */
export async function performTransition(
  paths: ReapPaths,
  state: GenerationState,
  saveFn: (state: GenerationState) => Promise<void>,
): Promise<TransitionResult> {
  const isMerge = state.type === "merge";
  let nextStage: AnyStage | null;

  if (isMerge) {
    nextStage = MergeLifeCycle.next(state.stage as MergeStage);
  } else {
    nextStage = LifeCycle.next(state.stage as LifeCycleStage);
  }

  if (!nextStage) {
    // Should not happen — completion stage doesn't call this
    throw new Error(`Cannot advance from '${state.stage}' — already at the last stage.`);
  }

  // Update state
  state.stage = nextStage;
  if (!state.timeline) state.timeline = [];
  state.timeline.push({ stage: nextStage, at: new Date().toISOString() });

  // Save state (nonce + hash already set by the caller)
  await saveFn(state);

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

  // Stage-specific hook
  const stageKey = isMerge && (nextStage === "validation" || nextStage === "completion")
    ? `${nextStage}:merge` : nextStage;
  const stageHookEvent = STAGE_HOOK[stageKey];
  const stageHookResults = stageHookEvent
    ? await executeHooks(paths.hooks, stageHookEvent, paths.projectRoot)
    : [];

  // Transition hook
  const transitionEvent: ReapHookEvent = isMerge ? "onMergeTransited" : "onLifeTransited";
  const transitionHookResults = await executeHooks(paths.hooks, transitionEvent, paths.projectRoot);

  return {
    nextStage,
    artifactFile,
    stageHookResults,
    transitionHookResults,
  };
}
