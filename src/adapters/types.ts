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

/**
 * What a `removeUserLevelAssets` call actually took away, and what it chose to
 * leave behind.
 *
 * Both halves are reported because "nothing was removed" and "the command did
 * not run" look identical from the outside, and the whole point of an uninstall
 * is that things are gone. A caller — and a test — needs a number it can check
 * before reading anything into an empty directory.
 *
 * `kept` names what was deliberately spared: a user's own files in the same
 * directories, a hook entry that also carries a command REAP did not write.
 * Silence there would be indistinguishable from having deleted it.
 */
export interface UserLevelRemovalResult {
  removed: string[];
  kept: string[];
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
   * Take away every user-level asset this client installs, and nothing else.
   *
   * The exact inverse of `syncUserLevelAssets`, and deliberately declared right
   * next to it: the two share a list that cannot be shared as a value — one
   * copies directories, one edits JSON, one writes a single file — so the only
   * thing keeping them in step is that whoever adds a fifth asset is looking at
   * both. Each adapter implements them in the same file for the same reason,
   * and both carry `reap:carrier(user-level-asset-set)`.
   *
   * npm never runs code at uninstall time — `preuninstall` and `postuninstall`
   * were measured on npm 10 and 12, global and local, and fire in neither — so
   * this is reached from `reap uninstall` rather than from a package hook.
   *
   * Removal is prefix-anchored (`reap.*`, `reap-*`) and, inside `~/.reap/`,
   * restricted to a named allowlist. Anything not on the list survives. Must be
   * silent, idempotent, and safe to call from a directory that is not a REAP
   * project.
   *
   * @param home - override for testing; defaults to the real home directory
   */
  removeUserLevelAssets(home?: string): Promise<UserLevelRemovalResult>;

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
