import { afterEach, expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDirs, commit, initRepo, labelPrefix, tempDir } from "./helpers.ts";
import { run } from "../src/cli.ts";
import { parseDoc } from "../src/doc.ts";
import { readSession } from "../src/store.ts";

afterEach(cleanupTempDirs);

async function project(withGit = true): Promise<string> {
  const root = tempDir();
  if (withGit) {
    initRepo(root);
    writeFileSync(join(root, "a.txt"), "a");
    commit(root, "첫 커밋");
  }
  await run(["init"], root);
  return root;
}

function read(root: string, ...parts: string[]) {
  return parseDoc(readFileSync(join(root, ".reap", ...parts), "utf8"));
}

test("make milestone이 디렉토리와 handoff.md만 빈 채로 놓는다", async () => {
  const root = await project();
  const result = await run(["make", "milestone", "--title", "한 세대 한 바퀴"], root);
  expect(result.ok).toBe(true);
  const dir = join(root, ".reap", "vision", "milestones", "ms-001-한-세대-한-바퀴");
  expect(existsSync(dir)).toBe(true);
  expect(readFileSync(join(dir, "handoff.md"), "utf8")).toBe("");
  // 안 쓰이거나(context.md) spec 밖에 규범이 사는 둘째 자리를 만드는(decisions.md) 것은 만들지 않는다.
  for (const gone of ["context.md", "decisions.md"]) {
    expect(existsSync(join(dir, gone))).toBe(false);
  }
  const { data, body } = read(root, "vision", "milestones", "ms-001-한-세대-한-바퀴", "milestone.md");
  expect(data.id).toBe("ms-001");
  expect(data.slug).toBe("한-세대-한-바퀴");
  expect(data.title).toBe("한 세대 한 바퀴");
  expect(data.status).toBe("open");
  expect(data.openedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  expect(body).toBe("");
});

test("make generation이 다섯 가지만 한다 — 본문은 비어 있다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "인증"], root);
  const result = await run(["make", "generation", "--milestone", "ms-001", "--title", "세션 토큰 회전"], root);
  expect(result.ok).toBe(true);
  const { data, body } = read(root, "life", "generations", "gen-0001-exec-세션-토큰-회전.md");
  expect(body).toBe("");
  expect(data.id).toBe("gen-0001-exec");
  expect(data.type).toBe("exec");
  expect(data.milestone).toBe("ms-001");
  expect(data.slug).toBe("세션-토큰-회전");
  expect(data.status).toBe("open");
  expect(data.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T[\d:]+Z$/);
  expect(data.startCommit).toMatch(/^[0-9a-f]{7,}$/);
});

test("make generation이 세션에 바인딩한다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "인증"], root);
  await run(["make", "generation", "--milestone", "ms-001", "--title", "가"], root);
  const session = readSession(root, {});
  expect(session.generation).toBe("gen-0001-exec");
  expect(session.milestone).toBe("ms-001");
});

test("fix generation은 milestone에 속하지 않는다", async () => {
  const root = await project();
  const result = await run(["make", "generation", "--fix", "--title", "깨진 빌드"], root);
  expect(result.ok).toBe(true);
  const { data } = read(root, "life", "generations", "gen-0001-fix-깨진-빌드.md");
  expect(data.type).toBe("fix");
  expect(data.milestone).toBeUndefined();
  expect(readSession(root, {}).milestone).toBeUndefined();
});

test("exec인데 --milestone이 없으면 거부한다", async () => {
  const root = await project();
  const result = await run(["make", "generation", "--title", "가"], root);
  expect(result.ok).toBe(false);
});

test("없는 milestone을 가리키면 거부한다", async () => {
  const root = await project();
  const result = await run(["make", "generation", "--milestone", "ms-999", "--title", "가"], root);
  expect(result.ok).toBe(false);
});

test("milestone 지정이 모호하면 후보를 보여주고 멈춘다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  await run(["make", "milestone", "--title", "나"], root);
  const result = await run(["make", "generation", "--milestone", "ms-00", "--title", "다"], root);
  expect(result.ok).toBe(false);
  expect(result.message).toContain("ms-001");
  expect(result.message).toContain("ms-002");
});

test("git이 없어도 make는 동작한다 — 시작 커밋을 못 구한다고 거부하지 않는다", async () => {
  const root = await project(false);
  await run(["make", "milestone", "--title", "가"], root);
  const result = await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  expect(result.ok).toBe(true);
  const { data } = read(root, "life", "generations", "gen-0001-exec-나.md");
  expect(data.startCommit).toBeUndefined();
});

