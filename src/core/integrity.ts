import { readdir, stat } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import YAML from "yaml";
import { ReapPaths } from "./paths";
import { readTextFile, fileExists } from "./fs";
import { LifeCycle } from "./lifecycle";
import type { GenerationState, LifeCycleStage } from "../types";
import { LIFECYCLE_ORDER } from "../types";

export interface IntegrityResult {
  errors: string[];
  warnings: string[];
}

const VALID_BACKLOG_TYPES = ["genome-change", "environment-change", "task"];
const VALID_BACKLOG_STATUSES = ["pending", "consumed"];
const VALID_GENERATION_TYPES = ["normal", "merge", "recovery"];
const GENOME_LINE_WARNING_THRESHOLD = 100;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;

/** Check if a string is a valid ISO 8601 date (not just parseable by Date constructor) */
function isISODate(s: string): boolean {
  return ISO_DATE_RE.test(s) && !Number.isNaN(new Date(s).getTime());
}

/** Structural integrity check for .reap/ directory (read-only, no modifications) */
export async function checkIntegrity(paths: ReapPaths): Promise<IntegrityResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  await checkDirectoryStructure(paths, errors);
  await checkConfig(paths, errors, warnings);
  const state = await checkCurrentYml(paths, errors, warnings);
  await checkLineage(paths, errors, warnings);
  await checkGenome(paths, errors, warnings);
  await checkBacklog(paths, errors, warnings);
  if (state) {
    await checkArtifacts(paths, state, errors, warnings);
  }

  return { errors, warnings };
}

// ── directory structure ─────────────────────────────────────

async function checkDirectoryStructure(
  paths: ReapPaths,
  errors: string[],
): Promise<void> {
  const requiredDirs = [
    { path: paths.genome, name: "genome/" },
    { path: paths.environment, name: "environment/" },
    { path: paths.life, name: "life/" },
    { path: paths.lineage, name: "lineage/" },
    { path: paths.backlog, name: "life/backlog/", optional: true },
    { path: paths.hooks, name: "hooks/" },
    { path: paths.hookConditions, name: "hooks/conditions/" },
  ];

  for (const dir of requiredDirs) {
    try {
      const s = await stat(dir.path);
      if (!s.isDirectory()) {
        errors.push(`${dir.name} directory missing`);
      }
    } catch {
      if (!("optional" in dir && dir.optional)) {
        errors.push(`${dir.name} directory missing`);
      }
    }
  }
}

// ── config.yml ───────────────────────────────────────────────

async function checkConfig(
  paths: ReapPaths,
  errors: string[],
  warnings: string[],
): Promise<void> {
  const content = await readTextFile(paths.config);
  if (content === null) {
    errors.push("config.yml does not exist");
    return;
  }

  let config: Record<string, unknown>;
  try {
    config = YAML.parse(content) ?? {};
  } catch {
    errors.push("config.yml is not valid YAML");
    return;
  }

  if (typeof config !== "object" || Array.isArray(config)) {
    errors.push("config.yml root must be a YAML mapping");
    return;
  }

  // Required fields
  if (!config.project || typeof config.project !== "string") {
    errors.push("config.yml: missing or invalid 'project' field (string required)");
  }
  if (!config.entryMode || typeof config.entryMode !== "string") {
    errors.push("config.yml: missing or invalid 'entryMode' field (string required)");
  } else {
    const validModes = ["greenfield", "migration", "adoption"];
    if (!validModes.includes(config.entryMode as string)) {
      errors.push(`config.yml: invalid entryMode "${config.entryMode}" (valid: ${validModes.join(", ")})`);
    }
  }

  // Type checks for optional fields
  if (config.strict !== undefined && typeof config.strict !== "boolean" && typeof config.strict !== "object") {
    warnings.push("config.yml: 'strict' should be boolean or object");
  }
  if (config.autoUpdate !== undefined && typeof config.autoUpdate !== "boolean") {
    warnings.push("config.yml: 'autoUpdate' should be boolean");
  }
  if (config.autoSubagent !== undefined && typeof config.autoSubagent !== "boolean") {
    warnings.push("config.yml: 'autoSubagent' should be boolean");
  }
}

// ── current.yml ──────────────────────────────────────────────

