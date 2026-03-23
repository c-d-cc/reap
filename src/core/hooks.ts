import { AgentRegistry } from "./agents";
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

