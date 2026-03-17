import { type LifeCycleStage, LIFECYCLE_ORDER } from "../types";

const LABELS: Record<LifeCycleStage, string> = {
  objective: "Goal Definition",
  planning: "Planning",
  implementation: "Implementation",
  validation: "Validation",
  completion: "Completion",
};

const STAGES = LIFECYCLE_ORDER;

export class LifeCycle {
  static next(stage: LifeCycleStage): LifeCycleStage | null {
    const idx = LIFECYCLE_ORDER.indexOf(stage);
    if (idx === -1 || idx === LIFECYCLE_ORDER.length - 1) return null;
    return LIFECYCLE_ORDER[idx + 1];
  }

  static canTransition(from: LifeCycleStage, to: LifeCycleStage): boolean {
    const fromIdx = LIFECYCLE_ORDER.indexOf(from);
    const toIdx = LIFECYCLE_ORDER.indexOf(to);
    // Forward: only to next adjacent stage
    // Backward: to any previous stage (micro loop)
    return toIdx === fromIdx + 1 || toIdx < fromIdx;
  }

  static prev(stage: LifeCycleStage): LifeCycleStage | null {
    const idx = LIFECYCLE_ORDER.indexOf(stage);
    if (idx <= 0) return null;
    return LIFECYCLE_ORDER[idx - 1];
  }

  static label(stage: LifeCycleStage): string {
    return LABELS[stage];
  }

  static isComplete(stage: LifeCycleStage): boolean {
    return stage === "completion";
  }

  static isValid(stage: string): boolean {
    return STAGES.includes(stage as LifeCycleStage);
  }

  static stages(): LifeCycleStage[] {
    return [...STAGES];
  }
}
