# Objective

## Goal
docs: full scan update — 3-layer model, 신규 커맨드, i18n 동기화

## Completion Criteria
1. reap-guide.md의 3-Layer Model이 README.md와 일치 (Knowledge Base / Evolution / Civilization)
2. README.md Slash Commands 테이블에 신규 3개 커맨드 추가됨
3. README.ko.md, README.ja.md, README.zh-CN.md의 Slash Commands 테이블 동기화
4. en.txt, ko.txt 헬프 파일에 신규 커맨드 추가됨
5. docs i18n translations (en/ko/ja/zh-CN)에 신규 커맨드 반영됨

## Requirements

### Functional Requirements
1. reap-guide.md 3-Layer Model을 Knowledge Base 모델로 수정
2. README.md에 /reap.refreshKnowledge, /reapdev.docsUpdate, /reapdev.versionBump 추가
3. README i18n 파일 3개 동기화
4. help 파일(en.txt, ko.txt) 신규 커맨드 추가
5. docs i18n translations 동기화

### Non-Functional Requirements
1. dist/ 파일 미수정
2. 기존 구조/스타일 유지

## Scope
- **Related Genome Areas**: 없음 (문서 전용 변경)
- **Expected Change Scope**: 8개 파일 수정
- **Exclusions**: dist/, 코드 변경 없음

## Backlog (Genome Modifications Discovered)
None

## Background
v0.13.4 이후 신규 커맨드 3개 추가, 3-layer model 업데이트가 reap-guide.md에 미반영 상태.

