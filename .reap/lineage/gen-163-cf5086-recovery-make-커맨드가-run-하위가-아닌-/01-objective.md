# Objective

## Goal
Recovery: `make` 커맨드를 `run` 하위에서 최상위 CLI 커맨드로 이동. `reap make backlog`로 호출 가능하게 변경.

## Completion Criteria
1. `reap make backlog --type task --title "test"` 호출이 정상 동작
2. `reap run make backlog` 호출 시 동작하지 않음 (COMMANDS에서 제거)
3. 기존 make.ts의 execute 로직은 그대로 유지
4. 빌드 성공 (`bun run build` 또는 동등)
5. 타입 체크 통과 (`bunx tsc --noEmit`)

## Requirements

### Functional Requirements
1. `src/cli/index.ts`에 `make` Commander.js 서브커맨드 추가 (`reap make <target> [args...]`)
2. `src/cli/commands/run/index.ts`의 COMMANDS에서 `make` 항목 제거
3. `make.ts`의 execute 함수를 최상위 커맨드에서 import하여 사용
4. 기존 artifacts에서 `reap run make` 참조를 `reap make`로 수정

### Non-Functional Requirements
1. 기존 CLI 구조 패턴(Commander.js 서브커맨드)을 따를 것
2. make.ts 파일 위치는 현재 위치(`src/cli/commands/run/make.ts`) 유지 가능

## Design

### Approaches Considered

| Aspect | Approach A: index.ts에서 직접 라우팅 | Approach B: make.ts 파일 이동 |
|--------|-----------|-----------|
| Summary | index.ts에 Commander 서브커맨드 추가, make.ts는 현 위치 유지 | make.ts를 src/cli/commands/make.ts로 이동 |
| Pros | 변경 최소화, import 경로만 추가 | 디렉토리 구조상 논리적 |
| Cons | run/ 안에 비-run 커맨드가 존재 | import 경로 변경 필요, 불필요한 파일 이동 |
| Recommendation | 선택 | - |

### Selected Design
Approach A: `src/cli/index.ts`에 Commander.js `make` 서브커맨드를 추가하고, `src/cli/commands/run/make.ts`의 execute 함수를 import하여 사용. COMMANDS 맵에서는 제거.

### Design Approval History
- 태스크 지시에서 이미 설계가 확정됨 (recovery generation)

## Scope
- **Related Genome Areas**: conventions.md (CLI 구조), source-map.md
- **Expected Change Scope**: src/cli/index.ts, src/cli/commands/run/index.ts, artifact 참조 수정
- **Exclusions**: make.ts 내부 로직 변경 없음, 새 기능 추가 없음

## Genome Reference
- ADR-002: Commander.js CLI 프레임워크 사용
- `run`은 lifecycle stage 전용 커맨드

## Backlog (Genome Modifications Discovered)
None

## Background
gen-162-616395에서 `make`를 `reap run make backlog`로 구현했으나, `make`는 lifecycle stage가 아니므로 `run` 하위가 아닌 최상위 CLI 서브커맨드여야 함. 이 recovery generation에서 수정.
