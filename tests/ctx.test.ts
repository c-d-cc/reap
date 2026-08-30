import { afterEach, expect, test } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDirs, tempDir } from "./helpers.ts";
import { run } from "../src/cli.ts";
import { assemble } from "../src/ctx.ts";
import { patch } from "../src/doc.ts";
import { bindSession } from "../src/store.ts";

afterEach(cleanupTempDirs);

async function project(): Promise<string> {
  const root = tempDir();
  await run(["init"], root);
  return root;
}

function dirOf(root: string, id: string, slug: string): string {
  return join(root, ".reap", "vision", "milestones", `${id}-${slug}`);
}

async function milestone(root: string, title: string): Promise<string> {
  const result = await run(["make", "milestone", "--title", title], root);
  return (result.data as { id: string }).id;
}

/** 각 파일에 그 파일에만 있는 문장을 넣어, 무엇이 실렸는지 문자열로 판별한다. */
async function furnished(): Promise<{ root: string; id: string; dir: string }> {
  const root = await project();
  const id = await milestone(root, "인증");
  const dir = dirOf(root, id, "인증");
  writeFileSync(join(dir, "handoff.md"), "인계한것\n");
  mkdirSync(join(dir, "tasks"), { recursive: true });
  writeFileSync(join(dir, "tasks", "1-1-저장소.md"), "# Task 1.1 — 저장소\n\n함정과상세\n");
  writeFileSync(join(dir, "tasks", "1-2-문서.md"), "# Task 1.2 — 문서\n\n또다른상세\n");
  writeFileSync(join(root, ".reap", "vision", "memory", "lessons.md"), "# Lessons\n\n교훈본문\n");
  return { root, id, dir };
}

test("genome과 environment/summary.md의 본문이 실린다", async () => {
  const root = await project();
  const text = assemble(root);
  expect(text).toContain("genome/application.md");
  expect(text).toContain("genome/invariants.md");
  expect(text).toContain("environment/summary.md");
});

test("milestone 본문도 memory도 세대 기록도 실리지 않는다", async () => {
  const { root, id } = await furnished();
  await run(["make", "generation", "--milestone", id, "--title", "토큰"], root);
  const path = join(root, ".reap", "life", "generations", "gen-0001-exec-토큰.md");
  writeFileSync(path, `${readFileSync(path, "utf8")}\n세대본문\n`);

  const text = assemble(root);
  for (const body of ["인계한것", "함정과상세", "또다른상세", "교훈본문", "세대본문"]) {
    expect(text).not.toContain(body);
  }
});

test("상태 줄이 milestone과 그 디렉토리의 파일 이름을 낸다", async () => {
  const { root, id } = await furnished();
  const text = assemble(root, id);
  expect(text).toContain(`현재 milestone: ${id}`);
  expect(text).toContain("인증");
  expect(text).toContain(`.reap/vision/milestones/${id}-인증/`);
  expect(text).toContain("milestone.md");
  expect(text).toContain("handoff.md");
  expect(text).toContain("tasks/1-1-저장소.md");
  expect(text).toContain("tasks/1-2-문서.md");
});

test("빈 파일은 지도에 이름을 내지 않는다", async () => {
  const root = await project();
  const id = await milestone(root, "인증");
  writeFileSync(join(dirOf(root, id, "인증"), "handoff.md"), "인계\n");
  const text = assemble(root, id);
  expect(text).toContain("handoff.md");
});

test("남아 있는 context.md·decisions.md는 지도에 이름을 내지 않는다", async () => {
  const root = await project();
  const id = await milestone(root, "인증");
  // 옛 milestone에는 make가 만들어둔 것이 남아 있다. 더는 알리지 않는다.
  const dir = dirOf(root, id, "인증");
  writeFileSync(join(dir, "context.md"), "옛탐색\n");
  writeFileSync(join(dir, "decisions.md"), "옛결정\n");
  const text = assemble(root, id);
  expect(text).not.toContain("context.md");
  expect(text).not.toContain("decisions.md");
});

test("tasks/가 없거나 비어 있으면 그 줄이 없다", async () => {
  const root = await project();
  const id = await milestone(root, "인증");
  expect(assemble(root, id)).not.toContain("tasks/");
  mkdirSync(join(dirOf(root, id, "인증"), "tasks"), { recursive: true });
  expect(assemble(root, id)).not.toContain("tasks/");
});

test("memory는 이름을, idea는 개수를 낸다", async () => {
  const root = await project();
  writeFileSync(join(root, ".reap", "vision", "memory", "lessons.md"), "교훈\n");
  writeFileSync(join(root, ".reap", "idea", "research", "idea-a1b2c3.md"), "조사\n");
  writeFileSync(join(root, ".reap", "idea", "research", "idea-d4e5f6.md"), "조사2\n");
  writeFileSync(join(root, ".reap", "idea", "freememo", "idea-99aabb.md"), "메모\n");
  const text = assemble(root);
  expect(text).toContain(".reap/vision/memory/lessons.md");
  expect(text).toContain(".reap/idea/");
  expect(text).toContain("research 2");
  expect(text).toContain("freememo 1");
  expect(text).not.toContain("idea-a1b2c3");
});

