# Objective

## Goal
reap help CLI 명령어 + /reap.help 슬래시 커맨드 추가

## Completion Criteria
1. `reap help`가 CLI 명령어 목록 + 슬래시 커맨드 목록 + 간단한 workflow 설명을 출력한다
2. `/reap.help`가 현재 상태에 맞는 contextual 도움말을 제공한다
3. `bun test`, `bunx tsc --noEmit`, 빌드 통과

## Requirements

### Functional Requirements

**FR-001: `reap help` CLI 명령어**
- CLI 명령어 목록 (init, status, update, fix, help)
- 슬래시 커맨드 목록 (11개) + 각각의 한 줄 설명
- Quick start workflow 요약
- 현재 프로젝트 상태 (REAP 프로젝트인지, strict 모드인지)

**FR-002: `/reap.help` 슬래시 커맨드**
- 현재 generation 상태에 따른 contextual 안내:
  - No generation → "시작하려면 /reap.start 또는 /reap.evolve"
  - Active generation → "현재 stage는 X, 다음 단계는 /reap.X"
- 사용 가능한 슬래시 커맨드 목록 + 간단 설명
- strict 모드 상태 안내
- "더 자세한 도움이 필요하면 /reap.help [topic]" (topic: workflow, commands, strict, genome, backlog)

### Non-Functional Requirements
- help 출력은 유저의 language 설정을 따름 (슬래시 커맨드)
- CLI help은 영어 (국제 표준)

## Scope
- **Related Genome Areas**: constraints.md (Slash Commands 목록)
- **Expected Change Scope**: src/cli/index.ts (help 명령어), src/templates/commands/reap.help.md (신규), init.ts COMMAND_NAMES
- **Exclusions**: 기존 commander.js의 --help 옵션은 그대로 유지
