import { afterEach, expect, test } from "bun:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDirs, tempDir } from "./helpers.ts";
import { isRegistered, isValid, issue, kindOf, readRegistry } from "../src/id.ts";

afterEach(cleanupTempDirs);

function seed(): string {
  const root = tempDir();
  mkdirSync(join(root, ".reap", "sequence"), { recursive: true });
  return root;
}

test("접두사가 계열을 정하고 계열이 형식을 정한다", () => {
  expect(kindOf("ms-001")).toBe("milestone");
  expect(kindOf("ps-a3f8c2")).toBe("source");
  expect(kindOf("bk-a3f8c2")).toBe("backlog");
  expect(kindOf("idea-a3f8c2")).toBe("idea");
});


test("번호 계열에 해시가 오거나 모르는 접두사면 null이다", () => {
  expect(kindOf("ms-a3f8c2")).toBe(null);
  expect(kindOf("zz-001")).toBe(null);
  expect(kindOf("plan-a3f8c2")).toBe(null);
  expect(kindOf("ms-01")).toBe(null);
  expect(kindOf("ps-a3f8")).toBe(null);
  expect(kindOf("ms001")).toBe(null);
  expect(isValid("ms-001")).toBe(true);
  expect(isValid("zz-001")).toBe(false);
});

test("6자리 숫자는 6자리 hex이기도 하다 — 자릿수가 아니라 접두사가 가른다", () => {
  expect(kindOf("ps-123456")).toBe("source");
  expect(kindOf("bk-123456")).toBe("backlog");
  expect(kindOf("gen-123456-exec")).toBe("generation");
});

test("레지스트리를 갖는 계열과 갖지 않는 계열", () => {
  expect(isRegistered("milestone")).toBe(true);
  expect(isRegistered("generation")).toBe(true);
  expect(isRegistered("source")).toBe(true);
  expect(isRegistered("backlog")).toBe(false);
  expect(isRegistered("idea")).toBe(false);
});

test("번호는 1부터 순차 발급되고 계열마다 독립적으로 센다", () => {
  const root = seed();
  expect(issue(root, "milestone", "첫", "2026-08-22")).toBe("ms-001");
  expect(issue(root, "milestone", "둘", "2026-08-22")).toBe("ms-002");
  expect(issue(root, "generation", "첫", "2026-08-22", "exec")).toBe("gen-0001-exec");
  expect(issue(root, "milestone", "셋", "2026-08-22")).toBe("ms-003");
});

test("다음 번호가 행에서 나온다 — 행을 지워도 번호는 되쓰이지 않는다", () => {
  const root = seed();
  issue(root, "milestone", "첫", "2026-08-22");
  issue(root, "milestone", "둘", "2026-08-22");
  const rows = readRegistry(root, "milestone");
  expect(rows.map((r) => r.id)).toEqual(["ms-001", "ms-002"]);
  expect(rows[1]!.title).toBe("둘");
  expect(rows[1]!.createdAt).toBe("2026-08-22");
});

test("제목이 왕복된다 — 표를 깨는 문자가 들어와도 createdAt이 살아남는다", () => {
  const root = seed();
  issue(root, "milestone", "파이프 | 가 든 제목", "2026-08-22");
  issue(root, "milestone", "개행이\n든 제목", "2026-08-23");
  const rows = readRegistry(root, "milestone");
  expect(rows.length).toBe(2);
  expect(rows[0]!.title).toBe("파이프 | 가 든 제목");
  expect(rows[0]!.createdAt).toBe("2026-08-22");
  expect(rows[1]!.title).toBe("개행이\n든 제목");
  expect(rows[1]!.createdAt).toBe("2026-08-23");
});

test("레지스트리 파일이 없으면 만들고 001부터 센다", () => {
  const root = seed();
  expect(readRegistry(root, "generation")).toEqual([]);
  expect(issue(root, "generation", "첫", "2026-08-22", "plan")).toBe("gen-0001-plan");
});

test("generation id는 유형을 품는다", () => {
  expect(kindOf("gen-0001-plan")).toBe("generation");
  expect(kindOf("gen-0002-exec")).toBe("generation");
  expect(kindOf("gen-0003-fix")).toBe("generation");
  expect(kindOf("gen-10000-exec")).toBe("generation");
});

/** 유형이 id의 일부이므로, 유형이 없거나 모르는 것이면 그것은 id가 아니다. */
test("불완전하거나 모르는 유형의 generation id는 거부한다", () => {
  expect(kindOf("gen-0002")).toBe(null);
  expect(kindOf("gen-0002-foo")).toBe(null);
  expect(kindOf("gen-002-exec")).toBe(null);
  expect(kindOf("gen-0002-exec-토큰")).toBe(null);
  expect(kindOf("exec-001")).toBe(null);
  expect(kindOf("plan-001")).toBe(null);
});

test("세대는 유형이 달라도 하나의 계열에서 번호를 받는다", () => {
  const root = seed();
  expect(issue(root, "generation", "가", "2026-08-23", "plan")).toBe("gen-0001-plan");
  expect(issue(root, "generation", "나", "2026-08-23", "exec")).toBe("gen-0002-exec");
  expect(issue(root, "generation", "다", "2026-08-23", "fix")).toBe("gen-0003-fix");
  expect(readRegistry(root, "generation").map((r) => r.id)).toEqual([
    "gen-0001-plan",
    "gen-0002-exec",
    "gen-0003-fix",
  ]);
});

test("네 자리를 넘겨도 형식이 깨지지 않는다", () => {
  const root = seed();
  writeFileSync(
    join(root, ".reap", "sequence", "generation.md"),
    "| id | title | createdAt |\n|---|---|---|\n| gen-9999-exec | 마지막 | 2026-08-23 |\n",
  );
  expect(issue(root, "generation", "다음", "2026-08-23", "plan")).toBe("gen-10000-plan");
});
