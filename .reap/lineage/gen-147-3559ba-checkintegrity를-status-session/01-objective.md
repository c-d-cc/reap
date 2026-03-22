# Objective

## Goal

`checkIntegrity()`를 주요 진입점(status, session-init, update)에서 자동 호출하여 `.reap/` 구조 문제를 조기 감지한다.

## Completion Criteria

1. `reap status` 실행 시 integrity 검사 결과(errors/warnings 카운트)가 출력된다
2. `session-start.cjs` 훅 실행 시 session init 블록에 integrity 상태가 표시된다
3. `reap update` 완료 후 integrity 검사가 실행되고 문제 발견 시 경고가 출력된다
4. 기존 테스트가 깨지지 않는다

## Requirements

### Functional Requirements

1. **`reap status`**: `getStatus()` 반환값에 `integrity` 필드 추가 (errors/warnings 카운트). CLI에서 카운트 표시 + 상세 안내(`reap fix --check`)
2. **`session-start.cjs`**: `reap fix --check` 서브프로세스 호출 → exit code 0이면 `🟢 Integrity — OK`, 아니면 `🔴 Integrity — N errors, M warnings`
3. **`reap update`**: `updateProject()` 마지막에 `checkIntegrity()` 호출, 결과 출력

### Non-Functional Requirements

- `checkIntegrity()`는 0.1초로 실행되므로 성능 우려 없음
- `session-start.cjs`는 CJS 환경이므로 ESM/TS인 `integrity.ts` 직접 import 불가 → `reap fix --check` 서브프로세스 사용

## Design

### Approaches Considered

| Aspect | Approach A: 서브프로세스 | Approach B: CJS 포팅 |
|--------|-----------|-----------|
| Summary | session-start.cjs에서 `reap fix --check` 서브프로세스 호출 | integrity 로직을 CJS로 별도 작성 |
| Pros | 기존 코드 재사용, 유지보수 단일 지점 | 프로세스 오버헤드 없음 |
| Cons | 서브프로세스 오버헤드 (~200ms) | 코드 중복, 동기화 어려움 |
| Recommendation | **선택** — 단일 SSOT 유지 | 비추천 |

### Selected Design

- **`reap status`**: `src/cli/commands/status.ts`의 `getStatus()`에서 `checkIntegrity()` import 후 호출, `ProjectStatus`에 `integrity` 필드 추가. CLI(index.ts)에서 결과 출력.
- **`session-start.cjs`**: `execSync('reap fix --check')` 호출, exit code와 stdout 파싱. session init 블록에 한 줄 추가.
- **`reap update`**: `src/cli/index.ts`의 update 핸들러 마지막에서 `checkIntegrity()` 호출, errors/warnings 출력.

### Design Approval History

- 2026-03-23: 초기 설계 — 서브프로세스 접근 선택

## Scope
- **Related Genome Areas**: source-map.md (CLI commands layer)
- **Expected Change Scope**: `src/cli/commands/status.ts`, `src/cli/index.ts`, `src/templates/hooks/session-start.cjs`
- **Exclusions**: integrity.ts 자체 수정 없음, falsy 검사 추가는 별도 backlog (migration-spec-use-integrity)

## Genome Reference

- source-map.md: CLI Commands → Core 레이어 호출 구조
- constraints.md: session hook은 CJS 환경

## Backlog (Genome Modifications Discovered)
None

## Background

`checkIntegrity()`는 gen-142에서 구현된 `.reap/` 구조 검사 함수로, 현재 `reap fix --check`에서만 사용된다. 0.1초로 빠르게 동작하므로 주요 진입점에서 자동 실행하여 문제를 조기 감지할 수 있다.
