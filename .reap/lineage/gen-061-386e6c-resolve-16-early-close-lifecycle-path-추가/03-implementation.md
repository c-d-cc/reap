# Implementation Log

## Completed Tasks

### T001 — `src/core/archive.ts` 리팩토링 + `archiveEarlyClose`

- `buildArchiveDir(lineageRoot, state)` private helper로 archive 디렉토리 경로 생성 로직 추출.
- `writeArchive(paths, state, archiveDir, extraMeta)` private helper로 archive 디렉토리/메타/cleanup 공통 로직 추출.
- 기존 `archiveGeneration` 은 `extraMeta` 에 `status: "completed"` + 선택적 `fitnessFeedback`만 전달하도록 변경. 외부 호출 시그니처는 동일.
- 신규 `archiveEarlyClose(paths, state, closeMeta)` 추가. meta.yml 에 `status: "partial"` 와 `closeMeta` 객체(reason, closedAtStage, completedTasks, deferredTasks, sourceAction, deferredBacklogFile?, closedAt) 기록.
- 결과: completion path는 동작 동일 + meta.yml 에 `status: completed` 명시. early-close path는 `status: partial` + closeMeta 기록.

### T002 — `src/core/backlog.ts` 확장

- `createDeferredBacklog(backlogDir, { fromGenId, closedAtStage, goal, closeReason, taskList })` 신규 함수. 파일명 `deferred-{gen-id}-{slug}.md`. frontmatter 에 `derivedFrom`, `closedAtStage`, `type: task`, `status: pending`, `priority: medium`, `createdAt` 포함. 본문에 close reason + 자동 추출된 task 체크리스트 + notes 섹션.
- `extractUncheckedTasks(artifactContent)` 신규 — 정규식 `/^\s*-\s+\[\s\]\s+(.+?)\s*$/` 으로 `- [ ] ...` 라인의 description 추출.
- `countCheckedTasks(artifactContent)` 신규 — `- [x]` 또는 `- [X]` 라인 카운트.
- 결정: backlog title 자동 생성 시 `${gen-id}-${slug}` 패턴이 unique 보장하므로 충돌 없음. taskList 비었으면 본문에 "(자동 추출 결과 없음 — 사용자가 직접 채워야 함)" 표기.

### T003 — `src/core/lineage.ts` 확장

- `getLastLineageEntry(paths)` 신규. `paths.lineage/` 의 마지막 `gen-*` 디렉토리를 읽어 `meta.yml` 파싱. 압축본(.md 단일 파일)이거나 meta.yml 없으면 null. `LastLineageEntry { id, status?, goal?, dirName, closeMeta? }` 반환.
- closeMeta 가 있으면 reason/closedAtStage/completedTasks/deferredTasks/deferredBacklogFile 도 함께 노출.
- import에 `stat` from `fs/promises` 추가, `ReapPaths` 타입 import.

### T004 — `src/cli/commands/run/early-close.ts` 신규

- 2-phase: `confirm` (사용자 안내 prompt — abort/early-close/continue 비교 + reflect 질문 가이드) → `execute` (실제 archive + commit).
- Stage 가드: `state.stage` 가 `implementation` 또는 `validation` 이 아니면 즉시 emitError + abort 권유. merge generation도 거부.
- `parseExtra(extra)` 으로 `{ reason, sourceAction, deferTasks }` JSON 파싱 (abort 패턴 차용).
- `--source-action` 검증: `hold|stash|none` 만 허용. `rollback` 은 의미상 부적합 → 에러 (abort 권유).
- `stash` 일 때 `git stash push -u -m "early-close {gen-id}"` 실행 (best-effort).
- `extractUncheckedTasks` + `countCheckedTasks` 로 03-implementation.md 분석.
- `--defer-tasks` 가 true(기본)면 `createDeferredBacklog` 호출.
- `checkSubmoduleDirty` → dirty 시 emitError, `pushSubmodules`, `archiveEarlyClose` 호출.
- commit message: `feat({gen-id-short}) [early-close]: {goal-summary}` (60자 초과 시 ... 절단).
- `onLifeCompleted` 훅 실행 + `triggerIndexing` (best-effort).

