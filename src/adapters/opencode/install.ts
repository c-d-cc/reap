import { cp, readFile, writeFile } from "fs/promises";
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

/**
 * Adapter entry — install user-level + project-level OpenCode integration:
 *   - copy plugin source to .opencode/plugins/
 *   - ensure opencode.json has REAP instructions + plugin entry
 *   - install ~/.reap/reap-guide.md
 *
 * Does NOT touch AGENTS.md — that is handled by `ensureProjectIntegration`
 * via the dispatcher (uniform with claude-code's CLAUDE.md flow).
 */
export async function installSkills(projectRoot: string): Promise<void> {
  await installPluginFile(projectRoot);
  const opencodeJsonAction = await ensureOpencodeJson(projectRoot);
  await installReapGuide();

  emitOutput({
    status: "ok",
    command: "install-skills",
    completed: ["install-plugin", "ensure-opencode-json", "install-reap-guide"],
    context: {
      agentClient: "opencode",
      pluginPath: join(projectRoot, ".opencode", "plugins", PLUGIN_FILENAME),
      opencodeJson: opencodeJsonAction,
    },
    message: `OpenCode integration installed (opencode.json: ${opencodeJsonAction}).`,
  });
}

/**
 * `registerSessionIntegration` for OpenCode is the same as `installSkills`
 * minus the user-level reap-guide step — it ensures the project-level wiring
 * (plugin file + opencode.json) is in place. Idempotent and silent on success.
 */
export async function registerSessionIntegration(projectRoot: string): Promise<void> {
  await installPluginFile(projectRoot);
  await ensureOpencodeJson(projectRoot);
}
