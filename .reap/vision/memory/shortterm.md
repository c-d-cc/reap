# Shortterm Memory

## 세션 요약 (2026-03-26)

이번 세션에서 gen-020 ~ gen-031 (12 generations) 완료.

### 주요 작업
- gen-020: install-skills cleanup (stale 스킬 자동 정리)
- gen-021: hook-engine 고급 기능 포팅 (v0.15 hook-engine.ts)
- gen-022: reap-guide.md 작성 + subagent prompt 공통화 (prompt.ts)
- gen-023: prompt→CLI script 이전 (merge, pull, knowledge, abort)
- gen-024: back nonce 재발급 + completion commit 순서 교정
- gen-025: adapt echo chamber 방지 (backlog 자율 생성 금지)
- gen-026: CLAUDE.md migration (init --repair)
- gen-027: reap fix (integrity check)
- gen-028: Gap-driven Evolution (vision gap 분석)
- gen-029: Vision evaluation (16항목 진단 + vision development 제안)
- gen-030: lineage 편향 분석 제거 (잘못된 신호)
- gen-031: Vision Memory 도입 (3-tier)

### 추가 작업 (generation 외)
- reapdev 스킬 5개 v0.15에서 포팅
- 빌드 스크립트 분리 (scripts/build.sh)
- CLAUDE.md Quick Start 제거
- Update Agent 3-phase 로드맵 vision에 추가
- Workaround 금지 원칙 genome 추가
- Vision/Memory 원칙 genome 추가
- 아키텍처 변경 시 genome 동기화 원칙 추가

### 다음 세션에서 할 것
- `reap destroy`, `reap clean` backlog 처리
- README v0.16 재작성
- Embryo → Normal 전환 논의
- RALPH loop 분석 완료 — cruise mode에서만 참고 가능, supervised에선 제안만

### 유저와 논의했지만 아직 미결정
- Embryo → Normal 전환 시점
- session start hook 재도입 여부 (현재 CLAUDE.md + reap-guide로 대체 중)

### 현재 테스트 현황
305 tests (unit 180 + e2e 84 + scenario 41)
