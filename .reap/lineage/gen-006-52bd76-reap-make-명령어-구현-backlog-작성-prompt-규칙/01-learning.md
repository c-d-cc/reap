# Learning — gen-006-52bd76

> reap make 명령어 구현 + backlog 작성 prompt 규칙

## Source Backlog

**파일**: `reap-make-command.md` (priority: high, status: consumed)

### 문제
1. 현재 `reap backlog create`로 backlog 생성은 가능하나, `reap make` 패턴으로 통합 필요 (v0.15 참조: `reap make backlog`)
2. evolve/stage prompt에 backlog 작성 규칙이 없음 — AI가 Write로 직접 생성하여 frontmatter 형식 불일치 발생 가능
3. make 명령은 향후 template 기반 파일 생성 확장 가능

### 해결 방향
1. `reap make backlog --type --title --body --priority` CLI command 추가
2. 기존 `reap backlog create` 유지 (하위 호환), `reap make backlog`이 primary
3. evolve.ts subagent prompt + stage prompt에 backlog 규칙 추가

## Project Overview

REAP v0.16.0, TypeScript CLI. 자기진화형 파이프라인.
- CLI 진입점: `src/cli/index.ts` — custom Command framework (`src/libs/cli.ts`)
- 기존 `reap backlog create` 명령이 이미 동작 중 (line 53-93)
- `createBacklog` 함수: `src/core/backlog.ts` — frontmatter 생성, kebab-case 파일명

## Key Findings

### 1. CLI 구조 (src/cli/index.ts)
- `reap backlog <action>` 커맨드가 line 53-93에 존재
- `action === "create"` 시 `createBacklog(paths.backlog, opts)` 호출
- Commander-like 패턴이지만 custom `Command` class (src/libs/cli.ts)
- `reap make backlog` 추가 시, 기존 `backlog create` 로직을 재사용하면 됨

### 2. evolve.ts — Subagent Prompt (src/cli/commands/run/evolve.ts)
- `buildSubagentPrompt` 함수가 subagent에게 전달할 전체 prompt 생성
- line 159-164: "Backlog Rules" 섹션이 이미 있음
- 현재 규칙: "Write .md files directly in `.reap/life/backlog/`" — 이것이 문제의 원인
- v0.15 참조 규칙으로 교체 필요: `reap make backlog` 사용, Write 금지, 생성 후 Edit

### 3. Stage Prompts
- **implementation.ts** (line 50-51): "Write `.reap/life/backlog/<name>.md`" — Write 직접 생성 안내 → 수정 필요
- **planning.ts**: backlog 관련 직접 규칙 없음, echo chamber prevention에서 backlog 언급만 있음 → 규칙 추가 고려
- **learning.ts**: backlog 생성 안내 없음 (읽기만) → 변경 불필요

### 4. backlog.ts — createBacklog 함수
- `createBacklog(backlogDir, opts)` — type, title, body, priority 받아서 frontmatter + template 생성
- kebab-case 파일명 자동 생성
- valid types: genome-change, environment-change, task
- 이 함수를 `reap make backlog`에서도 동일하게 호출하면 됨

## Previous Generation Reference

gen-005-944652: start에서 backlog consume 마킹 구현 완료.
- Fitness: "backlog consume 마킹 구현 완료. start --backlog + learning sourceBacklog 참조. e2e 통과."
- Next hint에 "reap make 명령어 + backlog 작성 prompt 규칙"이 명시됨 → 본 generation의 직접 연결

## Backlog Review

8개 pending 중 본 generation 관련 항목:
- `artifact-path-in-prompt.md` — stage prompt 개선 관련이지만 별개 scope. 이번에 다루지 않음.
- 나머지 7개는 본 goal과 무관.

## Context for This Generation

### Clarity: **High**
- Source backlog에 명확한 task 4개 정의
- v0.15 참조 규칙이 구체적
- 변경 파일 목록이 명시됨
- 이전 세대 hint와 정확히 일치

### 구현 범위
- **T001**: `src/cli/index.ts`에 `reap make backlog` command 추가
- **T002**: `src/cli/commands/run/evolve.ts` Backlog Rules 섹션 수정
- **T003**: `src/cli/commands/run/implementation.ts`, `planning.ts` stage prompt에 backlog 규칙 추가
- **T004**: typecheck + build + e2e 검증

### 주의사항
- `reap backlog create`는 하위 호환 유지 (제거하지 않음)
- `reap make` 패턴은 향후 확장 가능성 고려하되, 이번에는 `make backlog`만 구현
