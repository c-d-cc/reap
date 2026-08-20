---
type: task
status: pending
priority: high
createdAt: 2026-08-20T13:05:28.493Z
---

# config.autoUpdate 를 읽는 코드가 없다 — false 로 둔 사용자도 자동 업데이트된다

## Problem

`.reap/config.yml` 의 `autoUpdate` 는 **어디에서도 값이 읽히지 않는다.** 확인 (gen-092 evaluator 발견,
직접 재확인):

| 위치 | 하는 일 |
|---|---|
| `src/types/index.ts:95` | 타입 선언 |
| `src/cli/commands/init/common.ts:78` | `true` 로 생성 |
| `src/cli/commands/update.ts:49,67` | `VALID_CONFIG_FIELDS` + 기본값 backfill |
| `src/cli/commands/config.ts:36` | `reap config` 출력에 표시 |
| `src/core/integrity.ts:266` | boolean 인지 타입 검사 |
| `src/adapters/claude-code/skills/reap.config.md:13` | *"auto-update enabled"* 라고 **문서화** |

그리고 `src/cli/commands/check-version.ts` 의 `execute()` 는 주석 *"Auto-update: always attempt"*
와 함께 `performAutoUpdate` 를 **무조건** 부른다 (gen-043 에서 그렇게 바뀌었다).

즉 **`autoUpdate: false` 로 둔 사용자도 자동 업데이트된다.** 설정은 존재하고 문서화돼 있으며
`reap config` 가 값을 보여주기까지 하는데, 그 값이 아무것도 바꾸지 않는다.

gen-092 는 "어디에 설치하는가"를 좁혔지만(전역 설치만) **"할 것인가"를 사용자가 끄는 수단은
여전히 없다.**

## Solution

세 갈래이며 **하나를 고르고 근거를 적을 것**:

1. **배선한다** — `execute()` 에서 `config.autoUpdate === false` 면 `performAutoUpdate` 를 건너뛴다.
   설정과 문서가 이미 그렇게 약속하고 있으므로 **가장 작은 정직한 수정**이다.
   기본값이 `true` 이므로 기존 사용자 회귀 0.
   주의: config 를 읽을 수 없는 경우(비-REAP 디렉토리 등)의 기본값을 명시할 것 — `true` 여야
   지금 동작이 유지된다.
2. **문서·설정에서 지운다** — auto-update 를 끌 수 없는 것이 의도라면 필드와 문서를 함께 없앤다.
   `VALID_CONFIG_FIELDS` 에서 빼면 `reap update` 가 사용자 config 에서 조용히 지우므로
   migration note 가 필요하다.
3. **의미를 바꾼다** — gen-092 가 도입한 `InstallKind` 와 묶어 "전역 설치일 때만, 그리고
   `autoUpdate` 가 꺼져있지 않을 때만" 으로 정리.

**권고: 1.** 설정이 존재하는데 값이 무시되는 것은 사용자가 확인할 방법이 없는 종류의 거짓이다
(`reap config` 는 `false` 라고 보여주고 REAP 은 업데이트한다).

검증 방향: `execute()` 에 config 읽기 seam 을 두고 `autoUpdate: false` 에서 `performAutoUpdate`
가 호출되지 않는 것을 unit 으로 고정. gen-092 가 `AutoUpdateDeps` seam 을 이미 넣었으므로
붙이기 쉽다.

## Files to Change

- `src/cli/commands/check-version.ts` — `execute()`
- `src/adapters/claude-code/skills/reap.config.md` — (2번을 고를 경우)
- `src/cli/commands/update.ts` `VALID_CONFIG_FIELDS` — (2번을 고를 경우, migration note 동반)
- `tests/unit/check-version.test.ts` — 선택한 동작 고정
