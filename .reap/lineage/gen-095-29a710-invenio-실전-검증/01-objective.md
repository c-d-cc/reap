# Objective

## Goal
examples/invenio 프로젝트에서 REAP Script Orchestrator 아키텍처를 실전으로 검증한다.
기존 .reap 삭제 → 새로 init → 3회 generation 수행 → worktree merge 테스트

## Completion Criteria
- invenio에서 `reap init` 성공
- 3개 generation (기능 개선) 완료 + lineage 생성 확인
- worktree 기반 merge generation 테스트 완료
- 모든 slash command → reap run 위임이 실제로 동작 확인
- 발견된 문제는 backlog로 기록

## Requirements

### Functional Requirements
- FR1: invenio/.reap 삭제 후 `reap init` — 설정, genome, hooks 정상 설치 확인
- FR2: Generation 1 — trivial 기능 추가 (예: README 개선), full lifecycle (start → objective → planning → implementation → validation → completion → next)
- FR3: Generation 2 — 코드 수정 포함 기능 (예: 새 endpoint, 설정 변경), back regression 테스트 포함
- FR4: Generation 3 — backlog에서 goal 선택, abort 테스트 후 재시작
- FR5: Worktree merge — branch 분기 → worktree에서 generation 수행 → merge generation으로 합치기

### Non-Functional Requirements
- subagent가 examples/invenio/ 안에서 독립 실행
- 메인 REAP 프로젝트에 영향 없음
- 문제 발견 시 즉시 기록

## Scope
- **Expected Change Scope**: examples/invenio/ 내부만 변경
- **Exclusions**: REAP 소스 코드 변경 없음 (버그 발견 시 backlog)
