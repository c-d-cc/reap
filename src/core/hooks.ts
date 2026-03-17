import { join } from "path";
import { mkdir } from "fs/promises";
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
 * Register REAP's SessionStart hook in user-level ~/.claude/hooks.json
 * Merges with existing hooks if the file already exists
 */
export async function registerClaudeHook(
  dryRun: boolean = false,
): Promise<{ action: "created" | "updated" | "skipped" }> {
  const hooksJsonPath = ReapPaths.userClaudeHooksJson;
  await mkdir(ReapPaths.userClaudeDir, { recursive: true });

  let existing: Record<string, unknown> = {};

  const fileContent = await readTextFile(hooksJsonPath);
  if (fileContent !== null) {
    try {
      existing = JSON.parse(fileContent);
    } catch {
      // Corrupted file, overwrite
      existing = {};
    }
  }

  // Check if REAP hook is already registered (check for session-start reference)
  const sessionStartHooks = (existing["SessionStart"] as unknown[]) ?? [];
  const hasReapHook = Array.isArray(sessionStartHooks) &&
    sessionStartHooks.some((entry: unknown) => {
      if (typeof entry !== "object" || entry === null) return false;
      const hooks = (entry as Record<string, unknown>)["hooks"];
      if (!Array.isArray(hooks)) return false;
      return hooks.some((h: unknown) => {
        if (typeof h !== "object" || h === null) return false;
        const cmd = (h as Record<string, unknown>)["command"];
        return typeof cmd === "string" && cmd.includes("session-start");
      });
    });

  if (hasReapHook) {
    return { action: "skipped" };
  }

  // Merge: append REAP hook to SessionStart array
  const merged = {
    ...existing,
    SessionStart: [...(Array.isArray(sessionStartHooks) ? sessionStartHooks : []), getReapHookEntry()],
  };

  if (!dryRun) {
    await writeTextFile(hooksJsonPath, JSON.stringify(merged, null, 2) + "\n");
  }

  return { action: Object.keys(existing).length === 0 ? "created" : "updated" };
}

/**
 * Sync hook registration in user-level ~/.claude/hooks.json
 * Updates the command path if it changed (e.g., after package update)
 */
export async function syncHookRegistration(
  dryRun: boolean = false,
): Promise<{ action: "updated" | "skipped" }> {
  const hooksJsonPath = ReapPaths.userClaudeHooksJson;

  const fileContent = await readTextFile(hooksJsonPath);
  if (fileContent === null) {
    await registerClaudeHook(dryRun);
    return { action: "updated" };
  }

  let existing: Record<string, unknown>;
  try {
    existing = JSON.parse(fileContent);
  } catch {
    await registerClaudeHook(dryRun);
    return { action: "updated" };
  }

  // Find and update existing REAP hook entry with current package path
  const sessionStartHooks = (existing["SessionStart"] as unknown[]) ?? [];
  if (!Array.isArray(sessionStartHooks)) {
    await registerClaudeHook(dryRun);
    return { action: "updated" };
  }

  const expectedEntry = getReapHookEntry();
  let changed = false;

  const updated = sessionStartHooks.map((entry: unknown) => {
    if (typeof entry !== "object" || entry === null) return entry;
    const hooks = (entry as Record<string, unknown>)["hooks"];
    if (!Array.isArray(hooks)) return entry;
    const isReap = hooks.some((h: unknown) => {
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
    existing["SessionStart"] = updated;
    await writeTextFile(hooksJsonPath, JSON.stringify(existing, null, 2) + "\n");
  }

  return { action: changed ? "updated" : "skipped" };
}
