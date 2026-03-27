import { readdir, cp, rename, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { homedir } from "os";
import YAML from "yaml";
import type { ReapPaths } from "../../core/paths.js";
import { readTextFile, writeTextFile, fileExists, ensureDir } from "../../core/fs.js";
import { emitOutput, emitError } from "../../core/output.js";
import { isGitRepo } from "../../core/git.js";
import { detectV15, cleanupLegacyProjectSkills, cleanupLegacyHooks } from "../../core/integrity.js";
import { ensureClaudeMd } from "./init/common.js";

// ── Helpers ──────────────────────────────────────────────────

/** Resolve path relative to dist/ templates (same as init/common.ts) */
function distPath(...segments: string[]): string {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  return join(__dirname, "..", "templates", ...segments);
}

/** Check if git working tree is clean */
function isGitClean(cwd: string): boolean {
  if (!isGitRepo(cwd)) return true; // no git = skip check
  try {
    const status = execSync("git status --porcelain", {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    return status === "";
  } catch {
    return true; // can't determine = skip
  }
}

// ── v0.15 Config type ────────────────────────────────────────

interface V15Config {
  project?: string;
  entryMode?: string;
  strict?: boolean;
  language?: string;
  autoUpdate?: boolean;
  autoSubagent?: boolean;
  autoIssueReport?: boolean;
  lastSyncedGeneration?: string;
  genomeVersion?: number;
  preset?: string;
}

// ── Hook event mapping ───────────────────────────────────────

const HOOK_EVENT_MAP: Record<string, string> = {
  onMergeSynced: "onMergeReconciled",
};

// Events that map 1:1 (no rename needed)
const PASSTHROUGH_EVENTS = [
  "onLifePlanned", "onLifeImplemented", "onLifeValidated",
  "onLifeCompleted", "onLifeTransited", "onLifeRegretted",
  "onMergeStarted", "onMergeDetected", "onMergeMated",
  "onMergeMerged", "onMergeValidated", "onMergeCompleted", "onMergeTransited",
];

/**
 * Map a v0.15 hook filename to v0.16.
 * Returns { newName, needsAiAnalysis } or null if no mapping possible.
 */
function mapHookFilename(filename: string): { newName: string; needsAiAnalysis: boolean } | null {
  // Extract event name: onLifeObjected.custom.sh → onLifeObjected
  const dotIdx = filename.indexOf(".");
  if (dotIdx === -1) return null;
  const eventName = filename.substring(0, dotIdx);
  const rest = filename.substring(dotIdx); // .custom.sh

  // Direct rename
  if (HOOK_EVENT_MAP[eventName]) {
    return { newName: HOOK_EVENT_MAP[eventName] + rest, needsAiAnalysis: false };
  }

  // Passthrough
  if (PASSTHROUGH_EVENTS.includes(eventName)) {
    return { newName: filename, needsAiAnalysis: false };
  }

  // onLifeObjected → needs AI analysis to determine onLifeLearned or onLifePlanned
  if (eventName === "onLifeObjected") {
    // Default to onLifeLearned (closest to v0.15 objective)
    return { newName: "onLifeLearned" + rest, needsAiAnalysis: true };
  }

  // Unknown event → keep as-is
  return { newName: filename, needsAiAnalysis: false };
}

// ── Phase 1: Pre-check ───────────────────────────────────────

async function scanV15Structure(paths: ReapPaths): Promise<Record<string, unknown>> {
  const genomeFiles: string[] = [];
  const genomeDir = join(paths.reap, "v15", "genome");
  // At this point v15 backup doesn't exist yet — scan current .reap/
  const currentGenomeDir = paths.genome;

  try {
    const entries = await readdir(currentGenomeDir);
    for (const e of entries) {
      if (e.endsWith(".md")) genomeFiles.push(e);
    }
  } catch { /* empty */ }

  // Domain files
  const domainFiles: string[] = [];
  const domainDir = join(currentGenomeDir, "domain");
  try {
    const entries = await readdir(domainDir);
    for (const e of entries) {
      if (e.endsWith(".md")) domainFiles.push(e);
    }
  } catch { /* empty */ }

  // Lineage count
  let lineageCount = 0;
  try {
    const entries = await readdir(paths.lineage);
    lineageCount = entries.filter(e => e.startsWith("gen-")).length;
  } catch { /* empty */ }

  // Backlog count
  let backlogCount = 0;
  try {
    const entries = await readdir(paths.backlog);
    backlogCount = entries.filter(e => e.endsWith(".md")).length;
  } catch { /* empty */ }

  // Hooks
  const hooks: string[] = [];
  const hooksMappingNeeded: string[] = [];
  try {
    const entries = await readdir(paths.hooks);
    for (const e of entries) {
      if (e.startsWith("on") && (e.endsWith(".sh") || e.endsWith(".md"))) {
        hooks.push(e);
        if (e.startsWith("onLifeObjected")) {
          hooksMappingNeeded.push(e);
        }
      }
    }
  } catch { /* empty */ }

  return {
    genomeFiles,
    domainFiles,
    lineageCount,
    backlogCount,
    hooks,
    hooksMappingNeeded,
  };
}

export async function executePreCheck(paths: ReapPaths): Promise<void> {
  // 1.1 Git clean check
  if (!isGitClean(paths.root)) {
    emitError("migrate",
      "Uncommitted changes detected. Please commit or stash your changes before migration."
    );
  }

  // 1.2 v0.15 detection
  if (!(await detectV15(paths))) {
    // Check if already v0.16
    if (await fileExists(paths.application)) {
      emitError("migrate", "This project already uses v0.16 structure.");
    }
    emitError("migrate", "No REAP project detected (neither v0.15 nor v0.16).");
  }

  // 1.3 Active generation check
  const currentContent = await readTextFile(paths.current);
  if (currentContent && currentContent.trim()) {
    emitError("migrate",
      "Active generation exists. Run '/reap.abort' first, then retry migration."
    );
  }

  // 1.3b Check if v15 backup already exists
  if (await fileExists(join(paths.reap, "v15"))) {
    emitError("migrate",
      "Previous migration backup (.reap/v15/) already exists. Remove it first if you want to re-migrate."
    );
  }

  // 1.4 Read config
  const configContent = await readTextFile(paths.config);
  let config: V15Config = {};
  if (configContent) {
    try {
      config = YAML.parse(configContent) ?? {};
    } catch {
      emitError("migrate", "config.yml is not valid YAML.");
    }
  }

  // 1.5 Scan structure
  const scan = await scanV15Structure(paths);

  emitOutput({
    status: "prompt",
    command: "migrate",
    phase: "confirm",
    context: {
      version: "0.15",
      project: config.project ?? "unknown",
      ...scan,
      configFields: Object.keys(config),
    },
    prompt: buildConfirmPrompt(config, scan),
  });
}

function buildConfirmPrompt(config: V15Config, scan: Record<string, unknown>): string {
  const hooks = scan.hooks as string[];
  const hooksMappingNeeded = scan.hooksMappingNeeded as string[];

  return `## REAP v0.15 → v0.16 Migration

### Changes:
1. **Genome restructure**
   - principles.md + conventions.md + constraints.md → application.md (AI reconstructs)
   - evolution.md created (AI behavior guide, from template)
   - invariants.md created (absolute constraints, extracted from constraints.md)
   - source-map.md → environment/source-map.md

2. **Config migration**
   - Remove: entryMode, autoIssueReport, genomeVersion, lastSyncedGeneration, preset
   - Add: agentClient (default: claude-code)
   - Keep: project, language, strict, autoUpdate, autoSubagent

3. **Vision (new)**
   - goals.md — long-term project goals (set up after migration)
   - memory/ — AI memory space (longterm/midterm/shortterm)

4. **Hooks event rename**
   ${hooks.length > 0 ? hooks.map(h => `- ${h}${hooksMappingNeeded.includes(h) ? " → (AI will determine: onLifeLearned or onLifePlanned)" : ""}`).join("\n   ") : "- No hooks found"}
   ${scan.backlogCount ? `\n5. **Backlog**: ${scan.backlogCount} items copied as-is` : ""}
   ${scan.lineageCount ? `\n6. **Lineage**: ${scan.lineageCount} entries copied as-is` : ""}

### Backup
All current .reap/ contents will be preserved at .reap/v15/

### Unchanged
- lineage (copied as-is, read-compatible)
- backlog (same path: .reap/life/backlog/)
- environment/summary.md (copied)
- environment/domain/ (copied)

Confirm to proceed. Then run: \`reap init --migrate --phase execute\``;
}

// ── Phase 3: Execute ─────────────────────────────────────────

export async function executeMain(paths: ReapPaths): Promise<void> {
  // Re-verify v0.15
  if (!(await detectV15(paths))) {
    emitError("migrate", "v0.15 structure not found. Cannot proceed.");
  }

  const v15Dir = join(paths.reap, "v15");

  // 3.1 Backup — move key directories to .reap/v15/
  await ensureDir(v15Dir);

  // Items to back up (only if they exist)
  const backupItems = [
    { src: paths.genome, dest: join(v15Dir, "genome") },
    { src: paths.environment, dest: join(v15Dir, "environment") },
    { src: paths.life, dest: join(v15Dir, "life") },
    { src: paths.lineage, dest: join(v15Dir, "lineage") },
    { src: paths.hooks, dest: join(v15Dir, "hooks") },
    { src: paths.config, dest: join(v15Dir, "config.yml") },
  ];

  for (const item of backupItems) {
    if (await fileExists(item.src)) {
      await rename(item.src, item.dest);
    }
  }

  // 3.2 Create new directory structure
  await ensureDir(paths.genome);
  await ensureDir(join(paths.environment, "domain"));
  await ensureDir(paths.life);
  await ensureDir(paths.backlog);
  await ensureDir(paths.lineage);
  await ensureDir(paths.vision);
  await ensureDir(join(paths.vision, "docs"));
  await ensureDir(join(paths.vision, "memory"));
  await ensureDir(paths.hooks);

  // 3.3 Config migration
  const v15ConfigContent = await readTextFile(join(v15Dir, "config.yml"));
  let v15Config: V15Config = {};
  if (v15ConfigContent) {
    v15Config = YAML.parse(v15ConfigContent) ?? {};
  }

  const v16Config = {
    project: v15Config.project ?? "my-project",
    language: v15Config.language ?? "english",
    autoSubagent: v15Config.autoSubagent ?? true,
    strict: v15Config.strict ?? false,
    agentClient: "claude-code" as const,
    autoUpdate: v15Config.autoUpdate ?? true,
  };
  await writeTextFile(paths.config, YAML.stringify(v16Config));

  // 3.4 Genome — read originals for AI prompt
  const principles = await readTextFile(join(v15Dir, "genome", "principles.md")) ?? "";
  const conventions = await readTextFile(join(v15Dir, "genome", "conventions.md")) ?? "";
  const constraints = await readTextFile(join(v15Dir, "genome", "constraints.md")) ?? "";
  const sourceMap = await readTextFile(join(v15Dir, "genome", "source-map.md")) ?? "";

  // Read evolution template
  const evolutionTemplate = await readTextFile(distPath("evolution.md")) ?? "";

  // Read domain file list
  const domainFiles: string[] = [];
  const v15DomainDir = join(v15Dir, "genome", "domain");
  try {
    const entries = await readdir(v15DomainDir);
    domainFiles.push(...entries.filter(e => e.endsWith(".md")));
  } catch { /* empty */ }

  // 3.5 Environment copy
  const v15EnvSummary = join(v15Dir, "environment", "summary.md");
  if (await fileExists(v15EnvSummary)) {
    await cp(v15EnvSummary, paths.environmentSummary);
  }

  const v15EnvDomain = join(v15Dir, "environment", "domain");
  if (await fileExists(v15EnvDomain)) {
    try {
      const entries = await readdir(v15EnvDomain);
      for (const e of entries) {
        await cp(join(v15EnvDomain, e), join(paths.environmentDomain, e), { recursive: true });
      }
    } catch { /* empty */ }
  }

  // Move source-map.md to environment/
  if (sourceMap) {
    await writeTextFile(paths.sourceMap, sourceMap);
  }

  // Copy domain files from genome/domain/ to environment/domain/
  if (domainFiles.length > 0) {
    for (const f of domainFiles) {
      const src = join(v15DomainDir, f);
      const dest = join(paths.environmentDomain, f);
      if (await fileExists(src)) {
        await cp(src, dest);
      }
    }
  }

  // 3.6 Lineage copy
  const v15Lineage = join(v15Dir, "lineage");
  if (await fileExists(v15Lineage)) {
    try {
      const entries = await readdir(v15Lineage);
      for (const e of entries) {
        await cp(join(v15Lineage, e), join(paths.lineage, e), { recursive: true });
      }
    } catch { /* empty */ }
  }

  // 3.7 Backlog copy
  const v15Backlog = join(v15Dir, "life", "backlog");
  if (await fileExists(v15Backlog)) {
    try {
      const entries = await readdir(v15Backlog);
      for (const e of entries) {
        await cp(join(v15Backlog, e), join(paths.backlog, e), { recursive: true });
      }
    } catch { /* empty */ }
  }

  // 3.8 Hooks copy + event name mapping
  const hooksMapped: string[] = [];
  const hooksUnmapped: string[] = [];
  const v15Hooks = join(v15Dir, "hooks");
  if (await fileExists(v15Hooks)) {
    try {
      const entries = await readdir(v15Hooks);
      for (const e of entries) {
        // Skip conditions directory (will be handled separately)
        if (e === "conditions") {
          const condSrc = join(v15Hooks, "conditions");
          const condDest = join(paths.hooks, "conditions");
          await cp(condSrc, condDest, { recursive: true });
          continue;
        }

        const mapping = mapHookFilename(e);
        if (mapping) {
          await cp(join(v15Hooks, e), join(paths.hooks, mapping.newName));
          if (mapping.newName !== e) {
            hooksMapped.push(`${e} → ${mapping.newName}`);
          }
          if (mapping.needsAiAnalysis) {
            hooksUnmapped.push(e);
          }
        } else {
          // Copy as-is
          await cp(join(v15Hooks, e), join(paths.hooks, e));
        }
      }
    } catch { /* empty */ }
  }

  // 3.9 Legacy project-level skills cleanup
  const legacyCleaned = await cleanupLegacyProjectSkills(paths.root);

  // 3.9.1 Legacy SessionStart hooks cleanup (from v0.15)
  await cleanupLegacyHooks(paths.root);

  // 3.10 Vision + Memory creation
  const goalsContent = `# Vision Goals

## Ultimate Goal
<!-- What is the end state of this project? -->

## Goal Items
<!-- Checklist of major milestones -->
`;
  await writeTextFile(join(paths.vision, "goals.md"), goalsContent);
  await writeTextFile(join(paths.vision, "memory", "longterm.md"), "# Longterm Memory\n");
  await writeTextFile(join(paths.vision, "memory", "midterm.md"), "# Midterm Memory\n");
  await writeTextFile(join(paths.vision, "memory", "shortterm.md"), "# Shortterm Memory\n");

  // 3.10 reap-guide.md (install to ~/.reap/, not per-project)
  const guide = await readTextFile(distPath("reap-guide.md"));
  if (guide) {
    const reapHome = join(homedir(), ".reap");
    await ensureDir(reapHome);
    await writeTextFile(join(reapHome, "reap-guide.md"), guide);
  }

  // 3.11 CLAUDE.md
  await ensureClaudeMd(paths.root, v16Config.project);

  // Build genome conversion prompt for AI
  emitOutput({
    status: "prompt",
    command: "migrate",
    phase: "genome-convert",
    completed: [
      "backup",
      "create-dirs",
      "config-migrate",
      "environment-copy",
      "lineage-copy",
      "backlog-copy",
      "hooks-map",
      "legacy-cleanup",
      "vision-create",
      "claude-md",
    ],
    context: {
      principles,
      conventions,
      constraints,
      sourceMap: sourceMap ? "(moved to environment/source-map.md)" : "(not found)",
      domainFiles,
      evolutionTemplate,
      hooksMapped,
      hooksUnmapped,
      legacyCleaned,
      targetPaths: {
        application: paths.application,
        evolution: paths.evolution,
        invariants: paths.invariants,
      },
    },
    prompt: buildGenomeConvertPrompt(principles, conventions, constraints, evolutionTemplate, hooksUnmapped),
  });
}

function buildGenomeConvertPrompt(
  principles: string,
  conventions: string,
  constraints: string,
  evolutionTemplate: string,
  hooksUnmapped: string[],
): string {
  let prompt = `## Genome Reconstruction (v0.15 → v0.16)

Below are the original v0.15 genome files. Reconstruct them into the v0.16 structure:

### Target Files

1. **\`.reap/genome/application.md\`** — Combine principles + conventions + constraints into:
   - \`## Identity\` — Project description (from principles)
   - \`## Architecture\` — Architecture decisions (from principles)
   - \`## Conventions\` — Coding rules (from conventions)
   - Constraints that are project-specific (not absolute) go into Architecture or Conventions.

2. **\`.reap/genome/evolution.md\`** — Use the template below. Adjust wording to match the project's language/context if needed:

3. **\`.reap/genome/invariants.md\`** — Extract "absolute constraints" from constraints.md + add the 3 default invariants:
   - Do not skip lifecycle stages
   - Do not forge nonce tokens
   - Do not modify invariants.md without human approval

### v0.15 Originals

#### principles.md
\`\`\`
${principles}
\`\`\`

#### conventions.md
\`\`\`
${conventions}
\`\`\`

#### constraints.md
\`\`\`
${constraints}
\`\`\`

#### evolution.md Template
\`\`\`
${evolutionTemplate}
\`\`\`

### Instructions
1. Write application.md to \`.reap/genome/application.md\`
2. Write evolution.md to \`.reap/genome/evolution.md\` (use the template, adapt if needed)
3. Write invariants.md to \`.reap/genome/invariants.md\`
`;

  if (hooksUnmapped.length > 0) {
    prompt += `
### Hook Analysis Needed
The following hooks were renamed from \`onLifeObjected\` to \`onLifeLearned\` (default).
Read each hook file in \`.reap/hooks/\` and verify:
- If it does lint/typecheck/test → rename to \`onLifePlanned\`
- If it does context loading/exploration → keep as \`onLifeLearned\`

Files to check: ${hooksUnmapped.map(h => `\`.reap/hooks/${h.replace("onLifeObjected", "onLifeLearned")}\``).join(", ")}
`;
  }

  prompt += `
After writing all genome files, run: \`reap init --migrate --phase vision\``;

  return prompt;
}

// ── Phase 4: Vision ──────────────────────────────────────────

export async function executeVision(paths: ReapPaths): Promise<void> {
  emitOutput({
    status: "prompt",
    command: "migrate",
    phase: "vision",
    completed: [
      "backup",
      "create-dirs",
      "config-migrate",
      "environment-copy",
      "lineage-copy",
      "backlog-copy",
      "hooks-map",
      "vision-create",
      "claude-md",
      "genome-convert",
    ],
    prompt: buildVisionPrompt(paths),
  });
}

function buildVisionPrompt(paths: ReapPaths): string {
  return `## Vision Setup

Migration is almost complete. Now set up project goals.

### Steps
1. Read the newly created genome (\`.reap/genome/application.md\`)
2. Check existing backlog items in \`.reap/life/backlog/\`
3. Review recent lineage entries in \`.reap/lineage/\`
4. Read \`.reap/environment/summary.md\`

### Goal Candidates
Based on your analysis, suggest 3-5 goals for \`vision/goals.md\`:
- Backlog-derived tasks
- Patterns from lineage (incomplete work, recurring themes)
- Genome-identified improvement areas

### Instructions
1. Present the suggested goals to the user
2. After user confirmation, write \`.reap/vision/goals.md\` with a checklist format
3. Then run: \`reap init --migrate --phase complete\``;
}

// ── Phase 5: Complete ────────────────────────────────────────

export async function executeComplete(paths: ReapPaths): Promise<void> {
  // Count what was migrated
  let lineageCount = 0;
  try {
    const entries = await readdir(paths.lineage);
    lineageCount = entries.filter(e => e.startsWith("gen-")).length;
  } catch { /* empty */ }

  let backlogCount = 0;
  try {
    const entries = await readdir(paths.backlog);
    backlogCount = entries.filter(e => e.endsWith(".md")).length;
  } catch { /* empty */ }

  let hookCount = 0;
  try {
    const entries = await readdir(paths.hooks);
    hookCount = entries.filter(e => e.startsWith("on")).length;
  } catch { /* empty */ }

  emitOutput({
    status: "ok",
    command: "migrate",
    phase: "complete",
    completed: [
      "backup", "create-dirs", "config-migrate", "genome-convert",
      "environment-copy", "lineage-copy", "backlog-copy", "hooks-map",
      "legacy-cleanup", "vision-create", "claude-md", "vision-setup",
    ],
    context: {
      backup: ".reap/v15",
      migrated: [
        "config.yml (v0.15 fields removed, agentClient added)",
        "genome (3 files reconstructed by AI)",
        "environment (copied + source-map moved)",
        `lineage (${lineageCount} entries copied)`,
        `backlog (${backlogCount} items copied)`,
        `hooks (${hookCount} files mapped)`,
        "vision (goals.md created)",
        "memory (3 tier files created)",
        "CLAUDE.md (ensured)",
      ],
    },
    message: `Migration complete. Backup preserved at .reap/v15/. Run 'reap status' to verify.`,
  });
}

// ── CLI Entry Point ──────────────────────────────────────────

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  switch (phase) {
    case undefined:
    case "confirm":
      await executePreCheck(paths);
      break;
    case "execute":
      await executeMain(paths);
      break;
    case "vision":
      await executeVision(paths);
      break;
    case "complete":
      await executeComplete(paths);
      break;
    default:
      emitError("migrate", `Unknown migration phase: '${phase}'. Valid: confirm, execute, vision, complete`);
  }
}
