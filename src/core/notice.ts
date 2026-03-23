import { readFileSync } from "fs";
import { join, dirname } from "path";

/**
 * Find the package root by locating package.json via require.resolve.
 */
function findPackageRoot(): string {
  try {
    // Works in both dev (bun) and production (node, npm global install)
    const pkgPath = require.resolve("@c-d-cc/reap/package.json");
    return dirname(pkgPath);
  } catch {
    // Fallback: assume CWD has RELEASE_NOTICE.md (dev mode)
    return process.cwd();
  }
}

/**
 * Read release notice for the given version from RELEASE_NOTICE.md.
 * Format:
 *   ## vX.Y.Z
 *   ### en
 *   English notice
 *   ### ko
 *   Korean notice
 *
 * Returns formatted notice string, or null if not found.
 */
export function fetchReleaseNotice(version: string, language: string): string | null {
  try {
    const noticePath = join(findPackageRoot(), "RELEASE_NOTICE.md");
    const content = readFileSync(noticePath, "utf-8");
    const versionTag = version.startsWith("v") ? version : `v${version}`;

    // Find version section: ## vX.Y.Z
    const versionPattern = new RegExp(`^## ${versionTag.replace(/\./g, "\\.")}\\s*$`, "m");
    const versionMatch = versionPattern.exec(content);
    if (!versionMatch) return null;

    // Extract content until next ## vX.Y.Z header
    const start = versionMatch.index + versionMatch[0].length;
    const rest = content.slice(start);
    const nextVersion = rest.search(/^## v/m);
    const section = nextVersion === -1 ? rest : rest.slice(0, nextVersion);

    // Find language subsection: ### en or ### ko
    const lang = language.toLowerCase();
    const langPattern = new RegExp(`^### ${lang}\\s*$`, "im");
    const langMatch = langPattern.exec(section);
    if (!langMatch) {
      const trimmed = section.trim();
      return trimmed ? `\n--- Release Notes (${versionTag}) ---\n${trimmed}\n` : null;
    }

    const langStart = langMatch.index + langMatch[0].length;
    const langRest = section.slice(langStart);
    const nextLang = langRest.search(/^### /m);
    const langSection = (nextLang === -1 ? langRest : langRest.slice(0, nextLang)).trim();
    if (!langSection) return null;

    return `\n--- Release Notes (${versionTag}) ---\n${langSection}\n`;
  } catch {
    return null;
  }
}
