import { join } from "path";
import { readdir } from "fs/promises";
import type { ReapPaths } from "../../../core/paths";
import { GenerationManager, generateStageToken } from "../../../core/generation";
import { readTextFile, writeTextFile, fileExists } from "../../../core/fs";
import { scanBacklog } from "../../../core/backlog";
import { emitOutput, emitError } from "../../../core/run-output";
import { executeHooks } from "../../../core/hook-engine";
import { performTransition, setPhaseNonce, verifyPhaseEntry } from "../../../core/stage-transition";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) {
    emitError("objective", "No active Generation. Run /reap.start first.");
  }
  if (state.stage !== "objective") {
    emitError("objective", `Current stage is '${state.stage}', not 'objective'. Start a new Generation with /reap.start or check the current state with 'reap status'.`);
  }

  if (!phase || phase === "work") {
    // Phase 1: Gate passed — collect context and give AI creative instructions

    // Check re-entry
    const artifactPath = paths.artifact("01-objective.md");
    const existingArtifact = await readTextFile(artifactPath);
    const isReentry = !!existingArtifact && existingArtifact.length > 100;

    // Read environment summary
    const envSummary = await readTextFile(paths.environmentSummary);

    // Read previous generation's completion for lessons learned
    let prevCompletion: string | null = null;
    try {
      const lineageEntries = await readdir(paths.lineage);
      const genDirs = lineageEntries.filter(e => e.startsWith("gen-")).sort();
      if (genDirs.length > 0) {
        const lastGen = genDirs[genDirs.length - 1];
        prevCompletion = await readTextFile(join(paths.lineage, lastGen, "05-completion.md"));
        if (!prevCompletion) {
          // Try compressed lineage format
          const compressed = await readTextFile(join(paths.lineage, `${lastGen}.md`));
          if (compressed) prevCompletion = compressed.slice(0, 2000);
        }
      }
    } catch { /* no lineage */ }

    // Read backlog
    const backlogItems = await scanBacklog(paths.backlog);

    // Read genome
    const principlesContent = await readTextFile(paths.principles);
    const conventionsContent = await readTextFile(paths.conventions);
    const constraintsContent = await readTextFile(paths.constraints);

    // Read config for entryMode
    const configContent = await readTextFile(paths.config);

    // Count lineage to determine if first generation
    let lineageCount = 0;
    try {
      const entries = await readdir(paths.lineage);
      lineageCount = entries.filter(e => e.startsWith("gen-")).length;
    } catch { /* no lineage */ }

    // Create/ensure artifact exists
    if (!isReentry) {
      const templateDir = join(require("os").homedir(), ".reap", "templates");
      const templatePath = join(templateDir, "01-objective.md");
      if (await fileExists(templatePath)) {
        let template = await readTextFile(templatePath);
        if (template) {
          template = template.replace(/\{\{goal\}\}/g, state.goal);
          await writeTextFile(artifactPath, template);
        }
      }
    }

    // Set phase nonce — prevents skipping work phase
    setPhaseNonce(state, "objective", "work");
    await gm.save(state);

    emitOutput({
      status: "prompt",
      command: "objective",
      phase: "work",
      completed: ["gate", "context-collect", "artifact-ensure"],
      context: {
        id: state.id,
        goal: state.goal,
        genomeVersion: state.genomeVersion,
        isReentry,
        isFirstGeneration: lineageCount === 0,
        entryMode: configContent?.match(/entryMode:\s*(\w+)/)?.[1] ?? "adoption",
        environmentSummary: envSummary?.slice(0, 1000),
        previousCompletion: prevCompletion?.slice(0, 2000),
        backlogItems: backlogItems.filter(b => b.status !== "consumed"),
        genome: {
          principlesExcerpt: principlesContent?.slice(0, 1000),
          conventionsExcerpt: conventionsContent?.slice(0, 1000),
          constraintsExcerpt: constraintsContent?.slice(0, 1000),
        },
        artifactPath,
      },
      prompt: [
        "## Objective Stage Instructions",
        "",
        "HARD-GATE: Do NOT write any code until 01-objective.md is confirmed by the human.",
        "If the goal is ambiguous, STOP and ask the human.",
        "",
        "### Steps:",
        "1. **Environment Check**: Review environment summary if available. If missing, inform user about /reap.sync.environment.",
        "2. **Previous Generation Reference**: Review lessons learned from previous completion.",
        "3. **Backlog Review**: Review deferred tasks and planned goals.",
        "4. **Genome Health Check**: Evaluate genome files.",
        isReentry ? "   - This is a RE-ENTRY (regression). Read existing artifact's Regression section and address it." : "",
        lineageCount === 0 ? [
          "   - FIRST GENERATION: Direct genome authoring is permitted.",
          "   - Brief the human on what Genome means (project DNA: principles, conventions, constraints).",
          "   - Follow the entryMode-specific flow (greenfield/adoption/migration) to populate genome.",
        ].join("\n") : [
          "   - Evaluate genome health: placeholder-only files, files exceeding 100 lines, empty domain/.",
        ].join("\n"),
        "5. **Goal + Spec Definition (with optional Brainstorming)**:",
        "   - Assess complexity: simple tasks skip brainstorming, complex tasks enter it.",
        "   - Brainstorming protocol if needed: (a) Visual Companion proposal, (b) Clarifying questions ONE AT A TIME, (c) 2-3 approach exploration with comparison table, (d) Sectional design approval, (e) Scope decomposition check.",
        "   - Human can override: 'let's brainstorm this' or 'skip brainstorming'.",
        "6. **Genome Gap Analysis**: Identify missing genome info, record as genome-change backlog items.",
        "7. **Requirements Finalization**: Max 10 FR, max 7 completion criteria. Each must be verifiable.",
        "8. **Spec Review Loop**: Dispatch spec-document-reviewer subagent (max 3 iterations).",
        "",
        "### Artifact: Update `.reap/life/01-objective.md` progressively (do NOT wait until end).",
        "### Language: Write all artifact content in the user's configured language.",
        "",
        "When done, run: reap run objective --phase complete",
      ].filter(Boolean).join("\n"),
      nextCommand: "reap run objective --phase complete",
    });
  }

  if (phase === "complete") {
    // Verify phase nonce from work phase
    verifyPhaseEntry("objective", state, "objective", "work");
    await gm.save(state);

    // Phase 2: Verify artifact and run hooks
    const artifactPath = paths.artifact("01-objective.md");
    if (!(await fileExists(artifactPath))) {
      emitError("objective", "01-objective.md does not exist. Complete the objective work first.");
    }

    const content = await readTextFile(artifactPath);
    if (!content || content.length < 50) {
      emitError("objective", "01-objective.md appears incomplete (too short). Fill in the objective before completing.");
    }

    // Generate stage chain token — hash stored in current.yml, nonce given to AI
    const { nonce, hash } = generateStageToken(state.id, state.stage);
    state.expectedTokenHash = hash;
    state.lastNonce = nonce;

    // Execute stage-specific hooks (before transition)
    const hookResults = await executeHooks(paths.hooks, "onLifeObjected", paths.projectRoot);

    // Auto-transition to next stage
    const transition = await performTransition(paths, state, (s) => gm.save(s));

    const nextCommand = `reap run ${transition.nextStage}`;

    emitOutput({
      status: "ok",
      command: "objective",
      phase: "complete",
      completed: ["gate", "context-collect", "artifact-ensure", "creative-work", "artifact-verify", "hooks", "auto-transition"],
      context: {
        id: state.id,
        hookResults,
        nextStage: transition.nextStage,
        artifactFile: transition.artifactFile,
        transitionHookResults: [...transition.stageHookResults, ...transition.transitionHookResults],
      },
      message: `Objective stage complete. Auto-advanced to ${transition.nextStage}. Run: ${nextCommand}`,
      nextCommand,
    });
  }
}
