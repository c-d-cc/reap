# Objective

## Goal
completion phase `"genome"` → `"feedKnowledge"`로 리네이밍하고, feedKnowledge phase에서 genome/environment 영향을 자동 감지하는 로직 추가.

## Completion Criteria
1. `completion.ts`의 phase 이름이 `"genome"` → `"feedKnowledge"`로 변경됨
2. `--phase genome` 대신 `--phase feedKnowledge`가 nextCommand에 사용됨
3. phase 참조하는 모든 곳(evolve.ts, reap-guide.md, 테스트 등)이 동기화됨
4. feedKnowledge phase에서 변경 파일 목록을 git diff로 스캔하여 genome 불일치 감지
5. 감지 결과가 prompt에 포함되어 AI가 검토할 수 있음
6. 기존 테스트가 새 phase 이름으로 업데이트되어 통과

## Requirements

### Functional Requirements
1. FR-01: `completion.ts`에서 `phase === "genome"` → `phase === "feedKnowledge"` 변경
2. FR-02: retrospective phase의 nextCommand를 `--phase feedKnowledge`로 변경
3. FR-03: `evolve.ts`의 genome phase 참조를 feedKnowledge로 변경
4. FR-04: `reap-guide.md`의 genome phase 참조를 feedKnowledge로 변경
5. FR-05: feedKnowledge phase에서 `git diff --name-only`로 변경 파일 목록 수집
6. FR-06: 변경 파일과 genome 파일(constraints.md, principles.md, source-map.md) 대조
7. FR-07: 불일치 감지 결과를 prompt에 포함하여 genome-change/environment-change backlog 작성 검토 지시

### Non-Functional Requirements
1. NFR-01: 기존 2-phase 구조(retrospective → feedKnowledge) 유지
2. NFR-02: git diff 실패 시 graceful fallback (빈 목록 반환)

## Design

### Selected Design
단일 접근: phase 이름 리네이밍 + git diff 기반 감지 로직을 feedKnowledge phase 내부에 추가.

- `completion.ts`의 `phase === "genome"` 조건을 `phase === "feedKnowledge"`로 변경
- retrospective phase의 nextCommand/prompt에서 `--phase genome` → `--phase feedKnowledge`
- feedKnowledge phase 진입 시 `execSync("git diff --name-only HEAD~1")` 실행
- 변경 파일 목록에서 패턴 매칭으로 genome 불일치 감지:
  - 새 커맨드 파일(`src/cli/commands/`) → constraints.md Slash Commands 체크
  - 새 의존성(`package.json`) → constraints.md Tech Stack 체크
  - 아키텍처 변경(`src/core/`) → principles.md/source-map.md 체크
- 감지 결과를 prompt 문자열에 추가

## Scope
- **Related Genome Areas**: constraints.md (Slash Commands, Tech Stack), source-map.md
- **Expected Change Scope**: completion.ts, evolve.ts, reap-guide.md, completion.test.ts, run-lifecycle.test.ts
- **Exclusions**: docs/ 번역 파일은 이번 generation에서 제외 (별도 처리)

## Genome Reference
- backlog: `completion-feed-knowledge.md`

## Backlog (Genome Modifications Discovered)
None

## Background
completion의 phase 이름 `"genome"`이 실제 수행하는 역할(knowledge feeding)을 정확히 반영하지 못함. 또한 completion 시 genome/environment 영향을 수동으로만 확인해야 하는 비효율이 있어 자동 감지 필요.

