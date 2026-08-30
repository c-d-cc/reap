import { afterEach, expect, test } from "bun:test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDirs, tempDir } from "./helpers.ts";
import { findEntry, formatDoc, listEntries, parseDoc, patch, slugify } from "../src/doc.ts";

afterEach(cleanupTempDirs);

test("frontmatter와 본문을 가른다", () => {
  const { data, body } = parseDoc("---\nid: gen-0001-exec\ntitle: 가 나\n---\n본문\n");
  expect(data).toEqual({ id: "gen-0001-exec", title: "가 나" });
  expect(body).toBe("본문\n");
});

test("frontmatter가 없으면 전부 본문이다", () => {
  expect(parseDoc("본문만\n")).toEqual({ data: {}, body: "본문만\n" });
});

test("목록 값을 읽고 쓴다", () => {
  const { data } = parseDoc("---\nrefs:\n  - ps-a3f8c2:a.md\n  - ps-a3f8c2:b.md\n---\n");
  expect(data.refs).toEqual(["ps-a3f8c2:a.md", "ps-a3f8c2:b.md"]);
  expect(formatDoc(data, "")).toBe("---\nrefs:\n  - ps-a3f8c2:a.md\n  - ps-a3f8c2:b.md\n---\n");
});

test("patch가 본문을 바이트 단위로 보존한다 — 두 번 연속 걸어도 같다", () => {
  const root = tempDir();
  const path = join(root, "a.md");
  const body = "## 제목\n\n  들여쓴 줄\n\n\n마지막 줄에 개행 없음";
  writeFileSync(path, `---\nid: gen-0001-exec\nstatus: open\n---\n${body}`);
  patch(path, { status: "closed" });
  expect(parseDoc(readFileSync(path, "utf8")).body).toBe(body);
  patch(path, { endCommit: "9f8e7d6" });
  expect(parseDoc(readFileSync(path, "utf8")).body).toBe(body);
  expect(readFileSync(path, "utf8")).toBe(
    `---\nid: gen-0001-exec\nstatus: closed\nendCommit: 9f8e7d6\n---\n${body}`,
  );
});

test("본문이 빈 줄로 시작하면 그 빈 줄이 보존된다", () => {
  const root = tempDir();
  const path = join(root, "a.md");
  writeFileSync(path, "---\nid: gen-0001-exec\n---\n\n\n본문\n");
  patch(path, { status: "closed" });
  patch(path, { status: "open" });
  expect(parseDoc(readFileSync(path, "utf8")).body).toBe("\n\n본문\n");
});

test("null을 주면 필드가 지워진다", () => {
  const root = tempDir();
  const path = join(root, "a.md");
  writeFileSync(path, "---\nid: gen-0001-exec\nfocus: true\n---\n본문\n");
  patch(path, { focus: null });
  expect(parseDoc(readFileSync(path, "utf8")).data).toEqual({ id: "gen-0001-exec" });
});

test("CRLF 문서에서 본문 앞에 \\r가 남지 않는다", () => {
  const root = tempDir();
  const path = join(root, "a.md");
  writeFileSync(path, "---\r\nid: gen-0001-exec\r\nstatus: open\r\n---\r\n본문\r\n");
  patch(path, { status: "closed" });
  const { data, body } = parseDoc(readFileSync(path, "utf8"));
  expect(data.id).toBe("gen-0001-exec");
  expect(data.status).toBe("closed");
  expect(body.startsWith("\r")).toBe(false);
  expect(body).toBe("본문\r\n");
});

test("slug는 경로에 못 쓰는 문자를 없애되 한글은 남긴다", () => {
  expect(slugify("세션 토큰 회전")).toBe("세션-토큰-회전");
  expect(slugify("auth/session: 개편!")).toBe("auth-session-개편");
  expect(slugify("  Token   Rotation  ")).toBe("token-rotation");
  expect(slugify("한 세대 한 바퀴")).toBe("한-세대-한-바퀴");
  expect(slugify("///")).not.toBe("");
});

function project(): string {
  const root = tempDir();
  for (const id of ["ms-001-첫째", "ms-002-둘째", "ms-0011-열한째"]) {
    mkdirSync(join(root, ".reap", "vision", "milestones", id), { recursive: true });
    mkdirSync(join(root, ".reap", "life", "generations"), { recursive: true });
    writeFileSync(
      join(root, ".reap", "vision", "milestones", id, "milestone.md"),
      `---\nid: ${id.split("-").slice(0, 2).join("-")}\nslug: ${id.split("-").slice(2).join("-")}\nstatus: open\n---\n`,
    );
  }
  return root;
}

test("listEntries가 milestone과 그 안의 generation을 찾는다", () => {
  const root = project();
  writeFileSync(
    join(root, ".reap", "life", "generations", "gen-0001-exec-가.md"),
    "---\nid: gen-0001-exec\nmilestone: ms-001\n---\n",
  );
  expect(listEntries(root, "milestone").map((e) => e.id).sort()).toEqual(["ms-001", "ms-002", "ms-0011"].sort());
  const gens = listEntries(root, "generation");
  expect(gens.length).toBe(1);
  expect(gens[0]!.id).toBe("gen-0001-exec");
  expect(gens[0]!.data.milestone).toBe("ms-001");
});

test("정확한 id가 접두사보다 먼저다 — ms-001은 ms-0011의 접두사이기도 하다", () => {
  const root = project();
  const found = findEntry(root, "milestone", "ms-001");
  expect("entry" in found && found.entry.id).toBe("ms-001");
});

test("둘 이상 걸리면 후보를 돌려주고 하나를 고르지 않는다", () => {
  const root = project();
  const found = findEntry(root, "milestone", "ms-00");
  expect("ambiguous" in found).toBe(true);
  if ("ambiguous" in found) expect(found.ambiguous.length).toBe(3);
});

test("없으면 missing이다", () => {
  expect("missing" in findEntry(project(), "milestone", "ms-999")).toBe(true);
});

test("slug로도 찾는다", () => {
  const found = findEntry(project(), "milestone", "둘째");
  expect("entry" in found && found.entry.id).toBe("ms-002");
});

test("빈 목록은 `key: []`로 왕복되고, `key:`만 있는 것은 사라진다", () => {
  const text = formatDoc({ id: "loop-0001-plan", milestones: [] }, "");
  expect(text).toContain("milestones: []");
  expect(parseDoc(text).data.milestones).toEqual([]);
  expect(parseDoc("---\nrefs:\n---\n").data.refs).toBeUndefined();
});
