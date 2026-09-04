import { afterEach, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDirs, commit, initRepo, labelPrefix, tempDir } from "./helpers.ts";
import { run } from "../src/cli.ts";
import { arrive, claim, orchDir, release, roster, waitBarrier } from "../src/orch.ts";
import { paths } from "../src/store.ts";
import { ko } from "../src/messages/ko.ts";

afterEach(cleanupTempDirs);

const CLAIMED_CONNECTOR = ko["orch.already_claimed"].split("{holder}")[1]!.split("{expiresAt}")[0]!;
const TIMEOUT_WORD = ko["orch.barrier_timeout"].split("{name}")[1]!.split("{timeout}")[0]!.trim();

async function project(): Promise<{ root: string; home: string }> {
  const root = tempDir();
  initRepo(root);
  writeFileSync(join(root, "a.txt"), "a");
  commit(root, "첫 커밋");
  await run(["init"], root);
  const home = tempDir("reap-home-");
  return { root, home };
}

const env = (home: string, agent: string) => ({ ...process.env, REAP_HOME: home, REAP_AGENT: agent });

function writeHook(root: string, name: string, content: string): void {
  const dir = paths(root).hooks;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), content);
}

test("공유 상태는 리포 밖 ~/.reap/orch/<workspace-id>/<topic>/에 산다", async () => {
  const { root, home } = await project();
  const dir = orchDir(root, "t", env(home, "a"));
  expect(dir.startsWith(join(home, "orch"))).toBe(true);
  expect(dir.endsWith("/t")).toBe(true);
  expect(dir.includes(root)).toBe(false);
});

test("claim은 O_EXCL — 둘째는 holder와 만료를 보고 실패한다, 같은 holder는 갱신한다", async () => {
  const { root, home } = await project();
  const a = claim(root, "t", "src/auth/**", 60_000, env(home, "reap-t-a"));
  expect(a.holder).toBe("reap-t-a");
  expect(() => claim(root, "t", "src/auth/**", 60_000, env(home, "reap-t-b"))).toThrow(new RegExp(`holder reap-t-a${CLAIMED_CONNECTOR}`));
  const again = claim(root, "t", "src/auth/**", 60_000, env(home, "reap-t-a"));
  expect(again.holder).toBe("reap-t-a");
});

test("만료된 claim은 가져갈 수 있고 탈취가 로그에 남는다", async () => {
  const { root, home } = await project();
  claim(root, "t", "ms-004", 1, env(home, "reap-t-a"));
  await Bun.sleep(1100);
  const b = claim(root, "t", "ms-004", 60_000, env(home, "reap-t-b"));
  expect(b.holder).toBe("reap-t-b");
  const log = readFileSync(join(orchDir(root, "t", env(home, "x")), "log.jsonl"), "utf8");
  expect(log).toContain('"event":"takeover"');
  expect(log).toContain('"from":"reap-t-a"');
});

test("release는 holder만 할 수 있다", async () => {
  const { root, home } = await project();
  claim(root, "t", "r", 60_000, env(home, "reap-t-a"));
  expect(() => release(root, "t", "r", env(home, "reap-t-b"))).toThrow(labelPrefix("orch.someone_elses_claim").trim());
  release(root, "t", "r", env(home, "reap-t-a"));
  expect(() => release(root, "t", "r", env(home, "reap-t-a"))).toThrow(labelPrefix("orch.not_claimed").trim());
});

test("barrier — expect에 닿으면 통과, 같은 세션의 두 번째 도착은 세지 않는다", async () => {
  const { root, home } = await project();
  arrive(root, "t", "done", 2, env(home, "reap-t-a"));
  arrive(root, "t", "done", 2, env(home, "reap-t-a"));
  const waiting = waitBarrier(root, "t", "done", 2, 5_000, env(home, "reap-t-a"));
  await Bun.sleep(100);
  arrive(root, "t", "done", 2, env(home, "reap-t-b"));
  const r = await waiting;
  expect(r.released).toBe(true);
  expect(r.barrier.arrived.map((a) => a.who).sort()).toEqual(["reap-t-a", "reap-t-b"]);
});

