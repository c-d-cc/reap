# Learning — gen-036-3a6158

## Goal
reap migrate -- v0.15 to v0.16 migration 구현

## Source Backlog
`reap-migrate-v015v016-마이그레이션-구현-migration-planmd-기반.md` (priority: high)

v0.15 사용자가 v0.16을 설치하면 .reap/ 구조 불일치로 모든 CLI 명령이 실패하는 문제 해결. 상세 계획은 `.reap/vision/docs/migration-plan.md`에 정의됨.

## Project Overview

REAP v0.16은 v0.15 대비 다음 구조 변경이 있음:
- **Genome**: principles.md + conventions.md + constraints.md + source-map.md → application.md + evolution.md + invariants.md (source-map은 environment으로 이동)
- **Config**: entryMode, autoIssueReport, genomeVersion, lastSyncedGeneration, preset 필드 제거. agentClient 필드 추가
- **Vision**: 신규 디렉토리 (goals.md, memory/)
- **Hooks**: onLifeObjected 이벤트 제거, onLifeLearned 추가. onMergeSynced → onMergeReconciled
- **Stage**: objective → learning으로 변경 (이미 v0.16에 반영됨)

## Key Findings

### 1. v0.15 구조 (~/cdws/reap_v15/ 참조)
- **Paths**: ReapPaths 클래스 기반 (genome, principles, conventions, constraints, sourceMap, domain, environment, environmentSummary)
- **Config 필드**: project, entryMode, strict, language, autoUpdate, autoSubagent, autoIssueReport, preset, genomeVersion, lastSyncedGeneration
- **Init**: greenfield/migration/adoption 3가지 entryMode

### 2. v0.16 현재 구조
- **Paths**: createPaths() 함수 기반 (ReapPaths 인터페이스)
- **Config 필드**: project, language, autoSubagent, strict, agentClient, autoUpdate, cruiseCount
- **Init**: greenfield/adoption 자동 감지, --repair 옵션

### 3. 구현 대상 분석
- **migrate.ts**: init/index.ts의 execute() 패턴을 따라야 함. `reap init --migrate` 옵션으로 진입
- **v0.15 감지 gate**: `fileExists(join(paths.genome, "principles.md"))` 방식. 공통 함수 추출 필요
- **핑퐁 구조**: CLI가 JSON prompt를 반환하면 AI가 처리 → CLI 재호출하는 multi-phase 패턴. 기존 greenfield init과 동일한 패턴
- **ensureClaudeMd**: init/common.ts에 이미 존재. migrate에서 재사용

### 4. CLI 진입점 구조
- `src/cli/index.ts`: Command 기반 라우팅. `init` 명령에 `--migrate` 옵션 추가 필요
- `init/index.ts`: repair 분기가 있으므로 migrate 분기도 동일 패턴으로 추가

### 5. 테스트 패턴
- e2e: `bun:test` 기반, `cli()` helper로 JSON 파싱, `setupProject()` / `cleanup()` 유틸리티
- 실제 filesystem에 v0.15 구조를 직접 생성하여 테스트해야 함

### 6. v0.15 감지 gate 적용 위치
migration-plan.md에 명시된 파일들:
- `src/cli/commands/run/index.ts` — config 존재 체크 직후
- `src/cli/commands/status.ts` — config 읽기 직후
- `src/cli/commands/fix.ts` — 직접 진입
- `src/cli/commands/make.ts` — 직접 진입
- `src/cli/commands/cruise.ts` — 직접 진입
- `src/cli/commands/destroy.ts` / `src/cli/commands/clean.ts` — 추가 대상

### 7. postinstall 확장
현재 `node dist/cli/index.js install-skills` 만 실행. check-version 추가 필요.

## Previous Generation Reference
gen-035: Memory 갱신 워크플로우 통합. criteria가 명확하여 reflect phase에서 자연스럽게 갱신됨. 교훈: 명시적 criteria가 행동을 만든다.

## Clarity Assessment
- **Level**: High
- **Signals**: migration-plan.md에 상세 설계가 완료됨. 각 phase별 입출력, 파일 변경 목록, edge case까지 정의. backlog도 명확.
- genome은 embryo이나 goal이 매우 구체적이므로 high clarity.

## Implementation Strategy Notes
1. `detectV15()` 공통 함수 → `src/core/integrity.ts`에 추가
2. `src/cli/commands/migrate.ts` 신규 파일 — phase별 함수 분리
3. `src/cli/index.ts` — `reap init --migrate` 옵션 등록
4. v0.15 gate를 6개+ CLI 진입점에 추가
5. `reap.migrate.md` 스킬 파일
6. e2e 테스트: v0.15 .reap/ 구조를 직접 생성
7. postinstall 확장 (check-version)
