import type { AgentAdapter, AgentName, ReapConfig } from "../../types";
import { ClaudeCodeAdapter } from "./claude-code";
import { CodexAdapter } from "./codex";
import { OpenCodeAdapter } from "./opencode";

const ALL_ADAPTERS: AgentAdapter[] = [
  new ClaudeCodeAdapter(),
  new OpenCodeAdapter(),
  new CodexAdapter(),
];

export class AgentRegistry {
  /** Get all known adapters */
  static allAdapters(): AgentAdapter[] {
    return ALL_ADAPTERS;
  }

  /** Get adapter by name */
  static getAdapter(name: AgentName): AgentAdapter | undefined {
    return ALL_ADAPTERS.find(a => a.name === name);
  }

  /** Detect which agents are installed on the system */
  static async detectInstalled(): Promise<AgentAdapter[]> {
    const results = await Promise.all(
      ALL_ADAPTERS.map(async (adapter) => ({
        adapter,
        installed: await adapter.detect(),
      })),
    );
    return results.filter(r => r.installed).map(r => r.adapter);
  }

  /**
   * Get adapters to use for the current project.
   * If config.agents is set, use those. Otherwise, auto-detect.
   */
  static async getActiveAdapters(config?: ReapConfig): Promise<AgentAdapter[]> {
    if (config?.agents && config.agents.length > 0) {
      return config.agents
        .map(name => AgentRegistry.getAdapter(name))
        .filter((a): a is AgentAdapter => a !== undefined);
    }
    return AgentRegistry.detectInstalled();
  }

  /** Read language from the first agent that has it configured */
  static async readLanguage(adapters?: AgentAdapter[]): Promise<string | null> {
    const list = adapters ?? ALL_ADAPTERS;
    for (const adapter of list) {
      const lang = await adapter.readLanguage();
      if (lang) return lang;
    }
    return null;
  }
}
