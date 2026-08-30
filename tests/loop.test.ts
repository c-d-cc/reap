import { afterEach, expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDirs, commit, initRepo, tempDir } from "./helpers.ts";
import { run } from "../src/cli.ts";
import { assemble } from "../src/ctx.ts";
import { parseDoc } from "../src/doc.ts";
import { issue, kindOf, loopTypeOf, readRegistry } from "../src/id.ts";
import { readSession } from "../src/store.ts";

afterEach(cleanupTempDirs);

async function project(): Promise<string> {
  const root = tempDir();
  initRepo(root);
  writeFileSync(join(root, "a.txt"), "a");
  commit(root, "첫 커밋");
  await run(["init"], root);
  return root;
}

function read(root: string, ...parts: string[]) {
  return parseDoc(readFileSync(join(root, ".reap", ...parts), "utf8"));
}

function loops(root: string, where: "life/loops" | "archive/loops"): string[] {
  return readdirSync(join(root, ".reap", where)).filter((n) => n.endsWith(".md")).sort();
}

test("loop id는 유형을 품고 gen과 다른 계열이다", () => {
  expect(kindOf("loop-0001-plan")).toBe("loop");
  expect(kindOf("loop-0002-design")).toBe("loop");
  expect(kindOf("loop-0003-uiux")).toBe("loop");
  expect(kindOf("loop-0004-idea")).toBe("loop");
  expect(kindOf("loop-0001")).toBe(null);
  expect(kindOf("loop-0001-exec")).toBe(null);
  expect(loopTypeOf("loop-0002-design")).toBe("design");
  expect(loopTypeOf("gen-0002-exec")).toBe(null);
});

test("gen-NNNN-plan은 계속 인식된다 — 발급만 막는다", () => {
  expect(kindOf("gen-0045-plan")).toBe("generation");
});

