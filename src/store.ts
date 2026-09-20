import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, parse, resolve } from "node:path";
import { commonDirParent } from "./git.ts";

export type Config = { language: string; agentClient: string; workspaceId: string };
export type Session = { sessionId: string; generation?: string; milestone?: string };

export type Paths = {
  root: string;
  reap: string;
  config: string;
  map: string;
  templates: string;
  vision: string;
  plan: string;
  planSources: string;
  planConventions: string;
  flux: string;
  archiveFlux: string;
  archiveIdea: string;
  milestones: string;
  memory: string;
  life: string;
  handoff: string;
  generations: string;
  backlog: string;
  archive: string;
  archiveMilestones: string;
  archiveGenerations: string;
  archiveBacklog: string;
  genome: string;
  environment: string;
  environmentResources: string;
  idea: string;
  ideaResearch: string;
  ideaFreememo: string;
  ideaFiles: string;
  sequence: string;
  hooks: string;
  hookConditions: string;
  session: string;
};

/**
 * 저장 구조가 갖는 디렉토리 전부. 아직 쓰지 않는 것도 만든다 — 자리가 있어야 나중에 채운다.
 *
 * **최상위를 가르는 것은 유형이 아니라 시간이다.** vision(하려는 것) · life(하는 중) · archive(끝난 것).
 * **`plan/`은 그 3단 밖이다** — plan source는 리포 밖을 가리키는 등록부라
 * "하려는 것 / 사는 것 / 끝난 것"이라는 시간축에 얹히지 않는다. flux는 시간축에
 * 얹히므로(열리고 닫히고 archive로 간다) `life/flux/`다 — 등록부가 아니다.
 */
export const DIRS = [
  "templates",
  "plan",
  "plan/conventions",
  "vision",
  "vision/milestones",
  "vision/memory",
  "life",
  "life/generations",
  "life/backlog",
  "life/flux",
  "archive",
  "archive/milestones",
  "archive/generations",
  "archive/backlog",
  "archive/flux",
  "archive/idea",
  "genome",
  "environment",
  "environment/resources",
  "idea",
  "idea/research",
  "idea/freememo",
  "idea/files",
  "sequence",
  "hooks",
  "hooks/conditions",
] as const;

/** 지식 레이어의 씨앗. 값은 템플릿 이름이다. reap:carrier-333308-map-seed */
export const SEEDS: Record<string, string> = {
  "genome/application.md": "genome-application.md",
  "genome/evolution.md": "genome-evolution.md",
  "genome/invariants.md": "genome-invariants.md",
  "environment/summary.md": "environment-summary.md",
  "vision/memory/lessons.md": "memory-lessons.md",
  "map.md": "map.md",
};

export function paths(root: string): Paths {
  const reap = join(root, ".reap");
  const vision = join(reap, "vision");
  const life = join(reap, "life");
  const archive = join(reap, "archive");
  return {
    root,
    reap,
    config: join(reap, "config.yml"),
    map: join(reap, "map.md"),
    templates: join(reap, "templates"),
    vision,
    plan: join(reap, "plan"),
    planSources: join(reap, "plan", "sources.yml"),
    planConventions: join(reap, "plan", "conventions"),
    flux: join(life, "flux"),
    archiveFlux: join(archive, "flux"),
    archiveIdea: join(archive, "idea"),
    milestones: join(vision, "milestones"),
    memory: join(vision, "memory"),
    life,
    handoff: join(life, "handoff.md"),
    generations: join(life, "generations"),
    backlog: join(life, "backlog"),
    archive,
    archiveMilestones: join(archive, "milestones"),
    archiveGenerations: join(archive, "generations"),
    archiveBacklog: join(archive, "backlog"),
    genome: join(reap, "genome"),
    environment: join(reap, "environment"),
    environmentResources: join(reap, "environment", "resources"),
    idea: join(reap, "idea"),
    ideaResearch: join(reap, "idea", "research"),
    ideaFreememo: join(reap, "idea", "freememo"),
    ideaFiles: join(reap, "idea", "files"),
    sequence: join(reap, "sequence"),
    hooks: join(reap, "hooks"),
    hookConditions: join(reap, "hooks", "conditions"),
    session: join(reap, ".session"),
  };
}

export type Layout = "v018" | "v017" | "mixed" | "none" | "unknown";
export type LayoutReport = { layout: Layout; v017: string[]; v018: string[] };