### T005 — `src/cli/commands/run/index.ts` 라우팅

- `import { execute as earlyCloseExecute } from "./early-close.js"` 추가.
- `STAGE_HANDLERS` 에 `"early-close": earlyCloseExecute` 추가.
- options 인터페이스에 `deferTasks?: string` 추가.
- extra 직렬화 분기: `if (stage === "early-close") extra = JSON.stringify({ reason, sourceAction, deferTasks })`.

### T006 — `src/cli/index.ts` 옵션 추가

- `--defer-tasks <value>` 옵션 정의 (description: "For early-close: auto-defer unchecked tasks to new backlog (true|false, default true)").
- `--source-action` description 갱신: "abort/early-close 공용. rollback은 abort 전용".
- `.action()` callback 의 options 타입에 `deferTasks?: string` 추가.

### T007 — `src/cli/commands/run/abort.ts` confirm prompt 갱신

- confirm phase prompt에 abort/early-close/continue 세 선택지 안내 추가. early-close 호출법(`reap run early-close --reason '<reason>'`) 명시.
- `abort.test.ts` 가 prompt 텍스트가 아닌 status/context 만 검증하므로 회귀 없음.

### T008 — `src/cli/commands/run/start.ts` hint 노출

- `getLastLineageEntry` import 추가.
- scan phase 에서 lastEntry 조회 → `status: partial` 인 경우 `previousEarlyClose` 객체 생성 (id, closedAtStage, reason, deferredBacklogFile, deferredTasks).
- emitOutput context 에 `previousEarlyClose` 추가.
- prompt 생성을 배열 기반으로 재구성 → previousEarlyClose hint 가 backlog 목록 앞에 노출됨.
- backlog 목록 없을 때도 hint 만 단독 노출 가능.

### T009 — slash command 파일

- `src/adapters/claude-code/skills/reap.early-close.md` 생성. abort 패턴(`Run \`reap run X $ARGUMENTS\` and follow stdout`) 차용.
- description: "REAP Early-close — Close the current generation as a partial save (lightweight termination between abort and full completion)".

### T010 — `src/templates/reap-guide.md` 갱신

- "Termination Paths — abort / early-close / completion" 절을 Task Deferral 다음에 추가:
  - 세 path 비교 표 (의미/artifacts/consumed backlog/lineage/reflect/fitness/adapt/git commit/hint/사용 가능 단계).
  - **Agent behavior — 중단 의도 표명 시 절차** (사용자 의도 확인 → 세 선택지 제시 → CLI 실행).
  - early-close reflect 사용자 interactive 강조 (자동 판단 금지).
  - 다음 generation 시 hint 자동 노출 설명.
- Slash Commands → Lifecycle Commands 에 `/reap.early-close` 항목 추가.

### T011 — `src/templates/claude-md-section.md` 갱신

- "Termination Paths" 미니 절 추가 (Agent 절 앞). 세 명령 한 줄 요약 + 사용자 중단 의도 표명 시 agent 가 세 선택지 안내한다는 안내.

### T012 — `.reap/reap-guide.md` 동기화 (dog-fooding)

- T010 과 동일한 내용을 local reap-guide.md 에도 반영. Termination Paths 절 + Slash Commands 항목 추가.

### T013 — build

- `npm run build` 실행. bundled 144 modules in 30ms, `dist/cli/index.js` 0.53MB 생성.
- `npm run typecheck` 통과 (tsc --noEmit).

### T014 — Unit tests (`tests/unit/early-close.test.ts`)

- 신규 unit 테스트 파일 추가. 4개 describe 블록:
  - `backlog — extractUncheckedTasks` (4 tests): simple/checked-ignored/indented/empty
  - `backlog — countCheckedTasks` (2 tests): mixed/no-checked
  - `backlog — createDeferredBacklog` (3 tests): frontmatter, empty taskList placeholder, slug 30자 truncation
  - `archive — archiveEarlyClose` (4 tests): status: partial + closeMeta, artifacts 보존, life/ cleanup + backlog 유지, optional deferredBacklogFile
  - `lineage — getLastLineageEntry` (5 tests): null cases (no lineage / dir absent / compressed .md / meta.yml missing), 정상 read, 정렬

