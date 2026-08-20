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

/**
 * A single concern raised by the reap-evaluate subagent during a stage.
 *
 * The builder records these via `reap run validation --phase report-evaluator
 * --severity <high|low> --summary "..."` after receiving the evaluator's reply.
 * Each entry persists across stages by living on the GenerationState, so the
 * subsequent fitness phase can detect unresolved high-impact concerns and
 * automatically abort cruise mode (gen-067, Issue follow-up of #20).
 *
 * Severity is intentionally binary (high vs. low) to align with the
 * escalation matrix in `~/.config/.../agent/reap-evaluate.md` and to avoid
 * inviting quantitative metrics (Goodhart's Law).
 */
export interface EvaluatorConcern {
  /** The lifecycle stage during which the concern was raised. */
  stage: "validation" | "fitness";
  /**
   * `"high"` mirrors the matrix's "Escalate" verdict (high impact OR low
   * confidence) and triggers cruise mode auto-abort. `"low"` is informational.
   */
  severity: "low" | "high";
  /** One-line description suitable for inclusion in a prompt or report. */
  summary: string;
  /** ISO 8601 timestamp captured at the moment the CLI ran. */
  recordedAt: string;
}

export interface GenerationState {
  id: string;
  type: GenerationType;
  stage: LifeCycleStage | MergeStage;
  goal: string;
  parents: string[];
  commonAncestor?: string;
  genomeHash?: string;
  timeline?: Array<{ stage: string; at: string }>;
  phase?: string;
  pendingTransitions?: Record<string, { nonce: string; hash: string }>;
  sourceBacklog?: string;
  fitnessFeedback?: string;
  /**
   * Side-channel for evaluator-surfaced concerns. Appended by
   * `validation --phase report-evaluator`; read by the fitness phase. Absent
   * (or empty) means "no concerns raised" — fitness behaves identically to
   * pre-gen-067.
   */
  evaluatorConcerns?: EvaluatorConcern[];
}

// ── Config ──────────────────────────────────────────────────

export interface ReapConfig {
  project: string;
  language: string;
  autoSubagent: boolean;
  strictEdit: boolean;
  strictMerge: boolean;
  agentClient: "claude-code" | "opencode" | "codex";
  autoUpdate: boolean;
  autoIssueReport: boolean;
  cruiseCount?: string; // "1/5" format — present = cruise mode
  // Opt-in: when true, the validation stage prompt instructs the orchestrator
  // to launch the `reap-evaluate` subagent for independent verification.
  // Default (omitted / false): no evaluator subagent, identical to pre-gen-066
  // behaviour. Evaluator runs in advisor mode — its assessment surfaces to the
  // user but does not override the builder's verdict.
  evaluator?: boolean;
  /**
   * The last REAP version up to which this project has applied per-version
   * migration instructions. Used by the migration instruction layer
   * (gen-071) to detect version gaps between the installed REAP package
   * and the project's last-migrated state.
   *
   * When `reap update` runs, REAP loads any `src/templates/migration/v*.md`
   * file whose version satisfies `lastMigratedVersion < v <= packageVersion`
   * and surfaces those instructions in:
   *   - `reap update` output (context.pendingMigrations)
   *   - SessionStart context (`# Pending Migrations` section)
   *   - the sync `.reap/.session-state.md` dump
   *
   * After the agent has applied the listed migrations, it (or the user)
   * runs `reap update --mark-migrated` which sets this field to the
   * current package version. Subsequent `reap update` runs then see no
   * pending migrations until the next REAP version ships a new
   * migration note.
   *
   * Default (omitted) is treated as `"0.0.0"` — meaning every migration
   * file ever shipped is pending. `backfillConfig` will populate the
   * default on first `reap update` so the field is always present after
   * one sync.
   *
   * Added in gen-071. Opt-in by virtue of being a no-op when no migration
   * files exist for versions newer than `lastMigratedVersion`.
   */
  lastMigratedVersion?: string;
}

// ── Output ──────────────────────────────────────────────────

// ── Hook Engine ────────────────────────────────────────────

export type ReapHookEvent =
  // Normal lifecycle
  | "onLifeStarted" | "onLifeLearned" | "onLifePlanned" | "onLifeImplemented"
  | "onLifeValidated" | "onLifeCompleted" | "onLifeTransited"
  // Merge lifecycle
  | "onMergeStarted" | "onMergeDetected" | "onMergeMated" | "onMergeMerged"
  | "onMergeReconciled" | "onMergeValidated" | "onMergeCompleted" | "onMergeTransited";

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

// ── Output ──────────────────────────────────────────────────

export interface ReapOutput {
  status: "ok" | "prompt" | "error" | "artifact-incomplete";
  command: string;
  phase?: string;
  completed?: string[];
  context?: Record<string, unknown>;
  message?: string;
  prompt?: string;
  nextCommand?: string;
}

