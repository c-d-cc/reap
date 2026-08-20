import { existsSync } from "fs";
import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

/**
 * Where the indexer's two kinds of shipped asset live.
 *
 * Both answers are resolved from `import.meta.url` one level up, which is the
 * rule the rest of REAP already uses (`migrationTemplatesDir`,
 * `copyArtifactTemplate`):
 *
 *   dev:    src/indexer/assets.ts   → dirname = src/indexer   → ../  = src/
 *   bundle: dist/cli/index.js       → dirname = dist/cli      → ../  = dist/
 *
 * The bundle collapses every module into `dist/cli/index.js`, so `import.meta.url`
 * stops reflecting where the code was written — a helper that reaches a different
 * number of levels in the two cases silently resolves to the directory *above*
 * the package once published. That is exactly how the daemon's query lookup
 * broke. Keeping the arithmetic identical in both cases means it cannot.
 */
function assetRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..");
}

/**
 * The tree-sitter tag queries (`*-tags.scm`).
 *
 * They are text, so they live in the repository under `src/templates/tree-sitter/`
 * and ride the wholesale `cp -r src/templates dist/` that `scripts/build.sh`
 * already performs. Nothing extra to keep in sync.
 */
export function queriesDir(): string {
  return join(assetRoot(), "templates", "tree-sitter");
}

/**
 * The compiled grammars (`tree-sitter-<lang>.wasm`).
 *
 * These are 26.6 MB of binaries, so they are NOT committed. `tree-sitter-wasms`
 * is a devDependency and `scripts/build.sh` copies exactly the grammars REAP
 * supports into `dist/grammars/` — the published tarball therefore carries 15
 * grammars (+2.4 MB gzipped) rather than the package's full 36 (+4.4 MB), and
 * nothing resolves `tree-sitter-wasms` at runtime.
 *
 * In a source checkout `dist/grammars/` may not exist yet, so fall back to the
 * devDependency itself. The fallback is by *existence*, not by guessing which
 * situation we are in — a check that reasons about its own location is the
 * failure mode this module exists to avoid.
 */
export function grammarsDir(): string {
  const bundled = join(assetRoot(), "grammars");
  if (existsSync(bundled)) return bundled;
  try {
    const require = createRequire(import.meta.url);
    return join(dirname(require.resolve("tree-sitter-wasms/package.json")), "out");
  } catch {
    return bundled;
  }
}
