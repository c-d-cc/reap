---
id: ms-011
slug: 기획-소비-프로토콜
title: plan source — 등록·읽기·인용
from: gen-0045-plan
refs:
  - ps-4f2a91:05-knowledge.md
  - ps-4f2a91:04-commands.md
status: closed
openedAt: 2026-08-23T08:00:50Z
closedAt: 2026-08-30T14:44:16Z
---
## Background

**`loop-0001`이 이 milestone을 줄였다.** 원래 `gen-0045-plan`의 *"REAP는 기획을 쓰지 않는다"* 위에 소비 프로토콜 넷을 짓는 것이었는데, 사람이 그 전제를 되돌렸다 — REAP가 기획을 쓰고(`loop`, `ms-012`), 그래서 **`make issue`(되돌려 보내기)는 사라졌다.** 자기가 쓰는 기획에 자기가 issue를 낼 이유가 없다.

**남는 것은 셋이다 — 등록·읽기·인용.** 아래 표와 조건에서 issue 항목은 지웠다.

| | 무엇 | 지금 상태 |
|---|---|---|
| 등록 | `make plan-source` | **없다.** `ps-4f2a91`은 손으로 썼다 |
| 읽기 | `plan sources` · `plan convention` | **없다.** `sources.yml`을 파싱하는 코드가 아예 없다 |
| 인용 | `--ref <ps-id>:<경로>` 검증 | 문자열이 그대로 들어가고 아무도 안 본다 |

**`ms-005`가 이 자리에 있었다.** 쓰는 일(`author-plan`)까지 담았는데, 쓰는 일은 이제 `loop`(`ms-012`)의 것이라 여기서는 등록·읽기·인용만 한다.

**전제 검증 — 두 가지가 이미 참이다**

- **`ps-4f2a91`이 손으로 등록돼 있다.** 도구가 만드는 것과 같은 모양이 나와야 한다. 대조군이면서 실사용 데이터다
- **`conventions/ps-4f2a91-reap.md`는 등록 이후 실질적으로 안 바뀌었다.** `ms-005`는 이것을 *"되먹임이 0회"*라는 결함으로 읽었는데, **쓰는 일이 나간 지금은 다르게 읽어야 한다** — 이 문서가 담을 것이 *"읽는 법"*으로 줄었기 때문이다. 줄어든 자리에서도 안 채워지면 그때 결함이다

## Exit Criteria

1. **`reap make plan-source --root <path> --role "<r>"`가 소스를 등록한다.** `sources.yml`에 행이 붙고 `conventions/<ps-id>-<slug>.md`가 씨앗과 함께 놓이며 `sequence/source.md`에 id가 발급된다. **손으로 쓴 `ps-4f2a91`과 같은 모양이어야 한다**
2. **`reap plan sources`와 `reap plan convention <ps-id>`가 읽는다.** `sources.yml`을 파싱하는 코드가 생긴다
3. **`--ref <ps-id>:<경로>`가 검증된다.** **소스 id가 실재하고 경로가 그 소스 안에 있는지** — 확정 가능한 것만. 앵커는 안 본다
4. `bun test` 통과 · `typecheck` 0 · `hook.test.sh` 통과 · 새 세션에서 확인

## Out of Scope

- **기획 작성·`make loop`** — `ms-012`의 것이다
- **항목 단위 인용** — `refs`는 파일 경로까지다. 기획의 계층을 REAP가 아는 순간 작업의 모양을 결정하게 된다(`genome/application.md`)
- **`doctor`의 인용 검사** — `doctor` 자체가 `ms-006`이다. 여기서는 `make`가 받을 때 확정 가능한 것만 본다
- **plan source 여럿을 실제로 쓰는 것** — 지금 하나뿐이라 여럿일 때의 문제는 상상으로만 설계된다

## Plan Items

| | 갈래 | 무엇이 참이어야 하는가 |
|---|---|---|
| 11.1 | `sources.yml`을 읽는 코드 | 파싱이 먼저다 — 등록도 검증도 전부 이것 위에 선다. `config.yml`과 달리 중첩이 있다 |
| 11.2 | `make plan-source` · `plan sources\|convention` | 손으로 쓴 `ps-4f2a91`과 도구가 만드는 것이 같은 모양 |
| 11.3 | `--ref` 검증 | 소스 id 실재 + 경로가 그 소스 안. `make milestone`이 받을 때 |

**11.1이 먼저다** — 나머지 둘이 그 위에 선다. `make loop`(`ms-012`)도 `--ref` 검증을 쓴다.

## Constraints

- **`ps-4f2a91`은 이미 손으로 등록돼 있다.** 도구를 만들되 기존 등록을 깨지 않는다
- **`sources.yml`에 YAML 파서를 들이는가**를 여기서 정한다. `readKV`는 한 겹짜리라 이 파일을 못 읽는다
- 구현 전에 실패하는 테스트를 먼저 쓴다
- 플러그인이 바뀌므로 닫기 전에 `localUpdate`로 반영하고 새 세션에서 확인한다

## Open Questions

- **YAML 파서를 들일 것인가, `sources.yml`의 형식을 낮출 것인가.** 의존을 하나 늘리는 것과 형식을 도구에 맞추는 것 중 어느 쪽이 싼지. 11.1에서 정한다

## 이 milestone이 끝나면 물어볼 것

1. **손으로 쓴 `ps-4f2a91`과 도구가 만든 것이 실제로 같았는가?**
2. **`conventions/`가 이번엔 채워졌는가?** 담을 것이 "읽는 법"으로 줄었는데도 안 채워졌다면 그것은 문서가 아니라 자리의 문제다
3. **`--ref` 검증이 마찰이었는가 도움이었는가?** — `make milestone --ref <ps-id>:<파일>`이 등록 안 된 소스나 없는 파일을 거부하는 것이 실제로 오타를 잡았는가, 아니면 귀찮기만 했는가

## Fitness

(사람, 2026-08-30) **1 — 같았다.** 테스트가 손으로 쓴 `sources.yml`과 바이트 단위로 같은 모양임을 확인한다. **2 — 채워졌다.** `conventions/ps-4f2a91-reap.md`에 등록 이후 첫 되먹임("도구가 이 소스를 어떻게 다루는가")이 들어갔다 — 도구가 소스를 실제로 다루기 시작하자 쓸 것이 생겼다. **3 — 묻지 않기로.** 사람이 `idea/research/`에 넣을 필요가 있는지 물었고 맞다 — 검사는 싸고 확정적이라 마찰이면 자를 때 바로 드러나 backlog로 남는다. 따로 기억할 물음이 아니다.
