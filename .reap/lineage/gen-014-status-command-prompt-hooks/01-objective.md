# Objective

## Goal
/reap.status slash command + hooks prompt 타입 지원 + 문서 자동 업데이트 hook

## Completion Criteria
1. `/reap.status` slash command가 현재 generation/stage/backlog/timeline 등 풍부한 정보를 출력
2. hooks에서 `prompt` 타입을 지원 (command 외에)
3. reap.next/start/back 프롬프트에서 prompt 타입 hook 실행 지시 포함
4. reap-guide.md에 prompt 타입 hook 설명 포함
5. reap 프로젝트 config.yml에 문서 자동 업데이트 prompt hook 등록
6. README.md/README.ko.md에 /reap.status + prompt hook 반영
7. docs 사이트 페이지에 변경사항 반영
8. `bun test` 통과

## Requirements

### Functional Requirements
- FR-001: `src/templates/commands/reap.status.md` 신규 생성
- FR-002: `src/types/index.ts` — ReapHookCommand에 `prompt?: string` 필드 추가
- FR-003: `src/cli/commands/init.ts` — COMMAND_NAMES에 `reap.status` 추가
- FR-004: `reap.next.md`, `reap.start.md`, `reap.back.md` — prompt 타입 hook 처리 지시
- FR-005: `reap-guide.md` — hooks 섹션에 prompt 타입 설명 추가
- FR-006: `.reap/config.yml` — onGenerationComplete에 문서 업데이트 prompt hook 추가
- FR-007: README.md, README.ko.md — slash commands 테이블 + hooks 예시 업데이트
- FR-008: docs 페이지 — WorkflowPage, HeroPage 업데이트

### Non-Functional Requirements
- 기존 테스트 하위 호환 유지

## Scope
- **Expected Change Scope**: types, templates/commands, cli/commands/init.ts, config.yml, README, docs/
- **Exclusions**: CLI 코드 로직 변경 없음 (prompt hook은 AI 에이전트가 처리)

## Background
- backlog 01-slash-command-status.md, 02-auto-docs-update-hook.md 통합
