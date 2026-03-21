# Objective

## Goal
help topic 모드에서 reap-guide.md를 context로 포함하여 AI가 정확한 REAP 지식 기반으로 topic을 설명할 수 있도록 한다.

## Completion Criteria
1. `REAP_HELP_TOPIC=<topic>` 으로 help 실행 시, emitOutput의 context에 reap-guide.md 내용이 포함된다
2. reap-guide.md 경로는 `ReapPaths.packageHooksDir`을 통해 해석한다
3. reap-guide.md 파일이 없는 경우에도 에러 없이 동작한다 (graceful fallback)
4. 기존 help 동작(일반 모드, 비지원 언어 모드)에 영향 없다
5. `bunx tsc --noEmit` 타입 체크 통과
6. `bun test` 전체 테스트 통과

## Requirements

### Functional Requirements
1. topic 모드 활성화 시 `ReapPaths.packageHooksDir`에서 `reap-guide.md`를 읽는다
2. 읽은 내용을 emitOutput의 context 객체에 `reapGuide` 키로 포함한다
3. 파일이 존재하지 않거나 읽기 실패 시 `reapGuide`를 빈 문자열 또는 생략한다

### Non-Functional Requirements
1. 기존 코드 구조와 패턴을 따른다 (readTextFile 유틸 사용)
2. 변경 범위를 최소화한다 (help.ts 1파일 수정)

## Design

### Approaches Considered

| Aspect | Approach A: context에 직접 포함 | Approach B: prompt에 인라인 |
|--------|-------------------------------|---------------------------|
| Summary | context.reapGuide로 전달 | prompt 문자열에 reap-guide.md 내용 직접 삽입 |
| Pros | 구조적 분리, AI가 선택적 참조 가능 | 단순 구현 |
| Cons | context 객체 크기 증가 | prompt가 과도하게 길어짐 |
| Recommendation | **선택** | |

### Selected Design
- `src/cli/commands/run/help.ts`의 topic 분기에서:
  1. `ReapPaths.packageHooksDir` + `/reap-guide.md` 경로 구성
  2. `readTextFile()`로 내용 읽기
  3. `emitOutput`의 `context` 객체에 `reapGuide` 필드로 포함

### Design Approval History
- 단순 변경이므로 brainstorming 생략

## Scope
- **Related Genome Areas**: 없음 (genome 변경 불필요)
- **Expected Change Scope**: `src/cli/commands/run/help.ts` 1파일 수정
- **Exclusions**: 일반 help 모드, 비지원 언어 모드 변경 없음

## Genome Reference
- conventions.md: 파일 I/O는 `src/core/fs.ts` 유틸 사용

## Backlog (Genome Modifications Discovered)
None

## Background
- help topic 요청 시 AI에게 REAP 지식이 없어 정확한 설명이 어려움
- reap-guide.md에 lifecycle, hooks, merge 규칙 등 REAP 핵심 지식이 있음
- ReapPaths.packageHooksDir로 패키지 내 reap-guide.md 경로에 접근 가능
