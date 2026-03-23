import { ReapPaths } from "../../core/paths";
import { GenerationManager } from "../../core/generation";
import { ConfigManager } from "../../core/config";
import { checkIntegrity } from "../../core/integrity";

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
  integrity: { errors: number; warnings: number };
}

export async function getStatus(projectRoot: string): Promise<ProjectStatus> {
  const paths = new ReapPaths(projectRoot);
  const config = await ConfigManager.read(paths);
  const mgr = new GenerationManager(paths);

  const current = await mgr.current();
  const totalCompleted = await mgr.countAllCompleted();
  const integrityResult = await checkIntegrity(paths);

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
    totalGenerations: totalCompleted,
    integrity: { errors: integrityResult.errors.length, warnings: integrityResult.warnings.length },
  };
}
