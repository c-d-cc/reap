# Planning

## Summary
10개 파일에서 reapdev.* 관련 내용을 제거하는 단순 텍스트 편집 작업.

## Technical Context
- **Tech Stack**: 해당 없음 (문서 편집만)
- **Constraints**: reapdev.*.md 파일 자체 삭제 금지, reap.refreshKnowledge 유지

## Tasks
- [x] T001 `README.md` -- "Dev Commands" 소섹션 제거 (헤더, 테이블, reapdev 행, 빈 줄)
- [x] T002 `README.ko.md` -- 동일하게 제거
- [x] T003 `README.ja.md` -- 동일하게 제거
- [x] T004 `README.zh-CN.md` -- 동일하게 제거
- [x] T005 `src/templates/help/en.txt` -- reapdev.* 줄 2개 제거
- [x] T006 `src/templates/help/ko.txt` -- reapdev.* 줄 2개 제거
- [x] T007 `docs/src/i18n/translations/en.ts` -- reapdev.* 배열 항목 2개 제거
- [x] T008 `docs/src/i18n/translations/ko.ts` -- 동일
- [x] T009 `docs/src/i18n/translations/ja.ts` -- 동일
- [x] T010 `docs/src/i18n/translations/zh-CN.ts` -- 동일

## Dependencies
모든 태스크 독립적, 병렬 실행 가능
