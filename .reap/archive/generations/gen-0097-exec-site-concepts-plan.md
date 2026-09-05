---
id: gen-0097-exec
slug: site-concepts-plan
type: exec
milestone: ms-022
title: 문서 핵심 개념 3쪽·Plan 축 4쪽
startedAt: 2026-09-04T15:16:19Z
startCommit: 6842be6
status: closed
closedAt: 2026-09-04T15:35:39Z
endCommit: 9c4295c
---
## Intent

ms-022 task 4 — tasks/4-concepts-plan.md의 일곱 쪽(두 축·판단확정사실·저장 구조 / Loop·Plan·Idea와 Research·Milestone 자르기). 자리 표시를 실제 내용으로. 끝은 build·prerender 통과, 사람 검수 대기.

## Delegation

brief로 subagent에게 — 주 트리(dev 서버 5174 유지). `make`·`mark` 금지.

## Outcome

일곱 쪽 전부 실제 내용으로 채웠다. 예시는 `/private/tmp/.../scratchpad/site-examples/`
임시 리포에서 `dist/reap`로 실제로 찍은 loop·milestone·generation 열고 닫는 한
줄기(인증 붙이기 → 로그인 붙이기 → 로그인 폼과 세션 발급)를 Loop·Milestone 자르기
쪽에서 공유하고, Plan 쪽은 이 리포 자신의 `plan/sources.yml`·milestone(`ms-022`)을
실물로 쓴다.

커밋 둘로 나눴다 (핵심 개념 / Plan 축), tasks/4의 라우트·행 순서를 그대로 따른다.

- `two-axes` (`TwoAxesPage.tsx`, 47줄) — 두 축이 도는 방식(세션 바인딩·동시
  개수·닫히는 조건·근거) 비교 표, 만나는 지점 다이어그램, 선형이 아니라는 절
- `three-layers` (`ThreeLayersPage.tsx`, 68줄) — 판단·확정·사실 표, CLI가
  흐름을 막지 않는 이유, `reap doctor` 실물 출력, 결함/참고 두 목록
- `storage` (`StoragePage.tsx`, 51줄) — 이 세대가 열린 시점의 이 리포
  `.reap/` 실물 트리(gen-0097·ms-022 포함), 3단을 가르는 것은 시간, 3단 밖
  자리들, map.md·`.session`/`.index`
- `loop` (`LoopPage.tsx`, 77줄) — 유형 넷 표, 여는/잇는/닫는 절차, 어휘 표,
  열린 채 두는 것이 정상이라는 절, 실물 예시
- `plan-source` (`PlanPage.tsx`, 44줄, 제목 "Plan") — 등록(`make plan-source`),
  이 리포의 실제 `sources.yml` 셋, 규약을 쓸 때 loop가 내리는 판단 여섯,
  `--ref` 인용(`ms-022`가 `ps-5e948f:07-i18n-docs-delegate.md`를 인용하는
  실례), 소비 완료 표시(`ps-4b485d`의 실제 Lifespan 절)
- `idea` (`IdeaPage.tsx`, 59줄) — research·freememo·files 표, `make idea`
  실물 예시(idea-67a149), 졸업 조건, doctor가 idea에서 보는 것
- `carve-milestone` (`CarveMilestonePage.tsx`, 75줄) — 전제를 흔적에 대보기,
  크기 기준(task 넷 안팎·세대 여섯~열, 단일 세대는 backlog로), 어휘 표,
  fitness 질문 미리 쓰기, `--focus` 규칙, plan에서 내리기, 닫는 순서 셋,
  실물 예시(ms-001 자르기→닫기)

검증: `npx tsc --noEmit -p site/tsconfig.json` 통과, `bun run --cwd site build`
성공(30쪽 프리렌더), `bash scripts/check-docs-prerender.sh` exit 0, dev 서버
(5174)에서 일곱 라우트 전부 `curl` 200, `./dist/reap doctor` 결함 0(참고 1은
`map.md` 씨앗 불일치 — 이 작업 이전부터 있던 것, 무관), `git status --porcelain`
빈 채로 커밋 두 개(`2eeb3bc` 핵심 개념 3, `decf957` Plan 축 4)로 마감.

커밋을 둘로 나누려고 `ko.ts`·`routes.ts`(두 그룹이 한 번에 편집됨)를 일단
HEAD로 되돌린 뒤 핵심 개념 세 쪽분만 재적용해 첫 커밋을 만들고, 백업해 둔
최종본으로 되돌려 Plan 축 네 쪽을 마저 커밋했다 — diff로 최종 상태가
백업과 바이트 단위로 같음을 확인했다.

nav의 `planSource` 라벨을 "Plan Source"에서 "Plan"으로 바꿨다 —
tasks/4의 규칙("plan source 대신 plan")을 따른 것.

## Dead Ends

- `plan-source` 쪽 등록부 예시로 처음엔 spec의 익명 예시(`ps-a3f8c2`,
  `prd/auth.md`)를 쓰려 했으나, 이 리포 자신이 실제로 등록해 둔 소스 셋과
  `ms-022`가 실제로 인용하는 `--ref`가 있어 그것으로 바꿨다 — 더 정확하고
  이 milestone 자체가 실례가 된다
- `storage` 쪽 트리에 `life/backlog/`의 실제 파일명을 그대로 넣으면
  한 줄이 80자를 넘는 slug라 트리가 읽기 어려워졌다. 실제 파일명 앞부분은
  살리고 "…"로 줄였다 — 디렉토리 구성 자체는 실물 그대로다
