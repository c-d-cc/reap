# Objective

## Goal

Compression 임계값 조정 + Hooks 파일 분리/condition 구조 리팩토링 + Genome source-map.md 추가

## Completion Criteria

- CC-1: `LINEAGE_MAX_LINES`가 5,000으로 변경되고, 최근 3개 generation은 compression에서 제외된다
- CC-2: config.yml의 hooks가 condition/execute 구조로 변경되고, execute가 별도 파일을 참조한다
- CC-3: `.reap/genome/source-map.md`에 C4 Container 수준 Mermaid 다이어그램이 작성된다
- CC-4: 기존 테스트가 모두 통과한다 (`bun test`)
- CC-5: TypeScript 컴파일이 성공한다 (`bunx tsc --noEmit`)
- CC-6: 빌드가 성공한다 (`npm run build`)

## Requirements

### Functional Requirements

- FR-001: `src/core/compression.ts` — `LINEAGE_MAX_LINES`를 10,000 → 5,000으로 변경
- FR-002: `src/core/compression.ts` — compression 시 최근 3개 generation은 건너뛰도록 보호 로직 추가
- FR-003: `.reap/config.yml` hooks를 condition/execute 구조로 변경. execute는 `.reap/hooks/` 하위 파일 참조
- FR-004: `.reap/hooks/` 디렉토리에 hook 파일 분리 (version-bump.md, docs-update.md, release-notes.md 등)
- FR-005: hook 실행 로직이 condition을 평가한 후 해당하는 hook만 execute하도록 slash command(reap.next, reap.completion 등) 동작 보장
- FR-006: `.reap/genome/source-map.md` 작성 — C4 Context + Container 수준 Mermaid 다이어그램
- FR-007: source-map.md의 줄 수 제한은 프로젝트 규모에 비례하여 adaptive하게 설정 (현재 코드베이스 ~2,000줄 → ~150줄 한도 권장)

### Non-Functional Requirements

- 기존 compression 테스트가 새 임계값으로 통과해야 함
- hook 리팩토링 후 기존 onGenerationComplete 동작이 동일하게 유지되어야 함

## Scope
- **Related Genome Areas**: constraints.md, conventions.md, domain/hook-system.md, domain/lifecycle-rules.md
- **Expected Change Scope**: `src/core/compression.ts`, `.reap/config.yml`, `.reap/hooks/`, `.reap/genome/source-map.md`, 관련 테스트
- **Exclusions**: CLI 명령어 추가 없음, AgentAdapter 변경 없음

## Genome Reference

- domain/lifecycle-rules.md: compression 규칙
- domain/hook-system.md: hook event/type 규칙
- conventions.md: Release Conventions

## Backlog (Genome Modifications Discovered)
None

## Background

- lineage 30 generations / 4,501줄 — 현재 10,000줄 한도의 절반도 안 됨
- hooks config.yml에 multi-line prompt가 직접 들어가 40줄 가까이 됨
- source-map이 없어 에이전트가 매번 코드 탐색으로 구조 파악
