# Shortterm Memory

## 세션 요약 (2026-03-26)

### gen-038: migrate/init legacy cleanup
- `cleanupLegacyProjectSkills()` 공통 함수 추가 (integrity.ts)
- migrate execute + init에서 프로젝트 레벨 `reap.*`/`reapdev.*` 파일 자동 정리
- unit 7개 + e2e 2개 추가 → 349 tests (unit 223 + e2e 126)

### 다음 세션에서 할 것
- STAGE_ARTIFACTS 맵 중복 정의 해소 (template.ts, stage-transition.ts, artifact-check.ts)
- 실제 cruise/evolve 시나리오에서 artifact-incomplete 처리 흐름 검증
- 실제 v0.15 프로젝트에서 migration 테스트 (legacy cleanup 포함)
- alpha publish 실행
- README v0.16 재작성
- Embryo → Normal 전환 논의

### 미결정 사항
- Embryo → Normal 전환 시점
- spec2.md 최신화 필요

### 현재 backlog 상태
- pending backlog 없음

### 현재 테스트 현황
349 tests (unit 223 + e2e 126)
