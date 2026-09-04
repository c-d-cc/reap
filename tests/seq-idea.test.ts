import { afterEach, expect, test } from "bun:test";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDirs, commit, initRepo, labelPrefix, tempDir } from "./helpers.ts";
import { run } from "../src/cli.ts";
import { assemble } from "../src/ctx.ts";

afterEach(cleanupTempDirs);

async function project(): Promise<string> {
  const root = tempDir();
  initRepo(root);
  writeFileSync(join(root, "a.txt"), "a");
  commit(root, "첫 커밋");
  await run(["init"], root);
  return root;
}

test("seq가 레지스트리 전부를 계열별로 낸다 — 이스케이프를 되돌려서", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "a | b"], root);
  await run(["make", "generation", "--milestone", "ms-001", "--title", "가"], root);
  await run(["make", "loop", "--type", "plan", "--title", "나"], root);
  const all = await run(["seq"], root);
  expect(all.ok).toBe(true);
  expect(all.message).toContain("milestone");
  expect(all.message).toContain("ms-001  a | b");
  expect(all.message).toContain("gen-0001-exec  가");
  expect(all.message).toContain("loop-0001-plan  나");
});

test("seq <type>은 한 계열만, seq <id>는 그 행만 낸다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  const gens = await run(["seq", "generation"], root);
  expect(gens.message).toContain("gen-0001-exec");
  expect(gens.message).not.toContain("ms-001");
  const one = await run(["seq", "ms-001"], root);
  expect(one.message).toContain("ms-001  가");
  expect(one.message).not.toContain("gen-0001");
  expect((await run(["seq", "ms-099"], root)).ok).toBe(false);
  expect((await run(["seq", "backlog"], root)).ok).toBe(false);
});

test("mark idea --archived가 archive/idea/<kind>/로 옮기고 status는 그대로 둔다", async () => {
  const root = await project();
  await run(["make", "idea", "--kind", "research", "--title", "물음"], root);
  const made = (await run(["make", "idea", "--kind", "freememo", "--title", "메모"], root)).data as { id: string; path: string };
  const result = await run(["mark", "idea", made.id, "--archived"], root);
  expect(result.ok).toBe(true);
  expect(existsSync(made.path)).toBe(false);
  const dest = join(root, ".reap", "archive", "idea", "freememo", `${made.id}-메모.md`);
  expect(existsSync(dest)).toBe(true);
  expect(readFileSync(dest, "utf8")).toContain("status: open");
  // 상태 줄의 개수에서 빠진다
  expect(assemble(root)).toContain("research 1");
  expect(assemble(root)).not.toContain("freememo");
});

test("archive로 내린 idea도 id로 찾을 수 있고, init이 archive/idea/를 만든다", async () => {
  const root = await project();
  expect(existsSync(join(root, ".reap", "archive", "idea"))).toBe(true);
  const made = (await run(["make", "idea", "--kind", "file", "--title", "자료"], root)).data as { id: string };
  await run(["mark", "idea", made.id, "--archived"], root);
  const again = await run(["mark", "idea", made.id, "--archived"], root);
  expect(again.ok).toBe(false);
  expect(again.message).toContain(labelPrefix("entries.idea_already_archived").trim());
});
