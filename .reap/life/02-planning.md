# REAP MANAGED — Do not modify directly. Use 'reap run <stage> --phase <phase>' to update.
# Planning

## Summary
selfUpgrade 후 notice 표시를 새 바이너리로 위임하는 기능 구현.
- `src/cli/index.ts`에 숨겨진 `--show-notice` 옵션 추가
- update action에서 selfUpgrade 성공 시 새 바이너리로 notice 가져오기

## Technical Context
- **Tech Stack**: TypeScript, Commander.js, Node.js child_process
- **Constraints**: execSync 사용, graceful failure 보장

## Tasks
- [x] T001 `src/cli/index.ts` -- `--show-notice <version>` 숨겨진 옵션 추가 (program.option). `--show-notice-lang <lang>` 옵션도 함께 추가. 파싱 후 해당 옵션이 있으면 fetchReleaseNotice 호출 → stdout 출력 → process.exit(0)
- [x] T002 `src/cli/index.ts` -- update action의 Step 4 (notice 표시) 부분을 수정: selfUpgrade 성공 시 `execSync('reap --show-notice <version> --show-notice-lang <lang>')` 실행하여 notice 가져오기. 실패 시 조용히 무시.
- [x] T003 `src/cli/index.ts` -- selfUpgrade 미발생 시 기존 fetchReleaseNotice 직접 호출 유지 (현행 유지 확인)

## Dependencies
- T001 → T002 (숨겨진 옵션이 먼저 존재해야 update action에서 호출 가능)
- T003은 독립적 (기존 코드 유지 확인)
