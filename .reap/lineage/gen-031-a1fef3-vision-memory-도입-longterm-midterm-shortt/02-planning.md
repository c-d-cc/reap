# Planning — gen-031-a1fef3

## Goal

Vision Memory 도입 — `.reap/vision/memory/`에 longterm/midterm/shortterm 3-tier 자유 기록 시스템을 추가하여 AI가 프로젝트 맥락을 구조적으로 기록/참조할 수 있게 한다.

## Completion Criteria

1. `ReapPaths`에 memory 디렉토리 + 3개 파일 경로 존재
2. `reap init` 실행 시 `.reap/vision/memory/` 디렉토리와 3개 빈 파일 생성
3. subagent prompt에 shortterm + midterm memory 내용 포함
4. reflect phase prompt에 memory 갱신 기회 안내 포함
5. `reap-guide.md`에 Memory 시스템 설명 포함
6. `reap run knowledge --goal memory`로 memory 관리 가능
7. memory 파일이 비어있어도 정상 동작 (optional)
8. 기존 테스트 전체 통과 + 신규 테스트 추가

## Tasks

- [ ] T001 `src/core/paths.ts` — ReapPaths에 memory, memoryLongterm, memoryMidterm, memoryShortterm 추가
- [ ] T002 `src/core/prompt.ts` — ReapKnowledge에 memoryShortterm, memoryMidterm 필드 추가, loadReapKnowledge에서 로딩, buildBasePrompt에서 Memory 섹션 추가
- [ ] T003 `src/cli/commands/init/common.ts` — initCommon에서 memory 디렉토리 + 빈 파일 3개 생성
- [ ] T004 `src/cli/commands/run/completion.ts` — reflect phase prompt에 memory 갱신 안내 추가
- [ ] T005 `src/templates/reap-guide.md` — Architecture에 Memory 추가, .reap/ Structure에 memory 디렉토리 추가, Memory 규칙 섹션 추가
- [ ] T006 `src/cli/commands/run/knowledge.ts` — memory 서브커맨드 추가 (3개 파일 읽기/수정 가이드)
- [ ] T007 `tests/unit/` — paths, prompt 관련 테스트 추가 (memory 경로 존재, memory 로딩, prompt 빌드 시 memory 섹션 포함)
- [ ] T008 빌드 + 전체 테스트 실행

## Dependencies

T001 → T002, T003 (paths가 먼저)
T001~T006 → T007 (테스트는 구현 후)
T007 → T008 (빌드 + 테스트)

## Scope

변경 파일:
- `src/core/paths.ts`
- `src/core/prompt.ts`
- `src/cli/commands/init/common.ts`
- `src/cli/commands/run/completion.ts`
- `src/templates/reap-guide.md`
- `src/cli/commands/run/knowledge.ts`
- `tests/unit/` (신규 또는 기존 테스트 파일)

Out of scope:
- `notes/next-session-prompt.md` 삭제 (별도 generation에서 정리)
- longterm memory의 on-demand 로딩 (현재는 prompt에 포함하지 않음, 나중에 필요 시 추가)
- memory CLI 전용 명령어 (`reap memory` 같은 top-level 커맨드)
