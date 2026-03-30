# Implementation Log

## Completed Tasks

### T001-T003: Core logic (`src/cli/commands/init/common.ts`)

유틸 함수 3개 추가 (모두 export):
- `computeSectionHash(content)` — SHA256 해시 첫 8자 (마커/비교용)
- `wrapWithMarkers(content)` — `<!-- reap:start {hash} -->` ... `<!-- reap:end -->` 래핑
- `extractReapSection(fileContent)` — 마커 파싱, `{ hash, startIdx, endIdx }` 반환

내부 함수 2개 추가:
- `detectLegacyReapSection(fileContent)` — 마커 없는 레거시 REAP 섹션 감지 (markdown heading 기반)
- `stripMarkers(content)` — 마커 제거 (템플릿에서 마커 있을 경우 대비)
- `updateClaudeMdFile(filePath, content, newHash, wrappedSection)` — 단일 파일 업데이트 로직

`ensureClaudeMd()` 리팩토링:
- 반환값: `"created" | "appended" | "skipped" | "updated"`
- 로직: 마커 있음+해시 일치 -> skip, 마커 있음+해시 불일치 -> update, 레거시 감지 -> update, 없음 -> append/create

### T004: Template (`src/templates/claude-md-section.md`)

변경 없음. 템플릿은 마커 없이 raw content 유지. `ensureClaudeMd()`가 런타임에 마커를 래핑.

### T005: `src/cli/commands/update.ts`

`claudeMdAction !== "skipped"` 조건으로 변경 (기존 `=== "created" || === "appended""`에서). "updated" 포함.

### T006: `src/cli/commands/fix.ts`

기존 `.reap/genome/` 문자열 감지 조건 제거. 항상 `ensureClaudeMd()` 호출하여 마커 기반 동기화 수행.

### T007: Dogfooding CLAUDE.md

- `CLAUDE.md` (root): 프로젝트별 Korean 헤더 유지 + 템플릿 섹션을 마커로 래핑
- `.claude/CLAUDE.md`: 간략 안내만 유지 (커스텀 내용, 마커 불필요)

### T008: Unit tests (`tests/unit/claude-md-sync.test.ts`)

12개 테스트:
- `computeSectionHash`: 형식, 동일성, 상이성, whitespace trim
- `wrapWithMarkers`: 마커 존재, 해시 포함, 내용 위치
- `extractReapSection`: null (마커 없음), 유효 추출, 경계 정확성, end 마커 없음, 해시 일치

### T009: Build + Test

빌드 성공. 332 pass / 4 fail (pre-existing integrity test failures, 이번 변경과 무관).
신규 12 tests 전체 통과.
