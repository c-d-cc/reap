---
id: gen-0104-exec
slug: setup-command
type: exec
milestone: ms-025
title: reap setup — 플러그인 설치를 CLI가 대신한다, init 연동, doctor 참고, v0.17 명령 shim
startedAt: 2026-09-05T01:09:31Z
startCommit: 71c6acb
status: closed
closedAt: 2026-09-05T01:13:39Z
endCommit: 6a0ce2b
---

## Intent

ms-025 tasks/1. `npm i -g @c-d-cc/reap` 하나로 설치가 끝나게 — CLI가 `claude` CLI를 불러 마켓플레이스 등록과 플러그인 설치를 대신한다(`reap setup`, `init`이 함께 부름). 0.17 사용자가 손으로 0.18을 설치한 직후 v0.17 훅이 부르는 `reap load-context`에 0.18이 안내로 답해 다음 길(`reap setup` → 새 세션 → `/reap:migrate`)이 세션 문맥에 들어간다. doctor는 플러그인 부재를 참고로 보고한다.

끝나는 조건은 tasks/1의 여섯 줄. postinstall은 쓰지 않는다.

## References

- ms-025 milestone.md Background — 사람 결정(2026-09-05) 둘
- `~/cdws/reap_v17` v0.17.7 `check-version.ts` 5번 guard — "Breaking change detected … Run: …" 메시지가 0.17 사용자의 첫 안내
- 이 세션에서 `claude plugin marketplace add`·`claude plugin install … -y`가 비대화식으로 동작함을 실측

## Outcome

commit 6a0ce2b(주 트리)·tests 9c8bb95. `bun test` 235 통과(setup 8 추가), typecheck 통과, hook.test 통과, doctor 결함 0. 실물: 이 머신에서 `reap setup` → "이미 등록됨 / reap@reap-dev 이미 설치됨" (재실행 안전 확인), `reap load-context` → 안내 한 줄 exit 0.

- `src/setup.ts`: `setup(runner)` 3단계(claude 존재 → 마켓플레이스 → 플러그인), 필요한 것만 실행, runner 주입. `pluginInstalled(home)`은 settings.json `enabledPlugins`만 읽는다(배열·객체 둘 다). `LEGACY_COMMANDS` 14개
- `cli.ts`: `setup` 명령, default 분기에서 v0.17 명령이면 `cli.legacy_command`(exit 0), init 끝에 `cli.setup_hint`
- `doctor.ts`: 참고 `plugin_missing` — settings.json이 없으면(모르면) 말하지 않는다
- 카탈로그 en·ko에 setup.* 7·cli.* 2·doctor.* 2, 사용법에 `setup` 줄

## Dead Ends

- init이 setup을 직접 부르는 안(tasks/1 원문) — `bun test`의 init 케이스가 개발 머신에 플러그인을 설치하게 된다. v0.17이 매 명령마다 홈에 자체 설치하던 문제의 재현. 안내로 낮췄다
- 플러그인 감지를 `claude plugin list` 서브프로세스로 — doctor마다 0.5초, 그리고 claude가 없는 곳(CI)에서 판단 불가. settings.json 읽기로
- bun의 `os.homedir()`는 `HOME`을 무시한다(실측) — `process.env.HOME || homedir()`로
