import { execFileSync } from "node:child_process";
import { closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, writeSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { readSession, workspaceId, writeFileAtomic } from "./store.ts";

function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type Claim = { resource: string; holder: string; acquiredAt: string; expiresAt: string };
export type Barrier = { name: string; expect: number; arrived: { who: string; at: string }[] };
export type Agent = { name: string; state?: string; cwd?: string };

/**
 * 공유 상태는 리포 밖 `~/.reap/orch/<workspace-id>/<topic>/`에 산다 — 세션마다 `.reap/`가 별개
 * 사본(worktree)일 수 있으므로 리포 안에 두면 공유되지 않는다. workspace-id는 worktree 간에 수렴한다(probe).
 */
export function orchDir(root: string, topic: string, env = process.env): string {
  const home = env.REAP_HOME ?? join(homedir(), ".reap");
  return join(home, "orch", workspaceId(root), topic);
}

/** 이 세션의 주소. 이름이 있으면 이름(`claude -n reap-<topic>-<role>`), 없으면 세션 id. */
export function whoAmI(root: string, env = process.env): string {
  return env.REAP_AGENT?.trim() || readSession(root, env).sessionId;
}

export function parseTtl(text: string): number {
  const m = /^(\d+)(s|m|h)?$/.exec(text.trim());
  if (!m) throw new Error(`--ttl은 30m·2h·90s 꼴입니다: ${text}`);
  const n = Number(m[1]);
  return n * ({ s: 1, m: 60, h: 3600 }[m[2] ?? "m"] as number) * 1000;
}

function encode(resource: string): string {
  return encodeURIComponent(resource).replaceAll("%", "_");
}

function now(): string {
  return `${new Date().toISOString().slice(0, 19)}Z`;
}

function readKv(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const at = line.indexOf(":");
    if (at > 0) out[line.slice(0, at).trim()] = line.slice(at + 1).trim();
  }
  return out;
}

function log(dir: string, event: Record<string, unknown>): void {
  mkdirSync(dir, { recursive: true });
  const fd = openSync(join(dir, "log.jsonl"), "a");
  writeSync(fd, `${JSON.stringify({ at: now(), ...event })}\n`);
  closeSync(fd);
}

/**
 * `O_EXCL` — 파일이 곧 자물쇠다. 만료된 claim은 가져갈 수 있고 탈취는 로그에 남는다:
 * 죽은 세션 때문에 교착되는 것이 조용히 덮이는 것보다 낫다.
 */
export function claim(root: string, topic: string, resource: string, ttlMs: number, env = process.env): Claim {
  const dir = orchDir(root, topic, env);
  const claims = join(dir, "claims");
  mkdirSync(claims, { recursive: true });
  const path = join(claims, `${encode(resource)}.yml`);
  const me = whoAmI(root, env);
  const at = now();
  const expiresAt = `${new Date(Date.now() + ttlMs).toISOString().slice(0, 19)}Z`;
  const body = `resource: ${resource}\nholder: ${me}\nacquiredAt: ${at}\nexpiresAt: ${expiresAt}\n`;
  try {
    const fd = openSync(path, "wx");
    writeSync(fd, body);
    closeSync(fd);
    log(dir, { event: "claim", resource, holder: me, expiresAt });
    return { resource, holder: me, acquiredAt: at, expiresAt };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  }
  const current = readKv(path);
  if (current.holder === me) {
    writeFileAtomic(path, body);
    return { resource, holder: me, acquiredAt: at, expiresAt };
  }
  if (current.expiresAt && current.expiresAt < at) {
    writeFileAtomic(path, body);
    log(dir, { event: "takeover", resource, from: current.holder, to: me, expiredAt: current.expiresAt });
    return { resource, holder: me, acquiredAt: at, expiresAt };
  }
  throw new Error(`이미 잡혀 있습니다: ${resource} — holder ${current.holder}, 만료 ${current.expiresAt}`);
}

export function release(root: string, topic: string, resource: string, env = process.env): void {
  const dir = orchDir(root, topic, env);
  const path = join(dir, "claims", `${encode(resource)}.yml`);
  if (!existsSync(path)) throw new Error(`잡혀 있지 않습니다: ${resource}`);
  const current = readKv(path);
  const me = whoAmI(root, env);
  if (current.holder !== me) throw new Error(`남의 claim입니다: ${resource} — holder ${current.holder}. 만료를 기다리거나 그쪽에 말합니다`);
  rmSync(path);
  log(dir, { event: "release", resource, holder: me });
}

