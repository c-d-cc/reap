# Objective

## Goal

docs에 일본어(ja)와 중국어 간체(zh-CN) 번역을 추가한다. 기존 i18n 인프라(gen-021)를 활용하여 번역 파일만 추가하고 Locale 타입을 확장한다.

## Completion Criteria

- [ ] 일본어(ja) 번역 파일 추가 및 전체 페이지 번역
- [ ] 중국어 간체(zh-CN) 번역 파일 추가 및 전체 페이지 번역
- [ ] LOCALES, LOCALE_LABELS에 ja, zh-CN 추가
- [ ] 언어 선택 드롭다운에서 4개 언어 정상 전환
- [ ] 브라우저 자동 감지에 ja, zh 추가

## Scope
- **Expected Change Scope**: `docs/src/i18n/` 내 types.ts, context.tsx, translations/ 파일 추가/수정
- **Exclusions**: 페이지 컴포넌트 변경 없음 (번역 키 구조 동일)

## Backlog (Genome Modifications Discovered)
None
