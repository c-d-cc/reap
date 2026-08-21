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

### 두 번째 증상 — `## Generations` 의 이어진 줄이 조용히 버려진다

`readGenerations` 는 `- [x]` / `- [ ]` 로 시작하는 줄만 읽는다. 항목을 두 줄로 쓰면
**둘째 줄이 사라진다** — 파일은 멀쩡한데 후보 목록에서 문장이 중간에 끊긴다:

```
파일:   - [ ] plugin 배포 형태 리서치·설계 — A/B 확정. `plugin-distribution.md`
              의 미독 절 3개를 먼저 읽는다
출력:   - plugin 배포 형태 리서치·설계 — A/B 확정. `plugin-distribution.md`
```

**같은 질문의 다른 증상이다** — 파서가 받는 형식이 사람이 자연히 쓰는 것보다 좁다.
gen-097 은 항목을 한 줄로 줄이고 상세를 HTML 주석으로 옮겨 넘어갔다.

## Solution — **ID 체계로 간다 (사용자 결정, 2026-08-21)**

> 이 backlog 는 이제 **`v018-지식-축-정리` milestone 의 첫 generation 인 "참조·ID 체계"의
> seed** 다. 범위가 milestone→goal 하나에서 **참조 전체**로 넓어졌다.

앞서 검토한 셋(매칭 넓히기 / 표기 규약 / ID) 중 **ID 를 채택한다.** 앞의 둘은 기각한다:

- **매칭 넓히기** — 임시 처방이다. 뒤에 ID 로 바꾸면 같은 코드를 두 번 만진다
- **표기 규약** — 사람이 매번 기억해야 한다. genome 이 "반복 누락은 지시가 아니라 검사로
  막는다"고 하는데, 규약은 지시다

**먼저 하는 이유**: 참조 소비자가 곧 셋이 된다 — milestone→goal · memory 의 `from`/`to` ·
idea 의 졸업 경로. 나중에 정하면 셋이 각자 방식을 발명하고, 통일하려면 셋을 동시에 고쳐야 한다.

**경계 설계를 기다리지 않는 이유**: 주소를 가질 대상 목록은 이미 확정돼 있다 —
goals · milestones · design 문서 · backlog · lineage · memory 항목 · idea 항목. 경계 설계가
정하는 것은 *"무엇이 어디로 가는가"* 이고 참조가 묻는 것은 *"무엇이 주소를 갖는가"* 다.

### 설계가 답해야 하는 것 여섯

| | 질문 | 왜 어려운가 |
|---|---|---|
| 1 | **누가 부여하나** | `goals.md` 는 사용자 소유다. REAP 이 쓰면 "사용자 파일을 고쳐 쓰지 않는다"는 경계를 넘고, 사람이 쓰면 고유 ID 를 손으로 만들어야 한다 |
| 2 | **어디 사는가** | 인라인 주석 / 접두사 / frontmatter. `goals.md` 는 **매 세션 `@` import 되는 읽기용 문서**라 잡음이 비용이다 |
| 3 | **무엇이 주소를 갖나** | 위 7종 전부인가 일부인가. 좁히면 memory 의 `to:` 가 못 쓴다 |
| 4 | **고유성은 누가 지키나** | 검사가 필요하다 — **기각한 2안의 검사가 ID 안에도 들어 있다** |
| 5 | **기존 프로젝트** | goals.md 에 ID 가 없다. migration note 로 지시할지, 선택적으로 둘지. **선택적이면 제목 매칭이 폴백으로 남아 메커니즘이 둘이 된다** |
| 6 | **끊어진 참조** | 대상이 삭제되면? `list-carriers --orphans` 와 같은 문제가 되돌아온다 |

**4번과 6번이 핵심이다 — ID 는 참조를 안정시키지만 검사를 없애주지 않는다.** 오히려 고유성
검사가 추가된다. "ID 를 넣었으니 검사가 필요 없다"는 결론에 도달하면 그것이 틀린 신호다.

### 착수 시 규율

- **설계만 하고 끝내지 않는다.** 기존 소비자(milestone→goal)에 실제로 얹어 동작을 확인한다.
  소비자 없는 체계는 검증되지 않는다
- **제목 매칭을 남길지 명시적으로 결정한다.** 남기면 메커니즘이 둘이고, 없애면 기존 프로젝트에
  migration note 가 필요하다. 어느 쪽이든 **선택했다는 사실이 기록돼야** 한다
- `readGenerations` 의 이어진 줄 문제(아래 두 번째 증상)도 같은 세대에서 처리한다

## Files to Change

- `src/core/milestone.ts` — `validateForMain` 의 `normalize` (1안) · `readGenerations` 의
  이어진 줄 처리 (두 번째 증상)
- `src/core/vision.ts` — `goalIdentifiers` (1·3안)
- `src/core/integrity.ts` — goals.md 표기 검사 (2안)
- `.reap/genome/evolution.md` + `src/templates/evolution.md` — 규약 (2안)
- tests: 어느 안이든 **"넓힌 매칭이 잘못된 goal 을 집지 않는가"** 를 negative 로 확인할 것

## 판단 메모

- **제목은 실제로 바뀐다 — 원리적으로가 아니라 관찰된 관행상.** 이 저장소의 goal 은 완료될 때
  괄호 안 이력이 제목에 붙는다: `- [x] OpenCode adapter (gen-063~064 완료 — opencode.json + …)`.
  제목 참조는 그 순간 깨진다
- **`plan` 트랙이 v0.18 에서 빠졌으므로 소비자는 셋이다** (milestone→goal · memory from/to ·
  idea 졸업). `plan` 이 돌아오면 넷이 되며, 그때 체계가 이미 있으면 그냥 쓰면 된다
