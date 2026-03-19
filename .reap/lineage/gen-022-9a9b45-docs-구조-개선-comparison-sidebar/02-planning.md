# Planning

## Summary

Advanced 페이지에서 Comparison 섹션을 분리하여 별도 페이지로 만들고, sidebar 메뉴 그룹을 재구성한다.

## Tasks

### Phase 1: Comparison 페이지 생성
- T1. `en.ts` — `advanced.comparison*` 키들을 `comparison` 네임스페이스로 이동
- T2. `ko.ts` — 동일하게 이동
- T3. `ComparisonPage.tsx` — 새 페이지 컴포넌트 생성
- T4. `AdvancedPage.tsx` — 비교 섹션 제거
- T5. `App.tsx` — `/docs/comparison` 라우트 추가

### Phase 2: Sidebar 재구성
- T6. `en.ts` / `ko.ts` — nav 그룹 번역 키 추가 (guide, other)
- T7. `AppSidebar.tsx` — 그룹 구조 변경

## Dependencies

Phase 1, 2 독립적이나 번역 파일은 한 번에 수정
