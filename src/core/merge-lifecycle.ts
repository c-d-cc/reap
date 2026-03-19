import { type MergeStage, MERGE_LIFECYCLE_ORDER } from "../types";

const LABELS: Record<MergeStage, string> = {
  "detect": "Divergence Detection",
  "genome-resolve": "Genome Resolution",
  "source-resolve": "Source Resolution",
  "sync-test": "Sync Test",
  "completion": "Completion",
};

const STAGES = MERGE_LIFECYCLE_ORDER;

export class MergeLifeCycle {
  static next(stage: MergeStage): MergeStage | null {
    const idx = STAGES.indexOf(stage);
    if (idx === -1 || idx === STAGES.length - 1) return null;
    return STAGES[idx + 1];
  }

  static canTransition(from: MergeStage, to: MergeStage): boolean {
    const fromIdx = STAGES.indexOf(from);
    const toIdx = STAGES.indexOf(to);
    return toIdx === fromIdx + 1 || toIdx < fromIdx;
  }

  static prev(stage: MergeStage): MergeStage | null {
    const idx = STAGES.indexOf(stage);
    if (idx <= 0) return null;
    return STAGES[idx - 1];
  }

  static label(stage: MergeStage): string {
    return LABELS[stage];
  }

  static isComplete(stage: MergeStage): boolean {
    return stage === "completion";
  }

  static isValid(stage: string): boolean {
    return STAGES.includes(stage as MergeStage);
  }

  static stages(): MergeStage[] {
    return [...STAGES];
  }
}
