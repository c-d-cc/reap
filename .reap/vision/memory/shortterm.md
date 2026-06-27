# Shortterm Memory

## 세션 요약 (2026-06-27)

### gen-067: cruise mode + evaluator escalation 통합 — validation/fitness 연결, cruise 자동 중단, state 채널

gen-066 의 validation-stage evaluator 통합을 fitness/cruise 단으로 확장. design 문서 `evaluator-agent.md` 의 잔여 항목 두 가지 완성:

- **Part 1 (state 채널)**: `EvaluatorConcern` interface 신설 + `GenerationState.evaluatorConcerns?: EvaluatorConcern[]` optional 필드. `current.yml` round-trip 검증.
- **Part 2 (`reap run validation --phase report-evaluator`)**: nonce-graph 외부 phase. `--severity high|low|none` + `--summary "<text>"` (none 시 short-circuit, --summary 검증 skip). state append-only. builder 가 evaluator 답신을 받은 직후 호출하도록 validation prompt 에 8 라인 instruction 추가. 4 case (high/low/none + 잘못된 severity error) e2e 검증.
- **Part 3 (fitness phase rewrite)**: `completion.ts` fitness 가 config 읽어 `buildEvaluatorPrompt({ stage: "fitness" })` 조건부 활성화. `priorConcernsSection` (state.evaluatorConcerns 가 있으면 prompt 에 marker section + `context.evaluatorConcerns` 동봉). cruise/supervised 양 분기 동일.
- **Part 4 (cruise 자동 중단)**: fitness 진입 시 `state.evaluatorConcerns` 에 `severity: high` 가 하나라도 있으면 `clearCruise()` + 별도 fallback prompt + `context.previousCruiseCount` emit. 사용자에게 명시적으로 cruise 가 중단되었음을 알림. self-loop nonce 는 보존 (재시도 가능).
- **Part 5 (dog-fooding 검증)**: 본 generation 의 `npx reap run validation` 호출이 새 prompt 절을 자기 prompt 에 포함 — self-referential 검증 성공 (gen-066 패턴 재사용).

**결과**: typecheck/build pass. unit 427/0 (+5 신규). e2e 218/1 (+11 신규: report-evaluator CLI matrix 7 + cruise abort matrix 4. pre-existing init-repair 1, 회귀 0).

### 다음 세션 / 다음 generation

