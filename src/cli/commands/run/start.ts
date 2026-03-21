import { join } from "path";
import { readdir } from "fs/promises";
import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { readTextFile, writeTextFile, fileExists } from "../../../core/fs";
import { scanBacklog, markBacklogConsumed } from "../../../core/backlog";
import { emitOutput, emitError } from "../../../core/run-output";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);

  if (!phase || phase === "scan") {
    // Phase 1: Gate + backlog scan
    const state = await gm.current();
    if (state && state.id) {
      emitError("start", `Generation ${state.id} is in progress (stage: ${state.stage}). Complete it before starting a new generation.`);
    }

    const backlogItems = await scanBacklog(paths.backlog);

    emitOutput({
      status: "prompt",
      command: "start",
      phase: "collect-goal",
      completed: ["gate", "backlog-scan"],
      context: { backlogItems },
      prompt: backlogItems.length > 0
        ? "Present the backlog items to the human. Ask: select one or enter a new goal. Set REAP_START_GOAL and optionally REAP_START_BACKLOG_FILE (selected backlog filename). Then run: reap run start --phase create"
        : "Ask the human for the goal of this generation. Set REAP_START_GOAL. Then run: reap run start --phase create",
      nextCommand: "reap run start --phase create",
    });
  }

  if (phase === "create") {
    // Phase 2: Create generation
    const goal = process.env.REAP_START_GOAL;
    if (!goal) {
      emitError("start", "REAP_START_GOAL environment variable is required.");
    }

    // Double-check gate
    const existing = await gm.current();
    if (existing && existing.id) {
      emitError("start", `Generation ${existing.id} is already in progress.`);
    }

    // Count lineage for genomeVersion
    let genomeVersion = 1;
    try {
      const lineageEntries = await readdir(paths.lineage);
      genomeVersion = lineageEntries.filter(e => e.startsWith("gen-")).length + 1;
    } catch { /* no lineage yet */ }

    // Create generation (ID + current.yml)
    const state = await gm.create(goal, genomeVersion);

    // Mark backlog consumed (after ID generation)
    const backlogFile = process.env.REAP_START_BACKLOG_FILE;
    if (backlogFile) {
      await markBacklogConsumed(paths.backlog, backlogFile, state.id);
    }

    // Create 01-objective.md from template
    const templateDir = join(require("os").homedir(), ".reap", "templates");
    const templatePath = join(templateDir, "01-objective.md");
    const destPath = paths.artifact("01-objective.md");

    if (await fileExists(templatePath)) {
      let template = await readTextFile(templatePath);
      if (template) {
        template = template.replace(/\{\{goal\}\}/g, goal);
        await writeTextFile(destPath, template);
      }
    }

    emitOutput({
      status: "prompt",
      command: "start",
      phase: "started",
      completed: ["gate", "backlog-scan", "create-generation", "backlog-consumed", "create-artifact"],
      context: {
        generationId: state.id,
        goal: state.goal,
        genomeVersion: state.genomeVersion,
        parents: state.parents,
        genomeHash: state.genomeHash,
      },
      prompt: `Generation ${state.id} created. Fill in the Goal section of 01-objective.md if needed. Then proceed with /reap.objective or /reap.evolve.`,
      message: `Generation ${state.id} started.`,
    });
  }
}
