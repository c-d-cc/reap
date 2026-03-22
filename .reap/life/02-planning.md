# REAP MANAGED — Do not modify directly. Use reap run commands.
# Planning

## Summary

`reap update-genome` CLI subcommand 구현. 2-phase (scan → apply) 패턴. 신규 1파일, 수정 1파일.

## Technical Context
- **Tech Stack**: TypeScript, Commander.js, Node.js >=18
- **Constraints**: emitOutput() JSON stdout 패턴, 기존 코어 유틸 재사용

## Tasks

### Phase 1: 구현

- [x] T001 `src/cli/commands/update-genome.ts` -- 신규 파일 생성. updateGenome(cwd, apply) 함수 구현
  - active generation gate (GenerationManager.current() !== null → 에러)
  - scanBacklog() → pending genome-change 필터
  - phase 1: JSON prompt 출력 (emitOutput)
  - --apply: markBacklogConsumed + genomeVersion 증가 + done JSON
- [x] T002 `src/cli/index.ts` -- program.command("update-genome") 등록. --apply 옵션

## Dependencies

- T002는 T001에 의존 (import 대상)
- T001은 기존 코어 유틸에만 의존 (scanBacklog, markBacklogConsumed, ConfigManager, GenerationManager, emitOutput, emitError, ReapPaths)
