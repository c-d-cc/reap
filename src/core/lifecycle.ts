import { type LifeCycleStage, LIFECYCLE_ORDER } from "../types";

const LABELS: Record<LifeCycleStage, string> = {
  conception: "목표 설정",
  formation: "Define",
  planning: "Plan",
  growth: "Build",
  validation: "Verify",
  adaptation: "Retrospect",
  birth: "출산",
  legacy: "완료",
};

const STAGES = LIFECYCLE_ORDER;

export class LifeCycle {
  static next(stage: LifeCycleStage): LifeCycleStage | null {
    const idx = LIFECYCLE_ORDER.indexOf(stage);
    if (idx === -1 || idx === LIFECYCLE_ORDER.length - 1) return null;
    return LIFECYCLE_ORDER[idx + 1];
  }

  static canTransition(from: LifeCycleStage, to: LifeCycleStage): boolean {
    // Allow growth <-> validation loop
    if (from === "validation" && to === "growth") return true;
    const fromIdx = LIFECYCLE_ORDER.indexOf(from);
    const toIdx = LIFECYCLE_ORDER.indexOf(to);
    return toIdx === fromIdx + 1;
  }

  static label(stage: LifeCycleStage): string {
    return LABELS[stage];
  }

  static isComplete(stage: LifeCycleStage): boolean {
    return stage === "legacy";
  }

  static isValid(stage: string): boolean {
    return STAGES.includes(stage as LifeCycleStage);
  }

  static stages(): LifeCycleStage[] {
    return [...STAGES];
  }
}