async function checkCurrentYml(
  paths: ReapPaths,
  errors: string[],
  warnings: string[],
): Promise<GenerationState | null> {
  const content = await readTextFile(paths.currentYml);
  if (content === null || !content.trim()) {
    return null; // No active generation — not an error
  }

  let state: Record<string, unknown>;
  try {
    state = YAML.parse(content) ?? {};
  } catch {
    errors.push("current.yml is not valid YAML");
    return null;
  }

  if (typeof state !== "object" || Array.isArray(state)) {
    errors.push("current.yml root must be a YAML mapping");
    return null;
  }

  // Required fields
  const requiredStrings = ["id", "goal", "stage", "startedAt"];
  for (const field of requiredStrings) {
    if (!state[field] || typeof state[field] !== "string") {
      errors.push(`current.yml: missing or invalid '${field}' field (string required)`);
    }
  }

  if (state.genomeVersion === undefined || typeof state.genomeVersion !== "number") {
    errors.push("current.yml: missing or invalid 'genomeVersion' field (number required)");
  }

  if (!Array.isArray(state.timeline)) {
    errors.push("current.yml: missing or invalid 'timeline' field (array required)");
  }

  // type field
  if (state.type !== undefined) {
    if (!VALID_GENERATION_TYPES.includes(state.type as string)) {
      errors.push(`current.yml: invalid type "${state.type}" (valid: ${VALID_GENERATION_TYPES.join(", ")})`);
    }
  }

  // parents field
  if (state.parents !== undefined && !Array.isArray(state.parents)) {
    errors.push("current.yml: 'parents' must be an array");
  }

  // stage validity
  if (typeof state.stage === "string" && !LifeCycle.isValid(state.stage)) {
    // Could be a merge stage — check that too
    const mergeStages = ["detect", "mate", "merge", "sync", "validation", "completion"];
    if (!mergeStages.includes(state.stage)) {
      errors.push(`current.yml: invalid stage "${state.stage}"`);
    }
  }

  // recovery must have recovers
  if (state.type === "recovery") {
    if (!state.recovers || !Array.isArray(state.recovers) || state.recovers.length === 0) {
      errors.push("current.yml: recovery generation must have non-empty 'recovers' array");
    }
  }

  return state as unknown as GenerationState;
}

// ── lineage ──────────────────────────────────────────────────

async function checkLineage(
  paths: ReapPaths,
  errors: string[],
  warnings: string[],
): Promise<void> {
  let entries: string[];
  try {
    const items = await readdir(paths.lineage, { withFileTypes: true });
    entries = items.map(i => ({ name: i.name, isDir: i.isDirectory(), isFile: i.isFile() })) as any;
  } catch {
    return; // lineage dir may not exist yet
  }

  // Re-read properly
  const items = await readdir(paths.lineage, { withFileTypes: true });
  const allMetaIds = new Set<string>();

  for (const item of items) {
    if (item.isDirectory() && item.name.startsWith("gen-")) {
      // Check meta.yml exists
      const metaPath = join(paths.lineage, item.name, "meta.yml");
      const metaContent = await readTextFile(metaPath);
      if (metaContent === null) {
        errors.push(`lineage/${item.name}: missing meta.yml`);
        continue;
      }

      let meta: Record<string, unknown>;
      try {
        meta = YAML.parse(metaContent) ?? {};
      } catch {
        errors.push(`lineage/${item.name}/meta.yml: invalid YAML`);
        continue;
      }

      validateLineageMeta(meta, `lineage/${item.name}/meta.yml`, errors, warnings);
      if (meta.id) allMetaIds.add(meta.id as string);
    } else if (item.isFile() && item.name.startsWith("gen-") && item.name.endsWith(".md")) {
      // Compressed lineage — check frontmatter
      const content = await readTextFile(join(paths.lineage, item.name));
      if (!content) continue;

      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch) {
        warnings.push(`lineage/${item.name}: compressed file missing frontmatter`);
        continue;
      }

      let meta: Record<string, unknown>;
      try {
        meta = YAML.parse(fmMatch[1]) ?? {};
      } catch {
        errors.push(`lineage/${item.name}: invalid frontmatter YAML`);
        continue;
      }

      validateLineageMeta(meta, `lineage/${item.name}`, errors, warnings);
      if (meta.id) allMetaIds.add(meta.id as string);
    }
  }

  // Verify parent references
  for (const item of items) {
    let parents: string[] = [];
    if (item.isDirectory() && item.name.startsWith("gen-")) {
      const metaContent = await readTextFile(join(paths.lineage, item.name, "meta.yml"));
      if (metaContent) {
        try {
          const meta = YAML.parse(metaContent);
          parents = meta?.parents ?? [];
        } catch { /* already reported */ }
      }
    } else if (item.isFile() && item.name.startsWith("gen-") && item.name.endsWith(".md")) {
      const content = await readTextFile(join(paths.lineage, item.name));
      if (content) {
        const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (fmMatch) {
          try {
            const meta = YAML.parse(fmMatch[1]);
            parents = meta?.parents ?? [];
          } catch { /* already reported */ }
        }
      }
    }

    for (const parent of parents) {
      if (parent && !allMetaIds.has(parent)) {
        // Check if parent is in epoch.md
        const epochContent = await readTextFile(join(paths.lineage, "epoch.md"));
        let inEpoch = false;
        if (epochContent) {
          inEpoch = epochContent.includes(parent);
        }
        if (!inEpoch) {
          warnings.push(`lineage/${item.name}: parent "${parent}" not found in lineage (may be in a compressed epoch)`);
        }
      }
    }
  }
}

