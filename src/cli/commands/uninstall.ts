import { execFileSync } from "child_process";
import { realpathSync } from "fs";
import { readFileSync } from "fs";
import { homedir } from "os";
import { basename, dirname, join } from "path";
import { fileURLToPath } from "url";
import { emitOutput } from "../../core/output.js";
import { claudeCodeAdapter } from "../../adapters/claude-code/index.js";
import { opencodeAdapter } from "../../adapters/opencode/index.js";
import { removeReapHomeAssets } from "../../adapters/index.js";
import {
  DAEMON_PACKAGE,
  resolveDaemonAvailability,
  stopDaemonIfRunning,
} from "./daemon/client.js";

/**
 * `reap uninstall` — the removal path npm does not provide.
 *
 * npm runs no code at uninstall time. `preuninstall` and `postuninstall` are
 * still in its documentation and were measured not to fire, on npm 10.9.4
 * (global and local) and npm 12.0.2 (global); the same probe script fired on
 * install, so the absence proves itself. Everything REAP writes to the home
 * directory is written by REAP's own code from `postinstall`, and npm knows
 * nothing about any of it — it removes the package directory and the bin
 * symlink and stops there.
 *
 * So the execution has to come from this side. The user types one command and
 * this does the whole sequence, including handing the package to npm at the
 * end. The order is not decoration:
 *
 *   1. skip the entry hook — `ensureUserLevelAssets` runs before every command
 *      and would reinstall what is about to be deleted (see `src/cli/index.ts`)
 *   2. stop the daemon — it stays resident for thirty idle minutes and rewrites
 *      `~/.reap/daemon/` while it runs
 *   3. remove the home assets — both clients, then the client-agnostic ones
 *   4. hand the packages to npm
 *
 * Step 4 removes the package this process is running from. On unix that works:
 * node has already read the bundle and npm is not deleting the interpreter.
 * Windows may refuse on a file lock, and that is survivable — everything that
 * matters happened in step 3, and the output hands over the command to run.
 */

/** How this copy of REAP got onto the machine. */
export type InstallKind = "global" | "npx" | "local" | "checkout" | "unknown";

export interface UninstallDeps {
  home?: string;
  /** Where this module is running from. Injected so tests need no install. */
  moduleDir?: string;
  /** `npm root -g`, or null when npm cannot be asked. */
  npmGlobalRoot?: () => string | null;
  /** Resolve a path through symlinks. See `sameDirectory`. */
  realpath?: (path: string) => string;
  /** Read a `package.json` name field; null when unreadable. */
  readPackageName?: (packageJsonPath: string) => string | null;
  /** Hand the package list to npm. Seam so tests can assert the arguments. */
  runNpmUninstall?: (packages: string[]) => { ok: boolean; error?: string };
  /**
   * Stop a running daemon. Seam for the same reason as the npm one: a test
   * that faked only `HOME` would still reach the developer's daemon on the
   * default port, because the port is the other isolation axis and `HOME`
   * does not cover it. Out-of-process callers set `REAP_DAEMON_PORT`.
   */
  stopDaemon?: () => Promise<number | null>;
}

/**
 * Are these two paths the same directory?
 *
 * Compared through `realpath` because they arrive by different routes and can
 * spell the same place differently. `npm root -g` echoes the configured prefix
 * verbatim, while node resolves the bin symlink it was launched through, so on
 * macOS one says `/var/folders/...` and the other `/private/var/folders/...`
 * for one directory. Without this a genuine global install is judged "not
 * global" every time and npm is never called — the failure being silence, which
 * is the shape this whole command exists to remove.
 *
 * Not macOS-specific: it holds anywhere the path to the install runs through a
 * symlink, which is the normal arrangement for a version manager.
 */
function sameDirectory(a: string, b: string, resolvePath: (p: string) => string): boolean {
  const norm = (p: string) => {
    try {
      return resolvePath(p);
    } catch {
      return p;
    }
  };
  return norm(a) === norm(b);
}

/**
 * Walk up from a directory to the package root that owns it — the nearest
 * ancestor whose `package.json` names this package.
 *
 * Returns null rather than guessing. A guess here would be handed to
 * `npm uninstall -g`.
 */
