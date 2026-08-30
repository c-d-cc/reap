---
id: ms-008
slug: orchestrate
title: orchestrate — 병렬 세션 조율
from: gen-0032-plan
refs:
  - ps-4f2a91:07-orchestrate.md
status: closed
openedAt: 2026-08-23T04:50:05Z
closedAt: 2026-08-30T17:14:30Z
---

## Background

로드맵 **증분 6**이다. 여러 세션이 한 프로젝트에서 함께 일할 때 필요한 것 — 자원 선점(`claim`)과 종료 대기(`barrier`), 그리고 그것을 언제 쓰는지 아는 `orchestrate` skill.

**전제 검증: 병렬 세션이 실제로 일어난다.** `ms-003`이 도는 동안 **다른 세션이 같은 리포에서 커밋을 둘 남겼다.** 충돌은 없었지만 `.reap/.session` 바인딩이 겹칠 수 있다는 것이 드러났다 — 두 세션이 각각 세대를 열면 나중 것이 앞의 바인딩을 덮는다.

**그 관측이 한 번 사라졌다.** `ms-003`의 `handoff.md`에 적었는데 닫을 때 handoff를 통째로 교체하면서 지워졌고 지금은 git(`c8fc62d`)에만 있다. **`handoff.md`는 교체되므로 milestone을 넘어 살아야 할 것을 거기 두면 잃는다** — 갈 곳은 결론 안 난 물음이면 `idea/research/`, 교훈이면 `lessons.md`, 그리고 지금처럼 **답할 milestone이 정해졌으면 그 milestone**이다.

**probe가 먼저다.** `08-delivery.md`가 구현 전에 확인할 것 둘을 적어뒀고, 둘 다 조율 패턴을 바꿀 수 있다. 증분 0(훅 주입 계약)이 그렇게 풀렸다 — 문서나 추측 대신 일회용 실험으로 답하고 코드는 버린다.

## Exit Criteria

1. **probe 둘의 답이 나와 있다.** idle 상태인 대화형 세션이 `SendMessage`를 언제 처리하는지, `claude agents --json`의 출력 필드가 버전 간에 유지되는지. **답은 spec에 반영하고 probe 코드는 버린다**
2. **`reap orch claim/release`가 원자적으로 돈다.** `O_EXCL`. 실패하면 현재 holder와 만료 시각을 낸다. TTL 만료된 claim은 다른 세션이 가져갈 수 있다
3. **`reap orch barrier <name> --expect <N> --timeout <s>`가 있고 `--timeout`이 필수다.** 만료 시 **누가 오지 않았는지**를 낸다 — 오지 않는 참가자를 무한정 기다리는 것이 orchestrate가 실패하는 최악의 방식이다
4. **`reap orch roster`가 `claude agents --json`에서 `reap-<topic>-`로 시작하는 세션을 추린다.** 참가 등록 절차는 없다 — 이름이 곧 참가다
5. **공유 상태가 `~/.reap/orch/<workspace-id>/`에 산다.** 세션마다 `.reap/`가 별개 사본이므로 리포 안에 두면 공유되지 않는다
6. **`orchestrate` skill이 있다.** 역할 명명, 메시지 kind 관례, 언제 claim을 잡는지, barrier를 어디 두는지, 조율자 패턴
7. **`.session` 바인딩이 겹치는 문제에 답이 있다.** 실제로 겪은 유일한 병렬 문제다
8. **실제로 두 세션을 띄워 한 바퀴 돌려본다.** 이것 없이는 검증한 척이다
9. `bun test` 통과 · `typecheck` 0 · `hook.test.sh` 통과

## Out of Scope

