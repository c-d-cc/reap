import { LIFECYCLE_STAGES, MERGE_STAGES, type LifeCycleStage, type MergeStage, type GenerationType } from "../types/index.js";

// ── Transition Graphs ─────────────────────────────────────────
// Key: current stage:phase, Value: allowed target stage:phase[]
// Back transitions are explicit entries (e.g., planning:entry -> learning:entry)

export const NORMAL_TRANSITIONS: Record<string, string[]> = {
  "learning:entry":           ["learning:complete"],
  "learning:complete":        ["planning:entry", "learning:entry"],
  "planning:entry":           ["planning:complete", "learning:entry"],
  "planning:complete":        ["implementation:entry", "learning:entry"],
  "implementation:entry":     ["implementation:complete", "planning:entry"],
  "implementation:complete":  ["validation:entry", "planning:entry"],
  "validation:entry":         ["validation:complete", "implementation:entry"],
  "validation:complete":      ["completion:entry", "implementation:entry"],
  "completion:entry":         ["completion:fitness", "validation:entry"],
  "completion:fitness":       ["completion:adapt", "completion:fitness", "validation:entry"],
  "completion:adapt":         ["completion:commit", "validation:entry"],
  "completion:commit":        [],
};

export const MERGE_TRANSITIONS: Record<string, string[]> = {
  "detect:entry":             ["detect:complete"],
  "detect:complete":          ["mate:entry", "detect:entry"],
  "mate:entry":               ["mate:complete", "detect:entry"],
  "mate:complete":            ["merge:entry", "detect:entry"],
  "merge:entry":              ["merge:complete", "mate:entry"],
  "merge:complete":           ["reconcile:entry", "mate:entry"],
  "reconcile:entry":          ["reconcile:complete", "merge:entry"],
  "reconcile:complete":       ["validation:entry", "merge:entry"],
  "validation:entry":         ["validation:complete", "reconcile:entry"],
  "validation:complete":      ["completion:entry", "reconcile:entry"],
  "completion:entry":         ["completion:fitness", "validation:entry"],
  "completion:fitness":       ["completion:adapt", "completion:fitness", "validation:entry"],
  "completion:adapt":         ["completion:commit", "validation:entry"],
  "completion:commit":        [],
};

/**
 * Get allowed transitions from a given stage:phase.
 * Returns target stage:phase strings, or empty array if none.
 */
export function getTransitions(type: GenerationType, stagePhase: string): string[] {
  const graph = type === "merge" ? MERGE_TRANSITIONS : NORMAL_TRANSITIONS;
  return graph[stagePhase] ?? [];
}

// ── Legacy helpers (still used by performTransition) ──────────

export function nextStage(current: LifeCycleStage): LifeCycleStage | null {
  const idx = LIFECYCLE_STAGES.indexOf(current);
  if (idx === -1 || idx === LIFECYCLE_STAGES.length - 1) return null;
  return LIFECYCLE_STAGES[idx + 1];
}

export function prevStage(current: LifeCycleStage): LifeCycleStage | null {
  const idx = LIFECYCLE_STAGES.indexOf(current);
  if (idx <= 0) return null;
  return LIFECYCLE_STAGES[idx - 1];
}

export function nextMergeStage(current: MergeStage): MergeStage | null {
  const idx = MERGE_STAGES.indexOf(current);
  if (idx === -1 || idx === MERGE_STAGES.length - 1) return null;
  return MERGE_STAGES[idx + 1];
}

export function prevMergeStage(current: MergeStage): MergeStage | null {
  const idx = MERGE_STAGES.indexOf(current);
  if (idx <= 0) return null;
  return MERGE_STAGES[idx - 1];
}
