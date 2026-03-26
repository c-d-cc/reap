---
type: task
status: consumed
consumedBy: gen-024-1415bf
consumedAt: 2026-03-26T07:40:43.923Z
priority: high
createdAt: 2026-03-26T07:31:52.252Z
---

# back 후 연속 regression 불가 — verifyBackNonce에서 back nonce 재발급 누락

## Problem

`verifyBackNonce()` (stage-transition.ts:128-141)에서 back 실행 시:
- back nonce를 clear하고 target stage로 이동
- 새 forward nonce만 발급, **back nonce는 재생성하지 않음**
- 따라서 연속 back이 불가능 (예: completion → validation → implementation 불가)

반면 `setNonce()` (line 79-107)는 forward + back을 동시에 발급.

추가 문제: back 후 `--phase complete` 실행 시 "Nonce verification failed" 에러만 출력되어 원인 파악이 어려움. 실제로는 entry phase에서 work phase를 거치지 않았기 때문인데 에러 메시지가 이를 알려주지 않음.

## Solution

1. `verifyBackNonce()`에서 target stage로 이동 후 `setNonce()`를 호출하여 forward + back nonce 동시 발급
2. nonce verification 실패 시 에러 메시지에 현재 phase 상태 포함 ("현재 entry phase입니다. `reap run <stage>`를 먼저 실행하세요" 등)

## Files to Change

- `src/core/stage-transition.ts` — verifyBackNonce()에서 setNonce() 호출로 back nonce 재발급
- nonce verification 에러 메시지 개선
