import { afterEach, expect, test } from "bun:test";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDirs, commit, initRepo, labelPrefix, tempDir } from "./helpers.ts";
import { run } from "../src/cli.ts";
import { diagnose } from "../src/doctor.ts";
import { t } from "../src/i18n.ts";

afterEach(cleanupTempDirs);

async function project(): Promise<string> {
  const root = tempDir();
  initRepo(root);
  writeFileSync(join(root, "a.txt"), "a");
  commit(root, "첫 커밋");
  await run(["init"], root);
  for (const f of ["genome/application.md", "genome/evolution.md", "environment/summary.md"]) {
    writeFileSync(join(root, ".reap", f), "# 채움\n");
  }
  return root;
}

function kinds(root: string) {
  const r = diagnose(root);
  return { defects: r.defects.map((f) => f.kind), notes: r.notes.map((f) => f.kind), r };
}

test("깨끗한 프로젝트는 결함이 없고 doctor는 아무것도 쓰지 않는다", async () => {
  const root = await project();
  const before = statSync(join(root, ".reap", "map.md")).mtimeMs;
  const result = await run(["doctor"], root);
  expect(result.ok).toBe(true);
  expect(result.message).toContain(`${labelPrefix("doctor.report.header")}0`);
  expect(statSync(join(root, ".reap", "map.md")).mtimeMs).toBe(before);
});

test("커밋 없이 닫힌 generation을 잡는다 — 근본 거래의 성적표", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  await run(["mark", "generation", "gen-0001-exec", "--closed"], root);
  const { defects, r } = kinds(root);
  const kind = t(root, "doctor.kind.gen_closed_no_commit");
  expect(defects).toContain(kind);
  expect(r.defects.find((f) => f.kind === kind)!.detail).toContain("gen-0001-exec");
});

test("끊긴 참조를 잡는다 — from · milestone · backlog · consumedBy · loop.milestones · refs", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가", "--from", "loop-0009-plan"], root);
  await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  writeFileSync(
    join(root, ".reap", "life", "backlog", "bk-aaaaaa-x.md"),
    "---\nid: bk-aaaaaa\nslug: x\ntype: t\ntitle: x\nstatus: consumed\nconsumedBy: gen-0077-exec\n---\n",
  );
  writeFileSync(join(root, ".reap", "life", "loops", "loop-0001-plan-y.md"), "---\nid: loop-0001-plan\nslug: y\ntype: plan\ntitle: y\nstatus: closed\nmilestones:\n  - ms-042\n---\n");
  writeFileSync(join(root, ".reap", "plan", "sources.yml"), "sources:\n  - id: ps-4f2a91\n    root: .\n    role: r\n    convention: c.md\n");
  const ms = join(root, ".reap", "vision", "milestones", "ms-001-가", "milestone.md");
  writeFileSync(ms, readFileSync(ms, "utf8").replace("status: open", "refs:\n  - ps-4f2a91:없는파일.md\nstatus: open"));
  const { r } = kinds(root);
  const broken = r.defects.filter((f) => f.kind === t(root, "doctor.kind.broken_ref")).map((f) => f.detail).join("\n");
  expect(broken).toContain("loop-0009-plan");
  expect(broken).toContain("gen-0077-exec");
  expect(broken).toContain("ms-042");
  expect(broken).toContain("없는파일.md");
});

test("focus가 둘이면 잡고, 열린 채 바인딩 안 된 generation은 참고로 낸다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가", "--focus"], root);
  await run(["make", "milestone", "--title", "나"], root);
  const nb = join(root, ".reap", "vision", "milestones", "ms-002-나", "milestone.md");
  writeFileSync(nb, readFileSync(nb, "utf8").replace("status: open", "status: open\nfocus: true"));
  await run(["make", "generation", "--milestone", "ms-001", "--title", "다"], root);
  writeFileSync(join(root, ".reap", ".session"), "sessionId: other\n");
  const { defects, notes } = kinds(root);
  expect(defects).toContain(t(root, "doctor.kind.duplicate_focus"));
  expect(notes).toContain(t(root, "doctor.kind.gen_unbound"));
});

test("map.md가 씨앗과 어긋나면 참고로 내고, 레지스트리에 없는 id는 결함이다", async () => {
  const root = await project();
  writeFileSync(join(root, ".reap", "map.md"), "# 내 지도\n");
  writeFileSync(join(root, ".reap", "life", "generations", "gen-0005-fix-z.md"), "---\nid: gen-0005-fix\nslug: z\ntype: fix\ntitle: z\nstatus: open\n---\n");
  const { defects, notes } = kinds(root);
  expect(notes).toContain(t(root, "doctor.kind.map_diverged"));
  expect(defects).toContain(t(root, "doctor.kind.id_unregistered"));
});

