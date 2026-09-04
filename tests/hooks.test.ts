import { afterEach, expect, test } from "bun:test";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDirs, commit, initRepo, labelPrefix, tempDir } from "./helpers.ts";
import { run } from "../src/cli.ts";
import { listHooks, runHooks } from "../src/hooks.ts";
import { paths } from "../src/store.ts";
import { t } from "../src/i18n.ts";

afterEach(cleanupTempDirs);

async function project(): Promise<string> {
  const root = tempDir();
  initRepo(root);
  writeFileSync(join(root, "a.txt"), "a");
  commit(root, "첫 커밋");
  await run(["init"], root);
  return root;
}

function writeHook(root: string, name: string, content: string, executable = false): string {
  const dir = paths(root).hooks;
  mkdirSync(dir, { recursive: true });
  const path = join(dir, name);
  writeFileSync(path, content);
  if (executable) chmodSync(path, 0o755);
  return path;
}

function writeCondition(root: string, name: string, content: string): string {
  const dir = paths(root).hookConditions;
  mkdirSync(dir, { recursive: true });
  const path = join(dir, name);
  writeFileSync(path, content);
  chmodSync(path, 0o755);
  return path;
}

test("listHooks가 md frontmatter의 condition·order를 읽는다", async () => {
  const root = await project();
  writeHook(root, "gen.made.review.md", "---\ncondition: has-changes\norder: 10\n---\n본문입니다\n");
  const hooks = listHooks(root, "gen.made");
  expect(hooks).toHaveLength(1);
  expect(hooks[0]).toMatchObject({ file: "gen.made.review.md", name: "review", type: "md", condition: "has-changes", order: 10 });
});

test("listHooks가 sh 주석의 condition·order를 읽는다", async () => {
  const root = await project();
  writeHook(root, "gen.closed.notify.sh", "#!/usr/bin/env bash\n# condition: has-changes\n# order: 5\necho hi\n");
  const hooks = listHooks(root, "gen.closed");
  expect(hooks).toHaveLength(1);
  expect(hooks[0]).toMatchObject({ file: "gen.closed.notify.sh", name: "notify", type: "sh", condition: "has-changes", order: 5 });
});

test("메타가 없으면 기본값 always·50이다 — md와 sh가 같다", async () => {
  const root = await project();
  writeHook(root, "gen.made.a.md", "본문만 있습니다\n");
  writeHook(root, "gen.made.b.sh", "#!/usr/bin/env bash\necho hi\n");
  const hooks = listHooks(root, "gen.made").sort((a, b) => a.file.localeCompare(b.file));
  expect(hooks[0]).toMatchObject({ condition: "always", order: 50 });
  expect(hooks[1]).toMatchObject({ condition: "always", order: 50 });
});

test("order 오름차순, 동률은 파일명순으로 정렬한다", async () => {
  const root = await project();
  writeHook(root, "gen.made.z.md", "---\norder: 10\n---\n");
  writeHook(root, "gen.made.a.md", "---\norder: 10\n---\n");
  writeHook(root, "gen.made.m.md", "---\norder: 1\n---\n");
  const hooks = listHooks(root, "gen.made");
  expect(hooks.map((h) => h.file)).toEqual(["gen.made.m.md", "gen.made.a.md", "gen.made.z.md"]);
});

test("다른 이벤트 파일은 섞이지 않는다", async () => {
  const root = await project();
  writeHook(root, "gen.made.a.md", "본문\n");
  writeHook(root, "gen.closed.b.md", "본문\n");
  expect(listHooks(root, "gen.made")).toHaveLength(1);
  expect(listHooks(root, "gen.closed")).toHaveLength(1);
});

test("runHooks가 조건이 참인 훅만 돌리고 md 본문을 그대로 돌려준다", async () => {
  const root = await project();
  writeCondition(root, "yes.sh", "#!/usr/bin/env bash\nexit 0\n");
  writeHook(root, "gen.made.note.md", "---\ncondition: yes\n---\n본문 내용입니다\n");
  const result = runHooks(root, "gen.made", {});
  expect(result.failures).toEqual([]);
  expect(result.outputs).toEqual([{ file: "gen.made.note.md", text: "본문 내용입니다\n" }]);
});

test("runHooks가 조건이 거짓이면 훅을 건너뛰고 skipped에 적는다 — 실패가 아니다", async () => {
  const root = await project();
  writeCondition(root, "no.sh", "#!/usr/bin/env bash\nexit 1\n");
  writeHook(root, "gen.made.note.md", "---\ncondition: no\n---\n본문\n");
  const result = runHooks(root, "gen.made", {});
  expect(result.outputs).toEqual([]);
  expect(result.failures).toEqual([]);
  expect(result.skipped).toHaveLength(1);
  expect(result.skipped[0]!.file).toBe("gen.made.note.md");
});

