# Objective

## Goal
source-map drift 감지를 session hook에서 제거하고, staleness 감지 하나로 통합한다.

## Completion Criteria
- CC-1: genome-loader.cjs의 `detectStaleness()`에서 source-map drift 관련 코드(sourcemapDriftWarning, documented, actual) 제거
- CC-2: session-start.cjs에서 drift 관련 참조 제거
- CC-3: genome-loader.cjs의 `buildGenomeHealth()`에서 drift 관련 파라미터/로직 제거
- CC-4: `bun test` 통과
- CC-5: `bunx tsc --noEmit` 통과
- CC-6: `npm run build` 성공

## Requirements

### Functional Requirements
- FR-01: `detectStaleness()`에서 sourcemapDriftWarning, documented, actual 반환값 제거
- FR-02: `buildGenomeHealth()`에서 sourcemapDriftWarning, documented, actual 파라미터 제거
- FR-03: session-start.cjs에서 drift 관련 변수 참조 및 staleSection 연결 제거
- FR-04: genome-loader.cjs exports에서 불필요해진 fileExists 의존성 정리 (drift용으로만 쓰였다면)

### Non-Functional Requirements
- NFR-01: staleness 감지는 기존과 동일하게 유지
- NFR-02: 기존 동작의 breaking change 없음 (drift 제거 외)

## Scope
- **Related Genome Areas**: source-map.md (source-map drift 관련)
- **Expected Change Scope**: `src/templates/hooks/` 내 2개 파일 수정 (genome-loader.cjs, session-start.cjs)
- **Exclusions**: `reap status` CLI에서의 drift 감지 추가는 별도 generation

## Genome Reference
- `domain/hook-system.md`: SessionStart hook 규칙

## Backlog (Genome Modifications Discovered)
None

## Background
source-map drift 감지가 `src/core/` + `Component(` regex에 하드코딩되어 REAP 자체 프로젝트에서만 동작. 범용 도구로서 부적합하며, staleness 감지가 이미 같은 역할을 커버함.
