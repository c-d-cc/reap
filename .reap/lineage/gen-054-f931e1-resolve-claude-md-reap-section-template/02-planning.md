# Planning

## Goal

`reap update` 실행 시 CLAUDE.md의 REAP 섹션이 템플릿 변경을 자동으로 반영하도록 한다. 경계 마커 + 컨텐츠 해시 기반 변경 감지/교체 메커니즘 구현.

## Completion Criteria

1. 템플릿에 `<!-- reap:start -->` / `<!-- reap:end -->` 마커 존재
2. `ensureClaudeMd()`가 마커 기반으로 REAP 섹션 변경을 감지하고 교체
3. 마커가 없는 레거시 CLAUDE.md도 올바르게 업그레이드 (하위 호환)
4. 사용자 커스텀 내용 (마커 밖)이 보존됨
5. 양쪽 CLAUDE.md (root, .claude/) 모두 처리
6. dogfooding: 본 프로젝트의 CLAUDE.md에 마커 적용
7. unit test로 핵심 시나리오 검증 (create, append, skip, update, legacy upgrade)
8. `reap update` 실행 시 "updated" 결과가 올바르게 보고됨

## Approach

**해시 계산**: 템플릿 파일의 컨텐츠 (마커 제외)를 SHA256 해시하여 첫 8자를 start 마커에 포함.

**마커 형식**:
```
<!-- reap:start {hash} -->
... REAP section content ...
<!-- reap:end -->
```

**`ensureClaudeMd()` 로직 개선**:
1. 마커 존재 확인 (양쪽 CLAUDE.md)
2. 마커 있음 + 해시 일치 -> "skipped"
3. 마커 있음 + 해시 불일치 -> 마커 사이 교체 -> "updated"
4. 마커 없음 + 레거시 감지 (`## REAP` 또는 `.reap/genome/`) -> 레거시 섹션을 마커 포함 새 섹션으로 교체 -> "updated"
5. 마커 없음 + 레거시 없음 -> 기존 동작 (create/append)

**반환값 확장**: `"created" | "appended" | "skipped" | "updated"`

**해시를 빌드 타임에 계산할지 런타임에 계산할지**: 런타임에 계산. 템플릿 파일을 읽을 때 해시를 계산하므로 별도 빌드 단계 불필요. 마커의 해시는 "현재 설치된 CLAUDE.md의 해시"이고, 템플릿의 해시는 "새 버전의 해시". 비교하여 불일치 시 교체.

## Scope

**변경 파일**:
- `src/templates/claude-md-section.md` -- 마커 추가
- `src/cli/commands/init/common.ts` -- `ensureClaudeMd()` 로직 + 해시 유틸
- `src/cli/commands/update.ts` -- "updated" 결과 처리
- `src/cli/commands/fix.ts` -- 마커 기반 감지로 변경
- `CLAUDE.md` -- dogfooding 마커 적용
- `.claude/CLAUDE.md` -- dogfooding 마커 적용
- `tests/unit/claude-md-sync.test.ts` -- 신규 unit test

**Out of scope**:
- 다른 backlog 항목
- fix.ts의 전체 리팩토링 (감지 로직만 변경)

## Tasks

- [ ] T001 `src/cli/commands/init/common.ts` -- 해시 계산 유틸 함수 추가 (`computeSectionHash`)
- [ ] T002 `src/cli/commands/init/common.ts` -- 마커 파싱/교체 유틸 함수 추가 (`extractReapSection`, `wrapWithMarkers`)
- [ ] T003 `src/cli/commands/init/common.ts` -- `ensureClaudeMd()` 리팩토링: 마커 기반 감지/교체 로직 (skip, update, legacy upgrade, create, append)
- [ ] T004 `src/templates/claude-md-section.md` -- 시작/끝 마커 추가
- [ ] T005 `src/cli/commands/update.ts` -- "updated" 반환값 처리
- [ ] T006 `src/cli/commands/fix.ts` -- 마커 기반 감지로 변경
- [ ] T007 `CLAUDE.md` + `.claude/CLAUDE.md` -- dogfooding 마커 적용
- [ ] T008 `tests/unit/claude-md-sync.test.ts` -- unit test 작성 (create, append, skip, update, legacy upgrade, both locations)
- [ ] T009 빌드 + 전체 테스트 실행

## Dependencies

T001, T002 -> T003 -> T004 -> T005, T006 -> T007 -> T008 -> T009
(T001~T003이 핵심 로직, T004~T007은 적용, T008~T009은 검증)
