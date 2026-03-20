# Objective

## Goal
reap init adoption/migration 시 자동 genome sync

## Completion Criteria
1. `reap init --entry adoption`에서 기존 코드를 스캔하여 genome 파일을 자동 생성한다
2. `package.json`, `tsconfig.json`, lint 설정, 디렉토리 구조 등에서 tech stack/conventions/constraints를 추론한다
3. greenfield 모드에서는 기존 동작 유지 (빈 템플릿)
4. `bun test` 통과, `bunx tsc --noEmit` 통과, `npm run build` 성공

## Requirements

### Functional Requirements
- **FR-001**: `src/core/genome-sync.ts` — 프로젝트 루트를 스캔하여 genome 내용을 추론하는 모듈 생성
- **FR-002**: `init.ts` — adoption/migration 모드 시 genome-sync 호출하여 genome 파일 채움
- **FR-003**: 추론 대상: package.json(tech stack, scripts), tsconfig, lint/prettier 설정, Dockerfile, README/CLAUDE.md, 디렉토리 구조

### Non-Functional Requirements
- **NFR-001**: CLI에서 실행 — AI 없이 파일 기반 추론만

## Scope
- **Expected Change Scope**: `src/core/genome-sync.ts` (신규), `src/cli/commands/init.ts`
- **Exclusions**: AI 기반 분석 없음 — 첫 /reap.objective에서 AI가 추가 보강

## Background
- reap-marketing 프로젝트에서 기존 코드가 있는데 init 후 genome이 빈 템플릿 상태
- adoption 모드의 의도는 기존 코드를 기반으로 genome을 채우는 것
