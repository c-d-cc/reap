import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import backlogMd from "./templates/backlog.md" with { type: "text" };
import configYml from "./templates/config.yml" with { type: "text" };
import conventionMd from "./templates/convention.md" with { type: "text" };
import environmentSummary from "./templates/environment-summary.md" with { type: "text" };
import generationMd from "./templates/generation.md" with { type: "text" };
import genomeApplication from "./templates/genome-application.md" with { type: "text" };
import genomeEvolution from "./templates/genome-evolution.md" with { type: "text" };
import genomeInvariants from "./templates/genome-invariants.md" with { type: "text" };
import ideaFile from "./templates/idea-file.md" with { type: "text" };
import ideaFreememo from "./templates/idea-freememo.md" with { type: "text" };
import ideaResearch from "./templates/idea-research.md" with { type: "text" };
import loopMd from "./templates/loop.md" with { type: "text" };
import mapMd from "./templates/map.md" with { type: "text" };
import memoryLessons from "./templates/memory-lessons.md" with { type: "text" };
import milestoneMd from "./templates/milestone.md" with { type: "text" };
import { paths } from "./store.ts";

/**
 * 번들 템플릿. 텍스트 임포트라 `bun build --compile`이 바이너리에 그대로 싣는다.
 * 쓰지 않는 이름은 여기 두지 않는다 — 아무도 안 쓰는 문자열이 늘어날 뿐이다.
 */
export const BUNDLED: Record<string, string> = {
  "config.yml": configYml,
  "convention.md": conventionMd,
  "generation.md": generationMd,
  "loop.md": loopMd,
  "milestone.md": milestoneMd,
  "backlog.md": backlogMd,
  "idea-research.md": ideaResearch,
  "idea-freememo.md": ideaFreememo,
  "idea-file.md": ideaFile,
  "genome-application.md": genomeApplication,
  "genome-evolution.md": genomeEvolution,
  "genome-invariants.md": genomeInvariants,
  "environment-summary.md": environmentSummary,
  "memory-lessons.md": memoryLessons,
  "map.md": mapMd, // reap:carrier-333308-map-seed
};

/** 프로젝트 템플릿이 번들을 이긴다. 프로젝트가 자기 기록 형식을 갖는 확장점이다. */
export function template(root: string, name: string): string {
  const override = join(paths(root).templates, name);
  if (existsSync(override)) return readFileSync(override, "utf8");
  const bundled = BUNDLED[name];
  if (bundled === undefined) throw new Error(`템플릿이 없습니다: ${name}`);
  return bundled;
}

export function render(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (whole, key: string) => vars[key] ?? whole);
}
