---
title: early-close lifecycle path — generation 조기 종료 + 부분 가치 보존
priority: medium
created: 2026-05-24
resolves: 16
issueUrl: https://github.com/c-d-cc/reap/issues/16
status: consumed
consumedBy: gen-061-386e6c
consumedAt: 2026-05-24T13:51:46+09:00
---

## 배경

현재 generation에는 두 가지 종료 path만 존재한다:

- **abort**: "이번 generation 실패/취소" — `life/` 전체 삭제, reflect/fitness/lineage 모두 skip
- **completion**: 모든 phase(reflect → fitness → adapt → commit) 강제 통과

implementation 단계에서 scope 축소가 필요한 시나리오(예: Issue #16의 gen-004 POML 통합 사례)에는 두 옵션 모두 부적절하다. abort는 "실패"의 의미가 너무 강해 부분적으로 완성된 가치를 버리게 되고, completion은 모든 phase를 강제하는 heavyweight path여서 빠른 다음 세대 전환을 막는다.

## 합의된 방향 (Issue #16 + 2026-05-24 세션 결정)

**중간 path로 `early-close` 도입.** abort/completion과 명확히 구분되는 세 번째 lifecycle 종료 방식.

| 항목 | 방향 |
|---|---|
| 이름 | `early-close` (조기 종료) — abort의 "취소" 의미와 분리 |
| 취지 | 부분 완성된 가치만 빠르게 반영하고 다음 세대로 |
| 무게 | **light** — completion의 모든 phase 강제 통과하지 않음 |
| 가치 보존 | 소스 변경 + 부분 진행 + lineage 흔적 모두 살아남게 |
| 다음 세대 트리거 | 미완 작업 자동 backlog 승계 → 다음 generation이 자연스럽게 잇게 |

## 구현 범위 (full implementation)

### 1. CLI 명령 + Slash command

- **CLI**: `reap run early-close` 신규 추가
- **Slash command**: `/reap.early-close` 신규 추가 (사용자 진입점)
- 호출 가능 stage: **implementation, validation** (learning/planning에서는 abort가 적합)
- 옵션:
  - `--reason <reason>` (필수) — 왜 조기 종료하는지
  - `--source-action <hold|stash|none>` — 기본값 `hold` (소스 변경 유지가 early-close의 핵심)
  - `--defer-tasks` — 미완 작업을 backlog로 자동 승계 (기본 true)

### 2. 진입점 UX — 중단 의도 표명 시 선택지 제공

사용자가 early-close라는 개념을 모를 수 있으므로, "중단" 의도를 보이면 옵션을 명확히 안내한다.

**두 단계 진입점**:

- **(a) AI agent behavior** (reap-guide 반영): generation 진행 중 사용자가 "그만", "중단", "포기", "스코프 줄이고 싶어" 같은 의도를 표명하면, agent는 자동으로 다음 세 선택지를 제시한다:
  - **abort**: "이번 generation 자체를 취소 (실패 처리, 부분 진행은 backlog로 옵션)"
  - **early-close**: "지금까지 한 만큼만 반영하고 닫고 다음 세대로 (lightweight, 부분 가치 보존)"
  - **continue completion**: "끝까지 가서 정식 완료"

- **(b) CLI 단**: `reap run abort`의 confirm phase에서도 early-close 옵션을 함께 노출. 사용자가 abort라고 입력했지만 진짜 의도는 early-close일 수 있음.

### 3. Lifecycle 처리

- 현재 stage에서 사용 가능한 artifact만 활용:
  - `01-learning.md`, `02-planning.md`는 그대로 보존
  - `03-implementation.md`의 완료/미완료 task 자동 분리
- **reflect**: **사용자와 interactive로 진행** — 자동 판단 안 함. "어디까지 진행됐고, 무엇이 가치 있었고, 무엇이 남았는지"를 사용자에게 물으며 채움 (자동 추출은 starting point로만, 최종 내용은 사용자 응답 기반)
- **fitness**: **skip** — early-close는 정상 종료 패턴이 아니므로 fitness 평가 자체를 건너뜀 (`05-completion.md`에 fitness 섹션 없거나 "skipped: early-close" 표기)
- **adapt skip**: genome 변경은 보통 큰 작업의 결과 — early-close에서는 변경 안 함
- **commit**: 소스/artifact는 그대로 commit (gen-XXX 형식 commit message에 `[early-close]` 표시)

### 4. Lineage 기록

- 새 status: `partial` (기존 `completed` / `aborted`과 구분)
- lineage entry에 다음 메타데이터:
  - `closeReason`: 사용자 입력 reason
  - `closedAtStage`: implementation 또는 validation
  - `completedTasks` / `deferredTasks` 수
  - `deferredBacklogFile`: 자동 승계된 backlog 파일 경로

### 5. Backlog 자동 승계 + 다음 세대 hint

- `03-implementation.md`의 task 목록에서 미완료(`- [ ]`) 항목을 자동 추출
- 새 backlog 파일 생성: `.reap/life/backlog/deferred-{gen-id}-{slug}.md`
- frontmatter에 `derivedFrom: {gen-id}` 명시
- **Next generation hint**: 새 generation `start` 시 직전 generation이 early-close였으면 안내 메시지 노출 — "이전 generation(`{gen-id}`)이 조기 종료되었습니다. deferred backlog `{filename}`을 이어서 진행하시겠어요?"

### 6. 테스트

- **Unit**:
  - early-close 명령 옵션 파싱
  - artifact 보존/분리 로직
  - backlog 자동 승계 로직
  - lineage status `partial` 기록
  - next generation hint 노출 로직
- **E2E**:
  - learning → planning → implementation 진행 → early-close → lineage 검증
  - validation 단계에서 early-close
  - `--defer-tasks=false`로 호출 시 backlog 미생성 확인
  - early-close 후 새 generation 시작 시 hint 노출 확인
  - abort vs early-close vs completion 명확한 분기 검증
  - abort confirm phase에서 early-close 옵션 노출 확인

### 7. 문서 업데이트

- `src/templates/reap-guide.md`:
  - lifecycle 섹션에 early-close path 추가
  - **Agent behavior 가이드 추가**: "사용자가 중단 의도 표명 시 abort/early-close/continue 세 선택지 제시"
- `src/templates/claude-md-section.md`: 사용자 안내에 early-close 언급
- README / docs: 새 명령 표기
- abort 명령의 안내 메시지에 "scope만 줄이려면 early-close 고려" 힌트 추가
- 슬래시 command 파일: `src/adapters/claude-code/skills/reap.early-close.md` 신규

## 확정된 설계 결정 (2026-05-24 세션)

| 결정 항목 | 결정 |
|---|---|
| slash command | **추가** — `/reap.early-close` 신규 |
| reflect 깊이 | **사용자 interactive** — 자동 판단 X. agent가 사용자에게 물으며 채움 |
| fitness 처리 | **skip** — 정상 종료 패턴 아니므로 평가 자체 건너뜀 |
| next generation hint | **추가** — 다음 generation start 시 직전이 early-close였으면 deferred backlog 안내 |
| 사용자 진입점 | **세 선택지 자동 제시** — 사용자가 중단 의도 보이면 abort/early-close/continue 옵션 안내 |

## 작업 외 (out of scope)

- abort 의미론 변경 (abort는 그대로 "실패/취소" 유지)
- completion의 phase 구조 변경 (completion은 그대로 강제 통과)
- merge generation에서의 early-close (별도 검토 필요. 우선은 normal generation만)

## Verification 기준

- [ ] `reap run early-close`가 implementation/validation 단계에서 호출 가능
- [ ] `/reap.early-close` slash command 작동 (claude-code adapter 등록)
- [ ] reflect 단계에서 사용자에게 interactive하게 묻는 prompt 노출
- [ ] fitness 단계 skip (artifact에 "skipped: early-close" 표기)
- [ ] 호출 후 `life/` artifacts(01~03)와 source 변경 모두 보존
- [ ] lineage에 `status: partial` entry 추가
- [ ] 미완료 task가 새 backlog 파일(`deferred-{gen-id}-*.md`)로 자동 승계
- [ ] 새 generation `start` 시 직전이 early-close였으면 deferred backlog hint 노출
- [ ] 사용자가 중단 의도 표명 시 agent가 abort/early-close/continue 세 선택지 제시 (reap-guide 반영)
- [ ] `reap run abort` confirm phase에서도 early-close 옵션 노출
- [ ] abort/completion과 동작 차이가 unit + e2e 테스트로 검증됨
- [ ] reap-guide / claude-md template / docs / slash command 파일 업데이트 반영
- [ ] 기존 abort/completion 동작에 회귀 없음 (전체 테스트 pass)
