# Implementation Log — gen-031-a1fef3

## Completed Tasks

### T001 `src/core/paths.ts`
ReapPaths 인터페이스에 `memory`, `memoryLongterm`, `memoryMidterm`, `memoryShortterm` 4개 경로 추가. createPaths에서 `join(vision, "memory")` 기반으로 생성.

### T002 `src/core/prompt.ts`
- ReapKnowledge에 `memoryShortterm`, `memoryMidterm` 필드 추가
- loadReapKnowledge에서 shortterm + midterm 파일 로딩 (Promise.all에 추가)
- buildBasePrompt에서 Vision Goals 뒤에 Memory 섹션 추가 (shortterm + midterm, 내용이 있을 때만 표시)

### T003 `src/cli/commands/init/common.ts`
- initCommon에서 `ensureDir(paths.memory)` 추가
- 초기 memory 파일 3개 생성: `# Longterm Memory`, `# Midterm Memory`, `# Shortterm Memory` 헤더만

### T004 `src/cli/commands/run/completion.ts`
- reflect phase prompt에 "3. Update memory" 안내 추가 (AI 재량, 강제 아님)

### T005 `src/templates/reap-guide.md`
- Architecture Vision 설명에 Memory 언급 추가
- `.reap/ Structure`에 `memory/` 디렉토리와 3개 파일 추가
- Memory 전용 섹션 추가: 3-tier 구조 표, 규칙, 갱신 시점 가이드

### T006 `src/cli/commands/run/knowledge.ts`
- `memory` 서브커맨드 추가: 3개 memory 파일 읽기/수정 가이드 prompt
- `reload` 서브커맨드에 memoryShortterm, memoryMidterm 추가 (7개 파일로 확장)
- 메뉴에 memory 옵션 추가

### T007 `tests/unit/knowledge.test.ts`
- reload 테스트: files 배열 길이 5→7, memory 파일 존재 확인
- menu 테스트: memory 옵션 존재 확인
- memory 서브커맨드 테스트 추가: files 3개, prompt 내용 확인
- prompt 파일 경로 테스트: memoryShortterm, memoryMidterm 확인
