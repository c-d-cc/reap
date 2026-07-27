# Implementation Log

## Completed Tasks

| # | 파일 | 내용 |
|---|---|---|
| T001 | `adapters/claude-code/install.ts` | `claudeCodeCommandsDir(home?)` export. `installSlashCommandsOnly` 이 사용. opencode 의 `opencodeCommandsDir` 와 동형 |
| T002 | `adapters/types.ts` | `AdapterModule.userLevelDirs(home?)` 추가 + 배경 docstring |
| T003 | `adapters/claude-code/index.ts` | `[claudeCodeCommandsDir(home)]` |
| T004 | `adapters/opencode/index.ts` | `[opencodeCommandsDir(home), opencodeAgentsDir(home)]` |
| T005 | `core/integrity.ts` | `checkUserLevelArtifacts(projectRoot, canonicalDirs = [], home = homedir())`. `isCanonical` 로 정식 위치 제외 |
| T006 | 동 | "Phase 2" 문구 제거. `~/.claude/skills/` error 유지 근거 주석 |
| T007 | `cli/commands/fix.ts` | `resolveCanonicalUserDirs` — config 읽어 `getAdapter().userLevelDirs()` 주입. 실패 시 빈 배열 |
| T008 | `tests/unit/integrity-user-level.test.ts` | 신규 9 case |
| T009 | `tests/e2e/install-skills-fix-agreement.test.ts` | 신규 5 case (HOME 격리) |
| T010 | — | 본 repo `fix --check` **19건 → 0건** 실측 |
| T011 | `package.json` 0.17.3 / `RELEASE_NOTICE.md` / `RELEASE_NOTES.md` / docs 5 로케일 | |
| T012 | — | typecheck 0 / CLI+docs build / `check-docs-version.sh` **pass** |
| T013 | — | unit **470-0**(+9) / e2e **268-1**(+5) / scenario 44-0 |

## Verification Results

| 기준 | 결과 |
|---|---|
| 1. install-skills 후 user-level 경고 0 | **pass** — e2e 로 고정 |
| 2. 본 repo 경고 19 → 0 | **pass** — 남은 3건은 lineage parent / invariants placeholder 로 무관한 기존 항목 |
| 3. 경로 단일 정의 | **pass** — `claudeCodeCommandsDir` 한 곳. checker 의 하드코딩 제거 |
| 4. `core → adapters` 의존 없음 | **pass** — `grep -rn "from.*adapters" src/core/` 매치 0 (주석 언급만 존재) |
| 5. `~/.claude/skills/` error 유지 | **pass** |
| 6. project-level warning 유지 | **pass** |
| 7. `getAdapter` 실패 시 생존 | **pass** — try/catch → 빈 배열 |
| 8. e2e HOME 격리 | **pass** — 실행 전후 사용자 `~/.claude/commands/` 19개 **불변** 확인 |
| 9. 회귀 없음 | **pass** |
| 10. 0.17.3 문서 정합 | **pass** |

## Architecture Decisions

### 경고 삭제로 끝내지 않고 DI 를 넣은 이유

2번 검사를 지우면 이슈는 닫힌다. 그러나 **#22 자체가 v0.15→v0.16 경로 변경 때 checker 가 따라오지 않아 생긴 일**이다. 문구만 고치면 같은 사고를 다시 준비하는 셈이다.

DI 로 하면 정식 위치가 바뀔 때 checker 가 자동으로 따라온다. 이를 테스트로도 고정했다 — "a directory becomes exempt the moment an adapter claims it" case 는 `~/.claude/skills/` 를 canonical 로 넘기면 error 가 사라짐을 확인한다. **미래의 경로 이전이 이 파일 수정 없이 동작함을 증명한다.**

### 새 패턴이 아니라 기존 패턴의 적용

opencode 는 이미 `opencodeCommandsDir(home = homedir())` / `opencodeAgentsDir(home)` 를 export 하고 있었다(gen-064). claude-code 만 인라인 하드코딩이었다. 같은 gen-064 가 opencode 의 legacy 경고도 제거했는데 claude-code 쪽만 빠뜨렸다.

즉 본 세대는 **한쪽에만 적용됐던 패턴을 완성**한 것이다. 새 개념을 도입하지 않았다.

### 미주입 기본값을 "빈 배열 = 검사 skip" 으로

`canonicalDirs` 가 비면 `~/.claude/commands/` 검사를 하지 않는다. 반대로 "미주입 시 무조건 legacy" 로 두면 adapter 를 못 읽는 상황에서 **정확히 #22 를 재현**한다.

gen-075 교훈("경고가 상시 뜨면 신호 가치 0")을 적용해, **잘못된 기본값으로 오탐하느니 검사를 안 하는 편**을 택했다. `getAdapter("codex")` 가 throw 하는 경우가 실제로 이 경로를 탄다.

### `home` 도 주입 대상에 포함 (구현 중 발견으로 추가)

원래 계획엔 `canonicalDirs` 만 있었다. unit test 작성 중 **bun 의 `os.homedir()` 가 `$HOME` 을 무시**한다는 것을 발견해 `home` 도 인자로 뺐다.

부수 효과로 설계가 나아졌다 — `opencodeCommandsDir(home = homedir())` 와 시그니처 형태가 같아졌고, in-process 테스트가 개발자의 실제 `~/.claude/` 를 건드리지 않게 됐다.

## Discovered Issues

### bun 의 `os.homedir()` 는 `$HOME` 을 따르지 않는다 (Node 와 다름)

```
node: process.env.HOME 변경 → homedir() 즉시 반영
bun : process.env.HOME 변경 → homedir() 불변
```

gen-069 의 daemon e2e 가 HOME override 로 성공한 것은 **child process 를 spawn** 했기 때문이다(새 프로세스가 시작 시 HOME 을 읽음). in-process 단위 테스트에는 통하지 않는다.

본 세대는 두 방식을 나눠 대응했다:
- **unit** (in-process) → `home` 인자 주입
- **e2e** (child process) → `$\`...\`.env({ HOME: fakeHome })`

이 차이를 모르면 "HOME 을 바꿨는데 왜 격리가 안 되지"로 시간을 쓴다. longterm 기록 대상.

## Deferred Items

- **자기진단 게이트 / canary token** → `릴리즈-자기진단-게이트-...` backlog. **본 세대가 선행 조건이었고 이제 충족됐다** (경고 0 달성)
- `~/.claude/agents/reap-*.md` 는 `userLevelDirs` 에 넣지 않았다 — checker 가 `reap.` (dot) 접두사로 매칭하는데 agent 파일은 `reap-` (hyphen) 이라 애초에 걸리지 않는다. 주석으로 근거를 남겼다
