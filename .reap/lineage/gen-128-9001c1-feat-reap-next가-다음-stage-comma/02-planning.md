# Planning

## Summary
`src/cli/commands/run/next.ts`의 `execute` 함수 끝에서, stage 전환 후 다음 stage가 `completion`이 아닌 경우 해당 stage의 execute 함수를 dynamic import하여 자동 실행하는 로직을 추가한다.

## Technical Context
- **Tech Stack**: TypeScript, Node.js, Commander.js
- **Constraints**: 기존 emitOutput 구조 유지, JSON 2개 순차 출력

## Tasks
- [ ] T001 `src/cli/commands/run/next.ts` -- emitOutput 호출 후, nextStage가 completion이 아닌 경우 stage module을 dynamic import하여 execute(paths) 호출. normal lifecycle은 `./${nextStage}`, merge lifecycle은 `./merge-${nextStage}` 경로 사용.

## Dependencies
없음 (단일 태스크)

## E2E Impact
- `reap run next` 실행 시 JSON output이 2개 순차 출력되므로, 기존 next만 호출하던 코드에서 추가 output이 나오는 점 확인 필요.
- evolve.ts의 stage loop은 이번 scope에서 변경하지 않음.

