import { ReapPaths } from "../../core/paths";
import { GenerationManager } from "../../core/generation";
import { ConfigManager } from "../../core/config";

export interface ProjectStatus {
  version: string;
  project: string;
  entryMode: string;
  lastSyncedGeneration?: string;
  generation: {
    id: string;
    goal: string;
    stage: string;
    genomeVersion: number;
    startedAt: string;
    type?: string;
    parents?: string[];
    genomeHash?: string;
  } | null;
  totalGenerations: number;
}

export async function getStatus(projectRoot: string): Promise<ProjectStatus> {
  const paths = new ReapPaths(projectRoot);
  const config = await ConfigManager.read(paths);
  const mgr = new GenerationManager(paths);

  const current = await mgr.current();
  const completedGens = await mgr.listCompleted();

  return {
    version: config.version,
    project: config.project,
    entryMode: config.entryMode,
    lastSyncedGeneration: config.lastSyncedGeneration,
    generation: current ? {
      id: current.id,
      goal: current.goal,
      stage: current.stage,
      genomeVersion: current.genomeVersion,
      startedAt: current.startedAt,
      type: current.type,
      parents: current.parents,
      genomeHash: current.genomeHash,
    } : null,
    totalGenerations: completedGens.length,
  };
}
