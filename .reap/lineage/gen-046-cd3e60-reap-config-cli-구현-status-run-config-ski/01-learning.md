# Learning — gen-046-cd3e60

## Goal
reap config CLI 구현 + status/run/config skill 정비

## Project Overview
REAP v0.16.0. 46번째 generation. embryo type. 이전 gen-045에서 strict mode 이식 완료 (452 pass).

## Key Findings

### 1. `reap config` CLI 명령 부재
- `src/cli/index.ts`에 config 명령 라우팅 없음
- `src/cli/commands/config.ts` 파일 자체가 없음
- v0.15 참조: `~/cdws/reap_v15/src/cli/commands/run/config.ts` — config 읽어서 text 형태로 emitOutput
- v0.16 패턴: `createPaths(cwd)` -> `readTextFile(paths.config)` -> `YAML.parse()` -> `emitOutput()`

### 2. reap.config.md skill 문제
- `disable-model-invocation: true` 설정됨 -> AI가 결과를 해석 안 함
- `reap config` CLI 자체가 없으므로 실행 자체가 실패
- 수정: disable-model-invocation 제거 + CLI 호출 + AI가 결과 표시

### 3. reap.status.md skill 문제
- `disable-model-invocation: true` 설정 -> CLI는 동작하지만 AI가 JSON 결과를 해석 안 함
- status 명령은 JSON output (project, executionMode, generation 등) 정상 반환
- 수정: disable-model-invocation 제거 + AI가 결과를 해석해서 사용자에게 설명

### 4. reap.run.md skill 문제
- `disable-model-invocation: true` 설정 + 내용 너무 단순
- 수정: disable-model-invocation 제거 + 사용 안내 추가

### 5. 기존 코드 패턴
- CLI command: `execute()` export, `createPaths(cwd)`, `emitOutput/emitError`
- skill 파일: frontmatter (description) + 실행 지시 + AI 행동 안내
- 잘 만들어진 예시: `reap.help.md`, `reap.knowledge.md`

### 6. ReapConfig 타입 (v0.16)
project, language, autoSubagent, strictEdit, strictMerge, agentClient, autoUpdate, cruiseCount(optional)

실제 config.yml에 legacy 필드 잔존 (strict, autoIssueReport 등).

## Previous Generation Reference
gen-045: strict mode 이식. 452 pass. Next hint로 config skill 안내 언급.

## Backlog Review
- [task] reap config CLI 구현 + status/run/config skill 정비 — 이번 generation에서 소비

## Context for This Generation
- Clarity: **HIGH** — 변경 대상 파일, 방향, 참조 코드 모두 명확
- config 출력: config.yml raw 내용을 JSON으로 출력 (ReapConfig 기준)
- 테스트: config.ts에 대한 unit/e2e 테스트 필요
