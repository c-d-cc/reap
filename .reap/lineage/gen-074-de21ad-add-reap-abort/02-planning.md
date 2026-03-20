# Planning

## Summary
reap.abort 슬래시 커맨드 템플릿 생성 + constraints.md에 커맨드 등록 + E2E 테스트

## Tasks
1. `src/templates/commands/reap.abort.md` 커맨드 템플릿 작성
2. `src/cli/commands/init.ts`의 COMMAND_NAMES에 `reap.abort` 추가
3. constraints.md에 slash command 수 업데이트 (13 → 14)
4. E2E 테스트 작성 및 실행
5. 빌드 + 테스트
