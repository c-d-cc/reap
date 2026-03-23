import { join } from "path";
import { homedir } from "os";
import { mkdir, readdir, unlink } from "fs/promises";
import { readTextFile, readTextFileOrThrow, writeTextFile } from "../fs";
import { ReapPaths } from "../paths";
import type { AgentAdapter, AgentName } from "../../types";

export class CodexAdapter implements AgentAdapter {
  readonly name: AgentName = "codex";
  readonly displayName = "Codex CLI";

  private get userDir(): string { return join(homedir(), ".codex"); }
  private get commandsDir(): string { return join(this.userDir, "prompts"); }
  private get hooksJsonPath(): string { return join(this.userDir, "hooks.json"); }
  private get configTomlPath(): string { return join(this.userDir, "config.toml"); }

  async detect(): Promise<boolean> {
    try {
      const { execSync } = await import("child_process");
      execSync("which codex", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }

  getCommandsDir(): string {
    return this.commandsDir;
  }

  async installCommands(commandNames: string[], sourceDir: string): Promise<void> {
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
    await mkdir(this.userDir, { recursive: true });
    const hooksFile = await this.readHooksJson();
    const hooks = (hooksFile["hooks"] as Record<string, unknown>) ?? {};
    const sessionStart = (hooks["SessionStart"] as unknown[]) ?? [];

    if (Array.isArray(sessionStart) && this.hasReapHook(sessionStart)) {
      return { action: "skipped" };
    }

    const hadHooksSection = "hooks" in hooksFile && "SessionStart" in hooks;
    hooksFile["hooks"] = {
      ...hooks,
      SessionStart: [
        ...(Array.isArray(sessionStart) ? sessionStart : []),
        this.getHookEntry(),
      ],
    };

    if (!dryRun) {
      await this.writeHooksJson(hooksFile);
    }

    return { action: hadHooksSection ? "updated" : "created" };
  }

  async syncSessionHook(dryRun: boolean = false): Promise<{ action: "updated" | "skipped" }> {
    const hooksFile = await this.readHooksJson();
    const hooks = (hooksFile["hooks"] as Record<string, unknown>) ?? {};
    const sessionStart = (hooks["SessionStart"] as unknown[]) ?? [];

    if (!Array.isArray(sessionStart) || !this.hasReapHook(sessionStart)) {
      await this.registerSessionHook(dryRun);
      return { action: "updated" };
    }

    const expectedEntry = this.getHookEntry();
    let changed = false;

    const updated = sessionStart.map((entry: unknown) => {
      if (typeof entry !== "object" || entry === null) return entry;
      const entryHooks = (entry as Record<string, unknown>)["hooks"];
      if (!Array.isArray(entryHooks)) return entry;
      const isReap = entryHooks.some((h: unknown) => {
        if (typeof h !== "object" || h === null) return false;
        const cmd = (h as Record<string, unknown>)["command"];
        return typeof cmd === "string" && cmd.includes("session-start");
      });
      if (isReap) {
        if (JSON.stringify(entry) !== JSON.stringify(expectedEntry)) {
          changed = true;
          return expectedEntry;
        }
      }
      return entry;
    });

    if (changed && !dryRun) {
      hooksFile["hooks"] = { ...hooks, SessionStart: updated };
      await this.writeHooksJson(hooksFile);
    }

    return { action: changed ? "updated" : "skipped" };
  }

  async readLanguage(): Promise<string | null> {
    const content = await readTextFile(this.configTomlPath);
    if (!content) return null;
    // Simple TOML parsing for language field
    const match = content.match(/^language\s*=\s*"([^"]+)"/m);
    return match ? match[1] : null;
  }

  async setupAgentMd(projectRoot: string): Promise<{ action: "created" | "updated" | "skipped" }> {
    const agentsMdPath = join(projectRoot, ".codex", "AGENTS.md");
    const marker = "# REAP Project";
    const reapSection = `# REAP Project\nThis project uses REAP. Session-start hook loads project knowledge on session start.\nIf context was compacted and REAP knowledge is lost, re-run the session-start hook.\n`;

    await mkdir(join(projectRoot, ".codex"), { recursive: true });

    const existing = await readTextFile(agentsMdPath);

    if (existing === null) {
      await writeTextFile(agentsMdPath, reapSection);
      return { action: "created" };
    }

    if (existing.includes(marker)) {
      const updated = existing.replace(/# REAP Project[\s\S]*?(?=\n# |\n*$)/, reapSection.trim());
      if (updated === existing) return { action: "skipped" };
      await writeTextFile(agentsMdPath, updated);
      return { action: "updated" };
    }

    await writeTextFile(agentsMdPath, reapSection + "\n" + existing);
    return { action: "created" };
  }

  async cleanupProjectFiles(projectRoot: string): Promise<{ removed: string[]; skipped: string[] }> {
    const removed: string[] = [];
    const skipped: string[] = [];

    // Clean REAP section from .codex/AGENTS.md
    const agentsMdPath = join(projectRoot, ".codex", "AGENTS.md");
    const content = await readTextFile(agentsMdPath);
    if (content !== null && content.includes("# REAP Project")) {
      const cleaned = content.replace(/# REAP Project[\s\S]*?(?=\n# |\s*$)/, "").trim();
      if (cleaned.length === 0) {
        await unlink(agentsMdPath);
        removed.push(".codex/AGENTS.md (deleted, was REAP-only)");
      } else {
        await writeTextFile(agentsMdPath, cleaned + "\n");
        removed.push(".codex/AGENTS.md (REAP section removed)");
      }
    } else {
      skipped.push(".codex/AGENTS.md (no REAP section)");
    }

    return { removed, skipped };
  }

  // --- Private helpers ---

  private getHookEntry() {
    const sessionStartPath = join(ReapPaths.packageHooksDir, "session-start.cjs");
    return {
      matcher: "",
      hooks: [{ type: "command" as const, command: `node "${sessionStartPath}"` }],
    };
  }

  private hasReapHook(sessionStartHooks: unknown[]): boolean {
    return sessionStartHooks.some((entry: unknown) => {
      if (typeof entry !== "object" || entry === null) return false;
      const hooks = (entry as Record<string, unknown>)["hooks"];
      if (!Array.isArray(hooks)) return false;
      return hooks.some((h: unknown) => {
        if (typeof h !== "object" || h === null) return false;
        const cmd = (h as Record<string, unknown>)["command"];
        return typeof cmd === "string" && cmd.includes("session-start");
      });
    });
  }

  private async readHooksJson(): Promise<Record<string, unknown>> {
    const content = await readTextFile(this.hooksJsonPath);
    if (content === null) return {};
    try {
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  private async writeHooksJson(data: Record<string, unknown>): Promise<void> {
    await mkdir(this.userDir, { recursive: true });
    await writeTextFile(this.hooksJsonPath, JSON.stringify(data, null, 2) + "\n");
  }
}
