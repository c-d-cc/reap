import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { findEntry, listEntries } from "./doc.ts";
import type { Entry } from "./doc.ts";
import { detectLayout, paths, readConfig, readSession, sessionKey } from "./store.ts";
import { t } from "./i18n.ts";

/**
 * 세션이 열릴 때 주입될 본문을 조립한다.
 *
 * **어떤 작업에도 적용되는 것만 싣는다** — genome과 environment/summary.md.
 * milestone 본문도 memory도 idea도 싣지 않는다. 대신 **상태 줄이 지도를 준다.**
 * 무엇을 읽을지는 agent가 정한다 — 맥락 구성은 판단이고, 판단은 도구의 것이 아니다.
 */
export function assemble(root: string, milestone?: string, env: NodeJS.ProcessEnv = process.env): string {
  const p = paths(root);
  if (!existsSync(p.reap)) return "";

  // v0.17 저장소면 이것 하나만 싣는다. genome도 상태 줄도 v0.17의 것이라
  // 그대로 실으면 agent가 죽은 5단계 흐름을 지시로 읽고 정상인 줄 알고 시작한다.
  const layout = detectLayout(root);
  if (layout.layout === "v017" || layout.layout === "mixed") {
    const key = layout.layout === "v017" ? "store.v017_layout" : "store.mixed_layout";
    return t(root, key, { markers: layout.v017.join(" "), v018: layout.v018.join(" ") });
  }

  const parts: string[] = [];
  for (const path of markdown(p.genome)) parts.push(section(root, path));
  parts.push(section(root, join(p.environment, "summary.md")));
  parts.push(status(root, milestone, env));
  return parts.filter((part) => part !== "").join("\n");
}

export function hookEnvelope(context: string): string {
  return JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context },
  });
}

/**
 * 지도. 본문 없는 사실만 담는다.
 *
 * **경로와 실제 파일 이름을 준다.** 개수만 세면 agent가 디렉토리를 다시 읽어야 하고
 * 지도의 값이 절반으로 준다. 다만 `idea/`는 예외다 — 수십 개가 될 수 있고 대부분
 * 지금 하는 일과 무관하며, 목록이 길어지면 지도의 나머지가 안 읽힌다.
 */
function status(root: string, asked?: string, env: NodeJS.ProcessEnv = process.env): string {
  const p = paths(root);
  const lines: string[] = [];

  const language = readConfig(root).language;
  if (language !== "") lines.push(t(root, "ctx.label.language", { language }));

  const chosen = pickMilestone(root, asked);
  if (chosen) {
    lines.push(t(root, "ctx.label.milestone", { id: chosen.id, title: title(chosen), flags: flags(chosen) }));
    lines.push(`  ${relative(root, chosen.dir)}/`);
    const docs = nonEmpty([join(chosen.dir, "milestone.md")]);
    if (docs.length > 0) lines.push(`    ${docs.map((d) => basename(d)).join(" · ")}`);
    const tasks = nonEmpty(markdown(join(chosen.dir, "tasks")));
    if (tasks.length > 0) lines.push(`    ${tasks.map((task) => `tasks/${basename(task)}`).join(" · ")}`);
  }

  const open = openGeneration(root);
  if (open) {
    lines.push(t(root, "ctx.label.generation", { id: open.id, title: title(open), path: relative(root, open.path) }));
    const started = [open.data.startedAt, open.data.startCommit].filter(Boolean);
    if (started.length > 0) lines.push(`  ${started.join(t(root, "ctx.started_join"))}`);
  }

  // flux는 여럿이 열리고 세션에 바인딩되지 않는다 — 열린 것 전부를 이름으로 낸다
  for (const flux of openFlux(root)) {
    lines.push(t(root, "ctx.label.flux", { id: flux.id, title: title(flux), path: relative(root, flux.path) }));
  }

  const sections = handoffSections(p.handoff);
  if (sections.length > 0) {
    const key = sessionKey(root, env);
    const mine = sections.some((heading) => headingKey(heading) === key);
    lines.push(t(root, "ctx.label.handoff", {
      path: relative(root, p.handoff),
      count: String(sections.length),
      mine: t(root, mine ? "ctx.handoff.mine" : "ctx.handoff.none"),
    }));
  }
  lines.push(t(root, "ctx.label.session", { key: sessionKey(root, env) }));

  const memory = nonEmpty(markdown(p.memory));
  if (memory.length > 0) lines.push(t(root, "ctx.label.memory", { list: memory.map((m) => relative(root, m)).join(" · ") }));

  const idea = ideaCounts(root);
  if (idea !== "") lines.push(t(root, "ctx.label.idea", { path: relative(root, p.idea), counts: idea }));

  if (nonEmpty([p.map]).length > 0) lines.push(t(root, "ctx.label.map", { path: relative(root, p.map) }));

  lines.push(t(root, "ctx.entry"));
  return `${t(root, "ctx.marker")}\n${lines.join("\n")}\n`;
}

