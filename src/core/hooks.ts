import { join } from "path";
import { mkdir, unlink } from "fs/promises";
import { ReapPaths } from "./paths";
import { readTextFile, writeTextFile } from "./fs";

/**
 * The hook command references the package-internal session-start.sh via absolute path.
 * session-start.sh uses cwd to find the project's .reap/ directory.
 */
function getReapHookEntry() {
  const sessionStartPath = join(ReapPaths.packageHooksDir, "session-start.sh");
  return {
    matcher: "",
    hooks: [
      {
        type: "command",
        command: `bash "${sessionStartPath}"`,
      },
    ],
  };
}

/**
 * Read and parse settings.json, returning the parsed object.
 * Returns empty object if file doesn't exist or is corrupted.
 */
async function readSettingsJson(): Promise<Record<string, unknown>> {
  const fileContent = await readTextFile(ReapPaths.userClaudeSettingsJson);
  if (fileContent === null) return {};
  try {
    return JSON.parse(fileContent);
  } catch {
    return {};
  }
}

/**
 * Write settings.json, preserving formatting.
 */
async function writeSettingsJson(settings: Record<string, unknown>): Promise<void> {
  await mkdir(ReapPaths.userClaudeDir, { recursive: true });
  await writeTextFile(ReapPaths.userClaudeSettingsJson, JSON.stringify(settings, null, 2) + "\n");
}

/**
 * Check if REAP hook exists in a SessionStart hooks array.
 */
function hasReapHookInArray(sessionStartHooks: unknown[]): boolean {
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

/**
 * Register REAP's SessionStart hook in user-level ~/.claude/settings.json
 * Merges with existing settings, preserving all other sections.
 */
export async function registerClaudeHook(
  dryRun: boolean = false,
): Promise<{ action: "created" | "updated" | "skipped" }> {
  await mkdir(ReapPaths.userClaudeDir, { recursive: true });

  const settings = await readSettingsJson();

  // Navigate to settings.hooks.SessionStart
  const hooks = (settings["hooks"] as Record<string, unknown>) ?? {};
  const sessionStartHooks = (hooks["SessionStart"] as unknown[]) ?? [];

  if (Array.isArray(sessionStartHooks) && hasReapHookInArray(sessionStartHooks)) {
    return { action: "skipped" };
  }

  // Merge: append REAP hook to SessionStart array
  const hadHooksSection = "hooks" in settings;
  settings["hooks"] = {
    ...hooks,
    SessionStart: [
      ...(Array.isArray(sessionStartHooks) ? sessionStartHooks : []),
      getReapHookEntry(),
    ],
  };

  if (!dryRun) {
    await writeSettingsJson(settings);
  }

  return { action: hadHooksSection ? "updated" : "created" };
}

/**
 * Sync hook registration in user-level ~/.claude/settings.json
 * Updates the command path if it changed (e.g., after package update)
 */
export async function syncHookRegistration(
  dryRun: boolean = false,
): Promise<{ action: "updated" | "skipped" }> {
  const settings = await readSettingsJson();

  const hooks = (settings["hooks"] as Record<string, unknown>) ?? {};
  const sessionStartHooks = (hooks["SessionStart"] as unknown[]) ?? [];

  if (!Array.isArray(sessionStartHooks) || !hasReapHookInArray(sessionStartHooks)) {
    await registerClaudeHook(dryRun);
    return { action: "updated" };
  }

  const expectedEntry = getReapHookEntry();
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
      const currentJson = JSON.stringify(entry);
      const expectedJson = JSON.stringify(expectedEntry);
      if (currentJson !== expectedJson) {
        changed = true;
        return expectedEntry;
      }
    }
    return entry;
  });

  if (changed && !dryRun) {
    settings["hooks"] = { ...hooks, SessionStart: updated };
    await writeSettingsJson(settings);
  }

  return { action: changed ? "updated" : "skipped" };
}

/**
 * Migrate REAP hooks from ~/.claude/hooks.json to ~/.claude/settings.json
 * After migration, removes the REAP entry from hooks.json (or deletes hooks.json if empty).
 */
export async function migrateHooksJsonToSettings(
  dryRun: boolean = false,
): Promise<{ action: "migrated" | "skipped" }> {
  const hooksJsonPath = ReapPaths.userClaudeHooksJson;
  const fileContent = await readTextFile(hooksJsonPath);
  if (fileContent === null) return { action: "skipped" };

  let hooksJson: Record<string, unknown>;
  try {
    hooksJson = JSON.parse(fileContent);
  } catch {
    return { action: "skipped" };
  }

  const sessionStartHooks = hooksJson["SessionStart"];
  if (!Array.isArray(sessionStartHooks)) return { action: "skipped" };

  // Find REAP hook entries
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
    // Ensure REAP hook is registered in settings.json
    await registerClaudeHook(false);

    // Remove REAP entries from hooks.json
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

    // If hooks.json is now empty, delete it; otherwise rewrite
    if (Object.keys(hooksJson).length === 0) {
      await unlink(hooksJsonPath);
    } else {
      await writeTextFile(hooksJsonPath, JSON.stringify(hooksJson, null, 2) + "\n");
    }
  }

  return { action: "migrated" };
}
