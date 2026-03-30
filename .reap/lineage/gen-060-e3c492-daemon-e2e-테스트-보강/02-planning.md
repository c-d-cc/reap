# Planning

## Goal

daemon E2E 테스트 보강. 높은 우선순위 3개(증분 인덱싱, 에러 케이스, worktree fork 분기) + 중간 우선순위 1개(idle 타임아웃).

## Completion Criteria

1. `daemon/tests/incremental.test.ts` 존재 -- 파일 변경 후 증분 인덱싱이 변경 파일만 재파싱하고 기존 심볼이 유지되는지 검증
2. `daemon/tests/error-cases.test.ts` 존재 -- 존재하지 않는 프로젝트 ID, git repo 아닌 디렉토리, 인덱스 전 쿼리 등 에러 케이스 검증
3. `daemon/tests/worktree-diverge.test.ts` 존재 -- main fork 후 worktree에서 파일 수정/재인덱싱 시 main과 다른 결과 확인
4. `daemon/tests/idle-timeout.test.ts` 존재 -- 짧은 타임아웃 설정 후 서버 자동 종료 확인
5. 기존 114개 테스트 + 신규 테스트 모두 통과
6. 신규 테스트 수 최소 10개 이상

## Approach

기존 테스트 패턴 준수: `createDaemonServer` + ephemeral port(0) + HTTP fetch. tmpdir 기반 격리. bun:test.

증분 인덱싱은 IndexManager를 직접 사용하는 것과 HTTP API 경로 모두 테스트. 에러 케이스는 HTTP API 레벨에서 검증. Worktree 분기는 server.ts의 `getIndexManager` fork 로직 검증. Idle 타임아웃은 짧은 interval + 짧은 timeout으로 빠르게 검증.

## Tasks

- [ ] T001 `daemon/tests/incremental.test.ts` -- 증분 인덱싱 E2E 테스트 작성
  - full index -> 파일 수정 + git commit -> incremental index -> 변경 파일만 처리 확인
  - 기존 심볼 유지 + 변경/추가 심볼 반영 확인
  - HTTP API 경로 (`?incremental=true` 또는 body 파라미터) 확인 필요
  - 테스트: bun test 자동 실행

- [ ] T002 `daemon/tests/error-cases.test.ts` -- 에러 케이스 테스트 작성
  - 존재하지 않는 프로젝트 ID로 status 조회 -> error 응답
  - 존재하지 않는 프로젝트 ID로 index 요청 -> error 응답
  - 존재하지 않는 프로젝트 ID로 symbols 쿼리 -> error 응답
  - git repo 아닌 디렉토리 등록 후 인덱싱 -> error 응답
  - path 없이 register -> error 응답
  - 테스트: bun test 자동 실행

- [ ] T003 `daemon/tests/worktree-diverge.test.ts` -- worktree fork 후 분기 검증
  - register -> index main -> index worktree(fork) -> worktree 쪽에서 파일 수정 + commit -> reindex worktree -> main과 다른 symbols 결과 확인
  - 테스트: bun test 자동 실행

- [ ] T004 `daemon/tests/idle-timeout.test.ts` -- idle 타임아웃 테스트
  - 짧은 idleTimeoutMs (예: 500ms) + 짧은 interval 설정 -> 서버 close 이벤트 확인
  - request 시 타이머 리셋 확인
  - 테스트: bun test 자동 실행

- [ ] T005 전체 테스트 실행 및 통과 확인
  - `bun test daemon/tests/` 전체 통과 확인
  - 기존 114 + 신규 모두 pass

## Additional Findings

`projects/:id/index` API에서 incremental 모드를 어떻게 트리거하는지 확인 필요. 현재 `projects.ts`의 `index` 핸들러는 `mgr.indexProject(entry.path)`만 호출하고 `incremental` 파라미터를 전달하지 않음. 이 부분은 query param이나 body로 전달하도록 수정이 필요할 수 있음 -- 또는 IndexManager 직접 사용으로 테스트.

-> 코드 확인 결과, API 핸들러가 incremental을 지원하지 않으므로, 증분 인덱싱 E2E는 IndexManager를 직접 사용하는 방식으로 작성. API 레벨 증분 인덱싱 지원은 이번 scope에서 API 수정 없이 테스트만 작성.
