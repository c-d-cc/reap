# Objective

## Goal

Hook conditions를 user-definable 스크립트 기반으로 전환 (.reap/hooks/conditions/)

## Completion Criteria

- CC-1: `.reap/hooks/conditions/`에 기본 condition 스크립트 3개 존재 (always.sh, has-code-changes.sh, version-bumped.sh)
- CC-2: `src/templates/conditions/`에 기본 스크립트 템플릿 존재, `reap init`에서 설치
- CC-3: slash command 템플릿에서 condition 평가 시 `.reap/hooks/conditions/{name}.sh` 실행으로 변경
- CC-4: hook frontmatter의 condition 값이 conditions/ 폴더의 스크립트 이름과 매핑
- CC-5: reap-guide.md에 condition 커스터마이징 문서화
- CC-6: 기존 테스트 통과 + tsc + 빌드

## Requirements

### Functional Requirements

- FR-001: `.reap/hooks/conditions/` 디렉토리에 기본 condition 스크립트 생성
  - `always.sh` — `exit 0`
  - `has-code-changes.sh` — git diff로 src/ 변경 확인 (exit 0/1)
  - `version-bumped.sh` — package.json vs `git describe --tags` 비교 (exit 0/1)
- FR-002: `src/templates/conditions/` 에 템플릿 저장, init.ts에서 `.reap/hooks/conditions/`로 복사
- FR-003: slash command 템플릿 (reap.next, reap.start, reap.back) — condition 평가를 스크립트 실행으로 변경
- FR-004: reap-guide.md — conditions 커스터마이징 가이드 추가
- FR-005: genome (domain/hook-system.md, constraints.md) — backlog로 기록

### Non-Functional Requirements

- condition 스크립트는 빠르게 실행되어야 함 (1초 이내 권장)
- 유저가 커스텀 condition 추가 시 별도 등록 없이 파일만 추가하면 동작

## Scope
- **Expected Change Scope**: src/templates/conditions/, init.ts, slash commands, reap-guide.md, .reap/hooks/conditions/
- **Exclusions**: session-start.sh의 staleness/drift 체크는 변경 없음 (hook condition과 별개)
