import { readdir, stat, rm, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import YAML from "yaml";
import type { ReapPaths } from "./paths.js";
import { readTextFile, fileExists } from "./fs.js";
import {
  LIFECYCLE_STAGES,
  MERGE_STAGES,
} from "../types/index.js";
import type { GenerationState, DaemonAvailability } from "../types/index.js";

export interface IntegrityResult {
  errors: string[];
  warnings: string[];
}

const VALID_BACKLOG_TYPES = ["genome-change", "environment-change", "task"];
const VALID_BACKLOG_STATUSES = ["pending", "consumed"];
const VALID_GENERATION_TYPES = ["embryo", "normal", "merge"];
/**
 * Line thresholds for the three genome files (gen-075).
 *
 * These were a single shared constant of 100 until v0.17.2 — a number with no
 * recorded rationale that REAP itself could not satisfy: the shipped
 * `src/templates/evolution.md` is ~193 lines, so every project warned on its
 * genome the moment `reap init` finished.
 *
 * They are per-file now because the three files hold different things, and each
 * value is derived from what its file is for:
 *
 * - `invariants.md` (ships at ~7 lines) — absolute constraints, human-edit only.
 *   Growth here is itself the signal: past ~50 lines it has stopped being a set
 *   of constraints and become a rulebook, which belongs in evolution.md.
 *
 * - `evolution.md` (ships at ~193 lines) — AI behaviour rules. A maturing
 *   project legitimately adds its own, so the shipped size plus roughly 100
 *   lines of headroom. Past 300 the rules are usually duplicated, or carry
 *   descriptive content that belongs in environment/.
 *
 * - `application.md` (ships as a ~16-line skeleton, filled in by genome-suggest)
 *   — project identity and architecture, so it scales with the project. 250
 *   sits above what a large project needs in practice (this repo: ~205).
 *
 * Warnings only — the genome is user-owned and `fixProject` never rewrites it.
 */
const GENOME_LINE_WARNING_THRESHOLDS = {
  application: 250,
  evolution: 300,
  invariants: 50,
} as const;

/**
 * Line thresholds for vision memory tiers (gen-072).
 *
 * Mirrors the bloat guidance in reap-guide.md § Memory ("longterm ~30~50 lines,
 * midterm ~50~70 lines"): the upper bound of each documented range is used so a
 * project sitting inside the guideline never warns. `shortterm` has no
 * documented range — it is bounded by "the last 1~2 generations of handoff", so
 * 60 lines is set as a generous ceiling for that.
 *
 * These are WARNINGS ONLY. Memory content is user-authored and must never be
 * auto-deleted: `fixProject` (fix.ts) deliberately does not act on them. The
 * resolution path is the mandatory pruning step in `completion --phase reflect`.
 */
const MEMORY_LINE_WARNING_THRESHOLDS = {
  longterm: 50,
  midterm: 70,
  shortterm: 60,
} as const;

/**
 * Line threshold for environment/summary.md (gen-072).
 *
 * summary.md describes the CURRENT state, not a per-generation changelog. When
 * generations append without removing superseded content it grows without
 * bound — the reported case reached 66 KB with 8 of 21 sections being changelog
 * entries. Warning only, same policy as the memory tiers above.
 */
const ENV_SUMMARY_LINE_WARNING_THRESHOLD = 250;

/** Shared hint appended to every size warning so the user has a resolution path. */
const SIZE_WARNING_HINT =
  "run 'reap run completion --phase reflect' and follow the pruning policy (do not hand-delete)";

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
  await checkMemorySize(paths, warnings);
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
    { path: paths.environmentResources, name: "environment/resources/" },
    { path: paths.environmentDocs, name: "environment/docs/" },
    { path: paths.visionDesign, name: "vision/design/" },
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
  // reap-guide.md — check ~/.reap/ (v0.16+) or .reap/ (legacy/fallback)
  const guideGlobal = join(homedir(), ".reap", "reap-guide.md");
  const guideLocal = join(paths.reap, "reap-guide.md");
  if (!(await fileExists(guideGlobal)) && !(await fileExists(guideLocal))) {
    // Not "reinstall the package": npm 12 blocks install scripts for global
    // installs by default, so a reinstall runs no postinstall and lands the
    // user right back here. `reap install-skills` places it in every npm
    // version, and `reap fix` restores it directly.
    errors.push("reap-guide.md missing — run 'reap install-skills' to restore it");
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
    // A bare mention is enough here. `detectLegacyReapSection`
    // (cli/commands/init/common.ts) requires an actual heading, because it
    // replaces what it finds. This check only decides whether to warn, so
    // accepting a hand-written reference avoids nagging users who wired REAP
    // into their CLAUDE.md their own way. The two thresholds differ by intent,
    // not by oversight.
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
    config.strictEdit !== undefined &&
    typeof config.strictEdit !== "boolean"
  ) {
    warnings.push("config.yml: 'strictEdit' should be boolean");
  }
  if (
    config.strictMerge !== undefined &&
    typeof config.strictMerge !== "boolean"
  ) {
    warnings.push("config.yml: 'strictMerge' should be boolean");
  }
  // Legacy strict field — warn if still present
  if (config.strict !== undefined) {
    warnings.push("config.yml: legacy 'strict' field found — run 'reap update' to migrate to strictEdit/strictMerge");
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
    { path: paths.application, name: "application.md", threshold: GENOME_LINE_WARNING_THRESHOLDS.application },
    { path: paths.evolution, name: "evolution.md", threshold: GENOME_LINE_WARNING_THRESHOLDS.evolution },
    { path: paths.invariants, name: "invariants.md", threshold: GENOME_LINE_WARNING_THRESHOLDS.invariants },
  ];

  for (const gf of genomeFiles) {
    if (!(await fileExists(gf.path))) {
      errors.push(`genome/${gf.name} does not exist`);
      continue;
    }

    const content = await readTextFile(gf.path);
    if (content === null) continue;

    const lines = content.split("\n").length;
    if (lines > gf.threshold) {
      warnings.push(
        `genome/${gf.name}: ${lines} lines (exceeds ~${gf.threshold} line guideline)`,
      );
    }

    // Placeholder detection.
    //
    // Headings, blockquote hints and HTML comments are scaffolding a template
    // ships with; anything else counts as content. Bullets in particular do —
    // `invariants.md` is a bullet list by design and carries no prose at all, so
    // excluding them (as this did until gen-078) made every freshly initialised
    // project report its own shipped invariants as a placeholder.
    const substantive = content.split("\n").filter((line) => {
      const t = line.trim();
      if (t === "") return false;
      if (t.startsWith("#")) return false;
      if (t.startsWith(">")) return false;
      if (t.startsWith("<!--")) return false;
      return true;
    });
    if (substantive.length === 0) {
      warnings.push(
        `genome/${gf.name}: appears to be placeholder-only (no substantive content)`,
      );
    }
  }
}

