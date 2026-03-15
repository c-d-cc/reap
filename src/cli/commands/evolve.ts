import { ReapPaths } from "../../core/paths";
import { GenerationManager } from "../../core/generation";
import { LifeCycle } from "../../core/lifecycle";
import type { GenerationState } from "../../types";

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
  return mgr.advance();
}

export async function regressStage(projectRoot: string): Promise<GenerationState> {
  const paths = new ReapPaths(projectRoot);
  const mgr = new GenerationManager(paths);
  const current = await mgr.current();
  if (!current) throw new Error("No active Generation");

  if (current.stage !== "validation") {
    throw new Error(`Cannot go back from ${current.stage}. Only Validation → Growth is supported.`);
  }
  current.stage = "growth";
  await mgr.save(current);
  return current;
}
