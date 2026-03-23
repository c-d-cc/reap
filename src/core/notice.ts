import { execSync } from "child_process";

const REPO = "c-d-cc/reap";
const GRAPHQL_TIMEOUT = 5_000;

/**
 * Extract language-specific section from discussion body.
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
 * Fetch release notice for the given version from GitHub Discussions.
 * Returns formatted notice string, or null if not found or on any error.
 */
export function fetchReleaseNotice(version: string, language: string): string | null {
  try {
    const query = `query {
  repository(owner: "${REPO.split("/")[0]}", name: "${REPO.split("/")[1]}") {
    discussions(first: 10, categoryId: null, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes { title body }
    }
  }
}`;
    const result = execSync(
      `gh api graphql -f query='${query.replace(/\n/g, " ")}'`,
      { encoding: "utf-8", timeout: GRAPHQL_TIMEOUT, stdio: ["pipe", "pipe", "pipe"] },
    );
    const data = JSON.parse(result);
    const discussions = data?.data?.repository?.discussions?.nodes;
    if (!Array.isArray(discussions)) return null;

    const versionTag = version.startsWith("v") ? version : `v${version}`;
    const target = discussions.find((d: { title: string }) => d.title.includes(versionTag));
    if (!target) return null;

    const section = extractLanguageSection(target.body, language);
    const content = section ?? target.body?.trim();
    if (!content) return null;

    return `\n--- Release Notes (${versionTag}) ---\n${content}\n`;
  } catch {
    return null;
  }
}
