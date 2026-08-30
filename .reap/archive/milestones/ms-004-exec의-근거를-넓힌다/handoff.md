# Handoff

## 어디까지 왔나

**끝났다.** 종료 조건 다섯이 전부 충족됐다.

| 세대 | 무엇 |
|---|---|
| `gen-0028-exec` | `--backlog` 근거 신설. spec 셋과 `evolve`가 같은 규칙을 말한다 |
| `gen-0029-exec` | **새 규칙의 첫 실행** — `bk-c92489`·`bk-ce5006`을 milestone 없이 소비. `archive/backlog/`와 `mark backlog` |
| `gen-0030-exec` | 근거를 배타로 못 박은 것을 되돌렸다. `--milestone`과 `--backlog`는 함께 올 수 있다 |

**요청받은 backlog 다섯이 전부 소비되고 archive로 내려갔다.** `life/backlog/`가 비었다.

## 이 milestone이 남긴 규범

- `02-flow.md` "exec의 근거는 둘이다" — 무엇을 근거로 고르는가의 표, 겸용, `consumed` 거부
- `03-storage.md` "`life/`는 작업 세트다" — 세대만이 아니라 backlog도
- `05-knowledge.md` backlog 절 — 나가는 문은 `cleanup`이 연다
- `plugin/skills/cleanup/SKILL.md` — backlog 절. 그리고 **남기려면 다시 열 상황을 한 문장으로 쓸 수 있어야 한다**(`ms-003` 정리에서 나온 것)
- `plugin/skills/evolve/SKILL.md` — 근거 고르기, 겸용, **같은 표면을 건드리는 항목 둘은 묶는다**

## 다음

로드맵의 다음 칸은 **증분 3 — plan 축**이다(`make plan-source` · `carve-milestone` · `author-plan` · `refs` 인용).

`tracks.md`의 열린 트랙 하나를 계속 본다 — **결정 로그를 없앤 규칙이 평범한 구현 milestone에서도 서는가.** `ms-004`도 규칙을 만드는 milestone이라 아직 시험되지 않았다.
