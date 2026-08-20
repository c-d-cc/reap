import { execFileSync } from "child_process";
import { readFileSync, realpathSync } from "fs";
import { basename, dirname, join } from "path";
import { fileURLToPath } from "url";

/**
 * Facts about the package this code belongs to: its root, its version, and how
 * it got onto the machine.
 *
 * There is one owner because there were five. `cli/index.ts`, `update.ts`,
 * `load-context.ts` and `dump-state-sync.ts` each carried their own copy of
 * "read our version out of package.json" — three of them said so in a comment
 * ("mirrors update.ts helper") — and `check-version.ts` had a fifth answer
 * that was not the same question at all: it ran `reap --version` and reported
 * whatever binary was first on PATH. That is what gen-092 came to fix, and
 * adding a sixth copy to fix it would have been the shape of issue #22 again.
 * The genome's prescription for a value known in several places is to give it
 * one owner rather than to mark the copies.
 *
 * `detectInstallKind` and its parts arrive here from `cli/commands/uninstall.ts`
 * (gen-090). A second command now needs them, and `core` is where both can
 * reach: `core` never imports `cli`.
 *
 * The move was not a pure one and this sentence used to claim it was. Which
 * kind each layout is, and the order the questions are asked in, are exactly
 * what they were. What changed is the failure behaviour, because a hook path
 * is not an interactive command: `npm root -g` gained a timeout, and the call
 * to it gained a catch, so neither a hang nor a throw escapes into a session.
 * `findPackageRoot` also gained a note on why searching by name beats counting
 * directories. Each is documented where it sits.
 */

/**
 * REAP's own package name, as npm knows it.
 *
 * It has to be a literal — it is what identifies the package root while
 * walking up from this module, so it cannot be read out of the file it is
 * looking for. No carrier marker: a unit test reads `package.json` and asserts
 * the two agree, which is a check rather than a note to remember (gen-073).
 */
export const REAP_PACKAGE = "@c-d-cc/reap";

/** How this copy of REAP got onto the machine. */
export type InstallKind = "global" | "npx" | "local" | "checkout" | "unknown";

export interface InstallKindDeps {
  /** Where this module is running from. Injected so tests need no install. */
  moduleDir?: string;
  /** `npm root -g`, or null when npm cannot be asked. */
  npmGlobalRoot?: () => string | null;
  /** Resolve a path through symlinks. See `sameDirectory`. */
  realpath?: (path: string) => string;
  /** Read a `package.json` name field; null when unreadable. */
  readPackageName?: (packageJsonPath: string) => string | null;
}

/**
 * Walk up from a directory to the package root that owns it — the nearest
 * ancestor whose `package.json` names this package.
 *
 * Returns null rather than guessing. A guess here would be handed to
 * `npm uninstall -g`.
 *
 * Note what this does *not* depend on: the depth of the caller. Bundling
 * collapses every module into `dist/cli/index.js`, so a helper's distance from
 * the package root is one number in the source tree and another in the bundle
 * — which is why the four copies this file replaces each carried a different
 * list of candidate depths. Searching by name is immune to that.
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

export function readPackageName(packageJsonPath: string): string | null {
  try {
    const name = JSON.parse(readFileSync(packageJsonPath, "utf-8")).name;
    return typeof name === "string" ? name : null;
  } catch {
    return null;
  }
}

/** This module's own directory — the starting point for every lookup below. */
function moduleDir(): string {
  return dirname(fileURLToPath(import.meta.url));
}

/**
 * The root of the package this code is part of.
 *
 * Falls back to the fixed relative depths the four previous copies used, so a
 * `package.json` that cannot be read by name leaves behaviour exactly where it
 * was rather than worse.
 */
export function ownPackageRoot(deps: InstallKindDeps = {}): string | null {
  const here = deps.moduleDir ?? moduleDir();
  const readName = deps.readPackageName ?? readPackageName;
  const byName = findPackageRoot(here, REAP_PACKAGE, readName);
  if (byName) return byName;

  for (const rel of [join(here, "..", ".."), join(here, "..")]) {
    try {
      JSON.parse(readFileSync(join(rel, "package.json"), "utf-8"));
      return rel;
    } catch {}
  }
  return null;
}

/**
 * What the version readers say when they cannot find out.
 *
 * A placeholder rather than a real answer, and the distinction matters: it is
 * tolerable for a caller that must produce *some* string to display (a context
 * dump, a session-state header) and wrong for a caller that acts on it.
 * `performAutoUpdate` reading it as a genuine version would compare 0.0.0
 * against the registry and announce a breaking change that is really a missing
 * file — so that caller uses the `OrNull` form below.
 *
 * Two callers sit in between and are worth naming rather than glossing:
 * `update.ts` guards the release notice on it (correct — nothing to look up),
 * and `--mark-migrated` writes `packageVersion()` into `lastMigratedVersion`
 * without a guard, so an unreadable package root would *lower* what a project
 * records. Pre-existing — the copy this replaced fell back the same way — but
 * it is the same shape one level over, and it is in the backlog rather than
 * pretended away here.
 *
 * The spelling is not the only fact that wears it. `lastMigratedVersion`
 * defaults to "0.0.0" meaning "never migrated", which is a different claim
 * that happens to look identical; do not unify the two by search-and-replace.
 */
