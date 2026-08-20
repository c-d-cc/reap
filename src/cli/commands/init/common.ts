import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";
import { readdir, copyFile, chmod } from "fs/promises";
import YAML from "yaml";
import type { ReapPaths } from "../../../core/paths.js";
import { readTextFile, writeTextFile, ensureDir, fileExists } from "../../../core/fs.js";
import { cleanupLegacyProjectSkills, cleanupLegacyHooks } from "../../../core/integrity.js";
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
export interface InitCommonResult {
  config: ReapConfig;
  ignoreAction: "created" | "appended" | "skipped" | "failed";
}

export async function initCommon(
  paths: ReapPaths,
  projectName: string,
): Promise<InitCommonResult> {
  // Clean up legacy project-level skills and hooks (from v0.15)
  await cleanupLegacyProjectSkills(paths.root);
  await cleanupLegacyHooks(paths.root);

  // Create directories
  await ensureDir(paths.genome);
  await ensureDir(paths.environment);
  await ensureDir(paths.environmentDomain);
  await ensureDir(paths.environmentResources);
  await ensureDir(paths.environmentDocs);
  await ensureDir(paths.life);
  await ensureDir(paths.backlog);
  await ensureDir(paths.lineage);
  await ensureDir(paths.vision);
  await ensureDir(paths.visionDesign);
  await ensureDir(paths.memory);
  await ensureDir(paths.hooks);

  // Write config
  const config: ReapConfig = {
    project: projectName,
    language: "english",
    autoSubagent: true,
    strictEdit: false,
    strictMerge: false,
    agentClient: "claude-code",
    autoUpdate: true,
    autoIssueReport: true,
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

  // Install default hook conditions and examples
  await installHookTemplates(paths.hooks);

  // reap-guide.md is installed to ~/.reap/ by install-skills (not per-project)

  // Write or append CLAUDE.md for AI agent session loading
  await ensureClaudeMd(paths.root, projectName);

  // The result is returned, not discarded: `reap update` reports a failure and
  // `reap init` was silently swallowing the same one, so a project created on
  // an unwritable `.gitignore` would commit its index with nothing said. The
  // caller decides how to surface it.
  const ignoreAction = await ensureIndexIgnored(paths.root);

  return { config, ignoreAction };
}

/** The gitignore entry REAP owns, and the line that explains it. */
const INDEX_IGNORE_ENTRY = ".reap/.index/";
const INDEX_IGNORE_BLOCK = `# REAP code index — derived, and self-referential if committed\n${INDEX_IGNORE_ENTRY}\n`;

/**
 * Does this line already ignore the whole index directory?
 *
 * Deliberately an equality test on the directory, not a prefix test. The first
 * version asked `startsWith(".reap/.index")`, which a line like
 * `.reap/.index/graph.json.gz` satisfies — so the one user most likely to have
 * a rule already (someone who saw the blob in `git status` and ignored that one
 * file) would be told nothing was needed while `manifest.json` went on being
 * committed. A permissive check failing open in the direction it guards is the
 * same shape as the defect it was written for.
 *
 * A negation (`!.reap/.index/keep`) is not an ignore rule and does not count.
 * It is also inert: git cannot re-include a file whose parent directory is
 * excluded, so adding the directory rule takes nothing away.
 */
function ignoresIndexDir(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed === "" || trimmed.startsWith("#") || trimmed.startsWith("!")) return false;
  const normalised = trimmed.replace(/^\/+/, "").replace(/\/+$/, "");
  return normalised === ".reap/.index";
}

/**
 * Make sure `.reap/.index/` is ignored.
 *
 * Not a nicety. `completion --phase commit` calls `gitCommitAll`, which is
 * `git add -A`, and then refreshes the index — so without this every
 * generation commits a changing binary blob, and the commit containing the
 * index has to be indexed, which is the loop the whole design avoids. Three
 * documents and five locales already told users REAP does this; gen-089
 * shipped them saying so and the code that would have made it true.
 *
 * Appends rather than rewrites, and leaves the file alone when a rule already
 * covers the directory — `.gitignore` belongs to the user.
 *
 * Never throws. The entry is an optimisation, not a precondition, and both
 * callers are commands that must keep working: `reap init` would otherwise
 * abandon a half-created `.reap/`, and `reap update` runs on the auto-update
 * and postinstall paths, where one unwritable unrelated file would take REAP
 * down with a raw EACCES instead of the JSON every command promises.
 */
