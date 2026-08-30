import { afterEach, expect, test } from "bun:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDirs, commit, initRepo, tempDir } from "./helpers.ts";
import { run } from "../src/cli.ts";
import { scanCarriers } from "../src/carrier.ts";

afterEach(cleanupTempDirs);

/** 리터럴로 두면 이 리포를 훑는 carrier가 테스트 파일을 표식 자리로 센다. */
const mark = (hash: string, slug: string) => ["reap:", "carrier-", hash, "-", slug].join("");

async function project(): Promise<string> {
  const root = tempDir();
  initRepo(root);
  mkdirSync(join(root, "src"));
  writeFileSync(join(root, "src", "a.ts"), `// ${mark("b2c3d4", "commands-path")}\nexport const A = 1;\n`);
  writeFileSync(join(root, "docs.md"), `<!-- ${mark("b2c3d4", "commands-path")} -->\n본문\n`);
  writeFileSync(join(root, "lonely.md"), `<!-- ${mark("0f0f0f", "lonely")} -->\n`);
  commit(root, "첫 커밋");
  await run(["init"], root);
  return root;
}

test("scanCarriers가 표식을 id별로 모은다 — 산문 속 꺾쇠 언급은 세지 않는다", async () => {
  const root = await project();
  writeFileSync(join(root, "prose.md"), "규약은 `" + "reap:" + "carrier-<hash6>-<slug>` 모양이다\n");
  const found = scanCarriers(root);
  const ids = found.map((c) => c.id).sort();
  expect(ids).toEqual(["carrier-0f0f0f", "carrier-b2c3d4"]);
  const a = found.find((c) => c.id === "carrier-b2c3d4")!;
  expect(a.slugs).toEqual(["commands-path"]);
  expect(a.sites.length).toBe(2);
  expect(a.sites.map((s) => s.file).sort()).toEqual(["docs.md", "src/a.ts"]);
});

test("carrier new <slug>가 미사용 해시로 표식을 내고 아무것도 쓰지 않는다", async () => {
  const root = await project();
  const result = await run(["carrier", "new", "session-bind"], root);
  expect(result.ok).toBe(true);
  expect(result.message).toMatch(new RegExp("^reap:" + "carrier-[0-9a-f]{6}-session-bind$"));
  expect(result.message).not.toContain("b2c3d4");
  expect((await run(["carrier", "new"], root)).ok).toBe(false);
  expect((await run(["carrier", "new", "bad slug!"], root)).ok).toBe(false);
});

test("carrier new는 이미 있는 slug를 거부한다 — 한 slug에 해시 둘이 생긴다", async () => {
  const root = await project();
  const result = await run(["carrier", "new", "commands-path"], root);
  expect(result.ok).toBe(false);
  expect(result.message).toContain("b2c3d4");
});

test("carrier list가 id·slug·자리를 내고 --orphans는 한 파일에만 있는 것만 낸다", async () => {
  const root = await project();
  const list = await run(["carrier", "list"], root);
  expect(list.ok).toBe(true);
  expect(list.message).toContain("carrier-b2c3d4-commands-path");
  expect(list.message).toContain("src/a.ts:1");
  expect(list.message).toContain("docs.md:1");
  const orphans = await run(["carrier", "list", "--orphans"], root);
  expect(orphans.message).toContain("carrier-0f0f0f");
  expect(orphans.message).not.toContain("carrier-b2c3d4");
});

test("carrier list --check가 형식·충돌을 보고한다", async () => {
  const root = await project();
  writeFileSync(join(root, "bad.md"), `${mark("b2c3d4", "other-name")}\n${mark("zz", "nope")}\nreap:${"carrier"}-123456\n`);
  writeFileSync(join(root, "dup.md"), `${mark("777777", "commands-path")}\n`);
  const check = await run(["carrier", "list", "--check"], root);
  expect(check.ok).toBe(false);
  expect(check.message).toContain("한 해시에 slug 둘");
  expect(check.message).toContain("한 slug에 해시 둘");
  expect(check.message).toContain("형식");
  expect(check.message).toContain("bad.md");
  const clean = await run(["carrier", "list", "--check"], (await project()));
  expect(clean.ok).toBe(true);
});