export const UNKNOWN_VERSION = "0.0.0";

/**
 * The version in our own `package.json` — nothing appended.
 *
 * This is the value that may be written into a user's `config.yml`
 * (`lastMigratedVersion`) and compared as semver, so it must stay a bare
 * version. Callers that want the local-build marker want `runningVersion`.
 */
export function packageVersion(deps: InstallKindDeps = {}): string {
  return versionAt(ownPackageRoot(deps)) ?? UNKNOWN_VERSION;
}

function versionAt(root: string | null): string | null {
  if (root) {
    try {
      const version = JSON.parse(readFileSync(join(root, "package.json"), "utf-8")).version;
      if (typeof version === "string" && version) return version;
    } catch {}
  }
  return null;
}

/**
 * The version of the REAP that is running, marked when it was built locally.
 *
 * `scripts/build.sh` writes `dist/.dev-build` unless `CI` or `npm_config_tag`
 * is set, so a published build has no marker and a developer's does. The
 * suffix is load-bearing: `performAutoUpdate` refuses to upgrade anything
 * carrying it, which is how a local build avoids replacing itself with the
 * registry's copy.
 */
export function runningVersion(deps: InstallKindDeps = {}): string {
  return runningVersionOrNull(deps) ?? UNKNOWN_VERSION;
}

/**
 * The same value, but null when it could not be determined.
 *
 * This exists because `UNKNOWN_VERSION` is truthy, and a caller that decides
 * whether to change the machine must be able to tell "0.0.0" the placeholder
 * from a version. Before gen-092 that caller shelled out to `reap --version`
 * and got a thrown error — silence — in exactly this case; folding it into the
 * placeholder would have turned that silence into a false breaking-change
 * warning on every postinstall and every session start.
 */
export function runningVersionOrNull(deps: InstallKindDeps = {}): string | null {
  const root = ownPackageRoot(deps);
  const version = versionAt(root);
  if (!root || !version) return version;
  try {
    const hash = readFileSync(join(root, "dist", ".dev-build"), "utf-8").trim();
    if (hash) return `${version}+dev.${hash}`;
  } catch {}
  return version;
}

/**
 * Are these two paths the same directory?
 *
 * Compared through `realpath` because they arrive by different routes and can
 * spell the same place differently. `npm root -g` echoes the configured prefix
 * verbatim, while node resolves the bin symlink it was launched through, so on
 * macOS one says `/var/folders/...` and the other `/private/var/folders/...`
 * for one directory. Without this a genuine global install is judged "not
 * global" every time and npm is never called — the failure being silence.
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
 * Decide what kind of installation this is, and be conservative about it.
 *
 * Both callers act on the machine rather than on a directory — `npm uninstall -g`
 * removes an installation, `npm install -g` replaces one — so being wrong in the
 * permissive direction means changing something the user did not ask about.
 * Only a package root sitting directly in npm's own global root earns a yes:
 *
 *   - `npx` — the copy running is a throwaway in npm's `_npx` cache, and
 *     whether a global install also exists is not visible from here.
 *   - `local` — a project dependency. Acting globally would hit someone
 *     else's install entirely.
 *   - `checkout` — a source tree. npm does not manage it.
 *   - `unknown` — npm could not be asked, or the package root was not found.
 */
export function detectInstallKind(deps: InstallKindDeps = {}): {
  kind: InstallKind;
  packageRoot: string | null;
} {
  const here = deps.moduleDir ?? moduleDir();
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

  // Only this seam is wrapped, and only this one needs it: it is the one that
  // shells out. The default swallows its own failure and answers null — so a
  // real timeout was already fine — but a provider handed in from outside need
  // not, and an exception escaping here would take `reap uninstall` down and
  // would reach `performAutoUpdate` through its outer catch as "error" rather
  // than as what it is. Both routes land on the same conservative answer
  // instead. (`readPackageName` still propagates; it reads a file and catches
  // its own failure, and nothing in production injects either.) gen-092 wrote
  // this after a test that assumed it was already true went red.
  let globalRoot: string | null;
  try {
    globalRoot = (deps.npmGlobalRoot ?? npmGlobalRoot)();
  } catch {
    globalRoot = null;
  }
  if (globalRoot === null) return { kind: "unknown", packageRoot };
  if (sameDirectory(globalRoot, containingNodeModules, resolvePath)) {
    return { kind: "global", packageRoot };
  }
  return { kind: "local", packageRoot };
}

/**
 * The timeout is not decoration. `check-version` runs from the SessionStart
 * hook, so an npm that hangs here hangs the start of someone's session — and
 * every other spawn in that file is already bounded for the same reason. A
 * timeout throws, which lands on `unknown`, which refuses to act. Failing
 * closed is free: an npm that cannot answer `root -g` was not going to carry
 * out `install -g` either.
 *
 * `reap uninstall` shares this and did not have it before gen-092 moved the
 * function here. The effect there is that an npm slower than ten seconds makes
 * the command print the manual `npm uninstall -g` line instead of running it —
 * after removing every file, which is the part that mattered. Visible and
 * recoverable, unlike an interactive command that appears to have frozen.
 */
function npmGlobalRoot(): string | null {
  try {
    return execFileSync("npm", ["root", "-g"], {
      encoding: "utf-8",
      timeout: 10_000,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}
