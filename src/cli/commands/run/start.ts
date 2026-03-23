import { join } from "path";
import { readdir } from "fs/promises";
import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { setNonce } from "../../../core/stage-transition";
import { readTextFile, writeTextFile, fileExists } from "../../../core/fs";
import { scanBacklog, markBacklogConsumed } from "../../../core/backlog";
import { emitOutput, emitError } from "../../../core/run-output";
import { executeHooks } from "../../../core/hook-engine";

function getFlag(args: string[], name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : undefined;
}

/** Extract positionals, skipping flag names and their values */
function getPositionals(args: string[], valueFlags: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const flagName = args[i].slice(2);
      if (valueFlags.includes(flagName) && i + 1 < args.length) i++; // skip value
      continue;
    }
    result.push(args[i]);
  }
  return result;
}

export async function execute(paths: ReapPaths, phase?: string, argv: string[] = []): Promise<void> {
  const positionals = getPositionals(argv, ["backlog"]);
  const goal = positionals.join(" ") || undefined;
  const backlogFile = getFlag(argv, "backlog");
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
        ? "Present the backlog items to the human. Ask: select one or enter a new goal. Then run: reap run start --phase create \"<goal>\" (add --backlog <filename> if selected from backlog)"
        : "Ask the human for the goal of this generation. Then run: reap run start --phase create \"<goal>\"",
      nextCommand: "reap run start --phase create",
    });
  }

  if (phase === "create") {
    // Phase 2: Create generation
    if (!goal) {
      emitError("start", "Goal is required. Usage: reap run start --phase create \"<goal>\"");
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

    // Generate entry token for objective stage (receiver-based)
    setNonce(state, "objective", "entry");
    await gm.save(state);

    // Mark backlog consumed (after ID generation)
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

    // Execute onLifeStarted hooks
    const hookResults = await executeHooks(paths.hooks, "onLifeStarted", paths.projectRoot);

    emitOutput({
      status: "prompt",
      command: "start",
      phase: "started",
      completed: ["gate", "backlog-scan", "create-generation", "backlog-consumed", "create-artifact", "hooks"],
      context: {
        generationId: state.id,
        goal: state.goal,
        genomeVersion: state.genomeVersion,
        parents: state.parents,
        genomeHash: state.genomeHash,
        hookResults,
      },
      prompt: `Generation ${state.id} created. Fill in the Goal section of 01-objective.md if needed. Then proceed with /reap.objective or /reap.evolve.`,
      message: `Generation ${state.id} started.`,
    });
  }
}
