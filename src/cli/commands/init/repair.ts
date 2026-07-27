import YAML from "yaml";
import type { ReapPaths } from "../../../core/paths.js";
import { readTextFile } from "../../../core/fs.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { ensureClaudeMd } from "./common.js";
import type { ReapConfig } from "../../../types/index.js";

/**
 * Repair an existing reap project — supplement missing files.
 * Currently repairs: CLAUDE.md (create or append REAP section).
 */
export async function execute(paths: ReapPaths): Promise<void> {
  // Read project name from config
  const configContent = await readTextFile(paths.config);
  if (!configContent) {
    emitError("init", ".reap/config.yml not found. This is not a reap project. Run 'reap init' first.");
  }

  const config = YAML.parse(configContent) as ReapConfig;
  const projectName = config.project ?? "my-project";

  // Repair CLAUDE.md
  const claudeMdAction = await ensureClaudeMd(paths.root, projectName);

  const repaired: string[] = [];
  const skipped: string[] = [];

  // Only "skipped" means nothing happened. gen-054 added "updated" (the marker
  // section was replaced with a newer template) and it fell into the else branch
  // here, so a repair that rewrote the file reported itself as "already present"
  // — the one outcome the user could not verify by looking at the output.
  if (claudeMdAction === "skipped") {
    skipped.push("CLAUDE.md (REAP section already present)");
  } else {
    repaired.push(`CLAUDE.md (${claudeMdAction})`);
  }

  emitOutput({
    status: "ok",
    command: "init",
    phase: "repair",
    completed: ["check-config", "repair-claude-md"],
    context: {
      project: projectName,
      repaired,
      skipped,
    },
    message: repaired.length > 0
      ? `Repaired: ${repaired.join(", ")}`
      : "Nothing to repair — all files are up to date.",
  });
}
