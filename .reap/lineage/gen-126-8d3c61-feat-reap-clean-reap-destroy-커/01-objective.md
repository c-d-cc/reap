# Objective

## Goal
feat: `reap clean` / `reap destroy` CLI 서브커맨드 추가

## Completion Criteria
1. `reap destroy` 실행 시 확인 프롬프트(`destroy <project-name>` 입력 요구) 후 REAP 관련 파일 전체 삭제
2. `reap clean` 실행 시 인터랙티브 질문(lineage/hooks/genome/backlog) 후 프로젝트 초기화
3. 두 커맨드 모두 `reap` CLI에 정상 등록되어 `reap destroy`, `reap clean`으로 호출 가능
4. 존재하지 않는 대상은 graceful skip (에러 없이 건너뜀)
5. 타입 체크(`bunx tsc --noEmit`) 통과

## Requirements

### Functional Requirements

**FR-1 (destroy)**: `reap destroy` 실행 시 프로젝트명을 포함한 확인 문구 입력 요구
- "이 프로젝트에서 REAP을 제거하려면 'destroy <project-name>'을 입력하세요" 출력
- 정확히 입력해야 진행, 불일치 시 취소

**FR-2 (destroy)**: 확인 후 다음 항목 삭제:
- `.reap/` 폴더 전체
- `.claude/commands/reap.*` 파일
- `.claude/skills/reap.*` 디렉토리
- `.claude/CLAUDE.md`의 REAP managed 섹션 (파일에 다른 내용이 있으면 REAP 섹션만 제거, REAP 섹션만 있으면 파일 삭제)
- `.gitignore`의 REAP 관련 항목 (해당 라인만 제거, 파일 자체는 유지)

**FR-3 (destroy)**: 삭제 완료 후 삭제된 항목 요약 출력

**FR-4 (clean)**: `reap clean` 실행 시 4가지 인터랙티브 질문:
1. Lineage 처리: epoch 압축 보존 / 전체 삭제
2. Hooks 보존 여부: 기존 유지 / 초기화
3. Genome/Environment 처리: template override 후 sync / 기존 유지 / 수동 편집
4. Backlog 처리: 보존 / 삭제

**FR-5 (clean)**: 각 선택에 따라 해당 디렉토리/파일 처리 후 결과 출력

**FR-6 (clean)**: 진행 중인 세대(current.yml)가 있으면 경고 후 삭제 여부 확인

### Non-Functional Requirements

**NFR-1**: readline 기반 interactive prompt (외부 의존성 추가 없음)
**NFR-2**: 기존 CLI 패턴(init.ts, status.ts) 구조 준수
**NFR-3**: Node.js >=18 호환 (Bun API 미사용)

## Design

### Approaches Considered

| Aspect | Approach A: 로직 인라인 | Approach B: 분리 모듈 |
|--------|-----------|-----------|
| Summary | CLI action 내에 모든 로직 배치 | commands/destroy.ts, commands/clean.ts에 핵심 로직 분리 |
| Pros | 단순, 파일 수 최소 | 테스트 용이, 재사용 가능 |
| Cons | 함수가 길어질 수 있음 | 파일 수 증가 |
| Recommendation | - | 선택 |

### Selected Design
**Approach B**: `src/cli/commands/destroy.ts`와 `src/cli/commands/clean.ts`에 핵심 로직 분리. CLI 등록은 `src/cli/index.ts`에서 수행.

- `destroy.ts`: `destroyProject(projectRoot: string)` — 삭제 대상 탐지 + 삭제 실행, 결과 반환
- `clean.ts`: `cleanProject(projectRoot: string, options: CleanOptions)` — 옵션에 따른 초기화 수행
- `index.ts`: commander 서브커맨드 등록 + readline prompt 로직

### Design Approval History
- 2026-03-22: 초안 작성

## Scope
- **Related Genome Areas**: CLI commands, project structure
- **Expected Change Scope**: `src/cli/commands/destroy.ts`, `src/cli/commands/clean.ts`, `src/cli/index.ts` (3개 파일 신규/수정)
- **Exclusions**: 슬래시 커맨드 아님, AI 에이전트용 아님, 사용자 터미널 전용

## Genome Reference
- ADR-002: Commander.js CLI
- constraints.md: 파일 I/O는 Node.js fs/promises 사용

## Backlog (Genome Modifications Discovered)
None

## Background
`reap init`의 역연산(`destroy`)과 프로젝트 재시작(`clean`) 기능이 필요. 현재는 수동으로 `.reap/` 등을 삭제해야 하는 불편함이 있다.
