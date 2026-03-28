# Learning

> Nonce 시스템을 transition graph 기반 multi-nonce로 리팩토링하여 evaluator agent 도입을 위한 기반 마련

## Project Overview

REAP v0.16.4, gen-050. 474 tests passing. Evaluator agent 도입을 위한 nonce 시스템 리팩토링이 이번 generation의 목표. 설계 문서(`vision/design/evaluator-agent.md`)에서 합의된 방향을 구현으로 옮기는 첫 단계.

## Key Findings

### 현재 Nonce 시스템 구조

**핵심 파일 4개**:
- `src/core/nonce.ts` — `generateToken()`, `verifyToken()` (순수 암호학 함수, 26줄)
- `src/core/stage-transition.ts` — `verifyNonce()`, `setNonce()`, `verifyBackNonce()`, `performTransition()` (219줄)
- `src/core/lifecycle.ts` — `nextStage()`, `prevStage()` + merge 대응 (26줄)
- `src/core/generation.ts` — `create()`, `createMerge()` 에서 초기 nonce 발행

**현재 상태 필드** (`GenerationState` in `src/types/index.ts`):
```
lastNonce, expectedHash, phase           — forward nonce (1개)
backNonce, backExpectedHash, backTarget, backTargetPhase — back nonce (1개)
```

**현재 동작 방식**:
1. `setNonce(state, stage, phase)` → forward nonce 1개 + back nonce 1개(이전 stage entry) 발행
2. `verifyNonce(command, state, stage, phase)` → forward nonce 소비 (1회성)
3. `verifyBackNonce(command, state)` → back nonce 소비, target stage로 이동 후 새 forward+back 발행
4. 각 stage command가 entry에서 verify, work 후 setNonce(complete), complete에서 verify 후 다음 stage entry nonce 발행

**한계점** (설계 문서와 일치):
- Forward 1개 + back 1개만 가능 → self-loop(validation 실패 후 재진입) 불가
- 허용 전이가 코드에 하드코딩 (각 command 파일에서 직접 다음 stage를 지정)
- Completion의 fitness phase에서 `setNonce(s, "completion", "fitness")`로 자기 자신에게 재발행하는 workaround 존재 (line 132)

### Transition 패턴 분석

현재 implicit transition graph (코드에서 추출):

**Normal lifecycle**:
```
learning:entry → learning:complete → planning:entry → planning:complete →
implementation:entry → implementation:complete → validation:entry →
validation:complete → completion:entry → completion:fitness →
completion:adapt → completion:commit (terminal)
```

**Completion fitness 특수 케이스**: feedback 없이 호출 시 같은 nonce를 재발행 (verify 후 재set). 이건 "같은 phase를 두 번 진입"하는 셀프 루프의 workaround.

**Back transitions**: 각 stage에서 이전 stage entry로만 가능 (1단계 회귀).

### 영향받는 Command 파일들 (13개)

`src/cli/commands/run/` 하위:
- learning.ts, planning.ts, implementation.ts, validation.ts, completion.ts — normal lifecycle (5)
- detect.ts, mate.ts, merge.ts, reconcile.ts — merge lifecycle (4)
- back.ts — back nonce 소비 (1)
- start.ts — 초기 nonce 발행 (1)
- evolve.ts — 직접 nonce 사용 안 함 (0)
- abort.ts — nonce 무관 (0)

### 기존 테스트

- `tests/unit/nonce.test.ts` — generateToken/verifyToken 순수 함수 테스트 (5개)
- `tests/unit/stage-transition.test.ts` — setNonce, verifyBackNonce 통합 테스트 (8개)

## Previous Generation Reference

gen-049: auto issue report 기능 구현. 474 tests passing. Fitness: ok. 이번 작업과 직접 연관 없음.

## Technical Deep-Dive

### 설계 문서 대비 추가 발견 사항

1. **Completion fitness self-loop**: 설계 문서의 transition graph에서 `completion:fitness → validation:entry` 경로가 있는데, 현재 코드에서는 구현되어 있지 않음. Completion fitness에서 validation으로 돌아가는 건 없고, 같은 fitness phase를 재실행하는 패턴만 존재.

2. **Merge lifecycle**: 설계 문서에서는 normal lifecycle만 다루고 있음. Merge lifecycle의 transition graph도 정의 필요.

3. **performTransition()과 performMergeTransition()**: 이 함수들은 stage를 직접 변경하고 timeline을 기록하지만 nonce를 발행하지 않음. 호출 측(각 command)이 nonce를 별도로 발행. 리팩토링 시 이 분리를 유지할지 통합할지 결정 필요.

4. **`lifecycle.ts`의 역할 변화**: 현재는 next/prev 순서만 제공. 리팩토링 후에는 transition graph 자체를 정의하는 핵심 모듈이 됨.

### 질문/결정 포인트

**Q1: Transition graph를 어디에 정의할 것인가?**
- Option A: `lifecycle.ts`에 graph 정의 + lookup 함수 (설계 문서 제안)
- Option B: 새 파일 `transition-graph.ts` 분리
- 제안: Option A — lifecycle.ts가 이미 stage 순서를 담당하므로 자연스러운 확장

**Q2: `pendingTransitions` map의 키 형식?**
- 설계 문서: `"planning:entry"` 등 `stage:phase` 문자열
- 이 형식으로 진행하는 게 직관적. 기존 nonce 해시의 input format(`nonce + genId + stage:phase`)과도 일관됨.

**Q3: Merge lifecycle transition graph는?**
- 설계 문서에 없으므로 별도 정의 필요
- Normal과 같은 패턴: 각 stage가 entry/complete를 갖고, complete에서 다음 stage entry로 전이

**Q4: 하위 호환성?**
- 진행 중인 generation(현재 gen-050 자신)이 있을 수 있음
- 기존 `lastNonce`/`backNonce` 필드를 가진 state를 `pendingTransitions`로 변환하는 migration 필요?
- Embryo이므로 간단히 처리 가능: 이번 generation 완료 후 다음 generation부터 새 형식 적용

## Context for This Generation

- **Clarity: MEDIUM** — 설계 문서가 있어 방향은 명확하지만, merge lifecycle graph, 하위 호환성, performTransition 통합 여부 등 세부 결정이 남아있음
- **Embryo**: genome 수정 자유. application.md의 Nonce System 섹션 업데이트 필요
- **범위 제한**: 이번 generation은 nonce 리팩토링만. Evaluator agent 자체 구현은 다음 generation
- **테스트 전략**: nonce.test.ts는 거의 변경 불필요(순수 함수), stage-transition.test.ts는 전면 재작성, 새로운 transition graph 테스트 추가 필요
