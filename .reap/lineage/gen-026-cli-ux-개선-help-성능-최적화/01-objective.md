# Objective

## Goal
CLI UX 개선 (init 메시지/progress) + help 성능 최적화 + backlog 처리 (v0.2.1)

## Completion Criteria
1. `reap init` 실행 시 각 단계별 progress 메시지 출력 + 완료 후 다음 단계 안내
2. `/reap.help` (인자 없음) 응답 속도 개선 — 불필요한 파일 읽기/셸 명령 제거
3. OpenCode autoUpdate PATH 문제 해결 (backlog)
4. `bun test` 통과, `bunx tsc --noEmit` 통과, `npm run build` 성공

## Requirements

### Functional Requirements
- **FR-001**: `reap init` progress — 각 설치 단계(디렉토리 생성, genome 복사, 커맨드 설치, 훅 등록)마다 메시지 출력
- **FR-002**: `reap init` 완료 후 다음 단계 안내 메시지 개선 — 감지된 에이전트, 사용법 등 표시
- **FR-003**: `/reap.help` 성능 최적화 — `reap --version` 제거, backlog/lineage 카운트 제거, 템플릿 간결화 (파일 읽기는 유지)
- **FR-005**: `/reap.help` 상단에 REAP 소개 표시 — REAP이 무엇인지, 어떻게 동작하는지 간단한 description
- **FR-004**: OpenCode 플러그인 autoUpdate — PATH 문제 해결 (절대 경로 또는 환경 변수 주입)

### Non-Functional Requirements
- 기존 기능 하위 호환

## Scope
- **Related Genome Areas**: conventions.md, constraints.md
- **Expected Change Scope**: `src/cli/commands/init.ts`, `src/cli/index.ts`, `src/templates/commands/reap.help.md`, `src/templates/hooks/opencode-session-start.js`
- **Exclusions**: 새 에이전트 추가, 슬래시 커맨드 내용 변경 (help 제외)

## Genome Reference
- conventions.md: Enforced Rules
- constraints.md: Slash Commands 13개

## Backlog (Genome Modifications Discovered)
None

## Background
- gen-025에서 멀티 에이전트 추상화 + OpenCode 지원 추가
- OpenCode 테스트 과정에서 발견된 UX 이슈: init 메시지 빈약, help 느림, autoUpdate PATH 문제
- Backlog: task-opencode-auto-update-path.md (pending)