test("커밋이 없어도 --closed가 통과한다 — mark는 검사하지 않는다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  writeFileSync(join(root, "b.txt"), "b");
  const result = await run(["mark", "generation", "gen-0001-exec", "--closed"], root);
  expect(result.ok).toBe(true);
  const { data } = read(root, "life", "generations", "gen-0001-exec-나.md");
  expect(data.status).toBe("closed");
  expect(data.closedAt).toMatch(/^\d{4}-\d{2}-\d{2}T[\d:]+Z$/);
  expect(data.endCommit).toMatch(/^[0-9a-f]{7,}$/);
});

test("--aborted는 기록을 지운다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  const path = join(root, ".reap", "life", "generations", "gen-0001-exec-나.md");
  expect(existsSync(path)).toBe(true);
  expect((await run(["mark", "generation", "gen-0001-exec", "--aborted"], root)).ok).toBe(true);
  expect(existsSync(path)).toBe(false);
  expect(readSession(root, {}).generation).toBeUndefined();
});

test("mark는 손으로 남은 옛 plan generation도 찾는다", async () => {
  const root = await project();
  writeFileSync(
    join(root, ".reap", "life", "generations", "gen-0001-plan-가.md"),
    "---\nid: gen-0001-plan\nslug: 가\ntype: plan\nstatus: open\n---\n",
  );
  expect((await run(["mark", "generation", "gen-0001-plan", "--closed"], root)).ok).toBe(true);
  expect(read(root, "life", "generations", "gen-0001-plan-가.md").data.status).toBe("closed");
});

test("발급된 번호는 지워도 되쓰이지 않는다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  await run(["mark", "generation", "gen-0001-exec", "--aborted"], root);
  await run(["make", "generation", "--milestone", "ms-001", "--title", "다"], root);
  expect(existsSync(join(root, ".reap", "life", "generations", "gen-0002-exec-다.md"))).toBe(true);
});

test("--slug를 주면 그것을 쓴다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "인증 세션 관리 개편", "--slug", "auth-session"], root);
  expect(existsSync(join(root, ".reap", "vision", "milestones", "ms-001-auth-session"))).toBe(true);
});

test("REAP 프로젝트가 아니면 make가 거부한다", async () => {
  const result = await run(["make", "milestone", "--title", "가"], tempDir());
  expect(result.ok).toBe(false);
});

test("--title이 없으면 거부한다", async () => {
  const root = await project();
  expect((await run(["make", "milestone"], root)).ok).toBe(false);
});

test("make generation --fix는 milestone 없이 fix 세대를 만든다", async () => {
  const root = await project();
  const result = await run(["make", "generation", "--fix", "--title", "깨진 빌드 고치기"], root);
  expect(result.ok).toBe(true);
  const { data } = read(root, "life", "generations", "gen-0001-fix-깨진-빌드-고치기.md");
  expect(data.type).toBe("fix");
  expect(data.milestone).toBeUndefined();
});

test("--milestone·--fix 중 아무것도 안 주면 거부하고 무엇을 줘야 하는지 말한다", async () => {
  const root = await project();
  const result = await run(["make", "generation", "--title", "가"], root);
  expect(result.ok).toBe(false);
  expect(result.message).toContain("--milestone");
  expect(result.message).toContain("--fix");
  expect(result.message).toContain("make loop");
});

test("--milestone과 --fix를 함께 주면 거부한다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  const result = await run(["make", "generation", "--milestone", "ms-001", "--fix", "--title", "나"], root);
  expect(result.ok).toBe(false);
});

test("mark generation --archived가 archive/generations/로 옮기고 status는 그대로 둔다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  const from = join(root, ".reap", "life", "generations", "gen-0001-exec-나.md");
  const to = join(root, ".reap", "archive", "generations", "gen-0001-exec-나.md");
  expect(existsSync(from)).toBe(true);

  const result = await run(["mark", "generation", "gen-0001-exec", "--archived"], root);
  expect(result.ok).toBe(true);
  expect(existsSync(from)).toBe(false);
  expect(existsSync(to)).toBe(true);
  const { data } = read(root, "archive", "generations", "gen-0001-exec-나.md");
  expect(data.status).toBe("open");
});

