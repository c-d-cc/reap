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

## Outcome (부분 — 홈 복원만)

task 3 중 "홈" 항목만 완료했다. "목차 골격 28라우트"와 "시작하기 4쪽"은 아직이다.

사람 검수(2026-09-04)로 범위가 두 번 좁혀졌다: 처음엔 홈의 구성·메시지 자체를 v0.17 reap.cc 홈과 같게 되돌리라는 지시, 다음엔 다른 문서 페이지 문체 교정은 하지 말고 홈 복원만 마치라는 지시. 이 커밋 이전에 이미 `site/src/i18n/translations/ko.ts`의 `hero` 블록과 `site/src/pages/HeroPage.tsx`가 다른 병행 작업(6126ecc)에 함께 커밋되어 있었다 — 내용은 아래와 동일하고, `ko.ts`의 `hero` 외 페이지(intro·install·quickstart·concepts·skills·cli·hooks·codeIndex·orchestrate·migration·releaseNotes)는 이전 세대(gen-0095)에서 손댔던 톤 교정을 전부 되돌려 pristine(acbf001 시점) 그대로다 — `git diff 02d7457 HEAD -- site/src/i18n/translations/ko.ts`가 hero 블록 두 hunk(타입 35~43줄, 값 305~374줄)만 보인다.

홈 섹션 목록 (전 → 후):

1. Header — 변함없음. `tagline`만 "작업의 모양을 결정하지 않는다." → v0.17 그대로 "Recursive Evolutionary Autonomous Pipeline"으로. `description`은 v0.17 문장 뼈대("AI와 인간이 협업하여 … 세션 간 컨텍스트가 유지되고 … 설계 문서가 코드와 함께 진화합니다")를 유지하고 사실만 교체 — 5단계 lifecycle → loop·milestone·generation 작업 흐름, "개발 파이프라인" → "규약과 도구".
2. "무엇이 달라졌나"(hero.whyReap 자리에 있던 v0.18 재설계 서사, 문제 4개) → **왜 REAP인가?** — v0.17과 같은 문제 5개(컨텍스트 손실·산발적 개발·설계-코드 괴리·잊혀진 교훈·협업 혼란), 해결 문구만 v0.18 사실로 교체(SessionStart 훅·genome 주입 / milestone·generation / plan source·backlog / lessons·archive / orchestrate).
3. "세 개의 층"(판단·확정·사실 추상 카드 3장) → **구조**(신설, v0.17 "4계층 아키텍처" 자리) — `.reap/` 네 자리: genome+environment · vision · life · archive, 카드 4장.
4. (없었음) → **작업 흐름**(신설, v0.17 "Generation 라이프사이클" 자리) — loop → milestone → generation → complete pill 행 + 표(단위·무엇을 하는가·관련 skill).
5. 설치 — 내용 그대로 유지(CLI 전역 설치, Claude Code 초기화).
6. "일곱 원칙 중 셋" → **핵심 개념** — Genome 불변성·Backlog·Milestone과 fitness·Loop·Archive·Orchestrate 6개.
7. 문서 링크 — 목록 그대로, 문구만 합니다체로 다듬었다.

검증: `npx tsc --noEmit -p site/tsconfig.json` 통과. `bun run --cwd site build` 통과, `bash scripts/check-docs-prerender.sh` PASSED(13 page). `dist/public/index.html`에 "Recursive Evolutionary Autonomous Pipeline"·"왜 REAP인가?"·"구조"·"작업 흐름" 확인. `./dist/reap doctor` 결함 0. dev 서버(5174) 유지, curl 200. `git status --porcelain` clean(작업이 이미 6126ecc에 커밋됨).

남은 일(이 delegate 범위 밖): 목차 골격 28라우트(`routes.ts`·`AppSidebar`·자리 표시 페이지)와 시작하기 4쪽(소개·빠른 시작·자율 진화 흐름·v0.18에서 바뀐 것)은 손대지 않았다. 세대를 닫지 않는다.
