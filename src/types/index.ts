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

export type MergeStage =
  | "detect"
  | "mate"
  | "merge"
  | "sync"
  | "validation"
  | "completion";

export const MERGE_LIFECYCLE_ORDER: readonly MergeStage[] = [
  "detect", "mate", "merge",
  "sync", "validation", "completion",
] as const;

/** Any stage type (normal or merge) */
export type AnyStage = LifeCycleStage | MergeStage;

export interface TimelineEntry {
  stage: AnyStage;
  at: string;
  from?: AnyStage;          // regression only
  reason?: string;          // regression only
  refs?: string[];          // regression only: file paths, artifact sections, code locations
}

export type GenerationType = "normal" | "merge";

export interface GenerationState {
  id: string;
  goal: string;
  stage: AnyStage;
  genomeVersion: number;
  startedAt: string;
  completedAt?: string;
  timeline: TimelineEntry[];
  /** Generation type: normal (default) or merge */
  type?: GenerationType;
  /** Parent generation IDs (DAG structure) */
  parents?: string[];
  /** Genome content hash at generation start */
  genomeHash?: string;
  /** Common ancestor generation ID (merge only) */
  commonAncestor?: string;
}

/** Metadata stored in lineage/{gen-dir}/meta.yml */
export interface GenerationMeta {
  id: string;
  type: GenerationType;
  parents: string[];
  goal: string;
  genomeHash: string;
  startedAt: string;
  completedAt: string;
}

export type ReapHookEvent =
  // Normal lifecycle
  | "onLifeStarted" | "onLifeObjected" | "onLifePlanned" | "onLifeImplemented"
  | "onLifeValidated" | "onLifeCompleted" | "onLifeTransited" | "onLifeRegretted"
  // Merge lifecycle
  | "onMergeStarted" | "onMergeDetected" | "onMergeMated" | "onMergeMerged"
  | "onMergeSynced" | "onMergeValidated" | "onMergeCompleted" | "onMergeTransited";

export interface ReapConfig {
  version: string;
  project: string;
  stack?: string;
  preset?: string;
  entryMode: "greenfield" | "migration" | "adoption";
  /** Override auto-detected agents. If omitted, all detected agents are used. */
  agents?: AgentName[];
  /** Project-level language setting. Used by agents that don't have their own language config. */
  language?: string;
  /** Auto-update REAP on session start. Default: true */
  autoUpdate?: boolean;
  /** Strict mode: boolean (shorthand) or granular { edit, merge } */
  strict?: boolean | { edit?: boolean; merge?: boolean };
  /** Auto-report issues to GitHub when malfunction detected. Requires gh CLI. */
  autoIssueReport?: boolean;
  /** Auto-delegate evolve to a subagent via Agent tool. Default: true */
  autoSubagent?: boolean;
}

/** Resolved strict mode (always object form) */
export interface StrictMode {
  edit: boolean;
  merge: boolean;
}

// Agent adapter types
export type AgentName = "claude-code" | "opencode";

export interface AgentAdapter {
  readonly name: AgentName;
  readonly displayName: string;

  /** Check if this agent CLI is installed on the system */
  detect(): Promise<boolean>;

  /** Get the directory where slash commands should be installed */
  getCommandsDir(): string;

  /** Install slash command files from sourceDir */
  installCommands(commandNames: string[], sourceDir: string): Promise<void>;

  /** Remove stale commands not in validNames */
  removeStaleCommands(validNames: Set<string>): Promise<void>;

  /** Register REAP session start hook */
  registerSessionHook(dryRun?: boolean): Promise<{ action: "created" | "updated" | "skipped" }>;

  /** Sync session hook registration (update path if changed) */
  syncSessionHook(dryRun?: boolean): Promise<{ action: "updated" | "skipped" }>;

  /** Read language setting from agent config */
  readLanguage(): Promise<string | null>;

  /** Optional migration from legacy formats */
  migrate?(dryRun?: boolean): Promise<{ action: string }>;

  /** Clean up legacy user-level slash commands (e.g. ~/.claude/commands/reap.*.md) */
  cleanupLegacyCommands?(): Promise<string[]>;
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

// ── hook engine types ───────────────────────────────────────

export interface HookResult {
  name: string;
  event: string;
  type: "sh" | "md";
  status: "executed" | "skipped";
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  content?: string;
  skipReason?: string;
}

// ── reap run output types ──────────────────────────────────

export interface RunOutput {
  status: "ok" | "prompt" | "error";
  command: string;
  phase: string;
  completed: string[];
  context?: Record<string, unknown>;
  prompt?: string;
  nextCommand?: string;
  message?: string;
}
