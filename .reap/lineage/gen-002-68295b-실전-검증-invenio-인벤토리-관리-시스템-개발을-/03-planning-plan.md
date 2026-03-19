# Implementation Plan — Gen-002

## Summary
`examples/invenio/`에서 REAP 워크플로우 8단계를 1회 완주하며 실전 검증한다.
각 단계 진행 후 발견된 워크플로우 문제를 mutation으로 기록하고, reap-wf에 반영한다.

## Technical Context
- **Tech Stack**: Bun + TypeScript (reap-wf), invenio는 자체 genome에서 정의
- **Constraints**: reap-wf 기존 62개 테스트 유지, Validation Commands(`bun test`, `tsc --noEmit`) 통과
- **작업 위치**: reap-wf 코드 변경은 `src/`, 템플릿 변경은 `src/templates/`, invenio는 `examples/invenio/`

## Tasks

### Phase 1: invenio 프로젝트 초기화 + REAP Conception~Formation
- [ ] T001 `examples/invenio/` 생성 및 `reap init invenio` 실행
- [ ] T002 invenio Conception 실행 — genome 초기 구성 + Gen-001 goal 설정
- [ ] T003 invenio Formation 실행 — 기능 명세 작성
- [ ] T004 [mutation 체크포인트] Conception~Formation에서 발견된 reap-wf 문제를 mutation으로 기록

### Phase 2: invenio Planning~Growth
- [ ] T005 invenio Planning 실행 — 구현 계획 수립
- [ ] T006 invenio Growth 실행 — 백엔드 구현 (Hono + SQLite + JWT + 물품 CRUD API)
- [ ] T007 invenio Growth 실행 — 프론트엔드 구현 (React + Vite, 로그인/물품 CRUD UI)
- [ ] T008 [mutation 체크포인트] Planning~Growth에서 발견된 reap-wf 문제를 mutation으로 기록

### Phase 3: invenio Validation~Legacy
- [ ] T009 invenio Validation 실행 — 테스트/검증
- [ ] T010 invenio Adaptation 실행 — 회고 + GC
- [ ] T011 invenio Birth 실행 — genome 진화
- [ ] T012 invenio Legacy — 아카이빙
- [ ] T013 [mutation 체크포인트] Validation~Legacy에서 발견된 reap-wf 문제를 mutation으로 기록

### Phase 4: reap-wf 개선 반영
- [ ] T014 수집된 mutation 기반으로 reap-wf 템플릿/코드 개선
- [ ] T015 부트스트랩 부담 경감 설계 (backlog/01 해결)
- [ ] T016 reap-wf 테스트 실행 — 기존 62개 테스트 통과 확인

## Dependencies
- T001 → T002 → T003 → T004 (순차)
- T005 → T006, T007 (T006/T007은 병렬 가능)
- T006, T007 → T008 → T009 → T010 → T011 → T012 → T013 (순차)
- T013 → T014 → T015 → T016 (순차)
- mutation 체크포인트(T004, T008, T013)는 각 Phase 완료 시 수행
