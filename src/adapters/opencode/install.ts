import { cp, readFile, writeFile, readdir, unlink } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";
import { createHash } from "crypto";
import { readTextFile, writeTextFile, ensureDir, fileExists } from "../../core/fs.js";
import { emitOutput } from "../../core/output.js";
import type { IntegrationAction } from "../types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Resolve a source asset directory (templates / plugin source) for both bundled
 * (dist/) and dev (src/) runtime.
 *   - Bundled: dist/cli/index.js → __dirname = dist/cli → assets at
 *     dist/adapters/opencode/{plugin,templates}/
 *   - Dev (bun): __dirname = src/adapters/opencode → assets co-located.
 */
function assetPath(...segments: string[]): string {
  return __dirname.includes("dist")
    ? join(__dirname, "..", "adapters", "opencode", ...segments)
    : join(__dirname, ...segments);
}

const PLUGIN_FILENAME = "reap-plugin.ts";
const PLUGIN_SRC = assetPath("plugin", PLUGIN_FILENAME);
const AGENTS_TEMPLATE = assetPath("templates", "agents.md");

// Files/entries that REAP guarantees to be present in opencode.json.
// User-added entries are preserved verbatim; REAP only ensures these exist
// and de-duplicates.
export const REAP_INSTRUCTIONS: readonly string[] = [
  ".reap/genome/application.md",
  ".reap/genome/evolution.md",
  ".reap/genome/invariants.md",
  ".reap/environment/summary.md",
  ".reap/vision/goals.md",
  ".reap/vision/memory/longterm.md",
  ".reap/vision/memory/midterm.md",
  ".reap/vision/memory/shortterm.md",
  ".reap/.session-state.md",
];

export const REAP_PLUGIN_ENTRY = "./.opencode/plugins/reap-plugin.ts";

// AGENTS.md marker (mirrors CLAUDE.md marker pattern from init/common.ts).
const REAP_START_RE = /<!-- reap:start ([a-f0-9]+) -->/;
const REAP_END_MARKER = "<!-- reap:end -->";

export function computeSectionHash(content: string): string {
  return createHash("sha256").update(content.trim()).digest("hex").slice(0, 8);
}

export function wrapWithMarkers(content: string): string {
  const hash = computeSectionHash(content);
  return `<!-- reap:start ${hash} -->\n${content.trimEnd()}\n<!-- reap:end -->`;
}

