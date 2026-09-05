---
id: gen-0094-exec
slug: site-v018change
type: exec
milestone: ms-022
title: 홈 breaking change 띠와 /docs/v018change 페이지
startedAt: 2026-09-04T02:58:07Z
startCommit: 666fa90
status: closed
closedAt: 2026-09-04T03:05:26Z
endCommit: c87f5a0
---
## Intent

사람 요청(2026-09-04): 홈 상단 헤더바 바로 아래에 약 50px 높이의 breaking change(v0.18.0) 띠 — `/docs/v018change`·`/docs/migration` 링크. 그리고 `/docs/v018change` 페이지 신설: 무엇이 바뀌었는가(두 산출물·3단 저장소·loop/milestone/generation·skill 10종·hooks·en 기본·ko 카탈로그, 사라진 것, 오는 법). 사이드바·라우트·prerender 목록에 추가.

## Delegation

brief로 subagent에게 — 주 트리(dev 서버가 여기서 돌고 있어 사람이 바로 본다). `make`·`mark` 금지.

## Outcome

- 홈 띠: `HeroPage.tsx`에 `BreakingChangeBand` 추가 — `AppNavbar` 바로 아래,
  full-width, `min-h-[50px]`, orange 콜아웃 톤(`border-orange-500/30
  bg-orange-500/10 text-orange-400`, 링크 `text-orange-300`). 문구·링크 텍스트는
  `ko.ts`의 `hero.breakingBand`. `/docs/v018change`·`/docs/migration` 링크 둘.
  좁은 화면에서 `flex-wrap`으로 두 줄 접힘. 홈에만 있다 — `DocLayout`은 안 건드렸다.
  (commit 0a8c3bd)
- `/docs/v018change` 페이지: `V018ChangePage.tsx` 신설. 절 다섯 — 한 문단(파이프라인
  실행기→규약과 도구) · v0.17→v0.18 대응표(10행, brief 그대로) · 사라진 것(13항목,
  01-gap "만들지 않는다" 표를 압축) · 그대로인 것(genome 3종·environment·backlog·
  코드 인덱스·hooks 자리) · 이주 가이드 링크. `routes.ts`·`AppSidebar.tsx`(시작하기
  그룹, 소개 다음)·`ko.ts`(`nav.items.v018change`·`v018change` 블록) 배선.
  (commit d1b2899)
- 검증: `npx tsc --noEmit -p site/tsconfig.json` 통과. `bun run --cwd site build`
  (client+SSR+prerender) 13쪽 산출. `bash scripts/check-docs-prerender.sh` 결함
  0(라우트 수는 `routes.ts`에서 자동 파싱 — 스크립트 자체 수정 불필요). dev 서버
  죽이지 않고 `curl localhost:5174/`·`/docs/v018change` 200 확인. `./dist/reap
  doctor` 결함 0(map.md 참고 1건은 기존).
- `.reap/vision/milestones/ms-022-v018-site/handoff.md`의 라우트 표를 열둘→열셋으로
  갱신, `/docs/v018change` 행 추가.

세대는 열어둔다 — `complete` skill로 닫는 것은 위임자 몫.
