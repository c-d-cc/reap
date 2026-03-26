# Planning — gen-025-6513c5

## Goal

adapt phase에서 subagent가 자율적으로 backlog를 생성하지 못하도록 prompt 규칙을 강화한다. 다음 세대 후보는 artifact 텍스트에 제안으로만 포함하고, `reap make backlog` 명령 실행을 금지한다.

## Completion Criteria

1. completion.ts의 adapt phase prompt에서 backlog 생성 지시가 제거되고, "artifact 텍스트에 제안으로만 포함" 지시로 대체됨
2. completion.ts의 adapt phase prompt에 `reap make backlog` 실행 금지가 명시됨
3. prompt.ts의 buildBasePrompt()에 adapt phase backlog 생성 금지 규칙이 포함됨
4. reap-guide.md의 Critical Rules에 backlog 생성 제한 규칙 추가됨
5. 기존 239 tests 전체 통과

## Background

gen-023 adapt phase에서 subagent가 검증 없이 불필요한 backlog를 자율 생성. evolution.md의 Echo Chamber 방지 원칙을 위반. 근본 원인은 adapt phase prompt가 "Record as type: task in backlog"로 backlog 생성을 직접 지시하고 있었기 때문.

## Approach

prompt 텍스트 3곳을 수정하여 다층 방어:
1. **completion.ts** — adapt phase prompt의 step 3 변경 + 금지 규칙 추가
2. **prompt.ts** — base prompt의 Echo Chamber Prevention 섹션 강화
3. **reap-guide.md** — Critical Rules에 규칙 추가 (guide는 모든 subagent에 주입됨)

## Tasks

- [ ] T001 `src/cli/commands/run/completion.ts` — adapt phase step 3 "Record as type: task in backlog" → "artifact 텍스트의 Next Generation Hints에 제안으로만 기록"
- [ ] T002 `src/cli/commands/run/completion.ts` — adapt phase step 4 "Create environment-change backlog if needed" 제거 (reflect phase에서 이미 처리)
- [ ] T003 `src/cli/commands/run/completion.ts` — adapt phase prompt에 금지 규칙 추가: "CRITICAL: adapt phase에서 `reap make backlog` 명령을 실행하지 마라"
- [ ] T004 `src/core/prompt.ts` — Echo Chamber Prevention 섹션에 adapt phase 규칙 추가: "adapt phase에서 backlog 생성 금지, 제안은 artifact 텍스트에만"
- [ ] T005 `src/templates/reap-guide.md` — Critical Rules에 "adapt phase에서 backlog를 직접 생성하지 마라" 규칙 추가
- [ ] T006 빌드 + 전체 테스트 실행 (npm run build && npm run test)

## Dependencies

T001~T005 순서 무관 (모두 독립적 텍스트 수정). T006은 T001~T005 완료 후 실행.
