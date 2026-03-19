---
type: task
---
# Old 7-stage lifecycle 테스트 정리

## 설명
테스트 17개 실패 + 2 errors가 old 7단계 lifecycle (conception/formation/growth/adaptation/birth/legacy)을 참조하고 있음. 현재 5단계 lifecycle (objective/planning/implementation/validation/completion)에 맞게 수정 필요.

## 대상 파일
- `tests/core/lifecycle.test.ts` — conception/formation/adaptation/birth/legacy 참조
- `tests/core/generation.test.ts` — conception/formation/legacy stage 기대
- `tests/core/types.test.ts` — old stage 타입 + MutationRecord 참조
- `tests/core/mutation.test.ts` — 삭제된 `src/core/mutation` 모듈 import
- `tests/commands/evolve.test.ts` — conception/formation stage 기대
- `tests/commands/status.test.ts` — conception stage 기대
- `tests/integration/full-lifecycle.test.ts` — 삭제된 mutation 모듈 import

## 작업 내용
- old stage name → new stage name 매핑 적용
- MutationRecord → 삭제 또는 backlog 타입으로 대체
- mutation.test.ts → 삭제 또는 backlog 테스트로 재작성
- full-lifecycle.test.ts → mutation import 제거 후 5단계 flow로 수정