// ── memory / environment size (gen-072) ──────────────────────

/**
 * Warn when vision memory tiers or environment/summary.md grow past their
 * guideline size — a signal that the reflect-phase pruning policy was skipped.
 *
 * WARNINGS ONLY BY DESIGN. These files are user-authored records; auto-deleting
 * them would destroy generations of context. `fixProject` (fix.ts) intentionally
 * has no counterpart to this check — keep it that way. Every warning carries the
 * resolution path so the user does not hand-prune and lose content.
 *
 * A missing file is not a problem (an empty/absent memory tier is a valid state),
 * so unreadable paths are skipped silently.
 */
async function checkMemorySize(
  paths: ReapPaths,
  warnings: string[],
): Promise<void> {
  const targets: Array<{ path: string; label: string; threshold: number }> = [
    {
      path: paths.memoryLongterm,
      label: "vision/memory/longterm.md",
      threshold: MEMORY_LINE_WARNING_THRESHOLDS.longterm,
    },
    {
      path: paths.memoryMidterm,
      label: "vision/memory/midterm.md",
      threshold: MEMORY_LINE_WARNING_THRESHOLDS.midterm,
    },
    {
      path: paths.memoryShortterm,
      label: "vision/memory/shortterm.md",
      threshold: MEMORY_LINE_WARNING_THRESHOLDS.shortterm,
    },
    {
      path: paths.environmentSummary,
      label: "environment/summary.md",
      threshold: ENV_SUMMARY_LINE_WARNING_THRESHOLD,
    },
  ];

  for (const t of targets) {
    if (!(await fileExists(t.path))) continue;

    const content = await readTextFile(t.path);
    if (content === null) continue;

    const lines = content.split("\n").length;
    if (lines > t.threshold) {
      warnings.push(
        `${t.label}: ${lines} lines (exceeds ~${t.threshold} line guideline) — ${SIZE_WARNING_HINT}`,
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

// ── daemon availability check ────────────────────────────────

/**
 * Report a project that asked for the daemon but cannot use it.
 *
 * `daemon: true` and no daemon is a mismatch between configuration and
 * environment, not a transient outage — it will be just as broken tomorrow. The
 * lifecycle still refuses to block on it, so this is where a user who asks
 * finds out. Before the daemon became a separate package there was nothing to
 * find out: npm linked a directory that did not ship, and reap could not tell
 * an empty link from a stopped process.
 *
 * `availability` is injected (gen-076 pattern) because resolving it belongs to
 * `cli` and `core` does not import from there. Undefined means the caller did
 * not look, and a check that was not run reports nothing — flagging a setup
 * that may well be fine is worse than staying quiet.
 *
 * Warnings only. Nothing here has a counterpart in `fixProject`: there is no
 * safe automatic repair for "install this package", and leaving the mutating
 * path untouched is what guarantees one can never appear by accident.
 */
export function checkDaemonAvailability(
  daemonEnabled: boolean,
  availability?: DaemonAvailability,
): IntegrityResult {
  const warnings: string[] = [];
  if (daemonEnabled && availability) {
    // Reported before the verdict and regardless of it. An instruction that was
    // followed to an empty path is a fact about this setup whether or not the
    // search went on to succeed, and it is the finding the user can act on.
    const miss = availability.explicitMiss;
    if (miss) {
      warnings.push(
        `${miss.label} points at ${miss.path}, but there is no file there. REAP searched for the daemon the usual way instead.`,
      );
    }
    if (!availability.installed) {
      // The locate hint is withheld when a location was already named: it would
      // tell someone who has just been told their path is empty to supply a
      // path. The miss warning above is the actionable one in that case.
      //
      // The command goes last either way, so nothing follows it that could be
      // mistaken for part of it.
      const hint = miss ? "Install it with" : `${availability.locateHint} Otherwise install it with`;
      warnings.push(
        `config.yml sets 'daemon: true' but ${availability.packageName} is not installed. ${hint}: ${availability.installCommand}`,
      );
    } else if (availability.outdated) {
      // Where it came from decides what to say, and the sentence is composed by
      // whoever knows that (see `staleDaemonRemedy`). Telling someone to install
      // globally when reap will go on resolving a named path or a checkout beside
      // it is advice that cannot take effect while looking like it should.
      warnings.push(
        `config.yml sets 'daemon: true' and the daemon is installed, but version ${availability.version} is older than the ${availability.required} this REAP requires. ${availability.staleRemedy}`,
      );
    }
  }
  return { errors: [], warnings };
}

// ── user-level artifact checks ───────────────────────────────

/**
 * Check for user-level artifacts that should NOT exist.
 * These indicate legacy remnants or misconfigured installations.
 */
export async function checkUserLevelArtifacts(
  projectRoot: string,
  canonicalDirs: string[] = [],
  home: string = homedir(),
): Promise<IntegrityResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  /**
   * A directory the running adapter installs into is not a leftover, however
   * much it looks like one. Before gen-076 this comparison did not exist and
   * `fix --check` reported the location `install-skills` had just written to as
   * a v0.15 remnant — the two commands contradicted each other with no way for
   * the user to satisfy both (issue #22).
   */
  const isCanonical = (dir: string) => canonicalDirs.includes(dir);

  // ~/.claude/skills/reap.* — v0.15 installed skills as `reap.<cmd>/SKILL.md`
  // here. No current adapter writes to it, so anything matching is a leftover.
  // Guarded by isCanonical so that an adapter moving here later needs no change
  // on this side.
  const userSkillsDir = join(home, ".claude", "skills");
  if (!isCanonical(userSkillsDir)) {
    await checkGlobPattern(
      userSkillsDir,
      /^reap\./,
      "~/.claude/skills/",
      "user-level reap skill found (should only be project-level)",
      errors,
    );
  }

  // reap:carrier(claude-code-commands-path)
  // (Note) `~/.claude/commands/` (claude-code) and
  // `~/.config/opencode/commands/` (opencode) are the canonical slash-command
  // locations. Adapters declare them via `userLevelDirs()`; the caller injects
  // the list. `core` deliberately does not import adapters, so this file has no
  // opinion about which path is current — it only knows what it was told.

  // .claude/commands/reap.* — v0.15 project-level commands. Still worth
  // flagging: `cleanupLegacyProjectSkills` removes them, so the warning has a
  // resolution path.
  const projectCommandsDir = join(projectRoot, ".claude", "commands");
  if (!isCanonical(projectCommandsDir)) {
    await checkGlobPattern(
      projectCommandsDir,
      /^reap\./,
      ".claude/commands/",
      "legacy project-level reap command (should be migrated to skills/)",
      warnings,
    );
  }

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

// Patterns for legacy project-level cleanup (reap.* only — reapdev.* is reserved
// for the REAP repo's own project-level dev commands and must not be cleaned)
const LEGACY_COMMAND_PATTERN = /^reap\.[^.]+\.md$/;  // files: reap.*.md
const LEGACY_SKILL_PATTERN = /^reap\./;               // directories: reap.*/

/**
 * Remove legacy project-level REAP commands and skills.
 *
 * v0.15 installed skills at project-level `.claude/commands/reap.*.md`
 * and `.claude/skills/reap.* /SKILL.md`. v0.16 uses user-level
 * `~/.claude/commands/` only, so project-level files are unnecessary.
 *
 * Only deletes entries matching the `reap.` prefix. The `reapdev.` prefix
 * is reserved for project-level dev commands inside the REAP repo itself
 * and must be preserved (self-hosting concern).
 *
 * Preserves the `.claude/commands/` and `.claude/skills/` directories themselves.
 *
 * @returns list of deleted paths (relative to projectRoot)
 */
export async function cleanupLegacyProjectSkills(
  projectRoot: string,
): Promise<string[]> {
  const deleted: string[] = [];

  // 1. .claude/commands/reap.*.md (reapdev.*.md preserved for REAP self-hosting)
  const commandsDir = join(projectRoot, ".claude", "commands");
  try {
    const entries = await readdir(commandsDir);
    for (const entry of entries) {
      if (LEGACY_COMMAND_PATTERN.test(entry)) {
        await rm(join(commandsDir, entry), { force: true });
        deleted.push(`.claude/commands/${entry}`);
      }
    }
  } catch {
    // directory doesn't exist — nothing to clean
  }

  // 2. .claude/skills/reap.*/ (v0.15 legacy skill directories)
  const skillsDir = join(projectRoot, ".claude", "skills");
  try {
    const entries = await readdir(skillsDir);
    for (const entry of entries) {
      if (LEGACY_SKILL_PATTERN.test(entry)) {
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

/**
 * Remove legacy REAP SessionStart hooks from Claude Code settings.json.
 * Checks both project-level (.claude/settings.json) and user-level (~/.claude/settings.json).
 * Only removes hook entries whose command contains "session-start" or "reap".
 *
 * @returns list of settings files that were modified
 */
export async function cleanupLegacyHooks(projectRoot: string): Promise<string[]> {
  const modified: string[] = [];
  const settingsPaths = [
    join(projectRoot, ".claude", "settings.json"),
    join(homedir(), ".claude", "settings.json"),
  ];

  for (const settingsPath of settingsPaths) {
    try {
      const content = await readFile(settingsPath, "utf-8");
      const settings = JSON.parse(content);
      if (!settings.hooks) continue;

      let changed = false;
      for (const event of Object.keys(settings.hooks)) {
        const entries = settings.hooks[event];
        if (!Array.isArray(entries)) continue;

        const filtered = entries.filter((entry: { hooks?: { command?: string }[] }) => {
          if (!entry.hooks || !Array.isArray(entry.hooks)) return true;
          // Remove entries where any hook command references reap's session-start
          return !entry.hooks.some((h: { command?: string }) =>
            h.command && (h.command.includes("session-start") && h.command.includes("reap")),
          );
        });

        if (filtered.length !== entries.length) {
          settings.hooks[event] = filtered;
          if (filtered.length === 0) {
            delete settings.hooks[event];
          }
          changed = true;
        }
      }

      if (changed) {
        await writeFile(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf-8");
        modified.push(settingsPath);
      }
    } catch {
      // file doesn't exist or parse error — skip
    }
  }

  return modified;
}
