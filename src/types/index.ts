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
   * Opt-in: when true, REAP integrates with the local code-intelligence
   * daemon (`@c-d-cc/reap-daemon`, localhost:17224). Lifecycle moments
   * (start, learning, implementation complete, completion commit) call
   * `ensureRegistered` + `triggerIndexing`; `buildBasePrompt` and the
   * SessionStart hook context surface daemon usage hints to the agent.
   *
   * Default (omitted / false): all daemon-related CLI behaviour is a no-op
   * — byte-identical to pre-gen-068. Existing users see zero behaviour
   * change. The daemon helpers (`triggerIndexing`/`ensureRegistered`)
   * already silent-fail when the daemon process is unreachable, but the
   * gate at the call site avoids the spawn-attempt + 3s timeout cost when
   * the user has not opted in.
   *
   * Added in gen-068 (Issue #21 follow-up). MCP server interface is a
   * separate track (deferred to a future generation).
   */
  daemon?: boolean;
  /**
   * Where the daemon entry point lives, when reap cannot work it out.
   *
   * reap looks for the daemon from its own location, so the two only find each
   * other when they share a resolution root. Installing both globally with the
   * same manager happens to arrange that; installing reap globally and the
   * daemon into a project, or into two different prefixes, does not — and the
   * daemon is deliberately not a dependency of reap, so nothing can be declared
   * to bridge the gap. Naming the path closes it.
   *
   * Takes priority over the automatic search, and `REAP_DAEMON_BIN` takes
   * priority over this. A path that does not exist is reported but does not
   * stop the search: this file is committed, and a location that is right on
   * one machine is not necessarily right on the next.
   *
   * Default (omitted): the automatic search alone, exactly as before.
   */
  daemonBin?: string;
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

/**
 * How reap arrived at a daemon entry point.
 *
 * `env` and `config` are the locations a user named on purpose; `package` and
 * `checkout` are the two ways reap looks on its own. The distinction matters
 * because only the first two can be wrong in a way reap should complain about —
 * an automatic search that finds nothing is a situation, but a location that
 * was pointed at and turns out to be empty is a mistake.
 */
export type DaemonBinSource = "env" | "config" | "package" | "checkout";

/** A location the user named, and which of the two channels named it. */
export interface ExplicitDaemonBin {
  source: "env" | "config";
  /** Absolute, after `~` expansion and resolution against the project root. */
  path: string;
  /**
   * How to refer to that channel in a sentence, e.g. `REAP_DAEMON_BIN`.
   *
   * Travels with the value for the same reason `installCommand` does: `core`
   * phrases the diagnostic but must not spell the variable and config key, or
   * they would exist in two places and drift (gen-076 pattern).
   */
  label: string;
}

/**
 * Whether the separately-published daemon package is present and new enough.
 *
 * The daemon used to be a `file:` dependency of reap, which npm linked into
 * place whether or not the target shipped — so an install that had no daemon
 * at all was indistinguishable from one that did, and every call site quietly
 * treated the difference as "daemon is down". Splitting the package makes the
 * absence real, and this is what reap consults instead of guessing.
 *
 * `required`, `installCommand` and `locateHint` travel with the verdict so that
 * `core` can phrase a diagnostic without importing from `cli` or restating the
 * package name — one owner, injected, nothing to keep in sync (gen-076 pattern).
 */
export interface DaemonAvailability {
  /** Resolvable — either installed as a package or found in a source checkout. */
  installed: boolean;
  /** Absolute path to the daemon entry point, or null when unresolvable. */
  bin: string | null;
  /** Version declared by the resolved package, or null when unreadable. */
  version: string | null;
  /** Lowest daemon version this reap build is prepared to talk to. */
  required: string;
  /** Installed, but older than `required`. Distinct from not installed at all. */
  outdated: boolean;
  /** The npm package name, carried rather than parsed back out of the command. */
  packageName: string;
  /** What to tell the user to run. */
  installCommand: string;
  /** Where `bin` came from. `null` when nothing resolved. */
  source: DaemonBinSource | null;
  /**
   * A location the user named where nothing exists.
   *
   * Filled independently of the verdict: reap goes on to search for itself, so
   * a stale path in a committed `config.yml` does not break a machine where the
   * daemon is installed normally — but staying quiet about it would make an
   * explicit instruction disappear without a word, which is the same class of
   * defect this field exists to help fix.
   */
  explicitMiss: ExplicitDaemonBin | null;
  /** What to say when it is installed and reap still cannot find it. */
  locateHint: string;
}
