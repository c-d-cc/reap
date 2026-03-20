import { join } from "path";
import { homedir } from "os";
import { mkdir, readdir, unlink } from "fs/promises";
import { readTextFile, readTextFileOrThrow, writeTextFile, fileExists } from "../fs";
import { ReapPaths } from "../paths";
import type { AgentAdapter, AgentName } from "../../types";

const OPENCODE_STATE_DIR = join(homedir(), ".local", "state", "opencode");

export class OpenCodeAdapter implements AgentAdapter {
  readonly name: AgentName = "opencode";
  readonly displayName = "OpenCode";

  private get configDir(): string { return join(homedir(), ".config", "opencode"); }
  private get commandsDir(): string { return join(this.configDir, "commands"); }
  private get pluginsDir(): string { return join(this.configDir, "plugins"); }
  private get settingsPath(): string { return join(this.configDir, "opencode.json"); }
  private get tuiConfigPath(): string { return join(this.configDir, "tui.json"); }

  async detect(): Promise<boolean> {
    try {
      const { execSync } = await import("child_process");
      execSync("which opencode", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }

  getCommandsDir(): string {
    return this.commandsDir;
  }

  async installCommands(commandNames: string[], sourceDir: string): Promise<void> {
    // Install originals to ~/.reap/commands/
    await mkdir(ReapPaths.userReapCommands, { recursive: true });
    for (const cmd of commandNames) {
      const src = join(sourceDir, `${cmd}.md`);
      const dest = join(ReapPaths.userReapCommands, `${cmd}.md`);
      await writeTextFile(dest, await readTextFileOrThrow(src));
    }
  }

  async removeStaleCommands(validNames: Set<string>): Promise<void> {
    try {
      const existing = await readdir(this.commandsDir);
      for (const file of existing) {
        if (!file.startsWith("reap.") || !file.endsWith(".md")) continue;
        if (!validNames.has(file)) {
          await unlink(join(this.commandsDir, file));
        }
      }
    } catch { /* dir may not exist */ }
  }

  async registerSessionHook(dryRun: boolean = false): Promise<{ action: "created" | "updated" | "skipped" }> {
    // Install session-start plugin
    const pluginPath = join(this.pluginsDir, "reap-session-start.js");
    const exists = await fileExists(pluginPath);
    let pluginAction: "created" | "updated" | "skipped" = "skipped";

    if (exists) {
      const current = await readTextFile(pluginPath);
      const expected = await this.getPluginContent();
      if (current !== expected) {
        if (!dryRun) await writeTextFile(pluginPath, expected);
        pluginAction = "updated";
      }
    } else {
      if (!dryRun) {
        await mkdir(this.pluginsDir, { recursive: true });
        await writeTextFile(pluginPath, await this.getPluginContent());
      }
      pluginAction = "created";
    }

    // Configure TUI keybinds + default visibility
    if (!dryRun) {
      await this.ensureTuiConfig();
      await this.ensureDefaultVisibility();
    }

    return { action: pluginAction };
  }

  async syncSessionHook(dryRun: boolean = false): Promise<{ action: "updated" | "skipped" }> {
    const result = await this.registerSessionHook(dryRun);
    return { action: result.action === "skipped" ? "skipped" : "updated" };
  }

  async readLanguage(): Promise<string | null> {
    const content = await readTextFile(this.settingsPath);
    if (!content) return null;
    try {
      const settings = JSON.parse(content);
      return settings.language ?? null;
    } catch {
      return null;
    }
  }

  // --- Private helpers ---

  private async getPluginContent(): Promise<string> {
    const templatePath = join(ReapPaths.packageHooksDir, "opencode-session-start.js");
    return readTextFileOrThrow(templatePath);
  }

  /**
   * Ensure OpenCode KV store has clean default visibility.
   * Sets tool_details and thinking to hidden so REAP commands look clean.
   * Only sets values that are not already configured by the user.
   */
  private async ensureDefaultVisibility(): Promise<void> {
    const kvPath = join(OPENCODE_STATE_DIR, "kv.json");
    await mkdir(OPENCODE_STATE_DIR, { recursive: true });

    let kv: Record<string, unknown> = {};
    const existing = await readTextFile(kvPath);
    if (existing) {
      try {
        kv = JSON.parse(existing);
      } catch { /* corrupt, overwrite */ }
    }

    let changed = false;

    // Only set if not already explicitly configured
    if (kv["tool_details_visibility"] === undefined) {
      kv["tool_details_visibility"] = false;
      changed = true;
    }

    if (changed) {
      await writeTextFile(kvPath, JSON.stringify(kv, null, 2) + "\n");
    }
  }

  /**
   * Ensure tui.json has REAP-recommended keybinds.
   * Merges with existing config, never overwrites user settings.
   */
  private async ensureTuiConfig(): Promise<void> {
    await mkdir(this.configDir, { recursive: true });

    const reapKeybinds: Record<string, string> = {
      display_thinking: "<leader>t",
      tool_details: "<leader>d",
    };

    let config: Record<string, unknown> = {};
    const existing = await readTextFile(this.tuiConfigPath);
    if (existing) {
      try {
        config = JSON.parse(existing);
      } catch { /* corrupt file, overwrite */ }
    }

    const keybinds = (config["keybinds"] as Record<string, string>) ?? {};
    let changed = false;

    for (const [key, value] of Object.entries(reapKeybinds)) {
      // Only set if unset or "none" (default disabled)
      if (!keybinds[key] || keybinds[key] === "none") {
        keybinds[key] = value;
        changed = true;
      }
    }

    if (changed) {
      config["keybinds"] = keybinds;
      if (!config["$schema"]) {
        config = { $schema: "https://opencode.ai/tui.json", ...config };
      }
      await writeTextFile(this.tuiConfigPath, JSON.stringify(config, null, 2) + "\n");
    }
  }
}
