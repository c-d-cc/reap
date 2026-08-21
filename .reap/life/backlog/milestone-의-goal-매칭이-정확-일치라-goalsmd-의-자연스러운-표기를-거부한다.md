---
type: task
status: pending
priority: medium
createdAt: 2026-08-21T00:00:00.000Z
---

# milestone 의 goal 매칭이 정확 일치라 goals.md 의 자연스러운 표기를 거부한다

## Problem

`validateForMain` 은 milestone 의 `goal:` 이 `goals.md` 의 **항목 제목 또는 섹션 이름과 정확히
일치**할 것을 요구한다(공백 축약·대소문자 무시만 허용). gen-097 이 첫 milestone 을 만들자마자
그 자리에서 걸렸다:

```
goals.md:   - [ ] **배포 형태를 사용자 도구로 인식되게 한다** — 지금 REAP 은 …
milestone:  goal: 배포 형태를 사용자 도구로 인식되게 한다
→ error | goal '…' matches no item or section in vision/goals.md
```

**거부 자체는 옳다** — 존재하지 않는 goal 을 가리키는 milestone 을 막는 것이 그 검사의 목적이고,
에러 메시지가 알려진 항목을 나열해 복구가 복사-붙여넣기 한 번이다.

문제는 **goals.md 의 관행적 표기가 정확 일치와 어긋난다**는 것이다. 이 저장소의 기존 항목만 봐도:

```
- [x] Fitness 위임: evaluator 1차 평가 → 인간 에스컬레이션 (gen-066 validation + gen-067 …)
- [x] OpenCode adapter (gen-063~064 완료 — opencode.json + plugin + AGENTS.md + …)
```

강조 표시(`**`), 대시 뒤 설명, 괄호 안 이력이 제목의 일부다. milestone 의 `goal:` 에 그 전문을
옮겨 적게 하는 것은 **같은 사실을 두 곳이 아는 상태**를 만든다 — goals.md 를 손보면 조용히 어긋난다.

gen-097 은 goals.md 쪽을 고쳐서(제목을 짧게, 설명을 HTML 주석으로) 넘어갔다. **그것이 옳은
방향인지가 이 backlog 의 질문이다.**

## Solution

세 갈래이고 **어느 것이든 근거가 필요하다**:

1. **매칭을 넓힌다** — 마크다운 강조 제거 + ` — ` 앞부분까지 허용. 결정적이고 좁지만
   **휴리스틱이 하나 늘어난다.** 넓힐 때마다 "어느 값이 이 단언을 만족하면서 틀렸는가"를 물을 것
2. **goals.md 표기 규약을 세운다** — 제목은 짧게, 설명은 다음 줄. genome 에 명문화하고
   `fix --check` 가 위반을 경고. 그러면 매칭은 그대로 두어도 된다
3. **참조를 제목이 아닌 것으로 바꾼다** — goals.md 항목에 안정된 id 를 부여. 가장 견고하지만
   **사용자가 손으로 쓰는 문서에 id 를 요구**하게 된다

## Files to Change

- `src/core/milestone.ts` — `validateForMain` 의 `normalize` (1안)
- `src/core/vision.ts` — `goalIdentifiers` (1·3안)
- `src/core/integrity.ts` — goals.md 표기 검사 (2안)
- `.reap/genome/evolution.md` + `src/templates/evolution.md` — 규약 (2안)
- tests: 어느 안이든 **"넓힌 매칭이 잘못된 goal 을 집지 않는가"** 를 negative 로 확인할 것

## 판단 메모

- **지금 급하지 않다.** 에러 메시지가 알려진 항목을 나열하므로 사용자가 막히지 않는다
- **v0.18 의 "지식 축 경계 통합 설계" 세대에서 함께 보는 것이 자연스럽다** — plan·idea 도 goal 을
  참조하게 되면 같은 문제를 세 번 풀게 된다. 참조 방식을 한 번에 정하는 편이 낫다
