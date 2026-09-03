---
name: orchestrate
description: Use when two or more Claude Code sessions work on the same REAP project at once - naming roles, splitting by worktree, claiming resources before touching them, placing barriers where work must sync, and coordinating via SendMessage. Trigger on "병렬", "세션 둘", "orchestrate", "동시에 작업", "역할 나눠", or when another session shows up in the roster or a claim conflict appears, in a repo containing .reap/.
---

# orchestrate — 여러 세션이 한 프로젝트에서

REAP가 주는 것은 **만남의 장소**뿐이다 — 자원 선점(`claim`)과 종료 대기(`barrier`). 메시지는 클라이언트(`SendMessage`·`ListAgents`)의 것이고 REAP는 세션을 깨우지 못한다. 규범은 `07-orchestrate.md`가 갖는다.

## 혼자면 이 skill은 없는 것이다

`orch`를 안 부르면 상태 줄에도 `doctor`에도 아무것도 안 나온다. 다른 세션이 같은 리포에서 일하고 있다는 신호(`claude agents`에 `reap-*`가 보인다, `claim`이 거부된다, 상태 줄의 `열린 세대`가 내 것이 아니다)가 있을 때만 여기다.

## 1. 역할이 곧 주소다 — worktree로 가른다

```bash
claude -n reap-<topic>-<role> -w <worktree>      # 예: reap-auth-writer, reap-auth-tester
```

- `<topic>`이 공유 상태의 방(`~/.reap/orch/<workspace-id>/<topic>/`)을 정한다. workspace-id는 **worktree 간에 수렴한다**(probe로 확인) — 방이 갈라지지 않는다
- **같은 디렉토리에서 세션 둘은 안 된다.** `.reap/.session`(세대 바인딩)이 한 파일이라 나중 세션이 앞의 것을 덮는다. worktree마다 `.reap/`가 별개라 worktree로 가르면 문제가 없다. 이것이 실제로 겪은 유일한 병렬 문제였다
- **id는 조율자가 주 트리에서 발급한다.** worktree마다 `.reap/`가 사본이라 두 곳에서 `make generation`을 부르면 같은 번호가 두 번 나온다(실제로 겹쳤다 — `lessons.md`). 조율자가 세대를 열어 커밋한 뒤 worktree를 만들고, worktree의 세션은 `reap bind <gen-id>`만 한다. 도구 동작 확인은 임시 리포에서 — worktree에서 `make`를 부르면 레지스트리 행이 남는다
- 세션 이름을 `orch`에 알리려면 `REAP_AGENT=reap-<topic>-<role>`을 환경에 둔다. 없으면 세션 id가 주소다 — `roster`가 이름으로 못 찾는다

## 2. 손대기 전에 잡는다

```bash
reap orch claim <resource> [--ttl 30m] [--topic <t>]
reap orch release <resource>
```

`resource`는 자유 문자열이다 — **관례를 정해두지 않으면 둘이 같은 것을 다른 이름으로 잡는다.** 이 프로젝트의 관례는 `handoff.md`나 첫 메시지에 적는다. 기본은 둘이다: milestone 갈래는 id(`ms-004`), 파일 영역은 경로 glob(`src/auth/**`).

**TTL은 세션이 죽었을 때를 위한 것이다.** 만료되면 남이 가져가고 탈취는 `log.jsonl`에 남는다. 길게 잡을수록 죽은 세션이 남을 오래 막는다 — 한 세대 길이(30m~2h)면 된다. 갱신은 같은 자원을 다시 `claim`하면 된다.

**거부당하면 기다리거나 말한다.** holder에게 `SendMessage`로 묻는다. 만료를 기다려 탈취하는 것은 상대가 죽었다고 판단될 때만이다.

## 3. 합쳐야 하는 곳에 barrier를 둔다

```bash
reap orch barrier <name> --expect <N> --timeout <초>
```

**`--timeout`은 필수다.** 만료되면 누가 안 왔는지(roster를 알면 이름, 모르면 개수)를 낸다 — 오지 않는 참가자를 무한정 기다리는 것이 병렬이 실패하는 최악의 방식이다.

barrier를 두는 곳은 **뒤 작업이 앞 작업 전부를 전제하는 지점**이다 — 테스트 전, 통합 커밋 전, milestone 닫기 전. 자주 두면 병렬이 직렬이 된다.

## 4. 메시지 관례

`SendMessage`의 본문 첫 줄에 kind를 적는다. 도구가 검사하지 않는다 — 읽는 쪽이 첫 줄로 분류할 수 있으면 된다.

| kind | 뜻 |
|---|---|
| `claim-request <resource>` | 잡힌 것을 놓아달라 |
| `done <what>` | 내 몫이 끝났다 — barrier에 도착했다는 뜻이기도 하다 |
| `blocked <why>` | 막혔다. 조율자가 재배치한다 |
| `ask <question>` | 판단이 필요하다 |

상대가 끝나는 것을 알아야 하면 `SendMessage(notify_when_idle: true)`. 메시지 없이 구독만 걸면 상대에게 비용이 없다.

## 5. 조율자 패턴

세션이 셋 이상이면 하나가 조율자다 — 갈래를 나누고(`claim`으로 못 박는다), barrier 이름과 `--expect`를 정해 알리고, `orch status`·`roster`로 상황을 본다. 조율자도 자기 몫의 코드를 가져도 되지만 **barrier의 `--expect`를 아는 유일한 자리**여야 한다. 둘이 다른 N을 쓰면 하나는 영원히 기다린다.

## 상태 보기

```bash
reap orch roster [--topic <t>]     # claude agents --json 에서 reap-<topic>-* 만
reap orch status [--topic <t>]     # claims · barriers
```

`roster`가 비어 있으면 세션이 없거나 `claude agents`를 못 읽은 것이다 — 도구는 둘을 가르지 못하고 그렇게 말한다.

## 끝나면

`release`하고 `complete`로 세대를 닫는다. 남은 claim은 TTL이 지나면 사라진다 — 하지만 놓지 않고 나가면 그 시간 동안 남이 막힌다.
