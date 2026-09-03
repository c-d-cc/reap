import { afterAll, afterEach, beforeAll, expect, test } from "bun:test";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cleanupTempDirs, commit, initRepo, tempDir } from "./helpers.ts";

afterEach(cleanupTempDirs);

const REPO_ROOT = join(import.meta.dir, "..");
let buildDir: string;
let bin: string;

beforeAll(() => {
  buildDir = realpathSync(mkdtempSync(join(realpathSync(tmpdir()), "reap-node-bundle-")));
  execFileSync(
    "bun",
    ["build", "--target=node", "--banner=#!/usr/bin/env node", "--entry-naming=reap.js", "src/cli.ts", "--outdir", buildDir],
    { cwd: REPO_ROOT, stdio: "ignore" },
  );
  bin = join(buildDir, "reap.js");
});

afterAll(() => {
  rmSync(buildDir, { recursive: true, force: true });
});

/** 리포 밖 cwd, `bun`이 없다고 가정할 필요 없이 `node`만으로 부른다. */
function node(root: string, ...args: string[]): { status: number | null; stdout: string; stderr: string } {
  const r = spawnSync("node", [bin, ...args], { cwd: root, encoding: "utf8" });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

test("node 번들이 --version을 낸다", () => {
  const r = node(REPO_ROOT, "--version");
  expect(r.status).toBe(0);
  expect(r.stdout).toContain("reap");
});

test("node 번들로 init·doctor·plan sources·index update/status·orch claim/release가 리포 밖에서 성공한다", () => {
  const root = tempDir();
  initRepo(root);
  writeFileSync(join(root, "a.ts"), "export function a() { return 1; }\n");
  commit(root, "첫 커밋");

  const init = node(root, "init");
  expect(init.status).toBe(0);

  const doctor = node(root, "doctor");
  expect(doctor.status).toBe(0);

  const sources = node(root, "plan", "sources");
  expect(sources.status).toBe(0);

  const update = node(root, "index", "update");
  expect(update.status).toBe(0);

  const status = node(root, "index", "status");
  expect(status.status).toBe(0);

  const claim = node(root, "orch", "claim", "x");
  expect(claim.status).toBe(0);
  const release = node(root, "orch", "release", "x");
  expect(release.status).toBe(0);
});
