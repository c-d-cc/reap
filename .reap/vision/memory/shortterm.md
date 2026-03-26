# Shortterm Memory

## 세션 요약 (2026-03-26)

### gen-036: v0.15→v0.16 마이그레이션 구현
- `reap init --migrate` multi-phase migration 핑퐁 구조 구현
- 신규 파일 4개: migrate.ts, check-version.ts, reap.migrate.md, migrate.test.ts
- 수정 파일 11개: CLI 진입점 7개에 v0.15 gate, init 분기, CLI 옵션, postinstall
- 330 tests 통과 (unit 206 + e2e 124)

### 다음 세션에서 할 것
- .reap/v15/ 자동 삭제 로직 (completion commit에서 2-3 gen 후)
- 실제 v0.15 프로젝트에서 migration 테스트 (AI genome 재구성 품질 검증)
- Embryo → Normal 전환 논의
- README v0.16 재작성

### 미결정 사항
- Embryo → Normal 전환 시점
- .reap/v15/ 자동 삭제 타이밍 (2 gen vs 3 gen)

### 현재 backlog 상태
- pending backlog 없음

### 현재 테스트 현황
330 tests (unit 206 + e2e 124)
