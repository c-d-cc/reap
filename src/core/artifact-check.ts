import { readTextFile } from "./fs.js";

// ── Types ────────────────────────────────────────────────────

export interface ArtifactCheckResult {
  filled: string[];
  unfilled: string[];
}

// ── Constants ────────────────────────────────────────────────

/**
 * Stages to check before validation (normal lifecycle).
 */
const PRE_VALIDATION_NORMAL: Record<string, string> = {
  learning: "01-learning.md",
  planning: "02-planning.md",
  implementation: "03-implementation.md",
};

/**
 * Stages to check before validation (merge lifecycle).
 */
const PRE_VALIDATION_MERGE: Record<string, string> = {
  detect: "01-detect.md",
  mate: "02-mate.md",
  merge: "03-merge.md",
  reconcile: "04-reconcile.md",
};

/**
 * Pattern matching core section placeholders in artifact templates.
 * Must be a standalone HTML comment on its own line (not inline text mentioning the pattern).
 * These MUST be replaced with actual content for the artifact to be considered filled.
 * Optional placeholders (<!-- Optional — ... -->) are intentionally excluded.
 */
const CORE_PLACEHOLDER_PATTERN = /^<!-- Core section\..+-->\s*$/gm;

// ── Public API ───────────────────────────────────────────────

/**
 * Check whether pre-validation artifacts have been filled with actual content.
 *
 * An artifact is considered "unfilled" if it still contains any
 * `<!-- Core section. ... -->` placeholder from the template.
 * Optional placeholders are ignored since they may be intentionally left.
 *
 * @param artifactPath - Function that resolves artifact filename to full path
 * @param isMerge - Whether this is a merge lifecycle
 * @returns Object with filled and unfilled artifact filenames
 */
export async function checkArtifactsFilled(
  artifactPath: (name: string) => string,
  isMerge?: boolean,
): Promise<ArtifactCheckResult> {
  const map = isMerge ? PRE_VALIDATION_MERGE : PRE_VALIDATION_NORMAL;
  const filled: string[] = [];
  const unfilled: string[] = [];

  for (const [, filename] of Object.entries(map)) {
    const content = await readTextFile(artifactPath(filename));

    if (!content || isUnfilled(content)) {
      unfilled.push(filename);
    } else {
      filled.push(filename);
    }
  }

  return { filled, unfilled };
}

// ── Internal ─────────────────────────────────────────────────

/**
 * Determine if artifact content is unfilled (template-only).
 * Returns true if any core section placeholder remains.
 */
function isUnfilled(content: string): boolean {
  const matches = content.match(CORE_PLACEHOLDER_PATTERN);
  return matches !== null && matches.length > 0;
}
