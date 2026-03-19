# Planning

## Summary

v0.3.0 minor 릴리스에 맞춰 README 4개 언어 + docs 4개 translations + docs pages 4개를 full scan 갱신. docs-update hook에 버전 수준별 규칙과 en 기준 i18n 동기화 규칙 추가.

## Technical Context
- README: en 기준 스캔 → ko, ja, zh-CN 동기화
- docs: en.ts 기준 스캔 → ko.ts, ja.ts, zh-CN.ts 동기화
- docs pages: translations 참조하므로 i18n 키 변경 시 page도 확인

## Tasks

### Phase 1: docs-update hook 개선
- [ ] T001 `.reap/hooks/onGenerationComplete.docs-update.md` — 버전 수준별 규칙 + en 기준 i18n 동기화 규칙

### Phase 2: README en 기준 full scan
- [ ] T002 `README.md` (en) — 7개 stale 항목 반영

### Phase 3: README i18n 동기화
- [ ] T003 [P] `README.ko.md` — en 변경사항 동기화
- [ ] T004 [P] `README.ja.md` — en 변경사항 동기화
- [ ] T005 [P] `README.zh-CN.md` — en 변경사항 동기화

### Phase 4: docs translations en 기준 스캔
- [ ] T006 `docs/src/i18n/translations/en.ts` — hooks, source-map, compression, hook suggestion 반영

### Phase 5: docs translations i18n 동기화
- [ ] T007 [P] `docs/src/i18n/translations/ko.ts` — en.ts 동기화
- [ ] T008 [P] `docs/src/i18n/translations/ja.ts` — en.ts 동기화
- [ ] T009 [P] `docs/src/i18n/translations/zh-CN.ts` — en.ts 동기화

### Phase 6: docs pages 업데이트
- [ ] T010 [P] `docs/src/pages/HookReferencePage.tsx` — 파일 기반 hooks 반영
- [ ] T011 [P] `docs/src/pages/CoreConceptsPage.tsx` — source-map.md 추가
- [ ] T012 [P] `docs/src/pages/AdvancedPage.tsx` — compression 수치 반영
- [ ] T013 [P] `docs/src/pages/WorkflowPage.tsx` — completion Phase 5 반영

### Phase 7: 빌드 + 검증
- [ ] T014 `npm run build` + source 기반 `reap update`
- [ ] T015 `bun test` + `bunx tsc --noEmit`

## Dependencies
T001 독립
T002 → T003, T004, T005 (en 먼저)
T006 → T007, T008, T009 (en 먼저)
T010~T013 → T006 후 (translations 키 변경 반영)
T014 → 전체 후
T015 → T014 후
