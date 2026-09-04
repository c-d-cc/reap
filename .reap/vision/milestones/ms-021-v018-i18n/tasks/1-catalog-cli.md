# 1 — 카탈로그와 CLI 전환

## 손댈 곳

| 파일 | 무엇 |
|---|---|
| `src/i18n.ts` (신규) | `t(key, params?)`, 언어 해석(`config.language` → `REAP_LANG` → en), 카탈로그 `src/messages/en.ts`·`ko.ts`(같은 키 집합, `satisfies Record<MessageKey, string>`) |
| `src/cli.ts` USAGE·에러·결과 메시지 | 전부 `t()`. usage는 한 키에 여러 줄 |
| `src/entries.ts` · `doctor.ts`(kind·detail) · `store.ts` · `plan.ts` · `orch.ts` · `carrier.ts` · `ctx.ts`(상태 줄 라벨) · `index/*` · `hooks.ts` | 사용자 문자열 전수. `grep -nP '[가-힣]' src/*.ts src/index/*.ts`가 0이 될 때까지(주석 제외 — 주석은 그대로 둔다) |
| `tests/*.test.ts` | 한국어 리터럴 단언 → en 문자열 또는 `t()` 키. `tests/i18n.test.ts` — en·ko 키 집합 동일, 누락 키 실패, 언어 해석 순서 |
| `tests/hook.test.sh` · `scripts/verify-package.sh` · `plugin/skills/migrate/scripts/detect-version.sh` | 출력 en |

## 함정

- `ctx`가 내는 상태 줄은 agent가 읽는다 — 라벨(`현재 milestone:` → `Milestone:`)이 바뀌면 skill 본문의 인용(`상태 줄의 "열린 세대"`)도 함께 바뀌어야 한다. task 2가 skill을 en으로 갈 때 새 라벨을 쓴다 — **라벨 목록을 handoff에 남긴다**
- doctor의 `kind` 문자열은 테스트가 정확히 단언한다 — 키 이름을 kind로 쓰거나, en 문자열로 단언
- `.reap/`이 없는 명령(`init` 전, `--version`)은 config를 못 읽는다 — `REAP_LANG` 뒤 en
- 카탈로그에 없는 키를 `t()`가 조용히 키 이름으로 내면 안 된다 — 테스트가 컴파일 타임(`MessageKey` 타입)과 런타임 둘 다 잡는다

## 완료 판정

- `bun test`·typecheck·hook.test·verify-package 초록, `REAP_LANG=ko ./dist/reap`가 한국어 usage, 없으면 en
