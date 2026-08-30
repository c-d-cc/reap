---
id: bk-75bafa
slug: carrier-필요성
type: design
title: carrier를 만들 것인가 — 필요를 아직 겪지 않았다
from: gen-0032-plan
createdAt: 2026-08-23T04:51:22Z
status: consumed
consumedBy: gen-0036-exec
---

> **해결됨 — `gen-0036-exec`. 만들지 않기로 하고 spec에서 뺐다.** `idea/research/`의 `idea-a608f2`로 옮겼다 — `05-knowledge.md`가 그 자리를 *"결론은 없지만 다시 찾지 않게 해주는 것"*으로 규정했고 carrier가 정확히 그것이다. 졸업 조건(공유도 소유자 지정도 안 되는 중복을 만나면)을 함께 적었다. **`bk-c4fd73`(hooks)과 다르게 다룬 이유는 구조다** — hooks는 `.reap/hooks/`가 `init`이 만드는 디렉토리로 이미 있어 spec에 남기고 신호만 적었고, carrier는 코드에도 레이아웃에도 의존하는 것이 없었다. 아래 본문은 고치지 않는다.

> **되돌려짐 — `gen-0037-fix`.** 위 판단이 틀렸다. **내가 "겪은 중복 넷이 다른 방법으로 풀렸다"고 세면서 그 넷을 *어떻게 찾았는지*는 세지 않았다** — 전부 우연히 눈에 띄었거나 사람이 짚어줬다. carrier가 겨냥하는 것은 중복을 *푸는 방법*이 아니라 **중복을 아는 곳을 전부 찾는 수단**이고, 값을 공유하든 소유자를 정하든 먼저 어디가 그 사실을 아는지 알아야 한다. `~/cdws/reap`이 그것을 증명한다 — 이슈 #21·#22가 둘 다 "한 사본이 낡는 동안 나머지가 움직인" 것이었고 carrier는 그 뒤에 생겼으며 지금 표식 14개가 살아 있다. carrier는 spec으로 돌아왔고 `ms-006`(위생)이 가져갔다. `idea-a608f2`는 지웠다.

## 무엇이 문제인가

**`carrier`가 spec에 규정돼 있는데 로드맵 어느 증분에도 배정된 적이 없다.** 증분 0~6을 전부 잘랐는데 여전히 갈 곳이 없다.

- `05-knowledge.md` — 관례 정의. *"한 사실이 여러 곳에 알려질 때 그 자리에 표식을 남기는 관례. `reap:carrier(<slug>-<hash8>)` 형식. 값을 공유할 수 있으면 공유하고, 산문·번역·프롬프트 문자열처럼 공유할 수 없는 것에만 쓴다"*
- `04-commands.md` — `reap carrier new <slug> | list [--orphans|--check]`, 그리고 `doctor`의 검사 항목("carrier — 형식, 고아, 충돌")

## 왜 지금 안 자르는가

**필요를 아직 겪지 않았다.** 32세대 동안 "같은 사실이 여러 곳에 있다"는 문제는 여러 번 겪었지만 **전부 carrier가 아닌 방법으로 풀렸다.**

| 겪은 중복 | 어떻게 풀었나 |
|---|---|
| `.reap/map.md` ↔ `src/templates/map.md` | **값을 공유했다** — 두 파일을 byte-identical로 유지하고 `diff`로 확인 |
| `02-flow.md` 도식 ↔ `06-agent.md` 산문 | **규범 소유자를 정했다** — `06-agent`가 소유하고 `02-flow`는 가리킨다 |
| skill 개수가 `README.md`와 `06-agent.md`에 | 같은 방법. 한쪽이 소유 |
| `complete`의 종료 절차 ↔ `carve-milestone` | 같은 방법 |

**carrier가 겨냥한 것은 "값을 공유할 수 없는 것"**(산문·번역·프롬프트 문자열)인데, 위의 넷은 전부 공유하거나 소유자를 정해서 풀렸다. **공유도 소유도 안 되는 사례를 아직 만나지 않았다.**

## 정해야 할 것

- **만들 것인가, spec에서 뺄 것인가.** 겪지 않은 필요를 위해 명령 둘과 `doctor` 검사 항목을 만드는 것은 YAGNI다. 반대로 spec에서 빼면 나중에 겪었을 때 설계를 다시 해야 한다
- **뺀다면 어디로 가는가.** `idea/research/`가 "결론은 없지만 다시 찾지 않게 해주는 것"의 자리다
- **남긴다면 무엇이 신호인가.** 어떤 중복을 만났을 때 "이건 carrier가 필요하다"고 말할 수 있는가. 그 신호를 적어두지 않으면 영영 판단할 수 없다

## 근거

- `docs/superpowers/specs/reap/05-knowledge.md` — carrier 정의
- `docs/superpowers/specs/reap/04-commands.md` — 명령과 `doctor` 항목
- `docs/superpowers/specs/reap/09-roadmap.md` — 증분 0~6 어디에도 없다
