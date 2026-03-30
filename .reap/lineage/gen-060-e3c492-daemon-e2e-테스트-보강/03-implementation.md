# Implementation Log

## Completed Tasks

### T001: `daemon/tests/incremental.test.ts` -- 증분 인덱싱 E2E (4 tests)
- `incremental index processes only changed files`: full index -> 파일 수정/커밋 -> incremental -> 변경 파일만 처리, 기존 심볼 유지, 새 심볼 추가 확인
- `incremental with no changes returns zero files processed`: 변경 없이 incremental 호출 시 0 파일 처리
- `incremental falls back to full index when no lastCommit`: 첫 호출 시 full로 fallback
- `incremental handles file deletion`: 파일 삭제 후 incremental -> 삭제된 심볼 제거, 나머지 유지

### T002: `daemon/tests/error-cases.test.ts` -- 에러 케이스 (8 tests)
- 존재하지 않는 프로젝트 ID로 status/index 요청 -> error
- 존재하지 않는 프로젝트 ID로 symbols 쿼리 -> ok with empty data (getIndexManager가 on-the-fly 생성하므로)
- path 없이 register -> error
- git repo 아닌 디렉토리 인덱싱 -> error
- 인덱싱 전 쿼리 -> ok with empty results
- 존재하지 않는 프로젝트 unregister -> crash 안 함
- impact query without files param -> error

### T003: `daemon/tests/worktree-diverge.test.ts` -- worktree 분기 검증 (2 tests)
- `worktree index diverges from main after modification`: main 인덱싱 -> worktree fork -> 파일 추가/커밋 -> worktree만 재인덱싱 -> worktree에만 새 심볼 존재, main에는 없음
- `multiple worktrees are independent`: wt-a, wt-b 독립 생성 -> wt-a만 재인덱싱 -> wt-b와 main에는 새 심볼 없음

### T004: `daemon/tests/idle-timeout.test.ts` -- idle 타임아웃 (2 tests)
- `server closes after idle timeout expires`: 짧은 타임아웃(200ms) + 짧은 체크 간격(100ms) -> close 이벤트 발생
- `activity resets idle timer`: 주기적 요청으로 서버 유지 -> 요청 중단 후 close

## Source Code Changes

- `daemon/src/server.ts`: `ServerConfig`에 `idleCheckIntervalMs?: number` 옵션 추가. idle check interval을 설정 가능하게 변경 (기본값 60_000 유지). idle timeout 테스트를 위한 최소 변경.

## Results

- 기존: 114 tests, 21 files
- 신규: 16 tests, 4 files
- 합계: 130 tests, 25 files, 0 failures
