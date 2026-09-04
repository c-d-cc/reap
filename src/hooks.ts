import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseDoc } from "./doc.ts";
import { paths } from "./store.ts";
import { t } from "./i18n.ts";

export const HOOK_EVENTS = [
  "gen.made",
  "gen.closed",
  "milestone.made",
  "milestone.closed",
  "orch.claimed",
  "orch.barrier.released",
] as const;
export type HookEvent = (typeof HOOK_EVENTS)[number];

export function isHookEvent(value: string): value is HookEvent {
  return (HOOK_EVENTS as readonly string[]).includes(value);
}

export type HookMeta = {
  file: string;
  name: string;
  type: "md" | "sh";
  condition: string;
  order: number;
};

export type HookOutput = { file: string; text: string };
export type HookFailure = { file: string; reason: string };
export type HookSkipped = { file: string; reason: string };
export type RunHooksResult = { outputs: HookOutput[]; failures: HookFailure[]; skipped: HookSkipped[] };
export type RunHooksOptions = { timeoutMs?: number; conditionTimeoutMs?: number };

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_CONDITION_TIMEOUT_MS = 10_000;

/** `.reap/hooks/`에서 `{event}.{name}.{md|sh}` 규약에 맞는 파일만 골라 메타를 붙인다. */
export function listHooks(root: string, event: string): HookMeta[] {
  const dir = paths(root).hooks;
  if (!existsSync(dir)) return [];
  const pattern = new RegExp(`^${escapeRegExp(event)}\\.(.+)\\.(md|sh)$`);
  const metas: HookMeta[] = [];
  for (const file of readdirSync(dir)) {
    const full = join(dir, file);
    if (!statSync(full).isFile()) continue;
    const match = pattern.exec(file);
    if (!match) continue;
    const type = match[2] as "md" | "sh";
    const { condition, order } = type === "md" ? parseMdMeta(full) : parseShMeta(full);
    metas.push({ file, name: match[1]!, type, condition, order });
  }
  metas.sort((a, b) => a.order - b.order || a.file.localeCompare(b.file));
  return metas;
}

/**
 * 조건 판정 → order 정렬(`listHooks`가 이미 함) → 실행. **절대 throw하지 않는다** —
 * exit≠0·timeout은 failures로, **조건 미충족은 skipped로** 보낸다(실패가 아니다).
 * 조건 스크립트 자체가 없는 것은 failures다 — doctor가 결함으로 잡을 것이다.
 */
export function runHooks(root: string, event: string, ctx: { id?: string } = {}, options: RunHooksOptions = {}): RunHooksResult {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const conditionTimeoutMs = options.conditionTimeoutMs ?? DEFAULT_CONDITION_TIMEOUT_MS;
  const outputs: HookOutput[] = [];
  const failures: HookFailure[] = [];
  const skipped: HookSkipped[] = [];

  for (const hook of listHooks(root, event)) {
    const condition = evaluateCondition(root, hook.condition, conditionTimeoutMs);
    if (!condition.met) {
      (condition.missing ? failures : skipped).push({ file: hook.file, reason: condition.reason });
      continue;
    }
    const full = join(paths(root).hooks, hook.file);
    if (hook.type === "md") {
      outputs.push({ file: hook.file, text: parseDoc(readFileSync(full, "utf8")).body });
      continue;
    }
    const env = { ...process.env, REAP_HOOK_EVENT: event, ...(ctx.id !== undefined ? { REAP_HOOK_ID: ctx.id } : {}) };
    const result = spawnSync("bash", [full], { cwd: root, timeout: timeoutMs, env, encoding: "utf8" });
    const failure = shFailure(result, root);
    if (failure) {
      failures.push({ file: hook.file, reason: failure });
      continue;
    }
    outputs.push({ file: hook.file, text: (result.stdout ?? "").trim() });
  }

  return { outputs, failures, skipped };
}

function evaluateCondition(root: string, condition: string, timeoutMs: number): { met: true } | { met: false; reason: string; missing: boolean } {
  if (condition === "always") return { met: true };
  const script = join(paths(root).hookConditions, `${condition}.sh`);
  if (!existsSync(script)) return { met: false, reason: t(root, "hooks.condition_missing", { condition }), missing: true };
  const result = spawnSync("bash", [script], { cwd: root, timeout: timeoutMs, encoding: "utf8" });
  const failure = shFailure(result, root);
  if (failure) return { met: false, reason: t(root, "hooks.condition_false", { condition, failure }), missing: false };
  return { met: true };
}

/** 실행 실패 사유를 한 곳에서 판정한다. 문제가 없으면 `undefined`. */
function shFailure(result: ReturnType<typeof spawnSync>, root?: string | null): string | undefined {
  if (result.error) {
    if ((result.error as NodeJS.ErrnoException).code === "ETIMEDOUT") return t(root, "hooks.timeout");
    return t(root, "hooks.exec_failed", { message: result.error.message });
  }
  if (result.status !== 0) return t(root, "hooks.exit_code", { status: result.status ?? "" });
  return undefined;
}

function parseMdMeta(path: string): { condition: string; order: number } {
  const { data } = parseDoc(readFileSync(path, "utf8"));
  const condition = typeof data.condition === "string" && data.condition !== "" ? data.condition : "always";
  const order = data.order !== undefined ? Number(data.order) : 50;
  return { condition, order: Number.isFinite(order) ? order : 50 };
}

function parseShMeta(path: string): { condition: string; order: number } {
  let condition = "always";
  let order = 50;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const c = /^#\s*condition:\s*(.+?)\s*$/.exec(line);
    if (c) condition = c[1]!;
    const o = /^#\s*order:\s*(-?\d+)\s*$/.exec(line);
    if (o) order = Number(o[1]);
  }
  return { condition, order };
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
