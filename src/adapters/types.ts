/**
 * Adapter module interface — uniform contract for client-specific integration
 * (Claude Code, OpenCode, future Codex, ...).
 *
 * An adapter encapsulates HOW REAP integrates with a specific AI client:
 *   - user-level asset installation (`syncUserLevelAssets`, `installSkills`)
 *   - project-level entry-point file management (`ensureProjectIntegration` —
 *     CLAUDE.md for claude-code, AGENTS.md for opencode)
 *   - session-start / runtime integration registration
 *     (`registerSessionIntegration` — settings.json hooks for claude-code,
 *     opencode.json + plugin for opencode)
 *
 * `getAdapter(agentClient)` in `src/adapters/index.ts` returns the appropriate
 * module instance. Callers (install-skills, update, init/common) should always
 * go through the dispatcher.
 */
export type IntegrationAction = "created" | "appended" | "updated" | "skipped";

/**
 * What a `syncUserLevelAssets` call actually managed to place.
 *
 * `complete` exists because the individual installers swallow their own
 * failures — an unwritable agents directory or a hand-edited
 * `~/.claude/settings.json` that will not parse leaves the rest of the install
 * fine and that one piece absent. `ensureUserLevelAssets` records success in a
 * stamp, and a stamp written over a partial install is permanent: nothing
 * retries at the same version. That is the exact failure shape this whole
 * mechanism exists to remove, so the stamp is only written when `complete`.
 *
 * `missing` names the pieces that did not land, for diagnostics.
 */
export interface UserLevelSyncResult {
  complete: boolean;
  missing: string[];
}

export interface AdapterModule {
  /** Identifier (must match the agentClient field value). */
  readonly id: "claude-code" | "opencode" | "codex";

  /**
   * Install user-level (or shared) files that the client needs to interact
   * with REAP. For claude-code this means `~/.claude/commands/*`; for
   * opencode this means project-level `.opencode/plugins/reap-plugin.ts`.
   */
  installSkills(projectRoot: string): Promise<void>;

  /**
   * Ensure the project-level entry-point file exists and is up to date.
   * Returns an action describing what happened.
   */
  ensureProjectIntegration(projectRoot: string, projectName: string): Promise<IntegrationAction>;

  /**
   * Ensure runtime integration is registered (hook in settings.json,
   * plugin in opencode.json, etc.). Idempotent. Best-effort: silent on
   * absent target config.
   */
  registerSessionIntegration(projectRoot: string): Promise<void>;

  /**
   * Install every user-level asset this client needs, and nothing else.
   *
   * "User-level" is the contract, not a description: this must not read or
   * write the project directory, because `ensureUserLevelAssets` calls it from
   * wherever the user happened to run `reap` — including directories that are
   * not REAP projects.
   *
   * `installSkills` and `registerSessionIntegration` both delegate here rather
   * than repeating the list. Before gen-087 the list was repeated, and the two
   * copies had already drifted: `registerSessionIntegration` omitted
   * `~/.reap/reap-guide.md`, which the entry-point file imports by path.
   *
   * Must be silent (no `emitOutput`), idempotent, and prefix-anchored so
   * user-supplied files in the same directories survive. Must report whether
   * every piece landed — see `UserLevelSyncResult`.
   *
   * @param home - override for testing; defaults to the real home directory
   */
  syncUserLevelAssets(home?: string): Promise<UserLevelSyncResult>;

  /**
   * Absolute paths of the user-level directories this adapter legitimately
   * installs into.
   *
   * The integrity checker (`checkUserLevelArtifacts`) uses this to avoid
   * flagging an adapter's own install location as a legacy leftover. Before
   * gen-076 the checker hardcoded `~/.claude/commands` and warned about it while
   * `install-skills` was actively installing there — the two disagreed within
   * one release (issue #22).
   *
   * `core` must not import adapters, so the paths are injected at the call site
   * rather than looked up by the checker.
   *
   * @param home - override for testing; defaults to the real home directory
   */
  userLevelDirs(home?: string): string[];
}
