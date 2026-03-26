import { readdir, stat, rm } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import YAML from "yaml";
import type { ReapPaths } from "./paths.js";
import { readTextFile, fileExists } from "./fs.js";
import {
  LIFECYCLE_STAGES,
  MERGE_STAGES,
} from "../types/index.js";
import type { GenerationState } from "../types/index.js";

export interface IntegrityResult {
  errors: string[];
  warnings: string[];
}

const VALID_BACKLOG_TYPES = ["genome-change", "environment-change", "task"];
const VALID_BACKLOG_STATUSES = ["pending", "consumed"];
const VALID_GENERATION_TYPES = ["embryo", "normal", "merge"];
const GENOME_LINE_WARNING_THRESHOLD = 100;

/**
 * Detect v0.15 project structure.
 * Returns true if .reap/genome/principles.md exists (v0.15 indicator).
 */
export async function detectV15(paths: ReapPaths): Promise<boolean> {
  return fileExists(join(paths.genome, "principles.md"));
}

/** Structural integrity check for .reap/ directory (read-only, no modifications) */
export async function checkIntegrity(
  paths: ReapPaths,
): Promise<IntegrityResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  await checkDirectoryStructure(paths, errors);
  await checkRequiredFiles(paths, errors, warnings);
  await checkConfig(paths, errors, warnings);
  await checkCurrentYml(paths, errors, warnings);
  await checkLineage(paths, errors, warnings);
  await checkGenome(paths, errors, warnings);
  await checkBacklog(paths, errors, warnings);

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
    { path: paths.vision, name: "vision/" },
    { path: paths.hooks, name: "hooks/" },
  ];

  const optionalDirs = [
    { path: paths.backlog, name: "life/backlog/" },
    { path: paths.environmentDomain, name: "environment/domain/" },
    { path: paths.visionDocs, name: "vision/docs/" },
    { path: paths.memory, name: "vision/memory/" },
  ];

  for (const dir of requiredDirs) {
    try {
      const s = await stat(dir.path);
      if (!s.isDirectory()) {
        errors.push(`${dir.name} exists but is not a directory`);
      }
    } catch {
      errors.push(`${dir.name} directory missing`);
    }
  }

  // Optional dirs — no error if missing, but error if exists and not a dir
  for (const dir of optionalDirs) {
    try {
      const s = await stat(dir.path);
      if (!s.isDirectory()) {
        errors.push(`${dir.name} exists but is not a directory`);
      }
    } catch {
      // Fine — optional
    }
  }
}

// ── required files ──────────────────────────────────────────

