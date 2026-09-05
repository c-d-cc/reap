---
id: gen-0103-exec
slug: home-cleanup-script
type: exec
backlog: bk-ed1df6
title: migrate 8/8 홈 자산 정리를 스크립트로
startedAt: 2026-09-05T00:51:26Z
startCommit: f697c3b
status: closed
closedAt: 2026-09-05T00:52:22Z
endCommit: 444526d
---

## Intent

사람 질문(2026-09-05): "v0.17 사용자가 migrate를 했을 때 전역에 설치돼 있던 old skill·old cmd는 삭제되는가?" 조사 결과 — 삭제는 **지시문**으로만 있다. 0.17.8 upgrade agent는 정리를 migrate 마지막 단계에 넘기고(`docs/upgrade-agent/reap-upgrade.md` §5), migrate 8/8은 migration-map의 allowlist 표를 보고 에이전트가 손으로 지우게 한다. settings.json JSON 편집도 손이다. 실제 이주(selfview)에서는 자산이 이미 없어 이 경로가 한 번도 돌지 않았다. allowlist 자체도 gen-088의 코드와 어긋난다 — `~/.reap/.install-stamp`가 빠졌고, "settings.json의 marketplace/plugin 키"를 지우라고 하는데 v0.17은 그런 키를 쓴 적이 없고 그 키는 **v0.18 플러그인 등록**이라 지우면 방금 설치한 플러그인이 사라진다.

끝나는 조건:
- `scripts/cleanup-home.mjs [--apply] [--home <dir>]` — 기본은 목록만(아무것도 안 지움), `--apply`가 allowlist만 지운다. allowlist = gen-088 코드 그대로: `~/.claude/commands/reap.*.md`(reapdev.* 제외), `~/.claude/agents/reap-*.md`, settings.json SessionStart 중 command에 `reap check-version`/`reap load-context`가 든 항목만, `~/.reap/{reap-guide.md,.install-stamp,version-check.json,daemon/}`. settings.json은 파싱 → 항목 제거 → JSON 검증 → 임시 파일 → rename
- migration-map 8/8 표를 그 allowlist로 정정하고 "v0.18 플러그인 등록 키(`enabledPlugins`·`extraKnownMarketplaces`)는 건드리지 않는다"를 명시. 절차: `--list` 출력을 보이고 동의 → `--apply` → 출력을 기록 파일 `## Home cleanup`에
- SKILL 8/8이 스크립트를 부른다
- `tests/migrate-scripts.test.sh`에 가짜 HOME 케이스: 목록 모드는 무변경, apply는 allowlist만 지우고 사용자 파일·다른 훅·`enabledPlugins`는 남는다

## References

- `docs/reap-plan/reap_v_0_18_migration/04-migration-skill.md` "홈 자산 정리" — gen-088 allowlist 승계 결정
- `~/cdws/reap_v17/src/adapters/index.ts` `REAP_HOME_ENTRIES`, `src/adapters/claude-code/install.ts` `REAP_SESSION_HOOKS`·`unregisterSessionHooks` — 원본 allowlist
- bk-ed1df6

## Outcome

commit 444526d(주 트리)·tests submodule f62a5ba. `tests/migrate-scripts.test.sh` 71 PASS(cleanup 18 추가), doctor 결함 0, 플러그인 재설치(캐시 = 작업 트리).

- `plugin/skills/migrate/scripts/cleanup-home.mjs [--apply] [--home <dir>]` — 기본 목록만, `--apply`가 allowlist만 제거. settings.json은 `hooks.SessionStart` 중 command에 `reap check-version`/`reap load-context`가 든 항목만 빼고 JSON 검증 뒤 temp→rename. 깨진 JSON이면 손대지 않고 말한다. `~/.reap/`의 사용자 파일은 kept로 보고
- migration-map 8/8 표를 allowlist 실물로 정정(`.install-stamp` 추가, marketplace 키 삭제 지시 제거 + "v0.18 등록 키는 건드리지 않는다" 명시). 기록 파일 `## Home cleanup`은 스크립트 출력
- SKILL 8/8: 두 번 호출(목록 → 동의 → apply), 손으로 지우지 말 것

## Dead Ends

- 정리를 5/8(v0.18 init 직후)로 당기는 안 — 이주가 실패해 되돌릴 때 v0.17 slash command가 다시 필요할 수 있다. 검증 뒤(8/8)가 맞다
- `~/.reap/`을 비어 있으면 지우는 gen-088의 행동 — 이 스크립트는 하지 않는다. 디렉토리 하나가 남는 비용보다 사용자 파일을 세는 로직이 틀릴 위험이 크다
