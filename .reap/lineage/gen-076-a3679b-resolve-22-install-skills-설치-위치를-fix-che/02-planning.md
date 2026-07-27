# Planning

## Goal

`reap fix --check` 가 `reap install-skills` 의 정식 설치 위치를 "legacy" 로 오탐하는 문제(issue #22)를 해소하고, **경로를 DI 로 주입해 재발을 구조적으로 막는다.** 버전 0.17.3.

## Completion Criteria

1. `reap install-skills` 직후 `reap fix --check` → user-level 관련 경고 **0건**
2. 본 repo 에서 `fix --check` 총 경고 19건 → **0건**
3. `~/.claude/commands/` 경로가 **한 곳에서만 정의**되고 installer/checker 가 그것을 참조
4. `core` → `adapters` 의존 **없음** (`grep -rn "adapters" src/core/` 매치 0 유지)
5. `~/.claude/skills/reap.*` 는 여전히 **error 로 감지** (v0.15 잔재 탐지 능력 유지)
6. `.claude/commands/reap.*` (project-level) 도 여전히 warning
7. `getAdapter` 실패(codex 등) 시 `fix --check` 가 죽지 않음
8. e2e 가 **HOME 격리** 하에 동작하며 사용자 `~/.claude/` 미접촉
9. unit/e2e/scenario 회귀 없음 (baseline 461-0 / 263-1 / 44-0)
10. 0.17.3 문서 정합 (`check-docs-version.sh` pass)

## Background

01-learning.md 참조. 요약:
- `integrity.ts` 가 자기 파일 안에서 모순 (L772-774 "정식 위치" vs L715-722 "legacy")
- "Phase 2" 는 v0.15 의 `~/.reap/commands/` 이전 작업명. v0.16 이 `~/.claude/commands/` 로 되돌렸으나 checker 문구만 남음
- opencode 는 이미 `opencodeCommandsDir(home)` 패턴 보유 — claude-code 만 인라인
- `core` 는 adapters 를 모름. 호출부는 `fix.ts` 1곳

## Approach

### 왜 "경고 한 줄 삭제"로 끝내지 않는가

2번 검사를 지우면 이슈는 닫힌다. 그러나 **다음에 경로가 바뀌면 또 어긋난다.** #22 자체가 v0.15→v0.16 경로 변경 때 checker 가 따라오지 않아 생긴 일이다. 같은 사고를 다시 준비하는 셈이다.

DI 로 하면 **정식 위치가 바뀔 때 checker 가 자동으로 따라온다.**

### 설계 — adapter 가 소유, checker 가 주입받음

**(a) adapter 에 경로 헬퍼 추가** (opencode 패턴 적용)

```ts
// adapters/claude-code/install.ts
export function claudeCodeCommandsDir(home: string = homedir()): string {
  return join(home, ".claude", "commands");
}
```

`installSlashCommandsOnly` 가 이것을 사용한다. opencode 의 `opencodeCommandsDir` 와 동형.

**(b) AdapterModule 에 user-level 위치 노출**

```ts
// adapters/types.ts
export interface AdapterModule {
  // ...
  /**
   * User-level directories this adapter legitimately installs into.
   * The integrity checker uses this to avoid flagging its own install
   * location as legacy.
   */
  userLevelDirs(home?: string): string[];
}
```

claude-code → `[claudeCodeCommandsDir(home)]`
opencode → `[opencodeCommandsDir(home), opencodeAgentsDir(home)]`

**(c) checker 가 주입받아 "정식 위치는 건너뛴다"**

```ts
// core/integrity.ts — adapters 를 import 하지 않는다
export async function checkUserLevelArtifacts(
  projectRoot: string,
  canonicalDirs: string[] = [],
): Promise<IntegrityResult>
```

legacy 후보를 검사하되 `canonicalDirs` 에 포함된 경로는 **검사 대상에서 제외**한다.

이 구조의 이점: 지금은 `~/.claude/commands/` 만 정식이지만, 만약 claude-code 가 `~/.claude/skills/` 로 옮기면 adapter 만 고쳐도 **그 경고가 자동으로 꺼지고 이전 위치가 자동으로 legacy 가 된다.**

**(d) 호출부에서 주입**

```ts
// cli/commands/fix.ts — checkProject
let canonicalDirs: string[] = [];
try {
  const config = ...;                       // agentClient 읽기
  canonicalDirs = getAdapter(config.agentClient).userLevelDirs();
} catch {
  // codex 등 미구현 adapter — 검사를 건너뛰는 편이 오탐보다 안전
}
```

**의존 방향**: `cli` → `core`, `cli` → `adapters`. `core` → `adapters` 없음. 유저 지시 충족.

### 기본값을 "빈 배열"로 두는 이유

`canonicalDirs` 미주입 시 정식 위치가 없다고 보면 **현재와 같은 오탐**이 난다. 반대로 "미주입 시 검사 skip" 으로 하면 안전하다.

→ 미주입이면 `~/.claude/commands/` 검사 자체를 하지 않는다. 검사를 원하면 정식 위치를 명시해야 한다. **잘못된 기본값으로 오탐하느니 검사를 안 하는 편이 낫다** (gen-075 의 "경고가 상시 뜨면 신호 가치 0" 교훈).

### 유지할 검사

| 대상 | 처리 |
|---|---|
| `~/.claude/skills/reap.*` | **error 유지**. v0.15 는 이 경로를 썼고 v0.16 claude-code adapter 는 쓰지 않는다. 근거를 주석으로 남긴다 |
| `.claude/commands/reap.*` (project) | **warning 유지**. `cleanupLegacyProjectSkills` 가 실제로 삭제하므로 해소 경로가 있다 |

`~/.claude/skills/` 도 `canonicalDirs` 대조를 거치게 하면, 미래에 adapter 가 그리로 옮겨도 자동 대응된다.

## Risk Assessment

| 리스크 | 대응 |
|---|---|
| e2e 가 사용자 `~/.claude/commands/` 19개를 덮어씀 | **HOME override 필수** (gen-069 패턴). 미적용 시 개발자 환경 파괴 |
| `getAdapter` throw 로 `fix --check` 사망 | try/catch + 검사 skip |
| `AdapterModule` 인터페이스 확장이 codex 스텁을 깨뜨림 | dispatcher 가 codex 에서 이미 throw 하므로 영향 없음. 확인 필요 |
| 미주입 기본값 오해 | 기본 = skip 임을 시그니처 주석에 명시 + unit test |

## Scope

**변경 대상**
- `src/adapters/claude-code/install.ts` — `claudeCodeCommandsDir` export + 내부 사용
- `src/adapters/types.ts` — `userLevelDirs` 추가
- `src/adapters/claude-code/index.ts`, `src/adapters/opencode/index.ts` — 구현
- `src/core/integrity.ts` — `checkUserLevelArtifacts` 시그니처 + 정식 위치 제외 + 근거 주석
- `src/cli/commands/fix.ts` — `checkProject` 에서 주입
- 테스트 2종
- 릴리즈 문서 일습 (0.17.3)

**out of scope**
- 자기진단 게이트 / canary token → `릴리즈-자기진단-게이트-...` backlog (본 세대 완료가 선행 조건)
- `cleanupLegacyProjectSkills` 동작 변경
- daemon 배포 결함

## Tasks

- [ ] T001 `adapters/claude-code/install.ts` — `claudeCodeCommandsDir(home?)` export, `installSlashCommandsOnly` 가 사용
- [ ] T002 `adapters/types.ts` — `AdapterModule.userLevelDirs(home?)` 추가 + docstring
- [ ] T003 `adapters/claude-code/index.ts` — 구현
- [ ] T004 `adapters/opencode/index.ts` — 구현 (commands + agents)
- [ ] T005 `core/integrity.ts` — `checkUserLevelArtifacts(projectRoot, canonicalDirs = [])`, 정식 위치 제외 로직
- [ ] T006 동 — `~/.claude/skills/` error 유지 근거 주석 + "Phase 2" 문구 제거
- [ ] T007 `cli/commands/fix.ts` — `checkProject` 에서 adapter 주입 (getAdapter 실패 안전 처리)
- [ ] T008 `tests/unit/integrity-user-level.test.ts` — 주입 있음/없음, 정식 위치 제외, skills error 유지
- [ ] T009 `tests/e2e/` — install-skills ↔ fix --check 합의 (**HOME 격리**)
- [ ] T010 본 repo `fix --check` 경고 0 실측
- [ ] T011 0.17.3 bump + 릴리즈 문서 + docs 5 로케일
- [ ] T012 빌드 + typecheck + docs gate
- [ ] T013 회귀 확인 (unit/e2e/scenario)

## Dependencies

T001~T004 → T005~T006 → T007 → T008~T009 → T010 → T011 → T012~T013
