/**
 * Adapter dispatcher — selects the correct adapter module based on the
 * `agentClient` config value.
 *
 * Usage:
 *   const adapter = getAdapter(config.agentClient);
 *   await adapter.installSkills(projectRoot);
 */
import type { AdapterModule } from "./types.js";
import { claudeCodeAdapter } from "./claude-code/index.js";
import { opencodeAdapter } from "./opencode/index.js";

export type AgentClient = "claude-code" | "opencode" | "codex";

/**
 * Resolve adapter for the given agentClient value.
 * Falls back to claude-code when value is unknown/undefined (defensive).
 * Throws for `codex` (explicitly out of scope until separate adapter is implemented).
 */
export function getAdapter(agentClient: AgentClient | string | undefined): AdapterModule {
  switch (agentClient) {
    case "claude-code":
    case undefined:
    case "":
      return claudeCodeAdapter;
    case "opencode":
      return opencodeAdapter;
    case "codex":
      throw new Error(
        "agentClient 'codex' is not yet supported. " +
        "Only 'claude-code' and 'opencode' are implemented. " +
        "See https://github.com/c-d-cc/reap/issues for tracking.",
      );
    default:
      // Unknown value — defensive fallback to claude-code rather than crashing.
      // (The config schema should have caught it; this is belt-and-suspenders.)
      return claudeCodeAdapter;
  }
}

export type { AdapterModule } from "./types.js";
