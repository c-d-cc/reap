# Shortterm Memory

## 세션 요약 (2026-03-26)

이번 세션에서 gen-020 ~ gen-036 (17 generations) 완료.

### 주요 작업 흐름
- gen-020~027: v0.15 패리티 + 인프라 (hooks, install-skills, prompt→CLI, back nonce, fix, repair)
- gen-028~031: self-evolving (gap-driven, vision eval, memory 3-tier)
- gen-032~035: 추가 기능 (destroy/clean, cruise, clarity, memory workflow)
- gen-036: v0.15→v0.16 마이그레이션 구현

### 다음 세션에서 할 것
- 실제 v0.15 프로젝트에서 migration 테스트 (AI genome 재구성 품질 검증)
- .reap/v15/ 자동 삭제 로직 (completion commit에서 2-3 gen 후)
- alpha publish 실행 → 다른 머신에서 테스트
- README v0.16 재작성
- Embryo → Normal 전환 논의

### 미결정 사항
- Embryo → Normal 전환 시점
- spec2.md 최신화 필요 (현재와 괴리 있음)

### 현재 backlog 상태
- pending backlog 없음

### 현재 테스트 현황
330 tests (unit 206 + e2e 124)
