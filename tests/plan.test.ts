import { afterEach, expect, test } from "bun:test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDirs, commit, initRepo, tempDir } from "./helpers.ts";
import { run } from "../src/cli.ts";
import { readSources, validateRef } from "../src/plan.ts";

afterEach(cleanupTempDirs);

async function project(): Promise<string> {
  const root = tempDir();
  initRepo(root);
  mkdirSync(join(root, "docs", "spec"), { recursive: true });
  writeFileSync(join(root, "docs", "spec", "01-a.md"), "# a");
  commit(root, "첫 커밋");
  await run(["init"], root);
  return root;
}

const HAND = `sources:
  - id: ps-4f2a91
    root: ./docs/spec
    role: 설계 — 무엇이 참이어야 하는가
    convention: conventions/ps-4f2a91-spec.md
`;

test("손으로 쓴 sources.yml을 읽는다 — 중첩이 있어도", async () => {
  const root = await project();
  writeFileSync(join(root, ".reap", "plan", "sources.yml"), HAND);
  expect(readSources(root)).toEqual([
    { id: "ps-4f2a91", root: "./docs/spec", role: "설계 — 무엇이 참이어야 하는가", convention: "conventions/ps-4f2a91-spec.md" },
  ]);
});

test("sources.yml이 없으면 빈 목록이다", async () => {
  const root = await project();
  expect(readSources(root)).toEqual([]);
});

test("make plan-source가 손으로 쓴 것과 같은 모양을 만든다", async () => {
  const root = await project();
  const result = await run(["make", "plan-source", "--root", "./docs/spec", "--role", "설계 — 무엇이 참이어야 하는가"], root);
  expect(result.ok).toBe(true);
  const sources = readSources(root);
  expect(sources.length).toBe(1);
  const src = sources[0]!;
  expect(src.id).toMatch(/^ps-[0-9a-f]{6}$/);
  expect(src.root).toBe("./docs/spec");
  expect(src.role).toBe("설계 — 무엇이 참이어야 하는가");
  expect(src.convention).toBe(`conventions/${src.id}-spec.md`);
  // 파일 모양 자체가 손으로 쓴 것과 같다
  const text = readFileSync(join(root, ".reap", "plan", "sources.yml"), "utf8");
  expect(text).toBe(HAND.replaceAll("ps-4f2a91", src.id));
  // 규약 씨앗
  const convention = readFileSync(join(root, ".reap", "plan", src.convention), "utf8");
  expect(convention.startsWith(`# ${src.id} — spec`)).toBe(true);
  expect(convention).toContain("root: `./docs/spec`");
  expect(convention).toContain("## 어떻게 읽는가");
  // 레지스트리
  const registry = readFileSync(join(root, ".reap", "sequence", "source.md"), "utf8");
  expect(registry).toContain(`| ${src.id} | 설계 — 무엇이 참이어야 하는가 |`);
});

test("둘째 소스는 행이 붙는다 — 첫째가 그대로 남는다", async () => {
  const root = await project();
  await run(["make", "plan-source", "--root", "./docs/spec", "--role", "설계"], root);
  mkdirSync(join(root, "prd"));
  await run(["make", "plan-source", "--root", "./prd", "--role", "기획", "--slug", "product"], root);
  const sources = readSources(root);
  expect(sources.map((s) => s.root)).toEqual(["./docs/spec", "./prd"]);
  expect(sources[1]!.convention).toBe(`conventions/${sources[1]!.id}-product.md`);
});

test("make plan-source는 --root와 --role이 필수이고 root가 없는 디렉토리면 거부한다", async () => {
  const root = await project();
  expect((await run(["make", "plan-source", "--role", "설계"], root)).ok).toBe(false);
  expect((await run(["make", "plan-source", "--root", "./docs/spec"], root)).ok).toBe(false);
  const missing = await run(["make", "plan-source", "--root", "./nope", "--role", "설계"], root);
  expect(missing.ok).toBe(false);
  expect(missing.message).toContain("nope");
});

test("plan sources가 등록된 소스를 내고, plan convention이 규약 본문을 낸다", async () => {
  const root = await project();
  writeFileSync(join(root, ".reap", "plan", "sources.yml"), HAND);
  writeFileSync(join(root, ".reap", "plan", "conventions", "ps-4f2a91-spec.md"), "# ps-4f2a91 — spec\n\n01부터 읽는다.\n");
  const list = await run(["plan", "sources"], root);
  expect(list.ok).toBe(true);
  expect(list.message).toContain("ps-4f2a91");
  expect(list.message).toContain("./docs/spec");
  expect(list.message).toContain("설계 — 무엇이 참이어야 하는가");
  const conv = await run(["plan", "convention", "ps-4f2a91"], root);
  expect(conv.ok).toBe(true);
  expect(conv.message).toContain("01부터 읽는다.");
  expect((await run(["plan", "convention", "ps-000000"], root)).ok).toBe(false);
  expect((await run(["plan", "sources"], root)).message).not.toContain("없");
});

test("plan sources는 소스가 없으면 그렇다고 말한다", async () => {
  const root = await project();
  const list = await run(["plan", "sources"], root);
  expect(list.ok).toBe(true);
  expect(list.message).toContain("등록된 plan source가 없습니다");
});

test("--ref는 소스 id가 실재하고 경로가 그 소스 안에 있어야 한다 — 앵커는 안 본다", async () => {
  const root = await project();
  writeFileSync(join(root, ".reap", "plan", "sources.yml"), HAND);
  expect(validateRef(root, "ps-4f2a91:01-a.md")).toBeNull();
  expect(validateRef(root, "ps-4f2a91:01-a.md#아무-앵커")).toBeNull();
  expect(validateRef(root, "ps-4f2a91:02-b.md")).toContain("02-b.md");
  expect(validateRef(root, "ps-000000:01-a.md")).toContain("ps-000000");
  expect(validateRef(root, "ps-4f2a91")).toContain("형식");
  expect(validateRef(root, "ps-4f2a91:../../package.json")).toContain("안에");
});

test("make milestone과 make loop가 --ref를 검증한다", async () => {
  const root = await project();
  writeFileSync(join(root, ".reap", "plan", "sources.yml"), HAND);
  expect((await run(["make", "milestone", "--title", "가", "--ref", "ps-4f2a91:01-a.md"], root)).ok).toBe(true);
  const bad = await run(["make", "milestone", "--title", "나", "--ref", "ps-4f2a91:99.md"], root);
  expect(bad.ok).toBe(false);
  expect(bad.message).toContain("99.md");
  expect((await run(["make", "loop", "--type", "plan", "--title", "다", "--ref", "ps-000000:01-a.md"], root)).ok).toBe(false);
  expect((await run(["make", "loop", "--type", "plan", "--title", "라", "--ref", "ps-4f2a91:01-a.md#x"], root)).ok).toBe(true);
});
