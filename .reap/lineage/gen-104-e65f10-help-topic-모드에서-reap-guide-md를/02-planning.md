# Planning

## Summary
help topic 모드에서 reap-guide.md를 읽어 emitOutput context에 포함하는 단순 변경.

## Technical Context
- **Tech Stack**: TypeScript, Node.js, readTextFile 유틸
- **Constraints**: 파일 I/O는 src/core/fs.ts 경유, ReapPaths 정적 메서드로 경로 해석

## Tasks
- [ ] T001 `src/cli/commands/run/help.ts` -- import에 ReapPaths 추가 (이미 타입만 import 중)
- [ ] T002 `src/cli/commands/run/help.ts` -- import에 join (from "path") 추가
- [ ] T003 `src/cli/commands/run/help.ts` -- topic 분기에서 reap-guide.md를 readTextFile로 읽기
- [ ] T004 `src/cli/commands/run/help.ts` -- emitOutput context에 reapGuide 필드 추가
- [ ] T005 빌드 및 타입 체크 (`bunx tsc --noEmit`)
- [ ] T006 테스트 실행 (`bun test`)

## Dependencies
- T001, T002 → T003 → T004 → T005 → T006
- 모든 변경은 help.ts 단일 파일
