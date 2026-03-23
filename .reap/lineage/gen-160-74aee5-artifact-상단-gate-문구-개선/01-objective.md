# Objective

## Goal
Artifact 및 current.yml 상단의 gate 문구를 개선하여 AI 에이전트가 구체적 CLI 명령어를 즉시 파악할 수 있도록 한다.

## Completion Criteria
1. 모든 artifact 템플릿(11개)의 gate 문구가 새 형식으로 변경됨
2. `CURRENT_YML_HEADER` 상수가 새 형식으로 변경됨
3. header 검증/strip 로직이 기존대로 정상 작동함
4. 기존 테스트가 모두 통과함

## Requirements

### Functional Requirements
1. artifact 템플릿 gate 문구를 `# REAP MANAGED — Do not modify directly. Use 'reap run <stage> --phase <phase>' to update.`로 변경
2. current.yml header를 `# REAP MANAGED — Do not modify directly. Use 'reap run <stage> --phase <phase>' to update.`로 변경
3. integrity.ts의 header 검증 로직은 `startsWith("# REAP MANAGED")`이므로 수정 불필요

### Non-Functional Requirements
1. 기존 동작과의 호환성 유지 (strip 정규식 `^# REAP MANAGED[^\n]*\n` 패턴 호환)

## Design

### Approaches Considered

| Aspect | Approach A: 템플릿+상수만 변경 | Approach B: 검증 로직도 변경 |
|--------|------|------|
| Summary | 템플릿 파일과 CURRENT_YML_HEADER만 수정 | 검증/strip 로직까지 모두 수정 |
| Pros | 최소 변경, 기존 정규식 호환 | 완전한 일관성 |
| Cons | 없음 | 불필요한 변경, 리스크 증가 |
| Recommendation | 채택 | |

### Selected Design
Approach A — 템플릿 파일(11개)과 `CURRENT_YML_HEADER` 상수만 변경. 검증/strip 로직은 `startsWith("# REAP MANAGED")` 및 `^# REAP MANAGED[^\n]*\n` 정규식을 사용하므로 문구 뒷부분 변경에 영향 없음.

### Design Approval History
- 2026-03-23: 초안 작성

## Scope
- **Related Genome Areas**: conventions.md (커밋 형식)
- **Expected Change Scope**: `src/templates/artifacts/` (11파일), `src/core/generation.ts` (1상수)
- **Exclusions**: integrity.ts 검증 로직, generation.ts/merge-generation.ts strip 로직

## Genome Reference
없음

## Backlog (Genome Modifications Discovered)
None

## Background
현재 gate 문구 `Use reap run commands.`가 추상적이라 AI가 구체적 action으로 매핑하기 어려움. 따옴표 안의 명시적 command 형식이 AI 패턴 매칭에 유리.