test("runHooks가 조건 스크립트가 없으면 failures에 적고 던지지 않는다 — skipped가 아니다", async () => {
  const root = await project();
  writeHook(root, "gen.made.note.md", "---\ncondition: no-such-condition\n---\n본문\n");
  const result = runHooks(root, "gen.made", {});
  expect(result.outputs).toEqual([]);
  expect(result.skipped).toEqual([]);
  expect(result.failures).toHaveLength(1);
  expect(result.failures[0]!.file).toBe("gen.made.note.md");
});

test("runHooks가 sh의 stdout을 모으고 REAP_HOOK_EVENT·REAP_HOOK_ID를 넘긴다", async () => {
  const root = await project();
  writeHook(root, "gen.made.echo.sh", '#!/usr/bin/env bash\necho "$REAP_HOOK_EVENT:$REAP_HOOK_ID"\n');
  const result = runHooks(root, "gen.made", { id: "gen-0001-exec" });
  expect(result.failures).toEqual([]);
  expect(result.outputs).toEqual([{ file: "gen.made.echo.sh", text: "gen.made:gen-0001-exec" }]);
});

test("runHooks가 exit 1인 sh를 failures로 보내고 던지지 않는다", async () => {
  const root = await project();
  writeHook(root, "gen.made.fail.sh", "#!/usr/bin/env bash\necho 안됨 >&2\nexit 1\n");
  const result = runHooks(root, "gen.made", {});
  expect(result.outputs).toEqual([]);
  expect(result.failures).toHaveLength(1);
  expect(result.failures[0]!.file).toBe("gen.made.fail.sh");
});

test("runHooks가 timeout인 sh를 failures로 보내고 던지지 않는다", async () => {
  const root = await project();
  writeHook(root, "gen.made.slow.sh", "#!/usr/bin/env bash\nsleep 2\necho done\n");
  const result = runHooks(root, "gen.made", {}, { timeoutMs: 100 });
  expect(result.outputs).toEqual([]);
  expect(result.failures).toHaveLength(1);
  expect(result.failures[0]!.file).toBe("gen.made.slow.sh");
});

test("runHooks가 여럿을 order 순서로 돌리고 출력도 그 순서다", async () => {
  const root = await project();
  writeHook(root, "gen.made.second.sh", "#!/usr/bin/env bash\n# order: 20\necho two\n");
  writeHook(root, "gen.made.first.sh", "#!/usr/bin/env bash\n# order: 10\necho one\n");
  const result = runHooks(root, "gen.made", {});
  expect(result.outputs.map((o) => o.text)).toEqual(["one", "two"]);
});

test("make hook이 모르는 이벤트를 거부한다", async () => {
  const root = await project();
  const result = await run(["make", "hook", "--event", "onLifeStarted", "--name", "x"], root);
  expect(result.ok).toBe(false);
  expect(existsSync(paths(root).hooks)).toBe(true);
  expect(listHooks(root, "onLifeStarted")).toEqual([]);
});

test("make hook이 이벤트 여섯을 받아 .reap/hooks/{event}.{name}.md를 놓는다 — 기본 type은 md", async () => {
  const root = await project();
  const result = await run(["make", "hook", "--event", "gen.made", "--name", "review"], root);
  expect(result.ok).toBe(true);
  const path = join(paths(root).hooks, "gen.made.review.md");
  expect(existsSync(path)).toBe(true);
  const content = readFileSync(path, "utf8");
  expect(content).toContain("condition: always");
  expect(content).toContain("order: 50");
});

test("make hook --type sh --condition --order가 반영되고 실행 비트가 선다", async () => {
  const root = await project();
  const result = await run(
    ["make", "hook", "--event", "milestone.closed", "--name", "notify", "--type", "sh", "--condition", "has-changes", "--order", "5"],
    root,
  );
  expect(result.ok).toBe(true);
  const path = join(paths(root).hooks, "milestone.closed.notify.sh");
  const content = readFileSync(path, "utf8");
  expect(content).toContain("# condition: has-changes");
  expect(content).toContain("# order: 5");
  const hooks = listHooks(root, "milestone.closed");
  expect(hooks[0]).toMatchObject({ condition: "has-changes", order: 5 });
});

test("make hook이 이미 있는 파일을 거부한다", async () => {
  const root = await project();
  const first = await run(["make", "hook", "--event", "gen.made", "--name", "review"], root);
  expect(first.ok).toBe(true);
  const second = await run(["make", "hook", "--event", "gen.made", "--name", "review"], root);
  expect(second.ok).toBe(false);
});

