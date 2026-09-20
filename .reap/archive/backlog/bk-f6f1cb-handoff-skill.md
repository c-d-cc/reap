---
id: bk-f6f1cb
slug: handoff-skill
type: skill
title: handoff를 사람이 부르는 skill로 — complete 없이 세션을 끝낼 때
createdAt: 2026-09-20T23:50:10Z
status: consumed
consumedBy: gen-0126-exec
---

사람 지시(2026-09-21): **인계를 사람이 직접 부를 수 있는 skill로 만든다.** 세션을 끝내고
싶을 때 알아서 호출할 수 있어야 한다.

## 왜

지금 인계를 쓰는 유일한 경로가 `complete`의 멈추는 가지다. 그래서 **`complete`를 거치지 않고
끝나는 세션은 인계를 쓸 자리가 없다** — 세대를 안 연 채 이런저런 작업만 한 세션, 창을 닫는
세션, 컨텍스트가 찬 세션. 그때 다음 세션이 갖는 것은 커밋과 상태 줄뿐이다.

세션 종료 훅으로는 못 막는다. REAP의 이벤트 여섯은 전부 `make`·`mark`·`orch`가 파일을 쓴
직후이고, **세션이 끝나는 것은 호스트가 소유해 REAP가 관측할 수 없다.**

## 할 것

- `plugin/skills/handoff/SKILL.md` 신설. **사람이 부를 수 있어야 한다**(`user-invocable`을
  끄지 않는다). 절차의 정본이 여기다 — 언제 쓰는지의 **규범**은 `ps-4f2a91`의
  `03-storage.md`가 그대로 갖는다
- **열린 세대가 있을 때를 다룬다.** 닫고 갈지(→ `complete`), 열어둔 채 무엇을 하던 중인지
  적을지. 상태 줄이 열린 세대를 알리므로 둘 다 성립한다
- `complete`의 멈추는 가지는 절차를 **옮겨 적지 않고 가리킨다** — `carve-milestone`을
  가리키는 방식 그대로
- `ps-4f2a91`: `06-agent.md` skill 표에 행 하나, `03-storage.md`에 누가 절차를 갖는지
- **숫자가 움직인다** — skill 10종 → 11종, 사람이 부르는 것 8 → 9. README 둘·사이트
  (nav·목차·skill 레퍼런스·비교표)·`08-delivery.md`. `scripts/check-docs-surface.sh`가
  새 skill 이름을 README 둘과 사이트 로케일에서 찾는다
- `help` skill의 표에도 넣는다 — 사람이 부르는 것이므로