### T015 — `tests/unit/archive.test.ts` 확장

- 기존 archive 테스트에 1개 추가: `meta.yml records status: completed for normal completion`. `archiveGeneration` 호출 후 meta.yml 에 `status: completed` 포함 확인.

### T016 — E2E tests (`tests/e2e/early-close.test.ts`)

- 8개 describe suite (22 tests):
  1. **early-close from implementation** (6 tests): setup, confirm prompt, execute, life cleanup, lineage status: partial + closeMeta, deferred backlog content
  2. **early-close from validation** (2 tests): setup, execute at validation
  3. **--defer-tasks=false** (3 tests): setup, no deferred backlog 생성, meta.yml deferredBacklogFile 부재
  4. **stage guard** (3 tests): setup, learning 거부, planning 거부
  5. **invalid source-action** (2 tests): rollback 거부
  6. **next gen hint** (2 tests): setup, scan phase context.previousEarlyClose 노출
  7. **abort confirm prompt** (2 tests): setup, prompt에 early-close 안내
  8. **no active generation** (1 test): error 반환
- daemon triggerIndexing 호출 누적으로 setup test에서 시간이 늘어, setup test와 execute test에 `30000ms` 또는 `15000ms` timeout 명시.

### T017 — 전체 테스트 실행

- `bun test tests/unit/` → **362 pass / 0 fail / 937 expect calls / 7.71s**
- `bun test tests/e2e/` → **169 pass / 1 fail / 462 expect calls / 73.9s**
  - 실패: `init-repair.test.ts` 1건 → **pre-existing failure**. 본 generation 변경 stash 후 동일 failure 재현 확인 → 회귀 아님. shortterm memory에 명시된 미해결 이슈.
- 본 generation 변경으로 인한 새 회귀 **없음**.

### T018 — tests/ submodule commit

- 본 task는 completion commit phase에서 진행 (test 추가가 submodule 변경이므로 별도 커밋 단계 필요). 본 implementation 단계에서는 변경만 staged.

## Discovered Issues

(없음 — planning 시 예측한 위험 외 추가 발견 없음)

## Deferred Items

- merge generation에서의 early-close 동작은 본 generation에서 미지원 (out of scope). 향후 별도 검토.

## Architecture Decisions

### archive 함수 분리 vs 옵션 객체 확장

planning에서 `writeArchive` private helper로 공통화하고 두 public 함수가 호출하기로 결정. 구현 시 `extraMeta: Record<string, unknown>` 형태로 받아 캡슐화. 호출자가 `status` 필드를 명시적으로 전달하도록 함 (completed/partial 명시).

### deferred task 추출 — 정규식 의존

03-implementation.md의 task 표기 형식이 자유로워 정규식 추출이 완벽하지 않을 수 있음. 이 generation의 03 artifact는 `### T001` 같은 heading 기반이라 `- [ ]` 라인이 거의 없음 → 자동 추출 결과 0건이 정상. 따라서 `createDeferredBacklog`는 taskList 비어있을 때 본문에 안내문구 + 사용자 보강 유도. 향후 generation 마다 task 표기 일관성에 따라 결과 품질이 결정됨.

### sourceAction 기본값 hold

backlog 합의에 따라 `hold` 기본값. `stash` 도 지원 (best-effort). `rollback` 은 거부 (abort가 그 역할). `none` 은 호환 옵션 (sourceAction 강제 지정 없이 진행 의미).

### commit message 포맷

`feat({gen-id-short}) [early-close]: {goal}` 채택. feat 유지하되 prefix tag로 종류 명시. completion 의 일반 commit 과 분리 가능.

### onLifeCompleted hook 호출

early-close 도 generation 종료 시점이므로 onLifeCompleted hook을 실행 (docs-update 같은 hook이 lineage 갱신에 의존). best-effort.
