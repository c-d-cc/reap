---
id: gen-0009-exec
slug: 플러그인과-훅
type: exec
milestone: ms-001
title: 플러그인과 훅
startedAt: 2026-08-22T16:56:39Z
startCommit: 739b236
status: closed
closedAt: 2026-08-22T17:02:10Z
endCommit: 49473ca
---

## Intent

증분 1의 마지막. **플러그인이 실제로 세션에 붙는다.**

- `plugin/hooks/{hooks.json,session-start.sh}` — SessionStart에서 `reap ctx --hook`
- `plugin/skills/{evolve,complete}/SKILL.md` 갱신 — 훅이 genome과 상태 줄만 넣으므로 **지도를 따라 읽으라고 지시**해야 한다. 그리고 skill이 부르는 CLI 명령과 플래그가 실제로 존재하는지 대조한다

**훅은 어떤 이유로도 세션 시작을 막지 않는다**(`invariants.md`). 플러그인과 바이너리는 따로 설치되므로 `reap`가 없는 상태는 정상이다.

**끝나는 지점:** 훅 스크립트를 셸에서 직접 돌려 — PATH에 없을 때 / REAP 프로젝트가 아닐 때 / `ctx`가 실패할 때 각각 **종료 코드 0에 출력 없음**, 정상 프로젝트에서 유효한 JSON 봉투. 그리고 `claude --plugin-dir ./plugin`으로 실제 세션을 열어 증분 1의 완료 판정을 돈다.

## References

- `tasks/1-4-플러그인-훅-skill.md` — 파일 목록, 증명해야 할 동작, 함정
- [배포](../../../docs/superpowers/specs/reap/08-delivery.md) — 훅 선언과 두 산출물이 어긋나는 전제
- `.reap/genome/invariants.md` — 훅은 세션 시작을 막지 않는다

## Outcome

Task 1.4 완료 (`adf3068`). **셸에서 검증 가능한 것은 전부 통과했다.**

- `plugin/hooks/session-start.sh` — `set -e`를 켜지 않고 모든 실패를 "출력 없이 exit 0"으로 접는다
- `plugin/hooks/hooks.json` — `${CLAUDE_PLUGIN_ROOT}`, matcher `startup|clear|compact`
- `tests/hook.test.sh` — 네 경우를 셸에서 직접 돌린다. **`bun test`가 돌리지 않으므로 따로 실행한다**
- `evolve` — "지도를 따라 읽는다" 절과 **"열린 세대가 이미 있다면"** 절을 더했다. 후자는 상태 줄의 존재 이유를 skill 쪽에서 받는 부분이다
- `complete` — "무엇을 닫는지 안다" 절. 세대 기록을 안 읽고는 결과를 적을 수 없다

**검증 결과:** `bun test` 76 · `typecheck` 0 · 훅 4종 통과 · 바이너리 한 바퀴(`init` → `make milestone` → `make generation` → 커밋 → `mark --closed` → `ctx --hook`) 전부 ok · skill이 부르는 명령과 플래그가 전부 실제로 존재 · skill의 상대 참조가 실제 파일을 가리킨다.

## 낡은 명세를 고쳤다

`tasks/1-4`가 "이 증분에서는 plan 축을 실행할 수단이 없으므로 plan 축이면 멈춘다"고 적고 있었다. **gen-0002-exec가 `make generation --plan`을 만들면서 그 전제가 사라졌고**, 실제로 이 milestone에서 plan 세대 넷을 열었다. 명세를 현실에 맞췄다.

## Dead Ends

**부작용이 있는 명령으로 "명령이 존재하는가"를 확인했다.** `reap make generation --plan --title x`를 실행해 `plan-005`가 실제로 생겼다. abort로 지웠지만 **레지스트리 행은 append-only라 영구히 남는다** — `| plan-005 | x |`가 그것이다.

인자를 일부러 빠뜨려 거부 메시지를 보는 것으로 충분했다. "모르는 명령입니다"면 없는 것이고 "`--title`이 필요합니다"면 있는 것이다.

**그리고 그 확인 루프는 zsh에서 아무것도 검사하지 못하고 있었다.** zsh는 파라미터 확장에 word splitting을 하지 않아 `$c`가 통째로 한 인자가 됐고, 전부 "모르는 명령"으로 실패했다 — 명령이 없어서인지 셸 때문인지 구별되지 않는 결과였다. 둘 다 `lessons.md`에 남겼다.

## 발견 — abort는 이전 바인딩을 되돌리지 않는다

`mark generation --aborted`가 세션 바인딩을 지우는 것은 맞다(지워진 기록을 가리키면 안 된다). 그런데 **직전에 무엇이 바인딩돼 있었는지는 복원하지 않는다.** 이번에는 `.session`을 손으로 고쳤다. gitignored 파일이라 위험은 없었지만, 도구가 손을 타야 했다는 사실 자체가 신호다. `tracks.md`에 남긴다.

## 남은 것 — 사람만 할 수 있는 검증

증분 1의 완료 판정 중 **플러그인 세션 검증은 내가 할 수 없다.** 새 Claude Code 세션을 여는 일이기 때문이다.
