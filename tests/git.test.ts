import { afterEach, expect, test } from "bun:test";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDirs, commit, git, initRepo, tempDir } from "./helpers.ts";
import { commonDirParent, head, isClean, isRepo } from "../src/git.ts";

afterEach(cleanupTempDirs);

test("git이 아닌 디렉토리를 리포로 보지 않는다", () => {
  expect(isRepo(tempDir())).toBe(false);
  expect(head(tempDir())).toBe(null);
  expect(commonDirParent(tempDir())).toBe(null);
});

test("커밋 전에는 head가 null이고 커밋 후에는 짧은 해시다", () => {
  const dir = tempDir();
  initRepo(dir);
  expect(isRepo(dir)).toBe(true);
  expect(head(dir)).toBe(null);
  writeFileSync(join(dir, "a.txt"), "a");
  const sha = commit(dir, "첫 커밋");
  expect(head(dir)).toBe(sha);
});

test("isClean은 변경이 없을 때만 참이다", () => {
  const dir = tempDir();
  initRepo(dir);
  writeFileSync(join(dir, "a.txt"), "a");
  commit(dir, "첫 커밋");
  expect(isClean(dir)).toBe(true);
  writeFileSync(join(dir, "a.txt"), "b");
  expect(isClean(dir)).toBe(false);
});

test("commonDirParent는 worktree에서도 주 리포를 가리킨다", () => {
  const dir = tempDir();
  initRepo(dir);
  writeFileSync(join(dir, "a.txt"), "a");
  commit(dir, "첫 커밋");
  const wt = join(tempDir(), "wt");
  git(dir, "worktree", "add", "-q", wt);
  expect(commonDirParent(wt)).toBe(commonDirParent(dir));
  expect(commonDirParent(dir)).toBe(dir);
});
