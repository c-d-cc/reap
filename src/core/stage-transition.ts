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

// ── Token verification ──────────────────────────────────────

/**
 * Verify the stage chain token at stage entry.
 * - If lastNonce exists: verify against expectedHash, clear lastNonce on success.
 * - If lastNonce does not exist: pass (first stage like objective/detect).
 * Mutates state in-place (clears lastNonce + expectedHash on success).
 */
export function verifyStageEntry(
  command: string,
  state: GenerationState,
): void {
  if (!state.lastNonce) {
    // First stage (objective/detect) — no token to verify
    return;
  }

  if (state.phase) {
    // Nonce belongs to a phase token, not a stage token — skip stage verification
    return;
  }

  if (!state.expectedHash) {
    emitError(command, "Stage transition error: lastNonce exists but expectedHash is missing. State may be corrupted.");
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

  if (!verifyToken(state.lastNonce, state.id, prevStage as string, state.expectedHash)) {
    emitError(command, `Token verification failed. The stage chain token does not match. Re-run the previous stage command to get a valid token.`);
  }

  // Clear consumed token
  state.lastNonce = undefined;
  state.expectedHash = undefined;
}

// ── Phase nonce helpers ─────────────────────────────────────

/**
 * Set a phase nonce on the state. Call at the end of a work/review/verify phase
 * to ensure the AI cannot skip directly to --phase complete.
 * Mutates state in-place. Caller must save state after calling this.
 */
export function setPhaseNonce(state: GenerationState, stage: string, phase: string): void {
  const { nonce, hash } = generateToken(state.id, stage, phase);
  state.lastNonce = nonce;
  state.expectedHash = hash;
  state.phase = phase;
}

/**
 * Verify the phase nonce at the start of a phase (e.g., --phase complete).
 * - If lastNonce exists: verify against expectedHash with phase, clear on success.
 * - If lastNonce does not exist: error (work phase was skipped).
 * Mutates state in-place (clears lastNonce + expectedHash + phase on success).
 */
export function verifyPhaseEntry(command: string, state: GenerationState, stage: string, phase: string): void {
  if (!state.lastNonce) {
    emitError(command, `Phase nonce missing. Complete the previous phase before running --phase ${phase}.`);
  }

  if (!state.expectedHash) {
    emitError(command, "Phase transition error: lastNonce exists but expectedHash is missing. State may be corrupted.");
  }

  if (!verifyToken(state.lastNonce, state.id, stage, state.expectedHash, phase)) {
    emitError(command, `Phase token verification failed. Re-run the previous phase to get a valid token.`);
  }

  // Clear consumed phase token
  state.lastNonce = undefined;
  state.expectedHash = undefined;
  state.phase = undefined;
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