export function findPackageRoot(
  startDir: string,
  packageName: string,
  readName: (p: string) => string | null,
): string | null {
  let dir = startDir;
  for (let i = 0; i < 12; i++) {
    if (readName(join(dir, "package.json")) === packageName) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Decide whether npm may be told to uninstall, and be conservative about it.
 *
 * `npm uninstall -g` acts on the machine, not on this directory, so being wrong
 * in the permissive direction means deleting an installation the user did not
 * ask about. Only a package root sitting directly in npm's own global root
 * earns a yes. Everything else is named and reported, and the command to run is
 * printed instead:
 *
 *   - `npx` — the copy running is a throwaway in npm's `_npx` cache, and
 *     whether a global install also exists is not visible from here. This is
 *     the recovery path for someone who already removed REAP, so usually there
 *     is nothing to uninstall at all.
 *   - `local` — a project dependency. A global uninstall would hit someone
 *     else's install entirely.
 *   - `checkout` — a source tree. npm does not manage it.
 *   - `unknown` — npm could not be asked, or the package root was not found.
 */
export function detectInstallKind(deps: UninstallDeps = {}): {
  kind: InstallKind;
  packageRoot: string | null;
} {
  const here = deps.moduleDir ?? dirname(fileURLToPath(import.meta.url));
  const readName = deps.readPackageName ?? readPackageName;
  const resolvePath = deps.realpath ?? realpathSync;

  const packageRoot = findPackageRoot(here, REAP_PACKAGE, readName);
  if (packageRoot === null) return { kind: "unknown", packageRoot: null };

  // `<something>/node_modules/@c-d-cc/reap` → the containing node_modules is
  // two levels up because the name is scoped.
  const containingNodeModules = dirname(dirname(packageRoot));
  const inNodeModules = basename(containingNodeModules) === "node_modules";

  if (!inNodeModules) return { kind: "checkout", packageRoot };
  if (packageRoot.includes("_npx")) return { kind: "npx", packageRoot };

  const globalRoot = (deps.npmGlobalRoot ?? npmGlobalRoot)();
  if (globalRoot === null) return { kind: "unknown", packageRoot };
  if (sameDirectory(globalRoot, containingNodeModules, resolvePath)) {
    return { kind: "global", packageRoot };
  }
  return { kind: "local", packageRoot };
}

/**
 * REAP's own package name, as npm knows it.
 *
 * It has to be a literal — it is what identifies the package root while
 * walking up from this module, so it cannot be read out of the file it is
 * looking for. No marker: a unit test reads `package.json` and asserts the two
 * agree, which is a check rather than a note to remember (gen-073).
 */
export const REAP_PACKAGE = "@c-d-cc/reap";

/**
 * Which packages npm should be asked to remove.
 *
 * The daemon goes with REAP. It is published separately because it carries a
 * native SQLite build and fifteen Tree-sitter grammars that nobody should pay
 * for by default, but there is no such thing as a daemon user who is not a REAP
 * user — leaving it behind would leave the larger of the two packages installed
 * for a tool that is gone.
 *
 * Unless it was found in a checkout. That is a working tree npm never installed
 * and cannot remove, and handing it over would at best fail; gen-084 already
 * draws this same line when it decides how to advise upgrading a stale daemon.
 * A daemon that is not installed at all is simply absent from the list.
 */
export function npmRemovalTargets(daemonSource: string | null, daemonInstalled: boolean): string[] {
  const packages: string[] = [];
  if (daemonInstalled && daemonSource !== "checkout") packages.push(DAEMON_PACKAGE);
  packages.push(REAP_PACKAGE);
  return packages;
}

function readPackageName(packageJsonPath: string): string | null {
  try {
    const name = JSON.parse(readFileSync(packageJsonPath, "utf-8")).name;
    return typeof name === "string" ? name : null;
  } catch {
    return null;
  }
}

function npmGlobalRoot(): string | null {
  try {
    return execFileSync("npm", ["root", "-g"], { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

function defaultNpmUninstall(packages: string[]): { ok: boolean; error?: string } {
  try {
    execFileSync("npm", ["uninstall", "-g", ...packages], { stdio: ["ignore", "pipe", "pipe"] });
    return { ok: true };
  } catch (err) {
    const e = err as { stderr?: Buffer; message?: string };
    const stderr = e.stderr?.toString().trim();
    return { ok: false, error: stderr || e.message || "npm uninstall failed" };
  }
}

/** CLI entry point for `reap uninstall`. */
export async function execute(confirm?: boolean, deps: UninstallDeps = {}): Promise<void> {
  const home = deps.home ?? homedir();
  const daemon = resolveDaemonAvailability();
  const { kind, packageRoot } = detectInstallKind(deps);
  const packages = npmRemovalTargets(daemon.source, daemon.installed);
  const npmCommand = `npm uninstall -g ${packages.join(" ")}`;

  if (!confirm) {
    emitOutput({
      status: "prompt",
      command: "uninstall",
      context: {
        home,
        installKind: kind,
        packageRoot,
        npmCommand,
        npmWillRun: kind === "global",
        daemon: {
          installed: daemon.installed,
          source: daemon.source,
          bin: daemon.bin,
          removedFromNpm: packages.includes(DAEMON_PACKAGE),
        },
        willRemove: [
          "~/.claude/commands/reap.*.md",
          "~/.claude/agents/reap-*.md",
          "~/.claude/settings.json: the SessionStart entries REAP added",
          "OpenCode commands and agents (reap.* / reap-*), wherever XDG_CONFIG_HOME points",
          "~/.reap/reap-guide.md, ~/.reap/.install-stamp, ~/.reap/daemon/",
        ],
        willKeep: [
          "your own files in those directories, including reapdev.*",
          "your own SessionStart hooks",
          "anything else in ~/.reap/",
          "project .reap/ directories — those are 'reap destroy', per project",
        ],
      },
      message:
        `This removes REAP from ${home} and` +
        (kind === "global"
          ? ` runs '${npmCommand}'.`
          : ` does NOT touch npm — this copy of REAP is a ${kind} install, so the package is left for you to remove with '${npmCommand}'.`),
      prompt: "Run 'reap uninstall --confirm' to proceed.",
    });
  }

  // 1. The daemon first. It rewrites ~/.reap/daemon/ while it runs, so deleting
  //    before stopping puts the files straight back.
  const stoppedPid = await (deps.stopDaemon ?? stopDaemonIfRunning)();

  // 2. Both clients, whatever this project's agentClient says. Someone who has
  //    switched clients has both sets on disk, and sweeping the one they are
  //    not using costs nothing when it is absent.
  const removed: string[] = [];
  const kept: string[] = [];
  for (const adapter of [claudeCodeAdapter, opencodeAdapter]) {
    const result = await adapter.removeUserLevelAssets(home);
    removed.push(...result.removed);
    kept.push(...result.kept);
  }

  // 3. The client-agnostic half: the guide, the install stamp, the daemon data.
  const reapHome = await removeReapHomeAssets(home);
  removed.push(...reapHome.removed);
  kept.push(...reapHome.kept);

  // 4. npm last, and only when this is unambiguously a global install. A
  //    failure here is not a failure of the uninstall: everything above has
  //    already happened, and what is left is one command the user can run.
  let npmRan = false;
  let npmError: string | undefined;
  if (kind === "global") {
    const runner = deps.runNpmUninstall ?? defaultNpmUninstall;
    const result = runner(packages);
    npmRan = result.ok;
    npmError = result.error;
  }

  // What is left to do, from the user's side. Only a global install that was
  // attempted and failed is *known* to still be there; everywhere else the
  // command is worth naming without asserting the packages exist. The npx path
  // in particular exists *because* the package is already gone, and telling
  // that user it is still installed is wrong for the one case the recovery path
  // was built for — but saying nothing strands the user who removed reap and
  // left the daemon behind, which is the likelier residue.
  const packageMayRemain = !npmRan;
  const plural = packages.length > 1 ? "either package is" : "the package is";

  emitOutput({
    status: "ok",
    command: "uninstall",
    context: {
      removed,
      kept,
      removedCount: removed.length,
      keptCount: kept.length,
      daemonStopped: stoppedPid,
      installKind: kind,
      npm: {
        executed: npmRan,
        attempted: kind === "global",
        packages,
        command: npmCommand,
        packageMayRemain,
        ...(npmError ? { error: npmError } : {}),
      },
    },
    message:
      `Removed ${removed.length} REAP item(s) from ${home}; kept ${kept.length}.` +
      (npmRan
        ? ` Uninstalled ${packages.join(" and ")}.`
        : kind === "global"
          ? ` The package itself is still installed — run: ${npmCommand}` +
            (npmError ? ` (npm reported: ${npmError})` : "")
          : ` If ${plural} still installed, remove it with: ${npmCommand}`),
  });
}
