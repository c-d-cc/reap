---
id: gen-0104-exec
slug: setup-command
type: exec
milestone: ms-025
title: reap setup — 플러그인 설치를 CLI가 대신한다, init 연동, doctor 참고, v0.17 명령 shim
startedAt: 2026-09-05T01:09:31Z
startCommit: 71c6acb
status: open
---

## Intent

ms-025 tasks/1. `npm i -g @c-d-cc/reap` 하나로 설치가 끝나게 — CLI가 `claude` CLI를 불러 마켓플레이스 등록과 플러그인 설치를 대신한다(`reap setup`, `init`이 함께 부름). 0.17 사용자가 손으로 0.18을 설치한 직후 v0.17 훅이 부르는 `reap load-context`에 0.18이 안내로 답해 다음 길(`reap setup` → 새 세션 → `/reap:migrate`)이 세션 문맥에 들어간다. doctor는 플러그인 부재를 참고로 보고한다.

끝나는 조건은 tasks/1의 여섯 줄. postinstall은 쓰지 않는다.

## References

- ms-025 milestone.md Background — 사람 결정(2026-09-05) 둘
- `~/cdws/reap_v17` v0.17.7 `check-version.ts` 5번 guard — "Breaking change detected … Run: …" 메시지가 0.17 사용자의 첫 안내
- 이 세션에서 `claude plugin marketplace add`·`claude plugin install … -y`가 비대화식으로 동작함을 실측
