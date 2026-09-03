# orchestrate와 hooks

## orchestrate


### 메시징 — REAP 코드 없음

Claude Code의 `SendMessage` / `ListAgents`를 그대로 쓴다. REAP는 mailbox를 만들지 않는다.

- **역할이 곧 주소다.** 세션을 `claude -n reap-<topic>-<role> -w <worktree>` 로 띄우면 그 이름이 주소가 된다.
- **메시지 kind 관례**는 `orchestrate` skill이 기술한다.
- 수신자는 inbox를 폴링하지 않는다. 메시지는 다음 tool round에 자동 전달되며 `<cross-session-message from="...">`로 감싸여 도착한다.
- 상대가 끝나는 것을 알아야 하면 `SendMessage(notify_when_idle: true)`를 쓴다. 1회성 구독이며, 메시지 없이 구독만 걸면 상대에게 비용이 들지 않는다.

`~/.claude/sessions/*.json`의 `messagingSocketPath`와 `/tmp/cc-socks/*.sock`, `~/.claude/teams/`는 **내부 구현이다. REAP는 여기에 붙지 않는다.** 문서화되어 있지 않고 버전마다 바뀔 수 있다.

### REAP가 채우는 구멍 — claim / barrier

Claude Code가 주는 것은 메시지 전달뿐이다. 자원 선점과 종료 대기에 해당하는 것은 없다.

```
~/.reap/orch/<workspace-id>/<topic>/
  topic.yml                       주제, 생성 시각, 상태
  claims/<encoded-resource>.yml   holder, session, acquiredAt, expiresAt
  barriers/<name>.yml             expect, arrived[]
  log.jsonl                       claim·탈취·만료·barrier 도달 기록
```

```bash
reap orch roster [--topic <n>]
reap orch claim <resource> [--ttl 30m]
reap orch release <resource>
reap orch barrier <name> --expect <N> [--timeout 1800]
reap orch status
```

**roster** — `claude agents --json`을 호출해 활성 세션을 얻고, 이름이 `reap-<topic>-`로 시작하는 것을 추린다. **참가 등록 절차는 없다.** 이름이 곧 참가이며, 세션이 죽으면 목록에서 저절로 사라진다. 등록부를 따로 두면 죽은 세션의 행을 청소하는 문제가 새로 생긴다. 토픽 디렉토리는 첫 `claim` 또는 `barrier` 시 자동 생성된다.

**claim** — `O_EXCL`로 파일을 원자적으로 만든다. 실패하면 현재 holder와 만료 시각을 출력한다. 자원 이름은 자유 문자열이라 `ms-004`도 `src/auth/**`도 잡을 수 있다. TTL이 만료된 claim은 다른 세션이 가져갈 수 있고, 탈취는 `log.jsonl`에 남는다. 죽은 세션 때문에 교착되는 것이 조용히 덮이는 것보다 낫다.

**barrier** — 도달한 세션을 기록하고 `expect`에 도달할 때까지 폴링 대기한다. `--timeout`은 필수이며, 만료 시 **누가 오지 않았는지**를 출력한다. 오지 않는 참가자를 무한정 기다리는 것은 orchestrate가 실패하는 방식 중 최악이다.

### 확인된 것 (`gen-0059`)

- **workspace-id는 worktree 간에 수렴한다** — 같은 리포의 두 worktree에서 같은 값(`git rev-parse --git-common-dir`의 부모). probe로 확인
- **`claude agents --json`의 필드** — `pid` · `id` · `cwd` · `kind` · `startedAt` · `sessionId` · `name` · `status` · `state`. `roster`는 `name`만 요구하고 없으면 그 행을 버린다. 명령이 없거나 출력이 JSON이 아니면 빈 목록이고 부르는 쪽이 "알 수 없다"고 말한다
- **`.session` 겹침** — `.reap/.session`은 worktree마다 별개다(각 checkout의 것). **같은 디렉토리에서 세션 둘은 지원하지 않는다** — 나중 것이 앞의 바인딩을 덮는다. 병렬은 worktree로 가른다. `doctor`가 "열린 채 바인딩 안 된 generation"으로 그 흔적을 참고로 낸다
- **세션 주소** — `REAP_AGENT` 환경변수(세션 이름)가 있으면 그것, 없으면 세션 id. 공유 상태의 뿌리는 `REAP_HOME`(기본 `~/.reap`)
- **두 프로세스로 실제로 돌렸다** — 동시 `claim`은 정확히 하나만 잡고(`O_EXCL`), `barrier --expect 2`는 둘이 도착하자 둘 다 통과했다

