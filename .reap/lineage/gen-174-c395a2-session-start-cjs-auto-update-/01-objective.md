# Objective

## Goal
session-start.cjs auto-update 시 release notice 표시 + breaking change blocked 시 수동 업데이트 안내 강화

## Completion Criteria
1. auto-update 성공 후 RELEASE_NOTICE.md에서 새 버전의 notice를 파싱하여 initLines에 추가됨
2. breaking change blocked 시 유저 친화적 메시지가 initLines에 표시됨
3. breaking change blocked 시 AI updateSection이 첫 응답에서 유저에게 명확히 안내하도록 강화됨
4. bun test 전체 통과
5. bunx tsc --noEmit 통과
6. npm run build 성공
7. version bump: 0.15.16 → 0.15.17

## Requirements

### Functional Requirements
1. auto-update 성공 후 RELEASE_NOTICE.md에서 새 버전 notice 파싱하여 initLines에 추가
   - 패키지 루트: require.resolve('@c-d-cc/reap/package.json')의 dirname
   - 파싱 로직: src/core/notice.ts의 fetchReleaseNotice() 참조하여 CJS 인라인 구현
   - 언어: session-start.cjs에서 이미 감지하는 language 변수 사용
   - try/catch로 감싸서 실패 시 무해하게
2. breaking change blocked 시 initLines 메시지를 유저 친화적으로 변경
3. breaking change blocked 시 updateSection AI 지시 강화

### Non-Functional Requirements
1. 순수 CJS (TypeScript import 불가)
2. 기존 코드 스타일 유지

## Design

### Selected Design
- session-start.cjs 내부에 fetchReleaseNoticeCJS(version, language) 인라인 함수 추가
- auto-update 성공 블록 뒤에서 notice 파싱 후 autoUpdateNotice 변수에 저장
- initLines에서 autoUpdateMessage 뒤에 notice 추가
- breaking 메시지 텍스트 및 updateSection 문구 개선

## Scope
- **Related Genome Areas**: conventions (session-start.cjs 관련)
- **Expected Change Scope**: src/templates/hooks/session-start.cjs, package.json
- **Exclusions**: notice.ts 수정 없음

## Genome Reference
- conventions.md: 코드 스타일, 커밋 형식

## Backlog (Genome Modifications Discovered)
None

## Background
현재 session-start.cjs에서 auto-update 성공 시 release notice가 표시되지 않고, breaking change blocked 시 메시지가 AI context로만 전달되어 유저에게 직접적이지 않음.