export async function ensureIndexIgnored(root: string): Promise<"created" | "appended" | "skipped" | "failed"> {
  const gitignorePath = join(root, ".gitignore");
  try {
    const existing = await readTextFile(gitignorePath);

    if (existing === null) {
      await writeTextFile(gitignorePath, INDEX_IGNORE_BLOCK);
      return "created";
    }
    if (existing.split("\n").some(ignoresIndexDir)) {
      return "skipped";
    }
    const separator = existing.endsWith("\n") ? "\n" : "\n\n";
    await writeTextFile(gitignorePath, existing + separator + INDEX_IGNORE_BLOCK);
    return "appended";
  } catch {
    return "failed";
  }
}

/**
 * Read the CLAUDE.md REAP section template from dist/templates.
 */
export async function getClaudeMdSection(): Promise<string> {
  return (await readTextFile(distPath("claude-md-section.md"))) ?? "";
}

// ── CLAUDE.md REAP Section Sync ─────────────────────────────

const REAP_START_RE = /<!-- reap:start ([a-f0-9]+) -->/;
const REAP_END_MARKER = "<!-- reap:end -->";

/** Compute SHA256 hash (first 8 hex chars) of the REAP section content (excluding markers). */
export function computeSectionHash(content: string): string {
  return createHash("sha256").update(content.trim()).digest("hex").slice(0, 8);
}

/** Wrap REAP section content with start/end markers including a content hash. */
export function wrapWithMarkers(content: string): string {
  const hash = computeSectionHash(content);
  return `<!-- reap:start ${hash} -->\n${content.trimEnd()}\n<!-- reap:end -->`;
}

/**
 * Extract the REAP section from a CLAUDE.md file.
 * Returns { hash, startIdx, endIdx } if markers found, or null.
 */
export function extractReapSection(fileContent: string): { hash: string; startIdx: number; endIdx: number } | null {
  const startMatch = REAP_START_RE.exec(fileContent);
  if (!startMatch) return null;
  const endIdx = fileContent.indexOf(REAP_END_MARKER, startMatch.index);
  if (endIdx === -1) return null;
  return {
    hash: startMatch[1],
    startIdx: startMatch.index,
    endIdx: endIdx + REAP_END_MARKER.length,
  };
}

/**
 * Detect legacy REAP section (without markers) and return its boundaries.
 * Looks for a markdown heading containing "REAP" (e.g., "## REAP", "# REAP Project")
 * and extends to the end of the file (since REAP section was always appended last).
 */
/**
 * Find a pre-marker REAP section by its heading.
 *
 * A heading is required on purpose. Whatever this returns gets **replaced**, so
 * a looser test — say, any mention of `.reap/genome/` — would let a paragraph
 * that merely talks about REAP be mistaken for a section and overwritten along
 * with everything after it.
 *
 * `checkRequiredFiles` in core/integrity.ts asks a similar-looking question and
 * answers it more loosely. That asymmetry is deliberate: there, a wrong answer
 * costs a spurious warning; here, it costs the user's own text. See the note on
 * that function.
 */
