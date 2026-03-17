export type LifeCycleStage =
  | "conception"
  | "formation"
  | "planning"
  | "growth"
  | "validation"
  | "adaptation"
  | "birth"
  | "legacy";

export const LIFECYCLE_ORDER: readonly LifeCycleStage[] = [
  "conception", "formation", "planning", "growth",
  "validation", "adaptation", "birth", "legacy",
] as const;

export interface GenerationState {
  id: string;
  goal: string;
  stage: LifeCycleStage;
  genomeVersion: number;
  startedAt: string;
  completedAt?: string;
}

export interface ReapConfig {
  version: string;
  project: string;
  stack?: string;
  preset?: string;
  entryMode: "greenfield" | "migration" | "adoption";
}

export interface MutationRecord {
  id: string;
  generationId: string;
  target: string;
  description: string;
  reason: string;
  suggestedChange: string;
  createdAt: string;
}

export interface AdaptationRecord {
  id: string;
  generationId: string;
  targetFile: string;
  description: string;
  diff: string;
  createdAt: string;
}
