import { createPaths } from "../../../core/paths.js";
import { emitError } from "../../../core/output.js";
import { detectV15 } from "../../../core/integrity.js";
import { makeBacklog } from "./backlog.js";
import { makeHook } from "./hook.js";

const RESOURCES = ["backlog", "hook"] as const;

export async function execute(resource: string, options: Record<string, string | undefined>): Promise<void> {
  const paths = createPaths(process.cwd());
  if (await detectV15(paths)) {
    emitError("make", "This project uses REAP v0.15 structure. Run '/reap.update' to upgrade to v0.16.");
  }

  if (resource === "backlog") {
    await makeBacklog(paths, options);
  } else if (resource === "hook") {
    await makeHook(paths, options);
  } else {
    emitError("make", `Unknown resource '${resource}'. Available: ${RESOURCES.join(", ")}`);
  }
}