function validateLineageMeta(
  meta: Record<string, unknown>,
  location: string,
  errors: string[],
  warnings: string[],
): void {
  const requiredStrings = ["id", "goal", "startedAt", "completedAt"];
  for (const field of requiredStrings) {
    if (!meta[field] || typeof meta[field] !== "string") {
      errors.push(`${location}: missing or invalid '${field}' field`);
    }
  }

  // completedAt ISO validity (NaN check + ISO format regex)
  if (typeof meta.completedAt === "string") {
    if (!isISODate(meta.completedAt)) {
      errors.push(`${location}: completedAt "${meta.completedAt}" is not a valid ISO date`);
    }
  }

  // startedAt ISO validity
  if (typeof meta.startedAt === "string") {
    if (!isISODate(meta.startedAt)) {
      warnings.push(`${location}: startedAt "${meta.startedAt}" is not a valid ISO date`);
    }
  }

  if (!Array.isArray(meta.parents)) {
    errors.push(`${location}: missing or invalid 'parents' field (array required)`);
  }

  if (!meta.type || typeof meta.type !== "string") {
    errors.push(`${location}: missing or invalid 'type' field`);
  } else if (!VALID_GENERATION_TYPES.includes(meta.type as string)) {
    errors.push(`${location}: invalid type "${meta.type}"`);
  }

  if (meta.genomeHash !== undefined && typeof meta.genomeHash !== "string") {
    warnings.push(`${location}: genomeHash should be a string`);
  }
}

// ── genome ───────────────────────────────────────────────────

async function checkGenome(
  paths: ReapPaths,
  errors: string[],
  warnings: string[],
): Promise<void> {
  const l1Files = [
    { path: paths.principles, name: "principles.md" },
    { path: paths.conventions, name: "conventions.md" },
    { path: paths.constraints, name: "constraints.md" },
    { path: paths.sourceMap, name: "source-map.md" },
  ];

  for (const gf of l1Files) {
    if (!(await fileExists(gf.path))) {
      errors.push(`genome/${gf.name} does not exist`);
      continue;
    }

    const content = await readTextFile(gf.path);
    if (content === null) continue;

    const lines = content.split("\n").length;
    if (gf.name !== "source-map.md" && lines > GENOME_LINE_WARNING_THRESHOLD) {
      warnings.push(`genome/${gf.name}: ${lines} lines (exceeds ~${GENOME_LINE_WARNING_THRESHOLD} line guideline)`);
    }

    // Placeholder detection — check if file only has template headers with no real content
    const stripped = content
      .split("\n")
      .filter(l => !l.startsWith("#") && !l.startsWith(">") && !l.startsWith("-") && l.trim() !== "")
      .join("")
      .trim();
    if (stripped.length === 0) {
      warnings.push(`genome/${gf.name}: appears to be placeholder-only (no substantive content)`);
    }
  }
}

// ── backlog ──────────────────────────────────────────────────

