---
condition: has-code-changes
order: 30
---
이번 Generation의 변경사항에 따라 문서를 업데이트하라.

## 버전 수준별 동작

1. `package.json` version과 `git describe --tags --abbrev=0`을 비교하여 bump 수준 판단
2. 수준별 동작:
   - **patch (또는 bump 없음)**: 변경된 기능의 해당 섹션만 확인. 변경 없으면 skip.
   - **minor 이상**: README + docs 전체 **full scan**. 모든 변경사항을 문서와 대조.

## Full Scan 대상

- `README.md` (en 기준 → 아래 i18n 동기화)
- `src/templates/hooks/reap-guide.md`
- `docs/src/i18n/translations/en.ts` (기준 → 아래 i18n 동기화)
- `docs/src/pages/*.tsx`

## i18n 동기화 규칙

**반드시 en 기준으로 스캔한 후 다른 언어에 동기화:**
1. `README.md` (en) 수정 → `README.ko.md`, `README.ja.md`, `README.zh-CN.md` 동기화
2. `docs/src/i18n/translations/en.ts` 수정 → `ko.ts`, `ja.ts`, `zh-CN.ts` 동기화
3. 각 언어의 자연스러운 표현 유지 (기계적 직역 금지)
4. 구조(섹션, 코드 블록, 표)는 en과 동일하게 유지

## 변경 없으면 skip
