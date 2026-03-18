import { AgentRegistry } from "./agents";
import { ClaudeCodeAdapter } from "./agents/claude-code";
import type { ReapConfig } from "../types";

/**
 * Register REAP's SessionStart hook for all detected agents.
 */
export async function registerHooks(
  dryRun: boolean = false,
  config?: ReapConfig,
): Promise<{ results: Array<{ agent: string; action: string }> }> {
  const adapters = await AgentRegistry.getActiveAdapters(config);
  const results: Array<{ agent: string; action: string }> = [];

  for (const adapter of adapters) {
    const result = await adapter.registerSessionHook(dryRun);
    results.push({ agent: adapter.displayName, action: result.action });
  }

  return { results };
}

/**
 * Sync hook registration for all detected agents.
 */
export async function syncHooks(
  dryRun: boolean = false,
  config?: ReapConfig,
): Promise<{ results: Array<{ agent: string; action: string }> }> {
  const adapters = await AgentRegistry.getActiveAdapters(config);
  const results: Array<{ agent: string; action: string }> = [];

  for (const adapter of adapters) {
    const result = await adapter.syncSessionHook(dryRun);
    results.push({ agent: adapter.displayName, action: result.action });
  }

  return { results };
}

/**
 * Run migration for all agents that support it.
 */
export async function migrateHooks(
  dryRun: boolean = false,
): Promise<{ results: Array<{ agent: string; action: string }> }> {
  const adapters = AgentRegistry.allAdapters();
  const results: Array<{ agent: string; action: string }> = [];

  for (const adapter of adapters) {
    if (adapter.migrate) {
      const result = await adapter.migrate(dryRun);
      results.push({ agent: adapter.displayName, action: result.action });
    }
  }

  return { results };
}

// --- Backward compatibility ---

/**
 * @deprecated Use registerHooks() instead. Kept for backward compatibility.
 */
export async function registerClaudeHook(
  dryRun: boolean = false,
): Promise<{ action: "created" | "updated" | "skipped" }> {
  const adapter = new ClaudeCodeAdapter();
  return adapter.registerSessionHook(dryRun);
}

/**
 * @deprecated Use syncHooks() instead. Kept for backward compatibility.
 */
export async function syncHookRegistration(
  dryRun: boolean = false,
): Promise<{ action: "updated" | "skipped" }> {
  const adapter = new ClaudeCodeAdapter();
  return adapter.syncSessionHook(dryRun);
}

/**
 * @deprecated Use migrateHooks() instead. Kept for backward compatibility.
 */
export async function migrateHooksJsonToSettings(
  dryRun: boolean = false,
): Promise<{ action: "migrated" | "skipped" }> {
  const adapter = new ClaudeCodeAdapter();
  const result = await adapter.migrate!(dryRun);
  return { action: result.action as "migrated" | "skipped" };
}
