import { join } from "path";

export interface ReapPaths {
  root: string;
  reap: string;
  config: string;
  genome: string;
  application: string;
  evolution: string;
  invariants: string;
  environment: string;
  environmentSummary: string;
  environmentDomain: string;
  sourceMap: string;
  life: string;
  current: string;
  backlog: string;
  lineage: string;
  vision: string;
  visionGoals: string;
  visionDocs: string;
  memory: string;
  memoryLongterm: string;
  memoryMidterm: string;
  memoryShortterm: string;
  hooks: string;
  artifact: (name: string) => string;
}

export function createPaths(root: string): ReapPaths {
  const reap = join(root, ".reap");
  const genome = join(reap, "genome");
  const environment = join(reap, "environment");
  const life = join(reap, "life");
  const vision = join(reap, "vision");
  const memory = join(vision, "memory");

  return {
    root,
    reap,
    config: join(reap, "config.yml"),
    genome,
    application: join(genome, "application.md"),
    evolution: join(genome, "evolution.md"),
    invariants: join(genome, "invariants.md"),
    environment,
    environmentSummary: join(environment, "summary.md"),
    environmentDomain: join(environment, "domain"),
    sourceMap: join(environment, "source-map.md"),
    life,
    current: join(life, "current.yml"),
    backlog: join(life, "backlog"),
    lineage: join(reap, "lineage"),
    vision,
    visionGoals: join(vision, "goals.md"),
    visionDocs: join(vision, "docs"),
    memory,
    memoryLongterm: join(memory, "longterm.md"),
    memoryMidterm: join(memory, "midterm.md"),
    memoryShortterm: join(memory, "shortterm.md"),
    hooks: join(reap, "hooks"),
    artifact: (name: string) => join(life, name),
  };
}
