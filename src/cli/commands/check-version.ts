import { execSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";
import YAML from "yaml";
import { cleanupLegacyHooks, cleanupLegacyProjectSkills } from "../../core/integrity.js";
import { fetchReleaseNotice } from "../../core/notice.js";
// The comparison used to be inlined here, and it read a prerelease as equal to
// its own release: an alpha of X.Y.Z satisfied a floor of X.Y.Z (gen-085).
// gen-085 wrote that checkAutoUpdateGuard was the one guard such a build could
// reach; gen-092 then found that nothing calls checkAutoUpdateGuard at all, so
// what an alpha reaches is neither guard — performAutoUpdate returns at its
// "-alpha" check long before comparing. See the note on `execute` below.
import { semverGt, semverGte } from "../../core/semver.js";
import {
  detectInstallKind,
  runningVersionOrNull,
  type InstallKind,
  type InstallKindDeps,
} from "../../core/package-info.js";

/**
 * Query autoUpdateMinVersion from the latest npm package metadata.
 * Returns null on any failure (network, timeout, field not found).
 */
export function queryAutoUpdateMinVersion(): string | null {
  try {
    const result = execSync("npm view @c-d-cc/reap reap.autoUpdateMinVersion", {
      encoding: "utf-8",
      timeout: 10_000,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const trimmed = result.trim();
    return trimmed || null;
  } catch {
    return null;
  }
}

/**
 * The version of the REAP that is running — the package this code is part of.
 *
 * "Installed" is the word that caused the defect, so it is worth pinning down:
 * it means *this* installation, not whichever `reap` happens to be first on
 * PATH. This used to run `reap --version`, and the two are the same number
 * only by coincidence. They part company whenever REAP is installed into a
 * project while an older one sits globally — postinstall then read the global
 * number and decided what to install from it. It was live in this repository
 * when gen-092 was written: PATH said 0.17.5, package.json said 0.17.6.
 *
 * Returns null when the version cannot be determined at all, and that null is
 * load-bearing: `performAutoUpdate` stops on it. Reporting the placeholder
 * "0.0.0" instead would send a missing file to the registry as if it were a
 * version, and the user would be told about a breaking change that is not one.
 *
 * `deps` exists so a test can reach that null without an unreadable install.
 * Production calls it with no arguments.
 */
export function getInstalledVersion(deps: InstallKindDeps = {}): string | null {
  return runningVersionOrNull(deps);
}

/**
 * Query the latest published version from npm registry.
 * Returns null on any failure (network, timeout, not found).
 */
export function queryLatestVersion(): string | null {
  try {
    const result = execSync("npm view @c-d-cc/reap version", {
      encoding: "utf-8",
      timeout: 10_000,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const trimmed = result.trim();
    return trimmed || null;
  } catch {
    return null;
  }
}

/**
 * Hand off to the newly installed binary by running `reap update --post-upgrade`.
 * The new binary performs project sync with its own (newer) code.
 * Returns true if hand-off succeeded, false if it failed (fail-safe).
 */
export function handOffToNewBinary(root: string): boolean {
  try {
    execSync("reap update --post-upgrade", {
      stdio: "inherit",
      timeout: 120_000,
      cwd: root,
    });
    return true;
  } catch {
    // New binary may not support --post-upgrade yet.
    // Fail silently — caller will fallback to current binary's reap update.
    return false;
  }
}

export interface AutoUpdateResult {
  action: "upgraded" | "blocked" | "skipped";
  from?: string;
  to?: string;
  reason?: string;
}

/**
 * Is there actually something newer to move to?
 *
 * Exported so the decision can be exercised directly rather than retyped in a
 * test — `performAutoUpdate` reaches the network and the installed binary
 * through helpers that take no seams, so this is the only part of it a unit
 * test can reach honestly.
 */
export function hasNewerRelease(installed: string, latest: string): boolean {
  return semverGt(latest, installed);
}

/**
 * How to upgrade *this* installation, told to the user when REAP will not do
 * it for them.
 *
 * One sentence used to serve every case — "Run: npm install -g" — and that was
 * right while the version being reported was PATH's, because PATH's `reap` is
 * usually the global one. Reading our own version instead makes the pairing
 * wrong: we now measure a project's local install and hand its user a command
 * that changes a different installation entirely. gen-086 met the same shape in
 * the daemon's messages and drew the rule — how to fix a stale copy depends on
 * which copy you found.
 *
 * `unknown` keeps the global command. It is what was printed before, it is the
 * likeliest case, and there is nothing more specific to say.
 */
export function upgradeCommandFor(kind: InstallKind): string {
  switch (kind) {
    case "local":
      return "npm install @c-d-cc/reap@latest (in this project)";
    case "npx":
      return "npx @c-d-cc/reap@latest";
    case "checkout":
      return "git pull && npm run build (this is a source checkout)";
    default:
      return "npm install -g @c-d-cc/reap@latest";
  }
}

/**
 * Everything `performAutoUpdate` reaches outside itself.
 *
 * The decision it makes ends in `npm install -g`, which cannot be run in a
 * test, so before gen-092 nothing exercised the decision at all — the existing
 * tests say as much in their own comments. Each seam defaults to the real
 * thing, so production behaviour is the no-argument call.
 */
export interface AutoUpdateDeps {
  installedVersion?: () => string | null;
  latestVersion?: () => string | null;
  minVersion?: () => string | null;
  autoUpdateEnabled?: (root: string) => boolean;
  installKind?: () => InstallKind;
  installLatestGlobally?: () => void;
  handOff?: (root: string) => boolean;
  syncWithCurrentBinary?: (root: string) => void;
  log?: (message: string) => void;
}

/**
 * Has the user turned this off?
 *
 * `autoUpdate` has been in `config.yml` since v0.16 — created as `true`,
 * preserved by `reap update`, printed by `reap config`, documented in the
 * `/reap.config` skill as "auto-update enabled", type-checked by
 * `integrity.ts` — and read by nothing. Someone who set it `false` saw
 * `false` and was updated anyway (gen-092 found it; gen-093 is this).
 *
 * **Only an explicit boolean `false` disables.** Every other outcome — no
 * config file, unparseable YAML, absent field, a value that is not a boolean —
 * leaves auto-update on. Failing the other way looks like the cautious choice
 * and is not: `execute` passes `process.cwd()`, and npm runs postinstall in
 * the package directory, where there is no `.reap/config.yml` at all. Treating
 * "cannot read" as "off" would silently disable auto-update for the install
 * path rather than for the people who asked. The default written into new
 * projects is `true`, so "absent" and "default" agreeing is also the
 * consistent reading.
 *
 * A non-boolean value stays on for a different reason: `integrity.ts` already
 * warns about it ("'autoUpdate' should be boolean"). Quietly honouring it
 * here would put the user back where this defect started — a config value
 * doing something they cannot see.
 */
export function readAutoUpdateSetting(root: string): boolean {
  try {
    const configPath = join(root, ".reap", "config.yml");
    const config = YAML.parse(readFileSync(configPath, "utf-8")) as { autoUpdate?: unknown };
    return config?.autoUpdate === false ? false : true;
  } catch {
    return true;
  }
}

function defaultGlobalInstall(): void {
  execSync("npm install -g @c-d-cc/reap@latest", {
    encoding: "utf-8",
    timeout: 60_000,
    stdio: ["pipe", "pipe", "pipe"],
  });
}

function defaultSyncWithCurrentBinary(root: string): void {
  try {
    execSync("reap update", {
      encoding: "utf-8",
      timeout: 30_000,
      stdio: ["pipe", "pipe", "pipe"],
      cwd: root,
    });
  } catch {
    // reap update failure is non-fatal — the upgrade itself succeeded
  }
}

/**
 * Upgrade this installation, if every one of these holds:
 * 1. its version can be determined, and is not a dev or alpha build
 * 2. a newer version exists on npm
 * 3. the autoUpdateMinVersion floor passes
 * 4. the project has not set `autoUpdate: false`
 * 5. it is a global installation — the only kind `npm install -g` acts on
 *
 * On success, hands off to the new binary to sync project structure.
 * All errors are silently swallowed — never breaks postinstall/hooks.
 *
 * (5) arrived in gen-092 and (4) in gen-093. The body tests them in this
 * order, but its numbered comments run 1-9 and are not this list renumbered:
 * they count steps, and the install and the hand-off are steps rather than
 * conditions. Follow the wording, not the digit.
 */
export function performAutoUpdate(root: string, deps: AutoUpdateDeps = {}): AutoUpdateResult {
  const readInstalled = deps.installedVersion ?? getInstalledVersion;
  const readLatest = deps.latestVersion ?? queryLatestVersion;
  const readMinVersion = deps.minVersion ?? queryAutoUpdateMinVersion;
  const isEnabled = deps.autoUpdateEnabled ?? readAutoUpdateSetting;
  const readInstallKind = deps.installKind ?? (() => detectInstallKind().kind);
  const installGlobally = deps.installLatestGlobally ?? defaultGlobalInstall;
  const handOff = deps.handOff ?? handOffToNewBinary;
  const syncHere = deps.syncWithCurrentBinary ?? defaultSyncWithCurrentBinary;
  const log = deps.log ?? ((message: string) => console.error(message));

  try {
    // 1. Get installed version
    const installed = readInstalled();
    if (!installed) return { action: "skipped", reason: "version-unknown" };

    // 2. Skip dev/alpha builds
    if (installed.includes("+dev") || installed.includes("-alpha")) {
      return { action: "skipped", reason: "dev-build" };
    }

    // 3. Query latest version
    const latest = readLatest();
    if (!latest) return { action: "skipped", reason: "network-error" };

    // 4. Nothing newer to move to.
    //
    // `!==` was the test here, which made "not the latest published version"
    // mean "upgrade to it" — including when the installed one is *ahead*. That
    // is not hypothetical: a release build carries the bumped version before it
    // is published, so installing the tarball that is about to ship made REAP
    // replace it with the previous release. gen-088 hit exactly that in
    // `check-self-diagnosis.sh`, where the artifact under test was silently
    // swapped for the published one; `release.yml` runs that gate before
    // `npm publish`, so every future release would have met it.
    //
    // Comparison belongs to `core/semver.ts`, which owns it for everyone.
    if (!hasNewerRelease(installed, latest)) {
      return { action: "skipped", reason: "up-to-date" };
    }

    // 5. autoUpdateMinVersion guard
    const minVersion = readMinVersion();
    if (minVersion && !semverGte(installed, minVersion)) {
      log(
        `[REAP] Breaking change detected: v${installed} → v${latest}. ` +
        `Run: ${upgradeCommandFor(readInstallKind())}`
      );
      return {
        action: "blocked",
        from: installed,
        to: latest,
        reason: `breaking-change: v${installed} < minVersion v${minVersion}`,
      };
    }

    // 6. The user said not to.
    //
    //    Asked *after* step 5 and that is the whole of the placement. Step 5
    //    prints rather than installs: it tells someone below the hard floor
    //    that REAP will not fix it for them and what to run. Turning off
    //    auto-update is a statement about installing, not about being told —
    //    and the person who declined to be updated automatically is the one
    //    who most needs to hear that their copy is below the floor. Gating the
    //    call site in `execute` instead would return before step 5 ever ran and
    //    take that warning away; keeping the warning from there would mean
    //    checking the floor in two places, which is how this file ended up with
    //    `checkAutoUpdateGuard` sitting in it unreferenced.
    //
    //    Asked before step 7 for cost: this reads one file, that spawns
    //    `npm root -g`, and both decline in silence.
    //
    //    What it does not touch: `reap update`, which syncs a project and
    //    changes no installation, and an `npm install -g` the user typed
    //    themselves. The only thing this flag turns off is the one install REAP
    //    performs on its own.
    if (!isEnabled(root)) {
      return { action: "skipped", from: installed, to: latest, reason: "auto-update-disabled" };
    }

    // 7. Only a global install may be upgraded, because `npm install -g` acts
    //    on the machine rather than on this directory — and the only case where
    //    those are the same thing is a global install.
    //
    //    This is asked here and not earlier for two reasons. One is cost:
    //    `npm root -g` is a process spawn, step 4 returns for nearly every
    //    session, and paying up front would add a spawn to every SessionStart
    //    to answer a question that only matters when an upgrade is pending.
    //
    //    The other is which message the user gets. Step 5 runs first, so an
    //    installation below the floor is told so even though this step would
    //    have refused to upgrade it anyway — and that warning is the *only*
    //    thing a non-global install ever hears from here, since the refusal
    //    below is silent. Reversing the two would take it away from exactly
    //    the people whose copy is too old to be fixed automatically.
    //
    //    `unknown` is refused too, and refusing costs nothing: an environment
    //    where `npm root -g` cannot be answered is not one where
    //    `npm install -g` was going to succeed.
    const kind = readInstallKind();
    if (kind !== "global") {
      return { action: "skipped", from: installed, to: latest, reason: `not-global: ${kind} install` };
    }

    // 8. Perform upgrade
    installGlobally();

    // 9. Hand off to new binary for project sync.
    // The new binary runs `reap update --post-upgrade` which skips self-upgrade
    // and only performs project sync with the new code. Both this and the
    // fallback below resolve `reap` on PATH, which is correct *here* and only
    // here: the global install was just replaced, so PATH's `reap` is the new
    // binary. Step 7 is what makes that true — before it, this line could hand
    // off to a binary belonging to an installation we had no business touching.
    if (!handOff(root)) {
      // Fallback: run reap update with current (old) binary
      syncHere(root);
    }

    log(`[REAP] Auto-updated: v${installed} → v${latest}`);
    return { action: "upgraded", from: installed, to: latest };
  } catch {
    // Silent — never break postinstall or session hooks
    return { action: "skipped", reason: "error" };
  }
}

/** Everything `checkAutoUpdateGuard` reaches outside itself. */
export interface GuardDeps {
  installedVersion?: () => string | null;
  minVersion?: () => string | null;
  installKind?: () => InstallKind;
  log?: (message: string) => void;
}

/**
 * Check autoUpdateMinVersion guard.
 * If installed version < minVersion from npm registry, emit a warning to stderr.
 * All errors are silently swallowed to avoid breaking postinstall/hooks.
 *
 * The install kind is looked up inside the warning branch and nowhere else,
 * because looking it up spawns `npm root -g` and only that branch needs it.
 *
 * Nothing calls this. `execute` below says why, and the backlog item decides
 * whether it gets wired up or removed — the shape of the function is written
 * for the wired-up case, which is why the lookup is placed as if this ran on
 * every session. It does not run at all.
 */
export function checkAutoUpdateGuard(deps: GuardDeps = {}): void {
  const readInstalled = deps.installedVersion ?? getInstalledVersion;
  const readMinVersion = deps.minVersion ?? queryAutoUpdateMinVersion;
  const readInstallKind = deps.installKind ?? (() => detectInstallKind().kind);
  const log = deps.log ?? ((message: string) => console.error(message));

  try {
    const installed = readInstalled();
    if (!installed || installed.includes("+dev")) return;

    const minVersion = readMinVersion();
    if (!minVersion) return;

    if (!semverGte(installed, minVersion)) {
      log(
        `[REAP] Breaking change detected: installed v${installed} < required v${minVersion}. ` +
        `Run: ${upgradeCommandFor(readInstallKind())}`
      );
    }
  } catch {
    // Silent — never break postinstall or session hooks
  }
}

/**
 * Post-install + SessionStart hook entry point.
 * - Clean up legacy v0.15 SessionStart hooks
 * - Clean up legacy v0.15 project-level skills
 * - Auto-update (skips dev builds, non-global installs, network failures, and
 *   projects that set `autoUpdate: false`)
 *
 * It does NOT call `checkAutoUpdateGuard`, which this comment claimed until
 * gen-092 looked: that function has no caller anywhere in `src/`. The floor it
 * checks is enforced by `performAutoUpdate` step 5 for anyone who reaches it,
 * and nobody sees the standalone warning. Whether to wire it up or delete it
 * is a decision on its own — see the backlog item. One input for it changed
 * here: turning auto-update off no longer means never hearing about the floor,
 * because step 6 is placed after step 5.
 *
 * Who still never hears it is whoever returns before step 5, and those cases
 * are not worth the same. The one where wiring the standalone guard up would
 * actually make a difference is step 2's `-alpha` build: `performAutoUpdate`
 * screens `+dev` and `-alpha` both, `checkAutoUpdateGuard` screens `+dev`
 * alone, so an alpha below the floor is precisely the installation the guard
 * could serve and this function cannot. Step 4's population is the opposite
 * case and not a candidate: a floor names a published version, so a copy at or
 * above the latest published one is at or above the floor and has nothing to
 * be told.
 */
export async function execute(): Promise<void> {
  const root = process.cwd();
  await cleanupLegacyHooks(root);
  await cleanupLegacyProjectSkills(root);

  // Every reason not to upgrade lives inside `performAutoUpdate`, including
  // `autoUpdate: false`, which it reads from `root`'s config. That is
  // deliberate rather than incidental: the flag has to be weighed after the
  // hard-floor warning, and only the function that owns the floor can do that.
  // Returning early from here would be the same decision spelled in a place
  // that cannot see the warning it would suppress.
  //
  // gen-043 made this call unconditional and the config field stayed behind,
  // read by nothing, for fifty generations; gen-093 wired it up.
  const result = performAutoUpdate(root);

  // Show release notice after successful upgrade
  if (result.action === "upgraded" && result.to) {
    try {
      const configPath = join(root, ".reap", "config.yml");
      const configContent = readFileSync(configPath, "utf-8");
      const config = YAML.parse(configContent) as { language?: string };
      const language = config?.language ?? "english";
      const notice = fetchReleaseNotice(result.to, language);
      if (notice) console.error(notice);
    } catch {
      // Non-fatal — config read failure should not break postinstall
    }
  }
}