test("archive로 옮긴 뒤에도 id로 찾아 닫을 수 있다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  await run(["mark", "generation", "gen-0001-exec", "--archived"], root);
  const result = await run(["mark", "generation", "gen-0001-exec", "--closed"], root);
  expect(result.ok).toBe(true);
  const { data } = read(root, "archive", "generations", "gen-0001-exec-나.md");
  expect(data.status).toBe("closed");
});

test("mark milestone --focus가 focus: true를 찍는다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  const result = await run(["mark", "milestone", "ms-001", "--focus"], root);
  expect(result.ok).toBe(true);
  const { data } = read(root, "vision", "milestones", "ms-001-가", "milestone.md");
  expect(data.focus).toBe("true");
});

// 초점은 "지금 무엇을 하는가"이고 그것은 하나다. 더하기만 하면 둘이 켜진 채 남고,
// ctx는 목록에서 먼저 걸리는 것을 조용히 고른다 — 틀린 milestone을 싣고도 아무 데도 안 드러난다.
test("mark milestone --focus는 초점을 더하지 않고 옮긴다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가", "--focus"], root);
  await run(["make", "milestone", "--title", "나"], root);
  const result = await run(["mark", "milestone", "ms-002", "--focus"], root);
  expect(result.ok).toBe(true);
  expect(read(root, "vision", "milestones", "ms-002-나", "milestone.md").data.focus).toBe("true");
  expect(read(root, "vision", "milestones", "ms-001-가", "milestone.md").data.focus).toBeUndefined();
});

test("mark milestone --closed가 디렉토리째 archive/milestones/로 옮긴다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  const dir = join(root, ".reap", "vision", "milestones", "ms-001-가");
  writeFileSync(join(dir, "handoff.md"), "인계한것\n");

  const result = await run(["mark", "milestone", "ms-001", "--closed"], root);
  expect(result.ok).toBe(true);
  expect(existsSync(dir)).toBe(false);
  const archived = join(root, ".reap", "archive", "milestones", "ms-001-가");
  expect(existsSync(join(archived, "milestone.md"))).toBe(true);
  expect(readFileSync(join(archived, "handoff.md"), "utf8")).toBe("인계한것\n");
  const { data } = read(root, "archive", "milestones", "ms-001-가", "milestone.md");
  expect(data.status).toBe("closed");
  expect(data.closedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
});

test("mark milestone --closed로 옮긴 뒤에도 id로 찾을 수 있다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  await run(["mark", "milestone", "ms-001", "--closed"], root);
  const result = await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  expect(result.ok).toBe(true);
});

test("mark가 모르는 kind는 거부한다", async () => {
  const root = await project();
  const result = await run(["mark", "idea", "idea-1", "--closed"], root);
  expect(result.ok).toBe(false);
});

test("세대는 유형과 무관하게 life/generations/에 놓인다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  await run(["make", "generation", "--milestone", "ms-001", "--title", "실행"], root);
  await run(["make", "generation", "--fix", "--title", "고침"], root);

  const gens = join(root, ".reap", "life", "generations");
  expect(existsSync(join(gens, "gen-0001-exec-실행.md"))).toBe(true);
  expect(existsSync(join(gens, "gen-0002-fix-고침.md"))).toBe(true);
  expect(existsSync(join(root, ".reap", "vision", "milestones", "ms-001-가", "generations"))).toBe(false);
});

test("make backlog가 손으로 쓴 것과 같은 모양을 만든다", async () => {
  const root = await project();
  const result = await run(["make", "backlog", "--type", "design", "--title", "결정을 적을 곳이 없다"], root);
  expect(result.ok).toBe(true);

  const dir = join(root, ".reap", "life", "backlog");
  const names = readdirSync(dir);
  expect(names).toHaveLength(1);
  expect(names[0]!).toMatch(/^bk-[0-9a-f]{6}-결정을-적을-곳이-없다\.md$/);

  const { data, body } = parseDoc(readFileSync(join(dir, names[0]!), "utf8"));
  expect(data.id).toMatch(/^bk-[0-9a-f]{6}$/);
  expect(data.slug).toBe("결정을-적을-곳이-없다");
  expect(data.type).toBe("design");
  expect(data.title).toBe("결정을 적을 곳이 없다");
  expect(data.status).toBe("open");
  expect(data.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  // 본문은 비어 있다. 무엇을 적을지는 agent가 정한다.
  expect(body).toBe("");
});

test("make backlog --from이 어느 세대가 남겼는지 적는다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  await run(["make", "backlog", "--type", "design", "--title", "다", "--from", "gen-0001-exec"], root);
  const dir = join(root, ".reap", "life", "backlog");
  const { data } = parseDoc(readFileSync(join(dir, readdirSync(dir)[0]!), "utf8"));
  expect(data.from).toBe("gen-0001-exec");
});

