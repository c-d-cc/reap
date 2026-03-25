# Planning

## Summary
v0.16.0 전환 준비 패치. 3개 파일 수정: (1) update 커맨드에 --post-upgrade 옵션 및 hand-off 로직, (2) ConfigManager.backfill에 lastCliVersion 추가, (3) version bump.

## Technical Context
- **Tech Stack**: TypeScript, Node.js, Commander.js, YAML
- **Constraints**: execSync for hand-off, try/catch for fail-safe, fs/promises via core/fs.ts

## Tasks

### Phase 1: Core Changes
- [x] T001 `src/cli/commands/update.ts` -- hand-off 헬퍼 함수 `handOffToNewBinary()` 추가. execSync로 `reap update --post-upgrade` 호출, try/catch로 감싸서 실패 시 false 반환
- [x] T002 `src/cli/index.ts` -- update 커맨드에 `--post-upgrade` 옵션 추가. 이 옵션이 있으면 selfUpgrade를 건너뛰고 updateProject + integrity + notice만 실행
- [x] T003 `src/cli/index.ts` -- selfUpgrade/forceUpgrade 성공 후 handOffToNewBinary() 호출. 성공 시 return (updateProject 건너뛰기)
- [x] T004 `src/core/config.ts` -- ConfigManager.backfill()에 lastCliVersion 추가. getCurrentVersion()으로 값 설정. defaults 목록이 아닌 별도 로직 (매번 갱신)
- [x] T005 `package.json` -- version bump: 0.15.15 -> 0.15.16

### Phase 2: Build & Validate
- [x] T006 빌드 확인: `npm run build` 성공
- [x] T007 타입체크: `bunx tsc --noEmit` 성공
- [x] T008 기존 E2E 테스트 깨지지 않는 것 확인

## Dependencies
- T002, T003은 T001에 의존 (handOffToNewBinary 함수 필요)
- T004는 독립
- T005는 독립
- T006-T008은 T001-T005 완료 후
