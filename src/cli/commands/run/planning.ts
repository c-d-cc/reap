import { join } from "path";
import type { ReapPaths } from "../../../core/paths";
import { GenerationManager, generateStageToken } from "../../../core/generation";
import { readTextFile, writeTextFile, fileExists } from "../../../core/fs";
import { emitOutput, emitError } from "../../../core/run-output";
import { executeHooks } from "../../../core/hook-engine";
import { verifyStageEntry, performTransition, setPhaseNonce, verifyPhaseEntry } from "../../../core/stage-transition";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) {
    emitError("planning", "No active Generation.");
  }
  if (state.stage !== "planning") {
    emitError("planning", `Current stage is '${state.stage}', not 'planning'.`);
  }

  // Verify stage chain token from previous stage's --phase complete
  verifyStageEntry("planning", state);
  await gm.save(state);

  const objectiveArtifact = paths.artifact("01-objective.md");
  if (!(await fileExists(objectiveArtifact))) {
    emitError("planning", "01-objective.md does not exist. Complete the objective stage first.");
  }

  if (!phase || phase === "work") {
    // Phase 1: Gate passed — collect context and instruct AI

    const artifactPath = paths.artifact("02-planning.md");
    const existingArtifact = await readTextFile(artifactPath);
    const isReentry = !!existingArtifact && existingArtifact.length > 100;

    // Read objective
    const objectiveContent = await readTextFile(objectiveArtifact);

    // Read genome
    const constraintsContent = await readTextFile(paths.constraints);
    const conventionsContent = await readTextFile(paths.conventions);
    const principlesContent = await readTextFile(paths.principles);

    // Check if implementation artifact exists (re-entry with progress)
    const implContent = await readTextFile(paths.artifact("03-implementation.md"));

    // Create artifact from template if not exists
    if (!isReentry) {
      const templateDir = join(require("os").homedir(), ".reap", "templates");
      const templatePath = join(templateDir, "02-planning.md");
      if (await fileExists(templatePath)) {
        const template = await readTextFile(templatePath);
        if (template) await writeTextFile(artifactPath, template);
      }
    }

    // Set phase nonce — prevents skipping work phase
    setPhaseNonce(state, "planning", "work");
    await gm.save(state);

    emitOutput({
      status: "prompt",
      command: "planning",
      phase: "work",
      completed: ["gate", "context-collect", "artifact-ensure"],
      context: {
        id: state.id,
        goal: state.goal,
        genomeVersion: state.genomeVersion,
        isReentry,
        objectiveContent: objectiveContent?.slice(0, 3000),
        genome: {
          constraintsExcerpt: constraintsContent?.slice(0, 1000),
          conventionsExcerpt: conventionsContent?.slice(0, 1000),
          principlesExcerpt: principlesContent?.slice(0, 1000),
        },
        hasExistingImpl: !!implContent,
        artifactPath,
      },
      prompt: [
        "## Planning Stage Instructions",
        "",
        "HARD-GATE: Do NOT create a plan without reading 01-objective.md.",
        "Do NOT make technical decisions without reading the Genome (conventions.md, constraints.md).",
        "",
        isReentry ? "This is a RE-ENTRY (regression). Read the existing 02-planning.md and its Regression section. Address the regression reason." : "",
        "",
        "### Steps:",
        "1. **Read Objective**: Extract requirements and acceptance criteria from 01-objective.md.",
        "2. **Genome Reference**: Check constraints (Validation Commands), conventions (Enforced Rules), principles (Architecture Decisions).",
        "3. **Develop Implementation Plan**: Architecture approach, technology choices. Respect Tech Stack in constraints. STOP and ask if uncertain.",
        "4. **Task Decomposition**:",
        "   - Checklist format: `- [ ] T001 description`",
        "   - Max 20 tasks. If exceeding, split into Phases.",
        "   - Each task = one logical unit of change.",
        "   - Specify dependencies and parallelization potential.",
        "   - Format: `- [ ] T001 \\`src/path/file.ts\\` -- description`",
        "5. **E2E Test Scenarios** (if lifecycle logic is modified): Define setup -> action -> assertion scenarios.",
        "6. **Human Confirmation**: Finalize the plan with the human.",
        "",
        "### Self-Verification:",
        "- Every FR has a corresponding task?",
        "- Dependencies between tasks specified?",
        "- Target file/module specified for each task?",
        "- Phase classification is logical?",
        "",
        "### Artifact: Update `.reap/life/02-planning.md` progressively.",
        "### Language: Write all artifact content in the user's configured language.",
        "",
        "When done, run: reap run planning --phase complete",
      ].filter(Boolean).join("\n"),
      nextCommand: "reap run planning --phase complete",
    });
  }

  if (phase === "complete") {
    // Verify phase nonce from work phase
    verifyPhaseEntry("planning", state, "planning", "work");
    await gm.save(state);

    const artifactPath = paths.artifact("02-planning.md");
    if (!(await fileExists(artifactPath))) {
      emitError("planning", "02-planning.md does not exist. Complete the planning work first.");
    }

    const content = await readTextFile(artifactPath);
    if (!content || content.length < 50) {
      emitError("planning", "02-planning.md appears incomplete. Fill in the plan before completing.");
    }

    // Generate stage chain token
    const { nonce, hash } = generateStageToken(state.id, state.stage);
    state.expectedTokenHash = hash;
    state.lastNonce = nonce;

    // Execute stage-specific hooks (before transition)
    const hookResults = await executeHooks(paths.hooks, "onLifePlanned", paths.projectRoot);

    // Auto-transition to next stage
    const transition = await performTransition(paths, state, (s) => gm.save(s));

    const nextCommand = `reap run ${transition.nextStage}`;

    emitOutput({
      status: "ok",
      command: "planning",
      phase: "complete",
      completed: ["gate", "context-collect", "artifact-ensure", "creative-work", "artifact-verify", "hooks", "auto-transition"],
      context: {
        id: state.id,
        hookResults,
        nextStage: transition.nextStage,
        artifactFile: transition.artifactFile,
        transitionHookResults: [...transition.stageHookResults, ...transition.transitionHookResults],
      },
      message: `Planning stage complete. Auto-advanced to ${transition.nextStage}. Run: ${nextCommand}`,
      nextCommand,
    });
  }
}
