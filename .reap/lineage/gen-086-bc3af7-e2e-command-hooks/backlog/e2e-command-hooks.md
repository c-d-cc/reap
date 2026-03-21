---
type: task
status: consumed
consumedBy: gen-086-bc3af7
---
# E2E 테스트: slash command hook 실행 + archiving 책임 분리 검증

gen-085에서 slash command 전면 정리를 했으나 E2E 테스트가 미작성.

## 시나리오 (8개)

1. reap.next는 stage 전환만 수행 (hook/archiving 없음)
2. 각 stage command가 말단에서 자기 hook 실행 (onLifeObjected 등)
3. reap.completion이 archiving + 커밋 + onLifeCompleted 실행
4. hook 실행 타이밍 — onLifeCompleted는 커밋 전 (hook 결과물이 커밋에 포함)
5. submodule 커밋 체크
6. merge command hook 실행 (onMergeDetected 등)
7. reap.evolve에서 hook이 각 stage마다 실행됨
8. reap.back에서 onLifeRegretted 실행

## 추가 요구사항
- 기존 E2E 테스트(tests/e2e/) 전수 검토 — 이번 변경으로 깨지는 시나리오 수정
- 커버리지 갭 식별 및 보완
