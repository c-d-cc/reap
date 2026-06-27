---
type: task
status: consumed
priority: medium
createdAt: 2026-06-27T13:38:01.935Z
consumedBy: gen-070-828bad
consumedAt: 2026-06-27T14:47:40.593Z
---

# vision memory 구조 개선 — 분류 기준 명확화 + 자동 pruning

## Problem

현재 3-tier memory 구조(shortterm / midterm / longterm)에 두 가지 근본 문제가 있다.

### 1. 분류 기준이 AI에게 불명확

tier 구분 기준이 "얼마나 오래 쓸 것인가?"(time-based)인데, AI는 미래를 모른다. 결과:
- shortterm에 써야 할 내용이 longterm에 들어가거나, 반대 케이스 발생
- AI가 tier를 결정할 때마다 추론이 필요 → 오분류 누적
- 현재 longterm이 35개 섹션(255줄), midterm 19개 섹션(134줄)으로 비대화

### 2. pruning 메커니즘 없음

memory는 오직 누적만 된다. 삭제/만료 로직이 없다:
- 완료된 large task 맥락(예: OpenCode adapter gen-063~064)이 midterm에 그대로 잔존
- "다음 세션 핸드오프"(shortterm)가 이전 것들 위에 계속 쌓임
- generation이 69개를 넘은 지금, 초기 context(v0.15→v0.16 전환 등)가 여전히 longterm 상단 차지
- agent가 memory를 읽을 때 실제로 필요한 내용과 stale한 내용을 구분할 수 없음

## Solution

### 핵심 방향: time-based tier → content-type-based tier

tier를 "언제까지 쓸 것인가"가 아닌 "무엇을 위한 내용인가"로 재정의.

### 새 3-tier 구조 (파일명 유지, 내용 의미 재정의)

| 파일 | 새 역할 | 기준 |
|------|---------|------|
| `shortterm.md` | **Session handoff** — 다음 세션에 넘겨야 할 즉각적 맥락 | "지금 당장 필요한가?" Yes → shortterm |
| `midterm.md` | **Ongoing tracks** — 현재 진행 중인 멀티-generation 작업 | "아직 완료 안 된 큰 트랙인가?" Yes → midterm |
| `longterm.md` | **Design lessons** — 반복 참조할 설계 교훈, 결정 배경 | "이 교훈이 미래 generation에서도 같은 실수를 막는가?" Yes → longterm |

**핵심 판단 기준 (AI용 decision tree)**:
```
이 내용이 다음 세션에서 즉시 필요한가?
  → Yes: shortterm

아직 완료되지 않은 진행 중인 트랙/계획인가?
  → Yes: midterm

완료됐지만 설계 교훈으로 남겨야 하는가?
  → Yes: longterm

완료됐고 특별한 교훈도 없는가?
  → 삭제 (memory에 보관 불필요)
```

### Pruning 정책 (reflect phase 의무화)

**shortterm** — 매 generation reflect phase에서:
- 이전 세션 핸드오프 항목 중 "이미 처리됨"인 것은 삭제
- 새 세션 핸드오프만 남김
- 규칙: shortterm은 최근 1~2 generation의 내용만 유지

**midterm** — 트랙 완료 시:
- 완료된 트랙은 핵심 결정만 longterm으로 "승격" 후 midterm에서 삭제
- 예: OpenCode adapter 트랙 → "adapter dispatch 패턴" 교훈만 longterm에 이미 있음 → midterm에서 전체 섹션 삭제 가능
- 기준: "이 트랙의 다음 step이 있는가?" No → 삭제

**longterm** — 주기적 정리 (10 generation마다 권장):
- 섹션이 genome에 이미 명문화됐으면 중복 → longterm에서 삭제
- 프로젝트 초기 전환 맥락(v0.15→v0.16 차이 등)은 69 generation이 지난 지금 더 이상 행동 지침이 아님 → 삭제
- 판단 기준: "이 교훈이 없으면 다음 agent가 같은 실수를 할 것인가?" No → 삭제

### 즉시 적용 가능한 1회성 cleanup

이번 generation에서 기존 memory 파일을 위 기준으로 일괄 정리:

**longterm에서 삭제 후보**:
- "프로젝트 기원과 방향" — 역사적 맥락, 행동 지침 아님
- "v0.15 → v0.16 명시적 차이" — 전환 완료, 더 이상 참조 불필요
- genome에 이미 명문화된 교훈의 중복 설명

**midterm에서 삭제 후보**:
- OpenCode adapter 완료 섹션 (gen-063~064 완료 → longterm에 교훈 이미 있음)
- Knowledge Loading 분리 섹션 (gen-062 완료 → genome에 명문화)
- Lifecycle Termination Paths (gen-061 완료 → genome에 명문화)
- Evaluator Agent 트랙 — fitness/cruise까지 완료, Vision/Goal 위임만 남음 → 해당 부분만 남기고 완료 항목 삭제

**shortterm** — 다음 generation 핸드오프만 남기고 이전 세션 내용 교체

### reap-guide.md + evolution.md 갱신

- `evolution.md` Memory 갱신 Criteria 절 업데이트 — 새 판단 기준(content-type decision tree) 반영
- `src/templates/reap-guide.md` 동기화
- `.reap/reap-guide.md` 동기화

## Files to Change

**Memory 파일 (내용 재구성)**:
- `.reap/vision/memory/longterm.md` — stale 섹션 제거, 교훈 정제
- `.reap/vision/memory/midterm.md` — 완료 트랙 제거, 진행 중인 것만 유지
- `.reap/vision/memory/shortterm.md` — 최신 핸드오프로 교체

**가이드 문서 (분류 기준 명확화)**:
- `.reap/genome/evolution.md` — Memory 갱신 Criteria 절 개선 (decision tree 추가)
- `src/templates/reap-guide.md` — Memory 섹션 Rules 업데이트
- `.reap/reap-guide.md` — 동기화
- `~/.reap/reap-guide.md` — 동기화

## 완료 기준

- longterm.md: 30줄 이하로 축소 (현재 255줄 → 핵심 교훈만)
- midterm.md: 완료된 트랙 제거, 진행 중인 것만 (현재 134줄 → 50줄 이하 목표)
- evolution.md Memory 절에 content-type decision tree 명시
- reflect phase 가이드에 "shortterm cleanup 의무" 명시
- 다음 generation agent가 shortterm만 읽어도 "지금 뭘 해야 하는지" 명확히 알 수 있는 상태
