# Planning

## Goal

`early-close` lifecycle path 도입 — abort(취소)와 completion(정식 완료) 사이의 lightweight 종료 옵션. implementation/validation 단계에서 부분 완성된 가치를 lineage에 보존하면서 미완 작업을 자동으로 다음 세대에 deferred backlog로 승계.

## Background

Issue #16: abort와 full completion만 있어 implementation 도중 scope 축소 시나리오에 부적절. 2026-05-24 세션에서 `early-close`라는 세 번째 path 도입을 확정. 본 generation의 source backlog `early-close-lifecycle.md`에 모든 설계 결정이 정리되어 있음.

## Completion Criteria

(backlog Verification 기준 13개를 합쳐 7개 핵심 기준으로 정리)

1. **C1**: `reap run early-close --reason "<r>"`이 implementation/validation 단계에서 정상 동작, 그 외 stage(learning/planning/completion)에서는 에러 + abort 권유 메시지.
2. **C2**: `/reap.early-close` slash command 파일이 `src/adapters/claude-code/skills/`에 존재하고 install 후 `~/.claude/commands/`에 배포됨.
3. **C3**: early-close 실행 후 `.reap/life/` artifacts(01~03 또는 01~04)와 source 변경 모두 보존 → lineage에 archive됨. lineage entry의 `meta.yml`에 `status: partial`, `closeReason`, `closedAtStage`, `completedTasks`, `deferredTasks`, `deferredBacklogFile` 기록.
4. **C4**: reflect 단계가 사용자에게 interactive 질문 prompt(어디까지 진행, 가치, 남은 일, 닫는 이유)를 노출. fitness/adapt phase는 skip. commit message에 `[early-close]` 표기.
5. **C5**: `--defer-tasks` 기본 true로 03-implementation.md의 `- [ ]` 미완료 task가 새 backlog `.reap/life/backlog/deferred-{gen-id}-{slug}.md`로 자동 승계 (frontmatter `derivedFrom: {gen-id}`). `--defer-tasks=false` 호출 시 미생성.
6. **C6**: 새 generation `reap run start`의 scan phase 시 직전 lineage entry meta.yml에 `status: partial`이고 `deferredBacklogFile`이 존재하면 prompt에 hint 노출. `reap run abort` confirm phase prompt에도 early-close 옵션 안내 추가.
7. **C7**: 전체 테스트 pass — 기존 abort/completion 회귀 없음 + early-close unit + e2e 신규 테스트 통과. dog-fooding (`src/templates/reap-guide.md`, `claude-md-section.md`, `.reap/reap-guide.md`) 동기화.

## Approach

### Architecture 결정

**1. abort 패턴 차용 — verifyTransition 우회**

early-close는 abort처럼 lifecycle을 정상 진행하는 게 아니라 탈출 path. `verifyTransition` 호출 안 함. abort.ts와 동일한 구조(2-phase: confirm → execute) 채택.

근거:
- abort.ts가 verifyTransition 호출하지 않고도 동작 (line 24-115). transition graph에 새 transition 추가 불필요.
- pendingTransitions에 의존하지 않으므로 어느 phase에서 호출되든 일관 동작.
- 단, "현재 stage가 implementation/validation인지" 명시적 가드 필요 (state.stage 검사).

**2. archive 함수 재사용 vs 신규 함수**

신규 helper `archiveEarlyClose(paths, state, closeMeta)` 생성. `archiveGeneration`을 그대로 부르지 않는 이유:
- meta.yml에 추가 필드(`status: partial`, `closeReason`, `closedAtStage`, ...)가 들어가야 함.
- 함수 시그니처를 옵션 객체로 확장하면 기존 caller(completion.ts)의 호출 형태가 변하거나, 옵셔널 인자 추가로 type 변형 발생.
- 별도 함수로 분리하면 책임이 명확하고 회귀 위험 최소.
- 공통 로직(artifacts 복사, life 정리)은 `archive.ts` 내부에서 helper로 추출.

**최종 결정**: `archive.ts` 내부에 `writeArchive(paths, state, archiveDir, extraMeta?)` private helper로 공통화하고, public `archiveGeneration(...)`와 `archiveEarlyClose(...)`가 각자 호출.

**3. deferred task 추출 로직**

03-implementation.md에서 미완료 task 추출:
- 정규식: `/^- \[ \]\s+(.+)$/gm` (line-anchored, multiline)
- 추출된 항목들을 deferred backlog의 본문에 옮김
- 추출 0개면: backlog 파일 생성하되 본문에 "(원본 generation에서 미완 task 자동 추출 결과 없음 — 본문을 사용자가 직접 채워야 함)" 표시. 사용자에게 prompt로 알림.
- CLI 단에서는 정규식 추출만, 사용자 응답 기반 보강은 reflect prompt에서 처리.