test("make hook이 프로젝트 템플릿 오버라이드를 따른다", async () => {
  const root = await project();
  const templatesDir = paths(root).templates;
  mkdirSync(templatesDir, { recursive: true });
  writeFileSync(join(templatesDir, "hook-md.md"), "---\ncondition: {{condition}}\norder: {{order}}\n---\n오버라이드 본문\n");
  const result = await run(["make", "hook", "--event", "gen.made", "--name", "custom"], root);
  expect(result.ok).toBe(true);
  const content = readFileSync(join(paths(root).hooks, "gen.made.custom.md"), "utf8");
  expect(content).toContain("오버라이드 본문");
});

// ── 여섯 지점 발화 ──

test("make milestone이 milestone.made를 발화하고 출력을 --- hooks --- 뒤에 붙인다", async () => {
  const root = await project();
  writeHook(root, "milestone.made.note.sh", "#!/usr/bin/env bash\necho 만들어짐\n");
  const result = await run(["make", "milestone", "--title", "가"], root);
  expect(result.ok).toBe(true);
  expect(result.message).toContain("--- hooks ---");
  expect(result.message).toContain("[milestone.made.note.sh]");
  expect(result.message).toContain("만들어짐");
});

test("mark milestone --closed가 milestone.closed를 발화한다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  writeHook(root, "milestone.closed.note.sh", "#!/usr/bin/env bash\necho 닫힘\n");
  const result = await run(["mark", "milestone", "ms-001", "--closed"], root);
  expect(result.ok).toBe(true);
  expect(result.message).toContain("닫힘");
});

test("mark milestone --focus는 milestone.closed를 발화하지 않는다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  await run(["make", "milestone", "--title", "나"], root);
  writeHook(root, "milestone.closed.note.sh", "#!/usr/bin/env bash\necho 닫힘\n");
  const result = await run(["mark", "milestone", "ms-002", "--focus"], root);
  expect(result.ok).toBe(true);
  expect(result.message).not.toContain("--- hooks ---");
});

test("make generation이 gen.made를 발화한다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  writeHook(root, "gen.made.note.sh", "#!/usr/bin/env bash\necho 만들어짐\n");
  const result = await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  expect(result.ok).toBe(true);
  expect(result.message).toContain("만들어짐");
});

test("mark generation --closed가 gen.closed를 발화한다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  writeHook(root, "gen.closed.note.sh", "#!/usr/bin/env bash\necho 닫힘\n");
  const result = await run(["mark", "generation", "gen-0001-exec", "--closed"], root);
  expect(result.ok).toBe(true);
  expect(result.message).toContain("닫힘");
});

test("mark generation --aborted·--archived는 훅을 발화하지 않는다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  writeHook(root, "gen.closed.note.sh", "#!/usr/bin/env bash\necho 닫힘\n");
  const archived = await run(["mark", "generation", "gen-0001-exec", "--archived"], root);
  expect(archived.ok).toBe(true);
  expect(archived.message).not.toContain("--- hooks ---");
});

test("훅이 exit 1이어도 명령은 성공이고 실패 사유는 stderr에 담긴다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  writeHook(root, "gen.made.fail.sh", "#!/usr/bin/env bash\nexit 1\n");
  const result = await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  expect(result.ok).toBe(true);
  expect(result.message).not.toContain("--- hooks ---");
  expect(result.stderr).toContain(`${labelPrefix("cli.hook_failure")}gen.made.fail.sh`);
});

test("훅이 exit 1이어도 make generation이 세대 파일과 .session을 남긴다 (03-hooks 검증할 동작 1)", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  writeHook(root, "gen.made.fail.sh", "#!/usr/bin/env bash\nexit 1\n");
  const result = await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  expect(result.ok).toBe(true);
  expect(existsSync(join(paths(root).generations, "gen-0001-exec-나.md"))).toBe(true);
  expect(existsSync(paths(root).session)).toBe(true);
  expect(readFileSync(paths(root).session, "utf8")).toContain("generation: gen-0001-exec");
});

test(".md 훅 본문이 mark generation --closed 출력 뒤에 그대로 붙는다 (03-hooks 검증할 동작 3)", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  writeHook(root, "gen.closed.note.md", "---\ncondition: always\n---\n검토해야 할 변경사항입니다.\n둘째 줄.\n");
  const result = await run(["mark", "generation", "gen-0001-exec", "--closed"], root);
  expect(result.ok).toBe(true);
  expect(result.message).toBe(
    `${t(root, "mark.gen_closed", { id: "gen-0001-exec" })}\n\n--- hooks ---\n[gen.closed.note.md]\n검토해야 할 변경사항입니다.\n둘째 줄.\n`,
  );
});

test("조건 미충족 훅(skipped)은 메시지에도 stderr에도 나타나지 않는다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  writeCondition(root, "no.sh", "#!/usr/bin/env bash\nexit 1\n");
  writeHook(root, "gen.made.note.md", "---\ncondition: no\n---\n본문\n");
  const result = await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  expect(result.ok).toBe(true);
  expect(result.message).not.toContain("--- hooks ---");
  expect(result.stderr).toBeUndefined();
});
