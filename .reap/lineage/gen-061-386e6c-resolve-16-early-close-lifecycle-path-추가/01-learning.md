# Learning

> Generation `gen-061-386e6c` — resolve #16: early-close lifecycle path 추가

## Project Overview

REAP v0.16.0 (npm package `@c-d-cc/reap`)은 AI+인간이 generation 단위로 소프트웨어를 공동 진화시키는 자기진화형 파이프라인이다. 현재 gen-060까지 진행되었고 main 브랜치 기준 origin보다 15 commits ahead (push 미실행).

핵심 lifecycle은 두 가지:
- **Normal**: `learning → planning → implementation ⟷ validation → completion(reflect → fitness → adapt → commit)`
- **Merge**: `detect → mate → merge → reconcile → validation → completion`

종료 path 현황:
- **abort** (`src/cli/commands/run/abort.ts`): `life/` 전체 삭제, consumed backlog revert, lineage 미기록 — "실패/취소" 의미
- **completion** (`src/cli/commands/run/completion.ts`): 4 phase(reflect → fitness → adapt → commit) 강제 통과, lineage 기록, git commit

본 generation은 그 사이의 lightweight 종료 path `early-close`를 도입하여, implementation 도중 scope 축소가 필요한 시나리오에서 부분 가치를 보존하면서도 빠르게 다음 세대로 넘어갈 수 있게 한다.

## Source Backlog

