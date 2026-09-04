# orchestrate

두 세션 이상이 같은 REAP 프로젝트에서 동시에 작업할 때 쓴다. REAP가 주는 것은 **만남의 장소**뿐이다 — 자원 선점(`claim`)과 종료 대기(`barrier`). 메시지 전달 자체는 Claude Code의 `SendMessage`/`ListAgents`가 하고 REAP는 그 위에 mailbox를 만들지 않는다.

혼자 일할 때는 이 skill이 없는 것과 같다. 상태 줄에도 `doctor`에도 아무것도 안 나온다.

## worktree로 가른다

```bash
claude -n reap-<topic>-<role> -w <worktree>      # 예: reap-auth-writer, reap-auth-tester
```

세션 이름이 곧 주소이고, `<topic>`이 공유 상태의 방(`~/.reap/orch/<workspace-id>/<topic>/`)을 정한다. workspace-id는 같은 리포의 worktree 간에 수렴한다.

**같은 디렉토리에서 세션 둘은 안 된다.** `.reap/.session`(세대 바인딩)이 파일 하나라 나중 세션이 앞의 바인딩을 덮는다. worktree마다 `.reap/`가 별개이므로 worktree로 가르면 이 문제가 사라진다.

## id는 조율자가 발급한다

worktree마다 `.reap/`가 사본이라, 두 worktree에서 각각 `make generation`을 부르면 같은 번호가 두 번 나올 수 있다. 그래서 **id 발급은 주 트리의 조율자가 한다** — 조율자가 세대를 열어 커밋한 뒤 worktree를 만들고, worktree의 세션은 `reap bind <gen-id>`로 그 세대에 묶이기만 한다.

## claim — 손대기 전에 잡는다

```bash
reap orch claim <resource> [--ttl 30m] [--topic <t>]
reap orch release <resource>
```

`resource`는 자유 문자열이다 — milestone 갈래는 id(`ms-004`), 파일 영역은 경로 glob(`src/auth/**`)이 기본 관례다. TTL은 세션이 죽었을 때를 위한 것으로, 만료되면 다른 세션이 가져갈 수 있고 탈취는 로그에 남는다. 거부당하면 holder에게 메시지로 묻거나 기다린다.

## barrier — 합쳐야 하는 곳에 둔다

```bash
reap orch barrier <name> --expect <N> --timeout <초>
```

`--timeout`은 필수다. 만료되면 누가 오지 않았는지를 낸다. 테스트 전, 통합 커밋 전, milestone 닫기 전처럼 뒤 작업이 앞 작업 전부를 전제하는 지점에 둔다. 자주 두면 병렬이 직렬이 된다.

## roster·status로 본다

```bash
reap orch roster [--topic <t>]     # claude agents --json 에서 reap-<topic>-* 만
reap orch status [--topic <t>]     # claims · barriers
```

`roster`는 `claude agents --json`에서 이름이 `reap-<topic>-`로 시작하는 세션만 추린다. 별도 참가 등록 절차는 없다 — 이름이 곧 참가이고, 세션이 죽으면 목록에서 저절로 사라진다.

## 메시지 kind 관례

`SendMessage`의 본문 첫 줄에 kind를 적는다. 도구가 검사하지 않는 관례일 뿐이다.

| kind | 뜻 |
|---|---|
| `claim-request <resource>` | 잡힌 것을 놓아달라 |
| `done <what>` | 내 몫이 끝났다 |
| `blocked <why>` | 막혔다. 조율자가 재배치한다 |
| `ask <question>` | 판단이 필요하다 |

세션이 셋 이상이면 하나가 조율자를 맡는다 — 갈래를 `claim`으로 못 박고, barrier 이름과 `--expect`를 정해 알리는 유일한 자리다. 끝나면 `release`하고 각자 `complete`로 세대를 닫는다.
