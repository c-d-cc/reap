import { join } from "path";
import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { readTextFile, fileExists } from "../../../core/fs";
import { scanBacklog, markBacklogConsumed } from "../../../core/backlog";
import { emitOutput, emitError } from "../../../core/run-output";
import { executeHooks } from "../../../core/hook-engine";
import { checkSubmodules } from "../../../core/commit";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) {
    emitError("completion", "No active Generation.");
  }
  if (state.stage !== "completion") {
    emitError("completion", `Stage is '${state.stage}', expected 'completion'.`);
  }

  const validationArtifact = paths.artifact("04-validation.md");
  if (!(await fileExists(validationArtifact))) {
    emitError("completion", "04-validation.md does not exist. Complete validation first.");
  }

  if (!phase || phase === "retrospective") {
    // Phase 1: Gate passed, collect context for AI creative work
    const backlogItems = await scanBacklog(paths.backlog);
    const validationContent = await readTextFile(validationArtifact);
    const implContent = await readTextFile(paths.artifact("03-implementation.md"));

    // Create 05-completion.md from template if not exists
    const destPath = paths.artifact("05-completion.md");
    if (!(await fileExists(destPath))) {
      const templateDir = join(require("os").homedir(), ".reap", "templates");
      const templatePath = join(templateDir, "05-completion.md");
      if (await fileExists(templatePath)) {
        const { writeTextFile } = await import("../../../core/fs");
        const template = await readTextFile(templatePath);
        if (template) await writeTextFile(destPath, template);
      }
    }

    emitOutput({
      status: "prompt",
      command: "completion",
      phase: "retrospective",
      completed: ["gate", "artifact-create", "context-scan"],
      context: {
        id: state.id,
        goal: state.goal,
        genomeVersion: state.genomeVersion,
        startedAt: state.startedAt,
        backlogItems: backlogItems.filter(b => b.status !== "consumed"),
        validationSummary: validationContent?.slice(0, 2000),
        implSummary: implContent?.slice(0, 2000),
      },
      prompt: "Fill 05-completion.md: Summary (goal, period, result, key changes), Lessons Learned (max 5), Genome Change Proposals, Garbage Collection (check conventions violations), Backlog Cleanup (add deferred tasks). Then run: reap run completion --phase genome",
      nextCommand: "reap run completion --phase genome",
    });
  }

  if (phase === "genome") {
    // Phase 2: AI has written retrospective. Now handle genome changes + auto consume/archive.
    const backlogItems = await scanBacklog(paths.backlog);
    const genomeChanges = backlogItems.filter(b => b.type === "genome-change" && b.status !== "consumed");
    const envChanges = backlogItems.filter(b => b.type === "environment-change" && b.status !== "consumed");

    // --- Consume: mark genome/env changes as consumed ---
    const toConsume = backlogItems.filter(
      b => (b.type === "genome-change" || b.type === "environment-change") && b.status !== "consumed"
    );
    for (const item of toConsume) {
      await markBacklogConsumed(paths.backlog, item.filename, state.id);
    }

    // --- Archive: execute hooks, check submodules, complete generation ---
    const hookResults = await executeHooks(paths.hooks, "onLifeCompleted", paths.projectRoot);
    const submodules = checkSubmodules(paths.projectRoot);
    const dirtySubmodules = submodules.filter(s => s.dirty);
    const compression = await gm.complete();

    const hasChanges = genomeChanges.length > 0 || envChanges.length > 0;
    const completedSteps = [
      "gate", "artifact-create", "context-scan", "retrospective",
      ...(hasChanges ? ["genome-apply"] : ["genome-skip"]),
      "backlog-consume", "hooks", "archive", "compress",
    ];

    emitOutput({
      status: "prompt",
      command: "completion",
      phase: "commit",
      completed: completedSteps,
      context: {
        id: state.id,
        goal: state.goal,
        genomeChanges: hasChanges ? genomeChanges.map(g => ({ filename: g.filename, title: g.title, body: g.body, target: g.target })) : [],
        envChanges: hasChanges ? envChanges.map(e => ({ filename: e.filename, title: e.title, body: e.body, target: e.target })) : [],
        consumedCount: toConsume.length,
        compression: { level1: compression.level1.length, level2: compression.level2.length },
        hookResults,
        dirtySubmodules,
      },
      prompt: dirtySubmodules.length > 0
        ? `Dirty submodules detected: ${dirtySubmodules.map(s => s.path).join(", ")}. Commit and push inside each submodule first, then commit the parent repo. Commit message: feat/fix/chore(${state.id}): [goal summary]. Generation complete.`
        : `Commit all changes (code + .reap/ artifacts). Commit message: feat/fix/chore(${state.id}): [goal summary]. Generation complete.`,
      message: `Generation ${state.id} archived. ${hasChanges ? "Genome/env changes applied." : "No genome/environment changes."} ${toConsume.length} backlog item(s) consumed.`,
    });
  }

  if (phase === "consume") {
    // Phase 3: Mark applied genome/env changes as consumed
    const backlogItems = await scanBacklog(paths.backlog);
    const toConsume = backlogItems.filter(
      b => (b.type === "genome-change" || b.type === "environment-change") && b.status !== "consumed"
    );

    for (const item of toConsume) {
      await markBacklogConsumed(paths.backlog, item.filename, state.id);
    }

    emitOutput({
      status: "prompt",
      command: "completion",
      phase: "hook-suggest",
      completed: ["gate", "artifact-create", "context-scan", "retrospective", "genome-apply", "backlog-consume"],
      context: { id: state.id, consumedCount: toConsume.length },
      prompt: "Check the last 3 generations in .reap/lineage/ for repeated manual patterns. If found, suggest hooks (max 2). Then run: reap run completion --phase archive",
      nextCommand: "reap run completion --phase archive",
    });
  }

  if (phase === "archive") {
    // Phase 4: Execute onLifeCompleted hooks, then archive
    const hookResults = await executeHooks(paths.hooks, "onLifeCompleted", paths.projectRoot);

    // Check submodules
    const submodules = checkSubmodules(paths.projectRoot);
    const dirtySubmodules = submodules.filter(s => s.dirty);

    // Archive + compress
    const compression = await gm.complete();

    emitOutput({
      status: "prompt",
      command: "completion",
      phase: "commit",
      completed: ["gate", "artifact-create", "context-scan", "retrospective", "genome", "hook-suggest", "hooks", "archive", "compress"],
      context: {
        id: state.id,
        goal: state.goal,
        compression: { level1: compression.level1.length, level2: compression.level2.length },
        hookResults,
        dirtySubmodules,
      },
      prompt: dirtySubmodules.length > 0
        ? `Dirty submodules detected: ${dirtySubmodules.map(s => s.path).join(", ")}. Commit and push inside each submodule first, then commit the parent repo. Commit message: feat/fix/chore(${state.id}): [goal summary]. Generation complete.`
        : `Commit all changes (code + .reap/ artifacts). Commit message: feat/fix/chore(${state.id}): [goal summary]. Generation complete.`,
      message: `Generation ${state.id} archived.`,
    });
  }
}
