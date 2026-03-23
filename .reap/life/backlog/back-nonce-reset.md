---
type: task
priority: high
status: pending
---

# reap.back 실행 후 nonce 미초기화 버그

## 문제
`back.ts`의 apply phase에서 `state.stage`만 변경하고 `lastNonce`, `expectedHash`, `phase`를 초기화하지 않음.
회귀 후 target stage 재진입 시 `verifyNonce()`가 이전 토큰으로 검증 시도 → 실패.

## 수정 방향
- `back.ts` apply phase에서 target stage의 entry nonce를 새로 생성 (`setNonce(state, targetStage, "entry")`)
- 또는 nonce 필드를 초기화하여 첫 진입처럼 처리

## 참고
- next/back은 stage 단위 유지 (phase 단위 아님)
- nonce 생성 및 signature-based locking은 필수
- 관련 파일: `src/cli/commands/run/back.ts`, `src/core/stage-transition.ts`
