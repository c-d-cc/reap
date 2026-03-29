# Shortterm Memory

## 세션 요약 (2026-03-29)

### Daemon Indexer Phase 1-4 구현 완료
- `daemon/` 별도 앱 (`@c-d-cc/reap-daemon`) — 22개 소스, 21개 테스트, 15개 쿼리 파일
- Phase 1: HTTP 서버, 라우터, 프로젝트 레지스트리, PID/idle 관리, `reap daemon` CLI
- Phase 2: Tree-sitter WASM 15개 언어 파싱, 심볼 추출, CodeGraph, SQLite 영속화, import/call 해석
- Phase 3: 조회 API (심볼 검색, caller/callee, 파일 의존성, blast radius, 커뮤니티, 실행 플로우)
- Phase 4: CLI query 구현, generation 시작/완료 시 자동 인덱싱, worktree별 인덱스 fork
- SQLite 어댑터 패턴 적용 (Bun: bun:sqlite, Node: better-sqlite3)
- 114개 테스트 통과
- 설계 문서: `.reap/vision/design/daemon-indexer.md`, `daemon-phase{1-4}-plan.md`
- superpowers 스킬 체인(brainstorming → writing-plans → subagent-driven-development)으로 구현

### 다음 세션
- Daemon E2E 테스트 보강 (backlog: daemon-e2e-tests.md) — 증분 인덱싱, 에러 케이스, worktree 분기 등
- Evaluator agent 템플릿 정의 (vision/design/evaluator-agent.md 참조)
- Pre-existing test failures 수정 (integrity, migrate, update 관련 8개)

### Backlog 상태
- daemon-e2e-tests.md: daemon E2E 테스트 보강 (medium)
- fix-migrate-update-tests.md: migrate/update 테스트 8건 수정 (medium)