test("barrier 시간 초과 — 누가 오지 않았는지를 낸다 (roster를 알 때)", async () => {
  const { root, home } = await project();
  arrive(root, "t", "b2", 2, env(home, "reap-t-a"));
  const r = await waitBarrier(root, "t", "b2", 2, 200, env(home, "reap-t-a"));
  expect(r.released).toBe(false);
  expect(r.barrier.arrived.length).toBe(1);
});

test("claim 성공이 orch.claimed를 발화한다", async () => {
  const { root, home } = await project();
  writeHook(root, "orch.claimed.note.sh", "#!/usr/bin/env bash\necho 잡음\n");
  const c = claim(root, "t", "ms-004", 60_000, env(home, "reap-t-a"));
  expect(c.hooks?.outputs).toEqual([{ file: "orch.claimed.note.sh", text: "잡음" }]);
});

test("barrier 해제가 orch.barrier.released를 발화한다", async () => {
  const { root, home } = await project();
  writeHook(root, "orch.barrier.released.note.sh", "#!/usr/bin/env bash\necho 통과\n");
  arrive(root, "t", "done2", 1, env(home, "reap-t-a"));
  const r = await waitBarrier(root, "t", "done2", 1, 2000, env(home, "reap-t-a"));
  expect(r.released).toBe(true);
  expect(r.hooks?.outputs).toEqual([{ file: "orch.barrier.released.note.sh", text: "통과" }]);
});

test("barrier 시간 초과에는 훅을 발화하지 않는다", async () => {
  const { root, home } = await project();
  writeHook(root, "orch.barrier.released.note.sh", "#!/usr/bin/env bash\necho 통과\n");
  arrive(root, "t", "b3", 2, env(home, "reap-t-a"));
  const r = await waitBarrier(root, "t", "b3", 2, 100, env(home, "reap-t-a"));
  expect(r.released).toBe(false);
  expect(r.hooks).toBeUndefined();
});

test("roster는 reap-<topic>-로 시작하는 세션만 추리고, 못 읽으면 빈 목록이다", () => {
  const json = JSON.stringify([
    { name: "reap-t-writer", state: "idle", cwd: "/x" },
    { name: "reap-other-x", state: "busy" },
    { name: "무관", state: "idle" },
    { nope: true },
  ]);
  expect(roster("t", () => json).map((a) => a.name)).toEqual(["reap-t-writer"]);
  expect(roster("t", () => "not json")).toEqual([]);
  expect(roster("t", () => { throw new Error("no claude"); })).toEqual([]);
});

test("CLI — barrier는 --timeout이 필수이고, status가 claims·barriers를 낸다", async () => {
  const { root, home } = await project();
  process.env.REAP_HOME = home;
  process.env.REAP_AGENT = "reap-main-me";
  try {
    const noTimeout = await run(["orch", "barrier", "x", "--expect", "2"], root);
    expect(noTimeout.ok).toBe(false);
    expect(noTimeout.message).toContain("--timeout");
    expect((await run(["orch", "claim", "ms-004", "--ttl", "5m"], root)).ok).toBe(true);
    const timedOut = await run(["orch", "barrier", "x", "--expect", "2", "--timeout", "1"], root);
    expect(timedOut.ok).toBe(false);
    expect(timedOut.message).toContain(TIMEOUT_WORD);
    const s = await run(["orch", "status"], root);
    expect(s.message).toContain("ms-004  reap-main-me");
    expect(s.message).toContain("x  1/2");
    expect(existsSync(join(home, "orch"))).toBe(true);
  } finally {
    delete process.env.REAP_HOME;
    delete process.env.REAP_AGENT;
  }
});
