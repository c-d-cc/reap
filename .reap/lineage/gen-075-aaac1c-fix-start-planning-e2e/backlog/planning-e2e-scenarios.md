---
type: genome-change
status: consumed
consumedBy: gen-075-aaac1c
priority: medium
---

# Planning 단계에서 E2E 테스트 시나리오 계획 필수

현재 planning에서 "E2E 테스트 작성 및 실행"으로만 기술되고 있음.
lifecycle 관련 변경 시 planning 단계에서 구체적인 E2E 테스트 시나리오를 명시해야 함.

## 변경 대상
- `src/templates/commands/reap.planning.md` — E2E 시나리오 섹션 추가
- `conventions.md` Testing Conventions — planning에서 시나리오 명시 규칙 추가

## 예시
```
## E2E Test Scenarios
1. 정상 abort + rollback → 소스 원복, artifact 삭제, current.yml 비움
2. abort + stash → stash 생성, 복구 가능
3. abort + hold → 소스 유지
4. abort backlog 메타 → aborted, abortedFrom, abortReason 등 확인
5. no generation → 에러
6. lineage 미기록 → abort 후 lineage 변화 없음
```