test("make backlog는 --type을 요구한다", async () => {
  const root = await project();
  const result = await run(["make", "backlog", "--title", "가"], root);
  expect(result.ok).toBe(false);
});

test("make idea가 kind에 맞는 디렉토리에 놓는다", async () => {
  const root = await project();
  for (const [kind, dirName] of [["research", "research"], ["freememo", "freememo"], ["file", "files"]] as const) {
    const result = await run(["make", "idea", "--kind", kind, "--title", `${kind} 것`], root);
    expect(result.ok).toBe(true);
    const dir = join(root, ".reap", "idea", dirName);
    const names = readdirSync(dir);
    expect(names).toHaveLength(1);
    expect(names[0]!).toMatch(/^idea-[0-9a-f]{6}-/);
    const { data } = parseDoc(readFileSync(join(dir, names[0]!), "utf8"));
    expect(data.kind).toBe(kind);
    expect(data.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  }
});

test("make idea는 모르는 kind를 거부한다", async () => {
  const root = await project();
  const result = await run(["make", "idea", "--kind", "몰라", "--title", "가"], root);
  expect(result.ok).toBe(false);
});

test("make generation --backlog가 backlog를 근거로 exec을 연다", async () => {
  const root = await project();
  await run(["make", "backlog", "--type", "design", "--title", "고칠 것"], root);
  const bk = parseDoc(readFileSync(join(root, ".reap", "life", "backlog",
    readdirSync(join(root, ".reap", "life", "backlog"))[0]!), "utf8")).data.id as string;

  const result = await run(["make", "generation", "--backlog", bk, "--title", "고친다"], root);
  expect(result.ok).toBe(true);

  const { data } = read(root, "life", "generations", "gen-0001-exec-고친다.md");
  expect(data.type).toBe("exec");
  expect(data.backlog).toBe(bk);
  // milestone에 속하지 않는다. 경계를 주는 것이 backlog 항목이다.
  expect(data.milestone).toBeUndefined();
  expect(readSession(root).milestone).toBeUndefined();
});

test("--milestone과 --backlog를 함께 주면 둘 다 근거로 담는다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  await run(["make", "backlog", "--type", "design", "--title", "나"], root);
  const bk = parseDoc(readFileSync(join(root, ".reap", "life", "backlog",
    readdirSync(join(root, ".reap", "life", "backlog"))[0]!), "utf8")).data.id as string;
  const result = await run(["make", "generation", "--milestone", "ms-001", "--backlog", bk, "--title", "다"], root);
  expect(result.ok).toBe(true);
  // milestone이 갈래를 주고 backlog 항목이 그 안의 구체적 일을 준다. 배타가 아니다.
  const { data } = read(root, "life", "generations", "gen-0001-exec-다.md");
  expect(data.milestone).toBe("ms-001");
  expect(data.backlog).toBe(bk);
  expect(readSession(root).milestone).toBe("ms-001");
});


test("exec은 근거가 하나도 없으면 열리지 않는다", async () => {
  const root = await project();
  const result = await run(["make", "generation", "--title", "가"], root);
  expect(result.ok).toBe(false);
});

test("consumed인 backlog는 근거가 되지 못한다", async () => {
  const root = await project();
  await run(["make", "backlog", "--type", "design", "--title", "이미 끝난 것"], root);
  const file = join(root, ".reap", "life", "backlog", readdirSync(join(root, ".reap", "life", "backlog"))[0]!);
  const bk = parseDoc(readFileSync(file, "utf8")).data.id as string;
  writeFileSync(file, readFileSync(file, "utf8").replace("status: open", "status: consumed"));

  const result = await run(["make", "generation", "--backlog", bk, "--title", "다시 한다"], root);
  expect(result.ok).toBe(false);
  expect(result.message).toContain("consumed");
});

