---
id: gen-0098-exec
slug: site-exec-knowledge
type: exec
milestone: ms-022
title: 문서 Execution 축 4쪽·지식 4쪽
startedAt: 2026-09-04T15:35:39Z
startCommit: 9c4295c
status: closed
closedAt: 2026-09-04T15:52:02Z
endCommit: 0a68afb
---
## Intent

ms-022 task 5 — tasks/5-execution-knowledge.md의 여덟 쪽. 자리 표시를 실제 내용으로(code-intelligence는 기존 내용을 톤·목차에 맞춤). 끝은 build·prerender 통과, 검수 대기.

## Delegation

brief로 subagent에게 — 주 트리(dev 서버 5174 유지). `make`·`mark` 금지.

## Outcome

여덟 쪽을 전부 채웠다. commit `c3e1fb7`(Execution 축 네 쪽) → commit `22282b9`(지식
네 쪽, code-intelligence 톤 정리) 두 커밋. 실물 예시는 임시 리포
(`/private/tmp/.../scratchpad/site-examples`, gen-0097이 로그인 폼으로 이미 만들어
둔 것)에서 이번 리포의 `dist/reap`으로 실제로 찍었다 — `bk-1eb33a`(backlog 만들기),
`gen-0003-exec`(그 항목을 근거로 세대 열고 소비·닫기), `reap init --check`(씨앗 여섯
파일 보고), `reap doctor`(결함 0). 종료 절차 실물(fitness→cleanup→mark closed)은 이미
`ms-001-login` 아카이브가 갖고 있던 것을 그대로 인용했다.

쪽별 절과 대략 줄 수(컴포넌트 파일 기준):

- `/docs/generation`(93줄) — 두 유형과 근거 표, 세대를 열 값이 있는가(작아도 여는
  셋), `make generation` 세 형태, `.session`과 `bind`, 기록 어휘 표, 커밋 규칙,
  `mark generation`, 실물 예시
- `/docs/delegation`(66줄) — 기본은 직접(콜아웃), 위임 신호 셋, brief 항목 표(전문
  옮겨 적지 않음), subagent 규율 여덟 줄, 주 세션 검토 넷, 병렬이면 orchestrate
- `/docs/backlog`(38줄) — 만들기, exec 근거로 쓰기, 소비, life에 남는 이유와
  archive, 두 항목이 겹칠 때, 실물 예시
- `/docs/closing-milestone`(49줄) — 종료 조건 판정은 사람, fitness 질문은 자를 때
  써둔 것, 순서 셋(fitness→cleanup→mark), cleanup의 기준과 콜아웃(구체적 재개
  상황을 문장으로 쓸 수 있는가), handoff에 남길 것, lessons로 올릴 것, 실물 예시
  (`ms-001`)
- `/docs/genome`(58줄) — 세 파일 표, 매 세션 그대로 주입, 씨앗과 `init --check`
  실물 출력, init skill이 채우는 순서 넷, 크기 안내선(6.0KB/16.0KB)
- `/docs/environment`(42줄) — 세 자리 표, 무엇을 쓰고 무엇을 안 쓰는가, resources는
  색인을 안 둔다는 콜아웃
- `/docs/vision-memory`(31줄) — vision/milestones, memory/lessons.md, 나가는 문
  (졸업), handoff와 lessons의 구분, memory는 주입되지 않는다(이유 서술 없이 사실만)
- `/docs/code-intelligence` — 기존 6절 구조는 그대로 두고 문체만 "-한다"체에서
  합니다체로 고쳤다. 제목도 nav 라벨과 맞춰 "코드 인덱스" → "Code Intelligence"로
  바꿨다(다른 쪽들이 전부 영문 고유명사 제목인 것과 맞춘다)

검증: `npx tsc --noEmit -p site/tsconfig.json` 통과, `bun run --cwd site build`
(prerender 포함) 통과, `bash scripts/check-docs-prerender.sh` exit 0, 여덟 라우트
전부 dev 서버(5174)에서 curl 200, `./dist/reap doctor` 결함 0(참고 1 —
map.md 씨앗 불일치, 이 세대와 무관한 기존 상태), `git status --porcelain` 커밋마다
비어 있음.

## Dead Ends

- `/docs/closing-milestone`을 Plan 축의 `/docs/carve-milestone`(이미 승인된 쪽)의
  종료 절차 전체를 그대로 옮겨 적는 방향으로 시작했다가 접었다 — 두 쪽에 같은 벡터가
  있으면 어긋난다. carve-milestone은 자르는 시점의 관점(자를 때 함께 정하는 것들)을
  갖고, closing-milestone은 닫는 시점의 관점(cleanup의 실제 판단 기준, handoff·
  lessons로 가는 갈림)에 무게를 실어 겹침을 줄였다.
- codeIndex 값을 새로 쓰지 않고 문체만 고쳤다 — task가 "있는 내용을 새 목차·톤에
  맞춤"이라고 명시했고, 이미 승인된 6절 구조(하위 명령·언제 index/grep·해석률·
  설치 없음)가 task 표의 요구 항목을 전부 담고 있어 다시 쓰면 규범을 옮겨 적는
  것과 같은 실수(같은 사실이 두 표현으로 갈라짐)가 될 뻔했다.
