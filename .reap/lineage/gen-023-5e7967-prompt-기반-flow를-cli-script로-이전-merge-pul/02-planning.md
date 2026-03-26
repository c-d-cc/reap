# Planning — gen-023-5e7967

## Goal
4개 스킬(abort, merge, pull, knowledge)의 flow 제어 로직을 prompt에서 CLI script로 이전. 스킬은 1줄 CLI 호출 + "stdout 지시를 따르라"로 축소.

## Completion Criteria
1. `reap.abort.md` — 1줄 CLI 호출로 축소, 기존 abort CLI가 올바르게 동작
2. `reap.merge.md` — 1줄 CLI 호출로 축소, start + evolve 안내
3. `reap.pull.md` — 1줄 CLI 호출로 축소, `reap run pull` CLI가 git fetch + 분석 + prompt 반환
4. `reap.knowledge.md` — 1줄 CLI 호출로 축소, `reap run knowledge` CLI가 subcommand별 prompt 반환
5. `reap run pull` 실행 시 JSON prompt 출력
6. `reap run knowledge reload` 실행 시 JSON prompt 출력
7. TypeCheck + Build 통과
8. 기존 테스트 통과 (영향받는 테스트 수정 포함)

## Approach

### 패턴
v15 스킬 패턴:
```
Run `reap run <command> $ARGUMENTS` and follow the stdout instructions exactly.
```
CLI가 상태를 확인하고 JSON stdout의 `prompt` 필드로 AI에게 다음 행동을 지시. AI는 prompt를 실행하고 결과를 CLI에 다시 전달 (핑퐁).

### merge 처리
- merge stage handler(`merge.ts`)와 이름 충돌 문제가 있음
- merge 스킬은 merge lifecycle 전체를 안내하는 역할 → 스킬에서 start/evolve 사용법만 간단히 안내
- 별도 CLI 오케스트레이터 불필요 — evolve가 merge lifecycle도 처리

### pull/knowledge 핸들러
- lifecycle stage가 아닌 utility command
- generation 상태와 무관하게 동작
- `run/index.ts`의 STAGE_HANDLERS에 등록하되, nonce/artifact 없이 즉시 실행

## Scope

### 변경 파일
- `src/adapters/claude-code/skills/reap.abort.md` — 축소
- `src/adapters/claude-code/skills/reap.merge.md` — 축소
- `src/adapters/claude-code/skills/reap.pull.md` — 축소
- `src/adapters/claude-code/skills/reap.knowledge.md` — 축소
- `src/cli/commands/run/knowledge.ts` — 신규
- `src/cli/commands/run/pull.ts` — 신규 (기존 push.ts와 다른 파일)
- `src/cli/commands/run/index.ts` — pull, knowledge 등록
- `src/core/git.ts` — pull 관련 git 유틸 함수 추가

### Out of Scope
- evolve.ts 수정 (이미 merge 지원)
- 기존 merge stage handler 수정
- prompt.ts 수정

## Tasks
- [ ] T001 `src/core/git.ts` — git fetch, branch ahead/behind 분석, unmerged branches 조회 함수 추가
- [ ] T002 `src/cli/commands/run/pull.ts` — pull CLI 핸들러 신규 생성 (fetch + 분석 + prompt 반환)
- [ ] T003 `src/cli/commands/run/knowledge.ts` — knowledge CLI 핸들러 신규 생성 (reload/genome/environment/no-arg)
- [ ] T004 `src/cli/commands/run/index.ts` — pull, knowledge 핸들러 import + STAGE_HANDLERS 등록
- [ ] T005 `src/adapters/claude-code/skills/reap.abort.md` — 1줄로 축소
- [ ] T006 `src/adapters/claude-code/skills/reap.merge.md` — 1줄로 축소
- [ ] T007 `src/adapters/claude-code/skills/reap.pull.md` — 1줄로 축소
- [ ] T008 `src/adapters/claude-code/skills/reap.knowledge.md` — 1줄로 축소
- [ ] T009 TypeCheck + Build 확인
- [ ] T010 기존 테스트 실행 + 영향받는 테스트 수정

## Dependencies
- T001 → T002 (pull.ts가 git 함수 사용)
- T002, T003 → T004 (index.ts에 등록)
- T004 → T009 (빌드 확인)
- T005~T008은 독립적, 병렬 가능
- T009 → T010 (빌드 후 테스트)
