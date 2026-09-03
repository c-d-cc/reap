import { chmodSync, existsSync, renameSync, rmSync } from "node:fs";
import { basename, join } from "node:path";
import { findEntry, formatDoc, listEntries, parseDoc, patch, slugify } from "./doc.ts";
import type { Entry } from "./doc.ts";
import { head } from "./git.ts";
import { HOOK_EVENTS, isHookEvent } from "./hooks.ts";
import type { GenerationType, LoopType } from "./id.ts";
import { issue } from "./id.ts";
import { requireRefs } from "./plan.ts";
import { bindSession, ensureDir, paths, readSession, unbindSession, writeFileAtomic } from "./store.ts";
import { render, template } from "./templates.ts";

export type MakeBacklog = { title: string; slug?: string; type: string; from?: string; now: string };
export type MakeIdea = { title: string; slug?: string; kind: IdeaKind; now: string };

export type MakeLoop = { title: string; slug?: string; type: LoopType; from?: string; refs?: string[]; now: string };

/** 닫힌 loop를 `life/loops/`에 이만큼 남긴다. 넘치면 오래된 것부터 archive로. */
export const CLOSED_LOOPS_KEPT = 10;

export type MakeHook = { event: string; name: string; type?: string; condition?: string; order?: string };

export type MakeMilestone = { title: string; slug?: string; from?: string; refs?: string[]; focus?: boolean; now: string };
export type MakeGeneration = {
  title: string;
  slug?: string;
  milestone?: string;
  backlog?: string;
  plan?: boolean;
  fix?: boolean;
  now: string;
};
export type Made = { id: string; path: string };

export function makeMilestone(root: string, opts: MakeMilestone): Made {
  // 인용은 확정 가능한 것만 검사한다 — 소스가 등록돼 있고 파일이 그 안에 있는가. id 발급 전에 본다
  requireRefs(root, opts.refs);
  const id = issue(root, "milestone", opts.title, registryDate(opts.now));
  const slug = opts.slug ?? slugify(opts.title);
  const dir = join(paths(root).milestones, `${id}-${slug}`);
  ensureDir(dir);

  const data: Record<string, unknown> = { id, slug, title: opts.title };
  if (opts.from) data.from = opts.from;
  if (opts.refs && opts.refs.length > 0) data.refs = opts.refs;
  data.status = "open";
  // 한 번에 여럿을 자를 때 마지막 것이 초점을 뺏으면 안 된다. 지금 할 것을 고르는 건 판단이다.
  if (opts.focus) data.focus = "true";
  data.openedAt = opts.now;

  const path = join(dir, "milestone.md");
  writeFileAtomic(path, formatDoc(data, bodyOf(root, "milestone.md")));
  if (opts.focus) focusOn(root, id);
  // 빈 파일로 둔다. 안내 문구를 넣으면 지워지지 않은 채 남아 진짜 내용과 섞인다.
  const handoff = join(dir, "handoff.md");
  if (!existsSync(handoff)) writeFileAtomic(handoff, "");
  return { id, path };
}

/**
 * id 발급 · 템플릿 복사 · 기계적 사실 스탬프 · 경로 배치 · 세션 바인딩, 이 다섯만 한다.
 * 시작 커밋을 못 구한다고 거부하지 않는다 — 그것은 흐름 제어다.
 *
 * **`--milestone`·`--backlog`·`--fix`.** 유형은 짐작할 것이 아니다 — 근거와 유형을 함께 주는 것도,
 * 하나도 없는 것도 거부한다. **`--plan`은 없다** — 새 의도를 만드는 일은 generation이 아니라 loop다.
 */
