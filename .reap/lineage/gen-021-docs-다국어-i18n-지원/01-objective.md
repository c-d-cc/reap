# Objective

## Goal

docs 페이지에 다국어(i18n) 지원을 추가한다. nav header 오른쪽 상단(GitHub 버튼 왼쪽)에 언어 선택 UI를 배치하고, 브라우저/환경 기반 자동 언어 감지를 구현하며, 한글 번역을 추가한다. 추후 다른 언어 확장이 용이한 구조로 설계한다.

## Completion Criteria

- [ ] 언어 선택 드롭다운이 nav header GitHub 버튼 왼쪽에 표시됨
- [ ] 브라우저 `navigator.language` 기반으로 초기 언어 자동 감지
- [ ] 영어(en)와 한국어(ko) 두 언어 지원
- [ ] 모든 docs 페이지(10개)의 설명 텍스트가 한국어로 번역됨
- [ ] Genome, Evolution, Civilization 등 고유 용어는 영어 유지
- [ ] 언어 선택이 localStorage에 저장되어 재방문 시 유지
- [ ] 새 언어 추가 시 번역 파일만 추가하면 되는 확장 가능한 구조

## Requirements

### Functional Requirements

1. **언어 컨텍스트**: React Context로 현재 언어 상태 관리
2. **언어 선택 UI**: nav header에 select/dropdown, 현재 언어 표시
3. **자동 감지**: `navigator.language`에서 `ko`이면 한국어, 그 외 영어
4. **번역 시스템**: 페이지별 번역 객체, key-value 구조
5. **번역 범위**: 설명 텍스트 위주, 고유 용어(Genome, Evolution, Civilization, Generation, Backlog 등)는 영어 유지
6. **사이드바/네비게이션**: 그룹 라벨과 항목 제목도 번역

### Non-Functional Requirements

1. 번역 파일 추가만으로 새 언어 지원 가능한 구조
2. 기존 컴포넌트 구조 최소 변경

## Scope
- **Related Genome Areas**: conventions.md (Language 섹션)
- **Expected Change Scope**: `docs/src/` 내 i18n 시스템 추가 + 전체 페이지 컴포넌트 번역 적용
- **Exclusions**: docs 외 소스코드, REAP 코어 로직

## Genome Reference

conventions.md Language 섹션: "소스 템플릿(`src/templates/`)은 영어 유지 (범용)"

## Backlog (Genome Modifications Discovered)
None

## Background

현재 docs는 React SPA (Vite + wouter + Tailwind)로 구성. 10개 페이지, 모든 텍스트가 TSX에 하드코딩. i18n 라이브러리 없이 자체 구현으로 충분한 규모.