test("idea가 비어 있으면 그 줄이 없다", async () => {
  const root = await project();
  expect(assemble(root)).not.toContain(".reap/idea/");
});

test("map.md가 있으면 구조 줄을 내고, 통째로 싣지는 않는다", async () => {
  const root = await project();
  writeFileSync(join(root, ".reap", "map.md"), "# Map\n\n지도본문\n");
  const text = assemble(root);
  expect(text).toContain("구조: .reap/map.md");
  expect(text).not.toContain("지도본문");
});

test("map.md가 비어 있으면 구조 줄이 없다", async () => {
  const root = await project();
  writeFileSync(join(root, ".reap", "map.md"), "");
  expect(assemble(root)).not.toContain("구조:");
});

test("열린 세대는 id와 기록 경로를 내고, 닫히면 그 줄이 사라진다", async () => {
  const root = await project();
  const id = await milestone(root, "인증");
  await run(["make", "generation", "--milestone", id, "--title", "토큰 회전"], root);
  const text = assemble(root);
  expect(text).toContain("열린 세대: gen-0001-exec");
  expect(text).toContain("generations/gen-0001-exec-토큰-회전.md");
  await run(["mark", "generation", "gen-0001-exec", "--closed"], root);
  expect(assemble(root)).not.toContain("열린 세대");
});

test("열린 fix 세대도 상태 줄에 나온다 — milestone이 없어도", async () => {
  const root = await project();
  await run(["make", "generation", "--fix", "--title", "깨진 빌드"], root);
  const text = assemble(root);
  expect(text).toContain("열린 세대: gen-0001-fix");
  expect(text).toContain("generations/gen-0001-fix-깨진-빌드.md");
});

test("안내 줄은 milestone도 세대도 없을 때조차 나온다", async () => {
  const root = await project();
  const text = assemble(root);
  expect(text).toContain("/reap:evolve");
  expect(text).toContain("/reap:complete");
  expect(text).not.toContain("현재 milestone");
  expect(text).not.toContain("열린 세대");
});

test("바인딩이 --milestone보다, --milestone이 focus보다 우선한다", async () => {
  const root = await project();
  const bound = await milestone(root, "바인딩된 것");
  const asked = await milestone(root, "지정한 것");
  const focused = await milestone(root, "초점");
  patch(join(dirOf(root, focused, "초점"), "milestone.md"), { focus: true });

  expect(assemble(root)).toContain(focused);
  expect(assemble(root, asked)).toContain(asked);
  expect(assemble(root, asked)).not.toContain("초점");
  bindSession(root, "gen-0001-exec", bound, {});
  expect(assemble(root, asked)).toContain("바인딩된 것");
  expect(assemble(root, asked)).not.toContain("지정한 것");
});

test("바인딩이 없는 id를 가리키면 조용히 다음 순위로 내려간다", async () => {
  const root = await project();
  const id = await milestone(root, "인증");
  bindSession(root, "gen-0001-exec", "ms-999", {});
  expect(assemble(root, id)).toContain(id);
});

test("바인딩된 milestone이 닫혀 있으면 그것을 현재로 내지 않는다", async () => {
  const root = await project();
  const id = await milestone(root, "끝난 것");
  patch(join(dirOf(root, id, "끝난-것"), "milestone.md"), { status: "closed" });
  bindSession(root, "gen-0001-exec", id, {});
  expect(assemble(root)).not.toContain("현재 milestone");
});

test("REAP 디렉토리가 없으면 빈 문자열이고 던지지 않는다", () => {
  const root = tempDir();
  expect(() => assemble(root)).not.toThrow();
  expect(assemble(root)).toBe("");
});

test("갓 init한 프로젝트에서도 동작한다", async () => {
  const root = await project();
  rmSync(join(root, ".reap", "vision", "memory", "lessons.md"));
  expect(assemble(root).length).toBeGreaterThan(0);
});

test("--hook은 유효한 JSON 봉투를 낸다 — 줄바꿈·따옴표·백슬래시가 들어와도", async () => {
  const root = await project();
  writeFileSync(
    join(root, ".reap", "genome", "application.md"),
    '따옴표 "가" 있고\n백슬래시 \\ 도 있고\n탭\t도 있다\n',
  );
  const result = await run(["ctx", "--hook"], root);
  expect(result.ok).toBe(true);
  const parsed = JSON.parse(result.message) as {
    hookSpecificOutput: { hookEventName: string; additionalContext: string };
  };
  expect(parsed.hookSpecificOutput.hookEventName).toBe("SessionStart");
  expect(parsed.hookSpecificOutput.additionalContext).toContain('따옴표 "가" 있고');
});

test("ctx는 조립한 본문을 그대로 내고, --hook은 프로젝트가 아니어도 성공한다", async () => {
  const root = await project();
  expect((await run(["ctx"], root)).message).toBe(assemble(root));
  const outside = tempDir();
  const hook = await run(["ctx", "--hook"], outside);
  expect(hook.ok).toBe(true);
  expect(hook.message).toBe("");
  expect((await run(["ctx"], outside)).ok).toBe(false);
});
