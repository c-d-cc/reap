# Planning

## Summary
3개 파일 수정: versionBump skill에 release notice 게시 단계 추가, completion/evolve의 prompt에 backlog 생성 방식 및 원본 참조 지시 추가.

## Technical Context
- **Tech Stack**: TypeScript, Commander.js CLI, YAML config
- **Constraints**: skill 파일은 Markdown, completion.ts/evolve.ts는 TypeScript prompt 문자열 수정

## Tasks
- [ ] T001 `.claude/commands/reapdev.versionBump.md` -- Step 5와 6 사이에 Step 5.5 (Release notice 작성/게시) 삽입. AI가 notice 초안 작성 (다국어 `## en`/`## ko`), 유저 컨펌, `gh api` GraphQL로 Discussions Announcements 게시.
- [ ] T002 `src/cli/commands/run/completion.ts` -- feedKnowledge phase의 prompt 문자열에 "backlog 생성 시 `reap make backlog --type <type> --title <title> --body <body>` 명령을 사용하라. Write로 직접 생성하지 마라." 안내 추가.
- [ ] T003 `src/cli/commands/run/evolve.ts` -- buildSubagentPrompt()에 3가지 추가: (a) backlog 생성 시 `reap make backlog` 사용 가이드, (b) 선택된 backlog 파일 경로를 prompt에 포함, (c) "backlog 원본을 직접 읽고 모든 구현 포인트를 확인하라" 지시.

## Dependencies
- T001, T002, T003은 모두 독립적이며 병렬 수행 가능
