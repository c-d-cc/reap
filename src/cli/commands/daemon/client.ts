import { spawn, execSync } from "child_process";
import { existsSync, readFileSync, statSync } from "fs";
import { join, dirname, isAbsolute, resolve } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";
import YAML from "yaml";
import { semverGte } from "../../../core/semver.js";
import type {
  DaemonAvailability,
  DaemonBinSource,
  ExplicitDaemonBin,
  ReapConfig,
} from "../../../types/index.js";

const DAEMON_ROOT = join(homedir(), ".reap", "daemon");

/**
 * The npm package the daemon ships as. Single owner within TypeScript — nothing
 * else spells it. scripts/check-version-floors.sh cannot import it, so it reads
 * this declaration; the marker is how that reader is found from here.
 */
// reap:carrier(daemon-package-name)
export const DAEMON_PACKAGE = "@c-d-cc/reap-daemon";

/** What a user is told to run when it is missing or too old. */
export const DAEMON_INSTALL_COMMAND = `npm i -g ${DAEMON_PACKAGE}`;

/** Environment variable naming the daemon entry point. */
export const DAEMON_BIN_ENV = "REAP_DAEMON_BIN";

/** The config key that does the same thing, persistently. */
export const DAEMON_BIN_CONFIG_KEY = "daemonBin";

/**
 * What to say to someone who has installed the daemon and is still being told
 * they have not.
 *
 * Carried on `DaemonAvailability` for the same reason `installCommand` is: the
 * three places that phrase this — `reap fix --check`, `reap daemon status` and
 * the agent prompt — live in `core` and `cli`, and only one of them may own the
 * wording (gen-076 pattern).
 *
 * Deliberately phrased as a condition rather than a list of package managers.
 * gen-083 recorded that pnpm's default store and Yarn PnP make resolution fail
 * "in principle"; gen-084 installed both and measured otherwise — pnpm isolates
 * by symlink layout, not by replacing the resolver, and PnP's default fallback
 * admits the top-level project's dependencies. What actually fails is reap and
 * the daemon landing in different resolution roots, whichever manager put them
 * there. Naming the managers would have shipped a false statement.
 */
export const DAEMON_LOCATE_HINT =
  `If it is installed and REAP still cannot find it, the two are in different ` +
  `resolution roots (a global reap with a project-local daemon, two prefixes, ` +
  `or a switched Node version). Point REAP at it: set ` +
  `'${DAEMON_BIN_CONFIG_KEY}: <path>/dist/index.js' in .reap/config.yml, or ` +
  `export ${DAEMON_BIN_ENV}=<path>/dist/index.js.`;

/**
 * The oldest daemon this reap build will talk to.
 *
 * reap and the daemon install separately now, so nothing stops the two from
 * drifting apart; without a floor, a daemon too old to answer correctly would
 * present as the same quiet nothing this whole change exists to remove. This
 * constant is the only place the number lives — the documentation deliberately
 * does not repeat it, and instead says that reap reports what it needs.
 *
 * Raising it is the dangerous direction, and the danger is not in this file:
 * name a version that was never published and every user is told to upgrade to
 * something that does not exist. scripts/check-daemon-floor.sh reads the value
 * from right here and asks npm, before the release publishes.
 */
// reap:carrier(min-daemon-version)
export const MIN_DAEMON_VERSION = "0.2.0";

/**
 * Raised when `daemon: true` is set but no daemon package can be resolved.
 *
 * `explicitMiss` is the whole reason this takes an argument at all: someone who
 * set `daemonBin` and mistyped it was being told to install a package they
 * already have, with no mention of the setting they wrote. gen-085 split the
 * *outdated* advice by source; this is the missing half of that pair, and with
 * it all three places that say "not installed" answer alike.
 */
export class DaemonNotInstalledError extends Error {
  constructor(readonly explicitMiss: ExplicitDaemonBin | null = null) {
    super(`The daemon is not installed. ${missingDaemonRemedy(explicitMiss)}`);
    this.name = "DaemonNotInstalledError";
  }