- **메시징** — Claude Code의 `SendMessage`/`ListAgents`를 그대로 쓴다. REAP는 mailbox를 만들지 않는다. **만들면 메시지함이 둘이 되고 둘 중 하나는 아무도 안 읽는다**
- **클라이언트 내부 구현에 붙는 것** — `messagingSocketPath`·`/tmp/cc-socks/`·`~/.claude/teams/`는 문서화되지 않았고 버전마다 바뀐다
- **세션을 깨우는 것** — REAP는 만남의 장소만 제공한다. `barrier`로 명시적으로 멈추는 것이 유일한 대책이다
- **`orch.claimed`·`orch.barrier.released` 이벤트 훅** — hooks 자체가 아직 안 잘렸다(증분 5의 나머지)

## Plan Items

| | 갈래 | 무엇이 참이어야 하는가 |
|---|---|---|
| 9.1 | probe 둘 | 답이 spec에 반영되고 코드는 버려진다. **조율 패턴이 바뀌면 아래 갈래들이 바뀐다** |
| 9.2 | 공유 상태와 `claim`/`release` | `~/.reap/orch/<workspace-id>/`. `O_EXCL` 원자성, TTL, 탈취 기록 |
| 9.3 | `barrier`와 `roster`·`status` | `--timeout` 필수. 만료 시 누가 안 왔는지 |
| 9.4 | `.session` 바인딩 겹침 | 실제로 겪은 문제. worktree마다 별개인지, 같은 디렉토리에서 둘이면 어떻게 되는지 |
| 9.5 | `orchestrate` skill | 언제 claim을 잡고 barrier를 어디 두는지 |
| 9.6 | 두 세션으로 한 바퀴 | 검증. 이것 없이 닫지 않는다 |

**9.1이 먼저다** — probe의 답이 나머지를 바꿀 수 있다.

## Constraints

- **모르는 것은 probe로 답한다**(`genome/evolution.md`). 문서나 추측 대신 일회용 실험으로 확인하고 코드는 버린다
- **REAP가 만들지 않는 것을 만들지 않는다.** 메시징은 클라이언트의 것이다
- 구현 전에 실패하는 테스트를 먼저 쓴다

## Open Questions

- ~~`claim`의 대상이 자유 문자열인데 관례가 필요한가~~ — 필요하다. 도구는 안 정하고 skill이 기본 둘(milestone id · 경로 glob)을 주며 프로젝트의 관례는 `handoff.md`에 적는다(`gen-0059`)
- ~~`workspace-id`가 worktree마다 다른가 리포마다 같은가~~ — 같다. probe로 확인(`gen-0059`)
- **혼자 쓰는 사람에게 이것이 값이 있는가.** 지금까지 병렬은 한 번, 그것도 우연이었다. 자르되 **가장 뒤에 둔다**

## 이 milestone이 끝나면 물어볼 것

1. **두 세션으로 실제로 일해봤는가?** 그리고 `claim`/`barrier`가 실제로 필요했는가, 아니면 메시지만으로 됐는가.
2. **probe의 답이 설계를 바꿨는가?**
3. **혼자 쓸 때 이것이 방해가 되는가?** 안 쓰는 기능이 상태 줄이나 `doctor`에 나타나 잡음이 되지는 않는가.

## Fitness

(사람, 2026-08-31) **유예하고 닫는다.** 종료 조건 1의 절반(idle 세션의 `SendMessage` 수신 시점)과 8(실제 두 세션 한 바퀴)은 **하지 않았다** — 사람 결정. 실적은 바이너리 두 프로세스로 `claim`·`barrier`를 돌린 것까지다. 세션을 깨우는 문제는 그래서 열려 있고, `orchestrate` skill은 barrier에 기대는 쪽으로 썼다. 질문 1(두 세션으로 일해봤는가)·2(probe가 설계를 바꿨는가 — 확정 가능한 둘은 안 바꿨다)·3(혼자 쓸 때 방해되는가 — `orch`를 안 부르면 아무 데도 안 나온다)은 실제 병렬 작업 뒤에 답한다. **REAP를 쓰는 사람이 처음 병렬로 일하는 날이 이 milestone의 검증이다.**
