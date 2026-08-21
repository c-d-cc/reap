import { join } from "path";
import YAML from "yaml";
import { createPaths } from "../../core/paths.js";
import { readTextFile, fileExists } from "../../core/fs.js";
import { buildStrictSection, buildMilestoneSection } from "../../core/prompt.js";
import { listMilestonesSync } from "../../core/milestone.js";
import { buildPendingMigrationsSection } from "../../core/migration.js";
import type { ReapConfig, GenerationState } from "../../types/index.js";
import { packageVersion } from "../../core/package-info.js";

/**
 * Build the dynamic context string for the SessionStart hook.
 *
 * Static knowledge (genome, environment, vision, memory, reap-guide) is loaded
 * by Claude Code via `@` import references in CLAUDE.md — NOT here. This
 * function only produces dynamic context that cannot be expressed as a static
 * file reference:
 *
 *   - `Current State` — parsed from `.reap/life/current.yml`
 *   - `Strict Mode` — derived from config flags + current stage
 *   - `Language` — derived from config.language
 *
 * Returns `null` for non-REAP directories (silent exit).
 *
 * Exported for testing.
 */
export async function buildKnowledgeContext(cwd: string): Promise<string | null> {
  const configPath = join(cwd, ".reap", "config.yml");
  if (!(await fileExists(configPath))) {
    // Not a REAP project — silent exit
    return null;
  }

  const paths = createPaths(cwd);

  // Read only the files needed for dynamic context.
  const [configContent, currentContent] = await Promise.all([
    readTextFile(paths.config),
    readTextFile(paths.current),
  ]);

  // Parse config
  let config: ReapConfig | null = null;
  if (configContent) {
    try {
      config = YAML.parse(configContent) as ReapConfig;
    } catch {
      // config parse error — proceed without config
    }
  }

  // Parse generation state
  let state: GenerationState | null = null;
  if (currentContent) {
    try {
      state = YAML.parse(currentContent) as GenerationState;
    } catch {
      // current.yml parse error — proceed without state
    }
  }

  const sections: string[] = [];

  // ── Current State ────────────────────────────────────────
  sections.push("# Current State");
  if (state) {
    const stateLines: string[] = [];
    stateLines.push(`- Generation: ${state.id}`);
    stateLines.push(`- Type: ${state.type}`);
    stateLines.push(`- Goal: ${state.goal}`);
    stateLines.push(`- Stage: ${state.stage}`);
    if (state.phase) stateLines.push(`- Phase: ${state.phase}`);
    if (state.type === "merge" && state.parents?.length) {
      stateLines.push(`- Parents: ${state.parents.join(", ")}`);
    }
    sections.push(stateLines.join("\n"));
  } else {
    sections.push("No active generation.");
  }

  // ── Milestone ────────────────────────────────────────────
  // Rendered by `buildMilestoneSection` so this text has one owner across the
  // subagent prompt and both dynamic-context builders.
  {
    const milestoneSection = buildMilestoneSection(
      listMilestonesSync(paths.visionMilestones),
      state,
      "#",
    );
    if (milestoneSection) sections.push(milestoneSection.trimEnd());
  }

  // ── Strict Mode ──────────────────────────────────────────
  if (config) {
    const strictStage = state ? state.stage : "none";
    const strictSection = buildStrictSection(
      config.strictEdit ?? false,
      config.strictMerge ?? false,
      strictStage,
      state?.type,
    );
    if (strictSection) {
      sections.push(strictSection.trimStart());
    }
  }

  // ── Language ─────────────────────────────────────────────
  if (config?.language) {
    sections.push(
      `# Language\nAlways respond in ${config.language}. Use ${config.language} for all explanations, comments, and communications. Technical terms and code identifiers remain in their original form.`,
    );
  }

  // No Code Intelligence section here. The index ships with REAP, so its
  // availability is constant and belongs in static knowledge — the guide, which
  // Claude Code loads by `@` import, and the stage prompt, which the agent reads
  // at the moment it would act on it. This channel carries what cannot be
  // expressed as a file, and a fact that never varies is not that.

  // ── Pending Migrations (gen-071) ─────────────────────────
  // Only present when the project's `lastMigratedVersion` lags behind the
  // installed REAP package. Section is omitted entirely otherwise so older
  // projects without the migration layer see byte-identical SessionStart
  // output. Detection is best-effort and silent on failure (returns null).
  try {
    const migrationsSection = buildPendingMigrationsSection(config, packageVersion());
    if (migrationsSection) sections.push(migrationsSection);
  } catch {
    // Never block SessionStart — silently skip on any error.
  }

  return sections.join("\n\n---\n\n");
}

/**
 * CLI entry point: `reap load-context`
 * Outputs hookSpecificOutput JSON for Claude Code SessionStart hook.
 * If not a REAP project, exits silently with code 0.
 */
export async function execute(): Promise<void> {
  const context = await buildKnowledgeContext(process.cwd());

  if (!context) {
    // Not a REAP project — silent exit (no output)
    process.exit(0);
  }

  // Output in Claude Code hookSpecificOutput format
  const output = {
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: context,
    },
  };

  process.stdout.write(JSON.stringify(output) + "\n");
  process.exit(0);
}
