---
type: task
status: consumed
consumedBy: gen-108-000e84
---

# Stage Chain Token — Sandbox E2E 테스트

## 현상
- stage chain token의 기계적 검증은 완료 (unit test + E2E 575 pass)
- 하지만 실제 AI agent가 nonce를 relay하는 E2E는 미검증
- `/reap.next $ARGUMENTS` 치환, message에서 nonce 인식, evolve 전체 흐름 확인 필요

## 테스트 범위

### 1. Sandbox 환경에서 실제 evolve 테스트
- `examples/` 또는 temp dir에 sandbox 프로젝트 셋업
- `reap init` → `reap run evolve` → 전체 lifecycle 실행
- AI agent가 message에서 nonce를 읽고 `/reap.next <nonce>`를 호출하는지 확인
- token 없이 next 호출 시 거부되는지 확인

### 2. 에러 시나리오
- nonce 없이 `/reap.next` 호출 → 에러 메시지 확인
- 잘못된 nonce로 `/reap.next wrong123` 호출 → 거부 확인
- 이전 stage의 nonce 재사용 → 거부 확인

### 3. evolve subagentPrompt 확인
- subagentPrompt에 token relay 규칙이 포함되는지 확인
- subagent가 nonce를 올바르게 전달하는지

## 관련 코드
- `src/cli/commands/run/next.ts` — nonce argv 파싱 + verify
- `src/cli/commands/run/objective.ts` ~ `validation.ts` — nonce emit
- `src/templates/commands/reap.next.md` — `$ARGUMENTS` 치환
- `src/cli/commands/run/evolve.ts` — subagentPrompt token 규칙
