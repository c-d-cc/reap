---
id: gen-0046-plan
slug: cold-start-절차
type: plan
title: init과 interview — 정본 지식을 세우는 절차
startedAt: 2026-08-30T13:43:38Z
startCommit: 5561b67
status: closed
closedAt: 2026-08-30T13:47:17Z
endCommit: 0f76650
---
## Intent

**`init`과 `interview` skill을 만들기로 한 설계를 spec과 milestone에 반영한다.** 사람이 정한 것: 사용자는 새 폴더에서도 기존 코드베이스에서도 시작하며, REAP가 관리할 정본 지식을 세우는 절차가 필요하다.

**경계** — `interview`는 묻는 법을 소유하고, `init`은 질문지(무엇을 어느 순서로 묻고 어느 파일에 쓰는가)를 갖는다. `init`은 묻는 규율 문장을 한 줄도 갖지 않는다.

**진입 조건 셋** — 새 폴더 · 기존 코드베이스 · 씨앗인 채 남은 `.reap/`(번들 템플릿과 같은 내용이면 씨앗).

**순서** — `reap init` → 탐색 → plan source 등록 → `environment/summary.md` → `genome/application.md` → `genome/evolution.md` → 첫 milestone 판단(`carve-milestone`으로). plan source가 먼저인 이유: `application.md`는 plan source에 있는 규범을 옮겨 적지 않으므로 그것이 있는지 모르면 무엇을 쓸지 안 정해진다.

**안 건드리는 것** — `invariants.md`(사람만 수정한다 — 사람 결정), `lessons.md`(겪은 것이 없다). 이유가 다르다.

**탐색(brownfield)** — 매니페스트·빌드 진입점·README·트리 2단·git log·기존 AI 지침 파일(`CLAUDE.md` 등)만. 소스 파일은 읽지 않는다(코드를 읽어 아는 일은 `ms-009`). 기존 지침 파일과 genome이 겹치면 고치지 않고 보고한다. 탐색을 다 끝내고 질문 목록을 확정한 뒤 `interview`를 부른다 — 남은 개수를 보여주는 규율이 그것을 요구한다.

**기록** — `init`은 plan 세대로 연다. 중단·재개는 `evolve`의 "열린 세대가 이미 있다면"이 처리한다.

**끝나는 조건**
- `06-agent.md`에 `init` 절, skill 표에 `init` 행, 제목 `7종` 정정. `02-flow.md`·`08-delivery.md` 반영
- `ms-007`을 그 자리에서 다시 쓴다 → `cold start — 정본 지식을 세우는 절차`. 한 세대도 안 돌았으므로 닫지 않고 고친다
- **cold start 왕복 검증은 유예한다** — 사람이 실사용으로 확인하고 고칠 것을 돌려준다. milestone에 명시한다

## References

- `gen-0044-plan`·`gen-0045-plan` — plan 축 경계가 REAP 밖이라는 결론. `init`은 그 경계 안쪽(소비 쪽)에서 정본 지식을 세운다
- `ms-005` 종료 조건 5·`ms-010` 종료 조건 7 — 두 번 떨어져 나간 cold start 왕복
- `06-agent.md` interview 절 — 규율 본문은 이미 있다. skill 파일만 없다
- 근거: 이 리포 genome이 부트스트랩 이후 45세대 동안 거의 안 자랐다(`application.md` 22→22줄) — 자리를 만들어두면 나중에 채워진다는 가정이 세 번 틀렸다(`context.md`·`conventions/`·genome)

## Outcome

**spec에 `init`이 들어갔다.** `06-agent.md`에 `init — 정본 지식을 세운다` 절 신설(왜 필요한가·"별도 skill 안 둔다" 원칙에 안 걸리는 이유·진입 조건 셋·순서 일곱·안 건드리는 것 둘·탐색 범위·`CLAUDE.md` 겹침 보고·`interview`와의 계약·plan 세대로 연다), skill 표에 `init` 행, `7종` 제목이 이제 일곱과 맞는다. `02-flow.md` 흐름도 맨 위에 `(처음 한 번) /reap:init`, 개입 표에 한 행. `08-delivery.md` 레이아웃에 `init/SKILL.md`.

**`ms-007`을 그 자리에서 다시 썼다** → `ms-007-cold-start/`, 제목 `cold start — 정본 지식을 세우는 절차`. `interview`+`init`, 종료 조건 일곱, Plan Items 넷(7.1 `interview`가 먼저). **cold start 왕복 검증은 사람 결정으로 유예했고 그 사실과 이유를 milestone에 명시했다** — 세 번째로 빠지는 것이고 앞의 둘은 사고, 이번은 결정.

**씨앗에 판정 하나를 심었다.** `genome-application.md` 템플릿 끝에 *"기획을 담기 시작하면 plan source가 필요하다는 신호"*. `init` 뒤에도 계속 쓰이는 규칙이라 skill이 아니라 씨앗의 것이다.

`summary.md`의 skill 수를 7로 고쳤다. `bun test` 116 · `typecheck` 0 · `hook.test.sh` 전부 통과.

## Dead Ends

**`interview`를 먼저 닫고 `init`을 별도 milestone으로.** 순수하지만 `interview`를 쓸 곳 없이 만들게 된다 — 소비자 없이 경계를 정했다가 `ms-005`·`ms-010`이 틀린 것을 세 번째로 겪는 길.

**`init` 먼저, 묻는 규율은 임시로 `init`에.** 빠르지만 "규율의 소유자는 한 곳"을 알고 어기는 것.

**새 세대 유형 `init`.** 프로젝트당 한 번이라 순번이 의미를 갖지만 id 계열·`map.md`·축 판단이 전부 늘고, 한 번 쓰고 마는 유형에 구조를 쓴다. plan 세대로 충분하다.

**`ms-007`을 닫고 새로 자르기.** `ms-005`와 달리 틀린 게 아니라 좁았고, 한 세대도 안 돌아 fitness가 없다.

## Open Questions

`ms-007`의 Open Questions로 넘겼다 — "모호하다"의 판정, 이미 답한 것을 다시 안 묻는 법, `.reap/` 없는 곳에서 `init`을 알게 하는 법, 씨앗 판정을 CLI(`doctor`)가 하는가.
