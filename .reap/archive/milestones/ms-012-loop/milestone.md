---
id: ms-012
slug: loop
title: loop — plan 축의 사이클을 짓는다
from: loop-0001-plan
refs:
  - ps-4f2a91:02-flow.md
  - ps-4f2a91:04-commands.md
  - ps-4f2a91:06-agent.md
status: closed
openedAt: 2026-08-30T14:16:16Z
closedAt: 2026-08-30T14:34:46Z
---
## Background

**`loop-0001`이 잘랐다 — 손으로 연 첫 loop다.** plan 축의 사이클을 loop로 세우기로 했고(`02-flow.md`의 `plan 축의 단위는 loop다`, `06-agent.md`의 `loop` 절), spec은 섰지만 도구도 skill도 없다. `loop-0001` 자체가 id·frontmatter·레지스트리·archive 이동을 전부 손으로 했다 — 그 마찰이 이 milestone의 재료다.

**전제 검증.** `gen-0040`~`0044`가 track을 만들었다 걷어낸 흔적이 `id.ts`·`entries.ts`·`cli.ts`에 없다(전부 지워졌다). 다시 짓되 **track의 모양(묶음)을 따라가면 안 된다** — loop는 generation과 같은 급의 기록 단위이고, `make generation`·`mark generation`이 가장 가까운 본이다.

## Exit Criteria

1. **`reap make loop --type <plan|design|uiux|idea> --title "<t>"`가 `plan/loops/<loop-id>-<slug>.md`를 놓는다.** `sequence/loop.md`에 행, frontmatter에 `type`·`from`(선택)·`refs`(선택)·`startedAt`·`startCommit`·`status`·`milestones: []`. **세션에 바인딩하지 않는다.** 유형이 없으면 거부
2. **`reap mark loop <id> --closed [--milestone <ms-id>]...`가 `closedAt`·`milestones`·`status`를 찍는다.** 파일은 `plan/loops/`에 남고, **닫힌 loop가 10개를 넘으면 오래된 것(`closedAt` 순)부터 `archive/loops/`로 옮긴다.** 열린 loop는 옮기지 않는다. `--aborted`는 지운다
3. **`make generation --plan`이 거부된다** — 메시지가 `make loop`를 가리킨다. 기존 `gen-NNNN-plan` 파일은 `doc.ts`가 계속 읽는다
4. **`make milestone --from`이 loop id를 받는다** (이미 받는다 — 검증 없이. 그대로 두되 테스트로 못 박는다)
5. **`ctx`의 상태 줄이 열린 loop를 낸다** — `열린 loop: loop-0001-plan <제목> — <경로>` 한 줄씩. 닫힌 것은 archive라 안 나온다
6. **`loop` skill이 있다.** `06-agent.md`의 여덟 판단·`Dialogue`. `evolve`가 "새 의도를 만드는 일이면 `loop`로"를 가리키고 plan 축 안내를 뺀다. `complete`가 plan 세대 언급을 뺀다. `carve-milestone`이 `--from`을 loop로 적는다
7. **템플릿 `loop.md`** — `Question`·`Dialogue`·`Explored`·`Dead Ends`·`Outcome`·`Open Questions`를 어휘로. `record-vocabulary.md`에 loop 어휘
8. `map.md` 씨앗 템플릿이 이미 `loop`를 말한다 — `src/templates/map.md`를 `.reap/map.md`와 맞춘다
9. `bun test` · `typecheck` 0 · `hook.test.sh` · `localUpdate` 후 새 세션에서 `loop` skill 확인. **이 리포에서 두 번째 loop를 도구로 열어본다**

## Out of Scope

- `interview`·`init` — `ms-007`. 단 `init`이 `make loop`를 부르므로 이것이 먼저다
- `make plan-source`·`plan sources` — `ms-011`
- loop 안에서 plan source에 **쓰는** 실제 동작의 검증 — skill이 안내하고 실사용이 검증한다
- `cleanup`이 loop를 다루는 것 — 개수 규칙을 `mark`가 하므로 판단이 없다
- `doctor`의 loop 검사 — `ms-006`

## Plan Items

| | 갈래 | 무엇이 참이어야 하는가 |
|---|---|---|
| 12.1 | `id.ts`·`store.ts`·`entries.ts`·`cli.ts` — `make loop`·`mark loop`·`--plan` 거부 | 손으로 만든 `loop-0001`과 같은 모양. `sequence/loop.md` 헤더도 같아야 한다 |
| 12.2 | `ctx` 상태 줄 | 열린 loop 목록. 여럿일 수 있다 |
| 12.3 | `loop` skill · 템플릿 · 어휘 | 규율은 `06-agent.md`에 있고 skill은 그것을 절차로 옮긴다. `evolve`·`complete`·`carve-milestone` 정리 |

**12.1이 먼저다.** 12.3의 skill이 도구를 부른다.

## Constraints

- **`loop-0001`을 깨지 않는다.** 손으로 쓴 것이 대조군이다
- **세션 바인딩 없음** — `.session`은 generation만. loop는 여럿이 열리므로 "현재 loop"가 없다
- 구현 전에 실패하는 테스트를 먼저 쓴다
- **저장 구조가 바뀌면 코드와 리포를 같은 세대에서 옮긴다**(`genome/evolution.md`)

## Open Questions

- **`gen-NNNN-plan`을 `id.ts`가 계속 인식하는 방식.** 발급은 막고 파싱은 허용 — 두 규칙이 한 정규식에 있으면 헷갈린다
- **loop의 `from`이 여러 개일 수 있는가.** generation 하나 + plan source 경로 하나가 동시에 출처일 수 있다. 지금은 하나로 시작한다
- **loop에도 `handoff`가 필요한가.** 여러 세션에 걸치는데 기록 본문이 그 역할을 하는지, 별도 파일이 필요한지는 실사용이 답한다

## 이 milestone이 끝나면 물어볼 것

1. **두 번째 loop를 도구로 열었을 때 손으로 한 것과 무엇이 달랐는가?**
2. **여럿 열린 loop 중 이어갈 것을 고르는 판단이 실제로 필요했는가?** 아니면 늘 하나였는가
3. **`Dialogue`가 쓸 만했는가** — 다음 세션이 그것으로 같은 질문을 안 했는가
4. **exec 세대를 열려다 loop로 돌려보낸 일이 있었는가?** 반대는?

## Fitness

**닫는다 — 실사용 뒤 다시 본다** (사람, 2026-08-30). 질문 1(두 번째 loop를 도구로)은 검증용 `loop-0002-idea`로 한 바퀴 돌았고 손으로 한 것과 같은 모양이었다 — 빈 목록 왕복 하나가 달라 고쳤다. 질문 2·3·4는 실사용 뒤에만 답이 나오므로 `idea/research/`로 넘긴다.
