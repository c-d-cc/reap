import { join } from "path";
import { homedir } from "os";
import YAML from "yaml";
import { createPaths } from "../../core/paths.js";
import { readTextFile, fileExists } from "../../core/fs.js";
import { buildStrictSection } from "../../core/prompt.js";
import type { ReapConfig, GenerationState } from "../../types/index.js";

/**
 * Build the knowledge context string from all mandatory REAP files.
 * Exported for testing.
 */
export async function buildKnowledgeContext(cwd: string): Promise<string | null> {
  const configPath = join(cwd, ".reap", "config.yml");
  if (!(await fileExists(configPath))) {
    // Not a REAP project — silent exit
    return null;
  }

  const paths = createPaths(cwd);

  // Read all mandatory knowledge files in parallel
  const [
    reapGuide,
    application,
    evolution,
    invariants,
    envSummary,
    visionGoals,
    memoryLongterm,
    memoryMidterm,
    memoryShortterm,
    configContent,
    currentContent,
  ] = await Promise.all([
    readTextFile(join(homedir(), ".reap", "reap-guide.md")),
    readTextFile(paths.application),
    readTextFile(paths.evolution),
    readTextFile(paths.invariants),
    readTextFile(paths.environmentSummary),
    readTextFile(paths.visionGoals),
    readTextFile(paths.memoryLongterm),
    readTextFile(paths.memoryMidterm),
    readTextFile(paths.memoryShortterm),
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

  // Build context sections
  // Each knowledge file already contains its own markdown headers,
  // so we just concatenate them with separators.
  const sections: string[] = [];

  // REAP Guide (already has # REAP Guide header)
  if (reapGuide) {
    sections.push(reapGuide.trim());
  }

  // Genome (each file has its own header, wrap in group header)
  const genomeParts: string[] = [];
  if (application) genomeParts.push(application.trim());
  if (evolution) genomeParts.push(evolution.trim());
  if (invariants) genomeParts.push(invariants.trim());
  if (genomeParts.length > 0) {
    sections.push(genomeParts.join("\n\n---\n\n"));
  }

  // Environment (already has # Environment header)
  if (envSummary) {
    sections.push(envSummary.trim());
  }

  // Vision Goals (already has its own header)
  if (visionGoals) {
    sections.push(visionGoals.trim());
  }

  // Memory
  const memParts: string[] = [];
  if (memoryLongterm) memParts.push(memoryLongterm.trim());
  if (memoryMidterm) memParts.push(memoryMidterm.trim());
  if (memoryShortterm) memParts.push(memoryShortterm.trim());
  if (memParts.length > 0) {
    sections.push(memParts.join("\n\n"));
  }

  // Generation State
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

  // Strict Mode
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

  // Language
  if (config?.language) {
    sections.push(
      `# Language\nAlways respond in ${config.language}. Use ${config.language} for all explanations, comments, and communications. Technical terms and code identifiers remain in their original form.`,
    );
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
