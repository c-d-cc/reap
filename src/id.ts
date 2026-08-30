import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { paths, writeFileAtomic } from "./store.ts";

export type Kind = "milestone" | "generation" | "loop" | "source" | "backlog" | "idea";
/** `plan`은 `loop-0001` 이전의 역사다 — 파싱은 하고 발급은 `entries.ts`가 막는다. */
export type GenerationType = "plan" | "exec" | "fix";
export type LoopType = "plan" | "design" | "uiux" | "idea";
export type Row = { id: string; title: string; createdAt: string };

export const GENERATION_TYPES: readonly GenerationType[] = ["plan", "exec", "fix"];
export const LOOP_TYPES: readonly LoopType[] = ["plan", "design", "uiux", "idea"];

const HASH = /^[0-9a-f]{6}$/;

/**
 * 오래 인용되는 것은 번호를, 소비되고 사라지는 것은 해시를 받는다.
 * **자릿수로는 못 가른다** — 6자리 숫자는 6자리 hex이기도 하다. 접두사가 계열을 정하고,
 * 계열이 접두사 뒤에 올 수 있는 것을 정한다.
 *
 * **generation은 유형을 id 안에 품는다** (`gen-0002-exec`). 그래서 `rest`가 두 마디이고,
 * 유형이 없거나 모르는 것이면 그것은 id가 아니다 — 뒤에 오는 것이 slug인지 유형인지
 * 가르는 유일한 근거가 이 형식이기 때문이다.
 *
 * **loop도 같은 모양이다** (`loop-0001-plan`) — generation과 다른 계열이라 번호가 따로 간다.
 */
const PREFIXES: Record<string, { kind: Kind; rest: RegExp; pad?: number }> = {
  ms: { kind: "milestone", rest: /^\d{3,}$/, pad: 3 },
  gen: { kind: "generation", rest: /^\d{4,}-(?:plan|exec|fix)$/, pad: 4 },
  loop: { kind: "loop", rest: /^\d{4,}-(?:plan|design|uiux|idea)$/, pad: 4 },
  ps: { kind: "source", rest: HASH },
  bk: { kind: "backlog", rest: HASH },
  idea: { kind: "idea", rest: HASH },
};

const REGISTRY: Partial<Record<Kind, string>> = {
  milestone: "milestone.md",
  generation: "generation.md",
  loop: "loop.md",
  source: "source.md",
};

export function kindOf(id: string): Kind | null {
  const at = id.indexOf("-");
  if (at <= 0) return null;
  const spec = PREFIXES[id.slice(0, at)];
  if (!spec) return null;
  return spec.rest.test(id.slice(at + 1)) ? spec.kind : null;
}

/** `gen-0002-exec-token-rotation.md`에서 id가 어디서 끝나는지는 형식만이 안다. */
export function generationTypeOf(id: string): GenerationType | null {
  if (kindOf(id) !== "generation") return null;
  return id.slice(id.lastIndexOf("-") + 1) as GenerationType;
}

export function loopTypeOf(id: string): LoopType | null {
  if (kindOf(id) !== "loop") return null;
  return id.slice(id.lastIndexOf("-") + 1) as LoopType;
}

export function isLoopType(value: string): value is LoopType {
  return (LOOP_TYPES as readonly string[]).includes(value);
}

export function isValid(id: string): boolean {
  return kindOf(id) !== null;
}

export function isRegistered(kind: Kind): boolean {
  return REGISTRY[kind] !== undefined;
}

export function readRegistry(root: string, kind: Kind): Row[] {
  const path = registryPath(root, kind);
  if (!path || !existsSync(path)) return [];
  const rows: Row[] = [];
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const cells = trimmed.slice(1, trimmed.endsWith("|") ? -1 : undefined).split("|");
    if (cells.length < 3) continue;
    const id = cells[0]!.trim();
    if (!isValid(id)) continue;
    rows.push({ id, title: unescapeCell(cells[1]!.trim()), createdAt: cells[2]!.trim() });
  }
  return rows;
}

/**
 * 레지스트리는 append-only다. 항목을 지워도 행은 남고, 번호는 다시 발급되지 않는다.
 *
 * **generation은 유형이 달라도 하나의 계열에서 번호를 받는다.** 유형마다 계열을 나누면
 * 한 폴더에 쌓였을 때 이름순 정렬이 시간순을 잃는다.
 */
export function issue(root: string, kind: Kind, title: string, today: string, type?: GenerationType | LoopType): string {
  const prefix = prefixOf(kind);
  const suffix = kind === "generation" || kind === "loop" ? `-${requireType(kind, type)}` : "";
  const pad = PREFIXES[prefix]?.pad;
  // 번호냐 해시냐는 접두사가 정하고, 레지스트리 행을 남기느냐는 별개다 — plan source는 해시인데 행을 남긴다
  if (!isRegistered(kind)) return `${prefix}-${randomHash()}`;

  const path = registryPath(root, kind)!;
  const rows = readRegistry(root, kind);
  const next = rows.reduce((max, row) => Math.max(max, numberOf(row.id)), 0) + 1;
  const id = pad === undefined ? `${prefix}-${randomHash()}` : `${prefix}-${String(next).padStart(pad, "0")}${suffix}`;

  const header = `<!-- reap:sequence(${kind}) — append only. 발급된 번호는 다시 발급되지 않는다. -->\n| id | title | createdAt |\n|---|---|---|\n`;
  const current = existsSync(path) ? readFileSync(path, "utf8") : header;
  const prefixText = current.endsWith("\n") ? current : `${current}\n`;
  writeFileAtomic(path, `${prefixText}| ${id} | ${escapeCell(title)} | ${today} |\n`);
  return id;
}

function registryPath(root: string, kind: Kind): string | null {
  const name = REGISTRY[kind];
  return name ? join(paths(root).sequence, name) : null;
}

function prefixOf(kind: Kind): string {
  for (const [prefix, spec] of Object.entries(PREFIXES)) {
    if (spec.kind === kind) return prefix;
  }
  throw new Error(`모르는 종류입니다: ${kind}`);
}

function requireType(kind: Kind, type?: GenerationType | LoopType): GenerationType | LoopType {
  if (!type) {
    const types = kind === "loop" ? LOOP_TYPES : GENERATION_TYPES;
    throw new Error(`${kind} id에는 유형이 필요합니다: ${types.join(" | ")}`);
  }
  return type;
}

/** `gen-0002-exec`의 번호는 첫 마디다. 뒤에 유형이 붙어도 여기까지만 읽는다. */
function numberOf(id: string): number {
  const n = Number.parseInt(id.slice(id.indexOf("-") + 1).split("-")[0]!, 10);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * 제목은 사람이 쓴 문자열이고 `|`와 개행은 표를 깬다.
 * **이스케이프한 만큼 정확히 되돌린다** — 한쪽만 하면 뒤 칸(createdAt)이 조용히 사라진다.
 */
function escapeCell(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("|", "&#124;").replaceAll("\r\n", "&#10;").replaceAll("\n", "&#10;");
}

function unescapeCell(text: string): string {
  return text.replaceAll("&#10;", "\n").replaceAll("&#124;", "|").replaceAll("&amp;", "&");
}

function randomHash(): string {
  return Array.from({ length: 6 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
}