export function makeGeneration(root: string, opts: MakeGeneration): Made {
  // 근거(milestone·backlog)는 함께 올 수 있다 — milestone이 갈래를 주고 backlog 항목이
  // 그 안의 구체적 일을 준다. 배타인 것은 유형끼리다.
  const grounds = [opts.milestone !== undefined, opts.backlog !== undefined].filter(Boolean).length;
  if (opts.plan) {
    throw new Error("generation에는 plan 유형이 없습니다. 새 의도를 만드는 일은 loop입니다: reap make loop --type plan|design|uiux|idea");
  }
  const types = opts.fix === true ? 1 : 0;
  if (types === 1 && grounds > 0) {
    throw new Error("--fix는 근거(--milestone·--backlog)와 함께 줄 수 없습니다.");
  }
  if (types === 0 && grounds === 0) {
    throw new Error(
      "generation을 열려면 유형이나 근거가 필요합니다: " +
        "exec은 --milestone <ms-id>와 --backlog <bk-id> 중 하나 이상(둘 다 가능), 되돌리는 일은 --fix. " +
        "새 의도를 만드는 일이면 make loop.",
    );
  }

  const type: GenerationType = opts.fix ? "fix" : "exec";
  const milestone = opts.milestone !== undefined ? resolveMilestone(root, opts.milestone) : null;
  const backlog = opts.backlog !== undefined ? resolveBacklog(root, opts.backlog) : null;
  const id = issue(root, "generation", opts.title, registryDate(opts.now), type);
  const slug = opts.slug ?? slugify(opts.title);

  const data: Record<string, unknown> = { id, slug, type };
  if (milestone) data.milestone = milestone.id;
  if (backlog) data.backlog = backlog.id;
  data.title = opts.title;
  data.startedAt = opts.now;
  const startCommit = head(root);
  if (startCommit) data.startCommit = startCommit;
  data.status = "open";

  const dir = paths(root).generations;
  ensureDir(dir);
  const path = join(dir, `${id}-${slug}.md`);
  writeFileAtomic(path, formatDoc(data, bodyOf(root, "generation.md")));
  bindSession(root, id, milestone?.id);
  return { id, path };
}

/**
 * loop는 generation과 다른 사이클이다 — **세션에 바인딩하지 않는다.** 여럿이 나란히 열리므로
 * "현재 loop"가 없다. 근거(`from`)는 출처일 뿐 권한이 아니라 검사하지 않는다.
 */
export function makeLoop(root: string, opts: MakeLoop): Made {
  requireRefs(root, opts.refs);
  const id = issue(root, "loop", opts.title, registryDate(opts.now), opts.type);
  const slug = opts.slug ?? slugify(opts.title);
  const data: Record<string, unknown> = { id, slug, type: opts.type, title: opts.title };
  if (opts.from) data.from = opts.from;
  if (opts.refs && opts.refs.length > 0) data.refs = opts.refs;
  data.startedAt = opts.now;
  const startCommit = head(root);
  if (startCommit) data.startCommit = startCommit;
  data.status = "open";
  data.milestones = [];
  return writeLoose(root, paths(root).loops, id, slug, data, "loop.md");
}

/**
 * `--closed`는 상태를 찍고 파일을 **`life/loops/`에 남긴다** — 방금 닫힌 loop가 가장 자주 읽힌다.
 * 닫힌 것이 `CLOSED_LOOPS_KEPT`를 넘으면 오래된 것부터 archive로 내린다. 개수는 판단이 아니라서
 * 도구가 한다 — generation의 `cleanup`과 다른 점이다. 열린 loop는 개수와 무관하게 옮기지 않는다.
 */
export function markLoop(root: string, needle: string, flag: "closed" | "aborted", now: string, milestones: string[] = []): Made {
  const entry = resolveByKind(root, "loop", needle);
  if (flag === "aborted") {
    rmSync(entry.path, { force: true });
    return { id: entry.id, path: entry.path };
  }
  const fields: Record<string, unknown> = { status: "closed", closedAt: now };
  if (milestones.length > 0) fields.milestones = milestones;
  patch(entry.path, fields);
  archiveOverflowLoops(root);
  return { id: entry.id, path: existsSync(entry.path) ? entry.path : join(paths(root).archiveLoops, basename(entry.path)) };
}

function archiveOverflowLoops(root: string): void {
  const p = paths(root);
  const closed = listEntries(root, "loop")
    .filter((e) => e.dir === p.loops && e.data.status === "closed")
    .sort((a, b) => String(a.data.closedAt ?? "").localeCompare(String(b.data.closedAt ?? "")));
  const overflow = closed.length - CLOSED_LOOPS_KEPT;
  if (overflow <= 0) return;
  ensureDir(p.archiveLoops);
  for (const entry of closed.slice(0, overflow)) {
    renameSync(entry.path, join(p.archiveLoops, basename(entry.path)));
  }
}

