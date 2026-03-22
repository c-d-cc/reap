# Planning

## Summary
`reap destroy`와 `reap clean` CLI 서브커맨드 구현. destroy는 REAP 관련 파일 전체 삭제, clean은 인터랙티브 옵션으로 프로젝트 초기화.

## Technical Context
- **Tech Stack**: TypeScript, Commander.js, Node.js fs/promises, readline
- **Constraints**: 외부 의존성 추가 없음, src/core/fs.ts 유틸 사용, Node.js >=18 호환

## Tasks

### Phase 1: destroy 커맨드
- [ ] T001 `src/cli/commands/destroy.ts` -- destroyProject 함수 구현 (삭제 대상 탐지 + 삭제 실행 + 결과 반환)
- [ ] T002 `src/cli/index.ts` -- destroy 서브커맨드 등록 (readline 확인 프롬프트 포함)

### Phase 2: clean 커맨드
- [ ] T003 `src/cli/commands/clean.ts` -- cleanProject 함수 구현 (옵션별 초기화 로직)
- [ ] T004 `src/cli/index.ts` -- clean 서브커맨드 등록 (인터랙티브 질문 포함)

### Phase 3: 검증
- [ ] T005 타입 체크 + 수동 검증

## Dependencies
- T002 → T001 (destroy 로직 필요)
- T004 → T003 (clean 로직 필요)
- T005 → T001~T004 모두 완료 후

## FR 매핑
| FR | Task |
|----|------|
| FR-1 (확인 프롬프트) | T002 |
| FR-2 (삭제 대상) | T001 |
| FR-3 (결과 출력) | T002 |
| FR-4 (인터랙티브 질문) | T004 |
| FR-5 (선택별 처리) | T003 |
| FR-6 (진행 중 세대 경고) | T003, T004 |
