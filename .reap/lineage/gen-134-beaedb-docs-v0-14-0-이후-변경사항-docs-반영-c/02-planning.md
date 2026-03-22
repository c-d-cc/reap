# Planning

## Summary
README 4개, help txt 2개, i18n ts 4개 파일에 `reap clean`/`reap destroy` CLI 커맨드 문서 추가.

## Technical Context
- **Tech Stack**: Markdown, TypeScript (docs i18n)
- **Constraints**: 각 언어 자연스러운 표현 유지, 기존 구조 유지

## Tasks

### Phase 1: README

- [x] T001 `README.md` -- CLI Commands 테이블에 clean/destroy 추가
- [x] T002 `README.ko.md` -- CLI 명령어 테이블에 clean/destroy 추가
- [x] T003 `README.ja.md` -- CLIコマンド 테이블에 clean/destroy 추가
- [x] T004 `README.zh-CN.md` -- CLI命令 테이블에 clean/destroy 추가

### Phase 2: Help 텍스트

- [x] T005 `src/templates/help/en.txt` -- clean/destroy 추가
- [x] T006 `src/templates/help/ko.txt` -- clean/destroy 추가

### Phase 3: Docs i18n

- [x] T007 `docs/src/i18n/translations/en.ts` -- clean/destroy 추가
- [x] T008 `docs/src/i18n/translations/ko.ts` -- clean/destroy 추가
- [x] T009 `docs/src/i18n/translations/ja.ts` -- clean/destroy 추가
- [x] T010 `docs/src/i18n/translations/zh-CN.ts` -- clean/destroy 추가

## Dependencies
모든 태스크 병렬 가능. Phase 간 의존성 없음.
