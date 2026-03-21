# Objective

## Goal

E2E 테스트: slash command hook 실행 + archiving 책임 분리 검증

## Background

- backlog 참조: e2e-command-hooks.md
- gen-085에서 slash command 전면 정리 완료했으나 E2E 테스트 미작성
- 검증 대상: 마크다운 템플릿 (src/templates/commands/*.md)의 구조적 정합성

## Scope

### In Scope
- 8개 시나리오에 대한 구조적 검증 테스트 (템플릿 파일 내용 grep)
- 기존 E2E 테스트 전수 검토 및 수정
- bun test 기반 테스트 파일 작성

### Out of Scope
- sandbox 기반 동작 검증 (claude CLI 필요 — CI 불가)
- TypeScript 소스 코드 변경

## Completion Criteria

1. 8개 시나리오 테스트 모두 작성 및 통과
2. 기존 163개 테스트 모두 통과 유지
3. `bunx tsc --noEmit` 통과
4. `npm run build` 통과

## Requirements

- FR-001: reap.next.md에 archiving/hook 로직 없음 검증
- FR-002: 9개 normal stage command에 올바른 hook event 참조 검증
- FR-003: reap.completion.md에 archiving + 커밋 + onLifeCompleted 포함 검증
- FR-004: completion command에서 hook이 커밋 전 실행 순서 검증
- FR-005: completion command에 submodule 체크 지침 포함 검증
- FR-006: 7개 merge command에 올바른 onMerge* event 참조 검증
- FR-007: reap.evolve.md에 hook auto-execution 안내 포함 검증
- FR-008: reap.back.md에 onLifeRegretted 포함 검증
