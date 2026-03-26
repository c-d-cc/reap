# Learning — gen-025-6513c5

## Goal

adapt phase에서 subagent 자율 backlog 생성 방지 — prompt 규칙 강화

## Source Backlog

gen-023의 adapt phase에서 subagent가 `나머지-스킬-prompt-cli-이전.md` backlog를 검증 없이 자율 생성.
- 해당 스킬들은 이미 1줄 패턴이라 불필요한 backlog였음
- evolution.md의 Echo Chamber 방지 원칙 위반: `[autonomous]` 태그 미부착, 사전 검증 없음
- 근본 원인: adapt phase prompt가 backlog 생성을 직접 지시하고 있음

## Key Findings

### 1. completion.ts adapt phase prompt (근본 원인)

`src/cli/commands/run/completion.ts` line 252:
```
"3. **Suggest Next Generation Candidates**: Record as type: task in backlog"
```
이 지시가 subagent에게 backlog를 직접 생성하라고 명시적으로 안내. subagent는 `reap make backlog` 명령을 실행하여 backlog를 자율 생성하게 됨.

### 2. prompt.ts buildBasePrompt() — Backlog Rules 섹션

`src/core/prompt.ts` line 220-225에 `reap make backlog` 명령 사용법이 포함되어 있어, 모든 stage에서 subagent가 backlog를 만들 수 있는 도구를 제공.

adapt phase에서는 이 도구가 문제를 일으킴. backlog 생성은 인간의 명시적 요청이 있을 때만 허용되어야 함.

### 3. 수정 방향

**completion.ts**: adapt phase의 step 3을 변경 — "backlog에 기록" 대신 "artifact 텍스트에 제안으로만 포함". `reap make backlog` 실행 금지 명시.

**prompt.ts**: Echo Chamber 방지 규칙을 base prompt에 강화. adapt phase에서 backlog 생성 금지 규칙 추가.

**reap-guide.md**: Critical Rules에 backlog 생성 제한 규칙 추가.

## Previous Generation Reference

gen-024에서 239 tests 전체 통과. 이번 변경은 prompt 텍스트 수정이므로 기능적 영향 최소. 기존 테스트가 깨지지 않으면 충분.

## Backlog Review

- [task] 기존 reap 프로젝트에 CLAUDE.md 추가 (migration) — 이번 generation과 무관

## Context for This Generation

- Generation type: embryo (genome 자유 수정 가능)
- Clarity: **High** — goal이 명확하고 수정 대상 파일과 방향이 구체적
- 변경 범위: prompt 텍스트만 수정, 로직 변경 없음
- 테스트: 기존 239 tests 통과 확인으로 충분 (prompt 변경은 기능적 테스트 skip 가능)
