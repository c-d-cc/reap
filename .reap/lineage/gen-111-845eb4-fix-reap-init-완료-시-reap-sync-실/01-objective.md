# Objective

## Goal
fix: reap init 완료 시 /reap.sync 실행 안내 메시지 출력 (issue #4 보완)

## Completion Criteria
1. `reap init` 완료 후 `/reap.sync` 실행 안내 메시지가 콘솔에 출력된다
2. auto-sync가 이미 실행된 경우(adoption/migration + no preset)에는 안내 메시지를 출력하지 않는다
3. 기존 테스트가 깨지지 않는다 (`bun test`, `bunx tsc --noEmit`)
4. 빌드가 성공한다 (`npm run build`)

## Requirements

### Functional Requirements
1. FR-01: `initProject()` 함수 반환 전에 `/reap.sync` 실행 안내 메시지를 `onProgress` 콜백으로 출력한다
2. FR-02: auto-sync가 실행된 경우 (entryMode가 adoption/migration이고 preset이 없는 경우)에는 메시지를 출력하지 않는다
3. FR-03: 그 외 모든 경우(greenfield, 또는 preset이 있는 adoption/migration)에는 안내 메시지를 출력한다

### Non-Functional Requirements
1. NFR-01: 기존 코드 스타일(async/await, log 콜백 패턴)을 따른다

## Design

### Approaches Considered

| Aspect | Approach A: 조건부 출력 | Approach B: 항상 출력 |
|--------|------------------------|---------------------|
| Summary | auto-sync 미실행 시에만 안내 | 모든 경우 안내 |
| Pros | 불필요한 안내 방지 | 단순함 |
| Cons | 조건 분기 필요 | auto-sync 직후에도 안내하여 혼동 가능 |
| Recommendation | 선택 | - |

### Selected Design
Approach A: auto-sync가 실행되지 않은 경우에만 안내 메시지 출력. auto-sync는 `(entryMode === "adoption" || entryMode === "migration") && !preset` 조건에서 실행되므로, 이 조건의 반대인 경우에 메시지를 출력한다.

수정 위치: `src/cli/commands/init.ts`의 `initProject()` 함수, detectedAgents 루프 후 return 전 (약 159~163줄 사이).

코드:
```typescript
// 7. Guide user to run /reap.sync if auto-sync was not performed
const autoSynced = (entryMode === "adoption" || entryMode === "migration") && !preset;
if (!autoSynced) {
  log("\n💡 Run /reap.sync to synchronize Genome with your project's actual state.");
}
```

### Design Approval History
- 2026-03-22: 초기 설계

## Scope
- **Related Genome Areas**: 없음 (genome 파일 변경 없음)
- **Expected Change Scope**: `src/cli/commands/init.ts` 1개 파일, 4줄 추가
- **Exclusions**: genome-sync 로직 변경 없음, 테스트 추가 없음 (단순 로깅)

## Genome Reference
- conventions.md: async/await 사용, 파일 I/O는 src/core/fs.ts 유틸 사용

## Backlog (Genome Modifications Discovered)
None

## Background
이전 세대(gen-110)에서 genome placeholder 감지 로직을 추가했으나, init 완료 시 사용자에게 `/reap.sync` 실행을 안내하는 메시지가 빠져 있었다. 이 세대에서 해당 안내 메시지를 추가한다.