**4. deferred backlog 파일명**

`deferred-{gen-id}-{slug}.md` 형식. slug는 `toKebabCase(state.goal)`의 앞 30자.

- `gen-id`가 unique이므로 충돌 없음.
- 기존 `createBacklog`는 `${toKebabCase(title)}.md`로 파일명을 만들지만, deferred는 별도 prefix 필요 → 신규 함수 `createDeferredBacklog(backlogDir, fromGenId, fromState, taskList, body)` 추가.
- 신규 함수가 `derivedFrom`, `closedAtStage`, `priority: medium` 프론트매터 추가.

**5. CLI 옵션 매핑**

`reap run early-close --reason "<r>" --source-action <hold|stash|none> --defer-tasks <true|false>`

- `--reason`은 기존 옵션 재사용.
- `--source-action`도 기존 옵션 재사용 (abort용으로 이미 있음). early-close에서는 기본값 `hold`. `rollback`은 의미상 부적합하므로 거부 (에러 메시지).
- `--defer-tasks`: 신규 string 옵션 (value "false"/"true", default "true"). `src/cli/index.ts`에 `.option("--defer-tasks <value>", ...)` 추가.
- run/index.ts의 extra 직렬화: `early-close` stage에서도 JSON 형태로 `{ reason, sourceAction, deferTasks }` 직렬화 (abort 패턴 차용).

**6. lineage status meta 구조**

meta.yml top-level에 `status: completed | partial` 추가. early-close 시:
```yaml
id: gen-061-386e6c
type: normal
goal: "..."
parents: [...]
timeline: [...]
status: partial
closeMeta:
  reason: "scope reduction"
  closedAtStage: implementation
  completedTasks: 3
  deferredTasks: 5
  deferredBacklogFile: deferred-gen-061-386e6c-resolve-16.md
```

기존 completion archive에서는 status 필드 생략 또는 `status: completed` 명시. **결정**: 신규 generation은 항상 `status: completed` 또는 `status: partial`을 명시. 기존 lineage entries는 status 필드 부재이지만 호환 (없으면 completed 가정).

**7. next-generation hint 노출**

start.ts의 `scan` phase에서 hint 추가:
- scan phase가 backlog list를 보여주는 prompt를 emit 중.
- 이 prompt에 "직전 generation이 early-close였습니다. deferred backlog가 있으니 이를 source backlog로 선택하시거나 새 goal을 입력하세요" 문구 추가.
- 마지막 lineage entry meta.yml 파싱 helper 신규 (`getLastLineageEntry(paths)`) — `src/core/lineage.ts`에 추가.

**8. commit message 포맷**

기존 completion: `feat({gen-id-short}): {goal}`
early-close: `feat({gen-id-short}) [early-close]: {goal}` 채택. feat 유지하되 prefix로 종류 표시. (자체 결정, fitness에서 피드백 받을 수 있음.)

### Agent behavior 변경 (reap-guide)

`src/templates/reap-guide.md`의 "Life Cycle" 다음 또는 신규 절 "Termination Paths"에 다음 추가:

1. **세 가지 종료 path 비교 표** (abort/early-close/completion).
2. **사용자 중단 의도 표명 시 절차**:
   - trigger keywords (한/영): 그만, 중단, 포기, 취소, 스코프 줄이고 싶어, stop, abort, give up, reduce scope, cancel
   - agent 응답 절차:
     1. 사용자 의도 확인 ("중단하려는 건가요, 아니면 scope만 줄이려는 건가요?")
     2. 세 선택지 명시:
        - **abort**: 이번 generation 자체를 취소 (실패 처리)
        - **early-close**: 지금까지 한 만큼만 lineage에 반영하고 다음 세대로 (부분 가치 보존)
        - **continue**: 끝까지 가서 정식 완료
     3. 사용자가 선택하면 그에 맞는 CLI 호출

`src/templates/claude-md-section.md`에도 한 줄 hint 추가. 핵심 가이드는 reap-guide.md.

`.reap/reap-guide.md`도 동일하게 동기화 (dog-fooding).

### Test 전략

| Verification | 레벨 | 테스트 |
|---|---|---|
| early-close CLI option parsing | unit | `early-close.test.ts` — extra JSON 파싱 |
| stage 가드 (learning/planning에서 거부) | unit | `early-close.test.ts` — emitError 발생 |
| deferred task 추출 정규식 | unit | `early-close.test.ts` 또는 `backlog.test.ts` |
| archive 함수 동작 | unit | `archive.test.ts` 확장 — meta.yml의 status/closeMeta |
| 전체 lifecycle: start→learning→planning→implementation→early-close→lineage | e2e | `early-close.test.ts` (e2e) |
| validation 단계에서 early-close | e2e | 동일 파일 |
| `--defer-tasks=false` 시 backlog 미생성 | e2e | 동일 파일 |
| 새 generation 시 hint 노출 | e2e | 동일 파일 — early-close 후 start, prompt에 hint 포함 검증 |
| abort confirm 시 early-close 안내 | e2e | abort.test.ts 확장 (또는 신규 케이스) |
| abort/early-close/completion 분기 | e2e | 신규 파일에서 세 path 동시 검증 |
| 회귀 없음 | 기존 테스트 전부 | `bun test` |