  /**
   * The bare command, beside the sentence. Nothing reads it today — the two
   * diagnostics that show an install command read `DaemonAvailability` — but
   * it was on this class before and removing a public field is a bigger change
   * than the one this generation was asked for.
   */
  readonly installCommand = DAEMON_INSTALL_COMMAND;
}

/**
 * What to say to someone who has no daemon, given what they pointed reap at.
 *
 * The counterpart of `staleDaemonRemedy`, and it exists for the same reason:
 * three callers phrase this, and if each writes its own they drift. A named
 * location that turned out to be empty is the entire story — repeating the
 * generic "here is how to name one" advice would talk past the one person who
 * already did.
 */
export function missingDaemonRemedy(explicitMiss: ExplicitDaemonBin | null): string {
  if (explicitMiss) {
    return `${explicitMiss.label} points at ${explicitMiss.path}, but there is no file there. Install it with: ${DAEMON_INSTALL_COMMAND}`;
  }
  return `${DAEMON_LOCATE_HINT} Otherwise install it with: ${DAEMON_INSTALL_COMMAND}`;
}
const PID_PATH = join(DAEMON_ROOT, "daemon.pid");
const DEFAULT_PORT = 17224;

// gen-069: port is resolved at call time (not at module load) so tests
// can spawn a child CLI process with REAP_DAEMON_PORT set without
// requiring re-import. Falls back to DEFAULT_PORT (17224) when env
// is unset or non-numeric — preserves byte-identical behavior for
// existing users.
function resolvePort(): number {
  const raw = process.env.REAP_DAEMON_PORT;
  if (!raw) return DEFAULT_PORT;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_PORT;
}

function getBaseUrl(): string {
  return `http://127.0.0.1:${resolvePort()}`;
}

export async function daemonRequest<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: "ok" | "error"; data?: T; error?: string }> {
  await ensureDaemon();

  const res = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
}

