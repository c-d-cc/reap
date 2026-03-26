import { join, dirname } from "path";
import { fileURLToPath } from "url";
import YAML from "yaml";
import type { ReapPaths } from "../../../core/paths.js";
import { readTextFile, writeTextFile, ensureDir } from "../../../core/fs.js";
import { cleanupLegacyProjectSkills } from "../../../core/integrity.js";
import type { ReapConfig } from "../../../types/index.js";

/** Resolve path relative to dist/ root (works both in dev via bun and installed via npm) */
function distPath(...segments: string[]): string {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  // __dirname = dist/cli (built) or src/cli/commands/init (dev)
  // In both cases, go up to find templates/
  // Built: dist/cli -> dist/templates
  // Dev (bun): src/cli/commands/init -> src/templates (via ../../..)
  return join(__dirname, "..", "templates", ...segments);
}

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
  // Clean up legacy project-level skills (from v0.15)
  await cleanupLegacyProjectSkills(paths.root);

  // Create directories
  await ensureDir(paths.genome);
  await ensureDir(paths.environment);
  await ensureDir(paths.environmentDomain);
  await ensureDir(paths.life);
  await ensureDir(paths.backlog);
  await ensureDir(paths.lineage);
  await ensureDir(paths.vision);
  await ensureDir(paths.visionDocs);
  await ensureDir(paths.memory);
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

  // Write common genome files from templates
  const evolution = await readTextFile(distPath("evolution.md"));
  await writeTextFile(paths.evolution, evolution ?? "# Evolution\n");
  await writeTextFile(paths.invariants, DEFAULT_INVARIANTS);

  // Write vision
  await writeTextFile(paths.visionGoals, DEFAULT_GOALS);

  // Write memory (empty initial files)
  await writeTextFile(paths.memoryLongterm, "# Longterm Memory\n");
  await writeTextFile(paths.memoryMidterm, "# Midterm Memory\n");
  await writeTextFile(paths.memoryShortterm, "# Shortterm Memory\n");

  // Copy reap-guide.md to .reap/ for agent access
  const guide = await readTextFile(distPath("reap-guide.md"));
  if (guide) {
    await writeTextFile(join(paths.reap, "reap-guide.md"), guide);
  }

  // Write or append CLAUDE.md for AI agent session loading
  await ensureClaudeMd(paths.root, projectName);

  return config;
}

/**
 * Read the CLAUDE.md REAP section template from dist/templates.
 */
export async function getClaudeMdSection(): Promise<string> {
  return (await readTextFile(distPath("claude-md-section.md"))) ?? "";
}

/**
 * Ensure CLAUDE.md exists and contains the REAP section.
 * Returns the action taken: "created", "appended", or "skipped".
 */
export async function ensureClaudeMd(root: string, projectName: string): Promise<"created" | "appended" | "skipped"> {
  const claudeMdPath = join(root, "CLAUDE.md");
  const reapSection = await readTextFile(distPath("claude-md-section.md"));
  if (!reapSection) {
    return "skipped";
  }

  const existing = await readTextFile(claudeMdPath);
  if (existing) {
    if (!existing.includes(".reap/genome/")) {
      await writeTextFile(claudeMdPath, existing.trimEnd() + "\n" + reapSection);
      return "appended";
    }
    return "skipped";
  } else {
    await writeTextFile(claudeMdPath, `# ${projectName}\n` + reapSection);
    return "created";
  }
}
