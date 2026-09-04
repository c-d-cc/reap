import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
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
  loops: string;
  archiveLoops: string;
  archiveIdea: string;
  milestones: string;
  memory: string;
  life: string;
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
 * "하려는 것 / 사는 것 / 끝난 것"이라는 시간축에 얹히지 않는다. loop는 시간축에
 * 얹히므로(열리고 닫히고 archive로 간다) `life/loops/`다 — 등록부가 아니다.
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
  "life/loops",
  "archive",
  "archive/milestones",
  "archive/generations",
  "archive/backlog",
  "archive/loops",
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
    loops: join(life, "loops"),
    archiveLoops: join(archive, "loops"),
    archiveIdea: join(archive, "idea"),
    milestones: join(vision, "milestones"),
    memory: join(vision, "memory"),
    life,
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

/** 세션 식별: REAP_SESSION이 먼저, 없으면 worktree 로컬 .session. */
export function readSession(root: string, env: NodeJS.ProcessEnv = process.env): Session {
  const raw = readKV(paths(root).session);
  const session: Session = {
    sessionId: env.REAP_SESSION?.trim() || raw.sessionId || fallbackSessionId(root),
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
  const sessionId = raw.sessionId || env.REAP_SESSION?.trim() || fallbackSessionId(root);
  const lines = [`sessionId: ${sessionId}`, `generation: ${generation}`];
  if (milestone) lines.push(`milestone: ${milestone}`);
  writeFileAtomic(paths(root).session, `${lines.join("\n")}\n`);
}

/** 세대를 abort하면 바인딩도 함께 사라져야 한다. 지워진 기록을 가리키는 세션은 ctx를 거짓말하게 만든다. */
export function unbindSession(root: string, env: NodeJS.ProcessEnv = process.env): void {
  const raw = readKV(paths(root).session);
  const sessionId = raw.sessionId || env.REAP_SESSION?.trim() || fallbackSessionId(root);
  writeFileAtomic(paths(root).session, `sessionId: ${sessionId}\n`);
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
