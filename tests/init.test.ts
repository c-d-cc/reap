import { afterEach, expect, test } from "bun:test";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDirs, initRepo, tempDir } from "./helpers.ts";
import { run } from "../src/cli.ts";
import { DIRS, readConfig, SEEDS } from "../src/store.ts";
import { t } from "../src/i18n.ts";

afterEach(cleanupTempDirs);

test("init이 저장 구조의 디렉토리를 전부 만들고 지식 파일이 비어 있지 않다", async () => {
  const root = tempDir();
  initRepo(root);
  const result = await run(["init"], root);
  expect(result.ok).toBe(true);
  for (const dir of DIRS) expect(existsSync(join(root, ".reap", dir))).toBe(true);
  for (const file of Object.keys(SEEDS)) {
    expect(readFileSync(join(root, ".reap", file), "utf8").length).toBeGreaterThan(0);
  }
});

test("init이 config.yml에 workspace-id를 채운다", async () => {
  const root = tempDir();
  initRepo(root);
  await run(["init"], root);
  const config = readConfig(root);
  expect(config.workspaceId).toMatch(/^[0-9a-f]{12}$/);
  expect(config.language).toBe("en");
  expect(config.agentClient).toBe("claude-code");
});

test("git 리포가 아니어도 init이 동작한다", async () => {
  const root = tempDir();
  const result = await run(["init"], root);
  expect(result.ok).toBe(true);
  expect(readConfig(root).workspaceId).toMatch(/^[0-9a-f]{12}$/);
});

test("이미 초기화된 곳에서는 거부한다", async () => {
  const root = tempDir();
  expect((await run(["init"], root)).ok).toBe(true);
  const again = await run(["init"], root);
  expect(again.ok).toBe(false);
});

test("--force는 빠진 것만 채우고 기존 파일을 덮어쓰지 않는다", async () => {
  const root = tempDir();
  await run(["init"], root);
  const application = join(root, ".reap", "genome", "application.md");
  writeFileSync(application, "사람이 쓴 것\n");
  const lessons = join(root, ".reap", "vision", "memory", "lessons.md");
  writeFileSync(lessons, "");
  const result = await run(["init", "--force"], root);
  expect(result.ok).toBe(true);
  expect(readFileSync(application, "utf8")).toBe("사람이 쓴 것\n");
  expect(readFileSync(lessons, "utf8")).toBe("");
});

test(".gitignore에 .session 한 줄을 더하되 중복하지 않는다", async () => {
  const root = tempDir();
  await run(["init"], root);
  const gitignore = join(root, ".gitignore");
  const lines = readFileSync(gitignore, "utf8").split("\n").filter((l) => l.trim() === ".reap/.session");
  expect(lines.length).toBe(1);
  await run(["init", "--force"], root);
  const after = readFileSync(gitignore, "utf8").split("\n").filter((l) => l.trim() === ".reap/.session");
  expect(after.length).toBe(1);
});

test("모르는 명령은 실패를 돌려주되 던지지 않는다", async () => {
  const result = await run(["없는명령"], tempDir());
  expect(result.ok).toBe(false);
  expect(result.message.length).toBeGreaterThan(0);
});

test("init --check는 씨앗 그대로인 파일만 보고하고 아무것도 쓰지 않는다", async () => {
  const root = tempDir();
  await run(["init"], root);
  const application = join(root, ".reap", "genome", "application.md");
  writeFileSync(application, "# Application\n\n실제 내용\n");
  const before = readFileSync(join(root, ".reap", "genome", "evolution.md"), "utf8");
  const result = await run(["init", "--check"], root);
  expect(result.ok).toBe(true);
  expect(result.message).toContain("genome/evolution.md");
  expect(result.message).toContain("environment/summary.md");
  expect(result.message).not.toContain("genome/application.md");
  expect(readFileSync(join(root, ".reap", "genome", "evolution.md"), "utf8")).toBe(before);
  expect((result.data as { seeds: string[] }).seeds).toContain("genome/invariants.md");
});

test("init --check는 전부 채워졌으면 그렇다고 말한다", async () => {
  const root = tempDir();
  await run(["init"], root);
  for (const file of Object.keys(SEEDS)) writeFileSync(join(root, ".reap", file), "# 채움\n");
  const result = await run(["init", "--check"], root);
  expect(result.ok).toBe(true);
  expect(result.message).toContain(t(root, "cli.no_seeds_remaining"));
});

test("--version이 package.json의 버전을 낸다 — issue를 올릴 때 쓴다", async () => {
  const result = await run(["--version"], tempDir());
  expect(result.ok).toBe(true);
  expect(result.message).toMatch(/^reap \d+\.\d+\.\d+$/);
});

test("init이 hooks/conditions/always.sh를 실행 비트와 함께 놓지만 씨앗 목록에는 넣지 않는다", async () => {
  const root = tempDir();
  await run(["init"], root);
  const always = join(root, ".reap", "hooks", "conditions", "always.sh");
  expect(existsSync(always)).toBe(true);
  expect(readFileSync(always, "utf8").length).toBeGreaterThan(0);
  expect(statSync(always).mode & 0o111).not.toBe(0);
  expect(Object.keys(SEEDS)).not.toContain("hooks/conditions/always.sh");
  const check = await run(["init", "--check"], root);
  expect(check.message).not.toContain("always.sh");
});

test("init --force가 이미 있는 always.sh를 건드리지 않는다", async () => {
  const root = tempDir();
  await run(["init"], root);
  const always = join(root, ".reap", "hooks", "conditions", "always.sh");
  writeFileSync(always, "#!/usr/bin/env bash\nexit 1\n");
  await run(["init", "--force"], root);
  expect(readFileSync(always, "utf8")).toBe("#!/usr/bin/env bash\nexit 1\n");
});