async function checkRequiredFiles(
  paths: ReapPaths,
  errors: string[],
  warnings: string[],
): Promise<void> {
  // reap-guide.md
  const guidePath = join(paths.reap, "reap-guide.md");
  if (!(await fileExists(guidePath))) {
    errors.push("reap-guide.md missing — run 'reap init --repair' or reinstall");
  }

  // memory tier files
  const memoryFiles = [
    { path: paths.memoryLongterm, name: "vision/memory/longterm.md" },
    { path: paths.memoryMidterm, name: "vision/memory/midterm.md" },
    { path: paths.memoryShortterm, name: "vision/memory/shortterm.md" },
  ];
  for (const f of memoryFiles) {
    if (!(await fileExists(f.path))) {
      warnings.push(`${f.name} missing`);
    }
  }

  // vision/goals.md
  if (!(await fileExists(paths.visionGoals))) {
    warnings.push("vision/goals.md missing");
  }

  // CLAUDE.md with REAP section
  const claudeMdPath = join(paths.root, "CLAUDE.md");
  const claudeMd = await readTextFile(claudeMdPath);
  if (!claudeMd) {
    warnings.push("CLAUDE.md missing — run 'reap init --repair'");
  } else if (!claudeMd.includes(".reap/genome/")) {
    warnings.push("CLAUDE.md exists but missing REAP section — run 'reap init --repair'");
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

  // Required field: project
  if (!config.project || typeof config.project !== "string") {
    errors.push(
      "config.yml: missing or invalid 'project' field (string required)",
    );
  }

  // Type checks for optional fields
  if (config.language !== undefined && typeof config.language !== "string") {
    warnings.push("config.yml: 'language' should be string");
  }
  if (
    config.strict !== undefined &&
    typeof config.strict !== "boolean" &&
    typeof config.strict !== "object"
  ) {
    warnings.push("config.yml: 'strict' should be boolean or object");
  }
  if (
    config.autoUpdate !== undefined &&
    typeof config.autoUpdate !== "boolean"
  ) {
    warnings.push("config.yml: 'autoUpdate' should be boolean");
  }
  if (
    config.autoSubagent !== undefined &&
    typeof config.autoSubagent !== "boolean"
  ) {
    warnings.push("config.yml: 'autoSubagent' should be boolean");
  }
  if (
    config.agentClient !== undefined &&
    typeof config.agentClient !== "string"
  ) {
    warnings.push("config.yml: 'agentClient' should be string");
  }
  if (
    config.cruiseCount !== undefined &&
    typeof config.cruiseCount !== "string"
  ) {
    warnings.push("config.yml: 'cruiseCount' should be string");
  }
}

// ── current.yml ──────────────────────────────────────────────

async function checkCurrentYml(
  paths: ReapPaths,
  errors: string[],
  _warnings: string[],
): Promise<GenerationState | null> {
  const content = await readTextFile(paths.current);
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

  // Required string fields
  const requiredStrings = ["id", "goal", "stage"];
  for (const field of requiredStrings) {
    if (!state[field] || typeof state[field] !== "string") {
      errors.push(
        `current.yml: missing or invalid '${field}' field (string required)`,
      );
    }
  }

  // type field
  if (state.type !== undefined) {
    if (!VALID_GENERATION_TYPES.includes(state.type as string)) {
      errors.push(
        `current.yml: invalid type "${state.type}" (valid: ${VALID_GENERATION_TYPES.join(", ")})`,
      );
    }
  }

  // parents field
  if (state.parents !== undefined && !Array.isArray(state.parents)) {
    errors.push("current.yml: 'parents' must be an array");
  }

  // stage validity
  if (typeof state.stage === "string") {
    const allStages = [
      ...LIFECYCLE_STAGES,
      ...MERGE_STAGES,
    ] as readonly string[];
    if (!allStages.includes(state.stage)) {
      errors.push(`current.yml: invalid stage "${state.stage}"`);
    }
  }

  // timeline
  if (state.timeline !== undefined && !Array.isArray(state.timeline)) {
    errors.push(
      "current.yml: 'timeline' should be an array",
    );
  }

  return state as unknown as GenerationState;
}

// ── lineage ──────────────────────────────────────────────────

async function checkLineage(
  paths: ReapPaths,
  errors: string[],
  warnings: string[],
): Promise<void> {
  let items: string[];
  try {
    items = await readdir(paths.lineage);
  } catch {
    return; // lineage dir may not exist yet
  }

  const allMetaIds = new Set<string>();

  for (const name of items) {
    if (!name.startsWith("gen-")) continue;
    const itemPath = join(paths.lineage, name);
    let itemStat: import("fs").Stats;
    try {
      itemStat = await stat(itemPath);
    } catch {
      continue;
    }

    if (itemStat.isDirectory()) {
      // Check meta.yml exists
      const metaPath = join(paths.lineage, name, "meta.yml");
      const metaContent = await readTextFile(metaPath);
      if (metaContent === null) {
        errors.push(`lineage/${name}: missing meta.yml`);
        continue;
      }

      let meta: Record<string, unknown>;
      try {
        meta = YAML.parse(metaContent) ?? {};
      } catch {
        errors.push(`lineage/${name}/meta.yml: invalid YAML`);
        continue;
      }

      validateLineageMeta(
        meta,
        `lineage/${name}/meta.yml`,
        errors,
        warnings,
      );
      if (meta.id) allMetaIds.add(meta.id as string);
    } else if (itemStat.isFile() && name.endsWith(".md")) {
      // Compressed lineage — check frontmatter
      const content = await readTextFile(join(paths.lineage, name));
      if (!content) continue;

      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch) {
        warnings.push(
          `lineage/${name}: compressed file missing frontmatter`,
        );
        continue;
      }

      let meta: Record<string, unknown>;
      try {
        meta = YAML.parse(fmMatch[1]) ?? {};
      } catch {
        errors.push(`lineage/${name}: invalid frontmatter YAML`);
        continue;
      }

      validateLineageMeta(meta, `lineage/${name}`, errors, warnings);
      if (meta.id) allMetaIds.add(meta.id as string);
    }
  }

  // Verify parent references
  for (const name of items) {
    if (!name.startsWith("gen-")) continue;
    const itemPath = join(paths.lineage, name);
    let parents: string[] = [];
    let itemStat: import("fs").Stats;
    try {
      itemStat = await stat(itemPath);
    } catch {
      continue;
    }

    if (itemStat.isDirectory()) {
      const metaContent = await readTextFile(
        join(paths.lineage, name, "meta.yml"),
      );
      if (metaContent) {
        try {
          const meta = YAML.parse(metaContent);
          parents = meta?.parents ?? [];
        } catch {
          /* already reported */
        }
      }
    } else if (itemStat.isFile() && name.endsWith(".md")) {
      const content = await readTextFile(join(paths.lineage, name));
      if (content) {
        const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (fmMatch) {
          try {
            const meta = YAML.parse(fmMatch[1]);
            parents = meta?.parents ?? [];
          } catch {
            /* already reported */
          }
        }
      }
    }

    for (const parent of parents) {
      if (parent && !allMetaIds.has(parent)) {
        const epochContent = await readTextFile(
          join(paths.lineage, "epoch.md"),
        );
        let inEpoch = false;
        if (epochContent) {
          inEpoch = epochContent.includes(parent);
        }
        if (!inEpoch) {
          warnings.push(
            `lineage/${name}: parent "${parent}" not found in lineage (may be in a compressed epoch)`,
          );
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
  // Required string fields
  const requiredStrings = ["id", "goal"];
  for (const field of requiredStrings) {
    if (!meta[field] || typeof meta[field] !== "string") {
      errors.push(`${location}: missing or invalid '${field}' field`);
    }
  }

  // timeline (v16 uses timeline array instead of startedAt/completedAt)
  if (meta.timeline !== undefined) {
    if (!Array.isArray(meta.timeline)) {
      errors.push(`${location}: 'timeline' should be an array`);
    }
  }

  if (!Array.isArray(meta.parents)) {
    errors.push(
      `${location}: missing or invalid 'parents' field (array required)`,
    );
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
  const genomeFiles = [
    { path: paths.application, name: "application.md" },
    { path: paths.evolution, name: "evolution.md" },
    { path: paths.invariants, name: "invariants.md" },
  ];

  for (const gf of genomeFiles) {
    if (!(await fileExists(gf.path))) {
      errors.push(`genome/${gf.name} does not exist`);
      continue;
    }

    const content = await readTextFile(gf.path);
    if (content === null) continue;

    const lines = content.split("\n").length;
    if (lines > GENOME_LINE_WARNING_THRESHOLD) {
      warnings.push(
        `genome/${gf.name}: ${lines} lines (exceeds ~${GENOME_LINE_WARNING_THRESHOLD} line guideline)`,
      );
    }

    // Placeholder detection
    const stripped = content
      .split("\n")
      .filter(
        (l) =>
          !l.startsWith("#") &&
          !l.startsWith(">") &&
          !l.startsWith("-") &&
          l.trim() !== "",
      )
      .join("")
      .trim();
    if (stripped.length === 0) {
      warnings.push(
        `genome/${gf.name}: appears to be placeholder-only (no substantive content)`,
      );
    }
  }
}

// ── backlog ──────────────────────────────────────────────────

async function checkBacklog(
  paths: ReapPaths,
  errors: string[],
  _warnings: string[],
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
      errors.push(
        `backlog/${filename}: missing or invalid 'type' field in frontmatter`,
      );
    } else if (!VALID_BACKLOG_TYPES.includes(fm.type as string)) {
      errors.push(
        `backlog/${filename}: invalid type "${fm.type}" (valid: ${VALID_BACKLOG_TYPES.join(", ")})`,
      );
    }

    // status required
    if (!fm.status || typeof fm.status !== "string") {
      errors.push(
        `backlog/${filename}: missing or invalid 'status' field in frontmatter`,
      );
    } else if (!VALID_BACKLOG_STATUSES.includes(fm.status as string)) {
      errors.push(
        `backlog/${filename}: invalid status "${fm.status}" (valid: ${VALID_BACKLOG_STATUSES.join(", ")})`,
      );
    }

    // consumed must have consumedBy
    if (fm.status === "consumed" && !fm.consumedBy) {
      errors.push(
        `backlog/${filename}: status is 'consumed' but missing 'consumedBy' field`,
      );
    }
  }
}

// ── user-level artifact checks ───────────────────────────────

/**
 * Check for user-level artifacts that should NOT exist.
 * These indicate legacy remnants or misconfigured installations.
 */
export async function checkUserLevelArtifacts(
  projectRoot: string,
): Promise<IntegrityResult> {
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

// ── legacy project-level cleanup ─────────────────────────────

const LEGACY_PREFIX_PATTERN = /^(?:reap|reapdev)\./;

/**
 * Remove legacy project-level REAP commands and skills.
 *
 * v0.15 installed skills at project-level `.claude/commands/reap.*.md`
 * and `.claude/skills/reap.* /SKILL.md`. v0.16 uses user-level
 * `~/.claude/commands/` only, so project-level files are unnecessary.
 *
 * Only deletes entries matching `reap.` or `reapdev.` prefix.
 * Preserves the `.claude/commands/` and `.claude/skills/` directories themselves.
 *
 * @returns list of deleted paths (relative to projectRoot)
 */
export async function cleanupLegacyProjectSkills(
  projectRoot: string,
): Promise<string[]> {
  const deleted: string[] = [];

  // 1. .claude/commands/reap.*.md and .claude/commands/reapdev.*.md
  const commandsDir = join(projectRoot, ".claude", "commands");
  try {
    const entries = await readdir(commandsDir);
    for (const entry of entries) {
      if (LEGACY_PREFIX_PATTERN.test(entry)) {
        await rm(join(commandsDir, entry), { force: true });
        deleted.push(`.claude/commands/${entry}`);
      }
    }
  } catch {
    // directory doesn't exist — nothing to clean
  }

  // 2. .claude/skills/reap.*/ and .claude/skills/reapdev.*/
  const skillsDir = join(projectRoot, ".claude", "skills");
  try {
    const entries = await readdir(skillsDir);
    for (const entry of entries) {
      if (LEGACY_PREFIX_PATTERN.test(entry)) {
        const entryPath = join(skillsDir, entry);
        try {
          const s = await stat(entryPath);
          if (s.isDirectory()) {
            await rm(entryPath, { recursive: true, force: true });
            deleted.push(`.claude/skills/${entry}/`);
          }
        } catch {
          // stat failed — skip
        }
      }
    }
  } catch {
    // directory doesn't exist — nothing to clean
  }

  return deleted;
}
