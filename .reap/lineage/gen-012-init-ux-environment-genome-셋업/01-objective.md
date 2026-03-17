# Objective

## Goal
reap init UX 개선 + Environment/Genome 대화형 셋업

## Completion Criteria
1. `reap init` (인자 없음)이 현재 디렉토리 이름으로 init 됨
2. `reap init` 시 기존 소스 존재하면 adoption 모드를 제안함
3. `/reap.objective`에서 environment가 비어있을 때 개념 브리핑 + 대화형 수집 지시 포함
4. `/reap.objective`에서 greenfield genome 셋업 시 앱 소개 → 스택 추천 → 설계 질문 순서 지시 포함
5. `/reap.objective`에서 adoption genome 셋업 시 root 검증 → 문서 수집/검증 → 소스 분석 → genome 추론 순서 지시 포함
6. `bun test` 통과

## Requirements

### Functional Requirements
- FR-001: `reap init` — name 인자 없이 실행 시 현재 디렉토리 이름을 프로젝트 이름으로 사용
- FR-002: `reap init` — 현재 디렉토리에 소스 파일(package.json, go.mod 등)이 있으면 `--mode adoption` 제안
- FR-003: `reap.objective.md` — Environment Scan에서 비어있을 경우 Environment 개념 브리핑 후 대화형 수집 지시
- FR-004: `reap.objective.md` — Genome Health Check에서 첫 Generation + greenfield일 때 앱 소개 질문 → 스택 추천 → 설계 질문 순서
- FR-005: `reap.objective.md` — Genome Health Check에서 첫 Generation + adoption일 때 root 검증 → 기존 문서 수집/검증 → 소스 분석 → genome 추론 순서
- FR-006: `reap init` — 기존 `reap init <name>` 동작은 하위 호환 유지

### Non-Functional Requirements
- 기존 테스트 깨지지 않을 것
- CLI help 메시지가 새 동작을 반영할 것

## Scope
- **Related Genome Areas**: constraints.md (CLI 관련), conventions.md (커맨드 패턴)
- **Expected Change Scope**: src/cli/index.ts, src/cli/commands/init.ts, src/templates/commands/reap.objective.md, tests/
- **Exclusions**: reap.objective.md 외 다른 slash command 변경 없음, docs/ 사이트 업데이트는 별도

## Genome Reference
- conventions.md: Git commit 규칙
- constraints.md: Bun runtime, TypeScript

## Backlog (Genome Modifications Discovered)
None

## Background
- backlog 3개 항목(01-init-ux, 02-environment-interactive, 03-genome-interactive)을 하나의 Generation으로 통합
- CLI 코드 변경은 init 관련만, 나머지는 AI 에이전트 프롬프트 지시로 구현
- Adoption 시 소스 분석은 AI 에이전트가 프롬프트 지시에 따라 수행 (CLI 자동 분석 아님)
