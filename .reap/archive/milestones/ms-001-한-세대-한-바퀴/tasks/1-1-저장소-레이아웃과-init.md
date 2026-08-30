# Task 1.1 — 저장소 레이아웃과 `reap init` — **완료 (gen-0001-exec)**

## 공개 인터페이스

```ts
// cli.ts
export type Result = { ok: boolean; message: string; data?: unknown };
export function run(argv: string[], cwd: string): Promise<Result>;

// store.ts
export function findRoot(cwd: string): string | null;
export function paths(root: string): Paths;            // [저장 구조](../../../../../docs/superpowers/specs/reap/03-storage.md)의 하위 경로
export function workspaceId(cwd: string): string;
export function readConfig(root: string): Config;      // { language, agentClient, workspaceId }
export function writeConfig(root: string, c: Config): void;
export function readSession(root: string, env?: NodeJS.ProcessEnv): Session;
export function bindSession(root: string, generation: string, milestone?: string): void;
                                                        // Session = { sessionId, generation?, milestone? }
export function writeFileAtomic(path: string, text: string): void;
export function ensureDir(path: string): void;

// git.ts
export function isRepo(cwd: string): boolean;
export function head(cwd: string): string | null;
export function isClean(cwd: string): boolean;
export function commonDirParent(cwd: string): string | null;

// templates.ts
export function template(root: string, name: string): string;   // 오버라이드 우선, 없으면 throw
```

**이 증분에 필요한 템플릿 키:** `config.yml` · `generation.md` · `milestone.md` · `genome-application.md` · `genome-evolution.md` · `genome-invariants.md` · `environment-summary.md` · `memory-tracks.md` · `memory-lessons.md`

나머지 템플릿(backlog · idea 3종 · hook 2종)은 그것을 쓰는 증분에서 더한다. 지금 넣으면 아무도 안 쓰는 문자열이 아홉 개 더 생긴다.

**`init`이 만드는 것:** [저장 구조](../../../../../docs/superpowers/specs/reap/03-storage.md)의 디렉토리 전부(쓰지 않는 것 포함 — 자리는 있어야 나중에 채운다), 지식 레이어 6개 파일의 씨앗, workspace-id가 채워진 `config.yml`, `.gitignore`의 `.reap/.session` 한 줄. 이미 초기화된 곳에서는 거부하고 `--force`면 빠진 것만 채운다.

## 증명해야 할 동작
- 하위 디렉토리에서 `findRoot`가 조상을 찾고, 없으면 null
- **같은 리포의 두 worktree가 같은 workspace-id를 낸다** (실제로 `git worktree add`를 해서 확인)
- `REAP_SESSION`이 `.session`의 sessionId를 이긴다
- `bindSession`을 두 번 부를 때 **직전 milestone이 남지 않는다** — exec을 바인딩한 뒤 milestone 없는 plan을 바인딩하면 milestone은 사라져야 한다
- 반복 바인딩에도 sessionId는 같은 값으로 유지된다 (빈 문자열이 아니어야 한다)
- 프로젝트 템플릿이 번들을 이기고, 없는 이름은 throw
- `init` 후 디렉토리가 전부 있고 지식 파일이 비어 있지 않다. 재실행은 거부, `--force`는 통과

## 함정
- macOS의 `/var`는 `/private/var`의 심링크다. 테스트에서 임시 디렉토리를 정규화하지 않으면 같은 경로가 두 값으로 해싱되어 workspace-id 테스트가 이유 없이 실패한다.
- `realpathSync`는 `node:fs`에 있다. `node:path`가 아니다.
- 세션 바인딩은 **새 객체를 만들어야지 이전 것에 병합하면 안 된다.** 병합하면 위의 milestone 소거가 깨지고 `ctx`가 관계없는 맥락을 싣는다. 구현이 지금 맞더라도 누가 병합으로 "개선"하면 나머지 테스트는 전부 통과한다 — **그래서 이 동작에 명시적 테스트가 있어야 한다.**

**완료 판정:** `bun run build`로 만든 **바이너리**로 빈 git 리포에서 `init`을 돌렸을 때 디렉토리가 생기고 `genome/application.md`가 비어 있지 않다. 실패하면 템플릿 번들링 방식을 바꿔야 하며 그것은 진행 전에 결정할 문제다.
