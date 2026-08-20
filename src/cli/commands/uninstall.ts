import { execFileSync } from "child_process";
import { homedir } from "os";
import { emitOutput } from "../../core/output.js";
import {
  detectInstallKind,
  REAP_PACKAGE,
  type InstallKindDeps,
} from "../../core/package-info.js";
import { claudeCodeAdapter } from "../../adapters/claude-code/index.js";
import { opencodeAdapter } from "../../adapters/opencode/index.js";
import { removeReapHomeAssets } from "../../adapters/index.js";

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
 *   2. remove the home assets — both clients, then the client-agnostic ones
 *   3. hand the packages to npm
 *
 * Step 3 removes the package this process is running from. On unix that works:
 * node has already read the bundle and npm is not deleting the interpreter.
 * Windows may refuse on a file lock, and that is survivable — everything that
 * matters happened in step 2, and the output hands over the command to run.
 */

export interface UninstallDeps extends InstallKindDeps {
  home?: string;
  /** Hand the package list to npm. Seam so tests can assert the arguments. */
  runNpmUninstall?: (packages: string[]) => { ok: boolean; error?: string };
}

/**
 * The retired daemon package (gen-089). Kept here, in the one command that
 * cleans up after REAP, precisely because nothing else refers to it any more —
 * it is deprecated on npm but still installed globally wherever someone opted
 * in before 0.17.6.
 */
export const DAEMON_PACKAGE = "@c-d-cc/reap-daemon";

/**
 * Which packages npm should be asked to remove.
 *
 * The retired daemon (`@c-d-cc/reap-daemon`) is still named, unconditionally.
 * gen-089 removed the code that could tell whether it was installed and where
 * from, and asking npm to remove a package that is absent is a no-op — so the
 * alternative to naming it is leaving a deprecated global package behind on
 * every machine that ever enabled it. Someone who ran the daemon from a source
 * checkout never installed it globally, so nothing is taken from them either.
 */
export function npmRemovalTargets(): string[] {
  return [DAEMON_PACKAGE, REAP_PACKAGE];
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
  const { kind, packageRoot } = detectInstallKind(deps);
  const packages = npmRemovalTargets();
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
        willRemove: [
          "~/.claude/commands/reap.*.md",
          "~/.claude/agents/reap-*.md",
          "~/.claude/settings.json: the SessionStart entries REAP added",
          "OpenCode commands and agents (reap.* / reap-*), wherever XDG_CONFIG_HOME points",
          "~/.reap/: reap-guide.md, .install-stamp, daemon/ — an allowlist, not the whole directory",
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

  // 1. Both clients, whatever this project's agentClient says. Someone who has
  //    switched clients has both sets on disk, and sweeping the one they are
  //    not using costs nothing when it is absent.
  const removed: string[] = [];
  const kept: string[] = [];
  for (const adapter of [claudeCodeAdapter, opencodeAdapter]) {
    const result = await adapter.removeUserLevelAssets(home);
    removed.push(...result.removed);
    kept.push(...result.kept);
  }

  // 2. The client-agnostic half: the guide, the install stamp, and whatever the
  //    retired daemon left behind in ~/.reap/daemon/.
  const reapHome = await removeReapHomeAssets(home);
  removed.push(...reapHome.removed);
  kept.push(...reapHome.kept);

  // 3. npm last, and only when this is unambiguously a global install. A
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
