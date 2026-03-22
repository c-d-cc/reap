# Objective

## Goal

migration-spec.ts가 integrity.ts를 SSOT(Single Source of Truth)로 사용하도록 리팩토링하고, integrity.ts에 falsy 검사(있으면 안 되는 것) 기능을 추가한다.

## Completion Criteria

1. `detectMigrationGaps()`가 `checkIntegrity()` 결과를 기반으로 gap 리스트를 생성
2. `buildMigrationSpec()`의 slash commands 수가 32개로 업데이트 (실제 커맨드 목록 반영)
3. `checkUserLevelArtifacts()` 함수가 integrity.ts에 추가되어 falsy 검사 수행
4. `reap fix --check`에서 user-level artifacts 검사 결과도 출력
5. `bunx tsc --noEmit`, `bun test`, `npm run build` 모두 통과

## Requirements

### Functional Requirements

1. `detectMigrationGaps()`: checkIntegrity() 호출 → errors를 gaps 리스트로 변환
2. `buildMigrationSpec()`: slash commands 수 29 → 32, 누락 커맨드 추가
3. `checkUserLevelArtifacts()`: user-level에 있으면 안 되는 reap 파일 탐지
   - `~/.claude/skills/reap.*` → error
   - `~/.claude/commands/reap.*` → warning
   - `~/.config/opencode/commands/reap.*` → warning
   - `.claude/commands/reap.*` → warning

### Non-Functional Requirements

- integrity.ts가 구조 검증의 유일한 기준점(SSOT)으로 유지
- 기존 테스트 깨지지 않음

## Design

### Selected Design

- `detectMigrationGaps()`를 `checkIntegrity()` 래퍼로 전환하여 중복 코드 제거
- `checkUserLevelArtifacts()`를 별도 export 함수로 분리 (프로젝트 범위를 넘어 user-level 경로 검사)
- fix.ts의 `checkProject()`에서 `checkUserLevelArtifacts()` 결과를 병합하여 출력

## Scope
- **Related Genome Areas**: source-map.md (integrity, migration-spec 모듈)
- **Expected Change Scope**: src/core/migration-spec.ts, src/core/integrity.ts, src/cli/commands/fix.ts
- **Exclusions**: migration 실행 로직 변경 없음, update.ts의 호출 구조 변경 없음

## Genome Reference

constraints.md — Validation Commands

## Backlog (Genome Modifications Discovered)
None

## Background

integrity.ts와 migration-spec.ts가 동일한 구조 검사를 각각 독립적으로 하드코딩하고 있어 기준이 불일치할 위험이 있다. integrity.ts를 SSOT로 삼고 migration-spec.ts가 이를 참조하도록 리팩토링한다.

