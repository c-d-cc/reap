# Objective

## Goal
Configuration 문서 페이지 분리 — strict 모드를 HookReferencePage에서 ConfigurationPage로 이동

## Completion Criteria
1. `docs/src/pages/ConfigurationPage.tsx` 신규 생성 — config.yml 전체 설명 (strict 모드 포함)
2. `HookReferencePage.tsx`에서 Strict Mode 섹션 제거
3. 라우팅/네비게이션에 Configuration 페이지 추가
4. `bun test`, `bunx tsc --noEmit`, 빌드 통과

## Requirements

### Functional Requirements
- FR-001: ConfigurationPage 신규 — config.yml 구조, strict 모드, hooks 설정 개요
- FR-002: HookReferencePage에서 Strict Mode 섹션 제거
- FR-003: 라우터/네비게이션에 ConfigurationPage 추가

## Scope
- **Expected Change Scope**: docs/src/pages/ConfigurationPage.tsx (신규), HookReferencePage.tsx, 라우팅 파일
- **Exclusions**: src/ 코드 변경 없음
