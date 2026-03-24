import { LIFECYCLE_STAGES, MERGE_STAGES, type LifeCycleStage, type MergeStage } from "../types/index.js";

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
