---
id: gen-060-e3c492
type: embryo
goal: "daemon E2E 테스트 보강"
parents: ["gen-059-9e9790"]
---
# gen-060-e3c492
daemon E2E 테스트 16건 추가. 4개 테스트 파일 신규 생성, 1개 소스 파일 수정.

변경 내용:
- `daemon/tests/incremental.test.ts` (4 tests): 증분 인덱싱 -- 변경 파일만 처리, 무변경 시 0 처리, lastCommit 없을 때 full fallback, 파일 삭제 처리
- `daemon/tests/error-cases.test.ts` (8 tests): 존재하지 않는 프로젝트, git repo 아닌 디렉토리, path 누락, 인덱싱 전 쿼리, impact param 누락 등
- `daemon/tests/worktree-diverge.test.ts` (2 tests): fork 후 분기 검증, 다중 worktree 독립성
- `daemon/tests/idle-timeout.test.ts` (2 tests): idle 타임아웃 종료, activity로 타이머 리셋
- `daemon/src/server.ts`: `idleCheckIntervalMs` 옵션 추가 (테스트 가능성 개선)

결과: daemon 130 tests pass (기존 114 + 신규 16), main unit 342 pass.