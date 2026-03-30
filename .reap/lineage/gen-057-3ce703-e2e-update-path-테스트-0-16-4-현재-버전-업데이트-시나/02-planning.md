# Planning — gen-057

## Goal

`tests/e2e/update-path.test.ts` 신규 작성. update path (기존 프로젝트 -> 새 버전)에서 load-context, CLAUDE.md marker sync가 정상 동작하는지 E2E 검증.

## Completion Criteria

1. `bun test tests/e2e/update-path.test.ts` 전체 통과
2. 다음 5개 시나리오가 테스트로 커버됨:
   - `reap load-context`: REAP 프로젝트에서 hookSpecificOutput JSON 출력
   - `reap load-context`: 비-REAP 디렉토리에서 silent exit (빈 출력)
   - `reap update`: 레거시(마커 없는) CLAUDE.md가 마커 기반으로 교체
   - `reap update`: 이미 최신 마커가 있으면 skip (changes 비어있음)
   - `reap update`: 사용자 커스텀 내용 보존
3. 기존 테스트 (`bun test tests/e2e/update.test.ts`) 영향 없음

## Scope

- 신규: `tests/e2e/update-path.test.ts`
- 수정 없음: 기존 소스 코드, 기존 테스트

### Out of Scope

- `registerSessionHooks()` 직접 테스트 (user-level `~/.claude/settings.json` 수정 문제)
- 전체 lifecycle 테스트 (이미 `tests/scenario/lifecycle.test.ts`에서 커버)

## Tasks

- [ ] T001 `tests/e2e/update-path.test.ts` -- load-context REAP 프로젝트 JSON 출력 테스트
- [ ] T002 `tests/e2e/update-path.test.ts` -- load-context 비-REAP 디렉토리 silent exit 테스트
- [ ] T003 `tests/e2e/update-path.test.ts` -- update: 레거시 CLAUDE.md -> 마커 기반 교체 테스트
- [ ] T004 `tests/e2e/update-path.test.ts` -- update: 이미 최신이면 skip 테스트
- [ ] T005 `tests/e2e/update-path.test.ts` -- update: 사용자 커스텀 내용 보존 테스트
- [ ] T006 전체 테스트 실행 및 검증 (`bun test tests/e2e/update-path.test.ts`)

## Implementation Notes

### load-context 테스트 방법

`load-context`는 `process.stdout.write` + `process.exit(0)` 패턴이므로 `cliRaw()`로 raw output 캡처. REAP 프로젝트에서는 JSON 파싱 후 `hookSpecificOutput.additionalContext` 존재 확인. 비-REAP에서는 빈 문자열(또는 whitespace만) 반환 확인.

### CLAUDE.md 레거시 시뮬레이션

`setupProject()` 후 CLAUDE.md에서 마커(`<!-- reap:start -->` ~ `<!-- reap:end -->`)를 제거하고 레거시 형태(`# REAP Project\n...`)로 교체. 이후 `cli(dir, "update")` 실행하면 `ensureClaudeMd()`가 legacy detection -> marker-based 교체 수행.

### 사용자 커스텀 보존

마커 기반 CLAUDE.md에서 마커 앞에 사용자 내용 추가 후 update. 마커 섹션만 교체되고 사용자 내용은 보존되어야 함.