/**
 * 절 제목만 센다. 본문은 상태 줄에 싣지 않는다 — 지도이지 내용이 아니다.
 * **코드 펜스 안은 세지 않는다** — 형식 예시를 적은 절이 둘로 세어진다.
 */
function handoffSections(path: string): string[] {
  if (!existsSync(path)) return [];
  const headings: string[] = [];
  let fenced = false;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (line.startsWith("```")) fenced = !fenced;
    else if (!fenced && line.startsWith("## ")) headings.push(line);
  }
  return headings;
}

/**
 * 제목의 **첫 토큰**이 절의 주인이다. 부분 문자열로 재면 `sess-9bf4`가 `sess-9bf47826`의
 * 절을 자기 것이라 주장하고, `complete`가 남의 절을 덮는다.
 */
function headingKey(heading: string): string {
  return heading.slice(3).trim().split(/[\s·]/)[0] ?? "";
}

/**
 * 바인딩 > --milestone > focus. 가리키는 것이 없으면 조용히 다음 순위로 내려간다.
 *
 * **닫힌 것도 "가리키는 것이 없는" 경우다.** milestone을 닫아도 `.session`의 바인딩은
 * 남으므로, status를 보지 않으면 그 뒤의 모든 세션이 끝난 milestone을 현재로 받는다.
 */
function pickMilestone(root: string, asked?: string): Entry | null {
  const bound = readSession(root).milestone;
  for (const needle of [bound, asked]) {
    if (!needle) continue;
    const found = findEntry(root, "milestone", needle);
    if ("entry" in found && found.entry.data.status !== "closed") return found.entry;
  }
  const open = listEntries(root, "milestone").filter((entry) => entry.data.status !== "closed");
  return open.find((entry) => String(entry.data.focus) === "true") ?? null;
}

/**
 * 세션이 중간에 죽고 다음 세션이 그 사실을 모르면 evolve가 새 세대를 열어버린다.
 * 그 잘못은 아무 데서도 드러나지 않는다.
 */
function openGeneration(root: string): Entry | null {
  const id = readSession(root).generation;
  if (!id) return null;
  const entry = listEntries(root, "generation").find((candidate) => candidate.id === id);
  return entry && entry.data.status !== "closed" ? entry : null;
}

function openFlux(root: string): Entry[] {
  const dir = paths(root).flux;
  return listEntries(root, "flux").filter((e) => e.dir === dir && e.data.status !== "closed");
}

function ideaCounts(root: string): string {
  const p = paths(root);
  return (
    [
      ["research", p.ideaResearch],
      ["freememo", p.ideaFreememo],
      ["files", p.ideaFiles],
    ] as const
  )
    .map(([label, dir]) => [label, entriesOf(dir).length] as const)
    .filter(([, count]) => count > 0)
    .map(([label, count]) => `${label} ${count}`)
    .join(" · ");
}

function title(entry: Entry): string {
  return typeof entry.data.title === "string" ? entry.data.title : "";
}

function flags(entry: Entry): string {
  const parts = [String(entry.data.status ?? "open")];
  if (String(entry.data.focus) === "true") parts.unshift("focus");
  return parts.join(", ");
}

/** 출처를 함께 싣는다. 어디서 온 문장인지 모르면 agent는 그것을 고칠 수도 없다. */
function section(root: string, path: string): string {
  if (!existsSync(path)) return "";
  const text = readFileSync(path, "utf8");
  if (text.trim() === "") return "";
  const body = text.endsWith("\n") ? text : `${text}\n`;
  return `<!-- ${relative(root, path)} -->\n${body}`;
}

/** 빈 파일은 없는 파일과 같다. 열어봐야 아무것도 없는 곳으로 보내지 않는다. */
function nonEmpty(paths: string[]): string[] {
  return paths.filter((path) => {
    try {
      return statSync(path).size > 0;
    } catch {
      return false;
    }
  });
}

function markdown(dir: string): string[] {
  return entriesOf(dir).filter((name) => name.endsWith(".md")).map((name) => join(dir, name));
}

function entriesOf(dir: string): string[] {
  try {
    return readdirSync(dir).sort().filter((name) => !name.startsWith("."));
  } catch {
    return [];
  }
}
