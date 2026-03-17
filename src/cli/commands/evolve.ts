import { ReapPaths } from "../../core/paths";
import { GenerationManager } from "../../core/generation";
import { LifeCycle } from "../../core/lifecycle";
import type { GenerationState, LifeCycleStage, TimelineEntry } from "../../types";

export async function evolve(projectRoot: string, goal: string): Promise<GenerationState> {
  const paths = new ReapPaths(projectRoot);
  const mgr = new GenerationManager(paths);

  const current = await mgr.current();
  if (current) {
    throw new Error(`Generation ${current.id} is already active (stage: ${current.stage}). Complete it before starting a new one.`);
  }

  const genCount = (await mgr.listCompleted()).length;
  const state = await mgr.create(goal, genCount + 1);
  return state;
}

export async function advanceStage(projectRoot: string): Promise<GenerationState> {
  const paths = new ReapPaths(projectRoot);
  const mgr = new GenerationManager(paths);
  const current = await mgr.current();
  if (!current) throw new Error("No active Generation");

  // Completion stage에서 advance → 아카이빙 + 세대 종료
  if (LifeCycle.isComplete(current.stage)) {
    current.completedAt = new Date().toISOString();
    await mgr.save(current);
    await mgr.complete();
    return current;
  }

  const state = await mgr.advance();
  return state;
}

export interface RegressionInfo {
  reason: string;
  refs?: string[];
}

export async function regressStage(
  projectRoot: string,
  targetStage?: string,
  regression?: RegressionInfo,
): Promise<GenerationState> {
  const paths = new ReapPaths(projectRoot);
  const mgr = new GenerationManager(paths);
  const current = await mgr.current();
  if (!current) throw new Error("No active Generation");

  const fromStage = current.stage;
  let toStage: LifeCycleStage;

  if (targetStage) {
    if (!LifeCycle.isValid(targetStage)) {
      throw new Error(`Unknown stage: "${targetStage}". Valid stages: ${LifeCycle.stages().join(", ")}`);
    }
    if (!LifeCycle.canTransition(current.stage, targetStage as LifeCycleStage)) {
      throw new Error(`Cannot go back from ${current.stage} to ${targetStage}. Only backward transitions are allowed.`);
    }
    toStage = targetStage as LifeCycleStage;
  } else {
    const prev = LifeCycle.prev(current.stage);
    if (!prev) {
      throw new Error(`Cannot go back from ${current.stage}. Already at the first stage.`);
    }
    toStage = prev;
  }

  current.stage = toStage;

  // Record regression in timeline with details
  if (!current.timeline) current.timeline = [];
  const entry: TimelineEntry = {
    stage: toStage,
    at: new Date().toISOString(),
    from: fromStage,
  };
  if (regression?.reason) entry.reason = regression.reason;
  if (regression?.refs?.length) entry.refs = regression.refs;
  current.timeline.push(entry);

  await mgr.save(current);
  return current;
}
