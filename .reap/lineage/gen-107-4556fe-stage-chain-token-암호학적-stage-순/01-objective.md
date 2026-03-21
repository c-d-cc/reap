# Objective

## Goal
Stage Chain Token — 암호학적 stage 순서 강제. 각 stage command 완료 시 cryptographic token(nonce)을 생성하고, `reap run next`에서 이를 검증하여 stage 건너뛰기 및 순서 위반을 방지.

## Completion Criteria
1. `generateStageToken()` 함수가 nonce를 반환하고 SHA256 hash를 `current.yml`에 저장
2. `verifyStageToken()` 함수가 유효한 token을 수락하고 무효한 token을 거부
3. `reap run next --token <nonce>` 검증 통과 시 stage 전환 성공
4. `reap run next` (token 없이) 호출 시 명확한 에러 메시지로 거부
5. `reap run next --token <wrong>` 호출 시 mismatch 에러 메시지로 거부
6. 모든 stage command (objective, planning, implementation, validation, completion) 완료 시 context에 stageToken 포함
7. `reap run start` 생성 시 초기 token 생성
8. evolve subagentPrompt에 token relay 규칙 포함
9. Unit 테스트: token 생성/검증 정상/거부 케이스
10. TypeScript 빌드 에러 없음

## Requirements

### Functional Requirements
- FR1: `generateStageToken(genId, stage)` — crypto.randomBytes(16) nonce 생성, SHA256(nonce + genId + stage) hash 반환
- FR2: `verifyStageToken(token, genId, stage, expectedHash)` — hash 일치 여부 검증
- FR3: `reap run next`에 `--token` 파라미터 추가, env var `REAP_STAGE_TOKEN` 대체 지원
- FR4: 각 stage command `--phase complete` 시 stageToken을 context에 포함하여 emit
- FR5: `reap run start --phase create` 시 초기 token 생성 (objective stage용)
- FR6: `current.yml`에 `expectedTokenHash` 필드 추가
- FR7: AI-facing 에러 메시지 3종: token missing, token mismatch, success with relay instruction
- FR8: evolve subagentPrompt에 token relay 규칙 추가

### Non-Functional Requirements
- NFR1: crypto 연산은 무시할 수 있는 수준의 성능 영향
- NFR2: 기존 테스트 깨지지 않음

## Design

### Selected Design
Backlog 설계안 그대로 채택:
- `src/core/generation.ts`에 `generateStageToken()`, `verifyStageToken()` 추가
- 각 stage command의 complete phase에서 token 생성 후 context.stageToken으로 emit
- `next.ts`에서 `--token` 파라미터 검증, 실패 시 명확한 AI-facing 에러
- `GenerationState` 타입에 `expectedTokenHash` 필드 추가
- `start.ts`에서 generation 생성 후 초기 token 생성
- `evolve.ts`의 `buildSubagentPrompt`에 token relay 규칙 추가

## Scope
- **Related Genome Areas**: core/generation, cli/commands/run/*, types
- **Expected Change Scope**: ~10 파일 수정
- **Exclusions**: merge lifecycle token 체인 (별도 generation에서 처리)

## Genome Reference
constraints.md — Validation Commands (bun test, bunx tsc --noEmit)

## Backlog (Genome Modifications Discovered)
None

## Background
AI가 `/reap.next`를 안 부르거나 순서를 틀리면 lifecycle이 깨짐. 현재 prompt 안내만으로는 강제력이 없어 cryptographic token으로 순서를 강제하는 메커니즘 도입.
