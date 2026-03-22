# Planning

## Summary

migration-spec.ts의 구조 검사를 integrity.ts에 위임하고, falsy 검사 기능을 integrity.ts에 추가한다.

## Technical Context
- **Tech Stack**: TypeScript, Node.js fs/promises, YAML
- **Constraints**: integrity.ts가 SSOT, migration-spec.ts는 래퍼 역할

## Tasks

### T1: `detectMigrationGaps()` 리팩토링
- `checkIntegrity()` 호출하여 errors를 gaps로 반환
- 기존 하드코딩된 구조 검사 코드 제거
- import 정리

### T2: `buildMigrationSpec()` 업데이트
- slash commands 수 29 → 32
- 누락된 커맨드 3개 추가: `reap.evolve.recovery`, `reap.refreshKnowledge`, `reap.update-genome`

### T3: `checkUserLevelArtifacts()` 추가 (integrity.ts)
- 새 함수 export
- 4개 경로 패턴에 대한 falsy 검사 구현
- IntegrityResult 형식으로 반환

### T4: fix.ts에서 user-level 검사 통합
- `checkProject()`에서 `checkUserLevelArtifacts()` 결과를 IntegrityResult에 병합

### T5: Validation
- `bunx tsc --noEmit` 통과
- `bun test` 통과
- `npm run build` 성공

## Dependencies

T1, T2, T3은 독립 수행 가능. T4는 T3 완료 후 진행. T5는 T1~T4 완료 후 진행.

