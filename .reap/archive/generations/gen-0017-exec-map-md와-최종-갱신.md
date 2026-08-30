---
id: gen-0017-exec
slug: map-md와-최종-갱신
type: exec
milestone: ms-002
title: map.md와 최종 갱신
startedAt: 2026-08-23T01:35:51Z
startCommit: 73fe3dd
status: closed
closedAt: 2026-08-23T01:40:34Z
endCommit: f843e37
---

## Intent

Task 2.4 — ms-002의 마지막 task. `map.md` 씨앗 템플릿을 만들어 `SEEDS`에 넣고, `ctx`의 상태 줄에 `구조: .reap/map.md` 한 줄을 낸다(빈 파일이면 줄을 안 낸다). 그리고 플러그인 skill·훅·이 리포 전체가 새 레이아웃·새 id·`cleanup`을 아는지 최종 검증한다.

무엇이 되면 끝인가: `context.md`의 검증 넷(`bun test`·`typecheck`·`hook.test.sh`·`build`)이 통과하고, 빈 임시 프로젝트에서 `init`부터 `mark milestone --closed`까지 손으로 한 바퀴 돌려 각 단계의 `ctx`가 옳으며, `.reap/` 안 모든 상대 링크가 실제로 존재하고, `evolve`가 안내하는 경로가 실존한다.

## Outcome

- `src/templates/map.md` 신설, `src/templates.ts`의 `BUNDLED`와 `src/store.ts`의 `SEEDS`에 등록. 씨앗이므로 이미 있으면 `init`이 덮어쓰지 않는다(기존 SEEDS 동작 그대로, 테스트로 확인)
- `src/ctx.ts`의 `status()`가 `구조: .reap/map.md` 한 줄을 낸다 — `map.md`가 비어 있으면(또는 없으면) 그 줄을 안 낸다. memory·idea 줄과 같은 `nonEmpty` 규칙 재사용
- 이 리포 자신의 `.reap/`에 `init --force`로 `map.md`를 채웠다(다른 씨앗은 이미 있어 안 건드림)
- `plugin/skills/complete/SKILL.md`에 "milestone을 닫은 다음 `cleanup`을 부른다"를 명시 — `cleanup/SKILL.md`는 이미 이걸 전제하고 있었는데 `complete` 쪽에 대응하는 문장이 없었다
- 옛 id 형식(`exec-NNN`·`plan-NNN`)과 옛 레이아웃(`plan/generations/`, `milestones/<ms>/generations/`) 잔재를 리포 전체(`plugin/`·`docs/`·`.reap/`)에서 검색 — 남아있는 것은 전부 마이그레이션을 설명하는 역사적 인용이거나 매핑 표였고, 살아있는 경로·참조는 없었다(2.2·2.3이 이미 처리)
- `plugin/skills/evolve`가 안내하는 경로(`life/generations/<gen-id>-<slug>.md`, `handoff.md` 등)와 마크다운 링크(`../shared/references/record-vocabulary.md`)를 실제 파일과 대조 — 전부 존재
- `.reap/`·`plugin/`·`docs/superpowers/specs/reap/` 안의 모든 상대 링크(49개)를 스크립트로 전수 검사 — 깨진 것 없음
- 빈 임시 프로젝트(`/private/tmp/.../scratchpad/walkthrough`)에서 `init` → `make milestone` → `make generation`을 `--plan`·`--milestone`·`--fix` 셋 다 → 각각 커밋 → `mark generation --closed` → `mark generation --archived` → `mark milestone --closed`까지 손으로 돌리며 매 단계 `reap ctx` 출력을 확인 — milestone·세대 표시, 닫힘 후 사라짐, archive 후 경로 이동이 전부 옳았고 옛 경로는 한 번도 나오지 않았다. 임시 디렉토리는 검증 후 삭제해 이 리포에 흔적이 없다
- `ms-002-저장-구조와-세대-유형/milestone.md`의 작업 갈래 표에서 2.4를 완료로 표시, `handoff.md`를 이 세대 기준으로 교체

## Dead Ends

없음 — 이번 task는 앞 셋(2.1·2.2·2.3)이 이미 다져놓은 위에 map.md와 문서 갱신을 얹는 일이라 접은 접근이 없었다.

## 남은 것

**실제 대화형 세션을 열어 SessionStart 훅 주입을 보는 것은 이 세션이 할 수 없다.** `./tests/hook.test.sh`로 스크립트 동작(단순 정상 케이스와 `reap`가 PATH에 없는 경우 포함)을 확인했을 뿐이다.
