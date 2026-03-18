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
  command?: string;
  prompt?: string;
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
  /** Override auto-detected agents. If omitted, all detected agents are used. */
  agents?: AgentName[];
  /** Project-level language setting. Used by agents that don't have their own language config. */
  language?: string;
  /** Auto-update REAP on session start. Default: false */
  autoUpdate?: boolean;
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
