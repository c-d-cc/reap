// ── Lifecycle ────────────────────────────────────────────────

export const LIFECYCLE_STAGES = [
  "learning",
  "planning",
  "implementation",
  "validation",
  "completion",
] as const;

export type LifeCycleStage = (typeof LIFECYCLE_STAGES)[number];

export const COMPLETION_PHASES = [
  "reflect",
  "fitness",
  "adapt",
  "commit",
] as const;

export type CompletionPhase = (typeof COMPLETION_PHASES)[number];

export const MERGE_STAGES = [
  "detect",
  "mate",
  "merge",
  "reconcile",
  "validation",
  "completion",
] as const;

export type MergeStage = (typeof MERGE_STAGES)[number];

// ── Generation ──────────────────────────────────────────────

export type GenerationType = "embryo" | "normal" | "merge";

export interface GenerationState {
  id: string;
  type: GenerationType;
  stage: LifeCycleStage | MergeStage;
  goal: string;
  parents: string[];
  commonAncestor?: string;
  genomeHash?: string;
  timeline?: Array<{ stage: string; at: string }>;
  lastNonce?: string;
  expectedHash?: string;
  phase?: string;
  sourceBacklog?: string;
  fitnessFeedback?: string;
  backNonce?: string;
  backExpectedHash?: string;
  backTarget?: string;
  backTargetPhase?: string;
}

// ── Config ──────────────────────────────────────────────────

export interface ReapConfig {
  project: string;
  language: string;
  autoSubagent: boolean;
  strict: boolean;
  agentClient: "claude-code" | "opencode" | "codex";
  autoUpdate: boolean;
  cruiseCount?: string; // "1/5" format — present = cruise mode
}

// ── Output ──────────────────────────────────────────────────

export interface ReapOutput {
  status: "ok" | "prompt" | "error";
  command: string;
  phase?: string;
  completed?: string[];
  context?: Record<string, unknown>;
  message?: string;
  prompt?: string;
  nextCommand?: string;
}
