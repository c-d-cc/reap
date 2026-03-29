# Shortterm Memory

## 세션 요약 (2026-03-29)

### gen-052: self-evolve + origin/main 병합 (merge generation)
- self-evolve(evaluator agent gen-050~051)과 origin/main(daemon Phase 1~4)을 병합
- memory shortterm.md 충돌 1건 해결 (양쪽 통합)

### Daemon Indexer Phase 1-4 구현 완료
- `daemon/` 별도 앱 (`@c-d-cc/reap-daemon`) — 22개 소스, 21개 테스트, 15개 쿼리 파일
- Phase 1: HTTP 서버, 라우터, 프로젝트 레지스트리, PID/idle 관리, `reap daemon` CLI
- Phase 2: Tree-sitter WASM 15개 언어 파싱, 심볼 추출, CodeGraph, SQLite 영속화, import/call 해석
- Phase 3: 조회 API (심볼 검색, caller/callee, 파일 의존성, blast radius, 커뮤니티, 실행 플로우)
- Phase 4: CLI query 구현, generation 시작/완료 시 자동 인덱싱, worktree별 인덱스 fork
- SQLite 어댑터 패턴 적용 (Bun: bun:sqlite, Node: better-sqlite3)
- 114개 테스트 통과

### 다음 세션
- Evaluator 코드 통합 (prompt.ts, completion.ts — fitness 위임 로직)
- Daemon E2E 테스트 보강 (backlog: daemon-e2e-tests.md)
- Pre-existing test failures 수정 (integrity/migrate/update 관련)

### Backlog 상태
- `daemon-e2e-tests.md` (task) — daemon E2E 테스트 보강 (medium)
- `fix-migrate-update-tests.md` (task) — integrity/migrate/update 관련 pre-existing test failure
- `strict-merge-mode-bypass-for-merge-gen.md` (task) — merge gen에서 strict merge 자동 bypass
