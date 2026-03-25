import YAML from "yaml";
import type { ReapPaths } from "../../../core/paths.js";
import { writeTextFile, ensureDir } from "../../../core/fs.js";
import type { ReapConfig } from "../../../types/index.js";

const DEFAULT_EVOLUTION = `# Evolution

## AI Behavior Guide
<!-- How should AI behave during lifecycle stages -->

## Evolution Direction
<!-- Current direction for project evolution -->
`;

const DEFAULT_INVARIANTS = `# Invariants

> Absolute constraints. Human-only modification.

- Do not skip lifecycle stages
- Do not forge nonce tokens
- Do not modify invariants.md without human approval
`;

const DEFAULT_GOALS = `# Vision Goals

## Ultimate Goal
<!-- What is the end state of this project? -->

## Goal Items
<!-- Checklist of major milestones -->
`;

/**
 * Create .reap/ directory structure and write common files.
 * Returns the config object.
 */
export async function initCommon(
  paths: ReapPaths,
  projectName: string,
): Promise<ReapConfig> {
  // Create directories
  await ensureDir(paths.genome);
  await ensureDir(paths.environment);
  await ensureDir(paths.environmentDomain);
  await ensureDir(paths.life);
  await ensureDir(paths.backlog);
  await ensureDir(paths.lineage);
  await ensureDir(paths.vision);
  await ensureDir(paths.visionDocs);
  await ensureDir(paths.hooks);

  // Write config
  const config: ReapConfig = {
    project: projectName,
    language: "english",
    autoSubagent: true,
    strict: false,
    agentClient: "claude-code",
    autoUpdate: true,
  };
  await writeTextFile(paths.config, YAML.stringify(config));

  // Write common genome files (evolution, invariants — same for both modes)
  await writeTextFile(paths.evolution, DEFAULT_EVOLUTION);
  await writeTextFile(paths.invariants, DEFAULT_INVARIANTS);

  // Write vision
  await writeTextFile(paths.visionGoals, DEFAULT_GOALS);

  return config;
}