test("make loop가 손으로 쓴 loop-0001과 같은 모양을 만든다 — 세션에 바인딩하지 않는다", async () => {
  const root = await project();
  writeFileSync(join(root, ".reap", "plan", "sources.yml"), "sources:\n  - id: ps-4f2a91\n    root: .\n    role: r\n    convention: c.md\n");
  const result = await run(
    ["make", "loop", "--type", "plan", "--title", "plan loop", "--from", "gen-0046-plan", "--ref", "ps-4f2a91:a.txt"],
    root,
  );
  expect(result.ok).toBe(true);
  const { data, body } = read(root, "life", "loops", "loop-0001-plan-plan-loop.md");
  expect(body).toBe("");
  expect(data.id).toBe("loop-0001-plan");
  expect(data.slug).toBe("plan-loop");
  expect(data.type).toBe("plan");
  expect(data.title).toBe("plan loop");
  expect(data.from).toBe("gen-0046-plan");
  expect(data.refs).toEqual(["ps-4f2a91:a.txt"]);
  expect(data.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  expect(data.startCommit).toMatch(/^[0-9a-f]{7,}$/);
  expect(data.status).toBe("open");
  expect(data.milestones).toEqual([]);
  expect(readSession(root, {}).generation).toBeUndefined();
  expect(readRegistry(root, "loop").map((r) => r.id)).toEqual(["loop-0001-plan"]);
  const header = readFileSync(join(root, ".reap", "sequence", "loop.md"), "utf8").split("\n")[0];
  expect(header).toContain("reap:sequence(loop)");
});

test("make loop는 유형이 필수이고 모르는 유형은 거부한다", async () => {
  const root = await project();
  expect((await run(["make", "loop", "--title", "가"], root)).ok).toBe(false);
  const bad = await run(["make", "loop", "--type", "exec", "--title", "가"], root);
  expect(bad.ok).toBe(false);
  expect(bad.message).toContain("plan");
});

test("loop는 여럿이 나란히 열리고 하나의 계열에서 번호를 받는다", async () => {
  const root = await project();
  await run(["make", "loop", "--type", "plan", "--title", "가"], root);
  await run(["make", "loop", "--type", "idea", "--title", "나"], root);
  expect(loops(root, "life/loops")).toEqual(["loop-0001-plan-가.md", "loop-0002-idea-나.md"]);
});

test("make generation --plan은 거부하고 make loop를 가리킨다", async () => {
  const root = await project();
  const result = await run(["make", "generation", "--plan", "--title", "가"], root);
  expect(result.ok).toBe(false);
  expect(result.message).toContain("make loop");
});

test("mark loop --closed가 closedAt·milestones·status를 찍고 파일은 life/loops/에 남긴다", async () => {
  const root = await project();
  await run(["make", "loop", "--type", "plan", "--title", "가"], root);
  const result = await run(["mark", "loop", "loop-0001-plan", "--closed", "--milestone", "ms-012", "--milestone", "ms-013"], root);
  expect(result.ok).toBe(true);
  const { data } = read(root, "life", "loops", "loop-0001-plan-가.md");
  expect(data.status).toBe("closed");
  expect(data.closedAt).toMatch(/^\d{4}-\d{2}-\d{2}T[\d:]+Z$/);
  expect(data.milestones).toEqual(["ms-012", "ms-013"]);
  expect(loops(root, "archive/loops")).toEqual([]);
});

test("닫힌 loop가 10개를 넘으면 오래된 것부터 archive/loops/로 — 열린 loop는 옮기지 않는다", async () => {
  const root = await project();
  await run(["make", "loop", "--type", "idea", "--title", "열린것"], root);
  for (let i = 1; i <= 11; i++) {
    await run(["make", "loop", "--type", "plan", "--title", `닫힘${i}`], root);
    // closedAt이 초 단위라 같은 초에 닫히면 순서를 못 가른다 — 파일에 직접 시각을 심는다
    const id = `loop-${String(i + 1).padStart(4, "0")}-plan`;
    expect((await run(["mark", "loop", id, "--closed"], root)).ok).toBe(true);
    const path = join(root, ".reap", "life", "loops", `${id}-닫힘${i}.md`);
    if (existsSync(path)) {
      writeFileSync(path, readFileSync(path, "utf8").replace(/closedAt: .*/, `closedAt: 2026-01-${String(i).padStart(2, "0")}T00:00:00Z`));
    }
  }
  // 11번째를 닫는 순간 이미 넘쳤으므로 그 호출이 가장 오래된 것을 내렸어야 한다 — 하지만
  // 시각을 뒤에서 심으므로 여기서 한 번 더 닫아 규칙을 확인한다
  await run(["make", "loop", "--type", "plan", "--title", "닫힘12"], root);
  expect((await run(["mark", "loop", "loop-0013-plan", "--closed"], root)).ok).toBe(true);
  const remaining = loops(root, "life/loops");
  expect(remaining).toContain("loop-0001-idea-열린것.md");
  const closedRemaining = remaining.filter((n) => !n.startsWith("loop-0001-"));
  expect(closedRemaining.length).toBe(10);
  const archived = loops(root, "archive/loops");
  expect(archived.length).toBe(2);
  expect(archived.every((n) => !n.startsWith("loop-0001-"))).toBe(true);
  // archive에 내려간 것도 id로 찾힌다
  expect((await run(["mark", "loop", archived[0]!.slice(0, 14), "--closed"], root)).ok).toBe(true);
});

test("mark loop --aborted가 기록을 지운다", async () => {
  const root = await project();
  await run(["make", "loop", "--type", "uiux", "--title", "가"], root);
  expect((await run(["mark", "loop", "loop-0001-uiux", "--aborted"], root)).ok).toBe(true);
  expect(loops(root, "life/loops")).toEqual([]);
});

test("make milestone --from이 loop id를 받는다", async () => {
  const root = await project();
  await run(["make", "loop", "--type", "plan", "--title", "가"], root);
  await run(["make", "milestone", "--title", "나", "--from", "loop-0001-plan"], root);
  expect(read(root, "vision", "milestones", "ms-001-나", "milestone.md").data.from).toBe("loop-0001-plan");
});

test("상태 줄이 열린 loop를 한 줄씩 내고 닫히면 사라진다", async () => {
  const root = await project();
  await run(["make", "loop", "--type", "plan", "--title", "기획"], root);
  await run(["make", "loop", "--type", "design", "--title", "설계"], root);
  const text = assemble(root);
  expect(text).toContain("열린 loop: loop-0001-plan 기획 — .reap/life/loops/loop-0001-plan-기획.md");
  expect(text).toContain("열린 loop: loop-0002-design 설계 — .reap/life/loops/loop-0002-design-설계.md");
  await run(["mark", "loop", "loop-0001-plan", "--closed"], root);
  const after = assemble(root);
  expect(after).not.toContain("loop-0001-plan");
  expect(after).toContain("loop-0002-design");
});

test("init이 life/loops/와 archive/loops/를 만든다", async () => {
  const root = await project();
  expect(existsSync(join(root, ".reap", "life", "loops"))).toBe(true);
  expect(existsSync(join(root, ".reap", "archive", "loops"))).toBe(true);
});
