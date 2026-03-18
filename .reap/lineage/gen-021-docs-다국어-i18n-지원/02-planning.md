# Planning

## Summary

React Context 기반 자체 i18n 시스템을 구축한다. 페이지별 번역 객체를 `docs/src/i18n/` 디렉토리에 분리하고, LanguageProvider + useT hook으로 각 컴포넌트에서 번역 텍스트를 참조한다. nav header에 언어 선택 드롭다운을 추가하고 브라우저 언어 자동 감지 + localStorage 저장을 구현한다.

## Technical Context
- **Tech Stack**: React 19, Vite 7, wouter, Tailwind CSS 4, Radix UI
- **Constraints**: 외부 i18n 라이브러리 없이 자체 구현 (규모가 작으므로 충분)

## Tasks

### Phase 1: i18n 인프라 [P]
- [P] T1. `docs/src/i18n/types.ts` — 언어 코드 타입, 번역 키 타입 정의
- [P] T2. `docs/src/i18n/context.tsx` — LanguageProvider, useLanguage hook (localStorage 저장, navigator.language 자동 감지)
- [P] T3. `docs/src/i18n/translations/en.ts` — 영문 번역 (현재 하드코딩된 텍스트 추출)
- [P] T4. `docs/src/i18n/translations/ko.ts` — 한글 번역
- [P] T5. `docs/src/i18n/index.ts` — useT hook (현재 언어의 번역 객체 반환)

### Phase 2: UI 컴포넌트
- T6. `AppNavbar.tsx` — GitHub 버튼 왼쪽에 언어 선택 드롭다운 추가
- T7. `App.tsx` — LanguageProvider로 앱 전체 래핑

### Phase 3: 페이지 번역 적용
- T8. `AppSidebar.tsx` — navGroups 라벨/제목 번역
- T9. `DocPage.tsx` — breadcrumb, title 번역 지원
- T10. `HeroPage.tsx` — 번역 적용
- T11. `Introduction.tsx` — 번역 적용
- T12. `QuickStartPage.tsx` — 번역 적용
- T13. `CoreConceptsPage.tsx` — 번역 적용
- T14. `WorkflowPage.tsx` — 번역 적용
- T15. `CLIPage.tsx` — 번역 적용
- T16. `CommandReferencePage.tsx` — 번역 적용
- T17. `ConfigurationPage.tsx` — 번역 적용
- T18. `HookReferencePage.tsx` — 번역 적용
- T19. `AdvancedPage.tsx` — 번역 적용

## Dependencies

- Phase 1 완료 후 Phase 2, 3 진행 가능
- T6, T7 완료 후 Phase 3 진행 가능 (언어 전환 테스트를 위해)
- Phase 3 내 태스크는 모두 독립적 [P]

## 번역 전략

- Genome, Evolution, Civilization, Generation, Backlog, Lineage, SessionStart Hook 등 REAP 고유 용어는 영어 유지
- 설명문, 라벨, 테이블 헤더/설명 등을 한국어로 번역
- 코드 블록 내용은 번역하지 않음
- 번역 키 구조: 페이지별 네임스페이스 (hero, intro, quickstart, ...)
