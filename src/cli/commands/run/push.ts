import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { isGitRepo, gitPush } from "../../../core/git.js";
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

  // Push
  const success = gitPush(paths.root);
  if (!success) {
    emitError("push", "git push failed. Check remote configuration and network.");
  }

  emitOutput({
    status: "ok",
    command: "push",
    completed: ["gate", "git-push"],
    context: {},
    message: "Successfully pushed to remote.",
  });
}
