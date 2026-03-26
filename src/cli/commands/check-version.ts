import { join } from "path";
import { fileExists } from "../../core/fs.js";
import { createPaths } from "../../core/paths.js";

/**
 * Check if the current project uses v0.15 structure and print a warning.
 * Used by postinstall — outputs plain text (not JSON) and exits silently.
 */
export async function execute(): Promise<void> {
  const root = process.cwd();
  const paths = createPaths(root);

  // Check if .reap/ exists at all
  if (!(await fileExists(paths.config))) {
    return; // Not a reap project — silent exit
  }

  // Check for v0.15 indicator
  if (await fileExists(join(paths.genome, "principles.md"))) {
    console.log(
      "\n⚠ REAP v0.15 project detected. Run '/reap.update' in your AI agent to upgrade to v0.16.\n"
    );
  }
}
