import { afterEach, expect, test } from "bun:test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDirs, commit, initRepo, tempDir } from "./helpers.ts";
import { run } from "../src/cli.ts";
import { Indexer } from "../src/index/indexer.ts";

afterEach(cleanupTempDirs);

/** 리터럴로 두면 이 리포를 인덱싱할 때 테스트 파일의 import 문이 미해석으로 세인다. */
const imp = (name: string, from: string) => ["import { ", name, " } from \"", from, "\";"].join("");

async function project(): Promise<string> {
  const root = tempDir();
  initRepo(root);
  mkdirSync(join(root, "src"));
  writeFileSync(join(root, "src", "a.ts"), `${imp("b", "./b.js")}\nexport function a() { return b() + 1; }\n`);
  writeFileSync(join(root, "src", "b.ts"), "export function b() { return helper(); }\nfunction helper() { return 1; }\n");
  writeFileSync(join(root, "src", "c.ts"), `${imp("a", "./a.js")}\nexport function c() { return a(); }\n`);
  writeFileSync(join(root, "src", "style.css"), "body{}");
  writeFileSync(join(root, "README.md"), "# x");
  commit(root, "첫 커밋");
  await run(["init"], root);
  return root;
}

test("init이 .reap/.index/를 gitignore에 넣는다", async () => {
  const root = await project();
  expect(readFileSync(join(root, ".gitignore"), "utf8")).toContain(".reap/.index/");
});

test("git 저장소가 아니면 인덱싱하지 않고 그렇게 말한다", async () => {
  const root = tempDir();
  await run(["init"], root);
  const r = await run(["index"], root);
  expect(r.ok).toBe(false);
  expect(r.message).toContain("git");
});

test("전체 인덱싱 — 심볼·CALLS·IMPORTS, 그리고 ./x.js가 x.ts로 해석된다", async () => {
  const root = await project();
  const r = await run(["index"], root);
  expect(r.ok).toBe(true);
  expect(r.message).toContain("full");
  expect(r.message).toContain("import 해석률 2/2 (100%)");
  const ix = new Indexer(root);
  await ix.ready();
  expect(ix.search("helper").map((n) => n.id)).toEqual(["src/b.ts::helper"]);
  expect(ix.callees("src/b.ts::b").map((e) => e.to)).toEqual(["src/b.ts::helper"]);
  expect(ix.callers("src/b.ts::b").map((e) => e.from)).toEqual(["src/a.ts::a"]);
});

test("impact가 import를 거슬러 직접·간접 영향을 낸다", async () => {
  const root = await project();
  const r = await run(["index", "impact", "src/b.ts"], root);
  expect(r.ok).toBe(true);
  const data = r.data as { direct: string[]; indirect: string[]; symbols: string[] };
  expect(data.direct).toEqual(["src/a.ts"]);
  expect(data.indirect).toEqual(["src/c.ts"]);
  expect(data.symbols).toContain("src/b.ts::b");
  expect(data.symbols).toContain("src/a.ts::a");
});

test("질의가 스스로 갱신한다 — HEAD가 움직이면 다음 질의가 먼저 올린다", async () => {
  const root = await project();
  await run(["index"], root);
  writeFileSync(join(root, "src", "d.ts"), "export function brandNew() { return 0; }\n");
  expect((await run(["index", "search", "brandNew"], root)).message).toContain("없음");
  commit(root, "d 추가");
  const r = await run(["index", "search", "brandNew"], root);
  expect(r.message).toContain("src/d.ts::brandNew");
  expect((await run(["index", "status"], root)).message).toContain("파일 4");
});

test("증분 갱신 결과 == 전체 재빌드 결과 — 파일을 고치고 지우고 이름을 바꿔도", async () => {
  const root = await project();
  await run(["index"], root);
  // b를 고쳐 helper를 없애고, c를 지우고, a를 aa로 바꾼다
  writeFileSync(join(root, "src", "b.ts"), "export function b() { return 2; }\n");
  writeFileSync(join(root, "src", "aa.ts"), `${imp("b", "./b.js")}\nexport function a() { return b() + 1; }\n`);
  const { rmSync } = await import("node:fs");
  rmSync(join(root, "src", "a.ts"));
  rmSync(join(root, "src", "c.ts"));
  commit(root, "고침");
  const inc = await run(["index"], root);
  expect(inc.message).toContain("incremental");
  const after = new Indexer(root);
  await after.ready();
  const snapInc = after.store.snapshot()!;
  await run(["index", "update", "--full"], root);
  const full = new Indexer(root);
  await full.ready();
  const snapFull = full.store.snapshot()!;
  const norm = (s: typeof snapInc) => ({
    nodes: s.nodes.map((n) => n.id).sort(),
    edges: s.edges.map((e) => `${e.from}>${e.to}:${e.kind}`).sort(),
    files: s.files.map((f) => `${f.path}:${f.imports.resolved}/${f.imports.attempted}`).sort(),
  });
  expect(norm(snapInc)).toEqual(norm(snapFull));
  expect(norm(snapInc).nodes).not.toContain("src/b.ts::helper");
  expect(norm(snapInc).nodes).not.toContain("src/a.ts::a");
  expect(norm(snapInc).nodes).toContain("src/aa.ts::a");
});

test("callers는 모르는 심볼을 거부하고 search로 안내한다", async () => {
  const root = await project();
  const r = await run(["index", "callers", "nope::x"], root);
  expect(r.ok).toBe(false);
  expect(r.message).toContain("search");
});
