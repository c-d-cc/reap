---
id: ms-005
slug: plan-축-완성
title: plan 축을 완성한다 — 등록과 쓰기
from: gen-0032-plan
refs:
  - ps-4f2a91:05-knowledge.md
  - ps-4f2a91:06-agent.md
status: closed
openedAt: 2026-08-23T04:48:43Z
closedAt: 2026-08-23T08:00:42Z
---

## Background

로드맵 **증분 3(plan 축)의 남은 절반**이다. 넷 중 `carve-milestone`은 `bk-1ebbd3`이 가져갔고, 남은 것은 **plan source를 등록하고 그것에 쓰는 쪽**이다.

**전제 검증에서 나온 것:** 증분 3의 검증할 주장은 *"규약 문서 되먹임이 실제로 일어나는가"*인데 **답이 이미 나와 있다 — 0회다.** `conventions/ps-4f2a91-reap.md`는 등록할 때 쓴 그대로이고, 그 뒤 두 번 손댄 것은 레이아웃 이동과 id 통일이라는 기계적 변경이었다.

그런데 **되먹였어야 할 것은 있었다.** 이 소스를 다루며 알게 된 것들이 실제로 있었는데 — README 색인이 낡는다는 것, 이 문서들이 스스로와 모순될 수 있다는 것 — 전부 `lessons.md`(전역 교훈)와 spec 본문으로 흩어졌다. **전역 교훈인 것과 이 소스 특유의 관례인 것이 갈리지 않았다.**

그러니 이 milestone은 "명령을 만드는 일"이 아니라 **되먹임이 일어나게 만드는 일**이다. `author-plan`이 그 자리다.

## `ms-010`이 남긴 것

`ms-010`이 **`plan/`을 최상위로 올렸다** — 이 milestone이 손댈 경로가 `.reap/plan/`이다. 나머지(track)는 `gen-0044-plan`이 걷어냈으므로 전제로 삼지 않는다.

**cold start 전체 왕복이 이 milestone의 것이다** — `make plan-source`가 여기 있으므로.

## Exit Criteria

1. **`reap make plan-source --root <path> --role "<r>"`가 소스를 등록한다.** `sources.yml`에 행이 붙고 `conventions/<ps-id>-<slug>.md`가 씨앗과 함께 놓이며 `sequence/source.md`에 id가 발급된다. **지금 손으로 쓴 `ps-4f2a91`과 같은 모양이어야 한다**
2. **`reap plan sources`와 `reap plan convention <ps-id>`가 읽는다.** 지금은 `sources.yml`을 파싱하는 코드가 **아예 없다**
3. **`author-plan` skill이 있다.** `06-agent.md`가 적어둔 여섯 판단을 담고, 그중 **규약 되먹임**이 핵심이다 — 무엇이 그 소스 특유의 관례이고 무엇이 전역 교훈인지 가르는 기준까지
4. **`--ref <ps-id>:<경로>` 인용이 검증된다.** 지금은 문자열이 그대로 들어가고 아무도 안 본다. 최소한 **소스 id가 실재하고 경로가 그 소스 안에 있는지**는 확정 가능한 사실이다
5. **cold start가 한 바퀴 돈다.** 빈 프로젝트에서 `init` → plan 세대가 돌며 `make plan-source` → `author-plan`이 쓰고 → `carve-milestone`이 자른다. **plan이 0인 곳에서 시작하는 것이 실제로 가능한지는 이것으로만 안다**
6. **되먹임이 실제로 한 번 일어난다.** 이 milestone이 도는 동안 `conventions/ps-4f2a91-reap.md`에 **이 소스를 다루며 알게 된 것**이 들어간다. 안 일어나면 설계가 작동하지 않는 것이고, 그 사실이 fitness의 재료다
7. `bun test` 통과 · `typecheck` 0 · `hook.test.sh` 통과 · 새 세션에서 skill 확인

## Out of Scope

- **`carrier`** — 필요를 아직 겪지 않았다. 지금까지의 중복은 전부 다른 방법으로 풀렸다(파일을 같게 유지, 규범 소유자 지정)
- **`doctor`가 인용을 검사하는 것** — `doctor` 자체가 `ms-006`이다. 여기서는 `make milestone`이 받을 때 확정 가능한 것만 본다
- **plan source를 여럿 등록해 쓰는 것** — 지금 소스가 하나뿐이라 여럿일 때의 문제(어느 소스에 쓸 것인가)는 상상으로만 설계된다

## Plan Items