async function ensureDaemon(): Promise<void> {
  if (await isDaemonRunning()) return;

  // `locateDaemon` rather than `resolveDaemonBin`: the latter keeps only the
  // path and discards `explicitMiss`, which is precisely the fact the error
  // needs in order not to give advice the user has already followed.
  const { bin, explicitMiss } = locateDaemon();
  if (bin === null) throw new DaemonNotInstalledError(explicitMiss);
  const daemonBin = bin;

  const runtime = detectRuntime();
  const child = spawn(runtime, [daemonBin], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  const deadline = Date.now() + 3_000;
  while (Date.now() < deadline) {
    if (await isDaemonRunning()) return;
    await new Promise((r) => setTimeout(r, 100));
  }

  throw new Error("Failed to start daemon within 3 seconds");
}

async function isDaemonRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${getBaseUrl()}/health`, { signal: AbortSignal.timeout(500) });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Where this module is running from, resolved at run time.
 *
 * Not the bare `__dirname`: bundling replaces that with a string literal fixed
 * at build time, so a published bundle carried the absolute path of the machine
 * that built it. The old fallback did exactly this and therefore pointed into a
 * developer's checkout on every user's disk — which is part of why it never
 * resolved to anything. `import.meta.url` survives bundling intact, and every
 * other path helper in this codebase already uses it.
 */
function moduleDir(): string {
  return dirname(fileURLToPath(import.meta.url));
}

/**
 * Is there a file at this path — not a directory, not nothing.
 *
 * Only named locations are held to "file": the entry point is handed straight
 * to `spawn`, so a directory can never be one, and the likeliest way to write
 * this setting wrong is to name the package rather than its entry point
 * (`.../reap-daemon` instead of `.../reap-daemon/dist/index.js`). Accepting
 * that would set `installed: true` on something that cannot start, and every
 * diagnostic downstream would go quiet — the exact silence this whole change
 * exists to end, one level along.
 */
function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

/** Seams so the outcomes below can be exercised without a real install. */
export interface DaemonResolveDeps {
  resolve?: (id: string) => string;
  exists?: (path: string) => boolean;
  /**
   * Existence check for a named location — a stricter question than `exists`,
   * see `isFile`.
   *
   * Falls back to `exists` when only that is injected: a test that has already
   * described what its fake world contains should not have to describe it
   * twice, and the file-versus-directory distinction is opted into by the tests
   * that are about it.
   */
  existsAsFile?: (path: string) => boolean;
  /** Directory this module is running from. See `moduleDir`. */
  here?: string;
  readVersion?: (packageJsonPath: string) => string | null;
  readName?: (packageJsonPath: string) => string | null;
  /**
   * Locations the user named, highest priority first.
   *
   * Injected rather than read, so a test never depends on the environment or
   * working directory it happens to run in. Leaving that to chance is how an
   * unset variable and an honoured one became indistinguishable in gen-082;
   * pass `[]` to assert the automatic search on its own.
   */
  explicit?: ExplicitDaemonBin[];
}

/** Where the daemon is, how that was decided, and what was pointed at in vain. */
export interface DaemonLocation {
  bin: string | null;
  source: DaemonBinSource | null;
  explicitMiss: ExplicitDaemonBin | null;
}

/**
 * Read the locations the user named, in priority order.
 *
 * The environment variable comes first because it is the temporary one — a CI
 * job or a single command overriding what the committed config says, the same
 * relationship `REAP_DAEMON_PORT` already has with its default.
 *
 * `~` is expanded and relative paths are resolved against the project root,
 * because both are what people actually write in a YAML file. Blank values are
 * treated as unset rather than as a path to nowhere: `REAP_DAEMON_BIN=` in a
 * shell profile means "I am not using this", not "look in the empty string".
 *
 * Both inputs are parameters rather than reads of `process` so callers — tests
 * above all — decide what this sees.
 */
export function readExplicitDaemonBins(
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
): ExplicitDaemonBin[] {
  const found: ExplicitDaemonBin[] = [];

  const fromEnv = normalizeBinPath(env[DAEMON_BIN_ENV], cwd);
  if (fromEnv) found.push({ source: "env", path: fromEnv, label: explicitBinLabel("env")! });

  const fromConfig = normalizeBinPath(readConfigDaemonBin(cwd), cwd);
  if (fromConfig) {
    found.push({ source: "config", path: fromConfig, label: explicitBinLabel("config")! });
  }

  return found;
}

/**
 * How to name the channel a location came from, or null when nobody named one.
 *
 * A miss already carried this on `ExplicitDaemonBin.label`; a hit did not, and
 * the diagnostics that needed it live in `core`, which must not import from
 * `cli`. So it travels on `DaemonAvailability` the way `installCommand` and
 * `locateHint` do — and the strings are built here rather than inline above, or
 * a hit and a miss would refer to the same setting by two different names.
 */
export function explicitBinLabel(source: DaemonBinSource | null): string | null {
  if (source === "env") return DAEMON_BIN_ENV;
  if (source === "config") return `.reap/config.yml '${DAEMON_BIN_CONFIG_KEY}'`;
  return null;
}

/**
 * How to replace a daemon that is too old, given where reap found it.
 *
 * `npm i -g` is the answer for exactly one of the four sources, and it was being
 * given for all of them. A daemon named by the user stays named however many
 * times they install a global one; a daemon found in a source checkout beside
 * reap is not an npm install at all. In both cases the advice is not merely
 * unhelpful — it looks like it should work, so someone follows it, sees the same
 * warning, and has nothing to go on.
 *
 * `package` keeps the global command because resolution is the one case where it
 * can be right. It is not always: a project-local daemon outranks a global one,
 * and reap cannot tell which it resolved without reasoning about prefixes. The
 * path is given in every case for that reason — it is what lets someone see
 * which copy reap means, whatever the advice.
 */
export function staleDaemonRemedy(
  source: DaemonBinSource | null,
  bin: string | null,
): string {
  const label = explicitBinLabel(source);
  if (label) {
    return `That daemon is at ${bin}, named by ${label}, so installing the package globally would not replace it. Upgrade the copy at that path, or point ${label} at a newer one.`;
  }
  if (source === "checkout") {
    return `That daemon is a source checkout at ${bin}, beside this REAP rather than installed, so '${DAEMON_INSTALL_COMMAND}' would not replace it. Update and rebuild that checkout, or point ${DAEMON_BIN_CONFIG_KEY} at an installed daemon.`;
  }
  return `That daemon is at ${bin}. Upgrade it with: ${DAEMON_INSTALL_COMMAND}`;
}

function normalizeBinPath(raw: string | undefined | null, cwd: string): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const expanded =
    trimmed === "~" || trimmed.startsWith("~/")
      ? join(homedir(), trimmed.slice(1))
      : trimmed;
  return isAbsolute(expanded) ? expanded : resolve(cwd, expanded);
}

/**
 * Read `daemonBin` out of the project config.
 *
 * Synchronous and cwd-relative on purpose. `reap fix --check` must be able to
 * answer without starting anything, and every command in this CLI already
 * treats the working directory as the project root (`createPaths(process.cwd())`)
 * without walking upwards — doing something different here would make the
 * daemon the one thing that finds a project by a rule of its own.
 *
 * Any failure is silence. A config that will not parse is a problem the rest of
 * REAP reports far better than a daemon lookup could.
 */
function readConfigDaemonBin(cwd: string): string | null {
  try {
    const raw = readFileSync(join(cwd, ".reap", "config.yml"), "utf-8");
    const value = (YAML.parse(raw) as ReapConfig | null)?.daemonBin;
    return typeof value === "string" ? value : null;
  } catch {
    return null;
  }
}

/**
 * Locate the daemon entry point, distinguishing four outcomes.
 *
 *   1. explicit   — a location the user named, and something is there
 *   2. installed  — the package resolves normally
 *   3. checkout   — no package, but this reap is running from its own repo,
 *                   where daemon/ sits beside it
 *   4. missing    — null
 *
 * The last used to be unreachable: the fallback returned a path unconditionally
 * and callers treated a failed spawn as "daemon is down". Worse, that path was
 * wrong in both layouts — three levels up lands on src/ from the sources and
 * above the package from the bundle, so it never pointed at anything. Only the
 * `file:` symlink made dog-fooding work, and removing that dependency would have
 * taken the daemon away from this repo too.
 *
 * Both checkout candidates are tried rather than branched on, because bundling
 * collapses every module into dist/cli/index.js and the directory this file
 * appears to live in changes with it.
 *
 * The explicit step (gen-084) exists because steps 2 and 3 both look outward
 * from reap's own location, and the daemon is deliberately not a dependency —
 * so when the two are installed into different resolution roots there is
 * nothing left for reap to follow, and the user was being told to install what
 * they already had.
 *
 * A named location is checked for existence but not for identity, unlike the
 * checkout candidates. That check is there because `daemon` is a real package
 * name on npm and both candidates end in `daemon/dist`, so reap could otherwise
 * launch a stranger by accident. Nothing is accidental about a path someone
 * wrote down, and demanding a matching manifest would reject the legitimate
 * case of pointing at a source checkout.
 *
 * A named location that holds nothing does not stop the search. `config.yml` is
 * committed, so a path that is right on one machine may be absent on the next,
 * and refusing to look further would break a machine where the daemon is
 * installed perfectly well. It is reported instead — see `explicitMiss`.
 */
export function locateDaemon(deps: DaemonResolveDeps = {}): DaemonLocation {
  const resolveId = deps.resolve ?? ((id: string) => require.resolve(id));
  const fileExists = deps.exists ?? existsSync;
  const here = deps.here ?? moduleDir();
  const explicit = deps.explicit ?? readExplicitDaemonBins();
  const namedExists = deps.existsAsFile ?? deps.exists ?? isFile;

  let explicitMiss: ExplicitDaemonBin | null = null;
  for (const candidate of explicit) {
    if (namedExists(candidate.path)) {
      // A miss recorded before this one still travels with the answer. It came
      // from a higher-priority channel, so it is a stale instruction reap chose
      // not to follow — and dropping it because a lower-priority location saved
      // the day is precisely how a setting rots unnoticed.
      return { bin: candidate.path, source: candidate.source, explicitMiss };
    }
    // Only the first miss is kept: it is the one whose instruction reap was
    // meant to follow, and a second line about a lower-priority fallback would
    // bury it.
    explicitMiss ??= candidate;
  }

  try {
    return { bin: resolveId(`${DAEMON_PACKAGE}/dist/index.js`), source: "package", explicitMiss };
  } catch {
    // fall through to the checkout candidates
  }

  const candidates = [
    // bundle: <repo>/dist/cli
    join(here, "..", "..", "daemon", "dist", "index.js"),
    // sources: <repo>/src/cli/commands/daemon
    join(here, "..", "..", "..", "..", "daemon", "dist", "index.js"),
  ];
  const readName = deps.readName ?? readPackageName;
  for (const candidate of candidates) {
    if (!fileExists(candidate)) continue;
    if (readName(join(dirname(candidate), "..", "package.json")) !== DAEMON_PACKAGE) continue;
    return { bin: candidate, source: "checkout", explicitMiss };
  }
  return { bin: null, source: null, explicitMiss };
}

/**
 * Just the path. Kept as its own export because the spawn path wants nothing
 * else, and because narrowing an existing signature would have meant touching
 * every caller for no gain.
 */
export function resolveDaemonBin(deps: DaemonResolveDeps = {}): string | null {
  return locateDaemon(deps).bin;
}

function readPackageName(packageJsonPath: string): string | null {
  try {
    const name = JSON.parse(readFileSync(packageJsonPath, "utf-8")).name;
    return typeof name === "string" ? name : null;
  } catch {
    return null;
  }
}

function readPackageVersion(packageJsonPath: string): string | null {
  try {
    const version = JSON.parse(readFileSync(packageJsonPath, "utf-8")).version;
    return typeof version === "string" ? version : null;
  } catch {
    return null;
  }
}

/**
 * What reap knows about the daemon before trying to talk to it.
 *
 * Deliberately synchronous and process-free: `reap fix --check` answers this
 * question, and a diagnostic command must not start a daemon to find out. The
 * verdict comes from the installed package rather than from a running one —
 * a daemon too old to work may also be too old to report itself, and the daemon
 * stays resident for thirty idle minutes, so what is running and what is
 * installed are separate questions. `reap daemon status` shows the running
 * version alongside this one, where a process is being contacted anyway.
 */
export function resolveDaemonAvailability(deps: DaemonResolveDeps = {}): DaemonAvailability {
  const { bin, source, explicitMiss } = locateDaemon(deps);
  const base: DaemonAvailability = {
    installed: bin !== null,
    bin,
    version: null,
    required: MIN_DAEMON_VERSION,
    outdated: false,
    packageName: DAEMON_PACKAGE,
    installCommand: DAEMON_INSTALL_COMMAND,
    source,
    explicitLabel: explicitBinLabel(source),
    staleRemedy: staleDaemonRemedy(source, bin),
    explicitMiss,
    locateHint: DAEMON_LOCATE_HINT,
  };
  if (bin === null) return base;

  const readVersion = deps.readVersion ?? readPackageVersion;
  const version = readVersion(join(dirname(bin), "..", "package.json"));

  // An unreadable version is not treated as too old. Being unable to tell is a
  // different state from knowing it is stale, and refusing to run on a missing
  // field would be a new way to break users over something cosmetic.
  return {
    ...base,
    version,
    outdated: version !== null && !semverGte(version, MIN_DAEMON_VERSION),
  };
}

function detectRuntime(): string {
  try {
    execSync("bun --version", { stdio: "ignore" });
    return "bun";
  } catch {
    return "node";
  }
}

export async function findProjectId(projectRoot: string): Promise<string | null> {
  try {
    const result = await daemonRequest<Array<{ id: string; path: string }>>("GET", "/projects");
    if (result.status !== "ok" || !result.data) return null;
    const project = result.data.find((p) => p.path === projectRoot);
    return project?.id ?? null;
  } catch {
    return null;
  }
}

export function detectWorktree(cwd: string): string | null {
  try {
    const gitCommonDir = execSync("git rev-parse --git-common-dir", { cwd, encoding: "utf-8" }).trim();
    const gitDir = execSync("git rev-parse --git-dir", { cwd, encoding: "utf-8" }).trim();
    if (gitCommonDir !== gitDir && gitCommonDir !== ".git") {
      const branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd, encoding: "utf-8" }).trim();
      return branch;
    }
  } catch {}
  return null;
}
