import type { GenerationState, LifeCycleStage, MergeStage } from "../types/index.js";
import type { GenerationManager } from "./generation.js";
import { generateToken, verifyToken } from "./nonce.js";
import { nextStage, prevStage, nextMergeStage, prevMergeStage } from "./lifecycle.js";
import { readTextFile } from "./fs.js";
import { emitError } from "./output.js";
import { runHooks } from "./hooks.js";
import type { ReapPaths } from "./paths.js";

const STAGE_ARTIFACTS: Partial<Record<string, string>> = {
  learning: "01-learning.md",
  planning: "02-planning.md",
  implementation: "03-implementation.md",
  validation: "04-validation.md",
  completion: "05-completion.md",
};

const MERGE_STAGE_ARTIFACTS: Partial<Record<string, string>> = {
  detect: "01-detect.md",
  mate: "02-mate.md",
  merge: "03-merge.md",
  reconcile: "04-reconcile.md",
  validation: "05-validation.md",
  completion: "06-completion.md",
};

/**
 * Verify that the stage artifact exists and has minimum content.
 */
export async function verifyArtifact(
  command: string,
  artifactPath: (name: string) => string,
  stage: string,
  isMerge?: boolean,
): Promise<void> {
  const map = isMerge ? MERGE_STAGE_ARTIFACTS : STAGE_ARTIFACTS;
  const filename = map[stage];
  if (!filename) return;

  const content = await readTextFile(artifactPath(filename));
  if (!content || content.length < 50) {
    emitError(command, `${filename} is missing or too short. Complete the ${stage} work before advancing.`);
  }
}

/**
 * Verify and consume a nonce token.
 * First stage entry (no lastNonce) is the only exception — skips verification.
 */
export function verifyNonce(
  command: string,
  state: GenerationState,
  stage: string,
  phase: string,
): void {
  if (!state.lastNonce) {
    // First stage entry — no token to verify
    return;
  }

  if (!state.expectedHash) {
    emitError(command, "Nonce transition error: lastNonce exists but expectedHash is missing.");
  }

  if (!verifyToken(state.lastNonce, state.id, stage, phase, state.expectedHash!)) {
    emitError(command, `Nonce verification failed for ${stage}:${phase}. Re-run the previous phase.`);
  }

  // Clear consumed token
  state.lastNonce = undefined;
  state.expectedHash = undefined;
  state.phase = undefined;
}

/**
 * Generate and set forward nonce + back nonce simultaneously.
 * Back nonce targets the previous stage's entry (if exists).
 */
export function setNonce(
  state: GenerationState,
  stage: string,
  phase: string,
): void {
  // Forward nonce
  const forward = generateToken(state.id, stage, phase);
  state.lastNonce = forward.nonce;
  state.expectedHash = forward.hash;
  state.phase = phase;

  // Back nonce — target previous stage entry
  const prev = state.type === "merge"
    ? prevMergeStage(state.stage as MergeStage)
    : prevStage(state.stage as LifeCycleStage);
  if (prev) {
    const back = generateToken(state.id, prev, "entry");
    state.backNonce = back.nonce;
    state.backExpectedHash = back.hash;
    state.backTarget = prev;
    state.backTargetPhase = "entry";
  } else {
    // First stage — no back possible
    state.backNonce = undefined;
    state.backExpectedHash = undefined;
    state.backTarget = undefined;
    state.backTargetPhase = undefined;
  }
}

/**
 * Verify back nonce and consume it.
 */
export function verifyBackNonce(
  command: string,
  state: GenerationState,
): void {
  if (!state.backNonce) {
    emitError(command, "Cannot go back — no back nonce available (already at first stage or back not supported here).");
  }

  if (!state.backExpectedHash || !state.backTarget) {
    emitError(command, "Back nonce state is corrupted.");
  }

  if (!verifyToken(state.backNonce!, state.id, state.backTarget!, state.backTargetPhase ?? "entry", state.backExpectedHash!)) {
    emitError(command, "Back nonce verification failed.");
  }

  // Clear back nonce
  const target = state.backTarget!;
  const targetPhase = state.backTargetPhase ?? "entry";
  state.backNonce = undefined;
  state.backExpectedHash = undefined;
  state.backTarget = undefined;
  state.backTargetPhase = undefined;

  // Set stage to target and issue new forward nonce
  state.stage = target as LifeCycleStage | MergeStage;
  const forward = generateToken(state.id, target, targetPhase);
  state.lastNonce = forward.nonce;
  state.expectedHash = forward.hash;
  state.phase = targetPhase;
}

/**
 * Perform automatic stage transition after --phase complete.
 */
// Stage → lifecycle event mapping
const STAGE_EVENTS: Record<string, string> = {
  planning: "onLifeLearned",
  implementation: "onLifePlanned",
  validation: "onLifeImplemented",
  completion: "onLifeValidated",
};

export async function performTransition(
  state: GenerationState,
  gm: GenerationManager,
  paths?: ReapPaths,
): Promise<LifeCycleStage> {
  const fromStage = state.stage;
  const next = nextStage(fromStage as LifeCycleStage);
  if (!next) {
    throw new Error(`Cannot advance from '${fromStage}' — already at the last stage.`);
  }

  state.stage = next;
  if (!state.timeline) state.timeline = [];
  state.timeline.push({ stage: next, at: new Date().toISOString() });

  await gm.save(state);

  // Run hooks (non-blocking — errors don't stop transition)
  if (paths) {
    const stageEvent = STAGE_EVENTS[next];
    if (stageEvent) {
      await runHooks(paths.hooks, stageEvent, paths.root).catch(() => {});
    }
    await runHooks(paths.hooks, "onLifeTransited", paths.root).catch(() => {});
  }

  return next;
}

// ── Merge Lifecycle Transition ─────────────────────────────

const MERGE_STAGE_EVENTS: Record<string, string> = {
  mate: "onMergeDetected",
  merge: "onMergeMated",
  reconcile: "onMergeMerged",
  validation: "onMergeReconciled",
  completion: "onMergeValidated",
};

export async function performMergeTransition(
  state: GenerationState,
  gm: GenerationManager,
  paths?: ReapPaths,
): Promise<MergeStage> {
  const fromStage = state.stage;
  const next = nextMergeStage(fromStage as MergeStage);
  if (!next) {
    throw new Error(`Cannot advance from '${fromStage}' — already at the last merge stage.`);
  }

  state.stage = next;
  if (!state.timeline) state.timeline = [];
  state.timeline.push({ stage: next, at: new Date().toISOString() });

  await gm.save(state);

  if (paths) {
    const stageEvent = MERGE_STAGE_EVENTS[next];
    if (stageEvent) {
      await runHooks(paths.hooks, stageEvent, paths.root).catch(() => {});
    }
  }

  return next;
}
