---
id: gen-0096-exec
slug: site-toc-start
type: exec
milestone: ms-022
title: 문서 목차 골격 28라우트, 홈 복원, 시작하기 4쪽
startedAt: 2026-09-04T14:24:08Z
startCommit: 6126ecc
status: open
---
## Intent

ms-022 task 3 — tasks/3-toc-home-start.md 전부. 홈은 v0.17 홈 구성·메시지 그대로에서 사실만 교체. 시작하기 4쪽은 reap.cc 톤. 끝은 build·prerender 통과, 사람 검수 대기.

## Delegation

brief로 subagent에게 — 주 트리(dev 서버 5174 유지). `make`·`mark` 금지.

## Outcome

task 3 전부(A 목차 골격·B 홈 복원·C 시작하기 4쪽) 마쳤다. 위 "부분 — 홈 복원만" 절은 그 시점 상태이고, 이어서 A·C를 마저 했다.

### A. 목차 골격

`routes.ts`에 홈 + 29쪽 = 30라우트(A/B/C 표 기준 8묶음). `AppSidebar`의 `useNavGroups`와 `ko.ts`의 `nav.groups`·`nav.items`를 8묶음(시작하기·핵심 개념·Plan 축·Execution 축·지식·협업·레퍼런스·기타)으로 다시 짰다.

- 라우트만 옮기고 내용은 유지: skills→`/docs/skill-reference`, cli→`/docs/cli-reference`, code-index→`/docs/code-intelligence`(breadcrumb "레퍼런스"→"지식"), hooks·orchestrate는 breadcrumb만 "레퍼런스"→"협업"으로. migration·release-notes는 그대로.
- 없어진 쪽: `concepts.tsx`·`install.tsx`를 지웠다. install의 CLI+plugin 설치 절차는 quick-start로 옮겼다(아래 C). concepts의 나머지 내용(세 개의 층, 작업 단위, 3단 저장소)은 이번에 옮기지 않았다 — `two-axes`·`storage`는 이번 task 범위인 "시작하기"가 아니라 다음 task("핵심 개념+Plan 축")의 것이라 지금은 placeholder다. 잃지 않는다 — git 이력(`02d7457`)에서 그대로 복구 가능하다.
- placeholder 18쪽: `PlaceholderPage.tsx`(`makePlaceholderPage(key)`)가 `t.placeholder.pages[key]`의 title/breadcrumb/description만 받아 "이 문서는 준비 중입니다." 한 줄을 낸다. 개별 파일을 18개 두지 않았다.
- `check-docs-prerender.sh`는 `routes.ts`의 `path:` 줄 개수를 세므로 그대로 30을 잡았다 — 스크립트 수정 불필요.

### B. 홈 복원 (이어서)

"부분" 절 이후 team-lead의 후속 브리프가 "구조" 카드를 4장에서 6장으로(Plan·Civilization 추가), "작업 흐름" 표 열을 v0.17과 같은 단계·수행 내용·산출물로 바꾸라고 했다. 반영했다:

- 구조: Knowledge(genome+environment) · Plan(plan source+loop) · Vision(milestone+memory) · Life(generation+backlog) · Archive · Civilization(코드) 6장.
- 작업 흐름 표: 열을 단위·무엇을 하는가·관련 skill → 단계·수행 내용·산출물로, 세 번째 칸을 skill 이름 대신 실제 저장 경로(`life/loops/<id>.md` 등)로.
- 문서 링크 12개 → 새 목차 대표 10개(introduction·quick-start·autonomous-evolution·v018change·skill-reference·cli-reference·hooks·code-intelligence·orchestrate·migration).
- 설치 링크를 `/docs/install`(삭제됨)에서 `/docs/quick-start`로.
- HeroPage.tsx 자체의 JSX는 이미 각 배열을 제네릭하게 순회하므로 손댈 필요가 없었다 — 링크 한 줄만 고쳤다.

### C. 시작하기 4쪽

