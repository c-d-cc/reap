/**
 * The one place REAP compares versions.
 *
 * There were two before gen-085, and they disagreed. `check-version.ts` split
 * on "." and mapped `Number`, so "0.2.0-beta.1" became [0, 2, NaN, 1]; NaN
 * compares false in both directions, the loop fell through, and the function
 * answered "equal" — a prerelease satisfied any floor of its own release.
 * `migration.ts` used `parseInt(s, 10) || 0`, which gets that one case right by
 * accident and "1.0.0-beta" vs "1.0.0-alpha" wrong. Run against the ordering
 * example in SemVer 2.0.0 §11, both got all seven adjacent pairs wrong.
 *
 * That mattered because the floors are real: `autoUpdateMinVersion` decides
 * whether reap upgrades itself, `MIN_DAEMON_VERSION` decides whether the daemon
 * is usable, and this repository publishes prereleases from
 * `scripts/alpha-publish.sh`.
 *
 * Rules implemented here are SemVer 2.0.0 §9-11:
 *
 *   - build metadata (`+...`) is ignored for precedence
 *   - the numeric core decides first
 *   - a version WITH a prerelease is lower than the same version without one
 *   - prerelease identifiers compare left to right; numeric ones numerically,
 *     others by ASCII order, a numeric identifier below a non-numeric one, and
 *     a longer identifier list above a shorter one that it starts with
 *
 * Deliberately not a dependency. REAP ships one production dependency (`yaml`)
 * and the comparison is forty lines; adding a package to a supply chain kept
 * this small would cost more than it saves.
 */

/** A version's `X.Y.Z` core, with any prerelease and build metadata removed. */
export function semverCore(version: string): string {
  return version.split("+")[0]!.split("-")[0]!;
}

/** The prerelease identifiers, or `[]` for a release version. */
function prereleaseIdentifiers(version: string): string[] {
  const withoutBuild = version.split("+")[0]!;
  const dash = withoutBuild.indexOf("-");
  if (dash === -1) return [];
  const raw = withoutBuild.slice(dash + 1);
  return raw === "" ? [] : raw.split(".");
}

/** The three numeric core segments; anything missing or unparseable is 0. */
function coreSegments(version: string): [number, number, number] {
  const parts = semverCore(version).split(".");
  const at = (i: number) => {
    const n = Number.parseInt(parts[i] ?? "", 10);
    return Number.isFinite(n) ? n : 0;
  };
  return [at(0), at(1), at(2)];
}

const NUMERIC = /^\d+$/;

function compareIdentifiers(a: string, b: string): number {
  const aNum = NUMERIC.test(a);
  const bNum = NUMERIC.test(b);
  // "Numeric identifiers always have lower precedence than alphanumeric ones."
  if (aNum && !bNum) return -1;
  if (!aNum && bNum) return 1;
  if (aNum && bNum) {
    const na = Number.parseInt(a, 10);
    const nb = Number.parseInt(b, 10);
    return na === nb ? 0 : na < nb ? -1 : 1;
  }
  return a === b ? 0 : a < b ? -1 : 1;
}

/**
 * Precedence order: -1 when `a` sorts below `b`, 1 above, 0 equal.
 *
 * Equal means equal *in precedence* — "1.0.0+dev" and "1.0.0" return 0 while
 * being different strings, which is what the spec asks for.
 */
export function semverCompare(a: string, b: string): -1 | 0 | 1 {
  const ca = coreSegments(a);
  const cb = coreSegments(b);
  for (let i = 0; i < 3; i++) {
    if (ca[i]! > cb[i]!) return 1;
    if (ca[i]! < cb[i]!) return -1;
  }

  const pa = prereleaseIdentifiers(a);
  const pb = prereleaseIdentifiers(b);
  // A release outranks any prerelease of the same core.
  if (pa.length === 0 && pb.length === 0) return 0;
  if (pa.length === 0) return 1;
  if (pb.length === 0) return -1;

  const shared = Math.min(pa.length, pb.length);
  for (let i = 0; i < shared; i++) {
    const verdict = compareIdentifiers(pa[i]!, pb[i]!);
    if (verdict !== 0) return verdict < 0 ? -1 : 1;
  }
  // "A larger set of pre-release fields has a higher precedence than a smaller
  // set, if all of the preceding identifiers are equal."
  if (pa.length === pb.length) return 0;
  return pa.length > pb.length ? 1 : -1;
}

/** True when `a` sorts strictly above `b`. */
export function semverGt(a: string, b: string): boolean {
  return semverCompare(a, b) === 1;
}

/** True when `a` sorts at or above `b`. */
export function semverGte(a: string, b: string): boolean {
  return semverCompare(a, b) >= 0;
}
