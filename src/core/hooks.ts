import { readdir } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";
import { readTextFile } from "./fs.js";

export interface HookResult {
  file: string;
  type: "sh" | "md";
  output?: string;
  prompt?: string;
  error?: string;
}

/**
 * Scan and run hooks for a lifecycle event.
 * Files matching `{event}.*.{sh|md}` in hooksDir are executed.
 * .sh files are run via execSync, .md files return their content as prompt.
 */
export async function runHooks(
  hooksDir: string,
  event: string,
  cwd: string,
): Promise<HookResult[]> {
  let entries: string[];
  try {
    entries = await readdir(hooksDir);
  } catch {
    return []; // no hooks dir
  }

  const matching = entries
    .filter((f) => f.startsWith(`${event}.`) && (f.endsWith(".sh") || f.endsWith(".md")))
    .sort(); // alphabetical order

  const results: HookResult[] = [];

  for (const file of matching) {
    const filePath = join(hooksDir, file);

    if (file.endsWith(".sh")) {
      try {
        const output = execSync(`bash "${filePath}"`, {
          cwd,
          encoding: "utf-8",
          timeout: 30_000,
          stdio: ["pipe", "pipe", "pipe"],
        });
        results.push({ file, type: "sh", output: output.trim() });
      } catch (err: any) {
        results.push({ file, type: "sh", error: err.message });
      }
    } else if (file.endsWith(".md")) {
      const content = await readTextFile(filePath);
      if (content) {
        results.push({ file, type: "md", prompt: content });
      }
    }
  }

  return results;
}
