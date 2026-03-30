# Learning

## Goal

daemon E2E 테스트 보강 -- backlog `daemon-e2e-tests.md` 기반.

## Source Backlog

`daemon-e2e-tests.md`: daemon Phase 1-4 구현 완료 후 유닛/통합 테스트 114개 통과하나, E2E 시나리오 커버리지에 gap이 존재. 높은 우선순위 3개(증분 인덱싱, 에러 케이스, worktree fork 분기), 중간 우선순위 3개(idle 타임아웃, lifecycle hook 연동, CLI reap daemon 흐름).

## Project Overview

- Daemon은 `daemon/` 디렉토리에 별도 앱(@c-d-cc/reap-daemon)으로 존재
- localhost:17224 HTTP API, Tree-sitter WASM 15개 언어 파서, 인메모리 그래프 + SQLite write-through
- 기존 테스트: 21 파일, 114 tests (unit + integration 혼합), 모두 `daemon/tests/` 내 bun:test

## Key Findings

### 기존 테스트 커버리지 분석

현재 테스트가 다루는 영역:
- **Unit**: graph, parser, scanner, storage, community, impact, process-tracer, import-resolver, call-resolver, languages, router, registry, process, queries
- **Integration**: integration.test.ts (register -> status -> index -> list -> unregister 전체 흐름), indexing-api.test.ts (인덱싱 API), query-api.test.ts (전체 쿼리 엔드포인트), worktree.test.ts (worktree 인덱싱 기초)

### 커버리지 갭 (backlog 기준)

1. **증분 인덱싱 E2E**: `pipeline.ts`에 `runIncrementalPipeline` 구현 존재, `IndexManager.indexProject(root, incremental=true)` 경로. 테스트 없음. 핵심 검증 대상:
   - 파일 변경 후 incremental 호출 시 변경 파일만 재파싱
   - 기존 심볼 유지, 변경된 심볼만 업데이트

2. **에러 케이스**: 현재 404 테스트만 존재. 미테스트 항목:
   - 존재하지 않는 프로젝트 ID로 status/index/query 요청
   - git repo 아닌 디렉토리에서 인덱싱
   - 인덱싱 전 쿼리 API 호출 시 빈 결과 or 에러

3. **Worktree fork 후 분기**: `worktree.test.ts`는 기초적 -- main과 worktree 양쪽 인덱싱만 확인. 핵심 미검증:
   - main fork 후 worktree에서 파일 수정 -> 재인덱싱 -> main과 다른 결과 확인

### 중간 우선순위 분석

4. **Idle 타임아웃**: `process.ts`의 `IdleTimer` + `server.ts`의 idle shutdown check (60초 interval). 짧은 타임아웃으로 검증 가능.

5. **Lifecycle hook 연동**: `daemon/lifecycle.ts`의 `triggerIndexing`, `ensureRegistered` -- daemon HTTP 클라이언트 기반. 실제 daemon 가동 필요.

## Previous Generation Reference

gen-059: migrate/update 테스트 8건 수정 완료. fitness: pass. 교훈: backlog에 정확한 정보가 있으면 탐색-분석-수정이 빠름.

## Backlog Review

- `daemon-e2e-tests.md` (task, medium) -- 이번 generation의 source backlog
- `fix-migrate-update-tests.md` -- gen-059에서 consumed
- `strict-merge-mode-bypass-for-merge-gen.md` -- gen-058에서 consumed

## Context for This Generation

- Clarity: **HIGH** -- backlog에 구체적 테스트 목록과 우선순위 명시
- 타입: embryo
- 기존 테스트 패턴: `createDaemonServer` + ephemeral port + HTTP fetch. beforeEach/afterEach로 tmpdir 정리
- 증분 인덱싱 테스트에는 git commit 후 파일 수정 -> 재커밋 -> incremental pipeline 호출 필요
- 기존 114개 테스트 모두 통과 확인 (bun install 필요 -- node_modules 미설치 상태였음)

## Approach

높은 우선순위 3개 집중 + 시간 여유 시 idle 타임아웃 추가:
1. `incremental.test.ts` -- 증분 인덱싱 E2E
2. `error-cases.test.ts` -- 에러 케이스 모음
3. `worktree-diverge.test.ts` -- fork 후 분기 검증
4. (시간 여유 시) idle 타임아웃 테스트
