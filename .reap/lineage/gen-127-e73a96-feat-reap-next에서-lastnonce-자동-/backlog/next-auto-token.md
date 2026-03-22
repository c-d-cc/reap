---
type: task
status: consumed
priority: medium
consumedBy: gen-127-e73a96
---

# reap.next에서 token 자동 읽기 — lastNonce 필드

## 문제

사용자가 `/reap.next`를 직접 타이핑할 때 token(nonce)을 수동으로 넣어야 함.
AI 에이전트가 처리할 때는 문제 없지만, 사용자가 직접 호출 시 불편.

## 개선 방향

1. stage command (objective, planning 등)의 `--phase complete`에서 nonce 생성 시 `current.yml`에 `lastNonce` 필드로 저장
2. `next.ts`에서 token이 argument로 전달되지 않으면 `current.yml`의 `lastNonce`에서 자동으로 읽기
3. 명시적 token이 전달되면 기존처럼 그것을 사용
4. `lastNonce` 사용 후 소비(삭제)하여 재사용 방지
