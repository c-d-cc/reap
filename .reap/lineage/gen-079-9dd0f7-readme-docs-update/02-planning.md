# Planning

## Regression
- **From**: implementation
- **Reason**: docs 사이드바 구조 재설계 — Guide 섹션에 4-axis별 페이지 분리 필요
- **Refs**: docs/src/components/AppSidebar.tsx, docs/src/pages/

## 변경 전후 비교

### Before (Guide)
- Core Concepts → /docs/core-concepts
- Workflow → /docs/workflow
- Advanced → /docs/advanced

### After (Guide)
- Core Concepts → /docs/core-concepts (축소 — 개요만)
- Genome → /docs/genome (신규)
- Environment → /docs/environment (신규)
- Lifecycle → /docs/lifecycle (기존 workflow 리네임)
- Lineage → /docs/lineage (신규)
- Backlog → /docs/backlog (신규)
- Advanced → /docs/advanced (유지)

## Tasks

### Phase 1: 새 페이지 생성
- [ ] T001 `GenomePage.tsx` — Genome 4축 설명, 파일 구조, domain/, Map not Manual 원칙
- [ ] T002 `EnvironmentPage.tsx` — 3-layer 구조, summary/docs/resources, sync.environment
- [ ] T003 `LineagePage.tsx` — 세대 아카이브, compression (Level 1/2), DAG, epoch
- [ ] T004 `BacklogPage.tsx` — type (task/genome-change/environment-change), status, abort backlog

### Phase 2: 기존 페이지 변경
- [ ] T005 `WorkflowPage.tsx` → `LifecyclePage.tsx` 리네임 + 내용 조정
- [ ] T006 `CoreConceptsPage.tsx` — 4축 개요만 남기고 상세는 각 페이지로 분산

### Phase 3: 라우팅 + 사이드바
- [ ] T007 `AppSidebar.tsx` — Guide 섹션에 새 페이지 추가
- [ ] T008 라우터 (App.tsx 또는 해당 파일) — 새 경로 등록

### Phase 4: 번역
- [ ] T009 `en.ts` — 새 페이지 번역 키 추가
- [ ] T010 `ko.ts`, `ja.ts`, `zh-CN.ts` — 동기화

### Phase 5: README + 검증
- [ ] T011 README 4개 — 이전 implementation에서 한 작업 + 추가 갱신
- [ ] T012 docs 프리뷰 + 유저 확인