test("mark backlog --consumed가 표시하고 --by가 어느 세대인지 남긴다", async () => {
  const root = await project();
  await run(["make", "backlog", "--type", "design", "--title", "고칠 것"], root);
  const dir = join(root, ".reap", "life", "backlog");
  const bk = parseDoc(readFileSync(join(dir, readdirSync(dir)[0]!), "utf8")).data.id as string;

  const result = await run(["mark", "backlog", bk, "--consumed", "--by", "gen-0001-exec"], root);
  expect(result.ok).toBe(true);
  const { data } = parseDoc(readFileSync(join(dir, readdirSync(dir)[0]!), "utf8"));
  expect(data.status).toBe("consumed");
  expect(data.consumedBy).toBe("gen-0001-exec");
  // 위치는 그대로다. 상태와 위치는 다른 질문이다.
  expect(readdirSync(dir)).toHaveLength(1);
});

test("mark backlog --by를 안 주면 바인딩된 세대를 쓴다", async () => {
  const root = await project();
  await run(["make", "backlog", "--type", "design", "--title", "고칠 것"], root);
  const dir = join(root, ".reap", "life", "backlog");
  const bk = parseDoc(readFileSync(join(dir, readdirSync(dir)[0]!), "utf8")).data.id as string;
  await run(["make", "generation", "--backlog", bk, "--title", "고친다"], root);

  await run(["mark", "backlog", bk, "--consumed"], root);
  const { data } = parseDoc(readFileSync(join(dir, readdirSync(dir)[0]!), "utf8"));
  expect(data.consumedBy).toBe("gen-0001-exec");
});

test("mark backlog --archived가 archive/backlog/로 옮기고 status는 건드리지 않는다", async () => {
  const root = await project();
  await run(["make", "backlog", "--type", "design", "--title", "끝난 것"], root);
  const dir = join(root, ".reap", "life", "backlog");
  const name = readdirSync(dir)[0]!;
  const bk = parseDoc(readFileSync(join(dir, name), "utf8")).data.id as string;
  await run(["mark", "backlog", bk, "--consumed", "--by", "gen-0001-exec"], root);

  const result = await run(["mark", "backlog", bk, "--archived"], root);
  expect(result.ok).toBe(true);
  expect(readdirSync(dir)).toHaveLength(0);
  const archived = join(root, ".reap", "archive", "backlog", name);
  expect(existsSync(archived)).toBe(true);
  expect(parseDoc(readFileSync(archived, "utf8")).data.status).toBe("consumed");
});

test("archive로 내린 backlog도 id로 찾을 수 있다", async () => {
  const root = await project();
  await run(["make", "backlog", "--type", "design", "--title", "끝난 것"], root);
  const dir = join(root, ".reap", "life", "backlog");
  const bk = parseDoc(readFileSync(join(dir, readdirSync(dir)[0]!), "utf8")).data.id as string;
  await run(["mark", "backlog", bk, "--archived"], root);
  // 참조는 경로가 아니라 id다. 조회가 한 곳만 보면 그 약속이 깨진다.
  const result = await run(["mark", "backlog", bk, "--consumed", "--by", "gen-0001-exec"], root);
  expect(result.ok).toBe(true);
});

test("make milestone --focus가 초점을 함께 찍는다", async () => {
  const root = await project();
  const result = await run(["make", "milestone", "--title", "가", "--focus"], root);
  expect(result.ok).toBe(true);
  const { data } = read(root, "vision", "milestones", "ms-001-가", "milestone.md");
  expect(data.focus).toBe("true");
});

test("--focus를 안 주면 초점이 붙지 않는다", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  const { data } = read(root, "vision", "milestones", "ms-001-가", "milestone.md");
  // 한 번에 여럿을 자를 때 마지막 것이 초점을 뺏으면 안 된다. 지금 할 것을 고르는 건 판단이다.
  expect(data.focus).toBeUndefined();
});

test("bind가 열린 세대에 세션을 다시 묶는다 — abort로 잃은 바인딩의 복원", async () => {
  const root = await project();
  await run(["make", "milestone", "--title", "가"], root);
  await run(["make", "generation", "--milestone", "ms-001", "--title", "나"], root);
  writeFileSync(join(root, ".reap", ".session"), "sessionId: lost\n");
  expect(readSession(root, {}).generation).toBeUndefined();
  const r = await run(["bind", "gen-0001-exec"], root);
  expect(r.ok).toBe(true);
  expect(readSession(root, {}).generation).toBe("gen-0001-exec");
  expect(readSession(root, {}).milestone).toBe("ms-001");
  await run(["mark", "generation", "gen-0001-exec", "--closed"], root);
  const closed = await run(["bind", "gen-0001-exec"], root);
  expect(closed.ok).toBe(false);
  expect(closed.message).toContain(labelPrefix("entries.gen_closed_no_bind").trim());
});