## Scope

### 신규 파일

| 경로 | 책임 |
|---|---|
| `src/cli/commands/run/early-close.ts` | early-close 핸들러 (confirm → execute) |
| `src/adapters/claude-code/skills/reap.early-close.md` | slash command |
| `tests/unit/early-close.test.ts` | unit tests |
| `tests/e2e/early-close.test.ts` | e2e tests |

### 수정 파일

| 경로 | 변경 내용 |
|---|---|
| `src/cli/index.ts` | `--defer-tasks <value>` 옵션 추가 |
| `src/cli/commands/run/index.ts` | STAGE_HANDLERS에 `early-close` 등록, extra 직렬화 분기 |
| `src/cli/commands/run/abort.ts` | confirm prompt에 early-close 옵션 안내 1줄 추가 |
| `src/cli/commands/run/start.ts` | scan phase 시 직전 early-close 감지 + hint prompt 추가 |
| `src/core/archive.ts` | `writeArchive` private helper + `archiveEarlyClose` 신규 + `archiveGeneration` 리팩토 |
| `src/core/backlog.ts` | `createDeferredBacklog(...)` 함수 추가 |
| `src/core/lineage.ts` | `getLastLineageEntry(paths)` helper 추가 |
| `src/templates/reap-guide.md` | Termination Paths 절 추가, Slash Commands에 `/reap.early-close` 추가 |
| `src/templates/claude-md-section.md` | early-close 한 줄 hint 추가 |
| `.reap/reap-guide.md` | dog-fooding 동기화 |

### Out of scope

- abort의 의미 변경 (그대로 "실패/취소" 유지)
- completion phase 구조 변경 (4 phase 그대로)
- merge generation에서의 early-close (별도 검토)
- README.md 변경 — slash command 목록 자동 생성이 아니므로 README는 손대지 않음. claude-md-section.md만 동기화.
- strict mode와의 상호작용 (현재로선 영향 없음)

## Risk Assessment

1. **abort 테스트 회귀**: abort.test.ts는 prompt 텍스트가 아닌 status/context 검증만 함 (확인 완료). 안내 문구 추가는 안전.

2. **archive helper 리팩토링 회귀**: `archiveGeneration` 동작이 바뀌지 않아야 함. 기존 archive.test.ts 전부 통과해야 함. → `archiveEarlyClose` 추가만 하고 `archiveGeneration`은 내부적으로 helper 호출하도록 변경하되 외부 동작 동일.

3. **getLastLineageEntry helper의 compression 호환성**: lineage entry가 압축되어 `*.md` 파일이 된 경우 meta.yml이 없음. → helper는 마지막 디렉토리가 압축본인지 디렉토리인지 구분하여 meta.yml 없으면 null 반환. 압축은 5gen 이상 누적 시 트리거되므로 즉시 이전 generation이 압축되어 있을 가능성은 낮음.

4. **submodule dirty check**: completion은 dirty check + push submodules. early-close도 lineage commit이 submodule pointer를 참조하면 push 필요 → completion과 동일하게 dirty check + push submodules 수행하는 게 안전.

5. **commit 실패 시 처리**: completion의 git commit 실패 흐름과 동일. archive는 이미 끝나 있고 commit만 실패하면 사용자가 수동 commit 가능.

6. **deferred backlog 파일명 충돌**: gen-id가 unique이므로 충돌 없음.

7. **`reap run early-close --phase confirm`/`execute` 두 phase의 가드**: confirm은 항상 가능하지만, current stage가 implementation/validation이어야 함을 confirm에서도 체크 → learning/planning에서 호출 시 즉시 거부.

8. **dog-fooding 누락**: src/templates/ 변경 시 .reap/ 의 대응 파일도 같이 변경. → planning에 명시적 task로 분리 (T012), validation에서 확인.

## Brainstorming

### 검토했던 대안

**Alt 1: completion에 `--early-close` 플래그 추가**
- 거부 이유: completion phase 가드(verifyTransition)를 우회해야 하므로 분기가 깊어짐. 별도 명령이 책임 분리 명확.

**Alt 2: abort에 `--save-as-partial` 모드 추가**
- 거부 이유: abort의 본질은 "실패/취소"이고 lineage 미기록. partial 모드를 abort 안에 두면 의미 혼동.

