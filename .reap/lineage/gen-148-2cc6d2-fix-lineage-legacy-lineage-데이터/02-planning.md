# Planning

## Summary

Legacy lineage 데이터 무결성 문제 3가지를 수정:
1. 9건의 `legacy-N` placeholder 날짜를 git 커밋 시간 기반 ISO 날짜로 교정
2. 7건의 compressed lineage .md 파일에 YAML frontmatter 복구
3. `migration.ts`의 placeholder 로직을 git log 기반 날짜 추정으로 개선

## Technical Context
- **Tech Stack**: TypeScript, Node.js fs/promises, YAML, child_process (git log)
- **Constraints**: lineage DAG 구조 유지, ISO 날짜 형식, 시간순 일관성

## Tasks

### Phase 1: Legacy 날짜 교정 (9건)
- [x] T001 `.reap/lineage/gen-004-04e465.md` -- `startedAt/completedAt`를 `2026-03-21T16:34:25+09:00`으로 교정
- [x] T002 `.reap/lineage/gen-036-0ba2b6.md` -- `startedAt/completedAt`를 `2026-03-20T18:33:29+09:00`으로 교정
- [x] T003 `.reap/lineage/gen-039-722d63.md` -- `startedAt/completedAt`를 `2026-03-20T18:33:29+09:00`으로 교정
- [x] T004 `.reap/lineage/gen-040-308d77.md` -- `startedAt/completedAt`를 `2026-03-21T16:34:25+09:00`으로 교정
- [x] T005 `.reap/lineage/gen-041-c7b6c0.md` -- `startedAt/completedAt`를 `2026-03-21T16:34:25+09:00`으로 교정
- [x] T006 `.reap/lineage/gen-042-2a4313.md` -- `startedAt/completedAt`를 `2026-03-21T16:34:25+09:00`으로 교정
- [x] T007 `.reap/lineage/gen-043-078edf.md` -- `startedAt/completedAt`를 `2026-03-21T16:34:25+09:00`으로 교정
- [x] T008 `.reap/lineage/gen-044-782053.md` -- `startedAt/completedAt`를 `2026-03-21T20:44:56+09:00`으로 교정
- [x] T009 `.reap/lineage/gen-045-3785e0.md` -- `startedAt/completedAt`를 `2026-03-21T20:51:31+09:00`으로 교정

### Phase 2: Compressed frontmatter 복구 (7건)
- [x] T010 `.reap/lineage/gen-102-95708b.md` -- frontmatter 추가 (parent: gen-101-c88beb, goal: "CLAUDE.md REAP 룰 + README/docs v0.11.x 갱신")
- [x] T011 `.reap/lineage/gen-111-845eb4.md` -- frontmatter 추가 (parent: gen-109-993f83, goal: "reap init 완료 시 /reap.sync 실행 안내 메시지 출력")
- [x] T012 `.reap/lineage/gen-113-42d502.md` -- frontmatter 추가 (parent: gen-111-845eb4, goal: "update environment summary — AI agent env & test count")
- [x] T013 `.reap/lineage/gen-122-519e18.md` -- frontmatter 추가 (parent: gen-121-bec8d5, goal: "add docsUpdate gate to versionBump")
- [x] T014 `.reap/lineage/gen-123-98fe85.md` -- frontmatter 추가 (parent: gen-122-519e18, goal: "full scan update — 3-layer model, new commands, i18n sync")
- [x] T015 `.reap/lineage/gen-124-ea5e55.md` -- frontmatter 추가 (parent: gen-123-98fe85, goal: "remove reapdev commands from public docs")
- [x] T016 `.reap/lineage/gen-125-aed658.md` -- frontmatter 추가 (parent: gen-124-ea5e55, goal: "remove reapdev from src and COMMAND_NAMES")

### Phase 3: migration.ts 개선
- [x] T017 `src/core/migration.ts` -- git log 기반 날짜 추정 헬퍼 함수 `estimateGenDates()` 추가
- [x] T018 `src/core/migration.ts` -- L95-96의 `legacy-N` placeholder를 `estimateGenDates()` 호출로 대체

### Phase 4: 검증
- [x] T019 `reap fix --check` 실행하여 legacy date 오류 및 frontmatter 경고 해소 확인

## Dependencies

- T001~T009: 독립적, 병렬 가능
- T010~T016: 독립적, 병렬 가능
- T017 → T018: 헬퍼 함수 먼저 작성 후 교체
- T019: T001~T018 모두 완료 후 실행
