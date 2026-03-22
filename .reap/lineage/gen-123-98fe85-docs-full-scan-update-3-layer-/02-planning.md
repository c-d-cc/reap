# Planning

## Summary
문서 전용 변경. 8개 파일 수정, 코드 변경 없음.

## Technical Context
- **Tech Stack**: Markdown, TypeScript (i18n translations)
- **Constraints**: dist/ 미수정, 기존 구조 유지

## Tasks
- [x] T001 `src/templates/hooks/reap-guide.md` -- 3-Layer Model을 Knowledge Base 모델로 수정
- [x] T002 `README.md` -- Slash Commands 테이블에 신규 3개 커맨드 추가
- [x] T003 `README.ko.md` -- Slash Commands 테이블 동기화
- [x] T004 `README.ja.md` -- Slash Commands 테이블 동기화
- [x] T005 `README.zh-CN.md` -- Slash Commands 테이블 동기화
- [x] T006 `src/templates/help/en.txt` -- 신규 커맨드 추가
- [x] T007 `src/templates/help/ko.txt` -- 신규 커맨드 추가
- [x] T008 `docs/src/i18n/translations/en.ts` -- generalCommands에 신규 커맨드 추가
- [x] T009 `docs/src/i18n/translations/ko.ts` -- generalCommands 동기화
- [x] T010 `docs/src/i18n/translations/ja.ts` -- generalCommands 동기화
- [x] T011 `docs/src/i18n/translations/zh-CN.ts` -- generalCommands 동기화

## Dependencies
T001 독립, T002 선행 → T003-T005 병렬, T006-T007 독립, T008 선행 → T009-T011 병렬