**Alt 3 (채택)**: 신규 명령 `early-close` 도입. abort의 confirm/execute 패턴 차용. completion의 archive 로직 일부 재사용.

### 검토했던 reflect 깊이 옵션

- 자동 추출만: 빠르지만 본질적 가치 판단을 미수행.
- 사용자 interactive: 본 generation 합의안. agent가 starting point만 자동 추출, 사용자 응답 기반으로 채움.
- → 사용자 interactive 채택. 합의된 사항.

## Tasks

- [ ] T001 `src/core/archive.ts` — `writeArchive` private helper 추출 + `archiveEarlyClose(paths, state, closeMeta)` 신규 함수 추가. 기존 `archiveGeneration`은 동일 동작 유지.
- [ ] T002 `src/core/backlog.ts` — `createDeferredBacklog(backlogDir, fromGenId, fromState, taskList, body)` 함수 추가.
- [ ] T003 `src/core/lineage.ts` — `getLastLineageEntry(paths): Promise<{ id, status?, deferredBacklogFile? } | null>` helper 추가.
- [ ] T004 `src/cli/commands/run/early-close.ts` — 신규 핸들러. 2-phase: confirm (prompt) → execute (archive + deferred backlog + git commit). stage 가드.
- [ ] T005 `src/cli/commands/run/index.ts` — STAGE_HANDLERS에 `"early-close": earlyCloseExecute` 등록. extra 직렬화 분기.
- [ ] T006 `src/cli/index.ts` — `--defer-tasks <value>` 옵션 정의.
- [ ] T007 `src/cli/commands/run/abort.ts` — confirm phase prompt에 early-close 옵션 안내 1줄 추가.
- [ ] T008 `src/cli/commands/run/start.ts` — scan phase에서 `getLastLineageEntry` 호출, status: partial이면 prompt에 hint 추가.
- [ ] T009 `src/adapters/claude-code/skills/reap.early-close.md` — slash command 파일 생성.
- [ ] T010 `src/templates/reap-guide.md` — "Termination Paths" 절 추가. Slash Commands 섹션에 `/reap.early-close` 추가.
- [ ] T011 `src/templates/claude-md-section.md` — early-close 한 줄 hint 추가.
- [ ] T012 `.reap/reap-guide.md` — dog-fooding 동기화 (T010 동일).
- [ ] T013 `npm run build` — dist/cli/index.js 갱신.
- [ ] T014 `tests/unit/early-close.test.ts` — unit tests: option parsing, stage guard, deferred task 추출, archive 함수.
- [ ] T015 `tests/unit/archive.test.ts` 확장 — `archiveEarlyClose`의 meta.yml status/closeMeta 검증.
- [ ] T016 `tests/e2e/early-close.test.ts` — e2e tests: 전체 lifecycle, validation 단계, `--defer-tasks=false`, hint 노출, abort confirm 안내.
- [ ] T017 `bun test tests/unit/ tests/e2e/` — 회귀 없음 확인.
- [ ] T018 tests/ submodule commit → parent에서 submodule pointer 업데이트.

## Dependencies

- T001, T002, T003 (core helpers) → T004 (CLI handler)에서 사용.
- T004 → T005 (라우팅 등록).
- T005, T006 → T007, T008 (다른 핸들러 수정).
- T009, T010, T011, T012 (문서) → T013 빌드 전 완료.
- T013 (build) → T014~T017 (테스트).
- T017 통과 → T018 (submodule commit).

## Additional Findings

- `tests/helpers/setup.ts`의 `cli()` 함수는 `dist/cli/index.js`를 호출. 따라서 src 변경 후 반드시 `npm run build` (T013).
- `abort.test.ts`는 prompt 텍스트가 아니라 status/phase/context만 검증. 회귀 없음.
- `archiveGeneration`의 compressLineage 호출은 best-effort. early-close에도 동일하게 적용.
- start.ts의 scan phase가 `prompt` status를 emit하므로 context.previousEarlyClose 등 추가 필드 노출 가능.
- `deferred-{gen-id}-{slug}.md` 파일은 source backlog로 그대로 사용 가능. 다음 generation start 시 `--backlog deferred-{gen-id}-{slug}.md`로 consume.
- commit message 포맷: `feat({gen-id-short}) [early-close]: {goal}` 채택 (자체 결정).

## Confirmation

이 plan은 high clarity 기반으로 자율 작성. 핵심 결정(commit message 포맷, deferred task 추출 처리)은 자체 결정. 사용자가 다른 방향을 원하면 implementation 전에 의견 받을 수 있지만, backlog/세션 합의가 명확하므로 별도 confirm 없이 implementation 진행.
