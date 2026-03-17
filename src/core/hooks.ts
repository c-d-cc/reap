import { join } from "path";
import { mkdir, chmod } from "fs/promises";
import { ReapPaths } from "./paths";

const HOOK_FILES = ["session-start.sh", "reap-guide.md"];

const REAP_HOOK_ENTRY = {
  matcher: "",
  hooks: [
    {
      type: "command",
      command: "bash .reap/hooks/session-start.sh",
    },
  ],
};

/**
 * Copy hook scripts from templates to .reap/hooks/
 */
export async function installHookScripts(paths: ReapPaths): Promise<void> {
  await mkdir(paths.hooks, { recursive: true });

  for (const file of HOOK_FILES) {
    const src = join(import.meta.dir, "../templates/hooks", file);
    const dest = join(paths.hooks, file);
    await Bun.write(dest, await Bun.file(src).text());
    if (file.endsWith(".sh")) await chmod(dest, 0o755);
  }
}

/**
 * Sync hook scripts, returns list of changed files
 */
export async function syncHookScripts(
  paths: ReapPaths,
  dryRun: boolean = false,
): Promise<{ updated: string[]; skipped: string[] }> {
  const result = { updated: [] as string[], skipped: [] as string[] };

  await mkdir(paths.hooks, { recursive: true });

  for (const file of HOOK_FILES) {
    const src = await Bun.file(join(import.meta.dir, "../templates/hooks", file)).text();
    const destPath = join(paths.hooks, file);
    const existing = Bun.file(destPath);

    if (await existing.exists() && (await existing.text()) === src) {
      result.skipped.push(`.reap/hooks/${file}`);
    } else {
      if (!dryRun) {
        await Bun.write(destPath, src);
        if (file.endsWith(".sh")) await chmod(destPath, 0o755);
      }
      result.updated.push(`.reap/hooks/${file}`);
    }
  }

  return result;
}

/**
 * Register REAP's SessionStart hook in .claude/hooks.json
 * Merges with existing hooks if the file already exists
 */
export async function registerClaudeHook(
  paths: ReapPaths,
  dryRun: boolean = false,
): Promise<{ action: "created" | "updated" | "skipped" }> {
  const hooksJsonPath = paths.claudeHooksJson;
  const claudeDir = join(paths.claudeHooksJson, "..");
  await mkdir(claudeDir, { recursive: true });

  const file = Bun.file(hooksJsonPath);
  let existing: Record<string, unknown> = {};

  if (await file.exists()) {
    try {
      existing = JSON.parse(await file.text());
    } catch {
      // Corrupted file, overwrite
      existing = {};
    }
  }

  // Check if REAP hook is already registered
  const sessionStartHooks = (existing["SessionStart"] as unknown[]) ?? [];
  const hasReapHook = Array.isArray(sessionStartHooks) &&
    sessionStartHooks.some((entry: unknown) => {
      if (typeof entry !== "object" || entry === null) return false;
      const hooks = (entry as Record<string, unknown>)["hooks"];
      if (!Array.isArray(hooks)) return false;
      return hooks.some((h: unknown) => {
        if (typeof h !== "object" || h === null) return false;
        const cmd = (h as Record<string, unknown>)["command"];
        return typeof cmd === "string" && cmd.includes(".reap/hooks/session-start");
      });
    });

  if (hasReapHook) {
    return { action: "skipped" };
  }

  // Merge: append REAP hook to SessionStart array
  const merged = {
    ...existing,
    SessionStart: [...(Array.isArray(sessionStartHooks) ? sessionStartHooks : []), REAP_HOOK_ENTRY],
  };

  if (!dryRun) {
    await Bun.write(hooksJsonPath, JSON.stringify(merged, null, 2) + "\n");
  }

  return { action: Object.keys(existing).length === 0 ? "created" : "updated" };
}
