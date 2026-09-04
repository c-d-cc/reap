import { execFileSync } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { en } from "../src/messages/en.ts";
import type { MessageKey } from "../src/i18n.ts";

/** 카탈로그 문구의 `{param}` 앞부분만 뗀다 — 값을 모르고 딱지의 존재만 확인할 때 쓴다. */
export function labelPrefix(key: MessageKey): string {
  return en[key].split("{")[0]!;
}

const created: string[] = [];

/** macOS의 /var는 /private/var의 심링크다. 정규화하지 않으면 같은 경로가 두 값으로 해싱된다. */
export function tempDir(prefix = "reap-"): string {
  const dir = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), prefix)));
  created.push(dir);
  return dir;
}

export function cleanupTempDirs(): void {
  for (const dir of created.splice(0)) rmSync(dir, { recursive: true, force: true });
}

export function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

export function initRepo(cwd: string): void {
  git(cwd, "init", "-q", "-b", "main");
  git(cwd, "config", "user.email", "test@example.com");
  git(cwd, "config", "user.name", "test");
}

export function commit(cwd: string, message: string): string {
  git(cwd, "add", "-A");
  git(cwd, "commit", "-q", "-m", message);
  return git(cwd, "rev-parse", "--short", "HEAD");
}
