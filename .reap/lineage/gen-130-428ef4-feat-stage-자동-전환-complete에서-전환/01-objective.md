# Objective

## Goal
feat: stage 자동 전환 — complete에서 전환, 다음 stage에서 token 검증

## Completion Criteria
1. Normal lifecycle의 `--phase complete`에서 stage 자동 전환 + artifact 생성이 수행된다
2. Merge lifecycle의 `--phase complete`에서도 동일하게 자동 전환 + artifact 생성이 수행된다
3. 다음 stage command 시작 시 `lastNonce` + `expectedTokenHash`로 token 검증이 수행된다
4. 검증 실패 시 에러가 발생한다
5. 첫 stage(objective/detect)에서는 token 검증을 건너뛴다
6. `/reap.next`는 유지되며, complete된 상태(lastNonce 존재)에서만 전환 수행
7. `reap-guide.md`, `README*.md`, `evolve.ts`의 문서가 업데이트된다
8. E2E 테스트가 OpenShell sandbox에서 통과한다

## Requirements

### Functional Requirements
1. **FR-01**: objective/planning/implementation/validation의 `--phase complete`에서 nonce 생성 후 자동으로 다음 stage로 전환하고, 다음 stage의 artifact template를 생성한다
2. **FR-02**: merge-detect/merge-mate/merge-merge/merge-sync/merge-validation의 `--phase complete`에서도 동일하게 자동 전환 + artifact 생성을 수행한다
3. **FR-03**: planning/implementation/validation/completion 시작 시 `state.lastNonce`와 `state.expectedTokenHash`로 token을 검증한다. 검증 통과 시 `lastNonce`를 삭제하고 진행한다
4. **FR-04**: merge lifecycle의 mate/merge/sync/validation/completion 시작 시도 동일한 token 검증을 수행한다
5. **FR-05**: 첫 stage(objective, detect)에서는 `lastNonce`가 없으므로 검증 없이 통과한다
6. **FR-06**: `/reap.next`는 제거하지 않고 유지한다. `lastNonce`가 존재하면(complete 완료 상태) 전환 수행, 없으면 에러
7. **FR-07**: `emitOutput` 호출 전에 stage 전환 로직을 수행한다 (emitOutput은 process.exit(0)을 호출하므로)

### Non-Functional Requirements
1. **NFR-01**: 기존 next.ts 동작과의 호환성 유지 (next는 여전히 fallback으로 사용 가능)
2. **NFR-02**: 문서(reap-guide.md, README*.md, evolve.ts subagentPrompt)가 새 흐름을 반영

## Design

### Approaches Considered

| Aspect | Approach A: complete에서 전환 | Approach B: 별도 auto-next 커맨드 |
|--------|-----------|-----------|
| Summary | --phase complete 내부에서 stage 전환 + artifact 생성 수행 | auto-next 커맨드를 새로 만들어서 complete 후 자동 호출 |
| Pros | 단계 수 감소 (3→2), 기존 코드 재사용 가능 | 관심사 분리 |
| Cons | complete 핸들러가 커짐 | 새 커맨드 추가, 복잡도 증가 |
| Recommendation | **채택** | 불채택 |

### Selected Design
**Approach A**: `--phase complete` 내부에서 기존 `next.ts`의 전환 로직(stage 업데이트, timeline 추가, artifact template 복사, hook 실행)을 수행한다. `emitOutput` 호출 전에 모든 전환 작업을 완료한다.

핵심 흐름:
```
[현재] objective --phase complete → nonce 생성 → emitOutput → /reap.next (검증+전환) → /reap.planning
[변경] objective --phase complete → nonce 생성 → stage 전환 → artifact 생성 → hook 실행 → emitOutput → /reap.planning (token 검증)
```

### Design Approval History
- 2026-03-22: 사용자 지시에 의한 설계 확정

## Scope
- **Related Genome Areas**: lifecycle 실행 흐름, stage chain token
- **Expected Change Scope**:
  - `src/cli/commands/run/objective.ts`, `planning.ts`, `implementation.ts`, `validation.ts` — complete phase에 전환 로직 추가
  - `src/cli/commands/run/merge-detect.ts`, `merge-mate.ts`, `merge-merge.ts`, `merge-sync.ts`, `merge-validation.ts` — merge lifecycle 동일 적용
  - `src/cli/commands/run/next.ts` — lastNonce 기반 전환 조건 추가
  - `src/cli/commands/run/evolve.ts` — subagentPrompt 업데이트
  - `src/templates/hooks/reap-guide.md` — lifecycle 실행 흐름 문서 업데이트
  - `README.md`, `README.ko.md`, `README.ja.md`, `README.zh-CN.md` — lifecycle 설명 업데이트
  - `tests/e2e/stage-token-e2e.sh` — E2E 테스트
- **Exclusions**: completion stage 자체는 변경하지 않음 (마지막 stage이므로 자동 전환 불필요)

## Genome Reference
- `conventions.md`: 코드 스타일, 패턴
- `constraints.md`: TypeScript, esbuild 빌드, bun test

## Backlog (Genome Modifications Discovered)
None

## Background
현재 REAP lifecycle에서 stage를 전환하려면 3단계가 필요하다:
1. 현재 stage command 실행 (`/reap.objective`)
2. `--phase complete`로 완료 (nonce 생성)
3. `/reap.next <nonce>`으로 전환 (검증 + 전환)

이를 2단계로 줄여서 사용성을 개선한다:
1. 현재 stage command 실행 (`/reap.objective`)
2. `--phase complete`로 완료 (nonce 생성 + 자동 전환)
3. 다음 stage command에서 token 검증 (`/reap.planning`에서 nonce 검증)