/**
 * 세션을 열린 세대에 다시 묶는다. `--aborted`가 바인딩을 비우고, 다른 디렉토리·세션이 `.session`을
 * 덮었을 때 손으로 고치던 것(`gen-0009`)의 자리다. 닫힌 세대에는 묶지 않는다 — 끝난 일을 현재로 싣게 된다.
 */
export function bindGeneration(root: string, needle: string): Made {
  const entry = resolveGeneration(root, needle);
  if (entry.data.status === "closed") throw new Error(`닫힌 세대에는 묶지 않습니다: ${entry.id}`);
  const milestone = typeof entry.data.milestone === "string" ? entry.data.milestone : undefined;
  bindSession(root, entry.id, milestone);
  return { id: entry.id, path: entry.path };
}

/** `mark`는 검사하지 않는다. 커밋 확인은 skill이 하고, 어긋난 것은 doctor가 사후에 잡는다. */
export function markGeneration(
  root: string,
  needle: string,
  flag: "closed" | "aborted" | "archived",
  now: string,
): Made {
  const entry = resolveGeneration(root, needle);
  if (flag === "aborted") {
    rmSync(entry.path, { force: true });
    if (readSession(root).generation === entry.id) unbindSession(root);
    return { id: entry.id, path: entry.path };
  }
  if (flag === "archived") {
    // 위치만 옮긴다. status는 건드리지 않는다 — archive는 상태가 아니라 위치다.
    const dest = join(paths(root).archiveGenerations, basename(entry.path));
    ensureDir(paths(root).archiveGenerations);
    renameSync(entry.path, dest);
    return { id: entry.id, path: dest };
  }
  const endCommit = head(root);
  patch(entry.path, { status: "closed", closedAt: now, endCommit: endCommit ?? null });
  return { id: entry.id, path: entry.path };
}

/**
 * `--consumed`는 표시만 하고 `--archived`는 이동만 한다. **상태와 위치는 다른 질문이다** —
 * 소비된 항목이라도 무엇을 물었고 답이 어떻게 뒤집혔는지가 아직 읽을 값을 가질 수 있다.
 * 무엇을 내릴지는 `cleanup`의 판단이고 CLI는 계산하지 않는다.
 */
export function markBacklog(root: string, needle: string, flag: "consumed" | "archived", by?: string): Made {
  const found = findEntry(root, "backlog", needle);
  if ("ambiguous" in found) {
    throw new Error(`backlog가 여럿에 걸립니다: ${found.ambiguous.map((e) => e.id).join(", ")}`);
  }
  if (!("entry" in found)) throw new Error(`backlog를 찾지 못했습니다: ${needle}`);
  const entry = found.entry;

  if (flag === "archived") {
    const dest = join(paths(root).archiveBacklog, basename(entry.path));
    ensureDir(paths(root).archiveBacklog);
    renameSync(entry.path, dest);
    return { id: entry.id, path: dest };
  }

  const consumedBy = by ?? readSession(root).generation;
  patch(entry.path, { status: "consumed", consumedBy: consumedBy ?? null });
  return { id: entry.id, path: entry.path };
}

/**
 * `--focus`는 초점을 **옮긴다**(`focusOn`). `--closed`는 상태를 찍고 디렉토리째
 * `archive/milestones/`로 옮긴다 — 파일별로 옮기면 나중에 생긴 파일이 빠진다.
 * **세대는 따라가지 않는다.** 그것은 `cleanup` skill이 `mark generation --archived`로 따로 내린다.
 */
export function markMilestone(root: string, needle: string, flag: "focus" | "closed", now: string): Made {
  const entry = resolveMilestone(root, needle);
  if (flag === "focus") {
    focusOn(root, entry.id);
    return { id: entry.id, path: entry.path };
  }
  patch(entry.path, { status: "closed", closedAt: now });
  const dest = join(paths(root).archiveMilestones, basename(entry.dir));
  ensureDir(paths(root).archiveMilestones);
  renameSync(entry.dir, dest);
  return { id: entry.id, path: join(dest, "milestone.md") };
}

