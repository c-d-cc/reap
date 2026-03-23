# Objective

## Goal
versionBump 워크플로우에 release notice 게시 단계를 추가하고, backlog 생성 방식을 `reap make backlog` 명령어 사용으로 전환하며, evolve subagent prompt에 backlog 원본 참조 지시를 추가한다.

## Completion Criteria
1. `reapdev.versionBump.md`에 Step 5.5 (release notice 작성/게시) 단계가 추가되어 있다
2. notice 초안이 다국어 섹션(`## en`, `## ko`)을 포함한다
3. `gh api`로 GitHub Discussions Announcements 카테고리에 게시하는 명령이 포함되어 있다
4. `completion.ts`의 feedKnowledge phase에서 backlog 생성 시 `reap make backlog` 사용을 안내한다
5. `evolve.ts`의 subagent prompt에 `reap make backlog` 사용 가이드가 포함되어 있다
6. `evolve.ts`의 subagent prompt에 backlog 원본 파일 경로와 직접 읽기 지시가 포함되어 있다
7. 기존 테스트가 깨지지 않는다 (`bun test` pass)

## Requirements

### Functional Requirements
1. **FR-1**: versionBump skill에 Step 5.5 추가 — RELEASE_NOTES 생성 후 AI가 notice 초안 작성
2. **FR-2**: notice 초안은 `## en`, `## ko` 다국어 섹션 포함, 제목 형식 `v{version} Release Notes`
3. **FR-3**: 유저 컨펌 후 `gh api`로 GitHub Discussions (Announcements) 게시
4. **FR-4**: `completion.ts` feedKnowledge phase — genome-change backlog 생성 시 `reap make backlog` 사용 안내
5. **FR-5**: `evolve.ts` subagent prompt — backlog 생성 시 `reap make backlog` 사용 가이드
6. **FR-6**: `evolve.ts` subagent prompt — 선택된 backlog 파일 경로 명시 + 원본 직접 읽기 지시

### Non-Functional Requirements
1. **NFR-1**: 기존 테스트 통과 유지
2. **NFR-2**: skill 파일은 기존 포맷/스타일 유지

## Design

### Selected Design
3가지 작업을 각각 독립적으로 수행:

1. **versionBump skill 수정**: `.claude/commands/reapdev.versionBump.md`에 Step 5.5 삽입. `gh api` GraphQL mutation으로 Discussion 생성.
2. **completion.ts 수정**: feedKnowledge phase의 genome-change backlog 생성 안내에 `reap make backlog --type <type> --title <title> --body <body>` 사용 지시 추가.
3. **evolve.ts 수정**: subagent prompt 생성부에 (a) backlog 파일 경로 명시, (b) 원본 읽기 지시, (c) `reap make backlog` 사용 가이드 추가.

## Scope
- **Related Genome Areas**: conventions.md (Release Conventions)
- **Expected Change Scope**: 3개 파일 수정
  - `.claude/commands/reapdev.versionBump.md`
  - `src/cli/commands/run/completion.ts`
  - `src/cli/commands/run/evolve.ts`
- **Exclusions**: `src/core/notice.ts` (이미 gen-164에서 구현 완료), CLI 인터페이스 변경 없음

## Genome Reference
- conventions.md: Release Conventions 섹션
- constraints.md: CLI Framework, Package Manager

## Backlog (Genome Modifications Discovered)
None

## Background
gen-164에서 `src/core/notice.ts` (fetch 쪽)는 구현했으나 게시 쪽(versionBump skill 수정)이 누락됨. 원인은 parent agent가 subagent prompt에 구현 포인트를 명시하지 않았기 때문. 이를 방지하기 위해 evolve subagent prompt에 backlog 원본 참조 지시를 추가하고, backlog 생성 방식도 `reap make backlog` 명령어로 통일한다.
