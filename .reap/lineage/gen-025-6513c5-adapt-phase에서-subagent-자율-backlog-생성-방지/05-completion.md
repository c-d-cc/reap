# Completion — gen-025-6513c5

## Summary

adapt phase에서 subagent의 자율 backlog 생성을 방지하기 위해 prompt 규칙을 3곳에서 강화.

### Changes
- `src/cli/commands/run/completion.ts` — adapt phase prompt: step 3 "Record as type: task in backlog" → "artifact 텍스트에 제안으로만 기록", step 4 제거, "CRITICAL — Backlog Creation Prohibited in Adapt Phase" 섹션 추가
- `src/core/prompt.ts` — Echo Chamber Prevention에 adapt phase 전용 규칙 2줄 추가
- `src/templates/reap-guide.md` — Critical Rules에 규칙 6번 추가

### Test Results
- 239 tests 전체 통과 (unit 126 + e2e 72 + scenario 41)

## Lessons Learned

- prompt에서 "backlog에 기록"이라고 지시하면 subagent는 충실히 `reap make backlog`를 실행한다. 의도와 다른 행동을 방지하려면 prompt에서 명시적으로 금지해야 한다.
- 다층 방어 (adapt prompt + base prompt + guide)가 효과적. 한 곳에서만 규칙을 명시하면 다른 맥락에서 무시될 수 있다.
- environment-change backlog를 adapt에서 생성하라는 지시는 reflect phase와 중복이었으므로 제거.

## Next Generation Hints

- CLAUDE.md의 subagent instructions에도 "adapt phase에서 backlog 생성 금지" 규칙이 들어가면 더 견고해짐
- 기존 reap 프로젝트에 CLAUDE.md 추가 (migration) 작업이 pending backlog에 있음
