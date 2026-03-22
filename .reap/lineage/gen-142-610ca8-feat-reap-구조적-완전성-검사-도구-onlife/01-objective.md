# Objective

## Goal
`.reap/` 디렉토리의 구조적 완전성을 검사하는 `checkIntegrity()` 함수 구현 및 `reap fix --check` CLI 커맨드, `onLifeCompleted` hook 통합.

## Completion Criteria
1. `src/core/integrity.ts`가 존재하고 `checkIntegrity(paths): Promise<IntegrityResult>` 를 export
2. config.yml 필수 필드(project, entryMode) 및 타입 검증
3. current.yml 활성 generation 시 필수 필드(id, goal, stage, genomeVersion, startedAt, timeline, type, parents) 검증
4. lineage 구조 검증 (meta.yml 존재, 필수 필드, completedAt ISO 유효성, parents 참조, 압축 .md frontmatter)
5. genome L1 파일 존재 검증 + ~100줄 초과 경고 + placeholder 감지
6. backlog frontmatter (type, status) 필수/유효값 검증, consumed면 consumedBy 존재
7. artifact 구조 검증 (현재 stage 이전 artifact 존재, REAP MANAGED 헤더)
8. `reap fix --check` CLI 커맨드가 정상 동작
9. `onLifeCompleted.integrity-check.sh` hook이 설치되고 실행됨
10. `bun test` 및 `bunx tsc --noEmit` 통과

## Requirements

### Functional Requirements
1. FR-01: `checkIntegrity(paths)` — config.yml 구조 검증 (필수 필드, 타입, ReapConfig 일치)
2. FR-02: `checkIntegrity(paths)` — current.yml 구조 검증 (active generation 시 필수 필드, stage/type 유효성, recovery면 recovers 존재)
3. FR-03: `checkIntegrity(paths)` — lineage 검증 (meta.yml 존재, 필수 필드, completedAt ISO NaN 방지, parents 참조, 압축 .md frontmatter)
4. FR-04: `checkIntegrity(paths)` — genome L1 파일 존재, ~100줄 초과 경고, placeholder 감지
5. FR-05: `checkIntegrity(paths)` — backlog frontmatter(type, status) 필수/유효값, consumed면 consumedBy 존재
6. FR-06: `checkIntegrity(paths)` — artifact 구조 검증 (현재 stage 이전 artifact 존재, REAP MANAGED 헤더)
7. FR-07: `reap fix --check` — checkIntegrity 호출 후 결과 출력 (errors/warnings)
8. FR-08: `onLifeCompleted.integrity-check.sh` hook — `reap fix --check` 실행, warning만 출력 (exit 0)
9. FR-09: init.ts에서 hook 템플릿 설치

### Non-Functional Requirements
1. NFR-01: 기존 `fixProject()` 로직과 중복 없이 구현 (fix는 repair, integrity는 check-only)
2. NFR-02: IntegrityResult의 errors는 반드시 수정이 필요한 항목, warnings는 권고 사항

## Design

### Selected Design
- `IntegrityResult = { errors: string[], warnings: string[] }` — errors는 구조적 결함, warnings는 권고
- `checkIntegrity(paths: ReapPaths)` — 단일 진입점, 모든 검증을 순차 실행
- `reap fix --check` — 기존 fix 커맨드에 `--check` 옵션 추가, fix 대신 검사만 수행
- hook은 shell script로 `reap fix --check` 호출, exit 0 고정 (차단 안 함)

## Scope
- **Related Genome Areas**: constraints (CLI 구조), conventions (파일 I/O 패턴)
- **Expected Change Scope**:
  - `src/core/integrity.ts` (신규)
  - `src/cli/commands/fix.ts` (checkIntegrity import + --check export)
  - `src/cli/index.ts` (--check 옵션 추가)
  - `src/templates/hooks/onLifeCompleted.integrity-check.sh` (신규)
  - `src/cli/commands/init.ts` (hook 설치 로직)
- **Exclusions**: 기존 fixProject() 수정 없음, 자동 복구 기능 추가 없음

## Genome Reference
- conventions.md: 파일 I/O는 `src/core/fs.ts` 유틸 사용
- constraints.md: CLI Framework는 Commander.js
- source-map.md: src/core/ (핵심 로직), src/cli/commands/ (CLI 커맨드)

## Backlog (Genome Modifications Discovered)
None

## Background
이전 generation(gen-141)에서 completedAt NaN 버그 수정 시, 구조적 완전성 검사의 필요성이 확인됨. `.reap/` 디렉토리의 필수 파일, 필드, 참조 관계를 일괄 검증하는 도구가 필요.
