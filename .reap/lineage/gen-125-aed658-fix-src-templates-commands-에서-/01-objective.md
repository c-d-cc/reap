# Objective

## Goal
`src/templates/commands/`에서 reapdev.* 파일 제거 및 `COMMAND_NAMES` 배열 정리. 개발 전용 커맨드는 프로젝트 `.claude/commands/`에서만 수동 관리한다.

## Completion Criteria
1. `src/templates/commands/reapdev.docsUpdate.md` 삭제됨
2. `src/templates/commands/reapdev.versionBump.md` 삭제됨
3. `src/cli/commands/init.ts`의 `COMMAND_NAMES`에서 reapdev 항목 제거됨
4. `~/.reap/commands/reapdev.*.md` 삭제됨
5. `.claude/commands/reapdev.*.md` 4개 파일은 유지됨
6. `bun test` 통과
7. `bunx tsc --noEmit` 통과

## Requirements

### Functional Requirements
1. FR-1: `src/templates/commands/reapdev.docsUpdate.md` 삭제
2. FR-2: `src/templates/commands/reapdev.versionBump.md` 삭제
3. FR-3: `COMMAND_NAMES` 배열에서 `"reapdev.docsUpdate"`, `"reapdev.versionBump"` 제거
4. FR-4: `~/.reap/commands/reapdev.docsUpdate.md`, `~/.reap/commands/reapdev.versionBump.md` 삭제

### Non-Functional Requirements
1. NFR-1: 기존 테스트 통과 유지

## Design

### Selected Design
단순 삭제 작업. 파일 2개 삭제, 배열에서 2개 항목 제거, 로컬 설치된 파일 2개 삭제.

## Scope
- **Related Genome Areas**: constraints.md (reapdev 커맨드 목록), conventions.md (릴리스 노트 관련)
- **Expected Change Scope**: `src/templates/commands/` (파일 2개 삭제), `src/cli/commands/init.ts` (배열 수정), `~/.reap/commands/` (파일 2개 삭제)
- **Exclusions**: `.claude/commands/reapdev.*.md` 유지, genome 파일 수정은 genome immutability 원칙에 따라 backlog 기록

## Genome Reference
- constraints.md L48-51: reapdev 커맨드 목록 (Dev Commands 카테고리)
- conventions.md L36: 릴리스 노트에서 reapdev.versionBump 언급

## Backlog (Genome Modifications Discovered)
- genome-change: constraints.md에서 reapdev.docsUpdate, reapdev.versionBump 관련 내용 제거 필요 (L48-51)
- genome-change: conventions.md에서 reapdev.versionBump 언급 제거 필요 (L36)

## Background
reapdev.* 커맨드는 REAP 프로젝트 자체 개발용이며 npm 배포 시 사용자에게 설치되면 안 된다. gen-124에서 docs 정리 완료, 이번 gen-125에서 소스 코드에서 실제 제거한다.

## Regression
이전 gen-125 진입 시 objective 단계에서 re-entry. 기존 artifact 비어있었으므로 새로 작성.

