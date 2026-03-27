# Implementation Log

## Completed Tasks

### T001: types/index.ts
`strict: boolean` 제거, `strictEdit: boolean` + `strictMerge: boolean` 추가.

### T002: prompt.ts
- `buildStrictSection(strictEdit, strictMerge, stage)` 함수 추가 — v0.15 `genome-loader.cjs:220-238`에서 이식
- 3가지 strictEdit 분기: implementation(scoped), none(blocked), other stage(blocked)
- strictMerge: 직접 git 명령 차단, REAP 슬래시 명령만 허용
- bypass 안내 모든 분기에 포함
- `buildBasePrompt()` signature에 `config?: ReapConfig | null` 추가, strict 섹션을 Project Path 앞에 주입

### T003: evolve.ts
`buildBasePrompt()` 호출 시 config를 마지막 인자로 전달.

### T004: init/common.ts
기본값 `strict: false` → `strictEdit: false, strictMerge: false`.

### T005: update.ts
- `CONFIG_DEFAULTS`에서 `strict` → `strictEdit: false, strictMerge: false`
- `backfillConfig()`에 legacy `strict: boolean` → `strictEdit/strictMerge` 자동 변환 로직 추가
- `strict: true` → 양쪽 true, `strict: false` → 양쪽 false, strict 필드 삭제

### T006: migrate.ts
- v0.15 `strict` 값을 `strictEdit/strictMerge`로 변환
- confirm prompt에서 "Keep: strict" → "Convert: strict -> strictEdit + strictMerge"

### T007: integrity.ts
- `strict` 검증 → `strictEdit`, `strictMerge` 각각 boolean 검증
- legacy `strict` 필드 존재 시 `reap update` 안내 warning 추가

### T008: tests/unit/prompt-strict.test.ts (신규)
17개 테스트:
- `buildStrictSection()`: 9개 — 각 분기, bypass 안내, 양쪽 활성화
- `buildBasePrompt()` strict 통합: 6개 — no strict, strictEdit at learning/implementation/none, strictMerge, no config

### T009: 기존 테스트 수정
- `tests/unit/integrity.test.ts`: strict 검증 → strictEdit/strictMerge/legacy 3개 테스트로 분리
- `tests/e2e/init-repair.test.ts`: config의 `strict: false` → `strictEdit: false, strictMerge: false` (3곳)
- `tests/scenario/merge.test.ts`: config 문자열 업데이트

### T010: 빌드 및 테스트
- `npm run build` 통과
- `npm test`: 452 pass (기존 435 → 452, +17 신규)