test("안내선 — 주입되는 파일이 크면 경고하고, 졸업 조건 없는 research는 참고다", async () => {
  const root = await project();
  writeFileSync(join(root, ".reap", "genome", "application.md"), `# A\n${"가".repeat(7000)}\n`);
  writeFileSync(join(root, ".reap", "idea", "research", "idea-b1b1b1-q.md"), "---\nid: idea-b1b1b1\nslug: q\nkind: research\ntitle: q\nstatus: open\n---\n\n## 무엇이 미정인가\n\n?\n");
  const { notes, r } = kinds(root);
  const sizeKind = t(root, "doctor.kind.size_guideline");
  expect(notes).toContain(sizeKind);
  expect(r.notes.find((f) => f.kind === sizeKind)!.detail).toContain("genome/application.md");
  expect(notes).toContain(t(root, "doctor.kind.idea_no_graduation"));
});

test("기록 안 상대 링크가 깨지면 결함이다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  const ms = join(root, ".reap", "vision", "milestones", "ms-001-가", "milestone.md");
  writeFileSync(ms, readFileSync(ms, "utf8") + "\n[spec](../../../../docs/없음.md) [ok](./milestone.md) [web](https://x.y/z)\n");
  const { r } = kinds(root);
  const links = r.defects.filter((f) => f.kind === t(root, "doctor.kind.broken_link"));
  expect(links.length).toBe(1);
  expect(links[0]!.detail).toContain("없음.md");
});

test("carrier 충돌은 결함, 고아는 참고다", async () => {
  const root = await project();
  const mark = (h: string, s: string) => ["reap:", "carrier-", h, "-", s].join("");
  writeFileSync(join(root, "one.md"), `${mark("111111", "a")}\n`);
  writeFileSync(join(root, "two.md"), `${mark("222222", "a")}\n`);
  const { defects, notes } = kinds(root);
  expect(defects).toContain("carrier");
  expect(notes).toContain(t(root, "doctor.kind.carrier_orphan"));
});

test("hooks — 규약 밖 파일명·모르는 이벤트·없는 조건 스크립트를 결함으로 낸다", async () => {
  const root = await project();
  const hooks = join(root, ".reap", "hooks");
  writeFileSync(join(hooks, "그냥파일.txt"), "x");
  writeFileSync(join(hooks, "onLifeStarted.legacy.sh"), "#!/usr/bin/env bash\necho x\n");
  writeFileSync(join(hooks, "gen.made.needs-cond.sh"), "#!/usr/bin/env bash\n# condition: no-such-condition\necho x\n");
  const { defects, r } = kinds(root);
  const filenameKind = t(root, "doctor.kind.hook_filename_invalid");
  const unknownEventKind = t(root, "doctor.kind.hook_unknown_event");
  const missingConditionKind = t(root, "doctor.kind.hook_condition_missing");
  expect(defects).toContain(filenameKind);
  expect(defects).toContain(unknownEventKind);
  expect(defects).toContain(missingConditionKind);
  expect(r.defects.find((f) => f.kind === filenameKind)!.detail).toContain("그냥파일.txt");
  expect(r.defects.find((f) => f.kind === unknownEventKind)!.detail).toContain("onLifeStarted.legacy.sh");
  expect(r.defects.find((f) => f.kind === missingConditionKind)!.detail).toContain("gen.made.needs-cond.sh");
});

test("hooks — conditions/ 안의 파일과 규약에 맞는 훅은 결함이 아니다", async () => {
  const root = await project();
  const hooks = join(root, ".reap", "hooks");
  writeFileSync(join(hooks, "gen.made.ok.sh"), "#!/usr/bin/env bash\necho x\n");
  writeFileSync(join(root, ".reap", "hooks", "conditions", "always.sh"), "#!/usr/bin/env bash\nexit 0\n");
  const { defects } = kinds(root);
  expect(defects).not.toContain(t(root, "doctor.kind.hook_filename_invalid"));
  expect(defects).not.toContain(t(root, "doctor.kind.hook_unknown_event"));
  expect(defects).not.toContain(t(root, "doctor.kind.hook_condition_missing"));
});
