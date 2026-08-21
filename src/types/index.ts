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
  /**
   * Slug of the milestone this generation serves. Set at `start --phase create`
   * from `--milestone`, or from the main milestone when the flag is absent.
   * Absent is valid — milestones are opt-in.
   */
  milestoneId?: string;
  fitnessFeedback?: string;
  /**
   * Side-channel for evaluator-surfaced concerns. Appended by
   * `validation --phase report-evaluator`; read by the fitness phase. Absent
   * (or empty) means "no concerns raised" — fitness behaves identically to
   * pre-gen-067.
   */
  evaluatorConcerns?: EvaluatorConcern[];
}

// ── Sequence (identity registry) ────────────────────────────

/**
 * Kinds whose ids are **numbered** — they are cited long after they are made,
 * and their population is stable enough that a running number reads as an
 * ordering rather than noise.
 *
 * The registry that backs these is append-only, so a number is spent forever.
 * That is only worth its bookkeeping where the id will be cited later.
 */
export const SEQUENCED_TYPES = ["goal", "milestone", "design"] as const;
export type SequencedType = (typeof SEQUENCED_TYPES)[number];

/**
 * Kinds whose ids are **hashed** — created and consumed constantly, and cited
 * only while they are alive.
 *
 * A backlog is consumed, archived to lineage and removed. An idea in
 * `freememo/` is written to be thrown away or promoted. A memory entry is
 * pruned every reflect. None of them is named after it goes, so a number would
 * buy nothing and leave the registry growing a dead row per item forever —
 * uniqueness comes from the hash instead, and there is no registry to keep.
 */
export const HASHED_TYPES = ["backlog", "idea", "memory"] as const;
export type HashedType = (typeof HASHED_TYPES)[number];

/** Every kind REAP assigns an id to. `generation` is absent — it has `gen-NNN-hash`. */
export type SequenceType = SequencedType | HashedType;

/** One row of `.reap/sequence/<type>.md`. */
export interface SequenceEntry {
  id: string;
  title: string;
  createdAt: string;
}

// ── Milestone ───────────────────────────────────────────────

/** One entry of a milestone's `## Generations` checklist. */
export interface MilestoneGeneration {
  checked: boolean;
  text: string;
}

/**
 * A plan between a vision goal and the generations that realise it.
 *
 * `status` and `main` are stored in frontmatter; at most one milestone is
 * main. Main is the focus, not a restriction — goal candidates come from every
 * valid open milestone, main first.
 *
 * Validity (a filled boundary) is derived from the content, never stored.
 */
export interface Milestone {
  /** Filename without `.md`. */
  slug: string;
  /** REAP-assigned id (`ms-002`), or "" for a file written before ids existed. */
  id: string;
  path: string;
  /** The `# ` heading. */
  title: string;
  /** Owning vision goal — must match an item or section in goals.md. */
  goal: string;
  status: "open" | "completed";
  main: boolean;
  exitCriteria: string[];
  outOfScope: string[];
  generations: MilestoneGeneration[];
  createdAt?: string;
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

