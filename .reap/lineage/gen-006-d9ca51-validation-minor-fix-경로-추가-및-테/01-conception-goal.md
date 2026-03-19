# Generation Goal

## 목표
Validation 판정에 minor fix용 Growth 회귀 경로를 추가하고, 테스트의 하드코딩 매직 넘버를 동적 참조로 개선한다.

## 완료 조건
- [ ] `reap.validation.md`에 코드 품질 minor fix 발견 시 partial 판정 + Growth 회귀 안내 추가
- [ ] init.test.ts의 `toHaveLength(8)` 제거, COMMAND_NAMES 동적 참조로 변경
- [ ] `bun test` 전체 통과
- [ ] `bunx tsc --noEmit` 통과

## 범위
- **관련 Genome 영역**: 없음 (코드/템플릿 변경만)
- **예상 변경 범위**: `src/templates/commands/reap.validation.md`, `tests/commands/init.test.ts`, `src/cli/commands/init.ts` (export)
- **제외 사항**: genome 변경 없음

## 배경
- Backlog 01: Gen-005에서 `toHaveLength(7)` → `8` 수정 필요했던 경험
- Backlog 02: Gen-005 Adaptation에서 minor fix 발견해도 코드 변경 불가했던 비효율
