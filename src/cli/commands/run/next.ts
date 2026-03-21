import { join } from "path";
import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { LifeCycle } from "../../../core/lifecycle";
import { MergeLifeCycle } from "../../../core/merge-lifecycle";
import { readTextFile, writeTextFile, fileExists } from "../../../core/fs";
import { emitOutput, emitError } from "../../../core/run-output";
import type { LifeCycleStage, MergeStage, AnyStage } from "../../../types";

const NORMAL_ARTIFACT: Partial<Record<LifeCycleStage, string>> = {
  planning: "02-planning.md",
  implementation: "03-implementation.md",
  validation: "04-validation.md",
  completion: "05-completion.md",
};

const MERGE_ARTIFACT: Partial<Record<MergeStage, string>> = {
  mate: "02-mate.md",
  merge: "03-merge.md",
  sync: "04-sync.md",
  validation: "05-validation.md",
  completion: "06-completion.md",
};

export async function execute(paths: ReapPaths, _phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();
  if (!state) {
    emitError("next", "No active Generation. Run /reap.start first.");
  }

  const isMerge = state.type === "merge";
  let nextStage: AnyStage | null;

  if (isMerge) {
    nextStage = MergeLifeCycle.next(state.stage as MergeStage);
  } else {
    nextStage = LifeCycle.next(state.stage as LifeCycleStage);
  }

  if (!nextStage) {
    emitError("next", `Cannot advance from '${state.stage}' — already at the last stage.`);
  }

  // Update state
  state.stage = nextStage;
  if (!state.timeline) state.timeline = [];
  state.timeline.push({ stage: nextStage, at: new Date().toISOString() });
  await gm.save(state);

  // Determine artifact file
  const artifactFile = isMerge
    ? MERGE_ARTIFACT[nextStage as MergeStage]
    : NORMAL_ARTIFACT[nextStage as LifeCycleStage];

  // Copy artifact template if it exists
  if (artifactFile) {
    const templateDir = join(require("os").homedir(), ".reap", "templates");
    const templatePath = join(templateDir, artifactFile);
    const destPath = paths.artifact(artifactFile);

    if (await fileExists(templatePath) && !(await fileExists(destPath))) {
      const templateContent = await readTextFile(templatePath);
      if (templateContent) {
        await writeTextFile(destPath, templateContent);
      }
    }
  }

  // Hook event
  const hookEvent = isMerge ? "onMergeTransited" : "onLifeTransited";

  emitOutput({
    status: "ok",
    command: "next",
    phase: "done",
    completed: ["gate", "advance-stage", "create-artifact"],
    context: {
      generationId: state.id,
      previousStage: state.timeline[state.timeline.length - 2]?.stage,
      stage: nextStage,
      type: state.type,
      artifactFile,
      hookEvent,
    },
    message: `Advanced to ${nextStage}. Proceed with /reap.${nextStage}.`,
  });
}