### 알려진 한계

REAP는 만남의 장소만 제공하므로 세션을 깨울 수 없다. 조율이 필요한 지점에서 `barrier`로 명시적으로 멈추는 것이 유일한 대책이며, `reap ctx`가 상태 요약을 실어 세션이 시작할 때 상황을 알게 한다.

## hooks


`{event}.{name}.{md|sh}` 규약을 REAP에서 차용한다. `.md`는 AI가 읽고 따르는 프롬프트, `.sh`는 프로젝트 루트에서 실행되는 스크립트. 메타데이터로 `condition`(기본 `always`)과 `order`(기본 50, 낮을수록 먼저)를 갖는다. 조건 스크립트는 `hooks/conditions/`에 있고 종료 코드 0이면 실행한다.

이벤트는 6개다.

`gen.made` · `gen.closed` · `milestone.made` · `milestone.closed` · `orch.claimed` · `orch.barrier.released`

**REAP가 직접 매개하는 일에만 이벤트가 있다.** 즉 `make`와 `mark`, 그리고 orchestrate의 원자적 연산이다. 메시지 송수신은 Claude Code가 소유하므로 REAP는 관측할 수 없고, 따라서 메시지 훅은 존재하지 않는다. 걸 수 없는 훅을 목록에 올리면 사용자는 동작하지 않는 훅을 쓰고 원인을 찾지 못한다.

REAP의 14개 이벤트는 5단계 lifecycle에 묶여 있었다. 고정 단계가 사라지면서 실제로 의미 있는 경계만 남았다.

### 제공한다 — 결정 (사람, 2026-09-01)

**v0.18도 hooks를 제공한다.** `make hook --event <e> --name <n> [--type md|sh] [--condition <c>] [--order <n>]`이 `.reap/hooks/{event}.{name}.{md|sh}`를 놓고, 위 여섯 지점(`make generation`·`mark generation --closed`·`make milestone`·`mark milestone --closed`·`orch claim`(성공)·`orch barrier`(해제))이 발화한다. `init`이 `hooks/conditions/always.sh`를 씨앗으로 놓는다. 검증할 동작과 파일 규약은 [03-hooks.md](03-hooks.md)가 규범이다.

**이벤트를 여섯 밖으로 늘릴 때만** 아래 셋을 판정 기준으로 쓴다 — hooks 자체를 만들지 여부는 더는 열린 질문이 아니다.

1. **같은 수동 동작이 세대마다 반복된다.** `make`나 `mark` 직후에 매번 사람이 같은 것을 치고 있다
2. **그 동작이 REAP가 직접 매개하는 지점에 걸린다.** 이벤트는 위의 여섯뿐이다. 그 밖의 지점을 원한다면 훅이 아니라 다른 것이 필요한 것이다
3. **프로젝트마다 달라야 한다.** 모든 프로젝트가 같은 것을 원하면 훅이 아니라 **도구가 그것을 하면 된다**

**셋을 다 만족해야 한다.** 실제로 후보가 하나 있었는데 갈렸다 — `make milestone` 직후 `mark milestone --focus`를 매번 손으로 치던 것이 1·2를 만족했지만, **모든 프로젝트가 같은 것을 원하므로 3을 만족하지 않았다.** 그래서 훅이 아니라 `make milestone --focus`로 풀었다. **이것이 이 목록의 첫 시험이고 결과는 "훅이 아니다"였다.**
