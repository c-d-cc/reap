---
type: task
status: consumed
priority: medium
createdAt: 2026-07-26T03:48:58.222Z
consumedBy: gen-075-c791fb
consumedAt: 2026-07-26T07:11:02.859Z
---

# genome line threshold(100) 가 배포 템플릿(evolution.md 175줄)보다 작아 신규 init 이 즉시 warning

## Problem

`GENOME_LINE_WARNING_THRESHOLD = 100` (`src/core/integrity.ts:21`) 이 REAP 자신이 배포하는 genome 템플릿보다 작다.

```
src/templates/evolution.md : 175 lines (gen-072 이후. 이전에도 146 lines)
GENOME_LINE_WARNING_THRESHOLD : 100
```

`initCommon` (`init/common.ts:79-80`) 이 이 템플릿을 그대로 `.reap/genome/evolution.md` 로 복사하므로, **`reap init` 직후 첫 `reap fix --check` 에서 아무 잘못도 하지 않은 사용자가 warning 을 받는다**:

```
genome/evolution.md: 175 lines (exceeds ~100 line guideline)
```

gen-072 에서 발견 (memory size warning e2e 작성 중, 대조군 테스트가 이 warning 에 걸림). **gen-072 이전부터 존재한 문제** — 템플릿이 146줄이던 시점에도 이미 초과였다. gen-072 는 +29줄로 악화시켰을 뿐 원인이 아니다.

## 왜 문제인가

- **첫인상 훼손**: 진단 도구가 초기 상태를 결함으로 보고한다. 사용자는 자기 잘못인 줄 알고 genome 을 줄이려 시도할 수 있다
- **경고 무감각(warning fatigue)**: 항상 떠 있는 warning 은 읽히지 않는다. 진짜 비대해진 genome 을 잡아야 할 때 신호가 묻힌다
- **자기모순**: REAP 이 "100줄 가이드라인"을 제시하면서 자신은 175줄을 배포한다

## 판단이 필요한 지점

threshold 를 올릴지, 템플릿을 줄일지, 검사 방식을 바꿀지가 갈린다. 세 방향 모두 일리가 있다:

- **A. threshold 상향** — 배포 템플릿보다 크게(예: 200). 가장 단순하나 "그럼 100 은 무슨 근거였나"가 남는다. 그리고 사용자가 덧붙이면 다시 초과한다
- **B. 템플릿 축소** — genome 은 매 세션 auto-load 되므로 작을수록 좋다는 논거가 있다. 그러나 gen-072 가 늘린 29줄은 pruning 정책이라 필수 내용이고, 줄이면 issue #21 이 되돌아온다
- **C. 기준선 대비 측정** — "배포 템플릿 대비 얼마나 커졌는가"로 판정. 사용자가 추가한 분량만 본다는 점에서 의미론적으로 가장 정확하나 구현이 복잡하다 (템플릿 버전별 기준선 필요)
- **D. genome 파일별 개별 threshold** — application/evolution/invariants 는 성격이 다르다. invariants 는 짧아야 맞고 evolution 은 규칙 집합이라 길 수밖에 없다

**gen-072 의 memory threshold 설계 참고**: `MEMORY_LINE_WARNING_THRESHOLDS` 는 guide 에 문서화된 범위의 상한을 채택했다 (longterm 50 = "30~50" 의 상한). genome 도 같은 방식으로 "문서화된 근거"를 먼저 정하고 그로부터 수치를 도출하는 것이 일관적이다. 현재 100 은 근거가 코드에도 문서에도 없다.

## Files to Change

- `src/core/integrity.ts` — L21 `GENOME_LINE_WARNING_THRESHOLD`, L482 인근 `checkGenome` 판정부
- (방향 D 채택 시) 파일별 threshold 맵 — gen-072 의 `MEMORY_LINE_WARNING_THRESHOLDS` 패턴 재사용
- (방향 B 채택 시) `src/templates/evolution.md`
- `tests/unit/integrity.test.ts` — 기존 genome 크기 케이스
- `tests/e2e/fix-memory-warning.test.ts` — "stays quiet" 케이스의 필터가 현재 genome warning 을 의도적으로 제외 중. 본 건 해결 시 그 예외를 **제거**할 수 있다 (제거 여부가 해결 확인 지표)

## Verification

1. `reap init` 직후 `reap fix --check` → genome 관련 크기 warning **없음**
2. 사용자가 evolution.md 를 크게 늘린 상태 → warning **있음** (검사가 무력화되지 않았는지)
3. `tests/e2e/fix-memory-warning.test.ts` 의 "stays quiet" 필터에서 genome 예외 주석 제거 후에도 통과
4. threshold 근거가 코드 주석 또는 guide 에 문서화됨

## Open Decisions

- [ ] A/B/C/D 중 방향 선택
- [ ] threshold 의 근거를 어디에 문서화할 것인가 (reap-guide.md § genome? 코드 주석?)
- [ ] `application.md` (본 repo 기준 확인 필요) 도 초과 상태인지 — 초과라면 방향 D 의 근거가 강해진다
