---
type: task
status: pending
---

# Stage Chain Token — 암호학적 stage 순서 강제

## 현상
- AI가 `/reap.next`를 안 부르거나 순서를 틀리면 lifecycle이 깨짐
- 현재는 가이드(prompt)로만 순서를 안내하며, 강제 메커니즘 없음
- daemon 기반 orchestration은 복잡도 대비 효과가 낮아 보류

## 설계
각 stage command가 완료 시 token(nonce)을 생성하고, 다음 단계에서 이를 검증:

```
reap run objective 완료
  → nonce = crypto.randomBytes(16).hex
  → hash = SHA256(nonce + genId + stage)
  → current.yml에 expectedToken: hash 저장
  → prompt로 AI에게 nonce 전달

AI가 작업 후:
  reap run next --token <nonce>
  → SHA256(nonce + genId + stage) === current.yml의 expectedToken?
  → 일치 → stage 전환 + 새 nonce 생성
  → 불일치 → 거부 + 에러 메시지
```

## 보장하는 것
- stage command의 output을 실제로 받았다는 증명 (token relay)
- stage 건너뛰기 방지 (이전 stage의 token이 없으면 next 불가)
- replay 방지 (genId + stage가 hash에 포함)

## 보장하지 않는 것
- AI가 실제로 작업을 수행했는지 (→ artifact gate가 담당)
- AI가 token을 기억하고 전달하는지 (→ prompt 강화 필요)

## 구현 범위
- `src/core/generation.ts` — token 생성/검증 함수
- `src/cli/commands/run/` — 각 stage command 완료 시 token 포함 emit
- `reap run next` — --token 파라미터 검증
- `current.yml` — expectedToken 필드 추가
- 테스트: token 생성/검증 unit test + chain 강제 e2e test
