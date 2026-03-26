# Learning — gen-023-5e7967

## Goal
prompt 기반 flow를 CLI script로 이전 (merge, pull, knowledge, abort)

## Source Backlog
backlog `prompt-기반-flow를-cli-script로-이전-merge-pull-knowledge-abort.md`에서 시작.
4개 스킬의 flow 제어 로직이 prompt(.md)에 정의되어 있어 v15 패턴(1줄 CLI 호출 + stdout 지시 따르기)으로 전환 필요.

## Project Overview
REAP v0.16.0 — TypeScript CLI, Bun build, file-based state. Adapter Layer(skill .md) → CLI Layer → Core Layer → State Layer 4계층 구조. 22세대 완료, gen-022에서 prompt.ts 공통화 완료.

## Key Findings

### 1. abort — 이미 완성된 구조
- `src/cli/commands/run/abort.ts`: 2-phase(confirm/execute) CLI 핸들러 **이미 완전 구현**
- `run/index.ts`에 등록 완료, CLI 옵션(--reason, --source-action, --save-backlog) 처리 완료
- 스킬 `reap.abort.md`만 1줄로 축소하면 됨
- 현재 스킬(34줄)이 CLI가 이미 하는 일을 중복 설명하고 있음

### 2. merge — 오케스트레이터 불필요, evolve 위임
- 개별 merge stage 핸들러(detect, mate, merge, reconcile)는 이미 존재
- **문제**: `reap.merge.md`(72줄)가 전체 merge lifecycle 설명 + 개별 stage 명령어를 나열
- **이름 충돌**: `merge`가 이미 STAGE_HANDLERS에 merge stage(소스 병합) 핸들러로 등록
- **해법**: merge 스킬은 start + evolve 조합으로 안내. evolve가 이미 merge도 처리함. 별도 오케스트레이터 불필요
- 스킬을 "Run `reap run merge $ARGUMENTS`" 형태로 1줄 축소 가능하나, merge orchestrator가 필요
- 대안: 스킬이 간단한 사용법만 남기고 CLI evolve로 위임

### 3. pull — 새 핸들러 필요
- CLI 핸들러 없음 (run/pull.ts 미존재, STAGE_HANDLERS에 미등록)
- 주의: push.ts는 존재하지만 push와 pull은 별개
- 현재 스킬(58줄)이 git fetch/branch 분석/조건 분기를 직접 설명
- **해법**: `src/cli/commands/run/pull.ts` 신규 생성
  - git fetch --all 실행
  - 현재 브랜치 vs origin 분석 (ahead/behind)
  - 결과별 prompt 반환 (in-sync / ff-possible / diverged / unmerged branches)
  - run/index.ts에 등록

### 4. knowledge — 새 핸들러 필요
- CLI 핸들러 없음
- 현재 스킬(46줄)이 reload/genome/environment/no-arg 4가지 flow를 설명
- **해법**: `src/cli/commands/run/knowledge.ts` 신규 생성
  - extra 파라미터로 subcommand 전달 (reload/genome/environment)
  - 각 subcommand별 파일 경로 + prompt 반환
  - run/index.ts에 등록

### 5. CLI 핸들러 패턴 분석
기존 핸들러 공통 패턴:
```typescript
export async function execute(paths: ReapPaths, phase?: string, extra?: string): Promise<void>
```
- `emitOutput()` / `emitError()`로 JSON 반환
- `status: "prompt"` + `prompt` 필드로 AI에게 지시
- `nextCommand`로 다음 명령 안내
- generation 상태 불필요한 utility 명령(push, abort)은 독립적

### 6. run/index.ts dispatch 구조
- `STAGE_HANDLERS` Record에 등록
- handler 시그니처: `(paths, phase?, extra?) => Promise<void>`
- extra: feedback/reason/goal 중 하나 전달 (stage에 따라)
- pull과 knowledge는 lifecycle stage가 아닌 utility command이므로 STAGE_HANDLERS에 추가 등록

## Previous Generation Reference
gen-022: reap-guide.md + prompt.ts 공통화 완료. prompt.ts의 loadReapKnowledge/buildBasePrompt가 evolve에서 사용 중. knowledge의 reload에서도 활용 가능.

## Backlog Review
- [task] 기존 reap 프로젝트에 CLAUDE.md 추가 (migration) — 이번 generation과 무관, 유지

## Context for This Generation
- Clarity: **High** — goal이 구체적, backlog이 상세한 방향 포함, v15 패턴이 명확한 참조점
- 위험 요소: merge stage handler vs merge orchestrator 이름 충돌 (evolve 위임으로 회피)
- 변경 범위: 스킬 4개 축소 + CLI 핸들러 2개 신규(pull, knowledge) + run/index.ts 등록 2건
- 테스트: CLI command 추가이므로 e2e test 필요
