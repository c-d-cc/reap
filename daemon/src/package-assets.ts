import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

/**
 * The root of this package, from wherever the daemon happens to be running.
 *
 *   sources: <pkg>/src/package-assets.ts  → one level up
 *   bundle:  <pkg>/dist/index.js          → one level up
 *
 * The two agree only because this module sits directly under src/. Anything
 * deeper needs a different number of steps once bundled, since the bundle
 * collapses every module into dist/index.js and `import.meta.url` stops
 * reflecting where the code was written. That is what broke the query lookup:
 * it lived in src/indexer/ and reached two levels up, which meant the package
 * root from the sources and the directory *above* the package from the bundle.
 *
 * Keeping the resolution here, at a depth where both answers coincide, means
 * callers cannot get it wrong by moving.
 */
export function packageRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..");
}

/** Where the .scm tag queries ship. */
export function queriesDir(): string {
  return join(packageRoot(), "queries");
}

let cachedVersion: string | null = null;

/**
 * This package's own version, read from the package.json that ships with it.
 *
 * Reported on /health so a caller can tell which build is answering — a daemon
 * stays resident for 30 idle minutes, so the process serving requests is not
 * necessarily the version currently installed. package.json is the single owner
 * of the number; nothing else in the daemon restates it.
 */
export function packageVersion(): string {
  if (cachedVersion !== null) return cachedVersion;
  try {
    const raw = readFileSync(join(packageRoot(), "package.json"), "utf-8");
    cachedVersion = (JSON.parse(raw).version as string) ?? "unknown";
  } catch {
    cachedVersion = "unknown";
  }
  return cachedVersion;
}