/**
 * v0.17 저장소 위에서 v0.18이 도는 것을 알아본다.
 *
 * 0.17 사용자가 0.18을 손으로 설치하면 옛 `.reap/`이 그대로 남는다. 탐지가 없으면
 * `ctx`가 정상인 척하고 `doctor`가 건강하다고 답하며 `make`가 새 구조를 섞어 쓴다.
 * 섞인 저장소는 migrate 4/8의 `git mv .reap .reap-v0_17`에 통째로 끌려간다.
 *
 * **양쪽에 다 있는 이름은 표식이 아니다** — `sequence/milestone.md`·`life/backlog/`·
 * `vision/milestones/`는 v0.17에도 있다. 표식으로 쓰면 멀쩡한 v0.17 저장소가 mixed가 된다.
 *
 * `plugin/skills/migrate/scripts/detect-version.sh`가 같은 판정을 한다 —
 * 기준이 갈리지 않게 두 곳의 표식 목록을 함께 고친다. `tests/v017-layout.test.ts`가
 * 두 판정이 어긋나지 않는지 픽스처로 대조한다. **다른 곳은 하나뿐이다**: 스크립트는
 * `hooks/`의 `onXxx` 파일명을 v0.17 표식으로 세고 여기서는 안 센다. 스크립트는 v0.17로
 * 추정되는 저장소를 판정하지만 여기는 v0.18로 추정되는 저장소를 판정하고, 그 자리에서
 * 남은 옛 훅 파일 하나는 이주 사안이 아니라 훅 결함이다 — `doctor.kind.hook_unknown_event`가
 * 이미 맡는다. 표식으로 세면 멀쩡한 v0.18 프로젝트의 쓰기가 파일 하나 때문에 막힌다.
 * 스크립트 쪽은 그 경우 `mixed`로 가 사람을 부르는데, 보수적인 쪽이라 그대로 둔다.
 *
 * **`unknown`은 쓰기를 막지 않는다.** 양쪽 표식이 하나도 없는 `.reap/`에는 섞일 v0.17
 * 데이터가 없다 — 막을 것이 없고, 막으면 씨앗을 지운 저장소가 복구 불능이 된다.
 * 대신 `doctor`가 결함으로 보고한다. v0.15·v0.16·v0.17이 전부 `lineage/`를 만들므로
 * 현실의 `unknown`은 손상되었거나 손으로 잘라낸 저장소다.
 */
export function detectLayout(root: string): LayoutReport {
  const reap = join(root, ".reap");
  if (!isDir(reap)) return { layout: "none", v017: [], v018: [] };

  const v017: string[] = [];
  if (isDir(join(reap, "lineage"))) v017.push("lineage/");
  if (isFile(join(reap, "vision", "memory", "shortterm.md"))) v017.push("vision/memory/shortterm.md");
  if (isFile(join(reap, "life", "current.yml"))) v017.push("life/current.yml");
  if (isFile(join(reap, "sequence", "goal.md"))) v017.push("sequence/goal.md");

  const v018: string[] = [];
  if (isFile(join(reap, "map.md"))) v018.push("map.md");
  if (isFile(join(reap, "sequence", "generation.md"))) v018.push("sequence/generation.md");
  if (isFile(join(reap, "sequence", "flux.md"))) v018.push("sequence/flux.md");
  if (namesIn(join(reap, "life", "flux")).length > 0) v018.push("life/flux/");
  if (isFile(join(reap, "plan", "sources.yml"))) v018.push("plan/sources.yml");

  const layout: Layout =
    v017.length > 0 && v018.length > 0 ? "mixed" : v017.length > 0 ? "v017" : v018.length > 0 ? "v018" : "unknown";
  return { layout, v017, v018 };
}

