# Objective

## Goal
`npm install -g @c-d-cc/reap` 실행 시 postinstall 스크립트로 slash commands를 `~/.claude/commands/`에 자동 설치

## Completion Criteria
1. `npm install -g @c-d-cc/reap` 후 감지된 에이전트별 commands 디렉토리에 `reap.*.md` 파일이 존재한다
2. `postinstall` 스크립트가 실패해도 npm install 자체는 성공한다 (graceful failure)
3. 기존 `reap init`/`reap update`의 commands 설치 로직과 중복 없이 동작한다
4. `bun test` 통과, `npm run build` 성공

## Requirements

### Functional Requirements
- FR-001: `package.json`에 `postinstall` 스크립트 추가 — 빌드된 CLI를 통해 commands 설치
- FR-002: 감지된 모든 에이전트(Claude Code, OpenCode)에 commands 설치 (AgentAdapter 패턴 준수)
- FR-003: postinstall은 `reap update`의 commands 설치 로직을 재사용
- FR-004: postinstall 실패 시 exit 0 반환 (npm install 중단 방지)

### Non-Functional Requirements
- 추가 의존성 없음 (기존 빌드 결과물만 사용)
- postinstall 실행 시간 2초 이내

## Scope
- **Related Genome Areas**: conventions.md (Template Conventions), constraints.md (CLI Subcommands)
- **Expected Change Scope**: `package.json`, `scripts/postinstall.js` (신규)
- **Exclusions**: hooks/templates 설치 (reap init/update 전용, 프로젝트 컨텍스트 필요)

## Genome Reference
- conventions.md: "새 템플릿 추가 시 반드시 init.ts의 COMMAND_NAMES 및 설치 로직도 동기화하라"
- constraints.md: CLI subcommands 5개 (init, status, fix, update, help)

## Backlog (Genome Modifications Discovered)
- source-map.md: Key Constants 테이블의 L1_LIMIT/L2_LIMIT/Staleness threshold Location이 `session-start.cjs` → `genome-loader.cjs`로 변경 필요
- domain/hook-system.md: genome-loader.cjs 공유 모듈 아키텍처 문서화 필요

## Background
- 현재 `npm install -g`은 CLI 바이너리만 설치하고, slash commands는 `reap init`/`reap update`를 별도 실행해야 설치됨
- 다른 머신에서 설치 후 commands가 없어서 slash commands가 인식되지 않는 문제 발생
- gen-039에서 genome-loader.cjs 공유 모듈 추출, gen-040에서 drift 감지 제거 완료
