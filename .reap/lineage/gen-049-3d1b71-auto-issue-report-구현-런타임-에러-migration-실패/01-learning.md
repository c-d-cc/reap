# Learning

## Project Overview

REAP v0.16.0 CLI 프로젝트. v0.15에서 있었던 auto issue report 기능과 수동 report 기능이 v0.16 migration 과정에서 제거됨. 이번 generation에서 두 기능을 v0.16 아키텍처에 맞게 재구현한다.

## Key Findings

### v0.15 구현 분석

**자동 report (run/index.ts:57-82)**:
- `reap run <command>` 실행 중 unexpected error 발생 시 catch 블록에서 `gh issue create` 실행
- `config.autoIssueReport` 설정으로 on/off 제어
- `execSync`로 gh CLI 직접 호출, `stdio: "ignore"`, timeout 10초
- issue 본문: REAP 버전, 명령어, 에러 메시지, OS, Node 버전
- best-effort: 실패해도 원래 에러를 `emitError`로 전달

**자동 report (update.ts:305-316)**:
- migration 에러 시 동일 패턴, label `"auto-reported,migration"`
- `execSync` + `stdio: "pipe"`, timeout 15초

**수동 report (run/report.ts)**:
- prompt 기반: AI에게 context 수집, privacy 필터링, 사용자 확인 지시
- `gh` CLI 설치/인증 확인 gate
- 민감 정보 마스킹 규칙 포함 (이메일, API 키, 소스코드 등)

### v0.16 현재 상태

- `ReapConfig`에 `autoIssueReport` 필드 없음 (migration 시 제거됨)
- `run/index.ts`에 try-catch 없음 — handler 호출이 bare `await`
- `update.ts`에 에러 report 로직 없음
- `report` command 및 skill 없음
- `output.ts`의 `emitError`는 `process.exit(0)`으로 종료 (JSON status로 구분)

### 설계 결정 포인트

1. **config 필드**: `autoIssueReport`를 ReapConfig에 다시 추가할지, 아니면 항상 on으로 할지
   - backlog에는 config gate 언급 없음
   - v0.15는 config로 제어했음
   - best-effort이므로 항상 on이 합리적이나, 유저 선택권도 중요
   - **결정 필요**: config 필드 추가 여부

2. **core/report.ts**: autoReport 함수를 core에 분리하여 run/index.ts와 update.ts에서 공유

3. **report command**: `reap run report`로 등록, STAGE_HANDLERS에 추가

## Previous Generation Reference

gen-048: release notice 구현. v0.15 코드 이식 패턴이 효율적이었다는 교훈. fitness: ok.

## Backlog Review

소비 대상:
- `auto-issue-report-구현-런타임-에러migration-실패-시-자동-github-issue-생성.md` (task, pending)

## Context for This Generation

- **Clarity: HIGH** — backlog이 구체적이고 v0.15 참조 코드가 명확
- **Type: embryo** — genome 수정 자유
- config 필드 추가 여부 판단이 필요하지만, v0.15 패턴을 따라 `autoIssueReport: true`를 default로 추가하는 것이 자연스러움
- `emitError`가 `never` 타입을 반환하므로, try-catch에서 원래 에러 전달 시 `emitError` 호출로 충분
- tests/ submodule에 unit test 추가 필요 (core/report.ts 대상)
