import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { findEntry, listEntries } from "./doc.ts";
import type { Entry } from "./doc.ts";
import { paths, readConfig, readSession } from "./store.ts";
import { t } from "./i18n.ts";

/**
 * 세션이 열릴 때 주입될 본문을 조립한다.
 *
 * **어떤 작업에도 적용되는 것만 싣는다** — genome과 environment/summary.md.
 * milestone 본문도 memory도 idea도 싣지 않는다. 대신 **상태 줄이 지도를 준다.**
 * 무엇을 읽을지는 agent가 정한다 — 맥락 구성은 판단이고, 판단은 도구의 것이 아니다.
 */
export function assemble(root: string, milestone?: string): string {
  const p = paths(root);
  if (!existsSync(p.reap)) return "";

  const parts: string[] = [];
  for (const path of markdown(p.genome)) parts.push(section(root, path));
  parts.push(section(root, join(p.environment, "summary.md")));
  parts.push(status(root, milestone));
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
function status(root: string, asked?: string): string {
  const p = paths(root);
  const lines: string[] = [];

  const language = readConfig(root).language;
  if (language !== "") lines.push(t(root, "ctx.label.language", { language }));

  const chosen = pickMilestone(root, asked);
  if (chosen) {
    lines.push(t(root, "ctx.label.milestone", { id: chosen.id, title: title(chosen), flags: flags(chosen) }));
    lines.push(`  ${relative(root, chosen.dir)}/`);
    const docs = nonEmpty(["milestone.md", "handoff.md"].map((n) => join(chosen.dir, n)));
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

  // loop는 여럿이 열리고 세션에 바인딩되지 않는다 — 열린 것 전부를 이름으로 낸다
  for (const loop of openLoops(root)) {
    lines.push(t(root, "ctx.label.loop", { id: loop.id, title: title(loop), path: relative(root, loop.path) }));
  }

  const memory = nonEmpty(markdown(p.memory));
  if (memory.length > 0) lines.push(t(root, "ctx.label.memory", { list: memory.map((m) => relative(root, m)).join(" · ") }));

  const idea = ideaCounts(root);
  if (idea !== "") lines.push(t(root, "ctx.label.idea", { path: relative(root, p.idea), counts: idea }));

  if (nonEmpty([p.map]).length > 0) lines.push(t(root, "ctx.label.map", { path: relative(root, p.map) }));

  lines.push(t(root, "ctx.entry"));
  return `${t(root, "ctx.marker")}\n${lines.join("\n")}\n`;
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

function openLoops(root: string): Entry[] {
  const dir = paths(root).loops;
  return listEntries(root, "loop").filter((e) => e.dir === dir && e.data.status !== "closed");
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
