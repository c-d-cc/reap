# Planning

## Summary

기존 i18n 인프라를 활용하여 ja, zh-CN 번역 파일을 추가하고 Locale 타입을 확장한다.

## Tasks

- T1. `types.ts` — Locale 타입에 ja, zh-CN 추가, LOCALES/LOCALE_LABELS 확장
- T2. `context.tsx` — detectLocale에 ja, zh 감지 추가
- T3. `translations/ja.ts` — 일본어 번역 파일 생성
- T4. `translations/zh-CN.ts` — 중국어 간체 번역 파일 생성
- T5. `index.ts` — translations에 ja, zh-CN import 추가
