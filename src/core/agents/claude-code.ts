import { join } from "path";
import { homedir } from "os";
import { mkdir, readdir, rm, unlink } from "fs/promises";
import { readTextFile, readTextFileOrThrow, writeTextFile } from "../fs";
import { ReapPaths } from "../paths";
import type { AgentAdapter, AgentName } from "../../types";

export class ClaudeCodeAdapter implements AgentAdapter {
  readonly name: AgentName = "claude-code";
  readonly displayName = "Claude Code";

  private get userDir(): string { return join(homedir(), ".claude"); }
  private get commandsDir(): string { return join(this.userDir, "commands"); }
  private get settingsPath(): string { return join(this.userDir, "settings.json"); }
  private get hooksJsonPath(): string { return join(this.userDir, "hooks.json"); }

  async detect(): Promise<boolean> {
    try {
      const { execSync } = await import("child_process");
      execSync("which claude", { stdio: "ignore" });
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
    await mkdir(this.userDir, { recursive: true });
    const settings = await this.readSettings();

    const hooks = (settings["hooks"] as Record<string, unknown>) ?? {};
    const sessionStartHooks = (hooks["SessionStart"] as unknown[]) ?? [];

    if (Array.isArray(sessionStartHooks) && this.hasReapHook(sessionStartHooks)) {
      return { action: "skipped" };
    }

    const hadHooksSection = "hooks" in settings;
    settings["hooks"] = {
      ...hooks,
      SessionStart: [
        ...(Array.isArray(sessionStartHooks) ? sessionStartHooks : []),
        this.getHookEntry(),
      ],
    };

    if (!dryRun) {
      await this.writeSettings(settings);
    }

    return { action: hadHooksSection ? "updated" : "created" };
  }

  async syncSessionHook(dryRun: boolean = false): Promise<{ action: "updated" | "skipped" }> {
    const settings = await this.readSettings();
    const hooks = (settings["hooks"] as Record<string, unknown>) ?? {};
    const sessionStartHooks = (hooks["SessionStart"] as unknown[]) ?? [];

    if (!Array.isArray(sessionStartHooks) || !this.hasReapHook(sessionStartHooks)) {
      await this.registerSessionHook(dryRun);
      return { action: "updated" };
    }

    const expectedEntry = this.getHookEntry();
    let changed = false;

    const updated = sessionStartHooks.map((entry: unknown) => {
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
      settings["hooks"] = { ...hooks, SessionStart: updated };
      await this.writeSettings(settings);
    }

    return { action: changed ? "updated" : "skipped" };
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

  async migrate(dryRun: boolean = false): Promise<{ action: string }> {
    const fileContent = await readTextFile(this.hooksJsonPath);
    if (fileContent === null) return { action: "skipped" };

    let hooksJson: Record<string, unknown>;
    try {
      hooksJson = JSON.parse(fileContent);
    } catch {
      return { action: "skipped" };
    }

    const sessionStartHooks = hooksJson["SessionStart"];
    if (!Array.isArray(sessionStartHooks)) return { action: "skipped" };

    const reapEntries = sessionStartHooks.filter((entry: unknown) => {
      if (typeof entry !== "object" || entry === null) return false;
      const hooks = (entry as Record<string, unknown>)["hooks"];
      if (!Array.isArray(hooks)) return false;
      return hooks.some((h: unknown) => {
        if (typeof h !== "object" || h === null) return false;
        const cmd = (h as Record<string, unknown>)["command"];
        return typeof cmd === "string" && cmd.includes("session-start");
      });
    });

    if (reapEntries.length === 0) return { action: "skipped" };

    if (!dryRun) {
      await this.registerSessionHook(false);

      const filtered = sessionStartHooks.filter((entry: unknown) => {
        if (typeof entry !== "object" || entry === null) return true;
        const hooks = (entry as Record<string, unknown>)["hooks"];
        if (!Array.isArray(hooks)) return true;
        return !hooks.some((h: unknown) => {
          if (typeof h !== "object" || h === null) return false;
          const cmd = (h as Record<string, unknown>)["command"];
          return typeof cmd === "string" && cmd.includes("session-start");
        });
      });

      if (filtered.length === 0) {
        delete hooksJson["SessionStart"];
      } else {
        hooksJson["SessionStart"] = filtered;
      }

      if (Object.keys(hooksJson).length === 0) {
        await unlink(this.hooksJsonPath);
      } else {
        await writeTextFile(this.hooksJsonPath, JSON.stringify(hooksJson, null, 2) + "\n");
      }
    }

    return { action: "migrated" };
  }

  async cleanupLegacyCommands(): Promise<string[]> {
    const removed: string[] = [];
    try {
      const files = await readdir(this.commandsDir);
      for (const file of files) {
        if (file.startsWith("reap.") && file.endsWith(".md")) {
          await unlink(join(this.commandsDir, file));
          removed.push(file);
        }
      }
    } catch { /* dir may not exist */ }
    return removed;
  }

  async setupAgentMd(projectRoot: string): Promise<{ action: "created" | "updated" | "skipped" }> {
    return this.setupClaudeMd(projectRoot);
  }

  async cleanupProjectFiles(projectRoot: string): Promise<{ removed: string[]; skipped: string[] }> {
    const removed: string[] = [];
    const skipped: string[] = [];

    // Remove .claude/commands/reap.* files
    const claudeCommandsDir = join(projectRoot, ".claude", "commands");
    try {
      const files = await readdir(claudeCommandsDir);
      const matched = files.filter(f => f.startsWith("reap."));
      for (const file of matched) {
        await unlink(join(claudeCommandsDir, file));
        removed.push(`.claude/commands/${file}`);
      }
      if (matched.length === 0) skipped.push(".claude/commands/reap.* (none found)");
    } catch {
      skipped.push(".claude/commands/reap.* (directory not found)");
    }

    // Remove .claude/skills/reap.* directories
    const claudeSkillsDir = join(projectRoot, ".claude", "skills");
    try {
      const entries = await readdir(claudeSkillsDir);
      const matched = entries.filter(e => e.startsWith("reap."));
      for (const entry of matched) {
        await rm(join(claudeSkillsDir, entry), { recursive: true, force: true });
        removed.push(`.claude/skills/${entry}`);
      }
      if (matched.length === 0) skipped.push(".claude/skills/reap.* (none found)");
    } catch {
      skipped.push(".claude/skills/reap.* (directory not found)");
    }

    // Clean REAP section from .claude/CLAUDE.md
    const claudeMdPath = join(projectRoot, ".claude", "CLAUDE.md");
    const content = await readTextFile(claudeMdPath);
    if (content !== null && content.includes("# REAP Project")) {
      const cleaned = content.replace(/# REAP Project[\s\S]*?(?=\n# |\s*$)/, "").trim();
      if (cleaned.length === 0) {
        await unlink(claudeMdPath);
        removed.push(".claude/CLAUDE.md (deleted, was REAP-only)");
      } else {
        await writeTextFile(claudeMdPath, cleaned + "\n");
        removed.push(".claude/CLAUDE.md (REAP section removed)");
      }
    } else {
      skipped.push(".claude/CLAUDE.md (no REAP section)");
    }

    return { removed, skipped };
  }

  async setupClaudeMd(projectRoot: string): Promise<{ action: "created" | "updated" | "skipped" }> {
    const claudeMdPath = join(projectRoot, ".claude", "CLAUDE.md");
    const marker = "# REAP Project";
    const reapSection = `# REAP Project\nThis project uses REAP. Session-start hook loads project knowledge on session start.\nIf context was compacted and REAP knowledge is lost, re-run the session-start hook.\n`;

    // .claude/ 디렉토리 생성
    await mkdir(join(projectRoot, ".claude"), { recursive: true });

    const existing = await readTextFile(claudeMdPath);

    if (existing === null) {
      // 파일 없음 → 새로 생성
      await writeTextFile(claudeMdPath, reapSection);
      return { action: "created" };
    }

    if (existing.includes(marker)) {
      // 이미 REAP 섹션 존재 → 업데이트 (기존 REAP 섹션을 새 내용으로 교체)
      const updated = existing.replace(/# REAP Project[\s\S]*?(?=\n# |\n*$)/, reapSection.trim());
      if (updated === existing) return { action: "skipped" };
      await writeTextFile(claudeMdPath, updated);
      return { action: "updated" };
    }

    // 기존 내용 있지만 REAP 섹션 없음 → 맨 위에 추가
    await writeTextFile(claudeMdPath, reapSection + "\n" + existing);
    return { action: "created" };
  }

  // --- Private helpers ---

  private getHookEntry() {
    const sessionStartPath = join(ReapPaths.packageHooksDir, "session-start.cjs");
    return {
      matcher: "",
      hooks: [{ type: "command", command: `node "${sessionStartPath}"` }],
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

  private async readSettings(): Promise<Record<string, unknown>> {
    const content = await readTextFile(this.settingsPath);
    if (content === null) return {};
    try {
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  private async writeSettings(settings: Record<string, unknown>): Promise<void> {
    await mkdir(this.userDir, { recursive: true });
    await writeTextFile(this.settingsPath, JSON.stringify(settings, null, 2) + "\n");
  }
}
