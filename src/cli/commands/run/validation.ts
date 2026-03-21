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
    emitError("validation", "No active Generation.");
  }
  if (state.stage !== "validation") {
    emitError("validation", `Current stage is '${state.stage}', not 'validation'.`);
  }

  const implArtifact = paths.artifact("03-implementation.md");
  if (!(await fileExists(implArtifact))) {
    emitError("validation", "03-implementation.md does not exist. Complete the implementation stage first.");
  }

  if (!phase || phase === "work") {
    // Phase 1: Gate passed — collect context and instruct AI

    const artifactPath = paths.artifact("04-validation.md");
    const existingArtifact = await readTextFile(artifactPath);
    const isReentry = !!existingArtifact && existingArtifact.length > 100;

    // Read constraints for validation commands
    const constraintsContent = await readTextFile(paths.constraints);
    const conventionsContent = await readTextFile(paths.conventions);

    // Read implementation and objective for completion criteria
    const implContent = await readTextFile(implArtifact);
    const objectiveContent = await readTextFile(paths.artifact("01-objective.md"));

    // Create artifact from template if not exists
    if (!isReentry) {
      const templateDir = join(require("os").homedir(), ".reap", "templates");
      const templatePath = join(templateDir, "04-validation.md");
      if (await fileExists(templatePath)) {
        const template = await readTextFile(templatePath);
        if (template) await writeTextFile(artifactPath, template);
      }
    }

    emitOutput({
      status: "prompt",
      command: "validation",
      phase: "work",
      completed: ["gate", "context-collect", "artifact-ensure"],
      context: {
        id: state.id,
        goal: state.goal,
        genomeVersion: state.genomeVersion,
        isReentry,
        constraintsContent: constraintsContent?.slice(0, 2000),
        conventionsContent: conventionsContent?.slice(0, 2000),
        implSummary: implContent?.slice(0, 3000),
        objectiveSummary: objectiveContent?.slice(0, 2000),
        artifactPath,
      },
      prompt: [
        "## Validation Stage Instructions",
        "",
        "HARD-GATE:",
        "- Do NOT declare 'pass' without running the validation commands.",
        "- Do NOT reuse results from a previous run -- execute them FRESH in this session.",
        "- 'It will probably pass' or 'It looks fine' is NOT validation.",
        "- Do NOT make claims without evidence.",
        "",
        isReentry ? "This is a RE-ENTRY. Reference previous validation report but overwrite with fresh results." : "",
        "",
        "### Steps:",
        "1. **Run Automated Validation**:",
        "   - Read Validation Commands from `.reap/genome/constraints.md`.",
        "   - Execute ALL commands in order: Test -> Lint -> Build -> Type check.",
        "   - Record actual output and exit code for each.",
        "",
        "2. **Convention Compliance Check**:",
        "   - Read Enforced Rules from `.reap/genome/conventions.md`.",
        "   - Execute verification command for each defined rule.",
        "",
        "3. **Completion Criteria Review**:",
        "   - Read criteria from 01-objective.md.",
        "   - Check deferred tasks in 03-implementation.md.",
        "   - Determine pass/fail/deferred for each criterion.",
        "",
        "4. **Minor Fix** (trivial issues only, under 5 minutes, no design changes):",
        "   - Fix typos, lint errors, minor bugs directly.",
        "   - Record all fixes in Minor Fixes section.",
        "   - Re-run relevant validation commands after fixes.",
        "",
        "5. **Verdict**:",
        "   - All pass + criteria met -> **pass**",
        "   - All pass + some criteria deferred -> **partial**",
        "   - Any failure or criteria not met -> **fail**",
        "   - If fail: provide regression guidance (/reap.back implementation/planning/objective).",
        "",
        "### Red Flags -- STOP if you catch yourself thinking:",
        "- 'It will probably pass' -> Run it.",
        "- 'It passed before' -> Run it again.",
        "- 'It's trivial' -> Fix and re-validate.",
        "",
        "### Artifact: Update `.reap/life/04-validation.md` progressively (after each command).",
        "### Language: Write all artifact content in the user's configured language.",
        "",
        "When verdict is pass or partial, run: reap run validation --phase complete",
        "When verdict is fail, provide regression guidance (do NOT run --phase complete).",
      ].filter(Boolean).join("\n"),
      nextCommand: "reap run validation --phase complete",
    });
  }

  if (phase === "complete") {
    const artifactPath = paths.artifact("04-validation.md");
    if (!(await fileExists(artifactPath))) {
      emitError("validation", "04-validation.md does not exist. Complete the validation work first.");
    }

    // Generate stage chain token
    const { nonce: stageToken, hash: tokenHash } = generateStageToken(state.id, state.stage);
    state.expectedTokenHash = tokenHash;
    await gm.save(state);

    // Execute hooks (only on pass/partial, not on fail)
    const hookResults = await executeHooks(paths.hooks, "onLifeValidated", paths.projectRoot);

    emitOutput({
      status: "ok",
      command: "validation",
      phase: "complete",
      completed: ["gate", "context-collect", "artifact-ensure", "creative-work", "artifact-verify", "hooks"],
      context: {
        id: state.id,
        stageToken,
        hookResults,
      },
      message: `Validation stage complete. Proceed to the Completion stage with /reap.next.\n\nIMPORTANT: Pass the following token to the next stage transition: \`reap run next --token ${stageToken}\`. Without this token, stage transition will be REJECTED.`,
    });
  }
}
