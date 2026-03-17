export type LifeCycleStage =
  | "objective"
  | "planning"
  | "implementation"
  | "validation"
  | "completion";

export const LIFECYCLE_ORDER: readonly LifeCycleStage[] = [
  "objective", "planning", "implementation",
  "validation", "completion",
] as const;

export interface TimelineEntry {
  stage: LifeCycleStage;
  at: string;
  from?: LifeCycleStage;   // regression only
  reason?: string;          // regression only
  refs?: string[];          // regression only: file paths, artifact sections, code locations
}

export interface GenerationState {
  id: string;
  goal: string;
  stage: LifeCycleStage;
  genomeVersion: number;
  startedAt: string;
  completedAt?: string;
  timeline: TimelineEntry[];
}

export type ReapHookEvent = "onGenerationStart" | "onStageTransition" | "onGenerationComplete" | "onRegression";

export interface ReapHookCommand {
  command: string;
}

export interface ReapHooks {
  onGenerationStart?: ReapHookCommand[];
  onStageTransition?: ReapHookCommand[];
  onGenerationComplete?: ReapHookCommand[];
  onRegression?: ReapHookCommand[];
}

export interface ReapConfig {
  version: string;
  project: string;
  stack?: string;
  preset?: string;
  entryMode: "greenfield" | "migration" | "adoption";
  hooks?: ReapHooks;
}

export type BacklogItemType = "genome-change" | "environment-change" | "task";

export interface BacklogItem {
  type: BacklogItemType;
  target?: string;
  title: string;
  description: string;
}

export interface AdaptationRecord {
  id: string;
  generationId: string;
  targetFile: string;
  description: string;
  diff: string;
  createdAt: string;
}
