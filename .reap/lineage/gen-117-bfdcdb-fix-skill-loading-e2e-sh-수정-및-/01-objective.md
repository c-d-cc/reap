# Objective

## Goal
skill-loading-e2e.sh를 검토하고 필요시 수정한 뒤, OpenShell sandbox에서 실제 E2E 테스트를 실행하여 통과를 확인한다.

## Completion Criteria
1. skill-loading-e2e.sh가 session-start.cjs 및 opencode-session-start.js의 실제 동작과 일치
2. OpenShell sandbox에서 E2E 테스트가 통과 (exit 0)
3. 3개 테스트 시나리오 모두 pass: Claude Code skills, OpenCode plugin, Non-REAP isolation

## Requirements

### Functional Requirements
1. FR-1: Test 1은 `reap init` → session-start.cjs 실행 → `.claude/skills/{name}/SKILL.md` 생성을 검증
2. FR-2: Test 2는 `reap init` → OpenCode plugin (`~/.config/opencode/plugins/reap-session-start.js`) 설치를 검증
3. FR-3: Test 3은 비 REAP 프로젝트에서 hook/plugin이 스킵되는지 검증
4. FR-4: 테스트 스크립트가 OpenShell sandbox 환경에서 정상 실행

### Non-Functional Requirements
1. NFR-1: 테스트는 idempotent (반복 실행 시 동일 결과)

## Design

### Selected Design
현재 e2e 스크립트를 검토하여 소스 코드와 불일치하는 부분이 있으면 수정. 수정 후 `openshell run`으로 실행.

## Scope
- **Related Genome Areas**: constraints.md (E2E 테스트 환경)
- **Expected Change Scope**: `tests/e2e/skill-loading-e2e.sh` (수정이 필요한 경우만)
- **Exclusions**: 소스 코드 변경 없음, 테스트 스크립트만 대상

## Genome Reference
- constraints.md: E2E는 OpenShell CLI로 sandbox에서 실행

## Backlog (Genome Modifications Discovered)
None

## Background
gen-116에서 skill-loading-e2e.sh를 재작성했으나 OpenShell에서 실제 실행 검증이 되지 않았을 수 있음.

## Regression
이번 generation은 re-entry. gen-116에서 작성된 E2E 테스트가 실제 sandbox에서 동작하는지 확인하는 것이 핵심.

