import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import YAML from "yaml";
import { createPaths } from "./paths.js";
import { buildStrictSection } from "./prompt.js";
import type { ReapConfig, GenerationState } from "../types/index.js";

/**
 * Lifecycle commands that should trigger a synchronous dump of dynamic REAP
 * state to `.reap/.session-state.md` on exit. The set mirrors the commands
 * that materially change generation state.
 */
export const DUMP_COMMANDS = new Set<string>([
  "start",
  "learning",
  "planning",
  "implementation",
  "validation",
  "completion",
  "evolve",
  "back",
  "next",
  "abort",
  "early-close",
  "detect",
  "mate",
  "merge",
  "reconcile",
  "install-skills",
  "update",
  "init",
]);

/**
 * Synchronous variant of `buildKnowledgeContext` (the async version lives in
 * `src/cli/commands/load-context.ts`). Output content MUST stay byte-identical
 * to the async builder so that OpenCode users see the same context whether
 * the file was written by `reap dump-state` or by `emitOutput`'s sync dump.
 *
 * Returns `null` when not a REAP project (no `.reap/config.yml`).
 */
export function buildKnowledgeContextSync(cwd: string): string | null {
  const configPath = join(cwd, ".reap", "config.yml");
  if (!existsSync(configPath)) return null;

  const paths = createPaths(cwd);

  let configContent = "";
  let currentContent = "";
  try { configContent = readFileSync(paths.config, "utf-8"); } catch { /* ignore */ }
  try { currentContent = readFileSync(paths.current, "utf-8"); } catch { /* ignore */ }

  let config: ReapConfig | null = null;
  if (configContent) {
    try { config = YAML.parse(configContent) as ReapConfig; } catch { /* ignore */ }
  }

  let state: GenerationState | null = null;
  if (currentContent) {
    try { state = YAML.parse(currentContent) as GenerationState; } catch { /* ignore */ }
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

  return sections.join("\n\n---\n\n");
}

/**
 * Synchronously write dynamic REAP context to `.reap/.session-state.md`.
 * No-op when not a REAP project. Silent on error (callers wrap in try/catch).
 */
export function dumpStateSync(cwd: string): void {
  const ctx = buildKnowledgeContextSync(cwd);
  if (!ctx) return;
  const paths = createPaths(cwd);
  mkdirSync(dirname(paths.sessionState), { recursive: true });
  writeFileSync(paths.sessionState, ctx + "\n", "utf-8");
}