/**
 * **초점은 하나다.** 더하기만 하면 둘이 켜진 채 남고 `ctx`는 목록에서 먼저 걸리는 것을
 * 조용히 고른다 — 틀린 milestone을 싣고도 그 잘못이 아무 데도 드러나지 않는다.
 * 그래서 초점을 찍는 것은 **옮기는 일**이지 더하는 일이 아니다.
 */
function focusOn(root: string, id: string): void {
  for (const entry of listEntries(root, "milestone")) {
    if (entry.id === id) patch(entry.path, { focus: true });
    else if (entry.data.focus !== undefined) patch(entry.path, { focus: null });
  }
}

/**
 * **`consumed`인 항목은 근거가 되지 못한다.** 끝났다고 표시된 것 위에 다시 일하면
 * 다음 사람이 왜 다시 했는지 모른다. 소비가 불완전했다면 새 항목을 쓴다 — 무엇이
 * 남았는지가 거기 적히기 때문이다.
 */
function resolveBacklog(root: string, needle: string): Entry {
  const found = findEntry(root, "backlog", needle);
  if ("ambiguous" in found) {
    throw new Error(`backlog가 여럿에 걸립니다: ${found.ambiguous.map((e) => e.id).join(", ")}`);
  }
  if (!("entry" in found)) throw new Error(`backlog를 찾지 못했습니다: ${needle}`);
  if (found.entry.data.status === "consumed") {
    throw new Error(
      `이미 consumed인 backlog는 근거가 되지 못합니다: ${found.entry.id}. ` +
        "남은 일이 있다면 무엇이 남았는지를 담은 새 항목을 만듭니다.",
    );
  }
  return found.entry;
}

function resolveMilestone(root: string, needle: string): Entry {
  const found = findEntry(root, "milestone", needle);
  if ("entry" in found) return found.entry;
  if ("ambiguous" in found) {
    throw new Error(`milestone이 여럿에 걸립니다: ${found.ambiguous.map((e) => e.id).join(", ")}`);
  }
  throw new Error(`milestone을 찾지 못했습니다: ${needle}`);
}

function resolveGeneration(root: string, needle: string): Entry {
  return resolveByKind(root, "generation", needle);
}

function resolveByKind(root: string, kind: "generation" | "loop", needle: string): Entry {
  const candidates = collect(findEntry(root, kind, needle));
  const exact = candidates.find((entry) => entry.id === needle);
  if (exact) return exact;
  if (candidates.length === 1) return candidates[0]!;
  if (candidates.length > 1) {
    throw new Error(`${kind}이 여럿에 걸립니다: ${candidates.map((e) => e.id).join(", ")}`);
  }
  throw new Error(`${kind}을 찾지 못했습니다: ${needle}`);
}

function collect(found: ReturnType<typeof findEntry>): Entry[] {
  if ("entry" in found) return [found.entry];
  if ("ambiguous" in found) return found.ambiguous;
  return [];
}

function bodyOf(root: string, name: string): string {
  return parseDoc(template(root, name)).body;
}

/**
 * **frontmatter의 시간은 초 단위 ISO다.** 여기서 자르는 것은 레지스트리 표의 `createdAt`
 * 칸뿐이다 — 그것은 frontmatter가 아니라 사람이 읽는 표이고, append-only라 형식을 바꾸면
 * 한 표에 두 형식이 섞인다.
 */
function registryDate(now: string): string {
  return now.slice(0, 10);
}

const IDEA_DIRS = { research: "ideaResearch", freememo: "ideaFreememo", file: "ideaFiles" } as const;
export type IdeaKind = keyof typeof IDEA_DIRS;

export function isIdeaKind(value: string): value is IdeaKind {
  return value in IDEA_DIRS;
}

/**
 * backlog와 idea는 번호가 아니라 해시를 쓴다 — 졸업하거나 버려지는 것이라 번호를
 * 영구히 점유할 이유가 없다. 그래서 레지스트리도 없다(`id.ts`의 `isRegistered`).
 *
 * **본문은 비운다.** 무엇을 적을지는 agent가 정한다 — `make generation`과 같다.
 */