function detectLegacyReapSection(fileContent: string): { startIdx: number; endIdx: number } | null {
  const legacyRe = /^(#{1,3}\s+.*REAP.*)/m;
  const match = legacyRe.exec(fileContent);
  if (!match) return null;
  // Legacy sections were always appended at the end, so take from heading to EOF
  return { startIdx: match.index, endIdx: fileContent.length };
}

// ── Init Conversation Prompt Builders ────────────────────────

export function buildPromptPreamble(): string {
  return `### RULES (never violate)
1. **One question per message.** Never list multiple questions in a single message.
2. **Prefer multiple choice.** Free input is a last resort.
3. **"skip" = move on immediately.** Write "N/A" in the relevant section and proceed.
4. **Do not advance past a GATE without confirmation.** Each Phase ends with user confirmation before the next begins.
5. **Always show drafts and get confirmation after writing.** No advancing to the next Phase without user approval.
6. **Speak the user's language.** After Phase 1 confirms the language, conduct all conversation in that language. Questions in this prompt are English templates — translate them naturally.
7. **Be concise.** Use short examples instead of long explanations.`;
}

export function buildSelfReviewBlock(): string {
  return `### Self-Review (perform internally, then report results to user)
After writing genome/application.md + invariants.md, check:
- No \`<!-- -->\` placeholder comments remaining?
- "TBD", "TODO", "N/A" only in sections the user explicitly skipped?
- No contradiction between Tech Stack and Architecture?
- invariants.md items do not conflict with application.md content?
- Each section has at least one concrete piece of content?
If issues found, report to user and suggest fixes.`;
}

export function buildHardGateBlock(): string {
  return `### <HARD-GATE> No generation before genome finalization
If genome/application.md has NOT been shown to the user and explicitly approved:
- Do NOT run or suggest \`reap run start\`.
- "Approved" means the user explicitly agreed after final review.
- Phrases like "looks good", "ok", "let's go with this" count as approval.
- If the user requests a generation before approval, respond:
  "The genome has not been finalized yet. Let's complete the review first."
</HARD-GATE>`;
}

export async function ensureClaudeMd(root: string, projectName: string): Promise<"created" | "appended" | "skipped" | "updated"> {
  const rawTemplate = await readTextFile(distPath("claude-md-section.md"));
  if (!rawTemplate) {
    return "skipped";
  }

  // Strip existing markers from template if present (template itself has markers for dogfooding reference)
  const templateContent = stripMarkers(rawTemplate);
  const wrappedSection = wrapWithMarkers(templateContent);
  const newHash = computeSectionHash(templateContent);

  // Check both locations
  const rootPath = join(root, "CLAUDE.md");
  const dotClaudePath = join(root, ".claude", "CLAUDE.md");

  const rootContent = await readTextFile(rootPath);
  const dotClaudeContent = await readTextFile(dotClaudePath);

  // Try to update each file that has a REAP section (marker-based or legacy)
  const result = await updateClaudeMdFile(rootPath, rootContent, newHash, wrappedSection);
  if (result) return result;

  const dotResult = await updateClaudeMdFile(dotClaudePath, dotClaudeContent, newHash, wrappedSection);
  if (dotResult) return dotResult;

  // No existing REAP section found — append or create
  if (dotClaudeContent) {
    await writeTextFile(dotClaudePath, dotClaudeContent.trimEnd() + "\n\n" + wrappedSection + "\n");
    return "appended";
  } else if (rootContent) {
    await writeTextFile(rootPath, rootContent.trimEnd() + "\n\n" + wrappedSection + "\n");
    return "appended";
  } else {
    await writeTextFile(rootPath, `# ${projectName}\n\n` + wrappedSection + "\n");
    return "created";
  }
}

/**
 * Strip reap markers from content, returning inner content only.
 */
function stripMarkers(content: string): string {
  const startMatch = REAP_START_RE.exec(content);
  if (!startMatch) return content;
  const afterStart = content.indexOf("\n", startMatch.index);
  if (afterStart === -1) return content;
  const endIdx = content.indexOf(REAP_END_MARKER, afterStart);
  if (endIdx === -1) return content;
  return content.slice(afterStart + 1, endIdx).trimEnd();
}

/**
 * Check a single CLAUDE.md file for REAP section and update if needed.
 * Returns action taken, or null if no REAP section found in this file.
 */
async function updateClaudeMdFile(
  filePath: string,
  content: string | null,
  newHash: string,
  wrappedSection: string,
): Promise<"skipped" | "updated" | null> {
  if (!content) return null;

  // Check for marker-based section
  const markerSection = extractReapSection(content);
  if (markerSection) {
    if (markerSection.hash === newHash) {
      return "skipped";
    }
    // Replace marker section
    const before = content.slice(0, markerSection.startIdx);
    const after = content.slice(markerSection.endIdx);
    await writeTextFile(filePath, before + wrappedSection + after);
    return "updated";
  }

  // Check for legacy section (no markers)
  const legacy = detectLegacyReapSection(content);
  if (legacy) {
    const before = content.slice(0, legacy.startIdx);
    const after = content.slice(legacy.endIdx);
    await writeTextFile(filePath, before.trimEnd() + "\n\n" + wrappedSection + after);
    return "updated";
  }

  return null;
}

/**
 * Install default hook conditions and example hooks from templates.
 * Only copies files that don't already exist (never overwrites user hooks).
 */
async function installHookTemplates(hooksDir: string): Promise<void> {
  const templateDir = distPath("hooks");
  const conditionsTemplateDir = join(templateDir, "conditions");
  const conditionsDir = join(hooksDir, "conditions");

  await ensureDir(conditionsDir);

  // Copy condition scripts
  try {
    const conditionFiles = await readdir(conditionsTemplateDir);
    for (const file of conditionFiles) {
      const dest = join(conditionsDir, file);
      if (!(await fileExists(dest))) {
        await copyFile(join(conditionsTemplateDir, file), dest);
        await chmod(dest, 0o755);
      }
    }
  } catch { /* template dir may not exist */ }

  // Copy example hooks
  try {
    const hookFiles = await readdir(templateDir);
    for (const file of hookFiles) {
      if (!file.endsWith(".example")) continue;
      const dest = join(hooksDir, file);
      if (!(await fileExists(dest))) {
        await copyFile(join(templateDir, file), dest);
      }
    }
  } catch { /* template dir may not exist */ }
}
