---
id: gen-031-a1fef3
type: embryo
goal: "Vision Memory 도입 — longterm/midterm/shortterm 3-tier 자유 기록 시스템"
parents: ["gen-030-4062aa"]
---
# gen-031-a1fef3
Vision Memory 3-tier 시스템을 도입했다. `.reap/vision/memory/`에 longterm/midterm/shortterm 3개 파일로 구성되는 자유 기록 공간을 추가했다.

### Changes
- `src/core/paths.ts` — `memory`, `memoryLongterm`, `memoryMidterm`, `memoryShortterm` 경로 추가
- `src/core/prompt.ts` — ReapKnowledge에 memory 필드, 로딩, buildBasePrompt에서 Memory 섹션 추가
- `src/cli/commands/init/common.ts` — init 시 memory 디렉토리 + 빈 파일 3개 생성
- `src/cli/commands/run/completion.ts` — reflect phase에 memory 갱신 안내 추가
- `src/templates/reap-guide.md` — Architecture에 Memory 언급, .reap/ Structure에 memory 디렉토리 추가, Memory 전용 섹션 추가
- `src/cli/commands/run/knowledge.ts` — memory 서브커맨드 추가, reload에 memory 파일 포함
- `tests/unit/knowledge.test.ts` — memory 서브커맨드 테스트, reload 테스트 업데이트

### Test Results
- 305 tests 전체 통과 (unit 180 + e2e 84 + scenario 41)