export function makeBacklog(root: string, opts: MakeBacklog): Made {
  const id = issue(root, "backlog", opts.title, registryDate(opts.now));
  const slug = opts.slug ?? slugify(opts.title);
  const data: Record<string, unknown> = { id, slug, type: opts.type, title: opts.title };
  if (opts.from) data.from = opts.from;
  data.createdAt = opts.now;
  data.status = "open";
  return writeLoose(root, paths(root).backlog, id, slug, data, "backlog.md");
}

/** backlog와 같은 모양이다 — 상태와 위치는 다른 질문이므로 status는 건드리지 않는다. */
export function markIdea(root: string, needle: string, flag: "archived"): Made {
  const found = findEntry(root, "idea", needle);
  if ("ambiguous" in found) throw new Error(`idea가 여럿에 걸립니다: ${found.ambiguous.map((e) => e.id).join(", ")}`);
  if (!("entry" in found)) throw new Error(`idea를 찾지 못했습니다: ${needle}`);
  const entry = found.entry;
  const p = paths(root);
  const kindDir = basename(entry.dir);
  if (entry.dir.startsWith(p.archiveIdea)) throw new Error(`이미 archive에 있습니다: ${entry.id}`);
  const dest = join(p.archiveIdea, kindDir, basename(entry.path));
  ensureDir(join(p.archiveIdea, kindDir));
  renameSync(entry.path, dest);
  void flag;
  return { id: entry.id, path: dest };
}

export function makeIdea(root: string, opts: MakeIdea): Made {
  const id = issue(root, "idea", opts.title, registryDate(opts.now));
  const slug = opts.slug ?? slugify(opts.title);
  const data: Record<string, unknown> = { id, slug, kind: opts.kind, title: opts.title };
  data.createdAt = opts.now;
  data.status = "open";
  return writeLoose(root, paths(root)[IDEA_DIRS[opts.kind]], id, slug, data, `idea-${opts.kind}.md`);
}

/**
 * 이벤트는 여섯뿐이다 — `hooks.ts`의 `HOOK_EVENTS`가 정본이다. 파일명은 발화 시점에
 * `listHooks`가 다시 파싱할 수 있어야 하므로 여기서 조립한 규약(`{event}.{name}.{type}`)을 어기지 않는다.
 */
export function makeHook(root: string, opts: MakeHook): Made {
  if (!isHookEvent(opts.event)) {
    throw new Error(`hook에는 --event가 필요합니다: ${HOOK_EVENTS.join(" · ")} (받은 값: ${opts.event || "(없음)"})`);
  }
  if (!opts.name || !/^[a-zA-Z0-9_-]+$/.test(opts.name)) {
    throw new Error(`hook에는 --name이 필요합니다. 영문자·숫자·-·_만 씁니다 (받은 값: ${opts.name || "(없음)"})`);
  }
  const type = opts.type ?? "md";
  if (type !== "md" && type !== "sh") {
    throw new Error(`--type은 md 또는 sh입니다: ${type}`);
  }
  const condition = opts.condition ?? "always";
  const order = opts.order !== undefined ? Number(opts.order) : 50;
  if (!Number.isInteger(order)) {
    throw new Error(`--order는 정수입니다: ${opts.order}`);
  }

  const filename = `${opts.event}.${opts.name}.${type}`;
  const dir = paths(root).hooks;
  ensureDir(dir);
  const path = join(dir, filename);
  if (existsSync(path)) throw new Error(`이미 있습니다: ${filename}`);

  const templateName = type === "md" ? "hook-md.md" : "hook-sh.sh";
  const content = render(template(root, templateName), { condition, order: String(order) });
  writeFileAtomic(path, content);
  if (type === "sh") chmodSync(path, 0o755);
  return { id: filename, path };
}

function writeLoose(
  root: string,
  dir: string,
  id: string,
  slug: string,
  data: Record<string, unknown>,
  template: string,
): Made {
  ensureDir(dir);
  const path = join(dir, `${id}-${slug}.md`);
  writeFileAtomic(path, formatDoc(data, bodyOf(root, template)));
  return { id, path };
}
