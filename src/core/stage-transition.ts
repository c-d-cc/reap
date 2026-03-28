import type { GenerationState, LifeCycleStage, MergeStage } from "../types/index.js";
import type { GenerationManager } from "./generation.js";
import { generateToken, verifyToken } from "./nonce.js";
import { nextStage, nextMergeStage, getTransitions } from "./lifecycle.js";
import { readTextFile } from "./fs.js";
import { emitError } from "./output.js";
import { executeHooks } from "./hooks.js";
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
 * Verify and consume a transition nonce.
 * Looks up targetStagePhase in pendingTransitions, verifies the hash, and removes it.
 * First stage entry (no pendingTransitions) is the only exception — skips verification.
 */
export function verifyTransition(
  command: string,
  state: GenerationState,
  targetStagePhase: string,
): void {
  if (!state.pendingTransitions) {
    // First stage entry — no token to verify
    return;
  }

  const entry = state.pendingTransitions[targetStagePhase];
  if (!entry) {
    const available = Object.keys(state.pendingTransitions).join(", ");
    const currentPhase = state.phase ? ` (current phase: ${state.phase})` : "";
    emitError(command, `No pending transition for ${targetStagePhase}${currentPhase}. Available: [${available}]. Re-run the previous phase.`);
  }

  if (!verifyToken(entry!.nonce, state.id, targetStagePhase.split(":")[0], targetStagePhase.split(":")[1], entry!.hash)) {
    const currentPhase = state.phase ? ` (current phase: ${state.phase})` : "";
    emitError(command, `Nonce verification failed for ${targetStagePhase}${currentPhase}. Re-run the previous phase.`);
  }

  // Consume: remove all pending transitions (new ones will be set by setTransitionNonces)
  state.pendingTransitions = undefined;
}

/**
 * Generate nonces for all allowed transitions from currentStagePhase.
 * Uses the transition graph to determine which targets are valid.
 */
export function setTransitionNonces(
  state: GenerationState,
  currentStagePhase: string,
): void {
  const targets = getTransitions(state.type, currentStagePhase);
  if (targets.length === 0) {
    // Terminal state (e.g., completion:commit) — no transitions to set
    state.pendingTransitions = undefined;
    state.phase = currentStagePhase.split(":")[1];
    return;
  }

  const pending: Record<string, { nonce: string; hash: string }> = {};
  for (const target of targets) {
    const [stage, phase] = target.split(":");
    pending[target] = generateToken(state.id, stage, phase);
  }

  state.pendingTransitions = pending;
  state.phase = currentStagePhase.split(":")[1];
}

/**
 * Prepare nonces for entering a new stage (used after stage complete phases).
 * Issues:
 * 1. Entry nonce for the target stage (ticket to enter)
 * 2. All graph transitions from the target entry (forward + back from that point)
 *
 * This allows both "enter the stage" and "go back" before work phase runs.
 */
export function prepareStageEntry(
  state: GenerationState,
  targetStageEntry: string,
): void {
  const [, entryPhase] = targetStageEntry.split(":");
  if (entryPhase !== "entry") {
    throw new Error(`prepareStageEntry expects a :entry target, got ${targetStageEntry}`);
  }

  const pending: Record<string, { nonce: string; hash: string }> = {};

  // Entry ticket
  const [stage, phase] = targetStageEntry.split(":");
  pending[targetStageEntry] = generateToken(state.id, stage, phase);

  // Also include back transitions from this entry point (so back works before work phase)
  const backTargets = getTransitions(state.type, targetStageEntry).filter((t) => {
    const [tStage] = t.split(":");
    return tStage !== stage; // Only back transitions (different stage)
  });
  for (const backTarget of backTargets) {
    const [bStage, bPhase] = backTarget.split(":");
    pending[backTarget] = generateToken(state.id, bStage, bPhase);
  }

  state.pendingTransitions = pending;
  state.phase = "entry";
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
      await executeHooks(paths.hooks, stageEvent, paths.root).catch(() => {});
    }
    await executeHooks(paths.hooks, "onLifeTransited", paths.root).catch(() => {});
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
      await executeHooks(paths.hooks, stageEvent, paths.root).catch(() => {});
    }
  }

  return next;
}
