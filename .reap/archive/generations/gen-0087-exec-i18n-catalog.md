---
id: gen-0087-exec
slug: i18n-catalog
type: exec
milestone: ms-021
title: 메시지 카탈로그와 CLI en 전환 — src 문자열 전수, 테스트 en
startedAt: 2026-09-04T00:13:39Z
startCommit: 0606374
status: closed
closedAt: 2026-09-04T00:51:06Z
endCommit: 7412377
---
## Intent

ms-021 task 1 — `src/i18n.ts` 카탈로그(en·ko, `config.language` → `REAP_LANG` → en), `src/` 사용자 문자열 전수 전환, 테스트의 한국어 리터럴 단언 제거, `hook.test.sh`·`verify-package.sh`·`detect-version.sh` 출력 en. 상태 줄 라벨 목록을 handoff에 남긴다(task 2가 skill 인용을 맞춘다). 끝은 `REAP_LANG=ko`면 한국어 usage, 없으면 en, 전 검증 초록.

## Delegation

ms-020의 실물 — `evolve/references/delegate-brief.md`를 채워 subagent에게 준다. worktree `../reap-wt-i18n`(브랜치 `ms-021-i18n`). 주 세션이 검토·닫기.

## Outcome

- `src/i18n.ts` + `src/messages/{en,ko}.ts`: `t(root, key, params?)`, 언어 해석 `config.language` → `REAP_LANG` → en. 카탈로그 158개 키, en·ko가 같은 `MessageKey` 집합을 `satisfies Record<MessageKey, string>`으로 컴파일 타임에 강제
- `src/`(cli·entries·doctor·orch·carrier·plan·ctx·hooks·id·doc·templates·index/indexer) 사용자 문자열 전수 전환. `grep -nP '[가-힣]' src/*.ts src/index/*.ts`가 주석 밖 0
- `src/store.ts`의 `Config.language` 기본값을 `"ko"`에서 `""`로 — config.yml에 language 줄이 없을 때 REAP_LANG으로 실제로 내려가게 했다(`ctx.ts`는 이미 빈 문자열을 "언어 줄 생략"으로 다뤘으므로 이쪽이 원래 의도였다)
- `src/doc.ts`의 `slugify` 빈 제목 폴백("무제")을 카탈로그 키(`doc.untitled`)로 — `root?` 파라미터를 추가하고 `entries.ts`·`plan.ts`의 호출부를 갱신
- doctor의 idea 졸업·출처 헤딩 판정어를 config.language를 따르는 카탈로그 키(`doctor.pattern.graduation`·`doctor.pattern.sources`)로 뺐다 — 이 리포 실물 idea는 한국어 헤딩, 새 프로젝트 씨앗은 en이 될 것이므로 판정어 자체가 언어를 따라가야 doctor가 양쪽에서 정확하다(handoff에 task 2용 메모)
- `id.ts`의 레지스트리 파일 헤더 주석("발급된 번호는 다시 발급되지 않는다")도 카탈로그로 — 새 `sequence/*.md` 파일에 처음 찍힐 때만 쓰인다
- 테스트: 18개 파일의 카탈로그 메시지 단언을 `t()`·`labelPrefix()`(`tests/helpers.ts` 신설)로 바꿨다. 제목·슬러그·훅 echo 본문처럼 사용자가 임의로 쓰는 fixture 데이터(한국어 포함)는 그대로 뒀다 — 카탈로그 메시지가 아니라 왕복 검증 대상이라서다
- `tests/i18n.test.ts` 신설(11개) — 키 집합 왕복, 빈 값 없음, `{param}` 치환, 없는 언어·없는 키의 en 접힘(런타임 안전망), 언어 해석 순서 셋, `REAP_LANG=ko`·없음 각각의 usage 첫 줄
- `tests/hook.test.sh`·`scripts/verify-package.sh`·`plugin/skills/migrate/scripts/detect-version.sh` 출력 en(스크립트 주석은 그대로)
- 커밋 4개: `9d64339`(카탈로그 골격) `aed9bd5`(src 전환) `e2726e8`(테스트) `28730e2`(스크립트)
- `bun test` 225 통과(1085 expect), `bun run typecheck` 초록, `bun run build` 성공, `./dist/reap doctor` 결함 0(참고 4는 이 리포에 병렬로 열려 있는 다른 세대들 — 이 세대가 만든 것이 아니다), `git status --porcelain` 빈 채로 끝난다
- 검증: `REAP_LANG=ko`면 usage 첫 줄이 "사용법: reap <명령>", `REAP_LANG` 없으면(그리고 `.reap/` 없으면) "Usage: reap <command>"

## Dead Ends

- 언어를 `run()` 시작 시점에 모듈 전역 변수로 고정하는 안 — 테스트가 여러 프로젝트를 오가며 `diagnose()`·`assemble()` 등을 `run()` 밖에서 직접 부르므로 전역 상태가 테스트 간에 새는 문제가 있어 버렸다. 대신 `t(root, key, params?)`가 호출마다 `root`로부터 언어를 순수 함수로 다시 해석한다 — 이미 거의 모든 함수가 `root`를 받고 있어 threading 비용이 작았다
