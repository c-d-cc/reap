import { afterEach, expect, test } from "bun:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDirs, tempDir } from "./helpers.ts";
import { BUNDLED, render, template } from "../src/templates.ts";

afterEach(cleanupTempDirs);

const REQUIRED = [
  "config.yml",
  "generation.md",
  "milestone.md",
  "backlog.md",
  "idea-research.md",
  "idea-freememo.md",
  "idea-file.md",
  "genome-application.md",
  "genome-evolution.md",
  "genome-invariants.md",
  "environment-summary.md",
  "memory-lessons.md",
  "map.md",
  "loop.md",
  "convention.md",
];

test("이 증분에 필요한 번들 템플릿이 전부 있고 비어 있지 않다", () => {
  const root = tempDir();
  for (const name of REQUIRED) expect(template(root, name).length).toBeGreaterThan(0);
  expect(Object.keys(BUNDLED).sort()).toEqual([...REQUIRED].sort());
});

test("프로젝트 템플릿이 번들을 이긴다", () => {
  const root = tempDir();
  mkdirSync(join(root, ".reap", "templates"), { recursive: true });
  writeFileSync(join(root, ".reap", "templates", "generation.md"), "프로젝트 것\n");
  expect(template(root, "generation.md")).toBe("프로젝트 것\n");
  expect(template(root, "milestone.md")).toBe(BUNDLED["milestone.md"]!);
});

test("없는 이름은 throw한다", () => {
  const root = tempDir();
  expect(() => template(root, "없는것.md")).toThrow();
});

test("render는 자리표시자를 채우고 없는 것은 건드리지 않는다", () => {
  expect(render("id: {{workspaceId}}\n", { workspaceId: "abc" })).toBe("id: abc\n");
  expect(render("{{unknown}}", {})).toBe("{{unknown}}");
});
