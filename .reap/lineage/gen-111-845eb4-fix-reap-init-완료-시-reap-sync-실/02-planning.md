# Planning

## Summary
`src/cli/commands/init.ts`의 `initProject()` 함수 반환 전에 `/reap.sync` 실행 안내 메시지를 조건부 출력한다. auto-sync가 이미 실행된 경우(adoption/migration + no preset)에는 출력하지 않는다.

## Technical Context
- **Tech Stack**: TypeScript, Node.js, Commander.js
- **Constraints**: 기존 log 콜백 패턴 사용, async/await 스타일 준수

## Tasks
- [x] T001 `src/cli/commands/init.ts` -- detectedAgents 루프 후 return 전에 auto-sync 여부 판별 및 조건부 `/reap.sync` 안내 메시지 출력 코드 추가

## Dependencies
없음 (단일 태스크)

## Verification
- `bunx tsc --noEmit` 타입 체크 통과
- `bun test` 기존 테스트 통과
- `npm run build` 빌드 성공
