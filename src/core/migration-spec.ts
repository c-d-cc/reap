import type { ReapPaths } from "./paths";
import { checkIntegrity } from "./integrity";

/**
 * Build a migration spec string describing the expected REAP structure.
 * This is a hardcoded spec (no dynamic parsing) used to inform AI agents
 * about the latest REAP directory layout, config fields, and conventions.
 */
export function buildMigrationSpec(paths: ReapPaths): string {
  const sections: string[] = [];

  // 1. Config fields
  sections.push(`## Config fields (config.yml)

| Field | Type | Required | Default |
|-------|------|----------|---------|
| version | string | yes | — |
| project | string | yes | — |
| entryMode | greenfield \\| migration \\| adoption | yes | — |
| stack | string | no | — |
| preset | string | no | — |
| agents | AgentName[] | no | auto-detect |
| language | string | no | — |
| autoUpdate | boolean | no | true |
| autoSubagent | boolean | no | true |
| autoIssueReport | boolean | no | false |
| strict | boolean \\| { edit?: boolean; merge?: boolean } | no | false |`);

  // 2. Directory structure
  sections.push(`## Expected directory structure

.reap/
├── config.yml
├── genome/
│   ├── principles.md
│   ├── conventions.md
│   ├── constraints.md
│   ├── source-map.md
│   └── domain/
├── environment/
│   ├── summary.md
│   ├── docs/
│   └── resources/
├── life/
│   ├── current.yml
│   ├── backlog/
│   ├── 01-objective.md
│   ├── 02-planning.md
│   ├── 03-implementation.md
│   ├── 04-validation.md
│   └── 05-completion.md
├── lineage/
│   └── gen-NNN-hash/ or gen-NNN-hash.md
└── hooks/
    ├── conditions/
    └── {event}.{name}.{sh|md}`);

  // 3. Slash commands
  sections.push(`## Slash commands (32)

reap.objective, reap.planning, reap.implementation,
reap.validation, reap.completion, reap.evolve,
reap.evolve.recovery, reap.start, reap.next, reap.back, reap.abort,
reap.status, reap.sync, reap.sync.genome, reap.sync.environment,
reap.help, reap.update, reap.update-genome, reap.report,
reap.refreshKnowledge,
reap.merge.start, reap.merge.detect, reap.merge.mate,
reap.merge.merge, reap.merge.sync, reap.merge.validation,
reap.merge.completion, reap.merge.evolve,
reap.merge,
reap.pull, reap.push,
reap.config`);

  // 4. Hooks format
  sections.push(`## Hooks format

File naming: {event}.{name}.{md|sh}
Location: .reap/hooks/

Frontmatter (md hooks):
---
event: onLifeStarted
name: my-hook
description: What this hook does
---

Condition files: .reap/hooks/conditions/{name}.yml`);

  // 5. Project root
  sections.push(`## Project root: ${paths.projectRoot}`);

  return sections.join("\n\n");
}

/**
 * Detect gaps between the current .reap/ structure and expected structure.
 * Returns a list of human-readable gap descriptions.
 */
export async function detectMigrationGaps(paths: ReapPaths): Promise<string[]> {
  const result = await checkIntegrity(paths);
  // Integrity errors represent structural gaps that need migration attention.
  // Warnings are informational and not considered migration-blocking gaps.
  return result.errors;
}
