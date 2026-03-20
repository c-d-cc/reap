# Planning

## Tasks
1. `src/cli/commands/update.ts`의 `updateProject()` 끝에 프로젝트 레벨 commands 복사 로직 추가
   - REAP 프로젝트인 경우에만 (`paths.isReapProject()`)
   - `~/.reap/commands/reap.*.md` → `.claude/commands/reap.*.md` (내용 동일하면 스킵)
2. 빌드 + 테스트

## E2E Test Scenarios
1. reap update 후 프로젝트 .claude/commands/에 최신 커맨드 복사됨
2. 내용 동일하면 복사 스킵 (멱등성)
3. 기존 symlink가 있으면 실제 파일로 교체
