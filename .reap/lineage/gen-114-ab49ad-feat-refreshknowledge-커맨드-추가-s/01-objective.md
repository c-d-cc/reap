# Objective

## Goal
feat: refreshKnowledge 커맨드 추가 — subagent가 REAP context(Genome, Environment, Generation state 등)를 로드할 수 있는 CLI 커맨드 구현

## Completion Criteria
1. `reap run refreshKnowledge` 실행 시 session-start.cjs와 동일한 REAP context가 JSON stdout으로 출력됨
2. evolve.ts의 subagentPrompt에 refreshKnowledge 실행 지시가 포함됨
3. `/reap.refreshKnowledge` slash command가 등록되어 있음
4. `bun test` 통과
5. `bunx tsc --noEmit` 통과
6. `npm run build` 통과

## Requirements

### Functional Requirements
1. FR-01: `reap run refreshKnowledge` CLI 커맨드 — genome-loader.cjs의 로직을 TypeScript로 재사용하여 REAP context를 emitOutput으로 출력
2. FR-02: 출력 내용 — REAP Workflow Guide, Genome(L1+L2, budget 적용), Environment Summary, Current Generation State, Strict Mode Status
3. FR-03: evolve.ts subagentPrompt에 "먼저 `reap run refreshKnowledge`를 실행하라" 지시 추가
4. FR-04: `reap.refreshKnowledge.md` slash command 템플릿 생성
5. FR-05: init.ts COMMAND_NAMES에 `reap.refreshKnowledge` 추가

### Non-Functional Requirements
1. NFR-01: genome-loader.cjs의 CJS 함수를 직접 import하지 않고 TypeScript 레벨에서 동일 로직 재구현 (fs.ts 유틸 사용)
2. NFR-02: 기존 run command 패턴(emitOutput 사용) 준수

## Design

### Approaches Considered

| Aspect | Approach A: CJS require | Approach B: TS 재구현 |
|--------|------------------------|---------------------|
| Summary | genome-loader.cjs를 직접 require | TS로 동일 로직 재구현 |
| Pros | 코드 중복 없음 | 타입 안전, fs.ts 유틸 사용, 기존 패턴 일관성 |
| Cons | CJS/ESM 혼용 문제, 타입 없음 | 일부 로직 중복 |
| Recommendation | - | 채택 |

### Selected Design
Approach B — TypeScript로 재구현. genome-loader.cjs는 hook(CJS) 전용으로 유지하고, CLI command는 기존 core 모듈(fs.ts, paths.ts, config.ts)을 활용하여 동일한 context를 생성.

### Design Approval History
- 2026-03-22: Task 지시에 따라 설계 확정

## Scope
- **Related Genome Areas**: conventions.md (CLI 패턴), constraints.md (TS strict, fs.ts 유틸)
- **Expected Change Scope**:
  - 새 파일: `src/cli/commands/run/refresh-knowledge.ts`, `src/templates/commands/reap.refreshKnowledge.md`
  - 수정 파일: `src/cli/commands/run/index.ts`, `src/cli/commands/init.ts`, `src/cli/commands/run/evolve.ts`
- **Exclusions**: constraints.md 등 genome 파일 수정 안 함

## Genome Reference
- conventions.md: kebab-case 파일명, camelCase 함수명, fs.ts 유틸 사용
- constraints.md: TypeScript strict, Node.js fs/promises

## Backlog (Genome Modifications Discovered)
None

## Background
SessionStart hook은 subagent에서 실행되지 않음. subagent는 REAP context 없이 실행되어 Genome, Environment 등 프로젝트 지식이 누락됨. 이 커맨드로 subagent가 실행 시점에 REAP context를 로드할 수 있게 함.
