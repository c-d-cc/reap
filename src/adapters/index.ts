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
import { readFile, writeFile, rm, rmdir } from "fs/promises";
import YAML from "yaml";
import type { AdapterModule, UserLevelRemovalResult } from "./types.js";
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

// reap:carrier(reap-home-asset-set)
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

/**
 * Everything REAP itself puts in `~/.reap/`, named one by one.
 *
 * An allowlist, not a sweep, and the difference is not theoretical: the
 * directory on the machine this was written on also held a user's private key
 * (`reap-portal.*.pem`), which REAP did not create and has no business
 * deleting. `rm -rf ~/.reap` would have taken it.
 *
 * A blocklist would not help either — it can only avoid the user files that
 * exist today, and this is a directory named after the tool, so people put
 * things in it. Anything absent from this list survives by default, which is
 * the safe direction to be wrong in.
 *
 * `daemon/` is stale data no version of REAP writes any more. It is listed so
 * that a machine still carrying it gets it cleaned up; `reap update` removes
 * the same directory for users who are staying.
 *
 * reap:carrier(reap-home-asset-set)
 */
const REAP_HOME_ENTRIES = ["reap-guide.md", ".install-stamp", "daemon"] as const;

/**
 * Remove the client-agnostic half of REAP's user-level footprint.
 *
 * Kept out of the adapters because none of it is client-specific and `reap
 * uninstall` sweeps every adapter — doing it per-adapter would mean doing it
 * once per client for no gain.
 *
 * The `~/.reap` directory itself is left alone. It is removed only if this
 * leaves it empty, so that whatever else a user keeps there stays where they
 * put it.
 */
export async function removeReapHomeAssets(
  home: string = homedir(),
): Promise<UserLevelRemovalResult> {
  const reapHome = join(home, ".reap");
  const removed: string[] = [];
  const kept: string[] = [];

  let entries: string[];
  try {
    const { readdir } = await import("fs/promises");
    entries = await readdir(reapHome);
  } catch {
    return { removed, kept };
  }

  for (const entry of entries) {
    if (!(REAP_HOME_ENTRIES as readonly string[]).includes(entry)) {
      kept.push(join(reapHome, entry));
      continue;
    }
    try {
      await rm(join(reapHome, entry), { recursive: true, force: true });
      removed.push(join(reapHome, entry));
    } catch {
      kept.push(join(reapHome, entry));
    }
  }

  if (kept.length === 0) {
    // `rmdir`, not `rm -r`. It refuses on a non-empty directory, which is
    // exactly the guarantee wanted here: if anything appeared between the
    // listing above and this line, it survives. A recursive delete would be
    // the one operation in this file capable of taking a user's files, and it
    // would be guarded only by a check made a moment earlier.
    try {
      await rmdir(reapHome);
      removed.push(reapHome);
    } catch {
      // Not empty, or unwritable. Leaving it costs nothing — at worst an
      // empty directory stays behind.
    }
  }

  return { removed, kept };
}

export type { AdapterModule } from "./types.js";
