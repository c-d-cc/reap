/**
 * Adapter dispatcher — selects the correct adapter module based on the
 * `agentClient` config value.
 *
 * Usage:
 *   const adapter = getAdapter(config.agentClient);
 *   await adapter.installSkills(projectRoot);
 */
import { join } from "path";
import { homedir } from "os";
import { readFile, writeFile } from "fs/promises";
import YAML from "yaml";
import type { AdapterModule } from "./types.js";
import { claudeCodeAdapter } from "./claude-code/index.js";
import { opencodeAdapter } from "./opencode/index.js";
import { ensureDir } from "../core/fs.js";
import type { ReapConfig } from "../types/index.js";

export type AgentClient = "claude-code" | "opencode" | "codex";

/**
 * Resolve adapter for the given agentClient value.
 * Falls back to claude-code when value is unknown/undefined (defensive).
 * Throws for `codex` (explicitly out of scope until separate adapter is implemented).
 */
export function getAdapter(agentClient: AgentClient | string | undefined): AdapterModule {
  switch (agentClient) {
    case "claude-code":
    case undefined:
    case "":
      return claudeCodeAdapter;
    case "opencode":
      return opencodeAdapter;
    case "codex":
      throw new Error(
        "agentClient 'codex' is not yet supported. " +
        "Only 'claude-code' and 'opencode' are implemented. " +
        "See https://github.com/c-d-cc/reap/issues for tracking.",
      );
    default:
      // Unknown value — defensive fallback to claude-code rather than crashing.
      // (The config schema should have caught it; this is belt-and-suspenders.)
      return claudeCodeAdapter;
  }
}

/**
 * Read `agentClient` from the project at `cwd`, if there is one.
 *
 * Returns `undefined` outside a REAP project or when the config is unreadable —
 * `getAdapter` treats that as claude-code, which is the pre-adapter default and
 * what `postinstall` has always installed.
 */
export async function resolveAgentClient(
  cwd: string,
): Promise<ReapConfig["agentClient"] | undefined> {
  try {
    const raw = await readFile(join(cwd, ".reap", "config.yml"), "utf-8");
    return (YAML.parse(raw) as ReapConfig | null)?.agentClient;
  } catch {
    return undefined;
  }
}

/**
 * Records which REAP version last installed user-level assets, per client.
 *
 *   { "claude-code": "0.17.5", "opencode": "0.17.5" }
 *
 * Keyed by client so that alternating between a claude-code project and an
 * opencode one does not re-copy both sets on every command.
 */
type InstallStamp = Record<string, string>;

export function installStampPath(home: string = homedir()): string {
  return join(home, ".reap", ".install-stamp");
}

async function readStamp(path: string): Promise<InstallStamp> {
  try {
    const parsed = JSON.parse(await readFile(path, "utf-8"));
    return parsed && typeof parsed === "object" ? (parsed as InstallStamp) : {};
  } catch {
    return {};
  }
}

/**
 * Make sure this machine has the user-level assets the current REAP version
 * expects, installing them if it does not.
 *
 * Until gen-087 the only thing that ever installed them was
 * `scripts/postinstall.sh`. npm 12 blocks install scripts for global installs
 * by default, which left the binary working and the entire agent integration
 * absent — no slash commands, no agent definitions, no reap-guide, no
 * SessionStart hook, and no error to say so. The user's documented next step is
 * `/reap.init`, itself one of the missing files, so nothing they could read
 * would have led them out of it.
 *
 * The trigger is therefore the CLI entry point rather than a chosen set of
 * commands: what a user in that state has is the `reap` binary, so running it
 * at all has to be enough. Picking three commands would only mean deciding
 * again, later, whether a fourth belongs.
 *
 * The stamp keeps the cost at one small file read once the assets are current.
 * That matters beyond speed — the test helpers do not isolate `HOME`, so an
 * unconditional re-copy would rewrite the developer's own `~/.claude/` on every
 * CLI call a test suite makes. It also covers upgrades, which npm 12 blocks the
 * postinstall for just as it does first installs.
 *
 * Never throws and never writes to stdout: a failure here must not take down
 * the command the user actually asked for. The stamp is written only when the
 * adapter reports every piece landed — `"partial"` and `"failed"` both leave it
 * alone so the next invocation tries again. Recording a partial install as done
 * would reproduce the very shape this exists to remove: working binary, missing
 * integration, no error.
 */
export async function ensureUserLevelAssets(opts: {
  cwd: string;
  version: string;
  home?: string;
}): Promise<"synced" | "partial" | "current" | "failed"> {
  try {
    const home = opts.home ?? homedir();
    const client = (await resolveAgentClient(opts.cwd)) ?? "claude-code";
    const adapter = getAdapter(client);

    const stampPath = installStampPath(home);
    const stamp = await readStamp(stampPath);
    if (stamp[adapter.id] === opts.version) return "current";

    const result = await adapter.syncUserLevelAssets(home);

    // Stamping a partial install would make it permanent: nothing retries at
    // the same version. The individual installers swallow their own failures
    // (an unwritable directory, a settings.json that will not parse), so a
    // returned promise is not evidence. Leaving the stamp unwritten costs a
    // repeated copy on the next command and keeps the repair reachable.
    if (!result.complete) return "partial";

    stamp[adapter.id] = opts.version;
    await ensureDir(join(home, ".reap"));
    await writeFile(stampPath, JSON.stringify(stamp, null, 2) + "\n", "utf-8");
    return "synced";
  } catch {
    // Unknown client, unreadable HOME, read-only filesystem — none of these are
    // the user's command, and none of them should stop it.
    return "failed";
  }
}

export type { AdapterModule } from "./types.js";
