---
type: task
status: consumed
priority: medium
consumedBy: gen-154-32dead
---

# Nonce 토큰 구조 통일 — stage/phase 동일 형태로 추상화

## 현황
- Stage token: `hash(nonce + genId + stage)` — phase 없음, 생성 기준
- Phase token: `hash(nonce + genId + stage:phase)` — phase 있음, 생성 기준
- `verifyStageEntry()`에서 `state.phase` 존재 여부로 분기 — 불필요한 복잡성
- Stage 검증 시 `prevStage` 역산 필요 — 불필요한 결합
- 각 command 파일마다 `verifyStageEntry`/`setPhaseNonce`/`verifyPhaseEntry`/`generateToken`을 개별 조합 — boilerplate

## 목표
모든 토큰을 `hash(nonce + genId + stage:phase)` 형태로 통일, **수신 기준**.

### 토큰 구조
- 토큰은 "다음에 갈 곳"을 명시하는 입장권
- Phase 종류: `entry` (stage 진입), `complete` (complete phase 진입), `work`/`review`/`verify` 등
- 예시 흐름:
  - `objective:work` 끝 → `generateToken(genId, "objective", "complete")` — objective:complete 진입권
  - `objective:complete` 끝 → `generateToken(genId, "planning", "entry")` — planning:entry 진입권
  - `planning:entry` 검증 → `verifyToken(nonce, genId, "planning", hash, "entry")`
- 생성/검증이 동일한 값 → `prevStage` 역산 로직 제거
- `generateToken()`에서 `phase`를 필수 인자로 변경

### 진입/종료 추상화
모든 stage의 모든 phase가 동일한 한 쌍의 함수로 처리:
- 진입: `verifyNonce(state, stage, phase)` — 토큰 검증 + 소비 (첫 stage:entry만 skip)
- 종료: `setNonce(state, nextStage, nextPhase)` — 다음 진입권 생성 (마지막 completion만 skip)

기존 4개 함수 (`verifyStageEntry`, `setPhaseNonce`, `verifyPhaseEntry`, `generateToken` 직접 호출) → 2개 (`verifyNonce`, `setNonce`)로 통합. 각 command 파일의 boilerplate 대폭 감소.

## 영향 범위
- `src/core/generation.ts` — `generateToken`, `verifyToken`
- `src/core/stage-transition.ts` — `verifyStageEntry`, `setPhaseNonce`, `verifyPhaseEntry` → `verifyNonce`, `setNonce`로 통합
- `src/cli/commands/run/` — 모든 stage command (start, objective, planning, implementation, validation, completion + merge 6개)
