# Planning — gen-046-cd3e60

## Goal
`reap config` CLI 명령 구현 + 3개 skill 파일(reap.config, reap.status, reap.run) 정비.

## Completion Criteria
1. `reap config` 실행 시 config.yml 내용이 JSON으로 출력됨
2. reap.config.md에서 disable-model-invocation 제거, AI가 `reap config` 호출 후 결과 표시
3. reap.status.md에서 disable-model-invocation 제거, AI가 `reap status` 호출 후 결과 해석
4. reap.run.md에서 disable-model-invocation 제거, 사용법 안내 추가
5. config command에 대한 테스트 추가
6. 전체 테스트 pass (기존 452 + 신규)

## Scope
변경 파일:
- `src/cli/commands/config.ts` — 신규
- `src/cli/index.ts` — config 명령 라우팅 추가
- `src/adapters/claude-code/skills/reap.config.md` — 업데이트
- `src/adapters/claude-code/skills/reap.status.md` — 업데이트
- `src/adapters/claude-code/skills/reap.run.md` — 업데이트
- `tests/unit/config-command.test.ts` — 신규 테스트

## Tasks
- [ ] T001 `src/cli/commands/config.ts` — config.yml 읽기 + JSON 출력하는 execute() 구현
- [ ] T002 `src/cli/index.ts` — config 명령 라우팅 추가
- [ ] T003 `src/adapters/claude-code/skills/reap.config.md` — disable-model-invocation 제거, CLI 호출 + 결과 표시 안내
- [ ] T004 `src/adapters/claude-code/skills/reap.status.md` — disable-model-invocation 제거, 결과 해석 안내
- [ ] T005 `src/adapters/claude-code/skills/reap.run.md` — disable-model-invocation 제거, 사용법 안내
- [ ] T006 `tests/unit/config-command.test.ts` — config 출력 검증 unit test
- [ ] T007 build + 전체 테스트 실행

## Dependencies
T001 -> T002 (config.ts 생성 후 라우팅)
T001 -> T006 (config.ts 생성 후 테스트)
T003~T005 독립 (병렬 가능)
T007 마지막 (모든 변경 후)