function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function namesIn(dir: string): string[] {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

export function findRoot(cwd: string): string | null {
  let dir = resolve(cwd);
  const stop = parse(dir).root;
  for (;;) {
    if (isDir(join(dir, ".reap"))) return dir;
    if (dir === stop) return null;
    dir = dirname(dir);
  }
}

/**
 * worktree들이 서로 다른 작업 디렉토리를 가져도 같은 값으로 수렴해야 한다.
 * 여기가 틀리면 orchestrate는 에러 없이 조용히 갈라진다.
 */
export function workspaceId(cwd: string): string {
  const base = commonDirParent(cwd) ?? normalize(findRoot(cwd) ?? cwd);
  return createHash("sha256").update(base).digest("hex").slice(0, 12);
}

export function readConfig(root: string): Config {
  const raw = readKV(paths(root).config);
  return {
    language: raw.language ?? "",
    agentClient: raw.agentClient ?? "claude-code",
    workspaceId: raw.workspaceId ?? "",
  };
}

export function writeConfig(root: string, config: Config): void {
  writeFileAtomic(
    paths(root).config,
    `language: ${config.language}\nagentClient: ${config.agentClient}\nworkspaceId: ${config.workspaceId}\n`,
  );
}

/**
 * 세션 식별 사다리 — `REAP_SESSION` → 호스트가 주는 세션 id → worktree 로컬 `.session`.
 *
 * **마지막 칸은 세션이 아니라 워크트리를 가리킨다**(리포 루트의 해시). 한 워크트리의 모든
 * 세션이 같은 값을 영구히 공유하므로 그 값으로는 절이 갈리지 않는다. 호스트 값이 있을 때만
 * 갈린다 — Claude Code는 준다, Codex는 주지 않는다(0.155.1 실측).
 */
export function readSession(root: string, env: NodeJS.ProcessEnv = process.env): Session {
  const raw = readKV(paths(root).session);
  const session: Session = {
    sessionId: hostSessionId(env) || raw.sessionId || fallbackSessionId(root),
  };
  if (raw.generation) session.generation = raw.generation;
  if (raw.milestone) session.milestone = raw.milestone;
  return session;
}

/**
 * 반드시 **새 객체를 쓴다.** 이전 바인딩에 병합하면 milestone 없는 plan을 바인딩해도
 * 직전 milestone이 남고, ctx가 관계없는 맥락을 싣는다.
 */
export function bindSession(
  root: string,
  generation: string,
  milestone?: string,
  env: NodeJS.ProcessEnv = process.env,
): void {
  const raw = readKV(paths(root).session);
  const sessionId = raw.sessionId || fallbackSessionId(root);
  const lines = [`sessionId: ${sessionId}`, `generation: ${generation}`];
  if (milestone) lines.push(`milestone: ${milestone}`);
  writeFileAtomic(paths(root).session, `${lines.join("\n")}\n`);
}

/** 세대를 abort하면 바인딩도 함께 사라져야 한다. 지워진 기록을 가리키는 세션은 ctx를 거짓말하게 만든다. */
export function unbindSession(root: string, env: NodeJS.ProcessEnv = process.env): void {
  const raw = readKV(paths(root).session);
  const sessionId = raw.sessionId || fallbackSessionId(root);
  writeFileAtomic(paths(root).session, `sessionId: ${sessionId}\n`);
}

/** 사람이 정한 값이 먼저, 그다음 호스트가 내리는 것. 빈 문자열은 칸을 채우지 않는다. */
function hostSessionId(env: NodeJS.ProcessEnv): string | undefined {
  for (const key of ["REAP_SESSION", "CLAUDE_CODE_SESSION_ID"]) {
    const value = env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

/**
 * 절 제목에 쓰는 짧은 형태. 전체 UUID는 제목을 한 줄에 못 담게 만든다.
 *
 * **8자를 채우지 못하는 값은 워크트리 해시로 내린다.** 짧은 키는 다른 세션의 키를 자기
 * 접두사로 갖게 되고, 한 글자도 안 남으면 `sess-`가 되어 모든 절과 같아진다.
 */
export function sessionKey(root: string, env: NodeJS.ProcessEnv = process.env): string {
  const id = readSession(root, env).sessionId.replace(/-/g, "");
  const usable = id.length >= 8 ? id : fallbackSessionId(root).replace(/-/g, "");
  return `sess-${usable.slice(0, 8)}`;
}

export function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

export function writeFileAtomic(path: string, text: string): void {
  ensureDir(dirname(path));
  const tmp = `${path}.tmp-${randomUUID().slice(0, 8)}`;
  try {
    writeFileSync(tmp, text, "utf8");
    renameSync(tmp, path);
  } catch (error) {
    rmSync(tmp, { force: true });
    throw error;
  }
}

function fallbackSessionId(root: string): string {
  return createHash("sha256").update(`session:${normalize(root)}`).digest("hex").slice(0, 12);
}

function normalize(path: string): string {
  try {
    return realpathSync(path);
  } catch {
    return resolve(path);
  }
}

function isDir(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

/** config.yml과 .session은 `key: value` 한 겹이다. 여기에 YAML 파서를 들이지 않는다. */
function readKV(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const at = line.indexOf(":");
    if (at <= 0 || line.trimStart().startsWith("#")) continue;
    out[line.slice(0, at).trim()] = line.slice(at + 1).trim();
  }
  return out;
}
