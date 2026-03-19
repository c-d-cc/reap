# Objective

## Goal

source-map 템플릿/로딩 정비 + hooks 네이밍 컨벤션(event prefix) + config.yml hooks 제거

## Completion Criteria

- CC-1: `src/templates/genome/source-map.md` 템플릿이 존재하고 `reap init`에서 복사된다
- CC-2: `session-start.sh`에서 source-map.md가 L1으로 로드된다
- CC-3: hooks 파일이 `{event}.{name}.{md|sh}` 네이밍으로 변경되고 frontmatter에 condition/order 포함
- CC-4: config.yml에서 hooks 섹션이 제거되고, `.reap/hooks/` 파일 기반으로만 동작
- CC-5: templates/genome/principles.md의 "Birth phase" → "Completion" 수정, Layer Map → Source Map 참조 변경
- CC-6: 기존 테스트 통과 (`bun test`) + TypeScript 컴파일 + 빌드

## Requirements

### Functional Requirements

- FR-001: `src/templates/genome/source-map.md` 빈 템플릿 생성
- FR-002: `src/cli/commands/init.ts` genomeTemplates 배열에 `source-map.md` 추가
- FR-003: `session-start.sh` L1 루프에 source-map.md 추가
- FR-004: `.reap/hooks/` 파일 이름을 `onGenerationComplete.{name}.{ext}` 형태로 변경
- FR-005: 각 hook 파일에 frontmatter 추가 (condition, order)
- FR-006: `.reap/config.yml`에서 hooks 섹션 제거
- FR-007: slash command 템플릿(reap.next, reap.start, reap.back)에서 hooks 실행 지시를 파일 기반 스캔으로 변경
- FR-008: reap-guide.md hook 문서 업데이트
- FR-009: templates/genome/ 의 "Birth phase" → "Completion" 수정
- FR-010: templates/genome/principles.md Layer Map → Source Map 참조

### Non-Functional Requirements

- 기존 hook 동작이 동일하게 유지

## Scope
- **Related Genome Areas**: domain/hook-system.md, conventions.md
- **Expected Change Scope**: init.ts, session-start.sh, .reap/hooks/, .reap/config.yml, templates/genome/, slash commands, reap-guide.md
- **Exclusions**: hook 실행 로직은 AI 에이전트가 담당 (코어 코드 변경 최소화)

## Genome Reference
- domain/hook-system.md
- conventions.md (Template Conventions)

## Backlog (Genome Modifications Discovered)
None

## Background
- gen-031에서 hooks condition/execute 구조 도입했으나, config.yml에 여전히 hooks 섹션 존재
- source-map.md가 프로젝트 genome에만 있고 템플릿/init/session-start에 미반영
- templates/genome/의 "Birth phase" 표현이 구 버전 잔재
