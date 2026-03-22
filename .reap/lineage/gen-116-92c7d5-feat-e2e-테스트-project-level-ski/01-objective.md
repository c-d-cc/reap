# Objective

## Goal
feat: E2E 테스트 -- project-level skill 설치 검증 + OpenCode 대응

기존 `skill-loading-e2e.sh`를 현재 버전(v0.13.x) 기준으로 전면 업데이트하고, Claude Code와 OpenCode 양 에이전트에 대한 E2E 테스트를 추가한다.

## Completion Criteria
1. `skill-loading-e2e.sh`가 현재 버전 기준으로 업데이트됨
2. Claude Code 테스트: `reap init` 후 커맨드 원본 설치, session-start 실행 후 `.claude/skills/{name}/SKILL.md` 생성, frontmatter 필드 검증, legacy 정리, .gitignore 확인
3. OpenCode 테스트: `reap init` 후 커맨드 원본 설치, plugin 설치 경로 확인, Non-REAP 격리
4. Non-REAP 프로젝트 격리 검증 (Claude Code + OpenCode)
5. `openshell`에서 E2E 테스트 실행 및 전체 통과

## Requirements

### Functional Requirements
1. FR-01: `reap init` 후 `~/.reap/commands/`에 커맨드 원본 파일이 설치되는지 검증
2. FR-02: `session-start.cjs` 실행 후 `.claude/skills/{name}/SKILL.md` 파일이 생성되는지 검증
3. FR-03: SKILL.md frontmatter에 `name`, `description` 필드 존재 확인
4. FR-04: legacy `.claude/commands/reap.*` 파일이 정리되는지 확인
5. FR-05: `.gitignore`에 `.claude/skills/reap.*` 항목이 추가되는지 확인
6. FR-06: Non-REAP 프로젝트에서 `.claude/skills/reap.*` 미생성 확인
7. FR-07: OpenCode의 `opencode-session-start.js`가 `~/.config/opencode/plugins/`에 설치 확인
8. FR-08: Non-REAP 프로젝트에서 OpenCode 커맨드 격리 확인
9. FR-09: 로컬 빌드 패키지(.tgz)를 사용하여 OpenShell sandbox에서 테스트

### Non-Functional Requirements
1. NFR-01: 기존 helper 함수(assert_eq, assert_file_exists 등) 재사용
2. NFR-02: 테스트 실행 시간 5분 이내

## Design

### Selected Design
단일 `skill-loading-e2e.sh` 파일에 Claude Code와 OpenCode 테스트를 모두 포함.
- 기존 v0.6.1/v0.7.0 업그레이드 테스트 삭제 (outdated)
- 현재 버전 기준 fresh install 테스트로 대체
- 테스트 함수 구조: `test_claude_code_skills()`, `test_opencode_setup()`, `test_non_reap_isolation()`

## Scope
- **Related Genome Areas**: ADR-004 (AgentAdapter), source-map (agents)
- **Expected Change Scope**: `tests/e2e/skill-loading-e2e.sh` 전면 재작성
- **Exclusions**: 실제 에이전트 실행 테스트 (Claude Code CLI, OpenCode CLI는 sandbox에 없음)

## Genome Reference
- ADR-004: AgentAdapter 추상화 + 멀티 에이전트 지원

## Backlog (Genome Modifications Discovered)
None

## Background
기존 `skill-loading-e2e.sh`는 v0.6.1에서 v0.7.0으로의 업그레이드 시나리오를 테스트하던 것으로, 현재 버전(v0.13.x)과 맞지 않음. 특히 skills 기반 아키텍처(`.claude/skills/`)와 OpenCode 지원이 추가된 이후의 E2E 테스트가 필요.