function readBarrier(path: string, name: string, expect: number): Barrier {
  if (!existsSync(path)) return { name, expect, arrived: [] };
  const arrived: Barrier["arrived"] = [];
  let exp = expect;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = /^\s+-\s+(\S+)\s+(\S+)$/.exec(line);
    if (m) arrived.push({ who: m[1]!, at: m[2]! });
    else if (line.startsWith("expect:")) exp = Number(line.slice(7).trim()) || expect;
  }
  return { name, expect: exp, arrived };
}

function writeBarrier(path: string, b: Barrier): void {
  writeFileAtomic(path, `name: ${b.name}\nexpect: ${b.expect}\narrived:\n${b.arrived.map((a) => `  - ${a.who} ${a.at}`).join("\n")}\n`);
}

/** 도착을 기록한다. 대기는 `waitBarrier`가 한다 — 둘을 가르면 테스트가 기다리지 않아도 된다. */
export function arrive(root: string, topic: string, name: string, expect: number, env = process.env): Barrier {
  const dir = orchDir(root, topic, env);
  const barriers = join(dir, "barriers");
  mkdirSync(barriers, { recursive: true });
  const path = join(barriers, `${encode(name)}.yml`);
  const lock = `${path}.lock`;
  const me = whoAmI(root, env);
  for (let i = 0; i < 200; i++) {
    try {
      const fd = openSync(lock, "wx");
      closeSync(fd);
      break;
    } catch {
      sleepSync(10);
    }
  }
  try {
    const b = readBarrier(path, name, expect);
    if (!b.arrived.some((a) => a.who === me)) b.arrived.push({ who: me, at: now() });
    writeBarrier(path, b);
    log(dir, { event: "arrive", barrier: name, who: me, arrived: b.arrived.length, expect: b.expect });
    return b;
  } finally {
    rmSync(lock, { force: true });
  }
}

/** `--timeout`은 필수다. 만료 시 **누가 오지 않았는지**를 낸다 — roster를 알면 이름으로, 모르면 개수로. */
export async function waitBarrier(
  root: string,
  topic: string,
  name: string,
  expect: number,
  timeoutMs: number,
  env = process.env,
): Promise<{ released: boolean; barrier: Barrier; missing: string[] }> {
  const path = join(orchDir(root, topic, env), "barriers", `${encode(name)}.yml`);
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const b = readBarrier(path, name, expect);
    if (b.arrived.length >= b.expect) {
      log(orchDir(root, topic, env), { event: "barrier.released", barrier: name });
      return { released: true, barrier: b, missing: [] };
    }
    if (Date.now() >= deadline) {
      const here = new Set(b.arrived.map((a) => a.who));
      const missing = roster(topic).filter((a) => !here.has(a.name)).map((a) => a.name);
      return { released: false, barrier: b, missing };
    }
    await sleep(Math.min(500, Math.max(50, deadline - Date.now())));
  }
}

/**
 * `claude agents --json`에서 `reap-<topic>-`로 시작하는 세션. 참가 등록은 없다 — 이름이 곧 참가다.
 * 명령이 없거나 필드가 없으면 실패하지 않고 빈 목록을 낸다; 부르는 쪽이 "알 수 없다"고 말한다.
 */
export function roster(topic: string, run: () => string = () => execFileSync("claude", ["agents", "--json"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })): Agent[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(run());
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const prefix = `reap-${topic}-`;
  return parsed
    .filter((a): a is Record<string, unknown> => typeof a === "object" && a !== null && typeof a.name === "string")
    .filter((a) => String(a.name).startsWith(prefix))
    .map((a) => ({ name: String(a.name), state: typeof a.state === "string" ? a.state : undefined, cwd: typeof a.cwd === "string" ? a.cwd : undefined }));
}

export function status(root: string, topic: string, env = process.env): { claims: Claim[]; barriers: Barrier[] } {
  const dir = orchDir(root, topic, env);
  const list = (sub: string) => {
    try {
      return readdirSync(join(dir, sub)).filter((n) => n.endsWith(".yml")).sort().map((n) => join(dir, sub, n));
    } catch {
      return [];
    }
  };
  const claims = list("claims").map((p) => readKv(p) as unknown as Claim);
  const barriers = list("barriers").map((p) => readBarrier(p, "", 0)).map((b, i) => ({ ...b, name: b.name || readKv(list("barriers")[i]!).name || "" }));
  return { claims, barriers };
}
