# Objective

## Goal
session-start.cjs / opencode-session-start.js 간 Genome 로딩 로직을 공통 모듈로 추출하고, opencode 측 source-map.md 누락 불일치를 수정한다.

## Completion Criteria
- CC-1: 공통 Genome 로딩 모듈 (`genome-loader.cjs`)이 존재하고, 두 hook 파일 모두 이를 사용한다
- CC-2: opencode-session-start.js가 `source-map.md`를 L1 파일에 포함한다
- CC-3: opencode-session-start.js에 source-map drift 감지 로직이 포함된다
- CC-4: `bun test` 통과
- CC-5: `bunx tsc --noEmit` 통과
- CC-6: `npm run build` 성공

## Requirements

### Functional Requirements
- FR-01: Genome L1/L2 로딩 로직 (파일 읽기, 줄 수 budget, truncation)을 공통 모듈로 추출
- FR-02: config.yml 파싱 (strict mode), current.yml 파싱, stage→command 매핑을 공통 모듈로 추출
- FR-03: staleness 감지, source-map drift 감지를 공통 모듈로 추출
- FR-04: strict mode 섹션 빌드 로직을 공통 모듈로 추출
- FR-05: opencode-session-start.js L1 파일 목록에 `source-map.md` 추가
- FR-06: 두 hook 파일이 공통 모듈을 import하여 기존과 동일한 출력을 생성

### Non-Functional Requirements
- NFR-01: 공통 모듈은 CommonJS (.cjs) 형식 — 두 hook 모두 CJS 환경에서 실행됨
- NFR-02: 기존 동작의 breaking change 없음

## Scope
- **Related Genome Areas**: source-map.md (hook 시스템 관련), conventions.md (코드 스타일)
- **Expected Change Scope**: `src/templates/hooks/` 내 3개 파일 (신규 1 + 수정 2)
- **Exclusions**: hook 등록/설치 로직 변경 없음, CLI 코드 변경 없음

## Genome Reference
- `domain/hook-system.md`: SessionStart hook 규칙
- `conventions.md`: 파일명 kebab-case, 에러 처리 규칙
- `constraints.md`: Node.js fs/promises 호환

## Backlog (Genome Modifications Discovered)
None

## Background
gen-038에서 opencode-session-start.js를 새로 작성했으나, session-start.cjs의 Genome 로딩 로직을 수동 복사하면서 source-map.md가 L1 파일 목록에서 누락됨. 두 파일 간 ~120줄의 동일 로직이 중복되어 유지보수 부담 발생.
