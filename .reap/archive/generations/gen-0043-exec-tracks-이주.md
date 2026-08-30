---
id: gen-0043-exec
slug: tracks-이주
type: exec
milestone: ms-010
title: tracks.md를 이주하고 evolve·cleanup이 track을 다룬다
startedAt: 2026-08-23T06:30:39Z
startCommit: 197a4a8
status: closed
closedAt: 2026-08-23T06:35:58Z
endCommit: aa4b465
---
## Intent

`ms-010`의 10.4와 10.5. **`vision/memory/tracks.md`의 다섯을 갈 곳으로 보내고**, `evolve`와 `cleanup`이 track을 다루게 한다.

**끝나는 조건:** `tracks.md`가 사라지고(씨앗·`SEEDS`·`BUNDLED`까지), 다섯이 전부 자기를 규율할 자리에 있고, `evolve`가 track을 언제 열고 언제 안 여는지를 갖고, `cleanup`이 닫힌 track을 내린다.

## 다섯의 갈 곳 — 판단

milestone은 *"물음 셋은 track 파일로, 관측 둘은 갈 곳을 정해서"*라고 적었다. **넷은 그대로고 하나가 다르다.**

| | 항목 | 어디로 | 왜 |
|---|---|---|---|
| 1 | 부트스트랩 마찰 기록 | 쪼개서 셋 | 아래 |
| 2 | 레이아웃을 바꾸면 도구가 죽는다 | `genome/evolution.md` | **관측이 아니라 행동 규칙이다** — "저장 구조를 바꾸는 작업은 코드와 리포를 같은 세대에서 함께 옮긴다" |
| 3 | 결정 로그 규칙이 평범한 구현에서도 서는가 | **track** | 여러 세대에 걸쳐 답이 쌓여야 한다 |
| 4 | `.session` 바인딩 겹침 | **지운다** | `ms-008`이 이미 갖고 있다 — Background·종료조건 7·plan item 9.4 |
| 5 | backlog 묶는 기준이 파일인가 판단인가 | **track** | 표본이 쌓여야 정해진다 |

**4가 milestone의 예상과 다르다.** 물음이지만 **답할 자리가 이미 있다.** track을 또 만들면 같은 물음이 두 곳에 적히고, 그것은 track이 막으려던 것과 정확히 같은 실패다.

**1을 쪼갠다.** "해소됨"은 git이 갖는다. 남은 셋은 각각 다르다 — 바이너리 최신 여부는 `reapdev.localUpdate`가 이미 검증 절차를 갖고, 상대 링크 깊이는 `doctor` 후보라 `ms-006`의 6.4로, 재바인딩 수단은 한 번에 정할 수 있는 것이라 backlog로. **그리고 `genome/evolution.md`의 "마찰을 기록한다"에 목적지를 준다** — 지금은 어디에 적으라는 말이 없어서 이 파일이 생겼다.

## Outcome

**`vision/memory/tracks.md`가 사라졌다** — 파일·씨앗·`SEEDS`·`BUNDLED`·템플릿 테스트·`map.md` 둘까지. `기억:` 줄이 `lessons.md` 하나가 됐다.

**다섯이 각자 규율할 자리로 갔다.**

| 항목 | 갔다 |
|---|---|
| 결정 로그 규칙이 서는가 | `tr-b6f376` — `ms-010`이 낳은 표본 넷을 `Evidence`로 적었다 |
| backlog 묶는 기준 | `tr-418da7` — 표본 둘과 "아직 충돌한 적 없다"를 함께 |
| 레이아웃 바꾸면 도구가 죽는다 | `genome/evolution.md`의 새 절 (행동 규칙) |
| `.session` 바인딩 겹침 | 지웠다 — `ms-008`이 Background·종료조건 7·9.4로 이미 갖는다 |
| 부트스트랩 마찰 셋 | `localUpdate`(이미 있음) · `ms-006`의 6.4(상대 링크) · `bk-52af4d`(재바인딩) |

**`genome/evolution.md`의 "마찰을 기록한다"에 목적지를 줬다** — `make backlog`다. 목적지가 없어서 이 파일이 생겼고, 갈 곳 없는 관측이 모이는 곳이 되어 **실제로는 아무것도 소비되지 않았다.**

**10.5** — `evolve`에 `plan을 골랐다면 track을 볼 차례다` 절, `cleanup`에 `track도 함께 훑는다` 절. `carve-milestone`의 "유보한 답은 `tracks.md`로"와 `complete`의 "`vision/memory/`(`tracks.md`·`lessons.md`)"도 함께 고쳤다.

**검증:** `bun test` 127통과 · `typecheck` 0 · `hook.test.sh` 전부 통과 · `ctx` 상태 줄 확인.

## Notes

**milestone의 예상과 하나가 달랐다.** *"물음 셋은 track 파일로"*였는데 `.session` 겹침은 track이 되지 않았다 — **물음이지만 답할 자리가 이미 있었다.** `ms-008`이 종료 조건으로 갖고 있는 것을 track으로 또 만들면 같은 물음이 두 곳에 적히고, 그것이 track이 막으려던 실패와 정확히 같다. 이 판단을 `evolve`의 track 절에 규범으로 넣었다("답할 자리가 이미 있으면 track을 만들지 않는다").

**`cleanup`이 track을 훑는 질문은 다르다.** 세대·backlog는 *"앞으로 볼 일이 있는가"*지만 track은 먼저 **닫혔는가**를 본다. track은 milestone에 안 매달리므로 `cleanup`이 안 보면 아무도 안 본다 — backlog가 오래 그랬던 것과 같은 구멍이다.
