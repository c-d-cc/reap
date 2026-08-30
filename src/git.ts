import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { dirname } from "node:path";

/** git 호출의 유일한 창구. 실패는 전부 null/false로 접어 부르는 쪽이 분기를 갖지 않게 한다. */
function run(cwd: string, args: string[]): string | null {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

export function isRepo(cwd: string): boolean {
  return run(cwd, ["rev-parse", "--is-inside-work-tree"]) === "true";
}

/** 커밋이 하나도 없으면 null. 갓 init한 리포에서 정상적으로 발생한다. */
export function head(cwd: string): string | null {
  return run(cwd, ["rev-parse", "--short", "HEAD"]);
}

export function isClean(cwd: string): boolean {
  const status = run(cwd, ["status", "--porcelain"]);
  return status === "";
}

/**
 * worktree들이 공유하는 주 리포의 부모 경로. workspace-id의 재료다.
 * 심링크를 정규화하지 않으면 같은 리포가 두 값으로 갈라진다 (macOS의 /var).
 */
export function commonDirParent(cwd: string): string | null {
  if (!isRepo(cwd)) return null;
  const common = run(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  if (!common) return null;
  try {
    return realpathSync(dirname(common));
  } catch {
    return dirname(common);
  }
}