- **소개**: v0.17 골격(정의 문단·왜 REAP인가 표·구조 개요 6장·프로젝트 구조 트리·다음 쪽 링크)으로 다시 썼다. 이전에 있던 "무엇이 달라졌나"·"일곱 원칙" 절은 뺐다 — 전자는 이미 v018change 쪽이 다루고, 후자는 이번 브리프의 요구 골격에 없다. git 이력(`02d7457`)에서 복구 가능.
- **첫 사용**: 기존 skill 3단계(init·evolve·complete)와 실제로 찍은 `reap ctx` 상태 줄 예시는 유지하고, 앞에 전제 조건 표(Node 20+·Claude Code·git)와 두 단계 설치(CLI npm 전역 설치 + Claude Code 플러그인)를 추가했다 — install 쪽이 흡수되며 옮긴 내용이다. 끝에 다음 단계 링크(자율 진화 흐름·소개) 추가.
- **자율 진화 흐름**(신설): SessionStart 훅이 매 세션 싣는 것(genome·environment 요약·상태 줄) → 실물 상태 줄 예시(아래) → evolve의 세 판단(열 값이 있는가/loop인가 generation인가/직접인가 위임인가) → 자율 구간에 REAP가 관여하지 않는다는 것 → complete의 커밋 규칙 → milestone이 끝날 때만 받는 사람의 fitness.
- **v0.18에서 바뀐 것**: 내용은 그대로 두고 톤만 확인 — `intro`·`sameDesc` 두 문장이 "-다"체였던 것을 "-습니다"체로 고쳤다. 나머지(표·목록)는 명사구라 톤 대상이 아니다.

실물 상태 줄은 스크래치 리포(`/private/tmp/.../scratchpad/site-examples/`)에서 `git init` → `./dist/reap init` → `make loop --type plan` → `make milestone --focus` → `make generation --milestone` → `config.yml`에 `language: ko` → `reap ctx`로 새로 찍었다(첫 사용 쪽의 기존 예시와 같은 형태, 커밋 해시만 다르다).

### 검증

- `npx tsc --noEmit -p site/tsconfig.json` — 통과, 결함 0
- `bun run --cwd site build` — client+SSR+prerender, "prerendered 30 page(s)"
- `bash scripts/check-docs-prerender.sh` — PASSED, 30 page, 30 title 전부 유일, meta description 전부 20자 이상(claim-barrier·environment 두 쪽이 처음엔 20자 미만이라 FAIL했고, 문장을 늘려 재통과시켰다)
- 홈·소개·첫 사용·자율 진화 흐름·placeholder 한 쪽(`two-axes`)의 prerender 산출물에서 실제 한국어 텍스트 확인, `undefined` 없음
- dev 서버(5174) 유지, `curl localhost:5174/`·`/docs/autonomous-evolution`·`/docs/two-axes` 전부 200
- `./dist/reap doctor` — 결함 0, 참고 1(map.md가 씨앗과 다르다 — 이 리포가 이미 커스텀한 상태, 이번 작업과 무관)
- `git status --porcelain` — 커밋 후 clean

### Dead Ends

- `t.skills`·`t.cli`·`t.codeIndex` 같은 ko.ts 내부 키 이름을 라우트에 맞춰(`skillReference` 등) 바꾸는 것을 고려했다가 접었다 — 이미 정확하고 방대한 콘텐츠(skills/cli/hooks/codeIndex/orchestrate/migration/releaseNotes, 총 300줄 이상)를 건드릴 위험 대비 얻는 것이 없었다. nav 쪽만 새 키(`skillReference`·`cliReference`)로 분리해 라우트/사이드바 이름과 내부 데이터 키를 독립시켰다.
- concepts의 "세 개의 층"·"3단 저장소" 내용을 지금 `two-axes`/`storage` placeholder에 욱여넣는 것도 고려했다 — G10 규범의 "쓰는 순서: 홈+시작하기 → 핵심 개념+Plan 축 → …"를 따라 이번 task 범위 밖으로 남겼다. 다음 task가 그 내용을 git 이력에서 가져다 쓰면 된다.

## Next

다음 task(4)는 "핵심 개념+Plan 축" 8쪽(two-axes·three-layers·storage·loop·plan-source·idea·carve-milestone) 채우기다. `concepts.tsx`(git 이력 `02d7457`)에 layersTitle/unitsTitle/splitHeaders/storageTree 등 재사용 가능한 초안이 있다.