export function extractReapSection(
  fileContent: string,
): { hash: string; startIdx: number; endIdx: number } | null {
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

function detectLegacyReapSection(
  fileContent: string,
): { startIdx: number; endIdx: number } | null {
  // Match a markdown heading line containing "REAP" — same heuristic as
  // ensureClaudeMd's legacy detection. AGENTS.md legacy sections are uncommon
  // (new file in this generation), but we keep parity.
  const legacyRe = /^(#{1,3}\s+.*REAP.*)/m;
  const match = legacyRe.exec(fileContent);
  if (!match) return null;
  return { startIdx: match.index, endIdx: fileContent.length };
}

/**
 * Read the AGENTS.md template (inner content only — markers added on write).
 * Returns null if the template asset is missing (e.g., broken bundle).
 */
export async function getAgentsMdTemplate(): Promise<string | null> {
  return await readTextFile(AGENTS_TEMPLATE);
}

/**
 * Ensure project-root AGENTS.md exists and contains the REAP section.
 * Mirrors `ensureClaudeMd` semantics:
 *   - marker present + hash matches → skipped
 *   - marker present + hash differs → updated
 *   - legacy heading found          → updated (replaces legacy)
 *   - no REAP section but file exists → appended
 *   - file absent                   → created
 */
export async function ensureAgentsMd(
  projectRoot: string,
  projectName: string,
): Promise<IntegrationAction> {
  const rawTemplate = await getAgentsMdTemplate();
  if (!rawTemplate) return "skipped";

  // Template may itself be wrapped in markers if used for dogfooding — strip.
  const inner = stripMarkers(rawTemplate);
  const wrapped = wrapWithMarkers(inner);
  const newHash = computeSectionHash(inner);

  const agentsPath = join(projectRoot, "AGENTS.md");
  const existing = await readTextFile(agentsPath);

  if (!existing) {
    await writeTextFile(agentsPath, `# ${projectName}\n\n${wrapped}\n`);
    return "created";
  }

  // Marker-based section?
  const markerSection = extractReapSection(existing);
  if (markerSection) {
    if (markerSection.hash === newHash) return "skipped";
    const before = existing.slice(0, markerSection.startIdx);
    const after = existing.slice(markerSection.endIdx);
    await writeTextFile(agentsPath, before + wrapped + after);
    return "updated";
  }

  // Legacy heading-based section?
  const legacy = detectLegacyReapSection(existing);
  if (legacy) {
    const before = existing.slice(0, legacy.startIdx);
    const after = existing.slice(legacy.endIdx);
    await writeTextFile(agentsPath, before.trimEnd() + "\n\n" + wrapped + after);
    return "updated";
  }

  // No REAP section at all — append.
  await writeTextFile(agentsPath, existing.trimEnd() + "\n\n" + wrapped + "\n");
  return "appended";
}

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
 * Ensure project-root `opencode.json` contains REAP-managed instructions and
 * plugin entries. User-supplied fields (including custom instructions/plugins)
 * are preserved verbatim. Returns:
 *   - "created" — file did not exist, REAP created it
 *   - "updated" — file existed, REAP added missing entries
 *   - "skipped" — file existed and already contained all REAP entries
 */
export async function ensureOpencodeJson(
  projectRoot: string,
): Promise<IntegrationAction> {
  const path = join(projectRoot, "opencode.json");
  const existed = await fileExists(path);

  let cfg: Record<string, unknown> = {};
  if (existed) {
    try {
      const raw = await readFile(path, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        cfg = parsed as Record<string, unknown>;
      }
    } catch {
      // Unparseable JSON — treat as empty. Preserve original file by NOT
      // touching it: emit "skipped" to avoid clobbering the user's broken file.
      // (User can fix and re-run.)
      return "skipped";
    }
  }

  const before = JSON.stringify(cfg);

  const prevInstructions = Array.isArray(cfg.instructions)
    ? (cfg.instructions as unknown[]).filter((x): x is string => typeof x === "string")
    : [];
  const prevPlugins = Array.isArray(cfg.plugin)
    ? (cfg.plugin as unknown[]).filter((x): x is string => typeof x === "string")
    : [];

  // Append REAP entries that are not already present (preserve user order).
  const instructions = [...prevInstructions];
  for (const item of REAP_INSTRUCTIONS) {
    if (!instructions.includes(item)) instructions.push(item);
  }
  const plugin = [...prevPlugins];
  if (!plugin.includes(REAP_PLUGIN_ENTRY)) plugin.push(REAP_PLUGIN_ENTRY);

  const next: Record<string, unknown> = {
    $schema: cfg.$schema ?? "https://opencode.ai/config.json",
    ...cfg,
    instructions,
    plugin,
  };

  const after = JSON.stringify(next);
  if (existed && before === after) return "skipped";

  await writeFile(path, JSON.stringify(next, null, 2) + "\n", "utf-8");
  return existed ? "updated" : "created";
}

/**
 * Copy the bundled reap-plugin.ts source to `.opencode/plugins/reap-plugin.ts`.
 */
export async function installPluginFile(projectRoot: string): Promise<void> {
  const pluginsDir = join(projectRoot, ".opencode", "plugins");
  await ensureDir(pluginsDir);
  if (await fileExists(PLUGIN_SRC)) {
    await cp(PLUGIN_SRC, join(pluginsDir, PLUGIN_FILENAME));
  }
}

/**
 * Install reap-guide.md to `~/.reap/` (shared between adapters — same logic
 * as claude-code installer; duplicated to avoid cross-adapter import).
 */
async function installReapGuide(): Promise<void> {
  const reapHome = join(homedir(), ".reap");
  await ensureDir(reapHome);
  const templateDir = __dirname.includes("dist")
    ? join(__dirname, "..", "..", "templates")
    : join(__dirname, "..", "..", "templates");
  const src = join(templateDir, "reap-guide.md");
  if (await fileExists(src)) {
    await cp(src, join(reapHome, "reap-guide.md"));
  }
}

// ── slash commands installation ─────────────────────────────────────────────

/**
 * Pattern for REAP-managed slash command files: `reap.<name>.md`.
 * The `reap.` prefix (with the literal dot) is reserved by REAP. Variants such
 * as `reapdev.*`, `reap-x.*`, or `myreap.*` are user space and never matched.
 * (Mirrors the Claude Code adapter's SKILL_PATTERN — identical semantics across
 * adapters.)
 */
const SLASH_COMMAND_PATTERN = /^reap\..+\.md$/;

/**
 * Resolve the directory holding the Claude Code skill `.md` files. The same
 * skill files are used as OpenCode slash commands (format is compatible:
 * frontmatter `description` + body + `$ARGUMENTS`).
 *
 *   - Bundled: __dirname = dist/cli (single bundle, even though this code
 *     conceptually lives under adapters/opencode). Skills are copied by the
 *     build script to dist/adapters/claude-code/skills/.
 *   - Dev (bun runtime): __dirname = src/adapters/opencode. Sibling skills
 *     dir = ../claude-code/skills.
 */
function claudeCodeSkillsDir(): string {
  return __dirname.includes("dist")
    ? join(__dirname, "..", "adapters", "claude-code", "skills")
    : join(__dirname, "..", "claude-code", "skills");
}

/**
 * User-level OpenCode commands directory.
 * Per https://opencode.ai/docs/commands/, OpenCode reads markdown commands
 * from `~/.config/opencode/commands/` (global) or `.opencode/commands/`
 * (per-project). REAP installs globally to match the Claude Code adapter's
 * `~/.claude/commands/` parity model.
 */
export function opencodeCommandsDir(home: string = homedir()): string {
  return join(home, ".config", "opencode", "commands");
}

/**
 * Install REAP-managed slash command files into the user's OpenCode commands
 * directory. The flow is cleanup-then-copy, identical in shape to the Claude
 * Code adapter's `installSkills`:
 *
 *   1. Ensure target dir exists.
 *   2. Remove every existing file matching `reap.*.md` (so a removed or
 *      renamed REAP command does not leave a stale entry on the user's
 *      machine).
 *   3. Copy every `.md` from the Claude Code skills directory.
 *
 * User-supplied commands that do NOT start with `reap.` (e.g., `mytool.md`,
 * `reapdev.publish.md`) are never touched.
 *
 * @returns counts + the target directory used (for tests/logging).
 */
export async function installSlashCommands(
  home: string = homedir(),
): Promise<{ cleaned: number; installed: number; targetDir: string }> {
  const targetDir = opencodeCommandsDir(home);
  await ensureDir(targetDir);

  // Cleanup stale REAP commands.
  let cleaned = 0;
  try {
    const existing = await readdir(targetDir);
    for (const file of existing) {
      if (SLASH_COMMAND_PATTERN.test(file)) {
        await unlink(join(targetDir, file));
        cleaned++;
      }
    }
  } catch {
    // Empty / missing target — nothing to clean.
  }

  // Copy fresh skills.
  let installed = 0;
  const srcDir = claudeCodeSkillsDir();
  try {
    const sources = await readdir(srcDir);
    for (const file of sources) {
      if (!file.endsWith(".md")) continue;
      await cp(join(srcDir, file), join(targetDir, file));
      installed++;
    }
  } catch {
    // Source dir missing — broken bundle. Surface zero installs rather than
    // throw, so install-skills emits a useful "0 installed" instead of failing
    // the whole flow (downstream e2e will catch it).
  }

  return { cleaned, installed, targetDir };
}

// ── agent definitions installation ──────────────────────────────────────────

/**
 * Pattern for REAP-managed agent definition files: `reap-<name>.md` (note the
 * **hyphen**, not the dot used by slash commands). Prefix-anchored so any user
 * agent (e.g. `my-tool.md`, `reapdev-review.md`) survives cleanup.
 */
const AGENT_PATTERN = /^reap-.+\.md$/;

/**
 * Resolve the directory holding REAP's bundled agent definition templates
 * (`src/templates/agents/`). Same dist/dev split as `claudeCodeSkillsDir`.
 *
 *   - Bundled: __dirname = dist/cli (single bundle). Agents copied by the
 *     build script to `dist/templates/agents/`.
 *   - Dev (bun runtime): __dirname = src/adapters/opencode. Templates dir =
 *     `../../templates/agents`.
 */
function agentsTemplateDir(): string {
  return __dirname.includes("dist")
    ? join(__dirname, "..", "templates", "agents")
    : join(__dirname, "..", "..", "templates", "agents");
}

/**
 * User-level OpenCode agent definitions directory.
 *
 * OpenCode discovers agent definitions from `agent/` (singular) or `agents/`
 * (plural) under either `.opencode/` (project) or `~/.config/opencode/`
 * (global). The TUI's own tip uses the singular form
 *   ("Add .md files to .opencode/agent/ for specialized AI personas")
 * so REAP installs into the singular `agent/` to match upstream's stated
 * preference. The plural `commands/` directory used by slash commands is a
 * separate OpenCode convention — naming is asymmetric (commands plural,
 * agents singular) but that is OpenCode's choice, not ours.
 */
export function opencodeAgentsDir(home: string = homedir()): string {
  return join(home, ".config", "opencode", "agent");
}

/**
 * Install REAP-managed agent definition files into the user's OpenCode agents
 * directory. Idempotent cleanup-then-copy, prefix-anchored on `reap-*.md`.
 *
 * Called from both `installSkills` and `registerSessionIntegration` so users
 * who only run `reap update` (no `reap install-skills`) still receive bundled
 * agent updates. This mirrors the gen-064 longterm lesson applied to the
 * claude-code adapter — without the `registerSessionIntegration` caller, agent
 * files stale between REAP versions.
 *
 * @returns `{ cleaned, installed, targetDir }` for the caller's report.
 */
export async function installAgents(
  home: string = homedir(),
): Promise<{ cleaned: number; installed: number; targetDir: string }> {
  const targetDir = opencodeAgentsDir(home);
  await ensureDir(targetDir);

  // Cleanup stale REAP agents.
  let cleaned = 0;
  try {
    const existing = await readdir(targetDir);
    for (const file of existing) {
      if (AGENT_PATTERN.test(file)) {
        await unlink(join(targetDir, file));
        cleaned++;
      }
    }
  } catch {
    // Empty / missing target — nothing to clean.
  }

  // Copy fresh agents.
  let installed = 0;
  const srcDir = agentsTemplateDir();
  try {
    const sources = await readdir(srcDir);
    for (const file of sources) {
      if (!file.endsWith(".md")) continue;
      await cp(join(srcDir, file), join(targetDir, file));
      installed++;
    }
  } catch {
    // Source dir missing — broken bundle. Surface zero installs rather than
    // throw; downstream e2e will catch a 0-install regression.
  }

  return { cleaned, installed, targetDir };
}

/**
 * Adapter entry — install user-level + project-level OpenCode integration:
 *   - copy plugin source to .opencode/plugins/
 *   - ensure opencode.json has REAP instructions + plugin entry
 *   - install ~/.reap/reap-guide.md
 *   - install ~/.config/opencode/commands/reap.*.md slash commands
 *   - install ~/.config/opencode/agent/reap-*.md agent definitions  ← gen-066
 *
 * Does NOT touch AGENTS.md — that is handled by `ensureProjectIntegration`
 * via the dispatcher (uniform with claude-code's CLAUDE.md flow).
 */
export async function installSkills(projectRoot: string): Promise<void> {
  await installPluginFile(projectRoot);
  const opencodeJsonAction = await ensureOpencodeJson(projectRoot);
  await installReapGuide();
  const slashCommands = await installSlashCommands();
  const agents = await installAgents();

  emitOutput({
    status: "ok",
    command: "install-skills",
    completed: [
      "install-plugin",
      "ensure-opencode-json",
      "install-reap-guide",
      "install-slash-commands",
      "install-agents",
    ],
    context: {
      agentClient: "opencode",
      pluginPath: join(projectRoot, ".opencode", "plugins", PLUGIN_FILENAME),
      opencodeJson: opencodeJsonAction,
      slashCommands: {
        cleaned: slashCommands.cleaned,
        installed: slashCommands.installed,
        targetDir: slashCommands.targetDir,
      },
      agents: {
        cleaned: agents.cleaned,
        installed: agents.installed,
        targetDir: agents.targetDir,
      },
    },
    message:
      `OpenCode integration installed (opencode.json: ${opencodeJsonAction}, ` +
      `slash commands: ${slashCommands.installed} installed, ` +
      `${slashCommands.cleaned} cleaned; ` +
      `agents: ${agents.installed} installed, ${agents.cleaned} cleaned).`,
  });
}

/**
 * `registerSessionIntegration` for OpenCode ensures project-level wiring
 * (plugin file + opencode.json) AND user-level slash commands + agent
 * definitions are up to date. Called by `reap update` — must keep the user's
 * OpenCode environment in sync with the bundled REAP version every time the
 * project is updated.
 *
 *   - `installPluginFile`    → `.opencode/plugins/reap-plugin.ts` (project)
 *   - `ensureOpencodeJson`   → `opencode.json` instructions + plugin entries
 *   - `installSlashCommands` → `~/.config/opencode/commands/reap.*.md`
 *   - `installAgents`        → `~/.config/opencode/agent/reap-*.md`  ← gen-066
 *
 * Both user-level syncs are idempotent and prefix-anchored. User-supplied
 * files are preserved on every run. The reap-guide.md install is intentionally
 * skipped here — that is bundled with the npm package's `postinstall` and the
 * explicit `install-skills` flow, not with per-project `update`.
 */
export async function registerSessionIntegration(projectRoot: string): Promise<void> {
  await installPluginFile(projectRoot);
  await ensureOpencodeJson(projectRoot);
  await installSlashCommands();
  await installAgents();
}
