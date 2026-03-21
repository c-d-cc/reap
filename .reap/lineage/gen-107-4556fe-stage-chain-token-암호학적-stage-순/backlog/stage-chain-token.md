---
type: task
status: consumed
consumedBy: gen-107-4556fe
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

## AI 인지 요구사항
- script의 에러 메시지에 **token이 왜 필요한지, 어떻게 얻는지**를 명확히 설명
  - 예: "Stage transition requires a valid token. This token was provided by the previous stage command. You cannot skip stages or forge tokens."
  - 예: "Token mismatch. The token must come from the output of `reap run <current-stage>`. Re-run the stage command to get a valid token."
- `emitOutput`의 prompt에 token을 명시적으로 강조하여 AI가 반드시 전달하도록 유도
  - 예: "IMPORTANT: Pass the following token to `/reap.next --token <TOKEN>`. Without this token, stage transition will be rejected."
- AI가 token 없이 next를 호출하면, 에러 메시지에서 "이전 stage command를 먼저 실행하라"고 안내

## 구현 범위
- `src/core/generation.ts` — token 생성/검증 함수 (generateStageToken, verifyStageToken)
- `src/cli/commands/run/` — 각 stage command 완료 시 token 포함 emit (context.stageToken)
- `reap run next` — --token 파라미터 필수, 검증 실패 시 명확한 에러
- `current.yml` — expectedTokenHash 필드 추가
- evolve의 subagentPrompt — token relay 규칙 명시
- 테스트: token 생성/검증 unit test + chain 강제 e2e test (token 없이 next → 거부 확인)
