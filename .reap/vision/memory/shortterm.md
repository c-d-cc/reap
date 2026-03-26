# Shortterm Memory

## 세션 요약 (2026-03-26)

### gen-037: artifact 미작성 감지 + 보충 지시 기능 (Issue #13)
- `src/core/artifact-check.ts` 신규 — core placeholder 기반 미작성 감지
- validation work phase에서 `artifact-incomplete` status 반환
- reap-guide.md에 보충 예외 규칙 추가
- 340 tests (unit 216 + e2e 124)

### 다음 세션에서 할 것
- STAGE_ARTIFACTS 맵 중복 정의 해소 (template.ts, stage-transition.ts, artifact-check.ts)
- 실제 cruise/evolve 시나리오에서 artifact-incomplete 처리 흐름 검증
- 실제 v0.15 프로젝트에서 migration 테스트
- alpha publish 실행
- README v0.16 재작성
- Embryo → Normal 전환 논의

### 미결정 사항
- Embryo → Normal 전환 시점
- spec2.md 최신화 필요

### 현재 backlog 상태
- pending backlog 없음

### 현재 테스트 현황
340 tests (unit 216 + e2e 124)