| | 갈래 | 무엇이 참이어야 하는가 |
|---|---|---|
| 6.1 | `make plan-source` · `plan sources\|convention` | 손으로 쓴 `ps-4f2a91`과 도구가 만드는 것이 같은 모양. `sources.yml`을 읽는 코드가 생긴다 |
| 6.2 | `--ref` 인용 검증 | 소스 id가 실재하고 경로가 그 소스 안에 있는지. 확정 가능한 것만 검사한다 |
| 6.3 | `author-plan` skill | `06-agent.md`의 여섯 판단. **규약 되먹임의 기준**이 핵심 |
| 6.4 | 되먹임을 실제로 한 번 돌린다 | `conventions/ps-4f2a91-reap.md`에 이 소스 특유의 관례가 들어간다 |

**6.3이 6.4보다 먼저다** — 기준 없이 되먹이면 그것도 즉흥이 되고, 즉흥은 다음 세션에 이어지지 않는다.

## Constraints

- **`ps-4f2a91`은 이미 손으로 등록돼 있다.** 도구를 만들되 기존 등록을 깨지 않는다 — 대조군이면서 실사용 데이터다
- 구현 전에 실패하는 테스트를 먼저 쓴다
- 플러그인이 바뀌므로 닫기 전에 `localUpdate`로 반영하고 새 세션에서 확인한다

## Open Questions

- **전역 교훈과 소스 특유 관례를 무엇이 가르는가.** "README 색인이 낡는다"는 이 소스의 것인가 모든 문서 소스의 것인가. 6.3에서 답한다
- **`--ref`가 가리키는 경로가 사라지면 어떻게 되는가.** 검사하면 `doctor`의 몫인지 `make`의 몫인지. 6.2에서 정한다

## 이 milestone이 끝나면 물어볼 것

1. **되먹임이 실제로 일어났는가?** 규약 문서에 들어간 것이 있는가, 그리고 그것이 다음에 이 소스를 다룰 때 쓸모 있어 보이는가.
2. **`author-plan`과 `carve-milestone`의 경계가 헷갈렸는가?** 둘 다 plan 세대에서 쓰이는데 실제로 갈렸는가.
3. **`--ref` 검증이 마찰이었는가 도움이었는가?**
4. **소스가 하나뿐인 채로 설계한 것이 문제가 됐는가?**

---

## Fitness

**착수하기 전에 전제가 바뀌었다.** 사람이 기획을 별도 플러그인(`reap-plan`)으로 내보내기로 했고, **이 milestone의 절반이 그쪽 것이 됐다.**

**나간 것 — 기획을 만드는 일**

- **6.3 `author-plan` skill** — spec의 약속에서 내렸다(`06-agent.md`·`02-flow.md`·`08-delivery.md`)
- **6.4 규약 되먹임을 한 번 돌린다** — `conventions/`는 남지만 *"이 소스에 쓰는 법"*이 아니라 *"이 소스를 읽는 법"*만 담는다
- **종료 조건 5의 절반** — cold start에서 plan을 **세우는** 왕복. plan source를 등록하고 읽는 것까지는 남는다
- **종료 조건 6(되먹임이 실제로 한 번 일어난다)** — 쓰는 일이 없으므로 물음 자체가 사라졌다

**남는 것 — 소비 쪽**

6.1(`make plan-source`·`plan sources|convention`)과 6.2(`--ref` 검증). 여기에 **`make issue`가 더해진다** — 기획에 고칠 것을 돌려보내는 유일한 길이고, 이 milestone을 자를 때는 없던 개념이다.

**이 milestone이 답을 안 하고 죽은 물음 둘**

- *"전역 교훈과 소스 특유 관례를 무엇이 가르는가"* — 되먹임이 사라졌으므로 **`reap-plan`의 물음**이 됐다
- *"`--ref`가 가리키는 경로가 사라지면 `doctor`의 몫인가 `make`의 몫인가"* — 살아 있고, **답이 생겼다.** 사라진 경로는 **issue다**(`05-knowledge.md`의 `plan 인용`). `doctor`가 보고하고 사람이 `make issue`로 돌려보낸다

**왜 착수 전에 무너졌나**

`ms-010`과 같은 자리에서 왔다. **plan 축의 경계를 REAP 안에서 찾고 있었다.** `ms-010`은 그것을 `track`이라 부르다 철회됐고, 이 milestone은 `author-plan`이라 부르고 있었다. **둘 다 경계가 REAP 밖에 있다는 답을 못 봤다.**

`gen-0045-plan`이 소비 쪽만 담은 새 milestone으로 다시 자른다.