**1. Release v0.16.6** — 가장 자연스러운 다음 action. gen-061~067 묶음 (26+ commits ahead).
- Release notes 권장 주제:
  - Lifecycle termination paths (gen-061, Issue #16)
  - Static/dynamic knowledge 분리 (gen-062, Issue #17)
  - OpenCode adapter + slash commands (gen-063~064, Issue #19)
  - Backlog UX 견고화 (gen-065, Issue #18)
  - **Evaluator agent end-to-end** (gen-066~067, Issue #20) — opt-in 으로 validation + fitness + cruise abort 가 모두 동작
- Issue close: #16, #17, #18, #19, #20

**2. Vision/Goal management 위임 (evaluator 트랙 마지막 큰 항목)** — `vision/design/evaluator-agent.md` 의 잔여 항목. adapt phase 에서 evaluator 가 vision goals.md ↔ 최근 lineage 의 gap 분석 → 다음 goal 후보 추천. validation + fitness wiring 이 완료된 지금이 자연스러운 다음 step.

**3. 사용자 직접 `/reap.evolve` 흐름에서 evaluator 실호출 검증** — fitness 단의 evaluator subagent 가 실제로 호출되는지, prior concerns section 이 도움 / 방해 둘 중 무엇인지, cruise 자동 중단이 깔끔하게 작동하는지 관찰.

### deferred 후보 (사용자 판단 후 backlog 화)

기존 13 (gen-066 shortterm) + 신규 3:

기존 (간단 list):
1. `opencode-init-agent-flag`
2. `unify-sync-async-knowledge-builder`
3. `init-repair-skipped-message-fix` (1 pre-existing e2e fail)
4. `tests/helpers/setup.ts fileExists` 디렉토리 버그 fix
5. `disable-model-invocation` variant 분리
6. prefix 충돌 marker 기반 cleanup 강화
7. OpenCode plugin `tool.execute.after` dump
8. Codex adapter (큰 트랙)
9. Evaluator agent 코드 통합 — **본 generation 으로 fitness + cruise 완성**. 잔여 (vision/goal 위임) 가 마지막 큰 항목.
10. `reap consume backlog <filename> --gen <id>` helper
11. `reap make backlog` 외 경로로 만든 backlog warn
12. TS `noUnusedLocals` / `noUnusedParameters` 옵션 활성화 검토
13. validation prompt 의 fallback 절 "Agent tool 부재" 케이스 명시 강화

**신규 (gen-067)**:
14. **`evaluatorConcerns` 중복 detection 경고** — `report-evaluator` 가 같은 (severity, summary) 를 두 번 append 시 warning 출력. 의도된 append-only 유지, but UX 개선.
15. **`reap run validation --phase report-evaluator` 의 "resolve / dismiss" CLI** — 현재 append-only. cross-generation 으로 concern 을 이월할 일이 생기면 필요. 현 generation 별 reset 모델에서는 불필요. 향후 관찰.
16. **테스트 레벨 선택 휴리스틱 명문화** — gen-067 의 T009 (unit → e2e 재분류) 가 보여준 "함수가 paths injection 으로 디스크 다중 파일을 읽으면 e2e 우선" 패턴을 `evolution.md` Testing Principles 의 테스트 레벨 선택 표에 추가 검토.

### 본 generation 의 self-evolving 작동 사례

- **design 문서가 anchor**: gen-051 (template) → gen-052 (design 확정 후 abort) → gen-066 (validation 통합) → gen-067 (fitness + cruise) 의 4-generation 진화. design 이 abort 후에도 보존되어 매번 planning 비용을 낮춤.
- **gen-066 의 prepared 분기 활용**: `buildEvaluatorPrompt({ stage: "fitness" })` 분기는 gen-066 에서 미리 만들어져 있어 본 generation 이 그대로 활성화. **선행 generation 의 "미리 만든 hook" 가 후행 generation 의 비용을 줄임**.

### 코드 변경 위치 (다음 세션 참조용)

- `src/types/index.ts` — `EvaluatorConcern` interface + `GenerationState.evaluatorConcerns?: EvaluatorConcern[]`
- `src/cli/index.ts` + `src/cli/commands/run/index.ts` — `--severity` / `--summary` options, JSON-encoded `extra` forward
- `src/cli/commands/run/validation.ts` — `report-evaluator` phase (state append-only) + work-phase prompt 의 evaluator 호출 instruction 8 라인
- `src/cli/commands/run/completion.ts` — fitness phase rewrite: evaluator 조건부 활성화 + `priorConcernsSection` + `cruiseAborted` 분기 (`clearCruise()` + fallback prompt + `previousCruiseCount`)
- `tests/unit/state-evaluator-concerns.test.ts` — 5 case (yaml round-trip)
- `tests/e2e/report-evaluator.test.ts` — 7 case (severity matrix + validation)
- `tests/e2e/cruise-evaluator-abort.test.ts` — 4 case (cruise abort matrix)
- `.reap/vision/design/evaluator-agent.md` — 구현 상태 업데이트 (fitness + cruise 표시)
- `README.md` — Evaluator Agent 절 cruise/escalation 노트

### Backlog 상태 (gen-067 commit 직후 예상)

- `cruise-mode-evaluator-escalation-통합-validationfitness.md` (gen-066 작성) — gen-067 consumed → `lineage/gen-067-*/backlog/` 로 archive.
- `.reap/life/backlog/` 비어있을 예정 (pending 0개).
