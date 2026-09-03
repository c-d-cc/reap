---
id: ms-017
slug: v018-hooks
title: hooks — 이벤트 여섯과 make hook
from: loop-0004-plan
refs:
  - ps-5e948f:03-hooks.md
status: open
openedAt: 2026-09-03T14:40:21Z
---
## Background

사람(2026-09-01): v0.18도 hooks를 제공한다, lifecycle만 다르다. spec 07의 이벤트 여섯·파일 규약은 규범이고 "아직 만들지 않는다"만 만료됐다. v0.17 사용자는 hooks를 실제로 썼다(onCompleted 예제 2개 번들, conditions 3종). 규범과 검증 동작은 [03-hooks.md](../../../../docs/reap-plan/reap_v_0_18_release/03-hooks.md).

## Exit Criteria

- `reap make hook --event <e> --name <n> [--type md|sh] [--condition <c>] [--order <n>]`이 여섯 이벤트만 받고 `.reap/hooks/{event}.{name}.{ext}`를 놓는다
- `make generation`·`mark generation --closed`·`make milestone`·`mark milestone --closed`·`orch claim`·`orch barrier`(해제)가 발화하고, `.sh`의 stdout / `.md`의 본문이 명령 출력 뒤에 붙는다
- 훅이 실패해도 명령은 성공이다 — 테스트가 `exit 1` 훅으로 그것을 증명한다
- condition·order·타임아웃이 03-hooks대로 돈다. `doctor`가 규약 밖 파일명·모르는 이벤트·없는 조건 스크립트를 결함으로 낸다
- `init`이 `hooks/conditions/always.sh`를 씨앗으로 놓는다 (v0.17과 같이)
- spec 07-orchestrate의 "언제 만드는가 — 아직 아니다" 절이 결정(사람 2026-09-01)으로 갱신되고 `map.md` 씨앗(`src/templates/map.md`)의 hooks 줄이 실제와 맞는다
- `tests/hooks.test.ts`가 위를 덮고 전체 초록

## Out of Scope

- v0.17 훅의 이주 — ms-018 (migration-map)
- 이벤트 추가(여섯 밖) — 신호가 오면 backlog
- 메시지 훅 — REAP가 관측 못 한다 (spec)

## Plan Items

1. 훅 로딩·조건·실행기 + make hook (tasks/1)
2. 여섯 지점 발화 + doctor 검사 + init 씨앗 (tasks/2)
3. spec·map 갱신 (tasks/3 — 세대 하나로 짧다. 2와 합쳐도 된다)

## Constraints

- 발화는 파일 쓰기가 끝난 **뒤**. 훅이 던진 예외가 `make`의 파일을 지우지 않는다
- `.sh` 타임아웃 60초·조건 10초 — v0.17 값 승계. 03-hooks가 규범

## 이 milestone이 끝나면 물어볼 것

- 이 리포 자신이 훅을 하나라도 쓰고 싶어졌는가 (spec의 신호 1)
- 훅 출력이 명령 출력 뒤에 붙는 방식이 agent에게 읽혔는가, 묻혔는가
