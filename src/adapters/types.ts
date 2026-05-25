/**
 * Adapter module interface — uniform contract for client-specific integration
 * (Claude Code, OpenCode, future Codex, ...).
 *
 * An adapter encapsulates HOW REAP integrates with a specific AI client:
 *   - user-level skill/command installation (`installSkills`)
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
}
