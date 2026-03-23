# REAP MANAGED — Do not modify directly. Use 'reap run <stage> --phase <phase>' to update.
# Objective

## Goal
selfUpgrade 후 새 바이너리로 notice 표시.
현재 `selfUpgrade()`가 npm install로 새 버전을 설치하지만, 현재 실행 중인 프로세스는 이전 버전 코드이므로 `fetchReleaseNotice()`가 이전 버전의 경로/형식으로 notice를 읽어 실패할 수 있다.
해결: selfUpgrade 성공 시 `fetchReleaseNotice`를 직접 호출하지 않고, 새로 설치된 `reap` 바이너리를 `execSync`로 실행하여 notice를 가져온다.

## Completion Criteria
1. selfUpgrade 성공 시 새로 설치된 reap 바이너리에서 notice를 가져와 표시한다
2. selfUpgrade 미발생 시 기존처럼 현재 프로세스에서 notice를 표시한다
3. 새 바이너리 실행 실패 시 graceful하게 무시한다 (기존 동작 유지)
4. CLI에 `--show-notice` 숨겨진 subcommand를 추가하여 notice만 stdout으로 출력한다

## Requirements

### Functional Requirements
1. `reap --show-notice <version> <lang>` 실행 시 해당 버전의 release notice를 stdout으로 출력
2. `reap update` 에서 selfUpgrade 성공 시 `execSync('reap --show-notice <version> <lang>')` 로 새 바이너리에서 notice 가져오기
3. selfUpgrade 미발생 시 현재 프로세스에서 `fetchReleaseNotice()` 직접 호출 (기존 동작)

### Non-Functional Requirements
1. `--show-notice`는 `--help`에 노출되지 않는 숨겨진 옵션
2. notice 가져오기 실패 시 에러 없이 조용히 넘어감

## Design

### Approaches Considered

| Aspect | A: CLI hidden command | B: 별도 internal 스크립트 |
|--------|----------------------|------------------------|
| Summary | `reap --show-notice` 숨겨진 옵션 추가 | 별도 node 스크립트 실행 |
| Pros | 기존 CLI 구조 활용, 단순 | 분리 가능 |
| Cons | commander 옵션 추가 필요 | 별도 파일 관리, 경로 문제 |
| Recommendation | **선택** | - |

### Selected Design
Approach A: `src/cli/index.ts`에 숨겨진 `--show-notice` 옵션을 추가.
- `program.option('--show-notice <version>', ...)` 으로 숨겨진 옵션 등록
- 파싱 후 `--show-notice`가 있으면 notice를 출력하고 즉시 exit
- `reap update` action에서 selfUpgrade 성공 시 `execSync('reap --show-notice <version> <lang>')` 실행

### Design Approval History
- 2026-03-24: 초기 설계 확정

## Scope
- **Related Genome Areas**: CLI 구조 (ADR-002)
- **Expected Change Scope**: `src/cli/index.ts` (update action 수정 + --show-notice 옵션 추가)
- **Exclusions**: notice.ts 자체 로직 변경 없음

## Genome Reference
- ADR-002: Commander.js CLI
- conventions.md: 에러는 호출자에게 throw, CLI 최상위에서 catch

## Backlog (Genome Modifications Discovered)
None

## Background
selfUpgrade 후 이전 버전 코드의 `fetchReleaseNotice`가 새 버전의 RELEASE_NOTICE.md 경로를 찾지 못하거나 형식이 달라져서 notice를 표시하지 못하는 문제.
