---
id: gen-0095-exec
slug: site-tone
type: exec
milestone: ms-022
title: 사이트 문구를 reap.cc 톤으로 다시 쓴다 — 합니다체·완결 문장·사용자 관점
startedAt: 2026-09-04T14:06:12Z
startCommit: 4a2d7ea
status: closed
closedAt: 2026-09-04T14:20:12Z
endCommit: d7761ea
---
## Intent

사람 검수(2026-09-04): "reap.cc/ko와 비교하면 로컬 문구가 너무 AI 같다." 원인 — ko.ts가 spec·skill의 "-한다"체 단문, 중점(·)·대시 나열, 설계 근거 서술을 그대로 옮겼다. reap.cc/ko(v0.17 ko.ts)는 "-합니다"체 완결 문장, 사용자 관점의 설명, 용어는 영문 고유명사(Generation·Milestone)로 쓴다. 13쪽 문구 전부를 그 톤으로 다시 쓴다. 키·구조·페이지 JSX는 그대로.

## Delegation

brief로 subagent에게 — 주 트리(dev 서버 5174 유지). `make`·`mark` 금지.

## Outcome

`site/src/i18n/translations/ko.ts` 838줄 전체를 다시 썼다. 타입 인터페이스(1~281줄)와 CLI 실제 출력을 그대로 옮긴 코드 블록(`cli.usage`, `orchestrate.rosterCode`)은 손대지 않았다. 나머지 서술문은 "-한다/-이다"체를 "-합니다/-입니다"체로, 중점(·)·대시(—) 나열을 쉼표와 완결 문장으로 바꾸고, `hero.whyReap`을 "왜 REAP인가?"로 되돌리고 `hero.problems`를 사용자 문제 → REAP 해결 짝으로 다시 썼다. 설계 근거 서술("그 경직성을 유지하려고 …")은 무엇이 바뀌었는지만 남기고 지웠다. 페이지 JSX(`site/src/pages/*.tsx`, `site/src/components/*.tsx`)에는 하드코딩된 한국어가 없어 손댈 곳이 없었다.

전후 비교 세 쌍:

1. `hero.whyReap` / `hero.whyReapDesc`
   - 전: "무엇이 달라졌나" / "전작은 5단계 lifecycle을 강제하는 파이프라인 실행기였다. 그 경직성을 유지하려고 스크립트와 서명 잠금을 계속 늘려야 했다. REAP는 그 반대로 간다."
   - 후: "왜 REAP인가?" / "이전 버전은 다섯 단계로 이루어진 lifecycle을 강제로 따르게 하는 파이프라인 실행기였습니다. REAP는 이제 흐름을 고정하지 않고, skill이 상황에 맞게 판단하는 방식으로 바뀌었습니다."

2. `hero.problems[0]`
   - 전: `{ problem: "파이프라인이 흐름을 강제했다", solution: "흐름은 CLI가 아니라 skill이 판단한다 — 통과·차단하는 게이트가 없다" }`
   - 후: `{ problem: "흐름이 파이프라인에 고정됨", solution: "이제는 CLI가 아니라 skill이 흐름을 판단합니다. 통과시키거나 막는 게이트를 두지 않습니다." }`

3. `concepts.splitNote`
   - 전: "fix가 milestone을 갖지 않는 이유는 작아서가 아니다. milestone은 새 의도에 경계를 주는 장치인데, 되돌리는 일은 새 의도를 만들지 않는다 — 되돌아갈 곳 자체가 이미 경계다. 크기는 축을 가르는 기준이 아니다: 작은 새 기능도 fix가 아니라 exec이다."
   - 후: "fix가 milestone을 갖지 않는 이유는 작아서가 아닙니다. milestone은 새 의도에 경계를 주는 장치인데, 되돌리는 일은 새 의도를 만들지 않습니다. 되돌아갈 곳 자체가 이미 경계입니다. 크기는 축을 가르는 기준이 아닙니다. 작은 새 기능도 fix가 아니라 exec입니다."

검사 수치 (전 → 후, 코드 블록 안 실제 CLI 출력 2건은 의도적으로 유지):
- `한다.`/`이다.` 매치: 39 → 1 (남은 1건은 `cli.usage` 코드 블록 안 실제 CLI 출력)
- 중점(·) 개수: 199 → 1 (남은 1건은 `orchestrate.rosterCode` 코드 블록 안 주석)

검증:
- `npx tsc --noEmit -p site/tsconfig.json` 통과
- `bun run --cwd site build` 통과, `bash scripts/check-docs-prerender.sh` PASSED (13 page, exit 0)
- `dist/public/index.html`(prerender 결과)에 새 문구("왜 REAP인가?", "AI와 사람이 함께 진화시키는 개발 규약과 도구") 확인. dev 서버(5174)는 Vite SPA라 curl 본문이 빈 셸(`<div id="root">`)만 보이는 것이 정상 — HMR로 최신 소스를 물고 있고 200을 반환해 살아있음만 확인, 죽이지 않았다.
- `./dist/reap doctor` — 결함 0 (참고 1건은 map.md 관련, 이 세대와 무관)
- `git status --porcelain` — `site/src/i18n/translations/ko.ts` 1개만 수정, 커밋 전 상태

## Dead Ends

- `hero.problems`를 "사용자 문제 → REAP 해결" 형식으로 되돌리며 원래 있던 "작업 단위가 하나였다"류 4개 항목의 사실 내용은 유지했다. 새 항목을 추가하거나 순서를 바꾸지 않았다 — 브리프가 "내용은 바꾸지 않되 표현을 바꾼다"고 명시했기 때문.
- 표(table) 셀 중 다중 문장으로 된 설명(`cli.commands`, `skills.skillList`)은 명사구로 축약하지 않고 합니다체 문장으로 풀었다 — 브리프가 "표의 셀은 명사구 허용"이라 했지만 원문 자체가 이미 완결 서술이라 명사구로 줄이면 정보 손실이 생겨서 문장 형태를 유지했다.
- `orchestrate.worktreeTitle`/`claimTitle`/`barrierTitle`/`rosterTitle` 같은 동사형 소제목은 v0.17 참고 문서에 정확히 대응하는 사례가 없어, "확률에 의존하면 안 되는 것만 스크립트가 소유합니다" 같은 다른 소제목과 톤을 맞춰 합니다체 완결 소제목으로 직접 판단해 바꿨다.
