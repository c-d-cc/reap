import { join } from "path";
import type { ReapPaths } from "./paths";
import type { GenerationState, AnyStage, LifeCycleStage, MergeStage, ReapHookEvent, HookResult } from "../types";
import { LifeCycle } from "./lifecycle";
import { MergeLifeCycle } from "./merge-lifecycle";
import { generateToken, verifyToken } from "./generation";
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

// ── Unified nonce helpers ────────────────────────────────────

/**
 * Verify and consume a nonce token (receiver-based).
 * Token format: hash(nonce + genId + stage:phase).
 * - If lastNonce does not exist: skip (first stage:entry like objective/detect).
 * - If lastNonce exists: verify against expectedHash, clear on success.
 * Mutates state in-place (clears lastNonce + expectedHash + phase on success).
 */
export function verifyNonce(command: string, state: GenerationState, stage: string, phase: string): void {
  if (!state.lastNonce) {
    // First stage entry — no token to verify
    return;
  }

  if (!state.expectedHash) {
    emitError(command, "Nonce transition error: lastNonce exists but expectedHash is missing. State may be corrupted.");
  }

  if (!verifyToken(state.lastNonce, state.id, stage, state.expectedHash, phase)) {
    emitError(command, `Nonce verification failed for ${stage}:${phase}. Re-run the previous phase to get a valid token.`);
  }

  // Clear consumed token
  state.lastNonce = undefined;
  state.expectedHash = undefined;
  state.phase = undefined;
}

/**
 * Generate and set a nonce token for the next entry point (receiver-based).
 * Token format: hash(nonce + genId + stage:phase).
 * Mutates state in-place. Caller must save state after calling this.
 */
export function setNonce(state: GenerationState, stage: string, phase: string): void {
  const { nonce, hash } = generateToken(state.id, stage, phase);
  state.lastNonce = nonce;
  state.expectedHash = hash;
  state.phase = phase;
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
