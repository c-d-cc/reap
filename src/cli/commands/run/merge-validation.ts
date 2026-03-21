import type { ReapPaths } from "../../../core/paths";
import { MergeGenerationManager } from "../../../core/merge-generation";
import { readTextFile, fileExists } from "../../../core/fs";
import { emitOutput, emitError } from "../../../core/run-output";
import { executeHooks } from "../../../core/hook-engine";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const mgm = new MergeGenerationManager(paths);
  const state = await mgm.current();

  if (!state) {
    emitError("merge-validation", "No active Generation.");
  }
  if (state.type !== "merge") {
    emitError("merge-validation", `Generation type is '${state.type}', expected 'merge'.`);
  }
  if (state.stage !== "validation") {
    emitError("merge-validation", `Stage is '${state.stage}', expected 'validation'.`);
  }

  const syncArtifact = paths.artifact("04-sync.md");
  if (!(await fileExists(syncArtifact))) {
    emitError("merge-validation", "04-sync.md does not exist. Complete sync stage first.");
  }

  if (!phase || phase === "work") {
    // Phase 1: Gate passed, instruct AI to run validation commands
    const constraintsContent = await readTextFile(paths.constraints);

    emitOutput({
      status: "prompt",
      command: "merge-validation",
      phase: "work",
      completed: ["gate", "context-collect"],
      context: {
        id: state.id,
        goal: state.goal,
        constraintsContent: constraintsContent?.slice(0, 2000),
      },
      prompt: [
        "## Merge Validation -- Automated Verification",
        "",
        "HARD-GATE:",
        "- Do NOT declare 'pass' without running the validation commands.",
        "- Do NOT reuse results from a previous run -- execute them FRESH.",
        "",
        "### Steps:",
        "1. Read validation commands from `.reap/genome/constraints.md`",
        "2. Execute all commands in order:",
        "   - Tests (`bun test`)",
        "   - Type check (`bunx tsc --noEmit`)",
        "   - Build (`npm run build`)",
        "3. Record results in `05-validation.md`",
        "4. If all pass: run `reap run merge-validation --phase complete`",
        "5. If any fail:",
        "   - Analyze the failure",
        "   - `/reap.back merge` to fix source issues",
        "   - Or `/reap.back mate` if the genome needs adjustment",
        "   - Do NOT run --phase complete on failure",
      ].join("\n"),
      nextCommand: "reap run merge-validation --phase complete",
    });
  }

  if (phase === "complete") {
    // Phase 2: Execute hooks (only on pass) and signal completion
    const validationArtifact = paths.artifact("05-validation.md");
    if (!(await fileExists(validationArtifact))) {
      emitError("merge-validation", "05-validation.md does not exist. Complete validation work first.");
    }

    const hookResults = await executeHooks(paths.hooks, "onMergeValidated", paths.projectRoot);

    emitOutput({
      status: "ok",
      command: "merge-validation",
      phase: "complete",
      completed: ["gate", "context-collect", "validation-work", "hooks"],
      context: {
        id: state.id,
        hookResults,
      },
      message: "Validation stage complete. Run /reap.next to advance to completion stage.",
    });
  }
}
