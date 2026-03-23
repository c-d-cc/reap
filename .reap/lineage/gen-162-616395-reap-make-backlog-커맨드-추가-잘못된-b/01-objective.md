# Objective

## Goal
`reap run make backlog` 커맨드 추가 및 잘못된 backlog 파일 정리.
subagent가 backlog 파일을 직접 작성할 때 frontmatter 형식 오류가 발생하는 문제를 방지하기 위해,
올바른 YAML frontmatter를 보장하는 `createBacklog()` 함수와 `make` CLI 커맨드를 제공한다.

## Completion Criteria
1. `createBacklog()` 함수가 올바른 YAML frontmatter 형식의 .md 파일을 `.reap/life/backlog/`에 생성한다
2. `reap run make backlog --type <type> --title <title> --body <body>` 커맨드가 동작한다
3. type 검증: genome-change, environment-change, task만 허용, 그 외 에러
4. 파일명이 title에서 kebab-case로 자동 생성된다
5. `source-map-compression-constants.md` 파일이 삭제된다
6. 기존 테스트가 깨지지 않는다

## Requirements

### Functional Requirements
1. `src/core/backlog.ts`에 `createBacklog(backlogDir, opts)` 함수 추가
2. type 검증: `genome-change`, `environment-change`, `task`만 허용
3. priority 기본값: `medium`
4. 파일명: title을 kebab-case로 변환하여 자동 생성
5. 생성된 파일은 `---` YAML frontmatter + body 형식
6. `src/cli/commands/run/make.ts` 생성 — `make backlog` 하위 커맨드 dispatch
7. `--type`, `--priority`, `--title`, `--body` 플래그 지원
8. `src/cli/commands/run/index.ts`의 COMMANDS에 `make` 등록
9. `source-map-compression-constants.md` 삭제

### Non-Functional Requirements
1. 기존 `scanBacklog()`, `markBacklogConsumed()` 함수와 일관된 코드 스타일
2. `make`는 범용 생성 커맨드로 설계 (향후 hook 등 확장 가능)

## Design

### Approaches Considered

| Aspect | Approach A: backlog 전용 커맨드 | Approach B: 범용 make 커맨드 |
|--------|-------------------------------|---------------------------|
| Summary | `reap run create-backlog` | `reap run make backlog` |
| Pros | 단순, 단일 목적 | 확장성, 향후 `make hook` 등 추가 가능 |
| Cons | 확장성 부족 | 약간 복잡 |
| Recommendation | | 선택 |

### Selected Design
`reap run make backlog` 범용 패턴 채택.
- `make.ts`에서 첫 번째 positional arg로 대상 분기 (현재는 `backlog`만)
- `createBacklog()`는 `src/core/backlog.ts`에 추가 (기존 backlog 함수들과 같은 모듈)

### Design Approval History
- 2026-03-23: backlog에서 요구사항 확인, 범용 make 패턴 채택

## Scope
- **Related Genome Areas**: source-map.md (Key Constants 참조)
- **Expected Change Scope**: `src/core/backlog.ts`, `src/cli/commands/run/make.ts`(신규), `src/cli/commands/run/index.ts`, `.reap/life/backlog/source-map-compression-constants.md`(삭제)
- **Exclusions**: genome 파일 직접 수정 없음

## Genome Reference
- conventions.md: 파일명 kebab-case, 함수 camelCase
- constraints.md: 파일 I/O는 src/core/fs.ts 유틸 사용

## Backlog (Genome Modifications Discovered)
None

## Background
subagent가 backlog 파일을 직접 작성할 때 `---` 구분자 누락 등으로 `scanBacklog()`에서 type/status 인식 실패.
실제 사례: `source-map-compression-constants.md`가 frontmatter 없이 생성되어 정상 파싱 불가.
