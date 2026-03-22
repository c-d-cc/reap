# Objective

## Goal
fix: destroy 컨펌 메시지 변경 + session-start language 주입 누락 수정

## Completion Criteria
1. `reap destroy` 실행 시 컨펌 프롬프트가 `yes destroy` 입력을 요구한다
2. `yes destroy` 입력 시 정상 삭제, 불일치 시 취소된다
3. session-start.cjs가 parseConfig()에서 language를 destructure한다
4. AI 컨텍스트 출력에 `## Language` 섹션이 포함된다 (language 설정 시)
5. language 미설정 시 Language 섹션이 추가되지 않는다

## Requirements

### Functional Requirements
1. FR-1: destroy 컨펌 메시지를 `destroy ${projectName}`에서 `yes destroy`로 변경
2. FR-2: session-start.cjs line 157에서 `language`도 destructure
3. FR-3: AI 컨텍스트에 `## Language` 섹션 추가 (opencode-session-start.js의 기존 구현과 동일 패턴)

### Non-Functional Requirements
1. NFR-1: 기존 테스트 통과 (bun test, tsc --noEmit, npm run build)

## Design

### Approaches Considered
단순 버그 수정 — 대안 비교 불필요.

### Selected Design

**Fix 1: destroy 컨펌 메시지**
- `src/cli/index.ts` line 205: `expectedInput` 값을 `yes destroy`로 변경
- 프롬프트 메시지도 `yes destroy` 안내로 수정

**Fix 2: session-start language 주입**
- `src/templates/hooks/session-start.cjs` line 157: `{ strictEdit, strictMerge }` → `{ strictEdit, strictMerge, language }`
- line 213 부근: reapContext 문자열에 `langSection` 변수 삽입
- `langSection` 생성 로직은 opencode-session-start.js line 104-107과 동일 패턴 사용

### Design Approval History
- 단순 수정, 승인 불필요

## Scope
- **Related Genome Areas**: conventions (커밋 컨벤션)
- **Expected Change Scope**: src/cli/index.ts, src/templates/hooks/session-start.cjs (2 files)
- **Exclusions**: genome-loader.cjs 수정 불필요 (이미 language 반환), opencode-session-start.js 수정 불필요 (이미 language 주입)

## Genome Reference
- conventions.md: 커밋 메시지 형식 `fix(gen-NNN-hash): description`

## Backlog (Genome Modifications Discovered)
None

## Background
- destroy 명령의 기존 컨펌은 프로젝트명을 입력해야 하지만, 사용성 개선을 위해 `yes destroy`로 단순화
- session-start.cjs는 parseConfig()가 반환하는 language를 무시하고 있어, Claude Code 환경에서 language 설정이 적용되지 않음
- opencode-session-start.js에는 이미 동일 기능이 구현되어 있어 패턴 참조 가능
