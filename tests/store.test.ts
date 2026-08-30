import { afterEach, expect, test } from "bun:test";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDirs, commit, git, initRepo, tempDir } from "./helpers.ts";
import {
  bindSession,
  findRoot,
  paths,
  readConfig,
  readSession,
  workspaceId,
  writeConfig,
  writeFileAtomic,
} from "../src/store.ts";

afterEach(cleanupTempDirs);

function seed(): string {
  const root = tempDir();
  mkdirSync(join(root, ".reap"), { recursive: true });
  return root;
}

test("findRoot는 하위 디렉토리에서 조상을 찾는다", () => {
  const root = seed();
  const deep = join(root, "a", "b", "c");
  mkdirSync(deep, { recursive: true });
  expect(findRoot(deep)).toBe(root);
  expect(findRoot(root)).toBe(root);
});

test("findRoot는 .reap가 없으면 null이다", () => {
  expect(findRoot(tempDir())).toBe(null);
});

test("같은 리포의 두 worktree가 같은 workspace-id를 낸다", () => {
  const dir = tempDir();
  initRepo(dir);
  writeFileSync(join(dir, "a.txt"), "a");
  commit(dir, "첫 커밋");
  const wt = join(tempDir(), "wt");
  git(dir, "worktree", "add", "-q", wt);
  const id = workspaceId(dir);
  expect(id).toMatch(/^[0-9a-f]{12}$/);
  expect(workspaceId(wt)).toBe(id);
});

test("서로 다른 리포는 다른 workspace-id를 낸다", () => {
  const a = tempDir();
  const b = tempDir();
  initRepo(a);
  initRepo(b);
  expect(workspaceId(a)).not.toBe(workspaceId(b));
});

test("config를 왕복시킨다", () => {
  const root = seed();
  writeConfig(root, { language: "ko", agentClient: "claude-code", workspaceId: "abcdef012345" });
  expect(readConfig(root)).toEqual({
    language: "ko",
    agentClient: "claude-code",
    workspaceId: "abcdef012345",
  });
});

test("REAP_SESSION이 .session의 sessionId를 이긴다", () => {
  const root = seed();
  bindSession(root, "gen-0001-exec", "ms-001", {});
  expect(readSession(root, {}).sessionId).not.toBe("env-session");
  expect(readSession(root, { REAP_SESSION: "env-session" }).sessionId).toBe("env-session");
  expect(readSession(root, { REAP_SESSION: "env-session" }).generation).toBe("gen-0001-exec");
});

test("bindSession은 병합하지 않는다 — 직전 milestone이 남지 않는다", () => {
  const root = seed();
  bindSession(root, "gen-0001-exec", "ms-001", {});
  expect(readSession(root, {}).milestone).toBe("ms-001");
  bindSession(root, "gen-0002-plan", undefined, {});
  const s = readSession(root, {});
  expect(s.generation).toBe("gen-0002-plan");
  expect(s.milestone).toBeUndefined();
});

test("반복 바인딩에도 sessionId가 유지되고 비어 있지 않다", () => {
  const root = seed();
  bindSession(root, "gen-0001-exec", "ms-001", {});
  const first = readSession(root, {}).sessionId;
  expect(first).not.toBe("");
  bindSession(root, "gen-0003-exec", "ms-001", {});
  bindSession(root, "gen-0002-plan", undefined, {});
  expect(readSession(root, {}).sessionId).toBe(first);
});

test("바인딩이 없어도 readSession은 실패하지 않는다", () => {
  const root = seed();
  const s = readSession(root, {});
  expect(s.sessionId).not.toBe("");
  expect(s.generation).toBeUndefined();
});

test("writeFileAtomic이 내용을 그대로 쓰고 임시 파일을 남기지 않는다", () => {
  const root = seed();
  const target = join(root, ".reap", "x.md");
  writeFileAtomic(target, "가\n나\n");
  writeFileAtomic(target, "다\n");
  expect(readFileSync(target, "utf8")).toBe("다\n");
  expect(readdirSync(join(root, ".reap"))).toEqual(["x.md"]);
});

test("경로는 vision · life · archive 3단으로 선다", () => {
  const root = tempDir();
  const p = paths(root);
  const at = (...parts: string[]) => join(root, ".reap", ...parts);

  expect(p.memory).toBe(at("vision", "memory"));
  expect(p.milestones).toBe(at("vision", "milestones"));

  expect(p.generations).toBe(at("life", "generations"));
  expect(p.backlog).toBe(at("life", "backlog"));

  expect(p.archiveMilestones).toBe(at("archive", "milestones"));
  expect(p.archiveGenerations).toBe(at("archive", "generations"));
});

// plan source는 리포 밖을 가리키는 등록부라 "하려는 것 / 사는 것 / 끝난 것" 시간축에
// 얹히지 않는다. 그래서 genome/·environment/·idea/처럼 최상위에 나란히 선다.
test("plan은 3단 밖에서 최상위로 선다", () => {
  const root = tempDir();
  const p = paths(root);
  const at = (...parts: string[]) => join(root, ".reap", ...parts);

  expect(p.plan).toBe(at("plan"));
  expect(p.planSources).toBe(at("plan", "sources.yml"));
  expect(p.planConventions).toBe(at("plan", "conventions"));
});

test("map은 .reap 바로 아래다 — 3단 어디에도 속하지 않는다", () => {
  const root = tempDir();
  expect(paths(root).map).toBe(join(root, ".reap", "map.md"));
});