`early-close-lifecycle.md` (medium priority, 2026-05-24 작성, Issue #16 해결). 본 generation의 합의된 설계와 verification 기준이 모두 거기에 정리되어 있다. 핵심 결정:

- 이름은 `early-close` (abort의 "취소"와 의미 분리)
- 호출 가능 stage: **implementation, validation** (learning/planning은 abort가 적합)
- CLI `reap run early-close` + slash `/reap.early-close` 신규
- reflect는 **사용자 interactive** (자동 판단 금지)
- fitness/adapt **skip** (정상 종료 패턴 아님)
- 미완 task 자동 backlog 승계 (`deferred-{gen-id}-{slug}.md`)
- 다음 generation start 시 직전이 early-close였으면 hint 노출
- abort confirm phase에서 early-close 옵션 함께 노출
- 사용자 중단 의도 표명 시 agent가 abort/early-close/continue 세 선택지 제시
- lineage `status: partial` (기존 `completed`/`aborted`와 구분)
- source action 기본값 `hold`

상세 verification 기준 13개는 backlog 파일 참조.

## Key Findings

### 종료 path 코드 위치

**abort flow** (`src/cli/commands/run/abort.ts`, 116 lines):
- 2-phase: `confirm` (안내 prompt) → `execute` (실제 정리)
- execute에서:
  - `revertBacklogConsumed(paths.backlog, id)` — consumed → pending 복귀
  - `readdir(paths.life)` 후 `backlog/` 제외하고 모두 `rm` (artifacts 삭제)
  - 옵션 `--save-backlog` 시 `aborted-{gen-id}.md` 생성
  - lineage 미작성
- `parseExtra()` 로 reason/sourceAction/saveBacklog JSON 파싱

**completion flow** (`src/cli/commands/run/completion.ts`, 373 lines):
- 4 phase: reflect → fitness → adapt → commit
- 각 phase에서 `verifyTransition` + `setTransitionNonces` 호출
- commit phase에서:
  - `consumeBacklog()` (feedback param에 comma-separated filenames 전달 시)
  - `checkSubmoduleDirty` → emitError if dirty
  - `pushSubmodules`
  - `archiveGeneration(paths, s, fitnessFeedback)` — lineage 디렉토리 생성
  - `gitCommitAll` — commit message `feat({gen-id-short}): {goal-summary}`
  - `executeHooks("onLifeCompleted")`
  - `triggerIndexing` (daemon)
  - `advanceCruise`

**Transition graph** (`src/core/lifecycle.ts`):
- `NORMAL_TRANSITIONS`, `MERGE_TRANSITIONS` 선언적 정의
- 각 `stage:phase` 키에 허용된 target 배열
- `getTransitions(type, stagePhase)` 로 lookup
- early-close는 graph에 새 transition 추가가 필요한가? — **불필요**. early-close는 lifecycle을 정상 진행하는 게 아니라 abort처럼 "탈출 path"이므로, current.yml의 nonce 검증 우회가 정당. abort.ts도 verifyTransition 호출하지 않는다.

**archiveGeneration** (`src/core/archive.ts`, 84 lines):
- `goalSlug` 생성 후 `lineage/{gen-id}-{slug}/` 디렉토리 생성
- `life/` 의 artifacts를 cp
- consumed backlog만 `archiveDir/backlog/` 로 복사 (pending은 life/backlog/에 남김)
- `meta.yml` 작성 (id, type, goal, parents, timeline, optional fitnessFeedback)
- life/ artifacts 삭제 (backlog/ 제외)
- compressLineage 호출
- → **early-close는 이 함수를 재사용 가능**. meta.yml에 `status`, `closeReason`, `closedAtStage`, `completedTasks`, `deferredTasks`, `deferredBacklogFile` 필드 추가하면 됨.

**backlog 함수들** (`src/core/backlog.ts`):
- `scanBacklog`, `consumeBacklog`, `revertBacklogConsumed`, `createBacklog`, `toKebabCase` — early-close에서 deferred backlog 생성 시 `createBacklog`를 직접 호출하기보다는 별도 helper로 작성 (frontmatter에 `derivedFrom: {gen-id}` 추가 필요)

### CLI 라우팅

`src/cli/index.ts`:
- `reap run <stage>` 라우팅 (line 62-76)
- options: phase, goal, type, parents, feedback, reason, backlog, sourceAction, saveBacklog
- → **early-close용 options 추가 필요**: 이미 있는 `--reason`, `--source-action` 재사용 가능. 추가로 `--defer-tasks` (boolean, 기본 true) 필요.

`src/cli/commands/run/index.ts`:
- `STAGE_HANDLERS` map에 stage → execute 함수 매핑
- 라인 47-49: `start`는 별도 처리 (paths 검증 전)
- → **early-close handler 추가 필요**: `early-close: earlyCloseExecute` 등록
- 라인 67-70: extra 직렬화 로직 — abort는 JSON serialize. early-close도 같은 패턴.

### Slash command 패턴

`src/adapters/claude-code/skills/reap.abort.md` (5 lines):
```
---
description: "REAP Abort — Abort the current generation"
---

Run `reap run abort $ARGUMENTS` and follow the stdout instructions exactly.
```
→ **`reap.early-close.md` 신규 작성 필요** (동일 패턴, 명령만 변경).

### Types

`src/types/index.ts`:
- `GenerationState`: id, type, stage, goal, parents, commonAncestor, genomeHash, timeline, phase, pendingTransitions, sourceBacklog, fitnessFeedback
- `ReapOutput.status`: `"ok" | "prompt" | "error" | "artifact-incomplete"`
- → early-close에서 ReapOutput status 추가는 불필요 (`prompt` 또는 `ok` 재사용)
- → lineage meta.yml은 free-form YAML이라 새 필드 추가 안전

### 테스트 패턴

**Unit tests** (`tests/unit/`):
- `archive.test.ts`, `backlog.test.ts`, `lifecycle.test.ts`, `nonce.test.ts`, `stage-transition.test.ts` 등 27개 파일

**E2E tests** (`tests/e2e/`):
- `abort.test.ts` (early-close와 유사 — 종료 path 검증)
- `cli-commands.test.ts` (CLI 라우팅)
- `completion-reflect.test.ts` (completion lifecycle)
- → **early-close.test.ts (unit) + early-close.test.ts (e2e) 신규 추가 필요**

tests/는 git submodule (https://github.com/c-d-cc/reap-test, branch: self-evolve). 커밋 시 submodule 내 commit 먼저 → parent에서 submodule pointer 업데이트.

### Templates 동기화 (dog-fooding)

- `src/templates/reap-guide.md` — agent 행동 가이드 (subagent prompt에 주입). early-close path 안내 + 사용자 중단 의도 시 세 선택지 제시 절차 추가 필요.
- `src/templates/claude-md-section.md` — 사용자 안내 (CLAUDE.md 섹션). early-close 언급 추가.
- `.reap/reap-guide.md` (local) ← `src/templates/reap-guide.md` 동기화 대상
- README.md — 사용자 문서. 종료 path 비교 표 같은 게 있다면 갱신.

## Previous Generation Reference

gen-060 (daemon E2E 테스트 보강): 4 테스트 파일 신규 + server.ts에 `idleCheckIntervalMs` 옵션 추가. daemon 130 tests + main 342 unit pass. fitness `pass`.

영향 없음 — early-close는 daemon/indexer와 무관한 lifecycle 코어 영역 작업.

## Backlog Review

| filename | type | 본 generation과의 관계 |
|---|---|---|
| `early-close-lifecycle.md` | task | **본 generation의 source backlog** (이미 consumed 처리됨) |
| `daemon-e2e-tests.md` | task | gen-060에서 작업 완료. consumed 마킹 필요? — 확인하니 status 검사로 처리됨. |
| `fix-migrate-update-tests.md` | task | gen-059에서 consumed (별도) |
| `strict-merge-mode-bypass-for-merge-gen.md` | task | gen-058에서 consumed (별도) |

`daemon-e2e-tests.md`의 status 확인 필요 — 만약 아직 pending이면 본 generation의 commit phase에서 함께 consume 처리하지는 않는다 (본 generation goal이 다르므로 out of scope). 이 부분은 별도 cleanup이거나, daemon-e2e-tests.md가 이미 consumed라면 무시.

## Technical Deep-Dive

### early-close의 의미론적 위치

abort vs completion vs early-close 매트릭스:

| 항목 | abort | early-close | completion |
|---|---|---|---|
| 의미 | 실패/취소 | 부분 완성 종료 | 정상 완료 |
| artifacts 보존 | X (rm) | O (lineage) | O (lineage) |
| source 변경 | rollback/stash/hold/none 선택 | 기본 hold | 기본 보존 |
| consumed backlog | revert → pending | 그대로 consumed 유지 | 그대로 consumed 유지 |
| lineage 기록 | X | O (status: partial) | O (status: completed) |
| reflect | X | O (interactive) | O |
| fitness | X | **skip** | O |
| adapt | X | **skip** | O |
| commit (git) | X | O ([early-close] 표시) | O |
| next gen hint | (none) | deferred backlog 안내 | gap-driven 제안 |
| 호출 가능 stage | 모든 stage | implementation, validation | validation (자연 흐름) |

### deferred backlog 자동 승계 로직

`03-implementation.md`에는 일반적으로 task 목록이 있다 (e.g. checkbox `- [ ]`, `- [x]`). 미완료(`- [ ]`) 항목만 추출하여 새 backlog 파일을 만든다.

문제: implementation artifact의 task 표기 형식이 자유롭다. checkbox가 없을 수도 있고, "Tasks" 섹션이 없을 수도 있다.

**제안 처리 방식**:
1. 03-implementation.md 전체를 읽음
2. `- [ ]` 패턴을 정규식으로 추출 (Pattern: `/^- \[ \]\s+(.+)$/m`)
3. 추출된 항목이 0개면 → "체크박스 형식 task 없음. 사용자에게 무엇이 deferred인지 직접 물어 backlog 본문 작성 유도" prompt 노출
4. 추출된 항목이 있으면 → 자동으로 새 backlog 파일 작성, 사용자에게 "다음 항목들이 deferred로 승계됩니다. 수정/추가하시겠습니까?" 확인

→ **planning에서 더 자세히 설계**. learning 단계에서는 "이 경계가 있음을 인지" 정도.

### Interactive reflect의 구현 방식

`completion.ts`의 reflect phase는 prompt만 emit하고 사용자/agent가 artifact를 채워 넣는 구조. early-close의 reflect도 동일한 emitOutput(status: "prompt") 방식으로 처리 가능. 다만 prompt 내용이 다름:

- completion reflect: "Summary, Lessons Learned, Next Generation Hints 채우기" + memory 갱신
- early-close reflect: "어디까지 진행됐고(completed tasks), 무엇이 가치 있었고(value preserved), 무엇이 남았는지(deferred), 왜 닫는지(closeReason) 사용자에게 물으며 채우기"

reflect는 agent가 사용자 응답을 기반으로 채우는 단계이므로, prompt에 "user에게 직접 묻고 응답에 따라 작성" 지시문이 들어가야 함.

### Next generation hint 노출

`start.ts`의 `scan` phase (또는 `create` 직후)에서:
- 직전 lineage entry의 meta.yml에 `status: partial` 이고 `deferredBacklogFile` 존재하면
- emitOutput context에 `previousEarlyClose: { id, deferredBacklogFile }` 포함
- prompt에 "이전 generation이 조기 종료되었습니다. deferred backlog를 이어서 진행하시겠어요?" 추가

scan phase가 backlog scan 후 prompt를 내보내므로, 그 prompt에 hint를 추가하면 됨. lineage 마지막 entry meta.yml 파싱 로직 신규 필요.

### Agent behavior — 중단 의도 표명 시 세 선택지 자동 제시

`reap-guide.md` 에 "사용자가 중단/포기/스코프 축소 의도 표명 시 agent는 abort/early-close/continue 세 선택지 제시" 절을 추가. 이는 코드가 아닌 prompt-driven behavior. agent prompt(`buildBasePrompt` → reap-guide 주입)가 이 가이드를 읽고 따른다.

trigger keywords (한국어): "그만", "중단", "포기", "스코프 줄이고 싶어", "취소" 등. 영어도 함께 (stop, abort, give up, reduce scope, cancel).

### abort confirm phase에서 early-close 옵션 노출

`abort.ts`의 confirm phase prompt를 수정하여, "abort 외에도 early-close 옵션이 있음을 안내" 문구 추가. 사용자가 진짜 의도가 early-close인 경우 `reap run early-close --reason "..."` 으로 분기 가능.

## Clarity Level

**High clarity.**

- vision/goals.md에 명시적 목표 존재 (Evaluator Agent, Self-Hosting 등)는 본 generation과 직접 관련은 없지만, **본 generation의 goal은 source backlog `early-close-lifecycle.md`에 매우 구체적으로 정의됨** — 설계 결정 표, 13개 verification 기준, out of scope 명시까지 모두 완비.
- 사용자와 2026-05-24 세션에서 모든 핵심 결정 완료.
- 호출 가능 stage, reflect 방식, fitness/adapt skip 여부, hint 노출, abort 분기까지 합의.
- → planning에서 추가 인터랙션 최소화, 실행 중심으로 진행 가능.

다만 다음은 planning에서 명시적으로 결정해야 함:
1. **deferred task 추출 로직**: implementation artifact의 task 표기 형식에 따라 자동 추출 vs 사용자 입력. 기본은 정규식 추출 + 사용자 확인.
2. **lineage status 표기 위치**: meta.yml의 top-level `status` 필드인지, `closeMeta:` 서브 객체인지. — meta.yml 기존 구조와의 일관성 (top-level은 id/type/goal/parents/timeline/fitnessFeedback). `closeMeta` 객체로 묶는 게 깔끔.
3. **commit 메시지 패턴**: `feat({gen-id-short}) [early-close]: {goal}` 형식? 또는 `chore({gen-id-short}) [early-close]: {goal}`? feat은 어색하므로 `chore` 추천. → planning에서 사용자 확인.
4. **테스트 케이스 우선순위**: 13개 verification 항목 전부를 e2e로 다 검증할지, 일부는 unit으로 분할할지. → planning에서 분배.

## Context for This Generation

### 작업 가정

- **Embryo 유지**: gen-060 fitness에서도 embryo 유지 결정. genome 변경 자유롭지만 invariants는 절대 위반 금지.
- **본 작업은 code change 위주** — genome 변경은 reap-guide에 agent behavior 가이드 추가 정도. application.md/evolution.md는 변경 불필요로 예상.
- **테스트는 tests/ submodule에 추가**. 커밋 시 submodule commit → parent submodule pointer 업데이트 순서 준수.
- **stale build 방지**: src 수정 후 `npm run build` 매번 실행.

### 영향 받는 파일 (예상)

신규:
- `src/cli/commands/run/early-close.ts`
- `src/adapters/claude-code/skills/reap.early-close.md`
- `tests/unit/early-close.test.ts`
- `tests/e2e/early-close.test.ts`

수정:
- `src/cli/index.ts` (`--defer-tasks` 옵션 추가, early-close stage 라우팅)
- `src/cli/commands/run/index.ts` (STAGE_HANDLERS 등록, extra 직렬화)
- `src/cli/commands/run/abort.ts` (confirm prompt에 early-close 안내 추가)
- `src/cli/commands/run/start.ts` (scan/create 시 previous early-close 감지 + hint)
- `src/core/archive.ts` 또는 신규 helper (status/closeMeta 지원)
- `src/core/backlog.ts` 또는 신규 helper (`createDeferredBacklog`)
- `src/templates/reap-guide.md` (agent behavior 가이드 추가)
- `src/templates/claude-md-section.md` (사용자 안내 추가)
- `.reap/reap-guide.md` (dog-fooding 동기화)
- `README.md` (사용자 문서 — 종료 path 비교 필요 시)

### Risks / 주의사항

1. **abort.ts confirm prompt 변경이 abort.test.ts e2e 테스트를 깨뜨릴 수 있음** — 사용자 안내 텍스트를 검증하는 테스트가 있는지 확인 후 함께 갱신.
2. **archive 함수 시그니처 변경이 completion commit phase에 회귀를 일으킬 수 있음** — `archiveGeneration`을 확장하기보다 별도 함수 (`archiveEarlyClose` 등)로 분리하거나, 옵션 객체 형태로 확장하는 게 안전.
3. **deferred backlog 파일명 충돌**: `deferred-{gen-id}-{slug}.md` 에서 slug가 goal 기반인데 동일 goal이 반복되면 충돌 가능 → gen-id가 unique하므로 실제로는 충돌 없음.
4. **early-close가 learning/planning에서 호출 시 동작**: backlog에 "implementation, validation에서만 호출 가능"으로 명시. learning/planning에서 호출 시 emitError로 abort 권유.
5. **strict mode (config.strictEdit/strictMerge)와의 상호작용**: 우선은 early-close가 strict 검사 영향 없음 (lifecycle 외부 path). 추후 발견되면 별도 처리.

### 결정 트리거

- planning artifact에서 모든 file change 목록을 명시할 것.
- implementation은 코드 → 빌드 → 테스트 → 문서 동기화 순.
- validation에서 13개 verification 기준 전부 체크.
- completion reflect에서 memory(shortterm 필수, midterm은 lifecycle path 확장 맥락이라 갱신 권장) 갱신.