async function checkBacklog(
  paths: ReapPaths,
  errors: string[],
  warnings: string[],
): Promise<void> {
  let entries: string[];
  try {
    entries = await readdir(paths.backlog);
  } catch {
    return; // backlog dir may not exist
  }

  for (const filename of entries) {
    if (!filename.endsWith(".md")) continue;

    const content = await readTextFile(join(paths.backlog, filename));
    if (!content) continue;

    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) {
      errors.push(`backlog/${filename}: missing frontmatter`);
      continue;
    }

    let fm: Record<string, unknown>;
    try {
      fm = YAML.parse(fmMatch[1]) ?? {};
    } catch {
      errors.push(`backlog/${filename}: invalid frontmatter YAML`);
      continue;
    }

    // type required
    if (!fm.type || typeof fm.type !== "string") {
      errors.push(`backlog/${filename}: missing or invalid 'type' field in frontmatter`);
    } else if (!VALID_BACKLOG_TYPES.includes(fm.type as string)) {
      errors.push(`backlog/${filename}: invalid type "${fm.type}" (valid: ${VALID_BACKLOG_TYPES.join(", ")})`);
    }

    // status required
    if (!fm.status || typeof fm.status !== "string") {
      errors.push(`backlog/${filename}: missing or invalid 'status' field in frontmatter`);
    } else if (!VALID_BACKLOG_STATUSES.includes(fm.status as string)) {
      errors.push(`backlog/${filename}: invalid status "${fm.status}" (valid: ${VALID_BACKLOG_STATUSES.join(", ")})`);
    }

    // consumed must have consumedBy
    if (fm.status === "consumed" && !fm.consumedBy) {
      errors.push(`backlog/${filename}: status is 'consumed' but missing 'consumedBy' field`);
    }
  }
}

// ── artifacts ────────────────────────────────────────────────

const STAGE_ARTIFACT_MAP: Record<string, string> = {
  objective: "01-objective.md",
  planning: "02-planning.md",
  implementation: "03-implementation.md",
  validation: "04-validation.md",
  completion: "05-completion.md",
};

async function checkArtifacts(
  paths: ReapPaths,
  state: GenerationState,
  errors: string[],
  warnings: string[],
): Promise<void> {
  const currentStageIdx = LIFECYCLE_ORDER.indexOf(state.stage as LifeCycleStage);
  if (currentStageIdx < 0) return; // merge generation — skip artifact check

  // All stages before current should have artifacts
  for (let i = 0; i < currentStageIdx; i++) {
    const stage = LIFECYCLE_ORDER[i];
    const artifactName = STAGE_ARTIFACT_MAP[stage];
    if (!artifactName) continue;

    const artifactPath = paths.artifact(artifactName);
    if (!(await fileExists(artifactPath))) {
      errors.push(`artifact ${artifactName} missing (expected for completed stage '${stage}')`);
      continue;
    }

    // Check REAP MANAGED header
    const content = await readTextFile(artifactPath);
    if (content && !content.startsWith("# REAP MANAGED")) {
      warnings.push(`artifact ${artifactName}: missing 'REAP MANAGED' header`);
    }
  }

  // Current stage artifact should also exist (at least the template)
  const currentArtifact = STAGE_ARTIFACT_MAP[state.stage];
  if (currentArtifact) {
    const artifactPath = paths.artifact(currentArtifact);
    if (!(await fileExists(artifactPath))) {
      warnings.push(`artifact ${currentArtifact} not yet created for current stage '${state.stage}'`);
    }
  }
}

// ── user-level falsy checks ─────────────────────────────────

/**
 * Check for user-level artifacts that should NOT exist.
 * These indicate legacy remnants or misconfigured installations.
 * Separate from checkIntegrity() because it inspects paths outside .reap/.
 */
export async function checkUserLevelArtifacts(projectRoot: string): Promise<IntegrityResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const home = homedir();

  // ~/.claude/skills/reap.* — user-level reap skills (should only be project-level)
  await checkGlobPattern(
    join(home, ".claude", "skills"),
    /^reap\./,
    "~/.claude/skills/",
    "user-level reap skill found (should only be project-level)",
    errors,
  );

  // ~/.claude/commands/reap.* — legacy reap commands at user level
  await checkGlobPattern(
    join(home, ".claude", "commands"),
    /^reap\./,
    "~/.claude/commands/",
    "legacy reap command at user level (Phase 2 remnant)",
    warnings,
  );

  // ~/.config/opencode/commands/reap.* — legacy opencode commands
  await checkGlobPattern(
    join(home, ".config", "opencode", "commands"),
    /^reap\./,
    "~/.config/opencode/commands/",
    "legacy reap command at user level (Phase 2 remnant)",
    warnings,
  );

  // .claude/commands/reap.* — legacy project-level commands (should be in skills/)
  await checkGlobPattern(
    join(projectRoot, ".claude", "commands"),
    /^reap\./,
    ".claude/commands/",
    "legacy project-level reap command (should be migrated to skills/)",
    warnings,
  );

  return { errors, warnings };
}

async function checkGlobPattern(
  dir: string,
  pattern: RegExp,
  displayDir: string,
  message: string,
  target: string[],
): Promise<void> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return; // directory doesn't exist — that's fine
  }

  for (const entry of entries) {
    if (pattern.test(entry)) {
      target.push(`${displayDir}${entry}: ${message}`);
    }
  }
}
