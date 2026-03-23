import { readFileSync } from "fs";
import { join } from "path";

/**
 * Extract language-specific section from notice body.
 * Looks for `## {lang}` header and extracts content until next `## ` header.
 * Returns null if no matching section found.
 */
export function extractLanguageSection(body: string, language: string): string | null {
  const lang = language.toLowerCase();
  const pattern = new RegExp(`^## ${lang}\\s*$`, "im");
  const match = pattern.exec(body);
  if (!match) return null;

  const start = match.index + match[0].length;
  const rest = body.slice(start);
  const nextHeader = rest.search(/^## /m);
  const section = nextHeader === -1 ? rest : rest.slice(0, nextHeader);
  return section.trim() || null;
}

/**
 * Parse UPDATE_NOTICE.md to find the URL for a given version.
 * Format: `- vX.Y.Z: <url>`
 */
function findNoticeUrl(version: string): string | null {
  try {
    const noticePath = join(__dirname, "../../UPDATE_NOTICE.md");
    const content = readFileSync(noticePath, "utf-8");
    const versionTag = version.startsWith("v") ? version : `v${version}`;
    const pattern = new RegExp(`^- ${versionTag.replace(/\./g, "\\.")}:\\s*(.+)$`, "m");
    const match = pattern.exec(content);
    return match?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch the body text from a GitHub Discussions URL.
 * Uses the GitHub API (no gh CLI dependency).
 */
async function fetchDiscussionBody(url: string): Promise<string | null> {
  try {
    // Extract discussion number from URL: .../discussions/123
    const match = url.match(/discussions\/(\d+)/);
    if (!match) return null;

    const res = await fetch(
      `https://api.github.com/repos/c-d-cc/reap/discussions/${match[1]}`,
      {
        headers: { Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(5_000),
      },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as { body?: string };
    return data.body?.trim() ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch release notice for the given version.
 * Reads UPDATE_NOTICE.md for URL, fetches from GitHub, extracts language section.
 * Returns formatted notice string, or null if not found or on any error.
 */
export async function fetchReleaseNotice(version: string, language: string): Promise<string | null> {
  const url = findNoticeUrl(version);
  if (!url) return null;

  const body = await fetchDiscussionBody(url);
  if (!body) return null;

  const versionTag = version.startsWith("v") ? version : `v${version}`;
  const section = extractLanguageSection(body, language);
  const content = section ?? body;
  if (!content) return null;

  return `\n--- Release Notes (${versionTag}) ---\n${content}\n`;
}
