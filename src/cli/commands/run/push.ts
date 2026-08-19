import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { isGitRepo, gitPush, checkSubmoduleDirty, pushSubmodules } from "../../../core/git.js";
import { emitOutput, emitError } from "../../../core/output.js";

export async function execute(paths: ReapPaths): Promise<void> {
  // Check no active generation
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (state) {
    emitError("push", `Active generation ${state.id} exists. Complete or abort it before pushing.`);
  }

  // Check git repo
  if (!isGitRepo(paths.root)) {
    emitError("push", "Not a git repository. Cannot push.");
  }

  // Check submodule dirty state before pushing
  const dirtySubmodules = checkSubmoduleDirty(paths.root).filter((sm) => sm.dirty);
  if (dirtySubmodules.length > 0) {
    const names = dirtySubmodules.map((sm) => sm.name).join(", ");
    emitError(
      "push",
      `Submodule(s) have uncommitted changes: ${names}. Commit inside the submodule(s) first, then retry.`,
    );
  }

  // Push submodules first (so remote has the refs parent repo references)
  const smResults = pushSubmodules(paths.root);
  const failedSm = smResults.filter((r) => !r.success);
  if (failedSm.length > 0) {
    const detail = failedSm
      .map((r) => (r.error ? `${r.name}: ${r.error}` : r.name))
      .join("\n");
    emitError("push", `Failed to push submodule(s):\n${detail}`);
  }

  // Push main repo.
  //
  // The message is git's own, not a guess about what might be wrong. The
  // guess this replaced ("Check remote configuration and network") named two
  // things that were both fine in the case that prompted the change, and it
  // read as a diagnosis, so it sent the user looking in the wrong place. git
  // usually says exactly which command to run; that sentence is worth more
  // than anything reap can infer from a boolean. When nothing was captured —
  // no stderr, no stdout, no message — say that, rather than inventing a
  // cause to fill the gap.
  const { success, error } = gitPush(paths.root);
  if (!success) {
    emitError("push", error ? `git push failed:\n${error}` : "git push failed, and git reported no reason.");
  }

  emitOutput({
    status: "ok",
    command: "push",
    completed: ["gate", "git-push"],
    context: {},
    message: "Successfully pushed to remote.",
  });
}
