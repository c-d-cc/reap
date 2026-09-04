---
id: gen-0090-exec
slug: i18n-docs
type: exec
milestone: ms-021
title: README en/ko·RELEASE_NOTES en·genome 규칙·0.17.8 노트 정정·왕복 재검증
startedAt: 2026-09-04T01:14:06Z
startCommit: 1cf8939
status: open
---
## Intent

ms-021 task 3 — `README.md` en(현재 본문은 `README.ko.md`로), `RELEASE_NOTES.md` 0.18.0 절 en("한국어 전용" 삭제, en 기본·ko 카탈로그), `.reap/genome/application.md` 문자열 규칙 갱신, `~/cdws/reap_v17`의 0.17.8 노트·NOTICE·로케일에서 "Korean-only" 문장 제거(문서 편집만, v0.17 바이너리 실행 금지), 왕복 1(`verify-package.sh` + `--plugin-dir` 1회)을 en으로 재확인. skill description의 한국어 트리거 예시는 그대로 둔다(한국어 사용자의 진입 문구).

## Delegation

brief로 subagent에게. worktree `../reap-wt-i18n`(브랜치 `ms-021-i18n`, v0.18과 동기).

## Outcome

- `README.md`를 en으로 새로 쓰고 기존 한국어 본문은 `git mv`로 `README.ko.md`에 보존했다. 절 구조 동일(설치·첫 사용·v0.17에서 옴(언어 절 포함)·명령 표면·제거·개발). 각 머리에 상대 링크로 서로를 가리키는 한 줄을 넣었다. "다국어 지원 — 한국어 전용" 항목은 지우고 언어 절로 교체했다(en 기본, `config.language: ko` 또는 `REAP_LANG=ko`, agent는 `Response language` 줄로 사용자 언어 답변). 커밋 `4159067`
- `RELEASE_NOTES.md`의 `## v0.18.0` 절을 en으로 재작성. "한국어 전용" 항목 삭제, "English by default; `config.language: ko` switches CLI output to Korean" 항목 추가. 첫 `## ` 블록 하나만 유지, 하위는 `###`. 커밋 `adcd8f9`
- `.reap/genome/application.md`의 "사용자에게 보이는 문자열은 한국어"를 "사용자 문자열은 카탈로그(`src/messages/`, en 기본·ko)를 거친다. skill·씨앗은 en"으로 갱신. 커밋 메시지 규칙(한국어)은 유지. 커밋 `dc477b9`
- `~/cdws/reap_v17`(브랜치 `v0.17`)에서 문서만 정정: `RELEASE_NOTES.md` What's New의 "v0.18 is Korean-only" 항목, `RELEASE_NOTICE.md` 0.17.8 en/ko 줄, `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts`의 0.17.8 엔트리에서 "Korean-only"/"한국어 전용" 문장을 "v0.18 speaks English by default; set `language: ko` in `.reap/config.yml` for Korean"(각 언어로 번역)으로 교체. `bash scripts/check-docs-version.sh` 그린(exit 0) — NOTICE 최신 항목 v0.17.8 일치, RELEASE_NOTES What's New 4개 항목, 로케일 5종 최신 버전·집합 일치 26개 항목. `reap`·`npm run build`·`bun test`는 실행하지 않았다(v0.17 바이너리가 첫 실행에 홈에 자기설치하는 문제 회피). 커밋 하나 `be2664a`, push 없음
- 왕복 재검증: `bash scripts/verify-package.sh` — build:node·npm pack(금지 경로 없음)·PATH에서 bun 제거한 전역 설치·모든 명령(`--version`·`init`·`make loop`·`make milestone`·`make generation`·`mark generation`·`ctx --hook`·`doctor`·`plan sources`·`index update/status`·`orch claim/release`) 전부 en 출력으로 PASS, exit 0
- `claude --plugin-dir` 1회: `bun run build`로 `dist/reap`를 만들고(0.18.0), 임시 리포(`/private/tmp/.../scratchpad/i18n-docs`)에서 `dist/reap init` 후 `claude --plugin-dir <worktree>/plugin -p "..."`를 이 worktree의 `dist/reap`를 PATH 앞에 놓고 실행 — 상태 블록이 정확히 `<!-- reap status -->` / `Response language: en` / `Memory: .reap/vision/memory/lessons.md` / `Structure: .reap/map.md` / `To start work, /reap:evolve; to wrap up, /reap:complete`로 나왔고, `/reap:` skill 10종(init·evolve·complete·loop·carve-milestone·interview·orchestrate·cleanup·migrate·report-issue) 이름이 모두 en으로 열거됐다
- `./dist/reap doctor` — 결함 0 · 참고 1(`map.md`가 씨앗과 다르다 — 이 리포 실물이 한국어 사용자 문서라 en 씨앗과 항상 다름, 정상)

## Dead Ends

- 처음 돌린 `claude --plugin-dir ... -p "..."`가 여전히 한국어 상태 줄(`<!-- reap 상태 -->`, `기억:`, `구조:`)을 냈다. 원인은 이 worktree의 en 카탈로그 빌드가 아니라, PATH 상의 `reap`가 `/Users/hichoi/cdws/reap2/dist/reap`(버전 0.1.0, 무관한 리포의 낡은 바이너리)를 가리키고 있었던 것 — SessionStart 훅(`plugin/hooks/session-start.sh`)이 `command -v reap`로 PATH의 reap를 부른다. 이 worktree의 `dist/reap`를 `PATH`에 먼저 놓고 재실행하니 en으로 정확히 나왔다. i18n 작업 자체의 결함이 아니라 이 머신의 PATH 배선 문제 — 다른 세대가 참고할 만하다: `claude --plugin-dir`로 이 리포의 reap를 검증할 때는 항상 `PATH=<worktree>/dist:$PATH`를 앞세워야 한다
