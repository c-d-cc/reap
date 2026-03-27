import { execSync } from "child_process";

const REPO = "c-d-cc/reap";

/**
 * Attempt to create a GitHub issue automatically when an unexpected error occurs.
 * This is best-effort — failures are silently ignored.
 *
 * @param command - The CLI command that failed (e.g. "run learning")
 * @param error - The error that occurred
 * @param extraLabels - Additional labels beyond "auto-reported,bug"
 */
export function autoReport(
  command: string,
  error: unknown,
  extraLabels?: string[],
): void {
  try {
    const version = process.env.__REAP_VERSION__ || "unknown";
    const errMsg = error instanceof Error ? error.message : String(error);
    const title = `[auto] ${command}: ${errMsg.slice(0, 80)}`;
    const labels = ["auto-reported", "bug", ...(extraLabels ?? [])].join(",");
    const body = [
      `**REAP Version**: ${version}`,
      `**Command**: ${command}`,
      `**Error**: ${errMsg}`,
      `**OS**: ${process.platform} ${process.arch}`,
      `**Node**: ${process.version}`,
    ].join("\n");

    // Escape double quotes in title and body for shell safety
    const safeTitle = title.replace(/"/g, '\\"');
    const safeBody = body.replace(/"/g, '\\"');

    execSync(
      `gh issue create --repo ${REPO} --title "${safeTitle}" --label "${labels}" --body "${safeBody}"`,
      { stdio: "ignore", timeout: 10_000 },
    );
  } catch {
    // Best-effort — silently ignore any failure (gh not installed, auth issues, network, etc.)
  }
}
