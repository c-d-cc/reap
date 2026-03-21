import { join } from "path";
import type { ReapPaths } from "../../../core/paths";
import { GenerationManager, generateStageToken } from "../../../core/generation";
import { readTextFile, writeTextFile, fileExists } from "../../../core/fs";
import { emitOutput, emitError } from "../../../core/run-output";
import { executeHooks } from "../../../core/hook-engine";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) {
    emitError("implementation", "No active Generation.");
  }
  if (state.stage !== "implementation") {
    emitError("implementation", `Current stage is '${state.stage}', not 'implementation'.`);
  }

  const planningArtifact = paths.artifact("02-planning.md");
  if (!(await fileExists(planningArtifact))) {
    emitError("implementation", "02-planning.md does not exist. Complete the planning stage first.");
  }

  if (!phase || phase === "work") {
    // Phase 1: Gate passed — collect context and instruct AI

    const artifactPath = paths.artifact("03-implementation.md");
    const existingArtifact = await readTextFile(artifactPath);
    const isReentry = !!existingArtifact && existingArtifact.length > 100;

    // Read planning
    const planningContent = await readTextFile(planningArtifact);

    // Read genome
    const conventionsContent = await readTextFile(paths.conventions);
    const constraintsContent = await readTextFile(paths.constraints);

    // Create artifact from template if not exists
    if (!isReentry) {
      const templateDir = join(require("os").homedir(), ".reap", "templates");
      const templatePath = join(templateDir, "03-implementation.md");
      if (await fileExists(templatePath)) {
        const template = await readTextFile(templatePath);
        if (template) await writeTextFile(artifactPath, template);
      }
    }

    emitOutput({
      status: "prompt",
      command: "implementation",
      phase: "work",
      completed: ["gate", "context-collect", "artifact-ensure"],
      context: {
        id: state.id,
        goal: state.goal,
        genomeVersion: state.genomeVersion,
        isReentry,
        planningContent: planningContent?.slice(0, 5000),
        genome: {
          conventionsExcerpt: conventionsContent?.slice(0, 1000),
          constraintsExcerpt: constraintsContent?.slice(0, 1000),
        },
        artifactPath,
      },
      prompt: [
        "## Implementation Stage Instructions",
        "",
        "HARD-GATE:",
        "- Do NOT write code without the task list from 02-planning.md.",
        "- Do NOT write code that violates the Genome (conventions.md, constraints.md).",
        "- Do NOT modify the Genome directly -- record changes in backlog.",
        "- Do NOT modify the Environment directly -- record changes in backlog.",
        "",
        isReentry ? "This is a RE-ENTRY (regression). Append to the existing 03-implementation.md. Preserve existing completion records." : "",
        "",
        "### Steps:",
        "1. **Load Task List**: Read tasks from 02-planning.md. Identify incomplete `[ ]` tasks.",
        "2. **Sequential Implementation**:",
        "   - Implement starting from the first incomplete task, in order.",
        "   - After EACH task completion, immediately update 03-implementation.md Completed Tasks table.",
        "   - After EACH deferred task, update Deferred Tasks table.",
        "   - After EACH genome issue discovery, update Genome-Change Backlog Items table.",
        "   - Strictly follow conventions.md and constraints.md rules.",
        "3. **Genome/Environment Changes**:",
        "   - Record in `.reap/life/backlog/` with type: genome-change or environment-change.",
        "   - Mark dependent tasks as [deferred] in 02-planning.md.",
        "   - Do NOT modify Genome or Environment files directly.",
        "4. **Out-of-Scope Issues**: Record in backlog as type: task. Do NOT fix unless human approves.",
        "5. **Completion Marking**: Mark completed tasks as `[x]` in 02-planning.md.",
        "",
        "### Escalation -- STOP and ask the human:",
        "- Task requirements unclear",
        "- Architectural decision needed but not in plan",
        "- Conflict with existing code",
        "- Scope significantly larger than expected",
        "",
        "### Artifact: Update `.reap/life/03-implementation.md` continuously (after each task).",
        "### Language: Write all artifact content in the user's configured language.",
        "",
        "When all tasks done, run: reap run implementation --phase complete",
      ].filter(Boolean).join("\n"),
      nextCommand: "reap run implementation --phase complete",
    });
  }

  if (phase === "complete") {
    const artifactPath = paths.artifact("03-implementation.md");
    if (!(await fileExists(artifactPath))) {
      emitError("implementation", "03-implementation.md does not exist. Complete the implementation work first.");
    }

    // Generate stage chain token
    const { nonce: stageToken, hash: tokenHash } = generateStageToken(state.id, state.stage);
    state.expectedTokenHash = tokenHash;
    await gm.save(state);

    // Execute hooks
    const hookResults = await executeHooks(paths.hooks, "onLifeImplemented", paths.projectRoot);

    emitOutput({
      status: "ok",
      command: "implementation",
      phase: "complete",
      completed: ["gate", "context-collect", "artifact-ensure", "creative-work", "hooks"],
      context: {
        id: state.id,
        stageToken,
        hookResults,
      },
      message: `Implementation stage complete. Proceed to the Validation stage with /reap.next.\n\nIMPORTANT: Pass the following token to the next stage transition: \`reap run next --token ${stageToken}\`. Without this token, stage transition will be REJECTED.`,
    });
  }
}
