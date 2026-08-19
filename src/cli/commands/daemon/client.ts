import { spawn, execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";
import { semverGte } from "../check-version.js";
import type { DaemonAvailability } from "../../../types/index.js";

const DAEMON_ROOT = join(homedir(), ".reap", "daemon");

/** The npm package the daemon ships as. Single owner — nothing else spells it. */
export const DAEMON_PACKAGE = "@c-d-cc/reap-daemon";

/** What a user is told to run when it is missing or too old. */
export const DAEMON_INSTALL_COMMAND = `npm i -g ${DAEMON_PACKAGE}`;

/**
 * The oldest daemon this reap build will talk to.
 *
 * reap and the daemon install separately now, so nothing stops the two from
 * drifting apart; without a floor, a daemon too old to answer correctly would
 * present as the same quiet nothing this whole change exists to remove. This
 * constant is the only place the number lives — the documentation deliberately
 * does not repeat it, and instead says that reap reports what it needs.
 */
export const MIN_DAEMON_VERSION = "0.2.0";

/** Raised when `daemon: true` is set but no daemon package can be resolved. */
export class DaemonNotInstalledError extends Error {
  constructor(readonly installCommand: string = DAEMON_INSTALL_COMMAND) {
    super(`The REAP daemon is not installed. Install it with: ${installCommand}`);
    this.name = "DaemonNotInstalledError";
  }
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

  const daemonBin = resolveDaemonBin();
  if (daemonBin === null) throw new DaemonNotInstalledError();

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

/** Seams so the three outcomes below can be exercised without a real install. */
export interface DaemonResolveDeps {
  resolve?: (id: string) => string;
  exists?: (path: string) => boolean;
  /** Directory this module is running from. See `moduleDir`. */
  here?: string;
  readVersion?: (packageJsonPath: string) => string | null;
  readName?: (packageJsonPath: string) => string | null;
}

/**
 * Locate the daemon entry point, distinguishing three outcomes.
 *
 *   1. installed  — the package resolves normally
 *   2. checkout   — no package, but this reap is running from its own repo,
 *                   where daemon/ sits beside it
 *   3. missing    — null
 *
 * The third used to be unreachable: the fallback returned a path unconditionally
 * and callers treated a failed spawn as "daemon is down". Worse, that path was
 * wrong in both layouts — three levels up lands on src/ from the sources and
 * above the package from the bundle, so it never pointed at anything. Only the
 * `file:` symlink made dog-fooding work, and removing that dependency would have
 * taken the daemon away from this repo too.
 *
 * Both checkout candidates are tried rather than branched on, because bundling
 * collapses every module into dist/cli/index.js and the directory this file
 * appears to live in changes with it.
 */
export function resolveDaemonBin(deps: DaemonResolveDeps = {}): string | null {
  const resolveId = deps.resolve ?? ((id: string) => require.resolve(id));
  const fileExists = deps.exists ?? existsSync;
  const here = deps.here ?? moduleDir();

  try {
    return resolveId(`${DAEMON_PACKAGE}/dist/index.js`);
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
    // `daemon` is a real name on npm, and both candidates end in daemon/dist —
    // so a package installed under that name would otherwise be launched as if
    // it were ours. Confirm the manifest beside it says who it is.
    if (readName(join(dirname(candidate), "..", "package.json")) !== DAEMON_PACKAGE) continue;
    return candidate;
  }
  return null;
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
  const bin = resolveDaemonBin(deps);
  const base: DaemonAvailability = {
    installed: bin !== null,
    bin,
    version: null,
    required: MIN_DAEMON_VERSION,
    outdated: false,
    packageName: DAEMON_PACKAGE,
    installCommand: DAEMON_INSTALL_COMMAND,
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
